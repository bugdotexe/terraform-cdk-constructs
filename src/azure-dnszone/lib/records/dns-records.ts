/**
 * Azure Public DNS Zone Record implementations using AzapiResource framework
 *
 * This file provides implementations for all Public DNS Zone record types:
 * - DnsARecord (A records with IPv4 addresses)
 * - DnsAaaaRecord (AAAA records with IPv6 addresses)
 * - DnsCaaRecord (CAA records for Certificate Authority Authorization) - PUBLIC ONLY
 * - DnsCnameRecord (CNAME records)
 * - DnsMxRecord (MX records with exchange and preference)
 * - DnsNsRecord (NS records for Name Servers) - PUBLIC ONLY
 * - DnsPtrRecord (PTR records)
 * - DnsSoaRecord (SOA records)
 * - DnsSrvRecord (SRV records with priority, weight, port, target)
 * - DnsTxtRecord (TXT records)
 *
 * API Version: 2018-05-01
 *
 * Key differences from Private DNS:
 * - Property casing: Public DNS uses PascalCase (ARecords, TTL vs aRecords, ttl)
 * - CAA records: Only available in public DNS
 * - NS records: Only available in public DNS
 * - targetResource: Public DNS A, AAAA, and CNAME records support alias records
 */

import * as cdktf from "cdktf";
import { Construct } from "constructs";
import {
  ALL_DNS_A_RECORD_VERSIONS,
  ALL_DNS_AAAA_RECORD_VERSIONS,
  ALL_DNS_CAA_RECORD_VERSIONS,
  ALL_DNS_CNAME_RECORD_VERSIONS,
  ALL_DNS_MX_RECORD_VERSIONS,
  ALL_DNS_NS_RECORD_VERSIONS,
  ALL_DNS_PTR_RECORD_VERSIONS,
  ALL_DNS_SOA_RECORD_VERSIONS,
  ALL_DNS_SRV_RECORD_VERSIONS,
  ALL_DNS_TXT_RECORD_VERSIONS,
  DNS_A_RECORD_TYPE,
  DNS_AAAA_RECORD_TYPE,
  DNS_CAA_RECORD_TYPE,
  DNS_CNAME_RECORD_TYPE,
  DNS_MX_RECORD_TYPE,
  DNS_NS_RECORD_TYPE,
  DNS_PTR_RECORD_TYPE,
  DNS_SOA_RECORD_TYPE,
  DNS_SRV_RECORD_TYPE,
  DNS_TXT_RECORD_TYPE,
} from "./dns-record-schemas";
import {
  AzapiResource,
  AzapiResourceProps,
} from "../../../core-azure/lib/azapi/azapi-resource";
import { ApiSchema } from "../../../core-azure/lib/version-manager/interfaces/version-interfaces";

// =============================================================================
// COMMON INTERFACES
// =============================================================================

/**
 * Base properties shared by all Public DNS record types
 *
 * Note: The `name` property is inherited from AzapiResourceProps.
 * For DNS records, use @ for apex records or provide a relative name like "www" or "mail".
 */
export interface DnsRecordBaseProps extends AzapiResourceProps {
  /**
   * Resource ID of the parent DNS Zone
   * @example zone.id or "/subscriptions/.../providers/Microsoft.Network/dnsZones/example.com"
   */
  readonly dnsZoneId: string;

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
export interface DnsARecordEntry {
  /**
   * The IPv4 address of this A record
   * @example "20.30.40.50"
   */
  readonly ipv4Address: string;
}

/**
 * Properties for Public DNS A Record
 */
export interface DnsARecordProps extends DnsRecordBaseProps {
  /**
   * Array of A records with IPv4 addresses
   * Either records or targetResourceId must be specified
   */
  readonly records?: DnsARecordEntry[];

