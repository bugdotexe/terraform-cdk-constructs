/**
 * Azure Virtual Network Gateway Connection implementation using AzapiResource framework
 *
 * This class provides a unified implementation for Azure Virtual Network Gateway Connections that
 * automatically handles version management, schema validation, and property
 * transformation across all supported API versions.
 *
 * Supported API Versions:
 * - 2024-01-01 (Active)
 * - 2024-05-01 (Active, Latest)
 *
 * Features:
 * - Automatic latest version resolution when no version is specified
 * - Explicit version pinning for stability requirements
 * - Schema-driven validation and transformation
 * - Type-safe connection type handling using discriminated unions
 * - Full backward compatibility
 * - JSII compliance for multi-language support
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import {
  ALL_VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSIONS,
  VIRTUAL_NETWORK_GATEWAY_CONNECTION_TYPE,
} from "./virtual-network-gateway-connection-schemas";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../core-azure/lib/version-manager/interfaces/version-interfaces";

/**
 * Reference to a Virtual Network Gateway
 */
export interface GatewayReference {
  /**
   * Resource ID of the virtual network gateway
   */
  readonly id: string;
}

/**
 * Reference to an ExpressRoute circuit peer
 */
export interface PeerReference {
  /**
   * Resource ID of the ExpressRoute circuit
   */
  readonly id: string;
}

/**
 * IPsec policy configuration
 */
export interface IpsecPolicy {
  /**
   * DH Group for IKE Phase 1
   * @example "DHGroup14", "DHGroup2048", "ECP256", "ECP384"
   */
  readonly dhGroup: string;

  /**
   * IKE encryption algorithm
   * @example "AES128", "AES192", "AES256", "GCMAES128", "GCMAES256"
   */
  readonly ikeEncryption: string;

  /**
   * IKE integrity algorithm
   * @example "SHA256", "SHA384", "GCMAES128", "GCMAES256"
   */
  readonly ikeIntegrity: string;

  /**
   * IPsec encryption algorithm
   * @example "AES128", "AES192", "AES256", "GCMAES128", "GCMAES192", "GCMAES256"
   */
  readonly ipsecEncryption: string;

  /**
   * IPsec integrity algorithm
   * @example "SHA256", "GCMAES128", "GCMAES192", "GCMAES256"
   */
  readonly ipsecIntegrity: string;

  /**
   * PFS Group for IKE Phase 2
   * @example "None", "PFS1", "PFS2", "PFS2048", "ECP256", "ECP384", "PFS24", "PFS14", "PFSMM"
   */
  readonly pfsGroup: string;

  /**
   * SA lifetime in seconds
   * @example 3600
   */
  readonly saLifeTimeSeconds: number;

  /**
   * SA data size in kilobytes
   * @example 102400000
   */
  readonly saDataSizeKilobytes: number;
}

/**
 * NAT rule reference
 */
export interface NatRuleReference {
  /**
   * Resource ID of the NAT rule
   */
  readonly id: string;
}

/**
 * Properties for the Azure Virtual Network Gateway Connection
 *
 * Supports three connection types: IPsec (Site-to-Site), VNet-to-VNet, and ExpressRoute
 */
