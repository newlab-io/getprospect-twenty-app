import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import { ENRICH_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: ENRICH_FIELD_UNIVERSAL_IDENTIFIERS.person.getprospectDepartments,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.ARRAY,
  name: 'getprospectDepartments',
  label: 'Departments',
  description: 'Departments from GetProspect.',
  icon: 'IconBuildingCommunity',
  isNullable: true,
});
