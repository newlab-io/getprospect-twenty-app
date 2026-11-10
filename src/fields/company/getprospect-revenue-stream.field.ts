import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ENRICH_FIELD_UNIVERSAL_IDENTIFIERS.company.getprospectRevenueStream,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.TEXT,
  name: 'getprospectRevenueStream',
  label: 'Revenue stream',
  description: 'Revenue model, e.g. Subscriptions / Recurring.',
  icon: 'IconCoins',
  isNullable: true,
});
