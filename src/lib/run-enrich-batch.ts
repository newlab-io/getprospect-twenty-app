import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  enrichCompany,
  enrichPerson,
  type GpCompany,
  type GpPerson,
  type PersonLookup,
} from 'src/lib/getprospect-client';
import { planCompanyEnrichment, planPersonEnrichment } from 'src/lib/plan-enrichment';
import { checkIds, countOutcomes, runBatch } from 'src/lib/run-batch';
import { domainOf, FREE_EMAIL_DOMAINS, isBlank, linkValue } from 'src/lib/url';

type EnrichTarget = 'person' | 'company';

export type EnrichOutcome = {
  recordId: string;
  outcome: 'matched' | 'not_found' | 'skipped' | 'error';
  message?: string;
};

export type EnrichBatchResult = {
  success: boolean;
  total: number;
  matched: number;
  notFound: number;
  skipped: number;
  errored: number;
  message: string;
  results: EnrichOutcome[];
};

type LinksNode = { primaryLinkUrl?: string | null } | null;
type PersonNode = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null } | null;
  jobTitle?: string | null;
  linkedinLink?: LinksNode;
  company?: { id: string; name?: string | null; domainName?: LinksNode } | null;
};
type CompanyNode = {
  id: string;
  name?: string | null;
  domainName?: LinksNode;
  linkedinLink?: LinksNode;
  address?: Record<string, string | null> | null;
};

const readPeople = async (client: CoreApiClient, ids: string[]) => {
  const result = (await client.query({
    people: {
      __args: { filter: { id: { in: ids } }, first: ids.length },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
          emails: { primaryEmail: true },
          jobTitle: true,
          linkedinLink: { primaryLinkUrl: true },
          company: { id: true, name: true, domainName: { primaryLinkUrl: true } },
        },
      },
    },
  })) as { people?: { edges?: { node: PersonNode }[] } };
  return (result.people?.edges ?? []).map((edge) => edge.node).filter((node) => node?.id);
};

const readCompanies = async (client: CoreApiClient, ids: string[]) => {
  const result = (await client.query({
    companies: {
      __args: { filter: { id: { in: ids } }, first: ids.length },
      edges: {
        node: {
          id: true,
          name: true,
          domainName: { primaryLinkUrl: true },
          linkedinLink: { primaryLinkUrl: true },
          address: { addressStreet1: true, addressCity: true, addressState: true, addressCountry: true },
        },
      },
    },
  })) as { companies?: { edges?: { node: CompanyNode }[] } };
  return (result.companies?.edges ?? []).map((edge) => edge.node).filter((node) => node?.id);
};

/** The person's employer as a Twenty company: the one with that domain, else a new one. */
type EmployerCache = Map<string, Promise<string | undefined>>;

// Colleagues in one run share an employer: look each domain up (or create it) once per run.
const findOrCreateCompany = (client: CoreApiClient, employer: GpCompany, cache: EmployerCache) => {
  const domain = domainOf(employer.website);
  if (!domain) return Promise.resolve(undefined);
  if (!cache.has(domain)) cache.set(domain, lookupOrCreate(client, employer, domain));
  return cache.get(domain) as Promise<string | undefined>;
};

const lookupOrCreate = async (client: CoreApiClient, employer: GpCompany, domain: string): Promise<string | undefined> => {
  if (isBlank(employer.name)) return undefined;
  const existing = (await client.query({
    companies: {
      __args: { filter: { domainName: { primaryLinkUrl: { ilike: `%${domain}%` } } }, first: 5 },
      edges: { node: { id: true, domainName: { primaryLinkUrl: true } } },
    },
  })) as { companies?: { edges?: { node: CompanyNode }[] } };
  const match = (existing.companies?.edges ?? []).find((edge) => domainOf(edge.node.domainName?.primaryLinkUrl) === domain);
  if (match) return match.node.id;
  const created = (await client.mutation({
    createCompany: {
      __args: { data: { name: employer.name, domainName: linkValue(`https://${domain}`) } },
      id: true,
    },
  })) as { createCompany?: { id: string } };
  return created.createCompany?.id;
};

