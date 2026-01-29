/**
 * Azure Private DNS Zone Record implementations using AzapiResource framework
 *
 * This file provides implementations for all Private DNS Zone record types:
 * - PrivateDnsARecord (A records with IPv4 addresses)
 * - PrivateDnsAaaaRecord (AAAA records with IPv6 addresses)
 * - PrivateDnsCnameRecord (CNAME records)
 * - PrivateDnsMxRecord (MX records with exchange and preference)
 * - PrivateDnsPtrRecord (PTR records)
 * - PrivateDnsSoaRecord (SOA records)
 * - PrivateDnsSrvRecord (SRV records with priority, weight, port, target)
 * - PrivateDnsTxtRecord (TXT records)
 *
 * API Version: 2024-06-01
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import {
  ALL_PRIVATE_DNS_A_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_AAAA_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_CNAME_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_MX_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_PTR_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_SOA_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_SRV_RECORD_VERSIONS,
  ALL_PRIVATE_DNS_TXT_RECORD_VERSIONS,
  PRIVATE_DNS_A_RECORD_TYPE,
  PRIVATE_DNS_AAAA_RECORD_TYPE,
  PRIVATE_DNS_CNAME_RECORD_TYPE,
  PRIVATE_DNS_MX_RECORD_TYPE,
  PRIVATE_DNS_PTR_RECORD_TYPE,
  PRIVATE_DNS_SOA_RECORD_TYPE,
  PRIVATE_DNS_SRV_RECORD_TYPE,
  PRIVATE_DNS_TXT_RECORD_TYPE,
} from "./private-dns-record-schemas";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../../core-azure/lib/version-manager/interfaces/version-interfaces";

// =============================================================================
// COMMON INTERFACES
// =============================================================================

/**
 * Base properties shared by all Private DNS record types
 *
 * Note: The `name` property is inherited from AzapiResourceProps.
 * For DNS records, use @ for apex records or provide a relative name like "www" or "mail".
 */
export interface PrivateDnsRecordBaseProps extends AzapiResourceProps {
  /**
   * Resource ID of the parent Private DNS Zone
   * @example zone.id or "/subscriptions/.../providers/Microsoft.Network/privateDnsZones/example.com"
   */
  readonly privateDnsZoneId: string;

  /**
   * Time to Live in seconds
   * @default 3600
   */
  readonly ttl?: number;

  /**
   * Metadata key-value pairs for the record set
   */
  readonly metadata?: { [key: string]: string };
}

// =============================================================================
// A RECORD
// =============================================================================

/**
 * Entry for an A record with IPv4 address
 */
export interface ARecordEntry {
  /**
   * The IPv4 address of this A record
   * @example "10.0.1.4"
   */
  readonly ipv4Address: string;
}

/**
 * Properties for Private DNS A Record
 */
export interface PrivateDnsARecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of A records with IPv4 addresses
   */
  readonly records: ARecordEntry[];
}

/**
 * Azure Private DNS A Record implementation
 *
 * A records map a hostname to one or more IPv4 addresses.
 *
 * @example
 * // Create an A record with multiple IP addresses:
 * const aRecord = new PrivateDnsARecord(this, "web-a-record", {
 *   name: "www",
 *   privateDnsZoneId: zone.id,
 *   ttl: 300,
 *   records: [
 *     { ipv4Address: "10.0.1.4" },
 *     { ipv4Address: "10.0.1.5" },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsARecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_A_RECORD_TYPE,
      ALL_PRIVATE_DNS_A_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsARecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsARecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the A Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the A Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the A Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsARecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_A_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsARecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        aRecords: typedProps.records.map((r) => ({
          ipv4Address: r.ipv4Address,
        })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// AAAA RECORD
// =============================================================================

/**
 * Entry for an AAAA record with IPv6 address
 */
export interface AaaaRecordEntry {
  /**
   * The IPv6 address of this AAAA record
   * @example "2001:db8::1"
   */
  readonly ipv6Address: string;
}

/**
 * Properties for Private DNS AAAA Record
 */
export interface PrivateDnsAaaaRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of AAAA records with IPv6 addresses
   */
  readonly records: AaaaRecordEntry[];
}

/**
 * Azure Private DNS AAAA Record implementation
 *
 * AAAA records map a hostname to one or more IPv6 addresses.
 *
 * @example
 * // Create an AAAA record:
 * const aaaaRecord = new PrivateDnsAaaaRecord(this, "web-aaaa-record", {
 *   name: "www",
 *   privateDnsZoneId: zone.id,
 *   ttl: 300,
 *   records: [
 *     { ipv6Address: "2001:db8::1" },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsAaaaRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_AAAA_RECORD_TYPE,
      ALL_PRIVATE_DNS_AAAA_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsAaaaRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsAaaaRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the AAAA Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the AAAA Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the AAAA Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsAaaaRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_AAAA_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsAaaaRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        aaaaRecords: typedProps.records.map((r) => ({
          ipv6Address: r.ipv6Address,
        })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// CNAME RECORD
// =============================================================================

/**
 * Properties for Private DNS CNAME Record
 */