export interface VirtualNetworkGatewayConnectionProps
  extends AzapiResourceProps {
  /**
   * Connection type
   * Must be "IPsec", "Vnet2Vnet", or "ExpressRoute"
   */
  readonly connectionType: "IPsec" | "Vnet2Vnet" | "ExpressRoute";

  /**
   * Resource group ID where the connection will be created
   */
  readonly resourceGroupId: string;

  /**
   * Reference to the first virtual network gateway
   * Required for all connection types
   */
  readonly virtualNetworkGateway1: GatewayReference;

  /**
   * Reference to the local network gateway
   * Required for IPsec connections only
   */
  readonly localNetworkGateway2?: GatewayReference;

  /**
   * Reference to the second virtual network gateway
   * Required for Vnet2Vnet connections only
   */
  readonly virtualNetworkGateway2?: GatewayReference;

  /**
   * Reference to the ExpressRoute circuit
   * Required for ExpressRoute connections only
   */
  readonly peer?: PeerReference;

  /**
   * Shared key for the connection
   * Required for IPsec and Vnet2Vnet connections
   */
  readonly sharedKey?: string;

  /**
   * Authorization key for the ExpressRoute circuit
   * Optional - for cross-subscription ExpressRoute connections
   */
  readonly authorizationKey?: string;

  /**
   * Connection protocol to use
   * @defaultValue "IKEv2"
   */
  readonly connectionProtocol?: "IKEv2" | "IKEv1";

  /**
   * Enable BGP for the connection
   * @defaultValue false
   */
  readonly enableBgp?: boolean;

  /**
   * Routing weight for the connection
   */
  readonly routingWeight?: number;

  /**
   * DPD timeout in seconds
   */
  readonly dpdTimeoutSeconds?: number;

  /**
   * Custom IPsec policies
   */
  readonly ipsecPolicies?: IpsecPolicy[];

  /**
   * Enable policy-based traffic selectors
   * @defaultValue false
   */
  readonly usePolicyBasedTrafficSelectors?: boolean;

  /**
   * Connection mode
   * @defaultValue "Default"
   */
  readonly connectionMode?: "Default" | "ResponderOnly" | "InitiatorOnly";

  /**
   * Egress NAT rules
   */
  readonly egressNatRules?: NatRuleReference[];

  /**
   * Ingress NAT rules
   */
  readonly ingressNatRules?: NatRuleReference[];

  /**
   * The lifecycle rules to ignore changes
   * @example ["tags"]
   */
  readonly ignoreChanges?: string[];
}

/**
 * Azure Virtual Network Gateway Connection implementation
 *
 * This class provides a single, version-aware implementation that replaces
 * version-specific Virtual Network Gateway Connection classes. It automatically handles version
 * resolution, schema validation, and property transformation while maintaining
 * full backward compatibility.
 *
 * Virtual Network Gateway Connections establish connectivity between Virtual Network Gateways
 * and other networking endpoints:
 * - IPsec: Site-to-Site VPN connections to on-premises networks
 * - Vnet2Vnet: VNet-to-VNet connections between Azure virtual networks
 * - ExpressRoute: Private connections to Azure via ExpressRoute circuits
 *
 * @example
 * // IPsec (Site-to-Site VPN) Connection:
 * const s2sConnection = new VirtualNetworkGatewayConnection(this, "s2sConnection", {
 *   name: "my-s2s-connection",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   connectionType: "IPsec",
 *   virtualNetworkGateway1: { id: vpnGateway.id },
 *   localNetworkGateway2: { id: localGateway.id },
 *   sharedKey: "mySecureSharedKey123!"
 * });
 *
 * @example
 * // VNet-to-VNet Connection:
 * const vnetConnection = new VirtualNetworkGatewayConnection(this, "vnetConnection", {
 *   name: "my-vnet-connection",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   connectionType: "Vnet2Vnet",
 *   virtualNetworkGateway1: { id: vpnGateway1.id },
 *   virtualNetworkGateway2: { id: vpnGateway2.id },
 *   sharedKey: "mySecureSharedKey123!",
 *   enableBgp: true
 * });
 *
 * @example
 * // ExpressRoute Connection:
 * const erConnection = new VirtualNetworkGatewayConnection(this, "erConnection", {
 *   name: "my-er-connection",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   connectionType: "ExpressRoute",
 *   virtualNetworkGateway1: { id: erGateway.id },
 *   peer: { id: expressRouteCircuit.id },
 *   authorizationKey: "optional-auth-key-if-cross-subscription"
 * });
 *
 * @example
 * // IPsec Connection with Custom IPsec Policies:
 * const customConnection = new VirtualNetworkGatewayConnection(this, "customConnection", {
 *   name: "my-custom-connection",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   connectionType: "IPsec",
 *   virtualNetworkGateway1: { id: vpnGateway.id },
 *   localNetworkGateway2: { id: localGateway.id },
 *   sharedKey: "mySecureSharedKey123!",
 *   connectionProtocol: "IKEv2",
 *   ipsecPolicies: [{
 *     dhGroup: "DHGroup14",
 *     ikeEncryption: "AES256",
 *     ikeIntegrity: "SHA256",
 *     ipsecEncryption: "AES256",
 *     ipsecIntegrity: "SHA256",
 *     pfsGroup: "PFS2048",
 *     saLifeTimeSeconds: 3600,
 *     saDataSizeKilobytes: 102400000
 *   }],
 *   usePolicyBasedTrafficSelectors: true
 * });
 *
 * @stability stable
 */
