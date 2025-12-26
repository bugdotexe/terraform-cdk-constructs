/**
 * Azure Virtual Network Gateway implementation using AzapiResource framework
 *
 * This class provides a unified implementation for Azure Virtual Network Gateways that
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
 * - Full backward compatibility
 * - JSII compliance for multi-language support
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import {
  ALL_VIRTUAL_NETWORK_GATEWAY_VERSIONS,
  VIRTUAL_NETWORK_GATEWAY_TYPE,
} from "./virtual-network-gateway-schemas";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../core-azure/lib/version-manager/interfaces/version-interfaces";

/**
 * SKU configuration for Virtual Network Gateway
 */
export interface VirtualNetworkGatewaySku {
  /**
   * Name of the SKU
   * @example "Basic", "VpnGw1", "VpnGw2", "VpnGw3", "VpnGw4", "VpnGw5", "ErGw1AZ", "ErGw2AZ", "ErGw3AZ"
   */
  readonly name: string;

  /**
   * Tier of the SKU
   * @example "Basic", "VpnGw1", "VpnGw2", "VpnGw3", "VpnGw4", "VpnGw5", "ErGw1AZ", "ErGw2AZ", "ErGw3AZ"
   */
  readonly tier: string;
}

/**
 * IP configuration for Virtual Network Gateway
 */
export interface VirtualNetworkGatewayIpConfiguration {
  /**
   * Name of the IP configuration
   */
  readonly name: string;

  /**
   * Private IP allocation method
   * @defaultValue "Dynamic"
   */
  readonly privateIPAllocationMethod?: string;

  /**
   * ID of the subnet to use (must be GatewaySubnet)
   */
  readonly subnetId: string;

  /**
   * ID of the public IP address to use
   */
  readonly publicIPAddressId: string;
}

/**
 * BGP settings for Virtual Network Gateway
 */
export interface VirtualNetworkGatewayBgpSettings {
  /**
   * BGP ASN (Autonomous System Number)
   * @example 65515
   */
  readonly asn?: number;

  /**
   * BGP peering address
   */
  readonly bgpPeeringAddress?: string;

  /**
   * Weight added to routes learned from this BGP speaker
   */
  readonly peerWeight?: number;

  /**
   * BGP peering addresses for active-active configuration
   */
  readonly bgpPeeringAddresses?: any[];
}

/**
 * VPN client address pool configuration
 */
export interface VirtualNetworkGatewayVpnClientAddressPool {
  /**
   * List of address prefixes for VPN client connections
   */
  readonly addressPrefixes: string[];
}

/**
 * VPN client configuration for point-to-site connections
 */
export interface VirtualNetworkGatewayVpnClientConfiguration {
  /**
   * VPN client address pool
   */
  readonly vpnClientAddressPool?: VirtualNetworkGatewayVpnClientAddressPool;

  /**
   * VPN client protocols
   * @example ["IkeV2", "SSTP", "OpenVPN"]
   */
  readonly vpnClientProtocols?: string[];

  /**
   * VPN client root certificates
   */
  readonly vpnClientRootCertificates?: any[];

  /**
   * VPN client revoked certificates
   */
  readonly vpnClientRevokedCertificates?: any[];

  /**
   * Radius server address
   */
  readonly radiusServerAddress?: string;

  /**
   * Radius server secret
   */
  readonly radiusServerSecret?: string;
}

/**
 * Custom routes configuration
 */
export interface VirtualNetworkGatewayCustomRoutes {
  /**
   * List of address prefixes
   */
  readonly addressPrefixes?: string[];
}

/**
 * Gateway default site reference
 */
export interface VirtualNetworkGatewayDefaultSite {
  /**
   * Resource ID of the local network gateway to use as default site
   */
  readonly id: string;
}

/**
 * Properties for the Azure Virtual Network Gateway
 *
 * Extends AzapiResourceProps with Virtual Network Gateway specific properties
 */
export interface VirtualNetworkGatewayProps extends AzapiResourceProps {
  /**
   * Gateway type
   * Must be either "Vpn" or "ExpressRoute"
   */
  readonly gatewayType: "Vpn" | "ExpressRoute";

  /**
   * VPN type for VPN gateways
   * @defaultValue "RouteBased"
   */
  readonly vpnType?: "RouteBased" | "PolicyBased";

  /**
   * SKU configuration for the gateway
   */
  readonly sku: VirtualNetworkGatewaySku;

