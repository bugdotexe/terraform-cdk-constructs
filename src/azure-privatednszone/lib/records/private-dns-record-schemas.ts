/**
 * API schemas for Azure Private DNS Zone Records across all supported versions
 *
 * This file defines the complete API schemas for all Private DNS Zone record types
 * across all supported API versions. The schemas are used by the AzapiResource
 * framework for validation, transformation, and version management.
 *
 * Supported Record Types:
 * - A (IPv4 addresses)
 * - AAAA (IPv6 addresses)
 * - CNAME (canonical names)
 * - MX (mail exchange)
 * - PTR (pointer records)
 * - SOA (start of authority)
 * - SRV (service records)
 * - TXT (text records)
 *
 * API Version: 2024-06-01
 */

import {
  ApiSchema,
  PropertyDefinition,
  PropertyType,
  ValidationRuleType,
  VersionConfig,
  VersionSupportLevel,
} from "../../../core-azure/lib/version-manager/interfaces/version-interfaces";

// =============================================================================
// RESOURCE TYPE CONSTANTS
// =============================================================================

export const PRIVATE_DNS_A_RECORD_TYPE = "Microsoft.Network/privateDnsZones/A";
export const PRIVATE_DNS_AAAA_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/AAAA";
export const PRIVATE_DNS_CNAME_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/CNAME";
export const PRIVATE_DNS_MX_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/MX";
export const PRIVATE_DNS_PTR_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/PTR";
export const PRIVATE_DNS_SOA_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/SOA";
export const PRIVATE_DNS_SRV_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/SRV";
export const PRIVATE_DNS_TXT_RECORD_TYPE =
  "Microsoft.Network/privateDnsZones/TXT";

// =============================================================================
// COMMON PROPERTY DEFINITIONS
// =============================================================================

/**
 * Common property definitions shared across all Private DNS record types
 */
const COMMON_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  name: {
    dataType: PropertyType.STRING,
    required: true,
    description:
      "The name of the record set relative to the zone. Use @ for apex records.",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Record name is required",
      },
    ],
  },
  privateDnsZoneId: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Resource ID of the parent Private DNS Zone",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Private DNS Zone ID is required",
      },
    ],
  },
  ttl: {
    dataType: PropertyType.NUMBER,
    required: false,
    defaultValue: 3600,
    description: "Time to Live in seconds",
    validation: [
      {
        ruleType: ValidationRuleType.VALUE_RANGE,
        value: { min: 1, max: 2147483647 },
        message: "TTL must be between 1 and 2147483647 seconds",
      },
    ],
  },
  metadata: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "Metadata key-value pairs for the record set",
  },
};

// =============================================================================
// A RECORD SCHEMA
// =============================================================================

const A_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of A records with IPv4 addresses",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one A record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_A_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_A_RECORD_TYPE,
  version: "2024-06-01",
  properties: A_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one A record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_A_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_A_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial A record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_A_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_A_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// AAAA RECORD SCHEMA
// =============================================================================

const AAAA_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of AAAA records with IPv6 addresses",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one AAAA record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_AAAA_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_AAAA_RECORD_TYPE,
  version: "2024-06-01",
  properties: AAAA_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one AAAA record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_AAAA_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_AAAA_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial AAAA record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_AAAA_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_AAAA_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// CNAME RECORD SCHEMA
// =============================================================================

const CNAME_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  cname: {
    dataType: PropertyType.STRING,
    required: true,
    description: "The canonical name for this CNAME record",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "CNAME value is required",
      },
    ],
  },
};

export const PRIVATE_DNS_CNAME_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_CNAME_RECORD_TYPE,
  version: "2024-06-01",
  properties: CNAME_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "cname"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "cname",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "CNAME value is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_CNAME_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_CNAME_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial CNAME record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_CNAME_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_CNAME_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// MX RECORD SCHEMA
// =============================================================================

const MX_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of MX records with exchange and preference values",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one MX record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_MX_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_MX_RECORD_TYPE,
  version: "2024-06-01",
  properties: MX_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one MX record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_MX_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_MX_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial MX record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_MX_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_MX_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// PTR RECORD SCHEMA
// =============================================================================

const PTR_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of PTR records with ptrdname values",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one PTR record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_PTR_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_PTR_RECORD_TYPE,
  version: "2024-06-01",
  properties: PTR_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one PTR record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_PTR_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_PTR_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial PTR record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_PTR_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_PTR_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// SOA RECORD SCHEMA
// =============================================================================

const SOA_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  soaRecord: {
    dataType: PropertyType.OBJECT,
    required: true,
    description: "SOA record configuration",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "SOA record configuration is required",
      },
    ],
  },
};

export const PRIVATE_DNS_SOA_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_SOA_RECORD_TYPE,
  version: "2024-06-01",
  properties: SOA_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "soaRecord"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "soaRecord",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "SOA record configuration is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_SOA_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_SOA_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial SOA record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_SOA_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_SOA_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// SRV RECORD SCHEMA
// =============================================================================

const SRV_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of SRV records with priority, weight, port, and target",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one SRV record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_SRV_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_SRV_RECORD_TYPE,
  version: "2024-06-01",
  properties: SRV_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one SRV record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_SRV_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_SRV_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial SRV record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_SRV_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_SRV_RECORD_VERSION_2024_06_01,
];

// =============================================================================
// TXT RECORD SCHEMA
// =============================================================================

const TXT_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of TXT records with string values",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one TXT record entry is required",
      },
    ],
  },
};

export const PRIVATE_DNS_TXT_RECORD_SCHEMA_2024_06_01: ApiSchema = {
  resourceType: PRIVATE_DNS_TXT_RECORD_TYPE,
  version: "2024-06-01",
  properties: TXT_RECORD_PROPERTIES,
  required: ["name", "privateDnsZoneId", "records"],
  optional: ["ttl", "metadata"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Record name is required",
        },
      ],
    },
    {
      property: "privateDnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Private DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one TXT record entry is required",
        },
      ],
    },
  ],
};

export const PRIVATE_DNS_TXT_RECORD_VERSION_2024_06_01: VersionConfig = {
  version: "2024-06-01",
  schema: PRIVATE_DNS_TXT_RECORD_SCHEMA_2024_06_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-06-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial TXT record support for Private DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_PRIVATE_DNS_TXT_RECORD_VERSIONS: VersionConfig[] = [
  PRIVATE_DNS_TXT_RECORD_VERSION_2024_06_01,
];
