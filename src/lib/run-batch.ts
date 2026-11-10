import { GetProspectAccountError } from 'src/lib/getprospect-client';

// One run stays inside the 900 s function limit: at most 25 records, 5 in flight, <= ~100 s per lookup.
export const MAX_RECORDS_PER_RUN = 25;
const CONCURRENCY = 5;

export type RecordOutcome<O extends string> = { recordId: string; outcome: O | 'skipped' | 'error'; message?: string };

/**
 * Runs `processOne` over the records with a pool of workers: each takes the next record when it is
 * free, so one slow lookup does not hold up the others. An account-level error (bad key, no credits,
 * long rate limit) stops the remaining records, since they would fail the same way.
 */
export const runBatch = async <R extends { id: string }, O extends string, T extends RecordOutcome<O>>(
  records: R[],
  processOne: (record: R) => Promise<T>,
): Promise<{ results: (T | RecordOutcome<O>)[]; fatal?: string }> => {
  const results: (T | RecordOutcome<O>)[] = [];
  let next = 0;
  let fatal: string | undefined;
  const worker = async () => {
    while (!fatal && next < records.length) {
      const record = records[next++];
      try {
        results.push(await processOne(record));
      } catch (error) {
        if (error instanceof GetProspectAccountError) fatal = error.message;
        results.push({ recordId: record.id, outcome: 'error', message: (error as Error)?.message ?? String(error) });
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, records.length) }, worker));
  return { results, fatal };
};

/** Distinct ids, or a reason the run cannot start. */
export const checkIds = (recordIds: string[]): { ids: string[]; problem?: string } => {
  const ids = [...new Set(recordIds.filter(Boolean))];
  if (ids.length === 0) return { ids, problem: 'No records selected' };
  if (ids.length > MAX_RECORDS_PER_RUN) {
    return { ids, problem: `Select up to ${MAX_RECORDS_PER_RUN} records at a time (got ${ids.length})` };
  }
  return { ids };
};

export const countOutcomes = <O extends string>(results: { outcome: string }[], outcome: O | 'skipped' | 'error') =>
  results.filter((result) => result.outcome === outcome).length;

type RecordInput = string | { id?: string | null };
export type BatchFunctionInput = {
  recordId?: string;
  recordIds?: string[];
  records?: RecordInput | RecordInput[];
  body?: { recordIds?: string[] } | null;
};

/** Record ids from any caller: command menu (HTTP body), workflow step (`recordId` or `records`), AI tool (`recordIds`). */
export const recordIdsFromInput = (input: BatchFunctionInput): string[] => {
  if (input.body?.recordIds) return input.body.recordIds;
  if (input.recordIds) return input.recordIds;
  if (input.recordId) return [input.recordId];
  const records = Array.isArray(input.records) ? input.records : input.records ? [input.records] : [];
  return records
    .map((record) => (typeof record === 'string' ? record : record?.id))
    .filter((id): id is string => Boolean(id));
};
