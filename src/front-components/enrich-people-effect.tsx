import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { ENRICH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS, ENRICH_LOGIC_FUNCTIONS } from 'src/constants/universal-identifiers';
import { type EnrichBatchResult } from 'src/lib/run-enrich-batch';

const execute = async (recordIds: string[]) => {
  try {
    const result = await new RestApiClient().post<EnrichBatchResult>(`/s${ENRICH_LOGIC_FUNCTIONS.enrichPeople.path}`, { recordIds });
    await enqueueSnackbar({ message: `GetProspect: ${result.message}`, variant: result.success ? 'success' : 'error' });
  } catch {
    await enqueueSnackbar({ message: 'GetProspect: the request failed', variant: 'error' });
  }
};

const Effect = () => {
  const recordIds = useSelectedRecordIds();
  return <Command execute={() => execute(recordIds)} />;
};

export default defineFrontComponent({
  universalIdentifier: ENRICH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.enrichPeople,
  name: 'enrich-people-effect',
  description: 'Enrich People with GetProspect',
  component: Effect,
  isHeadless: true,
});
