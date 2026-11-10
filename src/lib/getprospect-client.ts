export const GETPROSPECT_API_KEY_ENV = 'GETPROSPECT_API_KEY';
const GETPROSPECT_API_URL = 'https://api.getprospect.com';
// GetProspect documents up to ~95 s for a live email search and ~75 s for a verification.
const REQUEST_TIMEOUT_MS = 100_000;

export type EmailFindStatus = 'valid' | 'not_found';
export type EmailVerifyStatus = 'valid' | 'invalid' | 'accept_all' | 'unknown';

export type EmailFindResult = { email: string | null; status: EmailFindStatus };
export type EmailVerifyResult = { email: string; status: EmailVerifyStatus };

export type FindLookup = {
  firstName?: string;
  lastName?: string;
  domain?: string;
  company?: string;
};

/** Errors that stop a whole run: retrying the next record cannot help. */
export class GetProspectAccountError extends Error {}

export const getApiKey = (): string => {
  const key = process.env[GETPROSPECT_API_KEY_ENV]?.trim();
  if (!key) {
    throw new GetProspectAccountError(
      'The GetProspect API key is not set. Add it in Settings > Apps > GetProspect.',
    );
  }
  return key;
};

// A 429 that asks to wait this long or less is retried; a longer one stops the run.
const MAX_RETRY_AFTER_SECONDS = 20;
const MAX_RATE_LIMIT_RETRIES = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const post = async <T>(path: string, body: unknown, attempt = 0): Promise<T | null> => {
  const response = await fetch(`${GETPROSPECT_API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': getApiKey() },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after') ?? '5');
    const wait = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 5;
    if (attempt < MAX_RATE_LIMIT_RETRIES && wait <= MAX_RETRY_AFTER_SECONDS) {
      await sleep(wait * 1000);
      return post<T>(path, body, attempt + 1);
    }
    throw new GetProspectAccountError(`GetProspect rate limit reached. Try again in ${Math.ceil(wait)} s.`);
  }
  if (response.status === 401 || response.status === 403) {
    throw new GetProspectAccountError('GetProspect rejected the API key. Check it in Settings > Apps > GetProspect.');
  }
  if (response.status === 402) {
    throw new GetProspectAccountError('The GetProspect workspace is out of credits.');
  }
  const envelope = (await response.json().catch(() => null)) as {
    data?: T | null;
    errors?: { name?: string; message?: string }[];
  } | null;
  if (!response.ok) {
    const message = envelope?.errors?.[0]?.message ?? `HTTP ${response.status}`;
    throw new Error(`GetProspect ${path} failed: ${message}`);
  }
  return envelope?.data ?? null;
};

export const findEmail = async (lookup: FindLookup): Promise<EmailFindResult> => {
  const data = await post<EmailFindResult>('/v2/email/find', {
    data: {
      first_name: lookup.firstName,
      last_name: lookup.lastName,
      domain: lookup.domain,
      company: lookup.domain ? undefined : lookup.company,
    },
  });
  return data ?? { email: null, status: 'not_found' };
};

export const verifyEmail = async (email: string): Promise<EmailVerifyResult> => {
  const data = await post<EmailVerifyResult>('/v2/email/verify', { data: { email } });
  return data ?? { email, status: 'unknown' };
};

export const checkApiKey = async (): Promise<void> => {
  const response = await fetch(`${GETPROSPECT_API_URL}/v2/me`, {
    headers: { 'x-api-key': getApiKey() },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new GetProspectAccountError(`GetProspect rejected the API key (HTTP ${response.status}).`);
  }
};

type GpLocation = {
  city?: string | null;
  state?: string | null;
  country?: string | null;
  raw_address?: string | null;
} | null;

export type GpCompany = {
  id?: string | null;
  name?: string | null;
  description?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  industry?: string | null;
  keywords?: string[] | null;
  ai_industries?: string[] | null;
  type?: string | null;
  business_type?: string | null;
  revenue_stream?: string | null;
  founded?: number | null;
  employee_count?: number | null;
  employee_range?: string | null;
  location?: GpLocation;
  other_locations?: unknown[] | null;
  technologies?: { name?: string | null }[] | null;
};

export type GpPerson = {
  id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  linkedin_url?: string | null;
  location?: GpLocation;
  primary_position?: {
    job_title?: string | null;
    seniority?: string | null;
    departments?: string[] | null;
    company?: GpCompany | null;
  } | null;
};

export type PersonLookup = {
  email?: string;
  linkedinUrl?: string;
  firstName?: string;
  lastName?: string;
  companyDomain?: string;
};

export type CompanyLookup = { domain?: string; linkedinUrl?: string; name?: string };

/** Free when no new email or phone is revealed, so both reveals are switched off. */
export const enrichPerson = (lookup: PersonLookup): Promise<GpPerson | null> =>
  post<GpPerson>('/v2/people/enrich', {
    data: {
      email: lookup.email,
      linkedin_url: lookup.email ? undefined : lookup.linkedinUrl,
      first_name: lookup.email || lookup.linkedinUrl ? undefined : lookup.firstName,
      last_name: lookup.email || lookup.linkedinUrl ? undefined : lookup.lastName,
      company_domain: lookup.email || lookup.linkedinUrl ? undefined : lookup.companyDomain,
    },
    enrich_email: false,
    enrich_phone: false,
  });

/** Free: spends no credits. */
export const enrichCompany = (lookup: CompanyLookup): Promise<GpCompany | null> =>
  post<GpCompany>('/v2/companies/enrich', {
    data: {
      domain: lookup.domain,
      linkedin_url: lookup.domain ? undefined : lookup.linkedinUrl,
      name: lookup.domain || lookup.linkedinUrl ? undefined : lookup.name,
    },
  });
