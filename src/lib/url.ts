export const isBlank = (value?: string | null): boolean => !value || !value.trim();

export const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com',
  'aol.com', 'proton.me', 'protonmail.com', 'yandex.ru', 'mail.ru', 'gmx.com', 'gmx.de', 'zoho.com',
]);

/** A URL that may come without a scheme (`acme.io`); only http(s) is accepted. */
export const parseUrl = (raw?: string | null): URL | null => {
  if (isBlank(raw)) return null;
  const value = (raw as string).trim();
  try {
    const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

/** `https://www.Acme.io/about` -> `acme.io`. */
export const domainOf = (raw?: string | null): string | undefined => {
  const host = parseUrl(raw)?.hostname.toLowerCase().replace(/^www\./, '');
  return host && host.includes('.') ? host : undefined;
};

export const linkValue = (url: string) => ({ primaryLinkUrl: url, primaryLinkLabel: '', secondaryLinks: [] });

// URLs from third-party data: LinkedIn links only on linkedin.com, websites as https://host.
export const safeLinkedinUrl = (raw?: string | null): string | null => {
  const url = parseUrl(raw);
  const host = url?.hostname.toLowerCase() ?? '';
  return url && (host === 'linkedin.com' || host.endsWith('.linkedin.com')) ? `https://${host}${url.pathname}` : null;
};

export const safeWebsiteUrl = (raw?: string | null): string | null => {
  const url = parseUrl(raw);
  return url && url.hostname.includes('.') ? `https://${url.hostname.toLowerCase()}` : null;
};
