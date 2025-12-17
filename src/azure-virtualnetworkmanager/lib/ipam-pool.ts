/**
 * Azure Virtual Network Manager IPAM Pool implementation using AzapiResource framework
 *
 * This class provides a unified implementation for Azure Virtual Network Manager IPAM Pools
 * that automatically handles version management, schema validation, and property transformation
 * across all supported API versions.
 *
 * Supported API Versions:
 * - 2024-05-01 (Active, Latest)
 *
 * Features:
 * - Automatic latest version resolution when no version is specified
 * - Explicit version pinning for stability requirements
 * - Schema-driven validation and transformation
 * - CIDR validation and overlap detection
 * - Hierarchical pool support
 * - JSII compliance for multi-language support
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import { ALL_IPAM_POOL_VERSIONS, IPAM_POOL_TYPE } from "./ipam-pool-schemas";
import {
  isValidCidr,
  cidrsOverlap,
  calculateAddressCount,
} from "./utils/cidr-validator";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../core-azure/lib/version-manager/interfaces/version-interfaces";

/**
 * Properties for the Azure Virtual Network Manager IPAM Pool
 *
 * Extends AzapiResourceProps with IPAM Pool specific properties
 */
export interface IpamPoolProps extends AzapiResourceProps {
  /**
   * Resource ID of the parent Network Manager
   * @example "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg/providers/Microsoft.Network/networkManagers/vnm"
   */
  readonly networkManagerId: string;

  /**
   * IP address prefixes for the pool
   * Must be valid CIDR notation (e.g., "10.0.0.0/8")
   * Multiple prefixes must not overlap
   * @example ["10.0.0.0/8", "172.16.0.0/12"]
   */
  readonly addressPrefixes: string[];

  /**
   * Optional description of the IPAM pool
   * @example "Production IP address pool for East US region"
   */
  readonly description?: string;

  /**
   * Optional friendly display name
   * @example "East US Production Pool"
   */
  readonly displayName?: string;

  /**
   * Name of parent pool for hierarchical pools
   * Leave empty/undefined for root pools
   * @example "root-pool"
   */
  readonly parentPoolName?: string;

  /**
   * The lifecycle rules to ignore changes
   * @example ["tags"]
   */
  readonly ignoreChanges?: string[];
}

/**
 * Properties for IPAM Pool body
 */
export interface IpamPoolProperties {
  readonly addressPrefixes: string[];
  readonly description?: string;
  readonly displayName?: string;
  readonly parentPoolName?: string;
}

/**
 * The resource body interface for Azure IPAM Pool API calls
 */
export interface IpamPoolBody {
  readonly location: string;
  readonly tags?: Record<string, string>;
  readonly properties: IpamPoolProperties;
}

/**
 * Azure Virtual Network Manager IPAM Pool implementation
 *
 * IPAM Pools provide centralized IP address management for virtual networks,
 * enabling automatic CIDR allocation, overlap prevention, and hierarchical
 * address space organization. They are essential for managing IP addresses
 * at scale across multiple virtual networks and subscriptions.
 *
 * @example
 * // Basic IPAM pool for production workloads:
 * const ipamPool = new IpamPool(this, "prod-pool", {
 *   name: "production-pool",
 *   location: "eastus",
 *   networkManagerId: networkManager.id,
 *   addressPrefixes: ["10.0.0.0/8"],
 *   description: "Root IP address pool for production",
 *   displayName: "Production Pool"
 * });
 *
 * @example
 * // Hierarchical pool with parent reference:
 * const childPool = new IpamPool(this, "eastus-pool", {
 *   name: "eastus-pool",
 *   location: "eastus",
 *   networkManagerId: networkManager.id,
 *   addressPrefixes: ["10.1.0.0/16"],
 *   parentPoolName: "production-pool",
 *   description: "East US regional pool"
 * });
 *
 * @stability stable
 */
export class IpamPool extends AzapiResource {
  static {
    AzapiResource.registerSchemas(IPAM_POOL_TYPE, ALL_IPAM_POOL_VERSIONS);
  }

