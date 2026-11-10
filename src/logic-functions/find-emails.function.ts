import { defineLogicFunction, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { LOGIC_FUNCTIONS } from 'src/constants/universal-identifiers';
import { type BatchFunctionInput, MAX_RECORDS_PER_RUN, recordIdsFromInput } from 'src/lib/run-batch';
import { runEmailBatch } from 'src/lib/run-email-batch';


// Called from the command menu (HTTP route, `body.recordIds`), workflows (`records`) and AI chat (`recordIds`).
const handler = (input: BatchFunctionInput) => runEmailBatch('find', recordIdsFromInput(input));

export default defineLogicFunction({
  universalIdentifier: LOGIC_FUNCTIONS.findEmails.universalIdentifier,
  name: 'find-emails',
  description: 'Find verified business emails for People (name + company domain) with GetProspect. Never overwrites an existing primary email.',
  timeoutSeconds: 900,
  handler,
  httpRouteTriggerSettings: {
    path: LOGIC_FUNCTIONS.findEmails.path,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  workflowActionTriggerSettings: {
    label: 'Find Emails with GetProspect',
    icon: 'IconMailSearch',
    inputSchema: [
      {
        type: 'object',
        properties: {
          records: {
            type: 'records',
            objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
            label: 'People',
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
          updated: { type: 'number', label: 'Updated' },
          duplicate: { type: 'number', label: 'Already on another person' },
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
          description: `Ids of the Person records (at most ${MAX_RECORDS_PER_RUN}).`,
        },
      },
      required: ['recordIds'],
    },
  },
});
