import { describe, expect, it } from 'vitest';

import { planFindUpdate, planVerifyUpdate } from 'src/lib/plan-person-update';

const NOW = '2026-11-10T12:00:00.000Z';

describe('planFindUpdate', () => {
  it.each([
    {
      name: 'fills an empty primary email',
      current: { primaryEmail: '', additionalEmails: null },
      result: { email: 'Jane@Acme.com', status: 'valid' as const },
      emails: { primaryEmail: 'jane@acme.com', additionalEmails: null },
      status: 'VALID',
    },
    {
      name: 'keeps an existing primary email and adds the found one',
      current: { primaryEmail: 'old@acme.com', additionalEmails: ['x@acme.com'] },
      result: { email: 'jane@acme.com', status: 'valid' as const },
      emails: { primaryEmail: 'old@acme.com', additionalEmails: ['x@acme.com', 'jane@acme.com'] },
      status: 'VALID',
    },
    {
      name: 'writes no emails when the found one is already stored',
      current: { primaryEmail: 'JANE@acme.com', additionalEmails: [] },
      result: { email: 'jane@acme.com', status: 'valid' as const },
      emails: undefined,
      status: 'VALID',
    },
    {
      name: 'marks not found without touching emails',
      current: { primaryEmail: 'old@acme.com', additionalEmails: [] },
      result: { email: null, status: 'not_found' as const },
      emails: undefined,
      status: 'NOT_FOUND',
    },
  ])('$name', ({ current, result, emails, status }) => {
    const update = planFindUpdate(current, result, NOW);
    expect(update.emails).toEqual(emails);
    expect(update.getprospectEmailStatus).toBe(status);
    expect(update.getprospectEmailCheckedAt).toBe(NOW);
  });
});

describe('planVerifyUpdate', () => {
  it.each([
    ['valid', 'VALID'],
    ['accept_all', 'ACCEPT_ALL'],
    ['invalid', 'INVALID'],
    ['unknown', 'UNKNOWN'],
  ] as const)('maps %s to %s and never writes emails', (apiStatus, status) => {
    const update = planVerifyUpdate({ email: 'jane@acme.com', status: apiStatus }, NOW);
    expect(update).toEqual({ getprospectEmailStatus: status, getprospectEmailCheckedAt: NOW });
  });
});
