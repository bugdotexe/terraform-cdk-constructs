/**
 * API schemas for Azure Virtual Network Manager IPAM Pools across all supported versions
 *
 * This file defines the complete API schemas for Microsoft.Network/networkManagers/ipamPools
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
 * Common property definitions shared across all IPAM Pool versions
 */
const COMMON_PROPERTIES: { [key: string]: PropertyDefinition } = {
  name: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Name of the IPAM pool",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "IPAM pool name is required",
      },
      {
        ruleType: ValidationRuleType.PATTERN_MATCH,
        value: "^[0-9a-zA-Z]([0-9a-zA-Z_.-]{0,62}[0-9a-zA-Z_])?$",
        message:
          "Pool name must be 2-64 chars, alphanumeric, periods, underscores, hyphens",
      },
    ],
  },
  location: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Azure region for the IPAM pool",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Location is required",
      },
    ],
  },
  networkManagerId: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Resource ID of the parent Network Manager",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Network Manager ID is required",
      },
    ],
  },
  addressPrefixes: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "IP address prefixes for the pool (e.g., ['10.0.0.0/8'])",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one address prefix is required",
      },
    ],
  },
  description: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Description of the IPAM pool",
  },
  displayName: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Friendly display name for the pool",
  },
  parentPoolName: {
    dataType: PropertyType.STRING,
    required: false,
    description:
      "Name of parent pool for hierarchical pools (empty for root pool)",
  },
  tags: {
    dataType: PropertyType.OBJECT,
    required: false,
    defaultValue: {},
    description: "Resource tags",
  },
};

// =============================================================================
// VERSION-SPECIFIC SCHEMAS
// =============================================================================

/**
 * API Schema for IPAM Pool version 2024-05-01
 */
export const IPAM_POOL_SCHEMA_2024_05_01: ApiSchema = {
  resourceType: "Microsoft.Network/networkManagers/ipamPools",
  version: "2024-05-01",
  properties: {
    ...COMMON_PROPERTIES,
  },
  required: ["name", "location", "networkManagerId", "addressPrefixes"],
  optional: ["description", "displayName", "parentPoolName", "tags"],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "name",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "IPAM pool name is required",
        },
      ],
    },
    {
      property: "networkManagerId",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Network Manager ID is required",
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
 * Version configuration for IPAM Pool 2024-05-01
 */
export const IPAM_POOL_VERSION_2024_05_01: VersionConfig = {
  version: "2024-05-01",
  schema: IPAM_POOL_SCHEMA_2024_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: "/docs/ipam/migration-2024-05-01",
  changeLog: [
    {
      changeType: "added",
      description: "Latest stable release with full IPAM support",
      breaking: false,
    },
  ],
};

/**
 * All supported IPAM Pool versions for registration
 */
export const ALL_IPAM_POOL_VERSIONS: VersionConfig[] = [
  IPAM_POOL_VERSION_2024_05_01,
];

/**
 * Resource type constant
 */
export const IPAM_POOL_TYPE = "Microsoft.Network/networkManagers/ipamPools";
