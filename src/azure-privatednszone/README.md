# Azure Private DNS Zone Construct (AZAPI)

This Construct represents a Private DNS Zone in Azure using the AZAPI provider for direct Azure REST API access.

## What is Azure Private DNS Zone?

Azure Private DNS provides a reliable and secure DNS service for your virtual networks. By using private DNS zones, you can use your own custom domain names rather than the Azure-provided names available today. Private DNS zones enable name resolution for virtual machines (VMs) within a virtual network and across virtual networks without needing to configure custom DNS servers.

**Key Features:**
- **Internal Name Resolution**: Resolve hostnames within and across Azure virtual networks
- **Custom Domain Names**: Use your own domain names for internal resources
- **No Custom DNS Required**: No need to manage custom DNS server infrastructure
- **Automatic Hostname Registration**: Optionally auto-register VM hostnames
- **Cross-VNet Resolution**: Enable DNS resolution across peered virtual networks
- **Secure and Private**: DNS records only accessible from linked virtual networks
- **High Availability**: Built on Azure's reliable DNS infrastructure

**Differences from Public DNS Zones:**
- Private DNS zones are **not** accessible from the Internet
- They provide name resolution **only** for linked virtual networks
- No need to configure name servers at a domain registrar
- Virtual network links are required for functionality
- Support for automatic VM hostname registration