  /**
   * IP configurations for the gateway
   * At least one IP configuration is required
   * Two IP configurations are required for active-active mode
   */
  readonly ipConfigurations: VirtualNetworkGatewayIpConfiguration[];

  /**
   * Enable BGP for the gateway
   * @defaultValue false
   */
  readonly enableBgp?: boolean;

  /**
   * Enable active-active mode for the gateway
   * Requires two IP configurations
   * @defaultValue false
   */
  readonly activeActive?: boolean;

  /**
   * BGP settings for the gateway
   * Required if enableBgp is true
   */
  readonly bgpSettings?: VirtualNetworkGatewayBgpSettings;

  /**
   * VPN gateway generation
   * @example "Generation1", "Generation2"
   */
  readonly vpnGatewayGeneration?: string;

  /**
   * Custom routes for the gateway
   */
  readonly customRoutes?: VirtualNetworkGatewayCustomRoutes;

  /**
   * Enable private IP address for the gateway
   * @defaultValue false
   */
  readonly enablePrivateIpAddress?: boolean;

  /**
   * Default site for force tunneling
   */
  readonly gatewayDefaultSite?: VirtualNetworkGatewayDefaultSite;

  /**
   * VPN client configuration for point-to-site connections
   */
  readonly vpnClientConfiguration?: VirtualNetworkGatewayVpnClientConfiguration;

  /**
   * Resource group ID where the Gateway will be created
   * Optional - will use the subscription scope if not provided
   */
  readonly resourceGroupId?: string;

  /**
   * The lifecycle rules to ignore changes
   * Useful for properties that are externally managed
   *
   * @example ["tags"]
   */
  readonly ignoreChanges?: string[];
}

/**
 * Azure Virtual Network Gateway implementation
 *
 * This class provides a single, version-aware implementation that replaces
 * version-specific Virtual Network Gateway classes. It automatically handles version
 * resolution, schema validation, and property transformation while maintaining
 * full backward compatibility.
 *
 * Virtual Network Gateways are used to send encrypted traffic between Azure virtual
 * networks and on-premises locations over the public Internet (VPN) or through
 * Azure ExpressRoute circuits (ExpressRoute).
 *
 * @example
 * // Basic VPN Gateway:
 * const vpnGateway = new VirtualNetworkGateway(this, "vpnGateway", {
 *   name: "my-vpn-gateway",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   gatewayType: "Vpn",
 *   vpnType: "RouteBased",
 *   sku: {
 *     name: "VpnGw1",
 *     tier: "VpnGw1"
 *   },
 *   ipConfigurations: [{
 *     name: "default",
 *     subnetId: gatewaySubnet.id,
 *     publicIPAddressId: publicIp.id
 *   }]
 * });
 *
 * @example
 * // VPN Gateway with BGP:
 * const vpnGateway = new VirtualNetworkGateway(this, "vpnGateway", {
 *   name: "my-vpn-gateway-bgp",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   gatewayType: "Vpn",
 *   vpnType: "RouteBased",
 *   sku: {
 *     name: "VpnGw1",
 *     tier: "VpnGw1"
 *   },
 *   enableBgp: true,
 *   bgpSettings: {
 *     asn: 65515,
 *     peerWeight: 0
 *   },
 *   ipConfigurations: [{
 *     name: "default",
 *     subnetId: gatewaySubnet.id,
 *     publicIPAddressId: publicIp.id
 *   }]
 * });
 *
 * @example
 * // Active-Active VPN Gateway:
 * const vpnGateway = new VirtualNetworkGateway(this, "vpnGateway", {
 *   name: "my-vpn-gateway-aa",
 *   location: "eastus",
 *   resourceGroupId: resourceGroup.id,
 *   gatewayType: "Vpn",
 *   vpnType: "RouteBased",
 *   sku: {
 *     name: "VpnGw1",
 *     tier: "VpnGw1"
 *   },
 *   activeActive: true,
 *   ipConfigurations: [
 *     {
 *       name: "config1",
 *       subnetId: gatewaySubnet.id,
 *       publicIPAddressId: publicIp1.id
 *     },
 *     {
 *       name: "config2",
 *       subnetId: gatewaySubnet.id,
 *       publicIPAddressId: publicIp2.id
 *     }
 *   ]
 * });
 *
 * @stability stable
 */
