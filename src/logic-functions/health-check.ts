import { defineHealthCheck } from 'twenty-sdk/define';

import { HEALTH_CHECK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { checkApiKey } from 'src/lib/getprospect-client';

export default defineHealthCheck({
  universalIdentifier: HEALTH_CHECK_UNIVERSAL_IDENTIFIER,
  name: 'health-check',
  handler: async () => {
    try {
      await checkApiKey();
      return { status: 'OK' as const };
    } catch (error) {
      return {
        status: 'ERROR' as const,
        title: 'GetProspect is not connected',
        description: (error as Error).message,
      };
    }
  },
});