  /**
   * Validates address prefixes for format and overlap
   * Throws descriptive errors if validation fails
   *
   * @param prefixes - Array of CIDR blocks to validate
   * @throws Error if validation fails
   */
  private static validateAddressPrefixes(prefixes: string[]): void {
    if (!prefixes || prefixes.length === 0) {
      throw new Error("At least one address prefix is required");
    }

    // Validate each CIDR individually
    prefixes.forEach((prefix, index) => {
      if (!isValidCidr(prefix)) {
        throw new Error(
          `Invalid CIDR notation at index ${index}: ${prefix}. ` +
            `Expected format: x.x.x.x/y where y is 0-32`,
        );
      }
    });

    // Check for overlaps within the same pool
    for (let i = 0; i < prefixes.length; i++) {
      for (let j = i + 1; j < prefixes.length; j++) {
        if (cidrsOverlap(prefixes[i], prefixes[j])) {
          throw new Error(
            `Address prefixes overlap: ${prefixes[i]} and ${prefixes[j]}. ` +
              `Each CIDR block within a pool must be non-overlapping.`,
          );
        }
      }
    }
  }

  /**
   * The input properties for this IPAM Pool instance
   */
  public readonly props: IpamPoolProps;

  // Output properties for easy access and referencing
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly locationOutput: cdktf.TerraformOutput;

  // Public properties
  public readonly resourceName: string;

  /**
   * Creates a new Azure Virtual Network Manager IPAM Pool using the AzapiResource framework
   *
   * @param scope - The scope in which to define this construct
   * @param id - The unique identifier for this instance
   * @param props - Configuration properties for the IPAM Pool
   */
  constructor(scope: Construct, id: string, props: IpamPoolProps) {
    // Validate CIDR prefixes before construction
    IpamPool.validateAddressPrefixes(props.addressPrefixes);

    super(scope, id, props);

    this.props = props;

    // Extract properties from the AZAPI resource outputs using Terraform interpolation
    this.resourceName = `\${${this.terraformResource.fqn}.name}`;

    // Create Terraform outputs for easy access and referencing from other resources
    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the IPAM Pool",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: this.resourceName,
      description: "The name of the IPAM Pool",
    });

    this.locationOutput = new cdktf.TerraformOutput(this, "location", {
      value: `\${${this.terraformResource.fqn}.location}`,
      description: "The location of the IPAM Pool",
    });

    // Override logical IDs to match naming convention
    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.locationOutput.overrideLogicalId("location");

    // Apply ignore changes if specified
    this._applyIgnoreChanges();
  }

  // =============================================================================
  // REQUIRED ABSTRACT METHODS FROM AzapiResource
  // =============================================================================

  /**
   * Resolves the parent resource ID for the IPAM Pool
   * IPAM Pools are scoped to Network Managers
   */
  protected resolveParentId(props: any): string {
    const typedProps = props as IpamPoolProps;
    return typedProps.networkManagerId;
  }

  /**
   * Gets the default API version to use when no explicit version is specified
   */
  protected defaultVersion(): string {
    return "2024-05-01";
  }

  /**
   * Gets the Azure resource type for IPAM Pools
   */
  protected resourceType(): string {
    return IPAM_POOL_TYPE;
  }

  /**
   * Gets the API schema for the resolved version
   */
  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  /**
   * Creates the resource body for the Azure API call
   */
  protected createResourceBody(props: any): any {
    const typedProps = props as IpamPoolProps;
    return {
      location: typedProps.location,
      tags: this.allTags(),
      properties: {
        addressPrefixes: typedProps.addressPrefixes,
        description: typedProps.description,
        displayName: typedProps.displayName,
        parentPoolName: typedProps.parentPoolName,
      },
    };
  }

  // =============================================================================
  // PUBLIC METHODS FOR IPAM POOL OPERATIONS
  // =============================================================================

  /**
   * Calculate total number of IP addresses in this pool
   * Sums up all addresses from all CIDR blocks
   *
   * @returns Total count of IP addresses across all prefixes
   *
   * @example
   * const pool = new IpamPool(this, "pool", {
   *   addressPrefixes: ["10.0.0.0/24", "10.1.0.0/24"]
   * });
   * console.log(pool.totalAddressCount); // 512 (256 + 256)
   */
  public get totalAddressCount(): number {
    return this.props.addressPrefixes.reduce(
      (sum, cidr) => sum + calculateAddressCount(cidr),
      0,
    );
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
