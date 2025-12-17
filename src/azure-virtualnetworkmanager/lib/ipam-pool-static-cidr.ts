/**
 * Azure Virtual Network Manager IPAM Pool Static CIDR implementation using AzapiResource framework
 *
 * This class provides a unified implementation for explicitly allocating static CIDR blocks
 * within an IPAM pool. Static CIDRs allow precise control over IP address space allocation
 * and enable manual CIDR reservation within the pool's address space.
 *
 * Supported API Versions:
 * - 2023-11-01 (Maintenance)
 * - 2024-05-01 (Active, Latest)
 *
 * Features:
 * - Automatic latest version resolution when no version is specified
 * - Explicit version pinning for stability requirements
 * - Schema-driven validation and transformation
 * - CIDR format validation at construct creation time
 * - Automatic IP address count calculation from CIDR prefix
 * - Full backward compatibility
 * - JSII compliance for multi-language support
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import {
  ALL_STATIC_CIDR_VERSIONS,
  STATIC_CIDR_TYPE,
} from "./ipam-pool-static-cidr-schemas";
import { calculateAddressCount, validateCidr } from "./utils/cidr-validator";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../core-azure/lib/version-manager/interfaces/version-interfaces";

/**
 * Properties for the Azure Virtual Network Manager IPAM Pool Static CIDR
 *
 * Extends AzapiResourceProps with Static CIDR specific properties
 */
export interface IpamPoolStaticCidrProps extends AzapiResourceProps {
  /**
   * Resource ID of the parent IPAM Pool
   * @example "/subscriptions/00000000-0000-0000-0000-000000000000/resourceGroups/rg/providers/Microsoft.Network/networkManagers/vnm/ipamPools/prod-pool"
   */
  readonly ipamPoolId: string;

  /**
   * Array of IP address prefixes in CIDR notation
   * Must be valid CIDR format (e.g., ["10.0.0.0/24"])
   * Must be contained within the parent pool's address space
   * @example ["10.0.1.0/24"]
   */
  readonly addressPrefixes: string[];

  /**
   * Optional description of the static CIDR allocation
   * @example "Reserved for production web servers"
   */
  readonly description?: string;

  /**
   * The lifecycle rules to ignore changes
   * @example ["tags"]
   */
  readonly ignoreChanges?: string[];
}

/**
 * Properties for Static CIDR body
 */
export interface IpamPoolStaticCidrProperties {
  readonly addressPrefixes: string[];
  readonly description?: string;
}

/**
 * The resource body interface for Azure Static CIDR API calls
 */
export interface IpamPoolStaticCidrBody {
  readonly properties: IpamPoolStaticCidrProperties;
}

/**
 * Azure Virtual Network Manager IPAM Pool Static CIDR implementation
 *
 * Static CIDRs explicitly allocate IP address blocks within an IPAM pool,
 * providing precise control over address space reservations. This is useful
 * for manual IP address management or reserving specific ranges for particular
 * purposes within the larger pool.
 *
 * @example
 * // Allocate a static CIDR block in a pool:
 * const staticCidr = new IpamPoolStaticCidr(this, "web-servers", {
 *   name: "web-servers-cidr",
 *   ipamPoolId: ipamPool.id,
 *   addressPrefixes: ["10.0.1.0/24"],
 *   description: "Reserved for production web servers"
 * });
 *
 * @example
 * // Allocate with explicit IP count:
 * const staticCidr = new IpamPoolStaticCidr(this, "database-servers", {
 *   name: "db-servers-cidr",
 *   ipamPoolId: ipamPool.id,
 *   addressPrefixes: ["10.0.2.0/24"],
 *   description: "Reserved for database servers",
 *   apiVersion: "2024-05-01"
 * });
 *
 * @stability stable
 */
export class IpamPoolStaticCidr extends AzapiResource {
  static {
    AzapiResource.registerSchemas(STATIC_CIDR_TYPE, ALL_STATIC_CIDR_VERSIONS);
  }

  /**
   * Validates address prefix for correct CIDR format
   * Throws descriptive errors if validation fails
   *
   * @param addressPrefix - CIDR block to validate
   * @throws Error if validation fails
   */
  private static validateAddressPrefix(addressPrefix: string): void {
    if (!addressPrefix) {
      throw new Error("Address prefix is required");
    }

    const validation = validateCidr(addressPrefix);
    if (!validation.valid) {
      throw new Error(
        `Invalid address prefix: ${addressPrefix}. ${validation.errors.join(", ")}`,
      );
    }

    // Log warnings if any (e.g., misaligned network address)
    if (validation.warnings.length > 0) {
      console.warn(
        `Warning for address prefix ${addressPrefix}: ${validation.warnings.join(", ")}`,
      );
    }
  }

