export const APP_DISPLAY_NAME = 'GetProspect';
export const APP_DESCRIPTION =
  'Find and verify business emails, and enrich People and Companies with GetProspect.';

export const APPLICATION_UNIVERSAL_IDENTIFIER = '7dc4d6f9-20e8-4873-8a58-e95e2f9bba50';
export const DEFAULT_ROLE_UNIVERSAL_IDENTIFIER = '58cd48a6-0b4c-4c6e-9e01-48107cf224cf';
export const HEALTH_CHECK_UNIVERSAL_IDENTIFIER = 'd9376120-989e-4fcb-8e1a-4ecb8d678a4f';

export const API_KEY_VARIABLE_UNIVERSAL_IDENTIFIER = '90e85965-06b0-434e-9f65-8a76d8b0957c';

export const FIELD_UNIVERSAL_IDENTIFIERS = {
  emailStatus: '0d05fb18-7a75-46bb-a986-63fa3f8f44ab',
  emailCheckedAt: 'ac2bd2bb-bfe2-4d80-9a0e-3279b5b5a616',
} as const;

export const EMAIL_STATUS_OPTION_UNIVERSAL_IDENTIFIERS = {
  VALID: '1dc4cb89-0fd6-4f66-a1b7-767246b8dc88',
  ACCEPT_ALL: '2d8e15bf-7fd4-4eda-9145-702dc0f00d92',
  INVALID: '47c3c730-6ea5-4ec5-988b-9cdcf080de6c',
  UNKNOWN: '2b102cce-74d7-4b9c-bc0f-4b7ac75eff77',
  NOT_FOUND: 'caa3dd4f-2437-43b2-8907-a67b8b828dc0',
} as const;

export const LOGIC_FUNCTIONS = {
  findEmails: { universalIdentifier: 'b203b730-a7ac-4718-96ee-4aa2511e98fb', path: '/getprospect/find-emails' },
  verifyEmails: { universalIdentifier: 'e7873ef8-06d7-4f33-b0d0-4c671f6a7c5a', path: '/getprospect/verify-emails' },
} as const;

export const FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS = {
  findEmails: 'e99bb3b4-df36-4643-bf8e-e49dd721d218',
  verifyEmails: 'be624012-9a11-42c8-8fab-a3a33bba8668',
} as const;

export const COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = {
  findEmails: 'b2139bfc-ed40-432f-943f-fdca1e906906',
  verifyEmails: '235c7715-05ac-4229-b02b-cb832c419ec8',
} as const;

export const ENRICH_FIELD_UNIVERSAL_IDENTIFIERS = {
  person: {
    getprospectSeniority: 'ea2ee6e7-6b90-4285-8669-7935cda6ecf4',
    getprospectDepartments: '4cb186da-84ca-4184-bcb8-a8eb11dc5044',
    getprospectLocation: '6289c99c-f549-49f4-8986-a74f5eee98a9',
    getprospectEnrichedAt: 'ed4ae5e1-d2b1-4732-886a-a05643d5367a',
    getprospectEnrichmentStatus: 'e9283dcc-a5c7-42af-a7dd-0ace0330aac5',
  },
  company: {
    getprospectDescription: '1c151fee-87c4-4198-85a5-58bdf0d45674',
    getprospectEmployeeRange: 'd2ca5213-d11a-4123-ac75-c59f00bfc733',
    getprospectEmployeeCount: '27be238d-f7c5-4e1a-bd00-f8d9aab09181',
    getprospectIndustry: '7fef7687-d904-4145-aeca-6907f529ef2b',
    getprospectAiIndustries: '1f978f26-8d96-4f36-890d-11f698028c03',
    getprospectCompanyType: '7bb9e1f3-45b3-46b2-81f1-9c8362a743a3',
    getprospectBusinessModel: 'ae6c2238-36ef-4261-9d74-6bc45a78a8c1',
    getprospectRevenueStream: '73979a68-14f4-4faf-ae21-cff879019dcf',
    getprospectKeywords: '59af3b93-1062-46f8-b5ce-6dbae0241436',
    getprospectFounded: '62767b0b-0240-4034-9e7f-08f64e1e2df7',
    getprospectOffices: 'c4f12074-4799-42fc-8ac8-81b63173a2d8',
    getprospectTechnologies: '7f0f9da5-35e6-4f55-b7e5-2f862e7dc926',
    getprospectEnrichedAt: '9773e122-65ff-4fd9-a9a3-c515ee0299ca',
    getprospectEnrichmentStatus: '2e981295-e963-42c0-aa88-f13153837bd1',
  },
} as const;

export const ENRICHMENT_STATUS_OPTION_UNIVERSAL_IDENTIFIERS = {
  person: { MATCHED: 'a637d6aa-d771-4880-8d2b-edcb27937897', NOT_FOUND: '65af62ea-3816-4cd5-8f1a-2fc7250a02a1' },
  company: { MATCHED: 'bd1048eb-935f-4aa8-803f-6d52a52ebc14', NOT_FOUND: '10d1750a-dec1-4cfc-9413-6bf60a8ab739' },
} as const;

export const ENRICH_LOGIC_FUNCTIONS = {
  enrichPeople: { universalIdentifier: '68f05e12-8c6a-483c-9fbf-d66df490ebdc', path: '/getprospect/enrich-people' },
  enrichCompanies: { universalIdentifier: '494946e5-316b-4ad0-a4ac-a212e3ea0dc2', path: '/getprospect/enrich-companies' },
} as const;

export const ENRICH_FRONT_COMPONENT_UNIVERSAL_IDENTIFIERS = {
  enrichPeople: '0b360bb7-c48e-4b41-97a5-bb815d7032aa',
  enrichCompanies: 'f85abf70-513f-4328-b4cb-a28c976d5ba8',
} as const;

export const ENRICH_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = {
  enrichPeople: '89aea67d-7c7b-4567-8ac2-8a2c6c8edff8',
  enrichCompanies: 'e675c1d0-38e4-4e34-a640-46b9098b26d5',
} as const;

export const ENRICH_WORKFLOWS = {
  newPeople: { workflow: '3cfde10a-7070-4ebd-9a64-4204b0ae13cf', trigger: '3f81a029-24c8-4235-897b-8e28c43379a0', enrich: '9a30941f-480c-48cf-a1a3-9972670dc5a0' },
  newCompanies: { workflow: '4ca1c68d-2c81-41ac-a29a-6ce5c275e86d', trigger: 'edf5b1c6-3e08-4d65-8d60-b74e3240fa54', enrich: '1c547d81-e263-4525-bcb8-6cd567fd4caa' },
} as const;
