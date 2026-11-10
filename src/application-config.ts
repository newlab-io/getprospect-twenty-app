import { defineApplication } from 'twenty-sdk/define';

import { GETPROSPECT_API_KEY_ENV } from 'src/lib/getprospect-client';
import {
  API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
  APP_DESCRIPTION,
  APP_DISPLAY_NAME,
  APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: APP_DISPLAY_NAME,
  description: APP_DESCRIPTION,
  logo: 'public/logo.svg',
  galleryImages: [
    'public/gallery/1-company-enrichment.png',
    'public/gallery/2-person-enrichment.png',
    'public/gallery/3-actions.png',
  ],
  category: 'Enrichment',
  author: 'GetProspect',
  websiteUrl: 'https://getprospect.com',
  termsUrl: 'https://getprospect.com/terms',
  emailSupport: 'support@getprospect.com',
  issueReportUrl: 'https://github.com/newlab-io/getprospect-twenty-app/issues',
  billing: {
    description:
      'Free app. Enrichment spends no credits; Find Emails uses 1 email credit per new email and Verify Emails 1 verification credit per result, from your GetProspect plan.',
  },
  applicationVariables: {
    [GETPROSPECT_API_KEY_ENV]: {
      universalIdentifier: API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER,
      label: 'GetProspect API key',
      description:
        'Your GetProspect API key (GetProspect app > Settings > API). Lookups use the credits of that GetProspect workspace.',
      isSecret: true,
      isRequired: true,
    },
  },
});