  /**
   * The input properties for this Static CIDR instance
   */
  public readonly props: IpamPoolStaticCidrProps;

  // Output properties for easy access and referencing
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly addressPrefixOutput: cdktf.TerraformOutput;

  // Public properties
  public readonly resourceName: string;

  // Store calculated address count
  private readonly _calculatedAddressCount: number;

  /**
   * Creates a new Azure Virtual Network Manager IPAM Pool Static CIDR using the AzapiResource framework
   *
   * @param scope - The scope in which to define this construct
   * @param id - The unique identifier for this instance
   * @param props - Configuration properties for the Static CIDR
   */
  constructor(scope: Construct, id: string, props: IpamPoolStaticCidrProps) {
    // Validate CIDR formats before construction
    if (!props.addressPrefixes || props.addressPrefixes.length === 0) {
      throw new Error("At least one address prefix is required");
    }
    props.addressPrefixes.forEach((prefix) => {
      IpamPoolStaticCidr.validateAddressPrefix(prefix);
    });

    super(scope, id, props);

    this.props = props;

    // Calculate address count from first CIDR prefix
    this._calculatedAddressCount = calculateAddressCount(
      props.addressPrefixes[0],
    );

    // Extract properties from the AZAPI resource outputs using Terraform interpolation
    this.resourceName = `\${${this.terraformResource.fqn}.name}`;

    // Create Terraform outputs for easy access and referencing from other resources
    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the Static CIDR",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: this.resourceName,
      description: "The name of the Static CIDR",
    });

    this.addressPrefixOutput = new cdktf.TerraformOutput(
      this,
      "addressPrefixes",
      {
        value: JSON.stringify(props.addressPrefixes),
        description: "The address prefixes of the Static CIDR",
      },
    );

    // Override logical IDs to match naming convention
    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.addressPrefixOutput.overrideLogicalId("addressPrefixes");

    // Apply ignore changes if specified
    this._applyIgnoreChanges();
  }

  // =============================================================================
  // REQUIRED ABSTRACT METHODS FROM AzapiResource
  // =============================================================================

  /**
   * Resolves the parent resource ID for the Static CIDR
   * Static CIDRs are scoped to IPAM Pools
   */
  protected resolveParentId(props: any): string {
    const typedProps = props as IpamPoolStaticCidrProps;
    return typedProps.ipamPoolId;
  }

  /**
   * Gets the default API version to use when no explicit version is specified
   */
  protected defaultVersion(): string {
    return "2024-05-01";
  }

  /**
   * Gets the Azure resource type for Static CIDRs
   */
  protected resourceType(): string {
    return STATIC_CIDR_TYPE;
  }

  /**
   * Gets the API schema for the resolved version
   */
  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  /**
   * Creates the resource body for the Azure API call
   * Note: Child resources do not include location or tags
   */
  protected createResourceBody(props: any): any {
    const typedProps = props as IpamPoolStaticCidrProps;

    return {
      properties: {
        addressPrefixes: typedProps.addressPrefixes,
        description: typedProps.description,
      },
    };
  }

  // =============================================================================
  // PUBLIC METHODS FOR STATIC CIDR OPERATIONS
  // =============================================================================

  /**
   * Get the address prefixes of this Static CIDR
   * Returns the input addressPrefixes array
   */
  public get addressPrefixes(): string[] {
    return this.props.addressPrefixes;
  }

  /**
   * Get the calculated number of IP addresses in this CIDR block
   * This is automatically calculated from the CIDR prefix at construct creation time
   *
   * @returns Total count of IP addresses in the CIDR block
   *
   * @example
   * const staticCidr = new IpamPoolStaticCidr(this, "cidr", {
   *   addressPrefixes: ["10.0.1.0/24"]
   * });
   * console.log(staticCidr.calculatedAddressCount); // 256
   */
  public get calculatedAddressCount(): number {
    return this._calculatedAddressCount;
  }

  /**
   * Get the provisioning state of the Static CIDR
   */
  public get provisioningState(): string {
    return `\${${this.terraformResource.fqn}.output.properties.provisioningState}`;
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
