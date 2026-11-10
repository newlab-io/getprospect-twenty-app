import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mutation = vi.fn();
const query = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = query;
    mutation = mutation;
  },
}));

import { runEnrichBatch } from 'src/lib/run-enrich-batch';

const respond = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200 });

describe('runEnrichBatch person', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    process.env.GETPROSPECT_API_KEY = 'test-key';
    vi.stubGlobal('fetch', fetchMock);
    mutation.mockResolvedValue({ updatePerson: { id: 'p1' } });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    mutation.mockReset();
  });

  it('falls back to name + business email domain when the email finds nobody', async () => {
    query.mockResolvedValue({
      people: {
        edges: [
          {
            node: {
              id: 'p1',
              name: { firstName: 'Jane', lastName: 'Doe' },
              emails: { primaryEmail: 'jane.signup@acme.io' },
              jobTitle: '',
              linkedinLink: { primaryLinkUrl: '' },
              company: { id: 'c1', name: 'Acme', domainName: { primaryLinkUrl: '' } },
            },
          },
        ],
      },
    });
    fetchMock
      .mockResolvedValueOnce(respond(null))
      .mockResolvedValueOnce(respond({ primary_position: { job_title: 'CTO' } }));

    const result = await runEnrichBatch('person', ['p1']);

    expect(result.results[0].outcome).toBe('matched');
    expect(JSON.parse(fetchMock.mock.calls[1][1].body).data).toMatchObject({
      first_name: 'Jane',
      last_name: 'Doe',
      company_domain: 'acme.io',
    });
    expect(mutation.mock.calls[0][0].updatePerson.__args.data.jobTitle).toBe('CTO');
  });
});

describe('GetProspect rate limits', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    process.env.GETPROSPECT_API_KEY = 'test-key';
    vi.stubGlobal('fetch', fetchMock);
    mutation.mockResolvedValue({ updateCompany: { id: 'c1' } });
    query.mockResolvedValue({
      companies: { edges: [{ node: { id: 'c1', name: 'Acme', domainName: { primaryLinkUrl: 'acme.io' } } }] },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    mutation.mockReset();
  });

  it('waits out a short Retry-After and retries', async () => {
    vi.useFakeTimers();
    fetchMock
      .mockResolvedValueOnce(new Response('{}', { status: 429, headers: { 'retry-after': '1' } }))
      .mockResolvedValueOnce(respond({ name: 'Acme Inc' }));
    const run = runEnrichBatch('company', ['c1']);
    await vi.runAllTimersAsync();
    const result = await run;
    vi.useRealTimers();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.results[0].outcome).toBe('matched');
  });

  it('stops the run with a clear message on a long Retry-After', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 429, headers: { 'retry-after': '120' } }));
    const result = await runEnrichBatch('company', ['c1']);
    expect(result.success).toBe(false);
    expect(result.message).toMatch(/rate limit/i);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