  /**
   * Reference to an Azure resource from where the IP content is taken (alias record)
   * Either records or targetResourceId must be specified
   * @example publicIp.id
   */
  readonly targetResourceId?: string;
}

/**
 * Azure Public DNS A Record implementation
 *
 * A records map a hostname to one or more IPv4 addresses.
 * Supports alias records via targetResourceId for pointing to Azure resources.
 *
 * @example
 * // Create an A record with IP addresses:
 * const aRecord = new DnsARecord(this, "web-a-record", {
 *   name: "www",
 *   dnsZoneId: zone.id,
 *   ttl: 300,
 *   records: [
 *     { ipv4Address: "20.30.40.50" },
 *   ],
 * });
 *
 * @example
 * // Create an alias A record pointing to an Azure resource:
 * const aliasRecord = new DnsARecord(this, "alias-a-record", {
 *   name: "www",
 *   dnsZoneId: zone.id,
 *   ttl: 300,
 *   targetResourceId: publicIp.id,
 * });
 *
 * @stability stable
 */
export class DnsARecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(DNS_A_RECORD_TYPE, ALL_DNS_A_RECORD_VERSIONS);
  }

  public readonly props: DnsARecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsARecordProps) {
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
    const typedProps = props as DnsARecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_A_RECORD_TYPE;
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
    const typedProps = props as DnsARecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
    };

    if (typedProps.records && typedProps.records.length > 0) {
      properties.ARecords = typedProps.records.map((r) => ({
        ipv4Address: r.ipv4Address,
      }));
    }

    if (typedProps.targetResourceId) {
      properties.targetResource = { id: typedProps.targetResourceId };
    }

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsAaaaRecordEntry {
  /**
   * The IPv6 address of this AAAA record
   * @example "2001:db8::1"
   */
  readonly ipv6Address: string;
}

/**
 * Properties for Public DNS AAAA Record
 */
export interface DnsAaaaRecordProps extends DnsRecordBaseProps {
  /**
   * Array of AAAA records with IPv6 addresses
   * Either records or targetResourceId must be specified
   */
  readonly records?: DnsAaaaRecordEntry[];

  /**
   * Reference to an Azure resource from where the IP content is taken (alias record)
   * Either records or targetResourceId must be specified
   */
  readonly targetResourceId?: string;
}

/**
 * Azure Public DNS AAAA Record implementation
 *
 * AAAA records map a hostname to one or more IPv6 addresses.
 * Supports alias records via targetResourceId for pointing to Azure resources.
 *
 * @example
 * // Create an AAAA record:
 * const aaaaRecord = new DnsAaaaRecord(this, "web-aaaa-record", {
 *   name: "www",
 *   dnsZoneId: zone.id,
 *   ttl: 300,
 *   records: [
 *     { ipv6Address: "2001:db8::1" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsAaaaRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_AAAA_RECORD_TYPE,
      ALL_DNS_AAAA_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsAaaaRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsAaaaRecordProps) {
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
    const typedProps = props as DnsAaaaRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_AAAA_RECORD_TYPE;
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
    const typedProps = props as DnsAaaaRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
    };

    if (typedProps.records && typedProps.records.length > 0) {
      properties.AAAARecords = typedProps.records.map((r) => ({
        ipv6Address: r.ipv6Address,
      }));
    }

    if (typedProps.targetResourceId) {
      properties.targetResource = { id: typedProps.targetResourceId };
    }

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// CAA RECORD (PUBLIC DNS ONLY)
// =============================================================================

/**
 * Entry for a CAA record (Certificate Authority Authorization)
 */
export interface DnsCaaRecordEntry {
  /**
   * Flags for this CAA record (0-255)
   * 0 = non-critical, 128 = critical
   * @example 0
   */
  readonly flags: number;

  /**
   * The property tag for this CAA record
   * Common values: "issue", "issuewild", "iodef"
   * @example "issue"
   */
  readonly tag: string;

  /**
   * The value associated with the tag
   * @example "letsencrypt.org"
   */
  readonly value: string;
}

/**
 * Properties for Public DNS CAA Record
 */
export interface DnsCaaRecordProps extends DnsRecordBaseProps {
  /**
   * Array of CAA records with flags, tag, and value
   */
  readonly records: DnsCaaRecordEntry[];
}