export class VirtualNetworkGateway extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      VIRTUAL_NETWORK_GATEWAY_TYPE,
      ALL_VIRTUAL_NETWORK_GATEWAY_VERSIONS,
    );
  }

  /**
   * The input properties for this Virtual Network Gateway instance
   */
  public readonly props: VirtualNetworkGatewayProps;

  // Output properties for easy access and referencing
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly locationOutput: cdktf.TerraformOutput;
  public readonly tagsOutput: cdktf.TerraformOutput;

  /**
   * Creates a new Azure Virtual Network Gateway using the AzapiResource framework
   *
   * The constructor automatically handles version resolution, schema registration,
   * validation, and resource creation. It maintains full backward compatibility
   * with existing Virtual Network Gateway implementations.
   *
   * @param scope - The scope in which to define this construct
   * @param id - The unique identifier for this instance
   * @param props - Configuration properties for the Virtual Network Gateway
   */
  constructor(scope: Construct, id: string, props: VirtualNetworkGatewayProps) {
    super(scope, id, props);

    this.props = props;

    // Add extended timeouts for gateway provisioning (30-45 minutes typical)
    this.terraformResource.addOverride("timeouts", {
      create: "60m",
      update: "60m",
      delete: "60m",
    });

    // Create Terraform outputs for easy access and referencing from other resources
    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the Virtual Network Gateway",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the Virtual Network Gateway",
    });

    this.locationOutput = new cdktf.TerraformOutput(this, "location", {
      value: `\${${this.terraformResource.fqn}.location}`,
      description: "The location of the Virtual Network Gateway",
    });

    this.tagsOutput = new cdktf.TerraformOutput(this, "tags", {
      value: `\${${this.terraformResource.fqn}.tags}`,
      description: "The tags assigned to the Virtual Network Gateway",
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
   * Gets the Azure resource type for Virtual Network Gateways
   */
  protected resourceType(): string {
    return VIRTUAL_NETWORK_GATEWAY_TYPE;
  }

  /**
   * Gets the API schema for the resolved version
   * Uses the framework's schema resolution to get the appropriate schema
   */
  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  /**
   * Indicates that location is required for Virtual Network Gateways
   */
  protected requiresLocation(): boolean {
    return true;
  }

  /**
   * Creates the resource body for the Azure API call
   * Transforms the input properties into the JSON format expected by Azure REST API
   */
  protected createResourceBody(props: any): any {
    const typedProps = props as VirtualNetworkGatewayProps;

    // Transform IP configurations to Azure API format
    const ipConfigurations = typedProps.ipConfigurations.map((config) => ({
      name: config.name,
      properties: {
        privateIPAllocationMethod:
          config.privateIPAllocationMethod || "Dynamic",
        subnet: {
          id: config.subnetId,
        },
        publicIPAddress: {
          id: config.publicIPAddressId,
        },
      },
    }));

    return {
      location: this.location,
      tags: this.allTags(),
      properties: {
        gatewayType: typedProps.gatewayType,
        vpnType: typedProps.vpnType || "RouteBased",
        enableBgp: typedProps.enableBgp || false,
        activeActive: typedProps.activeActive || false,
        sku: typedProps.sku,
        ipConfigurations: ipConfigurations,
        bgpSettings: typedProps.bgpSettings,
        vpnGatewayGeneration: typedProps.vpnGatewayGeneration,
        customRoutes: typedProps.customRoutes,
        enablePrivateIpAddress: typedProps.enablePrivateIpAddress,
        gatewayDefaultSite: typedProps.gatewayDefaultSite,
        vpnClientConfiguration: typedProps.vpnClientConfiguration,
      },
    };
  }

  // =============================================================================
  // PUBLIC METHODS FOR VIRTUAL NETWORK GATEWAY OPERATIONS
  // =============================================================================

  /**
   * Get the subscription ID from the Virtual Network Gateway ID
   * Extracts the subscription ID from the Azure resource ID format
   */
  public get subscriptionId(): string {
    const idParts = this.id.split("/");
    const subscriptionIndex = idParts.indexOf("subscriptions");
    if (subscriptionIndex !== -1 && subscriptionIndex + 1 < idParts.length) {
      return idParts[subscriptionIndex + 1];
    }
    throw new Error(
      "Unable to extract subscription ID from Virtual Network Gateway ID",
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
   * Add a tag to the Virtual Network Gateway
   * Note: This modifies the construct props but requires a new deployment to take effect
   */
  public addTag(key: string, value: string): void {
    if (!this.props.tags) {
      (this.props as any).tags = {};
    }
    this.props.tags![key] = value;
  }

  /**
   * Remove a tag from the Virtual Network Gateway
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
