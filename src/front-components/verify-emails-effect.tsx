import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, enqueueSnackbar, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS, LOGIC_FUNCTIONS } from 'src/constants/universal-identifiers';
import { type BatchResult } from 'src/lib/run-email-batch';

const execute = async (recordIds: string[]) => {
  try {
    const result = await new RestApiClient().post<BatchResult>(`/s${LOGIC_FUNCTIONS.verifyEmails.path}`, { recordIds });
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
  universalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.verifyEmails,
  name: 'verify-emails-effect',
  description: 'Verify Emails with GetProspect',
  component: Effect,
  isHeadless: true,
});
