/**
 * API schemas for Azure Virtual Network Gateway across all supported versions
 *
 * This file defines the complete API schemas for Microsoft.Network/virtualNetworkGateways
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
 * Common property definitions shared across all Virtual Network Gateway versions
 */
const COMMON_VNG_PROPERTIES: { [key: string]: PropertyDefinition } = {
  location: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Azure region for the virtual network gateway",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Location is required",
      },
      {
        ruleType: ValidationRuleType.PATTERN_MATCH,
        value: "^[a-z0-9]+$",
        message: "Location must contain only lowercase letters and numbers",
      },
    ],
  },
  name: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Name of the virtual network gateway",
    validation: [
      {
        ruleType: ValidationRuleType.PATTERN_MATCH,
        value: "^[a-zA-Z0-9][a-zA-Z0-9._-]{0,78}[a-zA-Z0-9_]$",
        message:
          "Gateway name must be 2-80 chars, alphanumeric, periods, underscores, hyphens",
      },
    ],
  },
  tags: {
    dataType: PropertyType.OBJECT,
    required: false,
    defaultValue: {},
    description: "Resource tags",
  },
  gatewayType: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Gateway type: Vpn or ExpressRoute",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Gateway type is required",
      },
    ],
  },
  vpnType: {
    dataType: PropertyType.STRING,
    required: false,
    defaultValue: "RouteBased",
    description: "VPN type: RouteBased or PolicyBased",
  },
  sku: {
    dataType: PropertyType.OBJECT,
    required: true,
    description: "SKU configuration for the virtual network gateway",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "SKU is required",
      },
    ],
  },
  ipConfigurations: {
    dataType: PropertyType.ARRAY,
    required: true,
    description: "IP configurations for the virtual network gateway",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "At least one IP configuration is required",
      },
    ],
  },
  enableBgp: {
    dataType: PropertyType.BOOLEAN,
    required: false,
    defaultValue: false,
    description: "Enable BGP for the virtual network gateway",
  },
  activeActive: {
    dataType: PropertyType.BOOLEAN,
    required: false,
    defaultValue: false,
    description: "Enable active-active mode for the virtual network gateway",
  },
  bgpSettings: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "BGP settings for the virtual network gateway",
  },
  vpnGatewayGeneration: {
    dataType: PropertyType.STRING,
    required: false,
    description: "VPN gateway generation",
  },
  customRoutes: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "Custom routes for the virtual network gateway",
  },
  enablePrivateIpAddress: {
    dataType: PropertyType.BOOLEAN,
    required: false,
    description: "Enable private IP address for the virtual network gateway",
  },
  gatewayDefaultSite: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "Default site for the virtual network gateway",
  },
  vpnClientConfiguration: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "VPN client configuration for point-to-site connections",
  },
  ignoreChanges: {
    dataType: PropertyType.ARRAY,
    required: false,
    description: "Array of property names to ignore during updates",
    validation: [
      {
        ruleType: ValidationRuleType.TYPE_CHECK,
        value: PropertyType.ARRAY,
        message: "IgnoreChanges must be an array of strings",
      },
    ],
  },
};

// =============================================================================
// VERSION-SPECIFIC SCHEMAS
// =============================================================================

/**
 * API Schema for Virtual Network Gateway version 2024-01-01
 */
export const VIRTUAL_NETWORK_GATEWAY_SCHEMA_2024_01_01: ApiSchema = {
  resourceType: "Microsoft.Network/virtualNetworkGateways",
  version: "2024-01-01",
  properties: {
    ...COMMON_VNG_PROPERTIES,
  },
  required: ["location", "gatewayType", "sku", "ipConfigurations"],
  optional: [
    "name",
    "tags",
    "vpnType",
    "enableBgp",
    "activeActive",
    "bgpSettings",
    "vpnGatewayGeneration",
    "customRoutes",
    "enablePrivateIpAddress",
    "gatewayDefaultSite",
    "vpnClientConfiguration",
    "ignoreChanges",
  ],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "gatewayType",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Gateway type is required for Virtual Network Gateways",
        },
      ],
    },
    {
      property: "ipConfigurations",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "At least one IP configuration is required for Virtual Network Gateways",
        },
      ],
    },
  ],
};

/**
 * API Schema for Virtual Network Gateway version 2024-05-01
 */
export const VIRTUAL_NETWORK_GATEWAY_SCHEMA_2024_05_01: ApiSchema = {
  resourceType: "Microsoft.Network/virtualNetworkGateways",
  version: "2024-05-01",
  properties: {
    ...COMMON_VNG_PROPERTIES,
  },
  required: ["location", "gatewayType", "sku", "ipConfigurations"],
  optional: [
    "name",
    "tags",
    "vpnType",
    "enableBgp",
    "activeActive",
    "bgpSettings",
    "vpnGatewayGeneration",
    "customRoutes",
    "enablePrivateIpAddress",
    "gatewayDefaultSite",
    "vpnClientConfiguration",
    "ignoreChanges",
  ],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "gatewayType",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message: "Gateway type is required for Virtual Network Gateways",
        },
      ],
    },
    {
      property: "ipConfigurations",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "At least one IP configuration is required for Virtual Network Gateways",
        },
      ],
    },
  ],
};

// =============================================================================
// VERSION CONFIGURATIONS
// =============================================================================

/**
 * Version configuration for Virtual Network Gateway 2024-01-01
 */
export const VIRTUAL_NETWORK_GATEWAY_VERSION_2024_01_01: VersionConfig = {
  version: "2024-01-01",
  schema: VIRTUAL_NETWORK_GATEWAY_SCHEMA_2024_01_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-01-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: "/docs/virtual-network-gateway/migration-2024-01-01",
  changeLog: [
    {
      changeType: "added",
      description: "Stable release with enhanced VPN gateway features",
      breaking: false,
    },
  ],
};

/**
 * Version configuration for Virtual Network Gateway 2024-05-01
 */
export const VIRTUAL_NETWORK_GATEWAY_VERSION_2024_05_01: VersionConfig = {
  version: "2024-05-01",
  schema: VIRTUAL_NETWORK_GATEWAY_SCHEMA_2024_05_01,
  supportLevel: VersionSupportLevel.ACTIVE,
  releaseDate: "2024-05-01",
  deprecationDate: undefined,
  sunsetDate: undefined,
  breakingChanges: [],
  migrationGuide: "/docs/virtual-network-gateway/migration-2024-05-01",
  changeLog: [
    {
      changeType: "updated",
      description: "Enhanced performance and reliability improvements",
      breaking: false,
    },
  ],
};

/**
 * All supported Virtual Network Gateway versions for registration
 */
export const ALL_VIRTUAL_NETWORK_GATEWAY_VERSIONS: VersionConfig[] = [
  VIRTUAL_NETWORK_GATEWAY_VERSION_2024_01_01,
  VIRTUAL_NETWORK_GATEWAY_VERSION_2024_05_01,
];

/**
 * Resource type constant
 */
export const VIRTUAL_NETWORK_GATEWAY_TYPE =
  "Microsoft.Network/virtualNetworkGateways";
