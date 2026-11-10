import { defineWorkflow, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_LOGIC_FUNCTIONS, ENRICH_WORKFLOWS } from 'src/constants/universal-identifiers';

// Runs on every new person, imports included. The lookup spends no GetProspect credits.
export default defineWorkflow({
  universalIdentifier: ENRICH_WORKFLOWS.newPeople.workflow,
  name: 'Enrich new people (GetProspect)',
  version: {
    trigger: {
      universalIdentifier: ENRICH_WORKFLOWS.newPeople.trigger,
      type: 'DATABASE_EVENT',
      settings: {
        objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
        action: 'created',
      },
      nextStepIds: [ENRICH_WORKFLOWS.newPeople.enrich],
    },
    steps: [
      {
        universalIdentifier: ENRICH_WORKFLOWS.newPeople.enrich,
        name: 'Enrich the person',
        type: 'LOGIC_FUNCTION',
        logicFunctionUniversalIdentifier: ENRICH_LOGIC_FUNCTIONS.enrichPeople.universalIdentifier,
        input: { recordId: '{{trigger.recordId}}' },
        nextStepIds: [],
      },
    ],
  },
});