/**
 * Azure Public DNS CAA Record implementation
 *
 * CAA records specify which Certificate Authorities are authorized to issue
 * certificates for a domain. This record type is only available in Public DNS Zones.
 *
 * @example
 * // Create a CAA record to authorize Let's Encrypt:
 * const caaRecord = new DnsCaaRecord(this, "caa-record", {
 *   name: "@",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { flags: 0, tag: "issue", value: "letsencrypt.org" },
 *     { flags: 0, tag: "issuewild", value: ";" }, // Disallow wildcard certs
 *     { flags: 0, tag: "iodef", value: "mailto:security@example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsCaaRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_CAA_RECORD_TYPE,
      ALL_DNS_CAA_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsCaaRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsCaaRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the CAA Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the CAA Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the CAA Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as DnsCaaRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_CAA_RECORD_TYPE;
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
    const typedProps = props as DnsCaaRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      caaRecords: typedProps.records.map((r) => ({
        flags: r.flags,
        tag: r.tag,
        value: r.value,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
 * Properties for Public DNS CNAME Record
 */
export interface DnsCnameRecordProps extends DnsRecordBaseProps {
  /**
   * The canonical name for this CNAME record
   * Either cname or targetResourceId must be specified
   * @example "www.contoso.com"
   */
  readonly cname?: string;

  /**
   * Reference to an Azure resource from where the DNS content is taken (alias record)
   * Either cname or targetResourceId must be specified
   */
  readonly targetResourceId?: string;
}

/**
 * Azure Public DNS CNAME Record implementation
 *
 * CNAME records create an alias from one hostname to another.
 * Supports alias records via targetResourceId for pointing to Azure resources.
 * Note: CNAME records cannot coexist with other record types at the same name.
 *
 * @example
 * // Create a CNAME record:
 * const cnameRecord = new DnsCnameRecord(this, "alias-record", {
 *   name: "app",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   cname: "www.example.com",
 * });
 *
 * @stability stable
 */
export class DnsCnameRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_CNAME_RECORD_TYPE,
      ALL_DNS_CNAME_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsCnameRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsCnameRecordProps) {
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
    const typedProps = props as DnsCnameRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_CNAME_RECORD_TYPE;
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
    const typedProps = props as DnsCnameRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
    };

    if (typedProps.cname) {
      properties.CNAMERecord = { cname: typedProps.cname };
    }

    if (typedProps.targetResourceId) {
      properties.targetResource = { id: typedProps.targetResourceId };
    }

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsMxRecordEntry {
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
 * Properties for Public DNS MX Record
 */
export interface DnsMxRecordProps extends DnsRecordBaseProps {
  /**
   * Array of MX records with exchange and preference
   */
  readonly records: DnsMxRecordEntry[];
}

/**
 * Azure Public DNS MX Record implementation
 *
 * MX records specify mail exchange servers for a domain.
 *
 * @example
 * // Create an MX record:
 * const mxRecord = new DnsMxRecord(this, "mail-record", {
 *   name: "@",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { preference: 10, exchange: "mail1.example.com" },
 *     { preference: 20, exchange: "mail2.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsMxRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_MX_RECORD_TYPE,
      ALL_DNS_MX_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsMxRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsMxRecordProps) {
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
    const typedProps = props as DnsMxRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_MX_RECORD_TYPE;
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
    const typedProps = props as DnsMxRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      MXRecords: typedProps.records.map((r) => ({
        preference: r.preference,
        exchange: r.exchange,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}

// =============================================================================
// NS RECORD (PUBLIC DNS ONLY)
// =============================================================================

/**
 * Entry for an NS record
 */
export interface DnsNsRecordEntry {
  /**
   * The name server domain name
   * @example "ns1.example.com"
   */
  readonly nsdname: string;
}

/**
 * Properties for Public DNS NS Record
 */
export interface DnsNsRecordProps extends DnsRecordBaseProps {
  /**
   * Array of NS records with nsdname values
   */
  readonly records: DnsNsRecordEntry[];
}

/**
 * Azure Public DNS NS Record implementation
 *
 * NS records specify the authoritative name servers for a domain or subdomain.
 * This record type is only available in Public DNS Zones.
 *
 * @example
 * // Create an NS record for a subdomain delegation:
 * const nsRecord = new DnsNsRecord(this, "ns-record", {
 *   name: "subdomain",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { nsdname: "ns1.subdomain.example.com" },
 *     { nsdname: "ns2.subdomain.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsNsRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_NS_RECORD_TYPE,
      ALL_DNS_NS_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsNsRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsNsRecordProps) {
    super(scope, id, props);
    this.props = props;

    this.idOutput = new cdktf.TerraformOutput(this, "id", {
      value: this.id,
      description: "The ID of the NS Record",
    });

    this.nameOutput = new cdktf.TerraformOutput(this, "name", {
      value: `\${${this.terraformResource.fqn}.name}`,
      description: "The name of the NS Record",
    });

    this.fqdnOutput = new cdktf.TerraformOutput(this, "fqdn", {
      value: `\${${this.terraformResource.fqn}.output.properties.fqdn}`,
      description: "The FQDN of the NS Record",
    });

    this.idOutput.overrideLogicalId("id");
    this.nameOutput.overrideLogicalId("name");
    this.fqdnOutput.overrideLogicalId("fqdn");
  }

  protected resolveParentId(props: any): string {
    const typedProps = props as DnsNsRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_NS_RECORD_TYPE;
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
    const typedProps = props as DnsNsRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      NSRecords: typedProps.records.map((r) => ({
        nsdname: r.nsdname,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsPtrRecordEntry {
  /**
   * The PTR target domain name
   * @example "server1.example.com"
   */
  readonly ptrdname: string;
}

