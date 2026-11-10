import { defineWorkflow, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_LOGIC_FUNCTIONS, ENRICH_WORKFLOWS } from 'src/constants/universal-identifiers';

// Runs on every new company, imports included. The lookup spends no GetProspect credits.
export default defineWorkflow({
  universalIdentifier: ENRICH_WORKFLOWS.newCompanies.workflow,
  name: 'Enrich new companies (GetProspect)',
  version: {
    trigger: {
      universalIdentifier: ENRICH_WORKFLOWS.newCompanies.trigger,
      type: 'DATABASE_EVENT',
      settings: {
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
        action: 'created',
      },
      nextStepIds: [ENRICH_WORKFLOWS.newCompanies.enrich],
    },
    steps: [
      {
        universalIdentifier: ENRICH_WORKFLOWS.newCompanies.enrich,
        name: 'Enrich the company',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier: ENRICH_LOGIC_FUNCTIONS.enrichCompanies.universalIdentifier,
        input: { recordId: '{{trigger.recordId}}' },
        nextStepIds: [],
      },
    ],
  },
});