You can learn more about Azure Private DNS in the [official Azure documentation](https://docs.microsoft.com/azure/dns/private-dns-overview).

## AZAPI Provider Benefits

This Private DNS Zone construct uses the AZAPI provider, which provides:

- **Direct Azure REST API Access**: No dependency on AzureRM provider limitations
- **Immediate Feature Access**: Get new Azure features as soon as they're available
- **Version-Specific Implementations**: Support for multiple API versions
- **Enhanced Type Safety**: Better IDE support and compile-time validation

## Best Practices

### Private DNS Zone Naming
- **Use internal domains**: Choose domain names that clearly indicate internal use (e.g., `internal.contoso.com`, `corp.contoso.local`)
- **Avoid public TLDs**: Don't use the same domain as your public DNS to prevent confusion
- **Plan for splits**: Consider split-brain DNS if you need both public and private zones

### Virtual Network Links
- **Link strategically**: Link private DNS zones to virtual networks that need name resolution
- **Enable auto-registration carefully**: Only enable hostname registration where appropriate
- **Consider hub-spoke**: In hub-spoke topologies, link to the hub and enable resolution via peering
- **Minimize links**: Each private DNS zone has a limit on virtual network links

### Security and Isolation
- **Use separate zones**: Create separate private DNS zones for different environments or tiers
- **Implement RBAC**: Control who can create and manage DNS records
- **Monitor changes**: Enable diagnostic logging to track DNS changes
- **Plan network topology**: Design DNS resolution strategy for complex network architectures

## Properties

This Construct supports the following properties:

### Required Properties
- **`name`**: (Required) The name of the Private DNS Zone (without a terminating dot). Must be a valid domain name.
- **`location`**: (Required) The Azure region (typically "global" for Private DNS zones as they are global resources)

### Optional Properties
- **`resourceGroupId`**: (Optional) The resource ID of the resource group where the Private DNS zone will be created
- **`tags`**: (Optional) Key-value pairs for resource tagging and organization
- **`ignoreChanges`**: (Optional) Lifecycle rules to ignore changes for specific properties
- **`apiVersion`**: (Optional) Explicit API version to use (defaults to latest: "2024-06-01")

### Read-Only Properties (Available as Outputs)
- **`maxNumberOfRecordSets`**: Maximum number of record sets that can be created
- **`numberOfRecordSets`**: Current number of record sets in the zone
- **`maxNumberOfVirtualNetworkLinks`**: Maximum number of virtual network links allowed
- **`numberOfVirtualNetworkLinks`**: Current number of virtual network links
- **`maxNumberOfVirtualNetworkLinksWithRegistration`**: Maximum VNet links with auto-registration
- **`numberOfVirtualNetworkLinksWithRegistration`**: Current VNet links with auto-registration
- **`provisioningState`**: Current provisioning state of the zone
- **`internalId`**: Internal identifier for the Private DNS zone

## Supported API Versions

| API Version | Status  | Features                                          |
|-------------|---------|---------------------------------------------------|
| 2024-06-01  | ✅ Latest | Full support for private DNS zones and VNet links |

## Basic Usage

### Simple Private DNS Zone

```typescript
import { PrivateDnsZone } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";
import { ResourceGroup } from "@microsoft/terraform-cdk-constructs/azure-resourcegroup";

// Create a resource group
const resourceGroup = new ResourceGroup(this, 'rg', {
  name: 'dns-rg',
  location: 'eastus',
});

// Create a private DNS zone
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  tags: {
    environment: 'production',
    service: 'dns',
  },
});
```

### Private DNS Zone with Virtual Network Link

**Note**: Virtual network links are managed as separate child resources (to be implemented). This example shows the Private DNS Zone creation, which is the prerequisite for adding virtual network links.

```typescript
import { PrivateDnsZone } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";
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

// Create the private DNS zone
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  tags: {
    environment: 'production',
    type: 'private',
  },
});

// Virtual network links will be added using a separate construct
// (PrivateDnsZoneVirtualNetworkLink - to be implemented)
```

## Advanced Features

### Version Pinning

Pin to a specific API version for stability:

```typescript
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  apiVersion: '2024-06-01', // Pin to specific version
});
```

### Ignore Changes

Prevent Terraform from detecting changes to specific properties:

```typescript
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  ignoreChanges: ['tags'], // Ignore tag changes
});
```

### Tag Management

Add and remove tags programmatically:

```typescript
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
  tags: {
    environment: 'production',
  },
});

// Add a tag
privateDnsZone.addTag('owner', 'platform-team');

// Remove a tag
privateDnsZone.removeTag('environment');
```

## Outputs

The Private DNS Zone construct provides several outputs for use in other resources:

```typescript
// Resource ID
console.log(privateDnsZone.id);

// Private DNS Zone name
console.log(privateDnsZone.name);

// Location
console.log(privateDnsZone.location);

// Read-only properties
console.log(privateDnsZone.maxNumberOfRecordSets);
console.log(privateDnsZone.numberOfRecordSets);
console.log(privateDnsZone.maxNumberOfVirtualNetworkLinks);
console.log(privateDnsZone.numberOfVirtualNetworkLinks);
console.log(privateDnsZone.maxNumberOfVirtualNetworkLinksWithRegistration);
console.log(privateDnsZone.numberOfVirtualNetworkLinksWithRegistration);
console.log(privateDnsZone.provisioningState);
console.log(privateDnsZone.internalId);

// Terraform outputs
privateDnsZone.idOutput;
privateDnsZone.nameOutput;
privateDnsZone.maxNumberOfRecordSetsOutput;
privateDnsZone.numberOfRecordSetsOutput;
privateDnsZone.maxNumberOfVirtualNetworkLinksOutput;
privateDnsZone.numberOfVirtualNetworkLinksOutput;
privateDnsZone.maxNumberOfVirtualNetworkLinksWithRegistrationOutput;
privateDnsZone.numberOfVirtualNetworkLinksWithRegistrationOutput;
privateDnsZone.provisioningStateOutput;
privateDnsZone.internalIdOutput;
```

## Common Patterns

### Hub-Spoke Topology with Private DNS

```typescript
// Create hub virtual network
const hubVnet = new VirtualNetwork(this, 'hub', {
  name: 'hub-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.0.0.0/16'],
});

// Create spoke virtual networks
const spoke1Vnet = new VirtualNetwork(this, 'spoke1', {
  name: 'spoke1-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.1.0.0/16'],
});

const spoke2Vnet = new VirtualNetwork(this, 'spoke2', {
  name: 'spoke2-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: ['10.2.0.0/16'],
});

// Create private DNS zone
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com',
  location: 'global',
  resourceGroupId: resourceGroup.id,
});

// Link to hub (with auto-registration) and spokes (resolution only)
// Virtual network links are created separately using PrivateDnsZoneVirtualNetworkLink
```

### Multi-Environment Private DNS Strategy

```typescript
// Production
const prodPrivateDnsZone = new PrivateDnsZone(this, 'prodPrivateDns', {
  name: 'prod.internal.contoso.com',
  location: 'global',
  resourceGroupId: prodResourceGroup.id,
  tags: { environment: 'production' },
});

// Staging
const stagingPrivateDnsZone = new PrivateDnsZone(this, 'stagingPrivateDns', {
  name: 'staging.internal.contoso.com',
  location: 'global',
  resourceGroupId: stagingResourceGroup.id,
  tags: { environment: 'staging' },
});

// Development
const devPrivateDnsZone = new PrivateDnsZone(this, 'devPrivateDns', {
  name: 'dev.internal.contoso.com',
  location: 'global',
  resourceGroupId: devResourceGroup.id,
  tags: { environment: 'development' },
});
```

### Shared Services Private DNS

```typescript
// Create a shared private DNS zone for common services
const sharedServicesDns = new PrivateDnsZone(this, 'sharedDns', {
  name: 'services.internal.contoso.com',
  location: 'global',
  resourceGroupId: sharedResourceGroup.id,
  tags: {
    purpose: 'shared-services',
    managed: 'platform-team',
  },
});

// Link to multiple virtual networks across subscriptions and regions
// (using PrivateDnsZoneVirtualNetworkLink constructs)
```

## Error Handling

The construct includes built-in validation:

```typescript
// Invalid domain name (will fail validation)
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com.', // ❌ No terminating dot allowed
  location: 'global',
  resourceGroupId: resourceGroup.id,
});

// Valid domain name
const privateDnsZone = new PrivateDnsZone(this, 'privateDns', {
  name: 'internal.contoso.com', // ✅ Correct format
  location: 'global',
  resourceGroupId: resourceGroup.id,
});
```

## Troubleshooting

### Private DNS Resolution Not Working
If private DNS isn't resolving:
1. Verify virtual network links are created and associated with the zone
2. Check that VMs are using Azure DNS (168.63.129.16) - this is default
3. Ensure virtual network peering is properly set up if using hub-spoke
4. Verify NSG rules aren't blocking DNS traffic (port 53)
5. Check that the private DNS zone is linked to the correct virtual networks

### Auto-Registration Issues
If VM hostnames aren't auto-registering:
1. Verify the virtual network link has auto-registration enabled
2. Ensure VMs are in a subnet of the linked virtual network
3. Check that VMs are using DHCP for their IP configuration
4. Restart the VM if necessary to trigger registration

### Resource Limits
If you hit limits:
1. Check the maximum number of record sets for your subscription
2. Review the maximum number of virtual network links allowed
3. Consider creating multiple private DNS zones if you hit limits
4. Contact Azure support if you need increased limits

### API Version Issues
If you encounter version-related errors:
1. Check supported API versions in this README
2. Consider pinning to a specific version
3. Review Azure Private DNS API documentation for breaking changes

## DNS Records

Private DNS zones support the following record types for internal name resolution:

### Available Record Types

| Record Type | Class | Description |
|-------------|-------|-------------|
| A | `PrivateDnsARecord` | Maps hostname to IPv4 addresses |
| AAAA | `PrivateDnsAaaaRecord` | Maps hostname to IPv6 addresses |
| CNAME | `PrivateDnsCnameRecord` | Creates an alias to another hostname |
| MX | `PrivateDnsMxRecord` | Specifies mail exchange servers |
| PTR | `PrivateDnsPtrRecord` | Reverse DNS lookup (IP to hostname) |
| SOA | `PrivateDnsSoaRecord` | Start of Authority record (zone metadata) |
| SRV | `PrivateDnsSrvRecord` | Service location records |
| TXT | `PrivateDnsTxtRecord` | Arbitrary text data (SPF, verification, etc.) |

### Common Properties

All record types share these base properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Record name relative to zone (use `@` for apex) |
| `privateDnsZoneId` | string | Yes | - | Resource ID of the parent Private DNS Zone |
| `ttl` | number | No | 3600 | Time to Live in seconds |
| `metadata` | object | No | - | Key-value pairs for record metadata |

### A Record (IPv4)

Map a hostname to one or more IPv4 addresses:

```typescript
import { PrivateDnsARecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

// Simple A record
const webRecord = new PrivateDnsARecord(this, "web-a-record", {
  name: "www",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 300,
  records: [
    { ipv4Address: "10.0.1.4" },
  ],
});

// A record with multiple IPs (round-robin)
const apiRecord = new PrivateDnsARecord(this, "api-a-record", {
  name: "api",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 300,
  records: [
    { ipv4Address: "10.0.1.10" },
    { ipv4Address: "10.0.1.11" },
    { ipv4Address: "10.0.1.12" },
  ],
});

// Apex record (zone root)
const apexRecord = new PrivateDnsARecord(this, "apex-a-record", {
  name: "@",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { ipv4Address: "10.0.1.100" },
  ],
});
```

### AAAA Record (IPv6)

Map a hostname to one or more IPv6 addresses:

```typescript
import { PrivateDnsAaaaRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

const ipv6Record = new PrivateDnsAaaaRecord(this, "web-aaaa-record", {
  name: "www",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 300,
  records: [
    { ipv6Address: "2001:db8::1" },
    { ipv6Address: "2001:db8::2" },
  ],
});
```

### CNAME Record (Alias)

Create an alias from one hostname to another:

```typescript
import { PrivateDnsCnameRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

// Alias 'app' to 'www'
const cnameRecord = new PrivateDnsCnameRecord(this, "app-cname", {
  name: "app",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  cname: "www.internal.contoso.com",
});
```

> **Note**: CNAME records cannot coexist with other record types at the same name.

### MX Record (Mail Exchange)

Configure mail servers for the domain:

```typescript
import { PrivateDnsMxRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

const mxRecord = new PrivateDnsMxRecord(this, "mail-mx-record", {
  name: "@",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { preference: 10, exchange: "mail1.internal.contoso.com" },
    { preference: 20, exchange: "mail2.internal.contoso.com" },
  ],
});
```

Lower `preference` values indicate higher priority mail servers.

### PTR Record (Reverse DNS)

Map IP addresses back to hostnames (used in reverse lookup zones):

```typescript
import { PrivateDnsPtrRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

// For reverse zone like "1.0.10.in-addr.arpa"
const ptrRecord = new PrivateDnsPtrRecord(this, "ptr-record", {
  name: "4", // Represents 10.0.1.4
  privateDnsZoneId: reverseZone.id,
  ttl: 3600,
  records: [
    { ptrdname: "server1.internal.contoso.com" },
  ],
});
```

### SRV Record (Service Location)

Specify service locations for protocols like SIP, LDAP, XMPP:

```typescript
import { PrivateDnsSrvRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

// SIP service over TCP
const sipRecord = new PrivateDnsSrvRecord(this, "sip-srv-record", {
  name: "_sip._tcp",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { priority: 10, weight: 60, port: 5060, target: "sipserver1.internal.contoso.com" },
    { priority: 10, weight: 40, port: 5060, target: "sipserver2.internal.contoso.com" },
    { priority: 20, weight: 0, port: 5060, target: "sipbackup.internal.contoso.com" },
  ],
});

// LDAP service
const ldapRecord = new PrivateDnsSrvRecord(this, "ldap-srv-record", {
  name: "_ldap._tcp",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { priority: 0, weight: 100, port: 389, target: "dc1.internal.contoso.com" },
  ],
});
```

SRV record fields:
- `priority`: Lower values are preferred (0-65535)
- `weight`: Load balancing among same-priority records (0-65535)
- `port`: TCP/UDP port number
- `target`: Hostname providing the service

### TXT Record (Text)

Store arbitrary text data, commonly used for SPF, DKIM, and verification:

```typescript
import { PrivateDnsTxtRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

// SPF record for email authentication
const spfRecord = new PrivateDnsTxtRecord(this, "spf-txt-record", {
  name: "@",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=spf1 include:_spf.internal.contoso.com -all"] },
  ],
});

// DKIM record for email signing
const dkimRecord = new PrivateDnsTxtRecord(this, "dkim-txt-record", {
  name: "selector1._domainkey",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { value: ["v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4..."] },
  ],
});

// Service verification
const verificationRecord = new PrivateDnsTxtRecord(this, "verify-txt-record", {
  name: "@",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  records: [
    { value: ["google-site-verification=abc123..."] },
    { value: ["MS=ms12345678"] },
  ],
});
```

> **Note**: TXT record values are arrays of strings. Each string can be up to 255 characters; longer values are automatically split.

### SOA Record (Start of Authority)

Update the zone's SOA record (automatically created with the zone):

```typescript
import { PrivateDnsSoaRecord } from "@microsoft/terraform-cdk-constructs/azure-privatednszone";

const soaRecord = new PrivateDnsSoaRecord(this, "soa-record", {
  name: "@",
  privateDnsZoneId: privateDnsZone.id,
  ttl: 3600,
  soaRecord: {
    email: "admin.contoso.com", // @ symbol replaced with .
    refreshTime: 3600,    // How often secondaries check for updates
    retryTime: 300,       // Retry interval if refresh fails
    expireTime: 2419200,  // When secondaries stop serving zone
    minimumTtl: 300,      // Minimum TTL for negative caching
  },
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

- **Private DNS Zone Virtual Network Link**: Link private DNS zones to virtual networks
- **Virtual Network**: Required for private DNS zone functionality
- **Resource Group**: Container for private DNS zone resources

## Comparison with Public DNS Zones

| Feature | Private DNS Zone | Public DNS Zone |
|---------|------------------|-----------------|
| **Accessibility** | Only from linked VNets | Internet-accessible |
| **Name Servers** | Azure-managed (automatic) | Must configure at registrar |
| **Use Case** | Internal applications | Public-facing services |
| **VNet Links** | Required for functionality | Not applicable |
| **Auto-Registration** | Supported | Not supported |
| **Record Types** | A, AAAA, CNAME, MX, PTR, SOA, SRV, TXT | All standard DNS record types |

## References

- [Azure Private DNS Documentation](https://docs.microsoft.com/azure/dns/private-dns-overview)
- [Private DNS REST API Reference](https://docs.microsoft.com/rest/api/dns/privatedns)
- [Private DNS Best Practices](https://docs.microsoft.com/azure/dns/private-dns-scenarios)
- [Azure DNS Private Resolver](https://docs.microsoft.com/azure/dns/dns-private-resolver-overview)
- [Virtual Network DNS Settings](https://docs.microsoft.com/azure/virtual-network/virtual-networks-name-resolution-for-vms-and-role-instances)