/**
 * Properties for Public DNS PTR Record
 */
export interface DnsPtrRecordProps extends DnsRecordBaseProps {
  /**
   * Array of PTR records with ptrdname values
   */
  readonly records: DnsPtrRecordEntry[];
}

/**
 * Azure Public DNS PTR Record implementation
 *
 * PTR records are used for reverse DNS lookups, mapping IP addresses to hostnames.
 *
 * @example
 * // Create a PTR record:
 * const ptrRecord = new DnsPtrRecord(this, "ptr-record", {
 *   name: "50",
 *   dnsZoneId: reverseZone.id,
 *   ttl: 3600,
 *   records: [
 *     { ptrdname: "server1.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsPtrRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_PTR_RECORD_TYPE,
      ALL_DNS_PTR_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsPtrRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsPtrRecordProps) {
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
    const typedProps = props as DnsPtrRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_PTR_RECORD_TYPE;
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
    const typedProps = props as DnsPtrRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      PTRRecords: typedProps.records.map((r) => ({
        ptrdname: r.ptrdname,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsSoaRecordConfig {
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
  readonly minimumTTL?: number;
}

/**
 * Properties for Public DNS SOA Record
 */
export interface DnsSoaRecordProps extends DnsRecordBaseProps {
  /**
   * SOA record configuration
   */
  readonly soaRecord: DnsSoaRecordConfig;
}

/**
 * Azure Public DNS SOA Record implementation
 *
 * SOA records contain administrative information about a DNS zone.
 * Note: Each zone automatically has an SOA record; this is typically used to update it.
 *
 * @example
 * // Update the SOA record:
 * const soaRecord = new DnsSoaRecord(this, "soa-record", {
 *   name: "@",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   soaRecord: {
 *     email: "admin.example.com",
 *     refreshTime: 3600,
 *     retryTime: 300,
 *     expireTime: 2419200,
 *     minimumTTL: 300,
 *   },
 * });
 *
 * @stability stable
 */
