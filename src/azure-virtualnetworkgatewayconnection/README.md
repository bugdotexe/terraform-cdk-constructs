# Azure Virtual Network Gateway Connection Construct

This construct provides a CDK for Terraform (CDKTF) implementation of Azure Virtual Network Gateway Connection using the AzapiResource framework.

## Overview

Azure Virtual Network Gateway Connection establishes connectivity between Virtual Network Gateways and other networking endpoints. It supports three connection types:

- **IPsec (Site-to-Site)**: Connect VPN Gateway to on-premises networks via Local Network Gateway
- **VNet-to-VNet**: Connect two Azure virtual networks via their VPN Gateways
- **ExpressRoute**: Connect ExpressRoute Gateway to ExpressRoute circuits for private connectivity

## Features

- ✅ Automatic latest API version resolution
- ✅ Explicit version pinning for stability
- ✅ Schema-driven validation and transformation
- ✅ Type-safe discriminated unions for connection types
- ✅ Full backward compatibility
- ✅ JSII compliance for multi-language support
- ✅ Comprehensive TypeScript type definitions

## Supported API Versions

- `2024-01-01` (Active)
- `2024-05-01` (Active, Latest - Default)

## Installation

```bash
npm install @cdktf-constructs/azure-virtualnetworkgatewayconnection
```

## Basic Usage

### Site-to-Site (IPsec) Connection

```typescript
import { VirtualNetworkGatewayConnection } from '@cdktf-constructs/azure-virtualnetworkgatewayconnection';
import { ResourceGroup } from '@cdktf-constructs/azure-resourcegroup';

// Create resource group
const resourceGroup = new ResourceGroup(this, 'rg', {
  name: 'rg-network',
  location: 'eastus',
});

// Create Site-to-Site VPN connection
const s2sConnection = new VirtualNetworkGatewayConnection(this, 's2s-connection', {
  name: 'conn-onprem',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'IPsec',
  virtualNetworkGateway1: {
    id: vpnGateway.id  // Your VPN Gateway
  },
  localNetworkGateway2: {
    id: localGateway.id  // Your Local Network Gateway
  },
  sharedKey: 'YourSecureSharedKey123!',
  tags: {
    environment: 'production'
  }
});
```

### VNet-to-VNet Connection

```typescript
const vnetConnection = new VirtualNetworkGatewayConnection(this, 'vnet-connection', {
  name: 'conn-vnet-to-vnet',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'Vnet2Vnet',
  virtualNetworkGateway1: {
    id: vpnGateway1.id
  },
  virtualNetworkGateway2: {
    id: vpnGateway2.id
  },
  sharedKey: 'YourSecureSharedKey123!',
  enableBgp: true,
  tags: {
    environment: 'production',
    purpose: 'vnet-peering'
  }
});
```

### ExpressRoute Connection

```typescript
const erConnection = new VirtualNetworkGatewayConnection(this, 'er-connection', {
  name: 'conn-expressroute',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'ExpressRoute',
  virtualNetworkGateway1: {
    id: erGateway.id
  },
  peer: {
    id: expressRouteCircuit.id
  },
  authorizationKey: 'optional-if-cross-subscription',
  tags: {
    environment: 'production',
    purpose: 'expressroute'
  }
});
```

## Advanced Configuration

### IPsec Connection with Custom Policies

```typescript
const customConnection = new VirtualNetworkGatewayConnection(this, 'custom-ipsec', {
  name: 'conn-custom-ipsec',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'IPsec',
  virtualNetworkGateway1: {
    id: vpnGateway.id
  },
  localNetworkGateway2: {
    id: localGateway.id
  },
  sharedKey: 'YourSecureSharedKey123!',
  connectionProtocol: 'IKEv2',
  ipsecPolicies: [{
    dhGroup: 'DHGroup14',
    ikeEncryption: 'AES256',
    ikeIntegrity: 'SHA256',
    ipsecEncryption: 'AES256',
    ipsecIntegrity: 'SHA256',
    pfsGroup: 'PFS2048',
    saLifeTimeSeconds: 3600,
    saDataSizeKilobytes: 102400000
  }],
  usePolicyBasedTrafficSelectors: true,
  dpdTimeoutSeconds: 45
});
```

### Connection with BGP and Routing Configuration

```typescript
const bgpConnection = new VirtualNetworkGatewayConnection(this, 'bgp-connection', {
  name: 'conn-bgp',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'Vnet2Vnet',
  virtualNetworkGateway1: {
    id: vpnGateway1.id
  },
  virtualNetworkGateway2: {
    id: vpnGateway2.id
  },
  sharedKey: 'YourSecureSharedKey123!',
  enableBgp: true,
  routingWeight: 10,
  connectionMode: 'Default'
});
```

### Connection with NAT Rules

```typescript
const natConnection = new VirtualNetworkGatewayConnection(this, 'nat-connection', {
  name: 'conn-nat',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  connectionType: 'IPsec',
  virtualNetworkGateway1: {
    id: vpnGateway.id
  },
  localNetworkGateway2: {
    id: localGateway.id
  },
  sharedKey: 'YourSecureSharedKey123!',
  egressNatRules: [{
    id: `${vpnGateway.id}/natRules/egress-rule`
  }],
  ingressNatRules: [{
    id: `${vpnGateway.id}/natRules/ingress-rule`
  }]
});
```

## Configuration Options

### VirtualNetworkGatewayConnectionProps

