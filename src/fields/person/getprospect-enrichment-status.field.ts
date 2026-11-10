import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_FIELD_UNIVERSAL_IDENTIFIERS, ENRICHMENT_STATUS_OPTION_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ENRICH_FIELD_UNIVERSAL_IDENTIFIERS.person.getprospectEnrichmentStatus,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'getprospectEnrichmentStatus',
  label: 'Enrichment status',
  description: 'Result of the latest GetProspect enrichment.',
  icon: 'IconProgressCheck',
  isNullable: true,
  options: [
    { id: ENRICHMENT_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.person.MATCHED, value: 'MATCHED', label: 'Matched', color: 'green', position: 0 },
    { id: ENRICHMENT_STATUS_OPTION_UNIVERSAL_IDENTIFIERS.person.NOT_FOUND, value: 'NOT_FOUND', label: 'Not found', color: 'gray', position: 1 },
  ],
});
