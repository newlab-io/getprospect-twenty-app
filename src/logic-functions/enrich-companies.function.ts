import { defineLogicFunction, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_LOGIC_FUNCTIONS } from 'src/constants/universal-identifiers';
import { type BatchFunctionInput, MAX_RECORDS_PER_RUN, recordIdsFromInput } from 'src/lib/run-batch';
import { runEnrichBatch } from 'src/lib/run-enrich-batch';


// Command menu (HTTP route, `body.recordIds`), workflow steps (`recordId` / `records`) and AI chat (`recordIds`).
const handler = (input: BatchFunctionInput) => runEnrichBatch('company', recordIdsFromInput(input));

export default defineLogicFunction({
  universalIdentifier: ENRICH_LOGIC_FUNCTIONS.enrichCompanies.universalIdentifier,
  name: 'enrich-companies',
  description: 'Enrich Companies with GetProspect (by domain, LinkedIn or name): address, LinkedIn, website, employees, industry, AI industries, status, business model, revenue stream, keywords. Never overwrites standard fields the user set.',
  timeoutSeconds: 900,
  handler,
  httpRouteTriggerSettings: {
    path: ENRICH_LOGIC_FUNCTIONS.enrichCompanies.path,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  workflowActionTriggerSettings: {
    label: 'Enrich Companies with GetProspect',
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          records: {
            type: 'records',
            objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
            label: 'Records',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean', label: 'Success' },
          total: { type: 'number', label: 'Total' },
          matched: { type: 'number', label: 'Enriched' },
          notFound: { type: 'number', label: 'Not found' },
          skipped: { type: 'number', label: 'Skipped' },
          errored: { type: 'number', label: 'Errored' },
          message: { type: 'string', label: 'Message' },
        },
      },
    ],
  },
  toolTriggerSettings: {
    inputSchema: {
      type: 'object',
      properties: {
        recordIds: {
          type: 'array',
          items: { type: 'string' },
          description: `Ids of the records to enrich (at most ${MAX_RECORDS_PER_RUN}).`,
        },
      },
      required: ['recordIds'],
    },
  },
});
