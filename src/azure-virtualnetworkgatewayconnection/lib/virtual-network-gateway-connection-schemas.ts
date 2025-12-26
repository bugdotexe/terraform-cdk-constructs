/**
 * API schemas for Azure Virtual Network Gateway Connection across all supported versions
 *
 * This file defines the complete API schemas for Microsoft.Network/connections
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
 * Common property definitions shared across all Virtual Network Gateway Connection versions
 */
const COMMON_CONNECTION_PROPERTIES: { [key: string]: PropertyDefinition } = {
  location: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Azure region for the virtual network gateway connection",
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
    description: "Name of the virtual network gateway connection",
    validation: [
      {
        ruleType: ValidationRuleType.PATTERN_MATCH,
        value: "^[a-zA-Z0-9][a-zA-Z0-9._-]{0,78}[a-zA-Z0-9_]$",
        message:
          "Connection name must be 2-80 chars, alphanumeric, periods, underscores, hyphens",
      },
    ],
  },
  tags: {
    dataType: PropertyType.OBJECT,
    required: false,
    defaultValue: {},
    description: "Resource tags",
  },
  connectionType: {
    dataType: PropertyType.STRING,
    required: true,
    description: "Connection type: IPsec, Vnet2Vnet, or ExpressRoute",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "Connection type is required",
      },
    ],
  },
  virtualNetworkGateway1: {
    dataType: PropertyType.OBJECT,
    required: true,
    description: "Reference to the first virtual network gateway",
    validation: [
      {
        ruleType: ValidationRuleType.REQUIRED,
        message: "virtualNetworkGateway1 is required",
      },
    ],
  },
  virtualNetworkGateway2: {
    dataType: PropertyType.OBJECT,
    required: false,
    description:
      "Reference to the second virtual network gateway (for Vnet2Vnet)",
  },
  localNetworkGateway2: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "Reference to the local network gateway (for IPsec)",
  },
  peer: {
    dataType: PropertyType.OBJECT,
    required: false,
    description: "Reference to the ExpressRoute circuit (for ExpressRoute)",
  },
  sharedKey: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Shared key for IPsec/Vnet2Vnet connections",
  },
  authorizationKey: {
    dataType: PropertyType.STRING,
    required: false,
    description: "Authorization key for ExpressRoute connections",
  },
  connectionProtocol: {
    dataType: PropertyType.STRING,
    required: false,
    defaultValue: "IKEv2",
    description: "Connection protocol: IKEv2 or IKEv1",
  },
  enableBgp: {
    dataType: PropertyType.BOOLEAN,
    required: false,
    defaultValue: false,
    description: "Enable BGP for the connection",
  },
  routingWeight: {
    dataType: PropertyType.NUMBER,
    required: false,
    description: "Routing weight for the connection",
  },
  dpdTimeoutSeconds: {
    dataType: PropertyType.NUMBER,
    required: false,
    description: "DPD timeout in seconds",
  },
  ipsecPolicies: {
    dataType: PropertyType.ARRAY,
    required: false,
    description: "Custom IPsec policies for the connection",
  },
  usePolicyBasedTrafficSelectors: {
    dataType: PropertyType.BOOLEAN,
    required: false,
    description: "Enable policy-based traffic selectors",
  },
  connectionMode: {
    dataType: PropertyType.STRING,
    required: false,
    defaultValue: "Default",
    description: "Connection mode: Default, ResponderOnly, or InitiatorOnly",
  },
  egressNatRules: {
    dataType: PropertyType.ARRAY,
    required: false,
    description: "Egress NAT rules for the connection",
  },
  ingressNatRules: {
    dataType: PropertyType.ARRAY,
    required: false,
    description: "Ingress NAT rules for the connection",
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
 * API Schema for Virtual Network Gateway Connection version 2024-01-01
 */
export const VIRTUAL_NETWORK_GATEWAY_CONNECTION_SCHEMA_2024_01_01: ApiSchema = {
  resourceType: "Microsoft.Network/connections",
  version: "2024-01-01",
  properties: {
    ...COMMON_CONNECTION_PROPERTIES,
  },
  required: ["location", "connectionType", "virtualNetworkGateway1"],
  optional: [
    "name",
    "tags",
    "virtualNetworkGateway2",
    "localNetworkGateway2",
    "peer",
    "sharedKey",
    "authorizationKey",
    "connectionProtocol",
    "enableBgp",
    "routingWeight",
    "dpdTimeoutSeconds",
    "ipsecPolicies",
    "usePolicyBasedTrafficSelectors",
    "connectionMode",
    "egressNatRules",
    "ingressNatRules",
    "ignoreChanges",
  ],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "connectionType",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "Connection type is required for Virtual Network Gateway Connections",
        },
      ],
    },
    {
      property: "virtualNetworkGateway1",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "virtualNetworkGateway1 is required for all connection types",
        },
      ],
    },
  ],
};

