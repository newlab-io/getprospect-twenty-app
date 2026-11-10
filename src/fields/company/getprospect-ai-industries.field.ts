import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ENRICH_FIELD_UNIVERSAL_IDENTIFIERS.company.getprospectAiIndustries,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'getprospectAiIndustries',
  label: 'AI industries',
  description: 'AI industry groups and sub-industries.',
  icon: 'IconSparkles',
  isNullable: true,
});