export class VirtualNetworkGatewayConnection extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      VIRTUAL_NETWORK_GATEWAY_CONNECTION_TYPE,
      ALL_VIRTUAL_NETWORK_GATEWAY_CONNECTION_VERSIONS,
    );
  }

  /**
   * The input properties for this Virtual Network Gateway Connection instance
   */
  public readonly props: VirtualNetworkGatewayConnectionProps;

  // Output properties for easy access and referencing
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly locationOutput: cdktf.TerraformOutput;
  public readonly tagsOutput: cdktf.TerraformOutput;

  /**
   * Creates a new Azure Virtual Network Gateway Connection using the AzapiResource framework
   *
   * The constructor automatically handles version resolution, schema registration,
   * validation, and resource creation. It maintains full backward compatibility
   * with existing Virtual Network Gateway Connection implementations.
   *
   * @param scope - The scope in which to define this construct
   * @param id - The unique identifier for this instance
   * @param props - Configuration properties for the Virtual Network Gateway Connection
   */
  constructor(
    scope: Construct,
    id: string,
    props: VirtualNetworkGatewayConnectionProps,
  ) {
    super(scope, id, props);

    this.props = props;

    // Add timeouts for connection provisioning (typically 30 minutes)
    this.terraformResource.addOverride("timeouts", {
      create: "30m",
      update: "30m",
      delete: "30m",
    });

    // Create Terraform outputs for easy access and referencing from other resources
    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the Virtual Network Gateway Connection",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the Virtual Network Gateway Connection",
    });

    this.locationOutput = new cdktf.TerraformOutput(this, "location", {
      value: `\${${this.terraformResource.fqn}.location}`,
      description: "The location of the Virtual Network Gateway Connection",
    });

    this.tagsOutput = new cdktf.TerraformOutput(this, "tags", {
      value: `\${${this.terraformResource.fqn}.tags}`,
      description:
        "The tags assigned to the Virtual Network Gateway Connection",
    });

    // Override logical IDs to match original naming convention
    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.locationOutput.overrideLogicalId("location");
    this.tagsOutput.overrideLogicalId("tags");

    // Apply ignore changes if specified
    this._applyIgnoreChanges();
  }

  // =============================================================================
  // REQUIRED ABSTRACT METHODS FROM VersionedAzapiResource
  // =============================================================================

  /**
   * Gets the default API version to use when no explicit version is specified
   * Returns the most recent stable version as the default
   */
  protected defaultVersion(): string {
    return "2024-05-01";
  }

  /**
   * Gets the Azure resource type for Virtual Network Gateway Connections
   */
  protected resourceType(): string {
    return VIRTUAL_NETWORK_GATEWAY_CONNECTION_TYPE;
  }

  /**
   * Gets the API schema for the resolved version
   * Uses the framework's schema resolution to get the appropriate schema
   */
  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  /**
   * Indicates that location is required for Virtual Network Gateway Connections
   */
  protected requiresLocation(): boolean {
    return true;
  }

  /**
   * Creates the resource body for the Azure API call
   * Transforms the input properties into the JSON format expected by Azure REST API
   * Handles type-specific properties based on connectionType
   */
  protected createResourceBody(props: any): any {
    const typedProps = props as VirtualNetworkGatewayConnectionProps;

    // Build the properties object based on connection type
    const properties: any = {
      connectionType: typedProps.connectionType,
      virtualNetworkGateway1: {
        id: typedProps.virtualNetworkGateway1.id,
        properties: {},
      },
      connectionProtocol: typedProps.connectionProtocol || "IKEv2",
      enableBgp: typedProps.enableBgp || false,
    };

    // Add optional common properties
    if (typedProps.routingWeight !== undefined) {
      properties.routingWeight = typedProps.routingWeight;
    }
    if (typedProps.dpdTimeoutSeconds !== undefined) {
      properties.dpdTimeoutSeconds = typedProps.dpdTimeoutSeconds;
    }
    if (typedProps.ipsecPolicies !== undefined) {
      properties.ipsecPolicies = typedProps.ipsecPolicies;
    }
    if (typedProps.usePolicyBasedTrafficSelectors !== undefined) {
      properties.usePolicyBasedTrafficSelectors =
        typedProps.usePolicyBasedTrafficSelectors;
    }
    if (typedProps.connectionMode !== undefined) {
      properties.connectionMode = typedProps.connectionMode;
    }
    if (typedProps.egressNatRules !== undefined) {
      properties.egressNatRules = typedProps.egressNatRules;
    }
    if (typedProps.ingressNatRules !== undefined) {
      properties.ingressNatRules = typedProps.ingressNatRules;
    }

    // Add connection type-specific properties
    switch (typedProps.connectionType) {
      case "IPsec":
        properties.localNetworkGateway2 = {
          id: typedProps.localNetworkGateway2!.id,
          properties: {},
        };
        properties.sharedKey = typedProps.sharedKey;
        break;

      case "Vnet2Vnet":
        properties.virtualNetworkGateway2 = {
          id: typedProps.virtualNetworkGateway2!.id,
          properties: {},
        };
        properties.sharedKey = typedProps.sharedKey;
        break;

      case "ExpressRoute":
        properties.peer = typedProps.peer;
        if (typedProps.authorizationKey !== undefined) {
          properties.authorizationKey = typedProps.authorizationKey;
        }
        break;
    }

    return {
      location: this.location,
      tags: this.allTags(),
      properties: properties,
    };
  }

  // =============================================================================
  // PUBLIC METHODS FOR VIRTUAL NETWORK GATEWAY CONNECTION OPERATIONS
  // =============================================================================

  /**
   * Get the subscription ID from the Virtual Network Gateway Connection ID
   * Extracts the subscription ID from the Azure resource ID format
   */
  public get subscriptionId(): string {
    const idParts = this.id.split("/");
    const subscriptionIndex = idParts.indexOf("subscriptions");
    if (subscriptionIndex !== -1 && subscriptionIndex + 1 < idParts.length) {
      return idParts[subscriptionIndex + 1];
    }
    throw new Error(
      "Unable to extract subscription ID from Virtual Network Gateway Connection ID",
    );
  }

  /**
   * Get the full resource identifier for use in other Azure resources
   * Alias for the id property to match original interface
   */
  public get resourceId(): string {
    return this.id;
  }

  /**
   * Add a tag to the Virtual Network Gateway Connection
   * Note: This modifies the construct props but requires a new deployment to take effect
   */
  public addTag(key: string, value: string): void {
    if (!this.props.tags) {
      (this.props as any).tags = {};
    }
    this.props.tags![key] = value;
  }

  /**
   * Remove a tag from the Virtual Network Gateway Connection
   * Note: This modifies the construct props but requires a new deployment to take effect
   */
  public removeTag(key: string): void {
    if (this.props.tags && this.props.tags[key]) {
      delete this.props.tags[key];
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  /**
   * Applies ignore changes lifecycle rules if specified in props
   */
  private _applyIgnoreChanges(): void {
    if (this.props.ignoreChanges && this.props.ignoreChanges.length > 0) {
      this.terraformResource.addOverride("lifecycle", {
        ignore_changes: this.props.ignoreChanges,
      });
    }
  }
}
