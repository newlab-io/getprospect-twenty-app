import { defineCommandMenuItem, isSelectAll, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

import {
  COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS,
  FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS,
} from 'src/constants/universal-identifiers';

export default defineCommandMenuItem({
  universalIdentifier: COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.findEmails,
  availabilityObjectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  frontComponentUniversalIdentifier: FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS.findEmails,
  label: 'Find Emails (GetProspect)',
  availabilityType: 'RECORD_SELECTION',
  conditionalAvailabilityExpression: !isSelectAll,
});