export class DnsSoaRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_SOA_RECORD_TYPE,
      ALL_DNS_SOA_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsSoaRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsSoaRecordProps) {
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
    const typedProps = props as DnsSoaRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_SOA_RECORD_TYPE;
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
    const typedProps = props as DnsSoaRecordProps;
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
    if (typedProps.soaRecord.minimumTTL !== undefined) {
      soaRecord.minimumTTL = typedProps.soaRecord.minimumTTL;
    }

    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      SOARecord: soaRecord,
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsSrvRecordEntry {
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
   * @example "sipserver.example.com"
   */
  readonly target: string;
}

/**
 * Properties for Public DNS SRV Record
 */
export interface DnsSrvRecordProps extends DnsRecordBaseProps {
  /**
   * Array of SRV records with priority, weight, port, and target
   */
  readonly records: DnsSrvRecordEntry[];
}

/**
 * Azure Public DNS SRV Record implementation
 *
 * SRV records specify the location of services like SIP, XMPP, etc.
 *
 * @example
 * // Create an SRV record for a SIP service:
 * const srvRecord = new DnsSrvRecord(this, "sip-record", {
 *   name: "_sip._tcp",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { priority: 10, weight: 60, port: 5060, target: "sipserver1.example.com" },
 *     { priority: 10, weight: 40, port: 5060, target: "sipserver2.example.com" },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsSrvRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_SRV_RECORD_TYPE,
      ALL_DNS_SRV_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsSrvRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsSrvRecordProps) {
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
    const typedProps = props as DnsSrvRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_SRV_RECORD_TYPE;
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
    const typedProps = props as DnsSrvRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      SRVRecords: typedProps.records.map((r) => ({
        priority: r.priority,
        weight: r.weight,
        port: r.port,
        target: r.target,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
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
export interface DnsTxtRecordEntry {
  /**
   * The text value of this TXT record (array of strings, each up to 255 chars)
   * Long values are automatically split into multiple strings
   * @example ["v=spf1 include:spf.protection.outlook.com -all"]
   */
  readonly value: string[];
}

/**
 * Properties for Public DNS TXT Record
 */
export interface DnsTxtRecordProps extends DnsRecordBaseProps {
  /**
   * Array of TXT records with string values
   */
  readonly records: DnsTxtRecordEntry[];
}

/**
 * Azure Public DNS TXT Record implementation
 *
 * TXT records store arbitrary text data, commonly used for SPF, DKIM, domain verification, etc.
 *
 * @example
 * // Create a TXT record for SPF:
 * const txtRecord = new DnsTxtRecord(this, "spf-record", {
 *   name: "@",
 *   dnsZoneId: zone.id,
 *   ttl: 3600,
 *   records: [
 *     { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
 *   ],
 * });
 *
 * @stability stable
 */
export class DnsTxtRecord extends AzapiResource {
  static {
    AzapiResource.registerSchemas(
      DNS_TXT_RECORD_TYPE,
      ALL_DNS_TXT_RECORD_VERSIONS,
    );
  }

  public readonly props: DnsTxtRecordProps;
  public readonly idOutput: cdktf.TerraformOutput;
  public readonly nameOutput: cdktf.TerraformOutput;
  public readonly fqdnOutput: cdktf.TerraformOutput;

  constructor(scope: Construct, id: string, props: DnsTxtRecordProps) {
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
    const typedProps = props as DnsTxtRecordProps;
    return typedProps.dnsZoneId;
  }

  protected defaultVersion(): string {
    return "2018-05-01";
  }

  protected resourceType(): string {
    return DNS_TXT_RECORD_TYPE;
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
    const typedProps = props as DnsTxtRecordProps;
    const properties: { [key: string]: unknown } = {
      TTL: typedProps.ttl ?? 3600,
      TXTRecords: typedProps.records.map((r) => ({
        value: r.value,
      })),
    };

    if (typedProps.metadata && Object.keys(typedProps.metadata).length > 0) {
      properties.metadata = typedProps.metadata;
    }

    return { properties };
  }

  /**
   * Get the FQDN of the record
   */
  public get fqdn(): string {
    return `\${${this.terraformResource.fqn}.output.properties.fqdn}`;
  }
}
