import { defineCommandMenuItem, isSelectAll, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  ENRICH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  ENRICH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: ENRICH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.enrichPeople,
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier: ENRICH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.enrichPeople,
  label: 'Enrich (GetProspect)',
  availabilityType: 'RECORD_SELECTION',
  conditionalAvailabilityExpression: !isSelectAll,
});
