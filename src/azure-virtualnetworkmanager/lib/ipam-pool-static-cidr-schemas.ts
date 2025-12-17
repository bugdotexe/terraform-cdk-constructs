/**
 * API schemas for Azure Virtual Network Manager IPAM Pool Static CIDRs across all supported versions
 *
 * This file defines the complete API schemas for Microsoft.Network/networkManagers/ipamPools/staticCidrs
 * across all supported API versions. The schemas are used by the AzapiResource
 * framework for validation, transformation, and version management.
 */

import {
  ApiSchema,
  PropertyDefinition,
  PropertyType,
  ValidationRuleType,
  VersionConfig,
  VersionSupportLevel,
} from "../../core-azure/lib/version-manager/interfaces/version-interfaces";

// =============================================================================
// COMMON PROPERTY DEFINITIONS
// =============================================================================

/**
 * Common property definitions shared across all Static CIDR versions
 */
const COMMON_PROPERTIES: { [key: string]: PropertyDefinition } = {
  name: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Name of the static CIDR",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Static CIDR name is required",
      },
      {
        ruleType: ValidationRuleType.PATTERN_MATCH,
        value: "^[a-zA-Z0-9][a-zA-Z0-9._-]{0,62}[a-zA-Z0-9_]$",
        message:
          "Static CIDR name must be 2-64 chars, alphanumeric, periods, underscores, hyphens",
      },
    ],
  },
  ipamPoolId: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Resource ID of the parent IPAM Pool",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "IPAM Pool ID is required",
      },
    ],
  },
  addressPrefixes: {
    dataType: PropertyType.ARRAY,
    required: true,
    description:
      "Array of IP address prefixes in CIDR notation (Azure API property)",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Address prefixes are required",
      },
    ],
  },
  description: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Description of the static CIDR allocation",
  },
};

// =============================================================================
// VERSION-SPECIFIC SCHEMAS
// =============================================================================

/**
 * API Schema for Static CIDR version 2024-05-01
 */
export const STATIC_CIDR_SCHEMA_2024_05_01: ApiSchema = {
  resourceType: "Microsoft.Network/networkManagers/ipamPools/staticCidrs",
  version: "2024-05-01",
  properties: {
    ...COMMON_PROPERTIES,
  },
  required: ["name", "ipamPoolId", "addressPrefixes"],
  optional: ["description"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Static CIDR name is required",
        },
      ],
    },
    {
      property: "ipamPoolId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "IPAM Pool ID is required",
        },
      ],
    },
    {
      property: "addressPrefixes",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Address prefixes are required",
        },
      ],
    },
  ],
};

/**
 * API Schema for Static CIDR version 2023-11-01
 */
export const STATIC_CIDR_SCHEMA_2023_11_01: ApiSchema = {
  resourceType: "Microsoft.Network/networkManagers/ipamPools/staticCidrs",
  version: "2023-11-01",
  properties: {
    ...COMMON_PROPERTIES,
  },
  required: ["name", "ipamPoolId", "addressPrefixes"],
  optional: ["description"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Static CIDR name is required",
        },
      ],
    },
    {
      property: "ipamPoolId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "IPAM Pool ID is required",
        },
      ],
    },
    {
      property: "addressPrefixes",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Address prefixes are required",
        },
      ],
    },
  ],
};

// =============================================================================
// VERSION CONFIGURATIONS
// =============================================================================

/**
 * Version configuration for Static CIDR 2024-05-01
 */
export const STATIC_CIDR_VERSION_2024_05_01: VersionConfig = {
  version: "2024-05-01",
  schema: STATIC_CIDR_SCHEMA_2024_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: "/docs/ipam/migration-2024-05-01",
  changeLog: [
    {
      changeType: "added",
      description: "Latest stable release with full static CIDR support",
      breaking: false,
    },
  ],
};

/**
 * Version configuration for Static CIDR 2023-11-01
 */
export const STATIC_CIDR_VERSION_2023_11_01: VersionConfig = {
  version: "2023-11-01",
  schema: STATIC_CIDR_SCHEMA_2023_11_01,
  supportLevel: VersionSupportLevel.MAINTENANCE,
  releaseDate: "2023-11-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: "/docs/ipam/migration-2023-11-01",
  changeLog: [
    {
      changeType: "added",
      description: "Stable release with core static CIDR features",
      breaking: false,
    },
  ],
};

/**
 * All supported Static CIDR versions for registration
 */
export const ALL_STATIC_CIDR_VERSIONS: VersionConfig[] = [
  STATIC_CIDR_VERSION_2024_05_01,
  STATIC_CIDR_VERSION_2023_11_01,
];

/**
 * Resource type constant
 */
export const STATIC_CIDR_TYPE =
  "Microsoft.Network/networkManagers/ipamPools/staticCidrs";
