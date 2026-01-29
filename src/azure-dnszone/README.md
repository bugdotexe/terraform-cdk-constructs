# Azure DNS Zone Construct (AZAPI)

This Construct represents a DNS Zone in Azure using the AZAPI provider for direct Azure REST API access.

## What is Azure DNS Zone?

Azure DNS is a hosting service for DNS domains that provides name resolution using Microsoft Azure infrastructure. DNS zones are containers for DNS records for a particular domain. Azure DNS supports both public DNS zones (accessible from the Internet) and private DNS zones (accessible only from specified virtual networks).

**Key Features:**
- Host your DNS domain on Azure's global anycast network
- Manage DNS records using Azure tools and APIs
- Support for both public and private DNS zones
- Integration with Azure virtual networks for private DNS
- High availability and fast DNS responses
- Support for DNSSEC (coming soon)
- Built-in DDoS protection

You can learn more about Azure DNS in the [official Azure documentation](https://docs.microsoft.com/azure/dns/dns-overview).

## AZAPI Provider Benefits

This DNS Zone construct uses the AZAPI provider, which provides:

- **Direct Azure REST API Access**: No dependency on AzureRM provider limitations
- **Immediate Feature Access**: Get new Azure features as soon as they're available
- **Version-Specific Implementations**: Support for multiple API versions
- **Enhanced Type Safety**: Better IDE support and compile-time validation

## Best Practices

### Public DNS Zones
- **Use descriptive names**: DNS zone names should match your domain (e.g., `contoso.com`)
- **Configure at registrar**: Update your domain registrar with Azure DNS name servers
- **Monitor DNS queries**: Use diagnostic settings to track DNS usage and issues
- **Implement tags**: Tag DNS zones for cost management and organization
- **Plan for TTL**: Consider Time To Live (TTL) values for your DNS records

### Private DNS Zones
- **Link to virtual networks**: Associate private DNS zones with your Azure virtual networks
- **Use for internal services**: Ideal for internal application communication
- **Consider auto-registration**: Enable VM hostname auto-registration when appropriate
- **Plan network topology**: Design DNS resolution strategy for hub-spoke or complex networks

## Properties

This Construct supports the following properties:

### Required Properties
- **`name`**: (Required) The name of the DNS Zone (without a terminating dot). Must be a valid domain name.
- **`location`**: (Required) The Azure region (typically "global" for DNS zones as they are global resources)

### Optional Properties
- **`resourceGroupId`**: (Optional) The resource ID of the resource group where the DNS zone will be created
- **`zoneType`**: (Optional) The type of DNS zone: "Public" (default) or "Private"
- **`registrationVirtualNetworks`**: (Optional) Array of virtual network references that register hostnames (Private zones only)
- **`resolutionVirtualNetworks`**: (Optional) Array of virtual network references that resolve DNS records (Private zones only)
- **`tags`**: (Optional) Key-value pairs for resource tagging and organization
- **`ignoreChanges`**: (Optional) Lifecycle rules to ignore changes for specific properties
- **`apiVersion`**: (Optional) Explicit API version to use (defaults to latest: "2018-05-01")

## Supported API Versions

| API Version | Status  | Features                                          |
|-------------|---------|---------------------------------------------------|
| 2018-05-01  | ✅ Latest | Full support for public and private DNS zones    |

## Basic Usage

### Public DNS Zone

```typescript
import { DnsZone } from "@microsoft/terraform-cdk-constructs/azure-dnszone";
import { ResourceGroup } from "@microsoft/terraform-cdk-constructs/azure-resourcegroup";

// Create a resource group
const resourceGroup = new ResourceGroup(this, 'rg', {
  name: 'dns-rg',
  location: 'eastus',
});

// Create a public DNS zone
const dnsZone = new DnsZone(this, 'publicDns', {
  name: 'contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  tags: {
    environment: 'production',
    service: 'dns',
  },
});

// Access name servers for domain registrar configuration
console.log('Configure these name servers at your domain registrar:');
console.log(dnsZone.nameServers);
```

### Private DNS Zone

```typescript
import { DnsZone } from "@microsoft/terraform-cdk-constructs/azure-dnszone";
import { ResourceGroup } from "@microsoft/terraform-cdk-constructs/azure-resourcegroup";
import { VirtualNetwork } from "@microsoft/terraform-cdk-constructs/azure-virtualnetwork";

const resourceGroup = new ResourceGroup(this, 'rg', {
  name: 'dns-rg',
  location: 'eastus',
});

const vnet = new VirtualNetwork(this, 'vnet', {
  name: 'my-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.0.0.0/16'],
});

// Create a private DNS zone linked to virtual network
const privateDnsZone = new DnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  zoneType: 'Private',
  registrationVirtualNetworks: [
    { id: vnet.id }
  ],
  tags: {
    environment: 'production',
    type: 'private',
  },
});
```

## Advanced Features

### Version Pinning

Pin to a specific API version for stability:

```typescript
const dnsZone = new DnsZone(this, 'dns', {
  name: 'contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  apiVersion: '2018-05-01', // Pin to specific version
});
```

### Ignore Changes

Prevent Terraform from detecting changes to specific properties:

```typescript
const dnsZone = new DnsZone(this, 'dns', {
  name: 'contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  ignoreChanges: ['tags'], // Ignore tag changes
});
```

### Multiple Virtual Network Links (Private DNS)

Link a private DNS zone to multiple virtual networks:

```typescript
const privateDnsZone = new DnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  zoneType: 'Private',
  registrationVirtualNetworks: [
    { id: hubVnet.id },
  ],
  resolutionVirtualNetworks: [
    { id: spoke1Vnet.id },
    { id: spoke2Vnet.id },
  ],
});
```

### Tag Management

Add and remove tags programmatically:

```typescript
const dnsZone = new DnsZone(this, 'dns', {
  name: 'contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  tags: {
    environment: 'production',
  },
});

// Add a tag
dnsZone.addTag('owner', 'platform-team');

// Remove a tag
dnsZone.removeTag('environment');
```

## Outputs

The DNS Zone construct provides several outputs for use in other resources:

```typescript
// Resource ID
console.log(dnsZone.id);

// DNS Zone name
console.log(dnsZone.name);

// Location
console.log(dnsZone.location);

// Name servers (for domain registrar configuration)
console.log(dnsZone.nameServers);

// Maximum number of record sets
console.log(dnsZone.maxNumberOfRecordSets);

// Current number of record sets
console.log(dnsZone.numberOfRecordSets);

// Zone type
console.log(dnsZone.zoneType); // "Public" or "Private"

// Terraform outputs
dnsZone.idOutput;           // Terraform output for ID
dnsZone.nameOutput;         // Terraform output for name
dnsZone.nameServersOutput;  // Terraform output for name servers
```

## Configuring Your Domain

After creating a public DNS zone, you need to configure your domain registrar to use Azure DNS name servers:

1. Get the name servers from your DNS zone:
   ```typescript
   console.log(dnsZone.nameServers);
   ```

2. Update your domain's name server records at your registrar with the Azure DNS name servers (typically 4 name servers like `ns1-01.azure-dns.com`)

3. Wait for DNS propagation (can take up to 48 hours, but usually much faster)

4. Verify the delegation using DNS tools:
   ```bash
   nslookup -type=NS contoso.com
   ```

## Common Patterns

### Hub-Spoke Topology with Private DNS

```typescript
// Create hub virtual network and private DNS zone
const hubVnet = new VirtualNetwork(this, 'hub', {
  name: 'hub-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.0.0.0/16'],
});

const privateDnsZone = new DnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  zoneType: 'Private',
  registrationVirtualNetworks: [
    { id: hubVnet.id }
  ],
});

// Spoke networks can resolve DNS through peering
const spoke1Vnet = new VirtualNetwork(this, 'spoke1', {
  name: 'spoke1-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.1.0.0/16'],
});
```

### Multi-Environment DNS Strategy

```typescript
// Production
const prodDnsZone = new DnsZone(this, 'prodDns', {
  name: 'contoso.com',
  location: 'global',
  resourceGroupId: prodResourceGroup.id,
  tags: { environment: 'production' },
});

// Staging
const stagingDnsZone = new DnsZone(this, 'stagingDns', {
  name: 'staging.contoso.com',
  location: 'global',
  resourceGroupId: stagingResourceGroup.id,
  tags: { environment: 'staging' },
});

// Development
const devDnsZone = new DnsZone(this, 'devDns', {
  name: 'dev.contoso.com',
  location: 'global',
  resourceGroupId: devResourceGroup.id,
  tags: { environment: 'development' },
});
```

## Error Handling

The construct includes built-in validation:

```typescript
// Invalid domain name (will fail validation)
const dnsZone = new DnsZone(this, 'dns', {
  name: 'contoso.com.', // ❌ No terminating dot allowed
  location: 'global',
  resourceGroupId: resourceGroup.id,
});

// Valid domain name
const dnsZone = new DnsZone(this, 'dns', {
  name: 'contoso.com', // ✅ Correct format
  location: 'global',
  resourceGroupId: resourceGroup.id,
});
```

## Troubleshooting

### Name Server Propagation
If DNS queries aren't working:
1. Verify name servers are correctly configured at your registrar
2. Check DNS propagation: `dig NS contoso.com` or use online tools
3. Ensure sufficient time has passed for propagation (up to 48 hours)

### Private DNS Resolution
If private DNS isn't resolving:
1. Verify virtual network links are correctly configured
2. Check that VMs are using Azure DNS (168.63.129.16)
3. Ensure virtual network peering is properly set up
4. Verify NSG rules aren't blocking DNS traffic

### API Version Issues
If you encounter version-related errors:
1. Check supported API versions in this README
2. Consider pinning to a specific version
3. Review Azure DNS API documentation for breaking changes

## DNS Records

Public DNS zones support a comprehensive set of record types for Internet-accessible name resolution.

### Available Record Types

| Record Type | Class | Description |
|-------------|-------|-------------|
| A | `DnsARecord` | Maps hostname to IPv4 addresses |
| AAAA | `DnsAaaaRecord` | Maps hostname to IPv6 addresses |
| CAA | `DnsCaaRecord` | Certificate Authority Authorization (**Public DNS only**) |
| CNAME | `DnsCnameRecord` | Creates an alias to another hostname |
| MX | `DnsMxRecord` | Specifies mail exchange servers |
| NS | `DnsNsRecord` | Name server delegation (**Public DNS only**) |
| PTR | `DnsPtrRecord` | Reverse DNS lookup (IP to hostname) |
| SOA | `DnsSoaRecord` | Start of Authority record (zone metadata) |
| SRV | `DnsSrvRecord` | Service location records |
| TXT | `DnsTxtRecord` | Arbitrary text data (SPF, DKIM, verification, etc.) |

### Common Properties

All record types share these base properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Record name relative to zone (use `@` for apex) |
| `dnsZoneId` | string | Yes | - | Resource ID of the parent DNS Zone |
| `ttl` | number | No | 3600 | Time to Live in seconds |
| `metadata` | object | No | - | Key-value pairs for record metadata |

### A Record (IPv4)

Map a hostname to one or more IPv4 addresses:

```typescript
import { DnsARecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Simple A record with IP addresses
const webRecord = new DnsARecord(this, "web-a-record", {
  name: "www",
  dnsZoneId: dnsZone.id,
  ttl: 300,
  records: [
    { ipv4Address: "20.30.40.50" },
  ],
});

// A record with multiple IPs (round-robin DNS)
const apiRecord = new DnsARecord(this, "api-a-record", {
  name: "api",
  dnsZoneId: dnsZone.id,
  ttl: 300,
  records: [
    { ipv4Address: "20.30.40.51" },
    { ipv4Address: "20.30.40.52" },
  ],
});
```

#### Alias Records (Azure Resource Target)

Public DNS A records support alias records that point directly to Azure resources:

```typescript
import { DnsARecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";
import { PublicIpAddress } from "@microsoft/terraform-cdk-constructs/azure-publicipaddress";

// Create a public IP
const publicIp = new PublicIpAddress(this, "public-ip", {
  name: "web-ip",
  location: "eastus",
  resourceGroupId: resourceGroup.id,
  allocationMethod: "Static",
  sku: "Standard",
});

// Alias A record pointing to the public IP
const aliasRecord = new DnsARecord(this, "alias-a-record", {
  name: "www",
  dnsZoneId: dnsZone.id,
  ttl: 300,
  targetResourceId: publicIp.id,
});
```

> **Note**: Alias records automatically update when the target resource's IP changes.

### AAAA Record (IPv6)

Map a hostname to one or more IPv6 addresses:

```typescript
import { DnsAaaaRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

const ipv6Record = new DnsAaaaRecord(this, "web-aaaa-record", {
  name: "www",
  dnsZoneId: dnsZone.id,
  ttl: 300,
  records: [
    { ipv6Address: "2001:db8::1" },
  ],
});

// AAAA records also support alias records
const aliasIpv6 = new DnsAaaaRecord(this, "alias-aaaa-record", {
  name: "api",
  dnsZoneId: dnsZone.id,
  ttl: 300,
  targetResourceId: publicIpv6.id,
});
```

### CAA Record (Certificate Authority Authorization) - Public DNS Only

Specify which Certificate Authorities can issue certificates for your domain:

```typescript
import { DnsCaaRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

const caaRecord = new DnsCaaRecord(this, "caa-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    // Allow Let's Encrypt to issue certificates
    { flags: 0, tag: "issue", value: "letsencrypt.org" },
    // Allow DigiCert to issue certificates
    { flags: 0, tag: "issue", value: "digicert.com" },
    // Disallow wildcard certificates (only specific CAs)
    { flags: 0, tag: "issuewild", value: "letsencrypt.org" },
    // Report policy violations via email
    { flags: 0, tag: "iodef", value: "mailto:security@contoso.com" },
  ],
});
```

CAA record fields:
- `flags`: 0 = non-critical, 128 = critical (CA must understand the tag)
- `tag`: `issue` (standard certs), `issuewild` (wildcard certs), `iodef` (violation reporting)
- `value`: CA domain or reporting URI

### CNAME Record (Alias)

Create an alias from one hostname to another:

```typescript
import { DnsCnameRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Standard CNAME
const cnameRecord = new DnsCnameRecord(this, "app-cname", {
  name: "app",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  cname: "contoso.azurewebsites.net",
});

// CNAME alias record pointing to Azure resource
const aliasCname = new DnsCnameRecord(this, "cdn-cname", {
  name: "cdn",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  targetResourceId: cdnEndpoint.id,
});
```

> **Note**: CNAME records cannot coexist with other record types at the same name, and cannot be used at the zone apex (@).

### MX Record (Mail Exchange)

Configure mail servers for your domain:

```typescript
import { DnsMxRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Microsoft 365 mail configuration
const mxRecord = new DnsMxRecord(this, "mail-mx-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { preference: 0, exchange: "contoso-com.mail.protection.outlook.com" },
  ],
});

// Multiple mail servers with failover
const multiMx = new DnsMxRecord(this, "multi-mx-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { preference: 10, exchange: "mail1.contoso.com" },
    { preference: 20, exchange: "mail2.contoso.com" },
    { preference: 30, exchange: "mail-backup.contoso.com" },
  ],
});
```

Lower `preference` values indicate higher priority mail servers.

### NS Record (Name Server Delegation) - Public DNS Only

Delegate subdomains to other name servers:

```typescript
import { DnsNsRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Delegate subdomain to different name servers
const nsRecord = new DnsNsRecord(this, "subdomain-ns", {
  name: "subdomain",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { nsdname: "ns1.subdomain-dns.com" },
    { nsdname: "ns2.subdomain-dns.com" },
  ],
});
```

> **Note**: The apex (@) NS records are managed by Azure and cannot be modified.

### PTR Record (Reverse DNS)

Map IP addresses back to hostnames (used in reverse lookup zones):

```typescript
import { DnsPtrRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// For reverse zone like "40.30.20.in-addr.arpa"
const ptrRecord = new DnsPtrRecord(this, "ptr-record", {
  name: "50", // Represents 20.30.40.50
  dnsZoneId: reverseZone.id,
  ttl: 3600,
  records: [
    { ptrdname: "server1.contoso.com" },
  ],
});
```

### SRV Record (Service Location)

Specify service locations for protocols like SIP, LDAP, XMPP:

```typescript
import { DnsSrvRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Microsoft Teams/Skype for Business
const sipRecord = new DnsSrvRecord(this, "sip-srv-record", {
  name: "_sip._tls",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { priority: 100, weight: 1, port: 443, target: "sipdir.online.lync.com" },
  ],
});

// Federation SRV record
const sipFedRecord = new DnsSrvRecord(this, "sipfed-srv-record", {
  name: "_sipfederationtls._tcp",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { priority: 100, weight: 1, port: 5061, target: "sipfed.online.lync.com" },
  ],
});

// Custom service with load balancing
const customSrv = new DnsSrvRecord(this, "custom-srv-record", {
  name: "_myservice._tcp",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { priority: 10, weight: 60, port: 8080, target: "server1.contoso.com" },
    { priority: 10, weight: 40, port: 8080, target: "server2.contoso.com" },
    { priority: 20, weight: 0, port: 8080, target: "backup.contoso.com" },
  ],
});
```

SRV record fields:
- `priority`: Lower values are preferred (0-65535)
- `weight`: Load balancing among same-priority records (0-65535)
- `port`: TCP/UDP port number
- `target`: Hostname providing the service

### TXT Record (Text)

Store arbitrary text data for SPF, DKIM, domain verification, and more:

```typescript
import { DnsTxtRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// SPF record for email authentication
const spfRecord = new DnsTxtRecord(this, "spf-txt-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
  ],
});

// DKIM record for email signing
const dkimRecord = new DnsTxtRecord(this, "dkim-txt-record", {
  name: "selector1._domainkey",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4..."] },
  ],
});

// DMARC record for email policy
const dmarcRecord = new DnsTxtRecord(this, "dmarc-txt-record", {
  name: "_dmarc",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=DMARC1; p=quarantine; rua=mailto:dmarc@contoso.com"] },
  ],
});

// Domain verification records
const verifyRecord = new DnsTxtRecord(this, "verify-txt-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["google-site-verification=abc123..."] },
    { value: ["MS=ms12345678"] },
    { value: ["apple-domain-verification=xyz789..."] },
  ],
});
```

> **Note**: TXT record values are arrays of strings. Each string can be up to 255 characters; longer values are automatically split.

### SOA Record (Start of Authority)

Update the zone's SOA record (automatically created with the zone):

```typescript
import { DnsSoaRecord } from "@microsoft/terraform-cdk-constructs/azure-dnszone";

const soaRecord = new DnsSoaRecord(this, "soa-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  soaRecord: {
    email: "admin.contoso.com", // @ symbol replaced with .
    refreshTime: 3600,    // How often secondaries check for updates
    retryTime: 300,       // Retry interval if refresh fails
    expireTime: 2419200,  // When secondaries stop serving zone
    minimumTTL: 300,      // Minimum TTL for negative caching
  },
});
```

### Complete Email Configuration Example

Here's a complete example for setting up email (Microsoft 365):

```typescript
import {
  DnsZone,
  DnsMxRecord,
  DnsTxtRecord,
  DnsCnameRecord
} from "@microsoft/terraform-cdk-constructs/azure-dnszone";

// Create DNS zone
const dnsZone = new DnsZone(this, "dns-zone", {
  name: "contoso.com",
  location: "global",
  resourceGroupId: resourceGroup.id,
});

// MX record for mail routing
new DnsMxRecord(this, "mx-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { preference: 0, exchange: "contoso-com.mail.protection.outlook.com" },
  ],
});

// SPF record
new DnsTxtRecord(this, "spf-record", {
  name: "@",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
  ],
});

// Autodiscover for email client configuration
new DnsCnameRecord(this, "autodiscover-cname", {
  name: "autodiscover",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  cname: "autodiscover.outlook.com",
});

// DKIM selectors (values from Microsoft 365 admin)
new DnsCnameRecord(this, "dkim1-cname", {
  name: "selector1._domainkey",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  cname: "selector1-contoso-com._domainkey.contoso.onmicrosoft.com",
});

new DnsCnameRecord(this, "dkim2-cname", {
  name: "selector2._domainkey",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  cname: "selector2-contoso-com._domainkey.contoso.onmicrosoft.com",
});

// DMARC policy
new DnsTxtRecord(this, "dmarc-record", {
  name: "_dmarc",
  dnsZoneId: dnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=DMARC1; p=reject; rua=mailto:dmarc-reports@contoso.com; pct=100"] },
  ],
});
```

### Record Outputs

All record types provide common outputs:

```typescript
// Get the record ID
console.log(aRecord.id);

// Get the FQDN
console.log(aRecord.fqdn);

// Terraform outputs for use in other modules
aRecord.idOutput;
aRecord.nameOutput;
aRecord.fqdnOutput;
```

## Related Constructs

- **Private DNS Zone**: For internal name resolution within virtual networks
- **Virtual Network**: Required for private DNS zones
- **Resource Group**: Container for DNS zone resources
- **Public IP Address**: Can be targeted by alias A/AAAA records

## References

- [Azure DNS Documentation](https://docs.microsoft.com/azure/dns/)
- [Azure DNS REST API Reference](https://docs.microsoft.com/rest/api/dns/)
- [DNS Zone Best Practices](https://docs.microsoft.com/azure/dns/dns-best-practices)
- [Private DNS Documentation](https://docs.microsoft.com/azure/dns/private-dns-overview)