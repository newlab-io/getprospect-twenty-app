import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mutation = vi.fn();
const query = vi.fn();

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class {
    query = query;
    mutation = mutation;
  },
}));

import { runEmailBatch } from 'src/lib/run-email-batch';

const PERSON = {
  id: 'p1',
  name: { firstName: 'Jane', lastName: 'Doe' },
  emails: { primaryEmail: '', additionalEmails: [] },
  company: { name: 'Acme', domainName: { primaryLinkUrl: 'acme.io' } },
};

describe('runEmailBatch find', () => {
  beforeEach(() => {
    process.env.GETPROSPECT_API_KEY = 'test-key';
    query.mockResolvedValue({ people: { edges: [{ node: PERSON }] } });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ success: true, data: { email: 'jane@acme.io', status: 'valid' } }), {
          status: 200,
        }),
      ),
    );
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    mutation.mockReset();
  });

  it('keeps the status when the found email already belongs to another person', async () => {
    // Twenty enforces a unique primary email across People.
    mutation
      .mockRejectedValueOnce(new Error('A duplicate entry was detected: unique constraint person.IDX_UNIQUE_x was violated'))
      .mockResolvedValueOnce({ updatePerson: { id: 'p1' } });

    const result = await runEmailBatch('find', ['p1']);

    expect(result.results[0]).toMatchObject({ recordId: 'p1', outcome: 'duplicate', status: 'VALID' });
    expect(result.errored).toBe(0);
    const retry = mutation.mock.calls[1][0].updatePerson.__args.data;
    expect(retry.emails).toBeUndefined();
    expect(retry.getprospectEmailStatus).toBe('VALID');
  });
});
