import { CoreApiClient } from 'twenty-client-sdk/core';

import { findEmail, verifyEmail } from 'src/lib/getprospect-client';
import { planFindUpdate, planVerifyUpdate, type PersonUpdate } from 'src/lib/plan-person-update';
import { checkIds, countOutcomes, runBatch } from 'src/lib/run-batch';
import { domainOf } from 'src/lib/url';

type Mode = 'find' | 'verify';

type PersonNode = {
  id: string;
  name?: { firstName?: string | null; lastName?: string | null } | null;
  emails?: { primaryEmail?: string | null; additionalEmails?: string[] | null } | null;
  company?: { name?: string | null; domainName?: { primaryLinkUrl?: string | null } | null } | null;
};

export type RecordOutcome = {
  recordId: string;
  outcome: 'updated' | 'duplicate' | 'not_found' | 'skipped' | 'error';
  status?: PersonUpdate['getprospectEmailStatus'];
  message?: string;
};

export type BatchResult = {
  success: boolean;
  total: number;
  updated: number;
  duplicate: number;
  notFound: number;
  skipped: number;
  errored: number;
  message: string;
  results: RecordOutcome[];
};

const readPeople = async (client: CoreApiClient, ids: string[]): Promise<PersonNode[]> => {
  const result = (await client.query({
    people: {
      __args: { filter: { id: { in: ids } }, first: ids.length },
      edges: {
        node: {
          id: true,
          name: { firstName: true, lastName: true },
          emails: { primaryEmail: true, additionalEmails: true },
          company: { name: true, domainName: { primaryLinkUrl: true } },
        },
      },
    },
  })) as { people?: { edges?: { node: PersonNode }[] } };
  return (result.people?.edges ?? []).map((edge) => edge.node).filter((node) => node?.id);
};

const processPerson = async (client: CoreApiClient, mode: Mode, person: PersonNode): Promise<RecordOutcome> => {
  const now = new Date().toISOString();
  let update: PersonUpdate;
  if (mode === 'verify') {
    const email = person.emails?.primaryEmail?.trim();
    if (!email) return { recordId: person.id, outcome: 'skipped', message: 'No primary email to verify' };
    update = planVerifyUpdate(await verifyEmail(email), now);
  } else {
    const firstName = person.name?.firstName?.trim() || undefined;
    const lastName = person.name?.lastName?.trim() || undefined;
    const domain = domainOf(person.company?.domainName?.primaryLinkUrl);
    const company = person.company?.name?.trim() || undefined;
    if (!firstName || !lastName || (!domain && !company)) {
      return { recordId: person.id, outcome: 'skipped', message: 'Needs first name, last name and a company' };
    }
    const result = await findEmail({ firstName, lastName, domain, company });
    update = planFindUpdate(person.emails ?? {}, result, now);
  }
  const save = (data: Partial<PersonUpdate>) =>
    client.mutation({ updatePerson: { __args: { id: person.id, data }, id: true } });
  try {
    await save(update);
  } catch (error) {
    // Twenty keeps primary emails unique across People: the found address is already on another
    // person. Keep the status, leave this person's emails as they are.
    if (!update.emails || !/unique constraint|duplicate entry/i.test((error as Error)?.message ?? '')) throw error;
    const withoutEmails: Partial<PersonUpdate> = { ...update };
    delete withoutEmails.emails;
    await save(withoutEmails);
    return {
      recordId: person.id,
      outcome: 'duplicate',
      status: update.getprospectEmailStatus,
      message: 'The found email already belongs to another person in this workspace',
    };
  }
  return {
    recordId: person.id,
    outcome: update.getprospectEmailStatus === 'NOT_FOUND' ? 'not_found' : 'updated',
    status: update.getprospectEmailStatus,
  };
};

export const runEmailBatch = async (mode: Mode, recordIds: string[]): Promise<BatchResult> => {
  const { ids, problem } = checkIds(recordIds);
  const client = problem ? null : new CoreApiClient();
  const { results, fatal } = client
    ? await runBatch(await readPeople(client, ids), (person) => processPerson(client, mode, person))
    : { results: [], fatal: undefined };
  const count = (outcome: RecordOutcome['outcome']) => countOutcomes(results, outcome);
  const [updated, duplicate, notFound, skipped, errored] = (
    ['updated', 'duplicate', 'not_found', 'skipped', 'error'] as const
  ).map(count);
  const verb = mode === 'find' ? 'found' : 'verified';
  return {
    success: !problem && !fatal && errored === 0,
    total: ids.length,
    updated,
    duplicate,
    notFound,
    skipped,
    errored,
    message:
      problem ??
      fatal ??
      `${updated} ${verb}, ${duplicate ? `${duplicate} already on another person, ` : ''}${notFound} not found, ${skipped} skipped, ${errored} failed`,
    results: results as RecordOutcome[],
  };
};