#### Base Properties (All Connection Types)

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | Yes | - | Name of the connection |
| `location` | string | Yes | - | Azure region |
| `resourceGroupId` | string | Yes | - | Resource group ID |
| `connectionType` | "IPsec" \| "Vnet2Vnet" \| "ExpressRoute" | Yes | - | Type of connection |
| `virtualNetworkGateway1` | GatewayReference | Yes | - | First virtual network gateway |
| `connectionProtocol` | "IKEv2" \| "IKEv1" | No | "IKEv2" | Connection protocol |
| `enableBgp` | boolean | No | false | Enable BGP |
| `routingWeight` | number | No | - | Routing weight |
| `dpdTimeoutSeconds` | number | No | - | DPD timeout in seconds |
| `ipsecPolicies` | IpsecPolicy[] | No | - | Custom IPsec policies |
| `usePolicyBasedTrafficSelectors` | boolean | No | false | Use policy-based traffic selectors |
| `connectionMode` | "Default" \| "ResponderOnly" \| "InitiatorOnly" | No | "Default" | Connection mode |
| `egressNatRules` | NatRuleReference[] | No | - | Egress NAT rules |
| `ingressNatRules` | NatRuleReference[] | No | - | Ingress NAT rules |
| `tags` | Record<string, string> | No | {} | Resource tags |
| `apiVersion` | string | No | "2024-05-01" | API version to use |
| `ignoreChanges` | string[] | No | [] | Properties to ignore |

#### IPsec Connection (Site-to-Site) Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `localNetworkGateway2` | GatewayReference | Yes | Local network gateway reference |
| `sharedKey` | string | Yes | Shared key for the connection |

#### Vnet2Vnet Connection Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `virtualNetworkGateway2` | GatewayReference | Yes | Second virtual network gateway |
| `sharedKey` | string | Yes | Shared key for the connection |

#### ExpressRoute Connection Specific

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `peer` | PeerReference | Yes | ExpressRoute circuit reference |
| `authorizationKey` | string | No | Authorization key (for cross-subscription) |

### IPsec Policy Configuration

```typescript
interface IpsecPolicy {
  dhGroup: string;              // DHGroup14, DHGroup2048, ECP256, ECP384
  ikeEncryption: string;        // AES128, AES192, AES256, GCMAES128, GCMAES256
  ikeIntegrity: string;         // SHA256, SHA384, GCMAES128, GCMAES256
  ipsecEncryption: string;      // AES128, AES192, AES256, GCMAES128, GCMAES192, GCMAES256
  ipsecIntegrity: string;       // SHA256, GCMAES128, GCMAES192, GCMAES256
  pfsGroup: string;             // None, PFS1, PFS2, PFS2048, ECP256, ECP384, PFS24, PFS14, PFSMM
  saLifeTimeSeconds: number;    // e.g., 3600
  saDataSizeKilobytes: number;  // e.g., 102400000
}
```

## Important Notes

### Connection Type Requirements

#### IPsec (Site-to-Site)
- Requires a VPN Gateway (`gatewayType: "Vpn"`)
- Requires a Local Network Gateway representing on-premises network
- Requires a shared key
- Typically uses IKEv2 protocol
- Can use custom IPsec policies

#### VNet-to-VNet
- Requires two VPN Gateways in different virtual networks
- Both gateways must be route-based VPN gateways
- Requires a shared key (must match on both sides)
- Can enable BGP for dynamic routing
- Faster than VNet peering for encrypted traffic

#### ExpressRoute
- Requires an ExpressRoute Gateway (`gatewayType: "ExpressRoute"`)
- Requires a provisioned ExpressRoute circuit
- Optional authorization key for cross-subscription scenarios
- Does not use shared keys or IPsec
- Provides private, dedicated connectivity

### Deployment Time

- **Connection Provisioning**: Typically 5-10 minutes
- **Gateway Provisioning** (prerequisite): 30-45 minutes per gateway
- Plan accordingly in CI/CD pipelines

### Shared Keys

- Must be strong and unique
- Must match on both ends for IPsec and VNet-to-VNet
- Store securely (use Azure Key Vault in production)
- Can be rotated without recreating the connection

### BGP Configuration

- Available for IPsec and VNet-to-VNet connections
- Required for ExpressRoute connections
- Enables dynamic routing and automatic failover
- ASN must be coordinated between endpoints

### Connection Modes

- **Default**: Standard bidirectional connection
- **ResponderOnly**: Connection only accepts incoming requests
- **InitiatorOnly**: Connection only initiates outgoing requests
- Useful for specific security requirements

## Outputs

The construct provides the following outputs:

```typescript
connection.id              // Connection resource ID
connection.name            // Connection name
connection.location        // Connection location
connection.resourceId      // Alias for id
connection.subscriptionId  // Extracted subscription ID
```

## API Version Support

To use a specific API version:

```typescript
const connection = new VirtualNetworkGatewayConnection(this, 'connection', {
  apiVersion: '2024-01-01',
  // ... other properties
});
```

## Related Resources

- [Azure Virtual Network Gateway](../azure-virtualnetworkgateway)
- [Azure Resource Group](../azure-resourcegroup)
- [Azure Virtual Network](../azure-virtualnetwork)

## Azure Documentation

- [VPN Gateway Connections Overview](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#connection)
- [Site-to-Site Connections](https://learn.microsoft.com/en-us/azure/vpn-gateway/tutorial-site-to-site-portal)
- [VNet-to-VNet Connections](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-howto-vnet-vnet-resource-manager-portal)
- [ExpressRoute Connections](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-howto-linkvnet-portal-resource-manager)
- [IPsec/IKE Policy](https://learn.microsoft.com/en-us/azure/vpn-gateway/ipsec-ike-policy-howto)

## License

This construct is part of the CDKTF Azure Constructs library.