const enrichOnePerson = async (client: CoreApiClient, person: PersonNode, employers: EmployerCache): Promise<EnrichOutcome> => {
  const email = person.emails?.primaryEmail?.trim() || undefined;
  const linkedinUrl = person.linkedinLink?.primaryLinkUrl?.trim() || undefined;
  const firstName = person.name?.firstName?.trim() || undefined;
  const lastName = person.name?.lastName?.trim() || undefined;
  const emailDomain = email?.split('@')[1]?.toLowerCase();
  const companyDomain =
    domainOf(person.company?.domainName?.primaryLinkUrl) ??
    (emailDomain && !FREE_EMAIL_DOMAINS.has(emailDomain) ? emailDomain : undefined);
  // Strongest key first; each later one runs only when the earlier finds nobody.
  const lookups: PersonLookup[] = [
    ...(email ? [{ email }] : []),
    ...(linkedinUrl ? [{ linkedinUrl }] : []),
    ...(firstName && lastName && companyDomain ? [{ firstName, lastName, companyDomain }] : []),
  ];
  if (lookups.length === 0) {
    return { recordId: person.id, outcome: 'skipped', message: 'Needs an email, a LinkedIn URL, or a name and company domain' };
  }
  let found: GpPerson | null = null;
  for (const lookup of lookups) {
    found = await enrichPerson(lookup);
    if (found) break;
  }
  const update = planPersonEnrichment(person, found, new Date().toISOString());
  const employer = found?.primary_position?.company;
  if (found && !person.company && employer) {
    const companyId = await findOrCreateCompany(client, employer, employers);
    if (companyId) update.companyId = companyId;
  }
  await client.mutation({ updatePerson: { __args: { id: person.id, data: update }, id: true } });
  return { recordId: person.id, outcome: found ? 'matched' : 'not_found' };
};

const enrichOneCompany = async (client: CoreApiClient, company: CompanyNode): Promise<EnrichOutcome> => {
  const domain = domainOf(company.domainName?.primaryLinkUrl);
  const linkedinUrl = company.linkedinLink?.primaryLinkUrl?.trim() || undefined;
  const name = company.name?.trim() || undefined;
  if (!domain && !linkedinUrl && !name) {
    return { recordId: company.id, outcome: 'skipped', message: 'Needs a domain, a LinkedIn URL or a name' };
  }
  const found = await enrichCompany({ domain, linkedinUrl, name });
  const update = planCompanyEnrichment(company, found, new Date().toISOString());
  await client.mutation({ updateCompany: { __args: { id: company.id, data: update }, id: true } });
  return { recordId: company.id, outcome: found ? 'matched' : 'not_found' };
};

export const runEnrichBatch = async (target: EnrichTarget, recordIds: string[]): Promise<EnrichBatchResult> => {
  const { ids, problem } = checkIds(recordIds);
  let results: EnrichOutcome[] = [];
  let fatal: string | undefined;
  if (!problem) {
    const client = new CoreApiClient();
    const employers: EmployerCache = new Map();
    const run =
      target === 'person'
        ? await runBatch(await readPeople(client, ids), (person) => enrichOnePerson(client, person, employers))
        : await runBatch(await readCompanies(client, ids), (company) => enrichOneCompany(client, company));
    results = run.results as EnrichOutcome[];
    fatal = run.fatal;
  }
  const [matched, notFound, skipped, errored] = (['matched', 'not_found', 'skipped', 'error'] as const).map((outcome) =>
    countOutcomes(results, outcome),
  );
  return {
    success: !problem && !fatal && errored === 0,
    total: ids.length,
    matched,
    notFound,
    skipped,
    errored,
    message: problem ?? fatal ?? `${matched} enriched, ${notFound} not found, ${skipped} skipped, ${errored} failed`,
    results,
  };
};
