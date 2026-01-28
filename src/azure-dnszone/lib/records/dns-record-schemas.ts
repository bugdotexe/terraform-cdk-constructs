/**
 * API schemas for Azure Public DNS Zone Records across all supported versions
 *
 * This file defines the complete API schemas for all Public DNS Zone record types
 * across all supported API versions. The schemas are used by the AzapiResource
 * framework for validation, transformation, and version management.
 *
 * Supported Record Types:
 * - A (IPv4 addresses)
 * - AAAA (IPv6 addresses)
 * - CAA (Certificate Authority Authorization) - PUBLIC DNS ONLY
 * - CNAME (canonical names)
 * - MX (mail exchange)
 * - NS (name server) - PUBLIC DNS ONLY
 * - PTR (pointer records)
 * - SOA (start of authority)
 * - SRV (service records)
 * - TXT (text records)
 *
 * API Version: 2018-05-01
 *
 * Key differences from Private DNS:
 * - Property casing: Public DNS uses PascalCase (ARecords vs aRecords)
 * - CAA records: Only available in public DNS
 * - NS records: Only available in public DNS
 * - targetResource: Public DNS A, AAAA, and CNAME records support alias records
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

export const DNS_A_RECORD_TYPE = "Microsoft.Network/dnsZones/A";
export const DNS_AAAA_RECORD_TYPE = "Microsoft.Network/dnsZones/AAAA";
export const DNS_CAA_RECORD_TYPE = "Microsoft.Network/dnsZones/CAA";
export const DNS_CNAME_RECORD_TYPE = "Microsoft.Network/dnsZones/CNAME";
export const DNS_MX_RECORD_TYPE = "Microsoft.Network/dnsZones/MX";
export const DNS_NS_RECORD_TYPE = "Microsoft.Network/dnsZones/NS";
export const DNS_PTR_RECORD_TYPE = "Microsoft.Network/dnsZones/PTR";
export const DNS_SOA_RECORD_TYPE = "Microsoft.Network/dnsZones/SOA";
export const DNS_SRV_RECORD_TYPE = "Microsoft.Network/dnsZones/SRV";
export const DNS_TXT_RECORD_TYPE = "Microsoft.Network/dnsZones/TXT";

// =============================================================================
// COMMON PROPERTY DEFINITIONS
// =============================================================================

/**
 * Common property definitions shared across all Public DNS record types
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
  dnsZoneId: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Resource ID of the parent DNS Zone",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "DNS Zone ID is required",
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
    required: false,
    description: "Array of A records with IPv4 addresses",
  },
  targetResourceId: {
    dataType: PropertyType.STRING,
    required: false,
    description:
      "Reference to an Azure resource from where the IP content is taken (alias record)",
  },
};

export const DNS_A_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_A_RECORD_TYPE,
  version: "2018-05-01",
  properties: A_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId"],
  optional: ["records", "ttl", "metadata", "targetResourceId"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
        },
      ],
    },
  ],
};

export const DNS_A_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_A_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial A record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_A_RECORD_VERSIONS: VersionConfig[] = [
  DNS_A_RECORD_VERSION_2018_05_01,
];

// =============================================================================
// AAAA RECORD SCHEMA
// =============================================================================

const AAAA_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: false,
    description: "Array of AAAA records with IPv6 addresses",
  },
  targetResourceId: {
    dataType: PropertyType.STRING,
    required: false,
    description:
      "Reference to an Azure resource from where the IP content is taken (alias record)",
  },
};

export const DNS_AAAA_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_AAAA_RECORD_TYPE,
  version: "2018-05-01",
  properties: AAAA_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId"],
  optional: ["records", "ttl", "metadata", "targetResourceId"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
        },
      ],
    },
  ],
};

export const DNS_AAAA_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_AAAA_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial AAAA record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_AAAA_RECORD_VERSIONS: VersionConfig[] = [
  DNS_AAAA_RECORD_VERSION_2018_05_01,
];

// =============================================================================
// CAA RECORD SCHEMA (PUBLIC DNS ONLY)
// =============================================================================

const CAA_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description:
      "Array of CAA records with flags, tag, and value for Certificate Authority Authorization",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one CAA record entry is required",
      },
    ],
  },
};

export const DNS_CAA_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_CAA_RECORD_TYPE,
  version: "2018-05-01",
  properties: CAA_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one CAA record entry is required",
        },
      ],
    },
  ],
};

export const DNS_CAA_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_CAA_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description:
        "Initial CAA record support for Public DNS Zones (Certificate Authority Authorization)",
      breaking: false,
    },
  ],
};

export const ALL_DNS_CAA_RECORD_VERSIONS: VersionConfig[] = [
  DNS_CAA_RECORD_VERSION_2018_05_01,
];

// =============================================================================
// CNAME RECORD SCHEMA
// =============================================================================

const CNAME_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  cname: {
    dataType: PropertyType.STRING,
    required: false,
    description: "The canonical name for this CNAME record",
  },
  targetResourceId: {
    dataType: PropertyType.STRING,
    required: false,
    description:
      "Reference to an Azure resource from where the DNS content is taken (alias record)",
  },
};

export const DNS_CNAME_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_CNAME_RECORD_TYPE,
  version: "2018-05-01",
  properties: CNAME_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId"],
  optional: ["cname", "ttl", "metadata", "targetResourceId"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
        },
      ],
    },
  ],
};

export const DNS_CNAME_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_CNAME_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial CNAME record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_CNAME_RECORD_VERSIONS: VersionConfig[] = [
  DNS_CNAME_RECORD_VERSION_2018_05_01,
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

export const DNS_MX_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_MX_RECORD_TYPE,
  version: "2018-05-01",
  properties: MX_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
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

export const DNS_MX_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_MX_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial MX record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_MX_RECORD_VERSIONS: VersionConfig[] = [
  DNS_MX_RECORD_VERSION_2018_05_01,
];

// =============================================================================
// NS RECORD SCHEMA (PUBLIC DNS ONLY)
// =============================================================================

const NS_RECORD_PROPERTIES: { [key: string]: PropertyDefinition } = {
  ...COMMON_RECORD_PROPERTIES,
  records: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "Array of NS records with nsdname values",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one NS record entry is required",
      },
    ],
  },
};

export const DNS_NS_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_NS_RECORD_TYPE,
  version: "2018-05-01",
  properties: NS_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
        },
      ],
    },
    {
      property: "records",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "At least one NS record entry is required",
        },
      ],
    },
  ],
};

export const DNS_NS_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_NS_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial NS record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_NS_RECORD_VERSIONS: VersionConfig[] = [
  DNS_NS_RECORD_VERSION_2018_05_01,
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

export const DNS_PTR_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_PTR_RECORD_TYPE,
  version: "2018-05-01",
  properties: PTR_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
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

export const DNS_PTR_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_PTR_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial PTR record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_PTR_RECORD_VERSIONS: VersionConfig[] = [
  DNS_PTR_RECORD_VERSION_2018_05_01,
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

export const DNS_SOA_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_SOA_RECORD_TYPE,
  version: "2018-05-01",
  properties: SOA_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "soaRecord"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
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

export const DNS_SOA_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_SOA_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial SOA record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_SOA_RECORD_VERSIONS: VersionConfig[] = [
  DNS_SOA_RECORD_VERSION_2018_05_01,
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

export const DNS_SRV_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_SRV_RECORD_TYPE,
  version: "2018-05-01",
  properties: SRV_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
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

export const DNS_SRV_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_SRV_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial SRV record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_SRV_RECORD_VERSIONS: VersionConfig[] = [
  DNS_SRV_RECORD_VERSION_2018_05_01,
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

export const DNS_TXT_RECORD_SCHEMA_2018_05_01: ApiSchema = {
  resourceType: DNS_TXT_RECORD_TYPE,
  version: "2018-05-01",
  properties: TXT_RECORD_PROPERTIES,
  required: ["name", "dnsZoneId", "records"],
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
      property: "dnsZoneId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "DNS Zone ID is required",
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

export const DNS_TXT_RECORD_VERSION_2018_05_01: VersionConfig = {
  version: "2018-05-01",
  schema: DNS_TXT_RECORD_SCHEMA_2018_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2018-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: undefined,
  changeLog: [
    {
      changeType: "added",
      description: "Initial TXT record support for Public DNS Zones",
      breaking: false,
    },
  ],
};

export const ALL_DNS_TXT_RECORD_VERSIONS: VersionConfig[] = [
  DNS_TXT_RECORD_VERSION_2018_05_01,
];
