import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ENRICH_FIELD_UNIVERSAL_IDENTIFIERS.person.getprospectLocation,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.TEXT,
  name: 'getprospectLocation',
  label: 'Location',
  description: 'City, state and country from GetProspect.',
  icon: 'IconMapPin',
  isNullable: true,
});