export interface PrivateDnsCnameRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * The canonical name for this CNAME record
   * @example "www.contoso.com"
   */
  readonly cname: string;
}

/**
 * Azure Private DNS CNAME Record implementation
 *
 * CNAME records create an alias from one hostname to another.
 * Note: CNAME records cannot coexist with other record types at the same name.
 *
 * @example
 * // Create a CNAME record:
 * const cnameRecord = new PrivateDnsCnameRecord(this, "alias-record", {
 *   name: "app",
 *   privateDnsZoneId: zone.id,
 *   ttl: 3600,
 *   cname: "www.internal.example.com",
 * });
 *
 * @stability stable
 */
export class PrivateDnsCnameRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_CNAME_RECORD_TYPE,
      ALL_PRIVATE_DNS_CNAME_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsCnameRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsCnameRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the CNAME Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the CNAME Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the CNAME Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsCnameRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_CNAME_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsCnameRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        cnameRecord: {
          cname: typedProps.cname,
        },
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// MX RECORD
// =============================================================================

/**
 * Entry for an MX record
 */
export interface MxRecordEntry {
  /**
   * The preference value for this MX record (lower values have higher priority)
   * @example 10
   */
  readonly preference: number;

  /**
   * The mail exchange server hostname
   * @example "mail1.example.com"
   */
  readonly exchange: string;
}

/**
 * Properties for Private DNS MX Record
 */
export interface PrivateDnsMxRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of MX records with exchange and preference
   */
  readonly records: MxRecordEntry[];
}

/**
 * Azure Private DNS MX Record implementation
 *
 * MX records specify mail exchange servers for a domain.
 *
 * @example
 * // Create an MX record:
 * const mxRecord = new PrivateDnsMxRecord(this, "mail-record", {
 *   name: "@",
 *   privateDnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { preference: 10, exchange: "mail1.internal.example.com" },
 *     { preference: 20, exchange: "mail2.internal.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsMxRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_MX_RECORD_TYPE,
      ALL_PRIVATE_DNS_MX_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsMxRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsMxRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the MX Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the MX Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the MX Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsMxRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_MX_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsMxRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        mxRecords: typedProps.records.map((r) => ({
          preference: r.preference,
          exchange: r.exchange,
        })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// PTR RECORD
// =============================================================================

/**
 * Entry for a PTR record
 */
export interface PtrRecordEntry {
  /**
   * The PTR target domain name
   * @example "server1.internal.example.com"
   */
  readonly ptrdname: string;
}

/**
 * Properties for Private DNS PTR Record
 */
export interface PrivateDnsPtrRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of PTR records with ptrdname values
   */
  readonly records: PtrRecordEntry[];
}

/**
 * Azure Private DNS PTR Record implementation
 *
 * PTR records are used for reverse DNS lookups, mapping IP addresses to hostnames.
 *
 * @example
 * // Create a PTR record:
 * const ptrRecord = new PrivateDnsPtrRecord(this, "ptr-record", {
 *   name: "4.1.0.10.in-addr.arpa",
 *   privateDnsZoneId: reverseZone.id,
 *   ttl: 3600,
 *   records: [
 *     { ptrdname: "server1.internal.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsPtrRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_PTR_RECORD_TYPE,
      ALL_PRIVATE_DNS_PTR_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsPtrRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsPtrRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the PTR Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the PTR Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the PTR Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsPtrRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_PTR_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsPtrRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        ptrRecords: typedProps.records.map((r) => ({ ptrdname: r.ptrdname })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// SOA RECORD
// =============================================================================

/**
 * SOA record configuration
 */
export interface SoaRecordConfig {
  /**
   * The domain name of the authoritative name server
   */
  readonly host?: string;

  /**
   * The email contact for this zone (with @ replaced by .)
   * @example "admin.example.com" (for admin@example.com)
   */
  readonly email?: string;

  /**
   * The serial number for this zone
   */
  readonly serialNumber?: number;

  /**
   * The refresh time in seconds
   */
  readonly refreshTime?: number;

  /**
   * The retry time in seconds
   */
  readonly retryTime?: number;

  /**
   * The expire time in seconds
   */
  readonly expireTime?: number;

  /**
   * The minimum TTL in seconds
   */
  readonly minimumTtl?: number;
}

/**
 * Properties for Private DNS SOA Record
 */
export interface PrivateDnsSoaRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * SOA record configuration
   */
  readonly soaRecord: SoaRecordConfig;
}

/**
 * Azure Private DNS SOA Record implementation
 *
 * SOA records contain administrative information about a DNS zone.
 * Note: Each zone automatically has an SOA record; this is typically used to update it.
 *
 * @example
 * // Update the SOA record:
 * const soaRecord = new PrivateDnsSoaRecord(this, "soa-record", {
 *   name: "@",
 *   privateDnsZoneId: zone.id,
 *   ttl: 3600,
 *   soaRecord: {
 *     email: "admin.example.com",
 *     refreshTime: 3600,
 *     retryTime: 300,
 *     expireTime: 2419200,
 *     minimumTtl: 300,
 *   },
 * });
 *
 * @stability stable
 */
