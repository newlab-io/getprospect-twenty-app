import { type GpCompany, type GpPerson } from 'src/lib/getprospect-client';
import { domainOf, isBlank, linkValue as link, safeLinkedinUrl, safeWebsiteUrl } from 'src/lib/url';

type Links = { primaryLinkUrl?: string | null; primaryLinkLabel?: string | null; secondaryLinks?: unknown[] | null } | null;
type Address = {
  addressStreet1?: string | null;
  addressStreet2?: string | null;
  addressCity?: string | null;
  addressState?: string | null;
  addressPostcode?: string | null;
  addressCountry?: string | null;
} | null;

export type CurrentPerson = {
  name?: { firstName?: string | null; lastName?: string | null } | null;
  jobTitle?: string | null;
  linkedinLink?: Links;
};
export type CurrentCompany = { name?: string | null; domainName?: Links; linkedinLink?: Links; address?: Address };

const blankLinks = (links?: Links) => isBlank(links?.primaryLinkUrl);
const blankAddress = (address?: Address) =>
  !address ||
  [address.addressStreet1, address.addressCity, address.addressState, address.addressCountry].every(isBlank);

const list = (values?: (string | null | undefined)[] | null) =>
  (values ?? []).map((value) => value?.trim()).filter((value): value is string => Boolean(value));
const text = (value?: string | null) => (isBlank(value) ? null : (value as string).trim());

const locationText = (location: GpPerson['location']): string | null =>
  [location?.city, location?.state, location?.country].map(text).filter(Boolean).join(', ') || null;

/**
 * What a person enrichment writes. Standard fields (name, job title, LinkedIn) are only filled when
 * empty, so data the user entered is never replaced; the GetProspect fields always take the
 * latest values.
 */
export const planPersonEnrichment = (
  current: CurrentPerson,
  found: GpPerson | null,
  now: string,
): Record<string, unknown> => {
  if (!found) return { getprospectEnrichmentStatus: 'NOT_FOUND', getprospectEnrichedAt: now };
  const position = found.primary_position;
  const update: Record<string, unknown> = {
    getprospectEnrichmentStatus: 'MATCHED',
    getprospectEnrichedAt: now,
    getprospectSeniority: text(position?.seniority),
    getprospectDepartments: list(position?.departments),
    getprospectLocation: locationText(found.location),
  };
  if (isBlank(current.jobTitle) && !isBlank(position?.job_title)) update.jobTitle = text(position?.job_title);
  if (isBlank(current.name?.firstName) && isBlank(current.name?.lastName) && !isBlank(found.first_name)) {
    update.name = { firstName: text(found.first_name), lastName: text(found.last_name) ?? '' };
  }
  const linkedin = safeLinkedinUrl(found.linkedin_url);
  if (blankLinks(current.linkedinLink) && linkedin) update.linkedinLink = link(linkedin);
  return update;
};

/** What a company enrichment writes, with the same fill-only-when-empty rule for standard fields. */
export const planCompanyEnrichment = (
  current: CurrentCompany,
  found: GpCompany | null,
  now: string,
): Record<string, unknown> => {
  if (!found) return { getprospectEnrichmentStatus: 'NOT_FOUND', getprospectEnrichedAt: now };
  const update: Record<string, unknown> = {
    getprospectEnrichmentStatus: 'MATCHED',
    getprospectEnrichedAt: now,
    getprospectDescription: text(found.description),
    getprospectEmployeeRange: text(found.employee_range),
    getprospectEmployeeCount: found.employee_count ?? null,
    getprospectIndustry: text(found.industry),
    getprospectAiIndustries: list(found.ai_industries),
    getprospectCompanyType: text(found.type),
    getprospectBusinessModel: text(found.business_type),
    getprospectRevenueStream: text(found.revenue_stream),
    getprospectKeywords: list(found.keywords),
    getprospectFounded: found.founded ?? null,
    getprospectOffices: found.other_locations?.length ?? 0,
    getprospectTechnologies: list((found.technologies ?? []).map((technology) => technology?.name)),
  };
  const linkedin = safeLinkedinUrl(found.linkedin_url);
  if (blankLinks(current.linkedinLink) && linkedin) update.linkedinLink = link(linkedin);
  // A company added by its domain alone is named after the domain (`acme.io`, or just `Acme` from
  // `acme.io`): give it its real name.
  const currentName = (current.name ?? '').trim().toLowerCase();
  const nameIsDomain = [current.domainName?.primaryLinkUrl, found.website].some((url) => {
    const domain = domainOf(url);
    return Boolean(domain) && (domain === currentName || domain?.split('.')[0] === currentName);
  });
  if ((isBlank(current.name) || nameIsDomain) && !isBlank(found.name)) {
    update.name = text(found.name);
  }
  const website = safeWebsiteUrl(found.website);
  if (blankLinks(current.domainName) && website) update.domainName = link(website);
  const hq = found.location;
  if (blankAddress(current.address) && hq && (hq.city || hq.country)) {
    update.address = {
      addressStreet1: text(hq.raw_address) ?? '',
      addressStreet2: '',
      addressCity: text(hq.city) ?? '',
      addressState: text(hq.state) ?? '',
      addressPostcode: '',
      addressCountry: text(hq.country) ?? '',
    };
  }
  return update;
};