/**
 * API Schema for Virtual Network Gateway Connection version 2024-05-01
 */
export const VIRTUAL_NETWORK_GATEWAY_CONNECTION_SCHEMA_2024_05_01: ApiSchema = {
  resourceType: "Microsoft.Network/connections",
  version: "2024-05-01",
  properties: {
    ...COMMON_CONNECTION_PROPERTIES,
  },
  required: ["location", "connectionType", "virtualNetworkGateway1"],
  optional: [
    "name",
    "tags",
    "virtualNetworkGateway2",
    "localNetworkGateway2",
    "peer",
    "sharedKey",
    "authorizationKey",
    "connectionProtocol",
    "enableBgp",
    "routingWeight",
    "dpdTimeoutSeconds",
    "ipsecPolicies",
    "usePolicyBasedTrafficSelectors",
    "connectionMode",
    "egressNatRules",
    "ingressNatRules",
    "ignoreChanges",
  ],
  deprecated: [],
  transformationRules: {},
  validationRules: [
    {
      property: "connectionType",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "Connection type is required for Virtual Network Gateway Connections",
        },
      ],
    },
    {
      property: "virtualNetworkGateway1",
      rules: [
        {
          ruleType: ValidationRuleType.REQUIRED,
          message:
            "virtualNetworkGateway1 is required for all connection types",
        },
      ],
    },
  ],
};

// =============================================================================
// VERSION CONFIGURATIONS
// =============================================================================

/**
 * Version configuration for Virtual Network Gateway Connection 2024-01-01
 */
export const VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSION_2024_01_01: VersionConfig =
  {
    version: "2024-01-01",
    schema: VIRTUAL_NETWORK_GATEWAY_CONNECTION_SCHEMA_2024_01_01,
    supportLevel: VersionSupportLevel.ACTIVE,
    releaseDate: "2024-01-01",
    deprecationDate: undefined,
    sunsetDate: undefined,
    breakingChanges: [],
    migrationGuide:
      "/docs/virtual-network-gateway-connection/migration-2024-01-01",
    changeLog: [
      {
        changeType: "added",
        description: "Stable release with enhanced connection features",
        breaking: false,
      },
    ],
  };

/**
 * Version configuration for Virtual Network Gateway Connection 2024-05-01
 */
export const VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSION_2024_05_01: VersionConfig =
  {
    version: "2024-05-01",
    schema: VIRTUAL_NETWORK_GATEWAY_CONNECTION_SCHEMA_2024_05_01,
    supportLevel: VersionSupportLevel.ACTIVE,
    releaseDate: "2024-05-01",
    deprecationDate: undefined,
    sunsetDate: undefined,
    breakingChanges: [],
    migrationGuide:
      "/docs/virtual-network-gateway-connection/migration-2024-05-01",
    changeLog: [
      {
        changeType: "updated",
        description: "Enhanced performance and reliability improvements",
        breaking: false,
      },
    ],
  };

/**
 * All supported Virtual Network Gateway Connection versions for registration
 */
export const ALL_VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSIONS: VersionConfig[] =
  [
    VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSION_2024_01_01,
    VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSION_2024_05_01,
  ];

/**
 * Resource type constant
 */
export const VIRTUAL_NETWORK_GATEWAY_CONNECTION_TYPE =
  "Microsoft.Network/connections";