export class PrivateDnsSoaRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_SOA_RECORD_TYPE,
      ALL_PRIVATE_DNS_SOA_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsSoaRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsSoaRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the SOA Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the SOA Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the SOA Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsSoaRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_SOA_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsSoaRecordProps;
    const soaRecord: { [key: string]: unknown } = {};

    if (typedProps.soaRecord.host !== undefined) {
      soaRecord.host = typedProps.soaRecord.host;
    }
    if (typedProps.soaRecord.email !== undefined) {
      soaRecord.email = typedProps.soaRecord.email;
    }
    if (typedProps.soaRecord.serialNumber !== undefined) {
      soaRecord.serialNumber = typedProps.soaRecord.serialNumber;
    }
    if (typedProps.soaRecord.refreshTime !== undefined) {
      soaRecord.refreshTime = typedProps.soaRecord.refreshTime;
    }
    if (typedProps.soaRecord.retryTime !== undefined) {
      soaRecord.retryTime = typedProps.soaRecord.retryTime;
    }
    if (typedProps.soaRecord.expireTime !== undefined) {
      soaRecord.expireTime = typedProps.soaRecord.expireTime;
    }
    if (typedProps.soaRecord.minimumTtl !== undefined) {
      soaRecord.minimumTtl = typedProps.soaRecord.minimumTtl;
    }

    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        soaRecord: soaRecord,
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// SRV RECORD
// =============================================================================

/**
 * Entry for an SRV record
 */
export interface SrvRecordEntry {
  /**
   * The priority of this SRV record (lower values have higher priority)
   */
  readonly priority: number;

  /**
   * The weight of this SRV record (used for load balancing among records with same priority)
   */
  readonly weight: number;

  /**
   * The port number for the service
   */
  readonly port: number;

  /**
   * The target hostname providing the service
   * @example "sipserver.internal.example.com"
   */
  readonly target: string;
}

/**
 * Properties for Private DNS SRV Record
 */
export interface PrivateDnsSrvRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of SRV records with priority, weight, port, and target
   */
  readonly records: SrvRecordEntry[];
}

/**
 * Azure Private DNS SRV Record implementation
 *
 * SRV records specify the location of services like SIP, XMPP, etc.
 *
 * @example
 * // Create an SRV record for a SIP service:
 * const srvRecord = new PrivateDnsSrvRecord(this, "sip-record", {
 *   name: "_sip._tcp",
 *   privateDnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { priority: 10, weight: 60, port: 5060, target: "sipserver1.internal.example.com" },
 *     { priority: 10, weight: 40, port: 5060, target: "sipserver2.internal.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsSrvRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_SRV_RECORD_TYPE,
      ALL_PRIVATE_DNS_SRV_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsSrvRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsSrvRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the SRV Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the SRV Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the SRV Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsSrvRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_SRV_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsSrvRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        srvRecords: typedProps.records.map((r) => ({
          priority: r.priority,
          weight: r.weight,
          port: r.port,
          target: r.target,
        })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// TXT RECORD
// =============================================================================

/**
 * Entry for a TXT record
 */
export interface TxtRecordEntry {
  /**
   * The text value of this TXT record (array of strings, each up to 255 chars)
   * Long values are automatically split into multiple strings
   * @example ["v=spf1 include:spf.protection.outlook.com -all"]
   */
  readonly value: string[];
}

/**
 * Properties for Private DNS TXT Record
 */
export interface PrivateDnsTxtRecordProps extends PrivateDnsRecordBaseProps {
  /**
   * Array of TXT records with string values
   */
  readonly records: TxtRecordEntry[];
}

/**
 * Azure Private DNS TXT Record implementation
 *
 * TXT records store arbitrary text data, commonly used for SPF, DKIM, etc.
 *
 * @example
 * // Create a TXT record for SPF:
 * const txtRecord = new PrivateDnsTxtRecord(this, "spf-record", {
 *   name: "@",
 *   privateDnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
 *   ],
 * });
 *
 * @stability stable
 */
export class PrivateDnsTxtRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      PRIVATE_DNS_TXT_RECORD_TYPE,
      ALL_PRIVATE_DNS_TXT_RECORD_VERSIONS,
    );
  }

  public readonly props: PrivateDnsTxtRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: PrivateDnsTxtRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the TXT Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the TXT Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the TXT Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as PrivateDnsTxtRecordProps;
    return typedProps.privateDnsZoneId;
  }

  protected defaultVersion(): string {
    return "2024-06-01";
  }

  protected resourceType(): string {
    return PRIVATE_DNS_TXT_RECORD_TYPE;
  }

  protected apiSchema(): ApiSchema {
    return this.resolveSchema();
  }

  protected requiresLocation(): boolean {
    return false;
  }

  protected supportsTags(): boolean {
    return false;
  }

  protected createResourceBody(props: any): any {
    const typedProps = props as PrivateDnsTxtRecordProps;
    const body: { [key: string]: object } = {
      properties: {
        ttl: typedProps.ttl ?? 3600,
        txtRecords: typedProps.records.map((r) => ({ value: r.value })),
      },
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      (body.properties as { [key: string]: unknown }).metadata =
        typedProps.metadata;
    }

    return body;
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}
