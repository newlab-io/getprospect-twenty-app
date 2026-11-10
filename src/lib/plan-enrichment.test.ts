import { describe, expect, it } from 'vitest';

import { planCompanyEnrichment, planPersonEnrichment } from 'src/lib/plan-enrichment';
import { safeLinkedinUrl, safeWebsiteUrl } from 'src/lib/url';

const NOW = '2026-11-10T12:00:00.000Z';

const PERSON = {
  first_name: 'Jane',
  last_name: 'Doe',
  linkedin_url: 'https://www.linkedin.com/in/jane',
  location: { city: 'Kyiv', state: null, country: 'Ukraine' },
  primary_position: { job_title: 'Head of Sales', seniority: 'Head', departments: ['Sales'] },
};

describe('planPersonEnrichment', () => {
  it.each([
    {
      title: 'fills empty name, job title and LinkedIn',
      current: { name: { firstName: '', lastName: '' }, jobTitle: '', linkedinLink: { primaryLinkUrl: '' } },
      jobTitle: 'Head of Sales',
      linkedin: 'https://www.linkedin.com/in/jane',
      expectedName: { firstName: 'Jane', lastName: 'Doe' },
    },
    {
      title: 'keeps a name, job title and LinkedIn the user already has',
      current: { name: { firstName: 'Janet', lastName: '' }, jobTitle: 'CEO', linkedinLink: { primaryLinkUrl: 'https://linkedin.com/in/old' } },
      jobTitle: undefined,
      linkedin: undefined,
      expectedName: undefined,
    },
  ])('$title', ({ current, jobTitle, linkedin, expectedName }) => {
    const update = planPersonEnrichment(current, PERSON, NOW);
    expect(update.name).toEqual(expectedName);
    expect(update.jobTitle).toBe(jobTitle);
    expect((update.linkedinLink as { primaryLinkUrl?: string } | undefined)?.primaryLinkUrl).toBe(linkedin);
    expect(update).toMatchObject({
      getprospectEnrichmentStatus: 'MATCHED',
      getprospectEnrichedAt: NOW,
      getprospectSeniority: 'Head',
      getprospectDepartments: ['Sales'],
      getprospectLocation: 'Kyiv, Ukraine',
    });
  });

  it('marks not found and writes nothing else', () => {
    expect(planPersonEnrichment({ jobTitle: '' }, null, NOW)).toEqual({
      getprospectEnrichmentStatus: 'NOT_FOUND',
      getprospectEnrichedAt: NOW,
    });
  });
});

describe('planCompanyEnrichment', () => {
  const COMPANY = {
    name: 'Microsoft',
    website: 'microsoft.com',
    linkedin_url: 'https://www.linkedin.com/company/microsoft',
    industry: 'Software Development',
    ai_industries: ['Software and IT', ' '],
    type: 'Public Company',
    business_type: 'B2B',
    revenue_stream: 'Subscriptions / Recurring',
    keywords: ['Productivity'],
    employee_range: '10001+',
    location: { city: 'Redmond', state: 'Washington', country: 'United States', raw_address: 'One Microsoft Way' },
    other_locations: [{}, {}],
    technologies: [{ name: 'Azure' }],
  };

  it.each([
    {
      name: 'fills an empty address, LinkedIn and website, and a name that is just the domain',
      current: { name: 'Microsoft', address: null, linkedinLink: null, domainName: { primaryLinkUrl: '' } },
      filled: true,
    },
    {
      name: 'keeps an address, LinkedIn and website the user already has',
      current: {
        name: 'MSFT',
        address: { addressCity: 'Seattle' },
        linkedinLink: { primaryLinkUrl: 'https://linkedin.com/company/x' },
        domainName: { primaryLinkUrl: 'https://microsoft.com' },
      },
      filled: false,
    },
  ])('$name', ({ current, filled }) => {
    const update = planCompanyEnrichment(current, COMPANY, NOW);
    expect('address' in update).toBe(filled);
    expect('linkedinLink' in update).toBe(filled);
    expect('domainName' in update).toBe(filled);
    expect(update.name).toBe(filled ? 'Microsoft' : undefined);
    if (filled) expect(update.address).toMatchObject({ addressCity: 'Redmond', addressCountry: 'United States' });
    expect(update).toMatchObject({
      getprospectEnrichmentStatus: 'MATCHED',
      getprospectEnrichedAt: NOW,
      getprospectIndustry: 'Software Development',
      getprospectAiIndustries: ['Software and IT'],
      getprospectCompanyType: 'Public Company',
      getprospectEmployeeRange: '10001+',
      getprospectOffices: 2,
      getprospectTechnologies: ['Azure'],
    });
  });
});

describe('URLs from GetProspect data', () => {
  it.each([
    ['https://www.linkedin.com/in/jane', 'https://www.linkedin.com/in/jane'],
    ['linkedin.com/company/acme', 'https://linkedin.com/company/acme'],
    ['javascript:alert(1)', null],
    ['https://linkedin.com.evil.io/in/jane', null],
    ['data:text/html,x', null],
  ])('LinkedIn %s -> %s', (raw, expected) => expect(safeLinkedinUrl(raw)).toBe(expected));

  it.each([
    ['microsoft.com', 'https://microsoft.com'],
    ['http://www.Acme.io/about', 'https://www.acme.io'],
    ['javascript:alert(1)', null],
    ['not a url', null],
  ])('website %s -> %s', (raw, expected) => expect(safeWebsiteUrl(raw)).toBe(expected));
});

describe('company name from a domain', () => {
  it.each([
    ['microsoft.com', 'Microsoft Corporation'],
    ['Microsoft', 'Microsoft Corporation'],
    ['', 'Microsoft Corporation'],
    ['MSFT Inc', undefined],
  ])('%s -> %s', (name, expected) => {
    const update = planCompanyEnrichment({ name, domainName: { primaryLinkUrl: 'https://microsoft.com' } }, { name: 'Microsoft Corporation' }, '2026-11-10T12:00:00.000Z');
    expect(update.name).toBe(expected);
  });
});
