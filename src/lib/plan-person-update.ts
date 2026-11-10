import { type EmailFindResult, type EmailVerifyResult } from 'src/lib/getprospect-client';

export type EmailStatusValue = 'VALID' | 'ACCEPT_ALL' | 'INVALID' | 'UNKNOWN' | 'NOT_FOUND';

export type PersonEmails = {
  primaryEmail?: string | null;
  additionalEmails?: string[] | null;
};

export type PersonUpdate = {
  emails?: { primaryEmail: string; additionalEmails: string[] | null };
  getprospectEmailStatus: EmailStatusValue;
  getprospectEmailCheckedAt: string;
};

const VERIFY_STATUS: Record<EmailVerifyResult['status'], EmailStatusValue> = {
  valid: 'VALID',
  accept_all: 'ACCEPT_ALL',
  invalid: 'INVALID',
  unknown: 'UNKNOWN',
};

const same = (a?: string | null, b?: string | null) =>
  (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();

/**
 * What a find result writes to the person. A found email becomes the primary email when the
 * person has none; an existing primary email is never overwritten, the found one is kept as an
 * additional email instead.
 */
export const planFindUpdate = (
  current: PersonEmails,
  result: EmailFindResult,
  now: string,
): PersonUpdate => {
  if (result.status !== 'valid' || !result.email) {
    return { getprospectEmailStatus: 'NOT_FOUND', getprospectEmailCheckedAt: now };
  }
  const found = result.email.trim().toLowerCase();
  const additional = current.additionalEmails ?? [];
  const base = { getprospectEmailStatus: 'VALID' as const, getprospectEmailCheckedAt: now };
  if (!current.primaryEmail) {
    return { ...base, emails: { primaryEmail: found, additionalEmails: current.additionalEmails ?? null } };
  }
  if (same(current.primaryEmail, found) || additional.some((email) => same(email, found))) {
    return base;
  }
  return { ...base, emails: { primaryEmail: current.primaryEmail, additionalEmails: [...additional, found] } };
};

/** What a verify result writes: only the status of the primary email, which is left as it is. */
export const planVerifyUpdate = (result: EmailVerifyResult, now: string): PersonUpdate => ({
  getprospectEmailStatus: VERIFY_STATUS[result.status] ?? 'UNKNOWN',
  getprospectEmailCheckedAt: now,
});
