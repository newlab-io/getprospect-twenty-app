import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  EMAIL_STATUS_OPTION_UNIVERSAL_IDENTIFIERS as OPTION_IDS,
  FIELD_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIERS.emailStatus,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'getprospectEmailStatus',
  label: 'Email status',
  description: 'Result of the latest GetProspect email find or verification.',
  icon: 'IconMailCheck',
  isNullable: true,
  options: [
    { id: OPTION_IDS.VALID, value: 'VALID', label: 'Valid', color: 'green', position: 0 },
    { id: OPTION_IDS.ACCEPT_ALL, value: 'ACCEPT_ALL', label: 'Accept-all', color: 'orange', position: 1 },
    { id: OPTION_IDS.INVALID, value: 'INVALID', label: 'Invalid', color: 'red', position: 2 },
    { id: OPTION_IDS.UNKNOWN, value: 'UNKNOWN', label: 'Unknown', color: 'gray', position: 3 },
    { id: OPTION_IDS.NOT_FOUND, value: 'NOT_FOUND', label: 'Not found', color: 'gray', position: 4 },
  ],
});
