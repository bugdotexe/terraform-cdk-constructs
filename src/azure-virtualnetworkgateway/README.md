# Azure Virtual Network Gateway Construct

This construct provides a CDK for Terraform (CDKTF) implementation of Azure Virtual Network Gateway using the AzapiResource framework.

## Overview

Azure Virtual Network Gateway is used to send encrypted traffic between Azure virtual networks and on-premises locations over the public Internet (VPN Gateway) or through Azure ExpressRoute circuits (ExpressRoute Gateway).

This construct supports:
- **VPN Gateways**: Site-to-Site, Point-to-Site, and VNet-to-VNet connections
- **ExpressRoute Gateways**: Private connections to Azure through ExpressRoute circuits
- **BGP Support**: Border Gateway Protocol for dynamic routing
- **Active-Active Mode**: High availability with dual gateway instances
- **Multiple SKUs**: From Basic to high-performance VpnGw5/ErGw3AZ

## Features

- ✅ Automatic latest API version resolution
- ✅ Explicit version pinning for stability
- ✅ Schema-driven validation and transformation
- ✅ Full backward compatibility
- ✅ JSII compliance for multi-language support
- ✅ Comprehensive TypeScript type definitions

## Supported API Versions

- `2024-01-01` (Active)
- `2024-05-01` (Active, Latest - Default)

## Installation

```bash
npm install @cdktf-constructs/azure-virtualnetworkgateway
```

## Basic Usage

### Simple VPN Gateway

```typescript
import { VirtualNetworkGateway } from '@cdktf-constructs/azure-virtualnetworkgateway';
import { ResourceGroup } from '@cdktf-constructs/azure-resourcegroup';
import { VirtualNetwork } from '@cdktf-constructs/azure-virtualnetwork';
import { Subnet } from '@cdktf-constructs/azure-subnet';
import { PublicIPAddress } from '@cdktf-constructs/azure-publicipaddress';

// Create resource group
const resourceGroup = new ResourceGroup(this, 'rg', {
  name: 'rg-network',
  location: 'eastus',
});

// Create virtual network
const vnet = new VirtualNetwork(this, 'vnet', {
  name: 'vnet-main',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  addressSpace: {
    addressPrefixes: ['10.0.0.0/16']
  },
});

// Create GatewaySubnet (must be named "GatewaySubnet")
const gatewaySubnet = new Subnet(this, 'gateway-subnet', {
  name: 'GatewaySubnet',
  virtualNetworkId: vnet.id,
  addressPrefix: '10.0.1.0/24',
});

// Create public IP for gateway
const publicIp = new PublicIPAddress(this, 'pip', {
  name: 'pip-gateway',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  sku: {
    name: 'Standard',
    tier: 'Regional'
  },
  publicIPAllocationMethod: 'Static',
});

// Create VPN Gateway
const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway', {
  name: 'vng-main',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'Vpn',
  vpnType: 'RouteBased',
  sku: {
    name: 'VpnGw1',
    tier: 'VpnGw1'
  },
  ipConfigurations: [{
    name: 'default',
    subnetId: gatewaySubnet.id,
    publicIPAddressId: publicIp.id
  }]
});
```

### VPN Gateway with BGP

```typescript
const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway-bgp', {
  name: 'vng-bgp',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'Vpn',
  vpnType: 'RouteBased',
  sku: {
    name: 'VpnGw1',
    tier: 'VpnGw1'
  },
  enableBgp: true,
  bgpSettings: {
    asn: 65515,
    peerWeight: 0
  },
  ipConfigurations: [{
    name: 'default',
    subnetId: gatewaySubnet.id,
    publicIPAddressId: publicIp.id
  }],
  tags: {
    environment: 'production',
    purpose: 'site-to-site-vpn'
  }
});
```

### Active-Active VPN Gateway

```typescript
// Create second public IP for active-active
const publicIp2 = new PublicIPAddress(this, 'pip2', {
  name: 'pip-gateway-2',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  sku: {
    name: 'Standard',
    tier: 'Regional'
  },
  publicIPAllocationMethod: 'Static',
});

const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway-aa', {
  name: 'vng-active-active',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'Vpn',
  vpnType: 'RouteBased',
  sku: {
    name: 'VpnGw1',
    tier: 'VpnGw1'
  },
  activeActive: true,
  ipConfigurations: [
    {
      name: 'config1',
      subnetId: gatewaySubnet.id,
      publicIPAddressId: publicIp.id
    },
    {
      name: 'config2',
      subnetId: gatewaySubnet.id,
      publicIPAddressId: publicIp2.id
    }
  ]
});
```

### Point-to-Site VPN Gateway

```typescript
const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway-p2s', {
  name: 'vng-point-to-site',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'Vpn',
  vpnType: 'RouteBased',
  sku: {
    name: 'VpnGw1',
    tier: 'VpnGw1'
  },
  ipConfigurations: [{
    name: 'default',
    subnetId: gatewaySubnet.id,
    publicIPAddressId: publicIp.id
  }],
  vpnClientConfiguration: {
    vpnClientAddressPool: {
      addressPrefixes: ['172.16.0.0/24']
    },
    vpnClientProtocols: ['IkeV2', 'OpenVPN'],
    vpnClientRootCertificates: [
      {
        name: 'RootCert',
        publicCertData: 'MIIC5zCCAc+gAwIBAgI...' // Your certificate data
      }
    ]
  }
});
```

### ExpressRoute Gateway

```typescript
const erGateway = new VirtualNetworkGateway(this, 'er-gateway', {
  name: 'vng-expressroute',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'ExpressRoute',
  sku: {
    name: 'ErGw1AZ',
    tier: 'ErGw1AZ'
  },
  ipConfigurations: [{
    name: 'default',
    subnetId: gatewaySubnet.id,
    publicIPAddressId: publicIp.id
  }],
  tags: {
    environment: 'production',
    purpose: 'expressroute'
  }
});
```

### Generation 2 VPN Gateway

```typescript
const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway-gen2', {
  name: 'vng-generation2',
  location: 'eastus',
  resourceGroupId: resourceGroup.id,
  gatewayType: 'Vpn',
  vpnType: 'RouteBased',
  sku: {
    name: 'VpnGw2',
    tier: 'VpnGw2'
  },
  vpnGatewayGeneration: 'Generation2',
  ipConfigurations: [{
    name: 'default',
    subnetId: gatewaySubnet.id,
    publicIPAddressId: publicIp.id
  }]
});
```

## Configuration Options

### VirtualNetworkGatewayProps

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `name` | string | No | CDK ID | Name of the virtual network gateway |
| `location` | string | Yes | - | Azure region |
| `gatewayType` | "Vpn" \| "ExpressRoute" | Yes | - | Type of gateway |
| `vpnType` | "RouteBased" \| "PolicyBased" | No | "RouteBased" | VPN routing type |
| `sku` | VirtualNetworkGatewaySku | Yes | - | Gateway SKU configuration |
| `ipConfigurations` | VirtualNetworkGatewayIpConfiguration[] | Yes | - | IP configurations (1 or 2) |
| `enableBgp` | boolean | No | false | Enable BGP |
| `activeActive` | boolean | No | false | Enable active-active mode |
| `bgpSettings` | VirtualNetworkGatewayBgpSettings | No | - | BGP configuration |
| `vpnGatewayGeneration` | string | No | - | Gateway generation (Gen1/Gen2) |
| `vpnClientConfiguration` | VirtualNetworkGatewayVpnClientConfiguration | No | - | Point-to-site config |
| `customRoutes` | VirtualNetworkGatewayCustomRoutes | No | - | Custom routing |
| `enablePrivateIpAddress` | boolean | No | false | Enable private IP |
| `gatewayDefaultSite` | VirtualNetworkGatewayDefaultSite | No | - | Default site for tunneling |
| `resourceGroupId` | string | No | - | Resource group ID |
| `tags` | Record<string, string> | No | {} | Resource tags |
| `apiVersion` | string | No | "2024-05-01" | API version to use |
| `ignoreChanges` | string[] | No | [] | Properties to ignore |

### SKU Options

#### VPN Gateway SKUs
- `Basic`: Legacy SKU (limited features)
- `VpnGw1`, `VpnGw2`, `VpnGw3`: Generation 1
- `VpnGw1AZ`, `VpnGw2AZ`, `VpnGw3AZ`: Zone-redundant Generation 1
- `VpnGw4`, `VpnGw5`: Generation 2 high-performance
- `VpnGw4AZ`, `VpnGw5AZ`: Zone-redundant Generation 2

#### ExpressRoute Gateway SKUs
- `Standard`, `HighPerformance`, `UltraPerformance`: Classic SKUs
- `ErGw1AZ`, `ErGw2AZ`, `ErGw3AZ`: Zone-redundant SKUs

## Important Notes

### Provisioning Time

- **Provisioning Time**: VPN and ExpressRoute gateways typically take 30-45 minutes to provision. The construct is configured with 60-minute timeouts to accommodate this.

### GatewaySubnet Requirements

1. **Name**: The subnet MUST be named exactly "GatewaySubnet"
2. **Size**: Minimum /29, recommended /27 or larger
3. **Delegation**: Must not be delegated to any service
4. **NSG**: Network Security Groups are not recommended on GatewaySubnet

### Deployment Time

- **VPN Gateways**: 30-45 minutes to deploy
- **ExpressRoute Gateways**: 30-45 minutes to deploy
- Plan accordingly in CI/CD pipelines

### Active-Active Mode

- Requires 2 IP configurations
- Requires 2 public IP addresses
- Both configurations must reference the same GatewaySubnet
- Only supported with VpnGw1 or higher SKUs

### BGP Configuration

- Required for ExpressRoute
- Recommended for Site-to-Site VPN with dynamic routing
- Not supported with Basic SKU
- ASN must be valid (not 65515 for on-premises)

## Outputs

The construct provides the following outputs:

```typescript
vpnGateway.id              // Gateway resource ID
vpnGateway.name            // Gateway name
vpnGateway.location        // Gateway location
vpnGateway.resourceId      // Alias for id
vpnGateway.subscriptionId  // Extracted subscription ID
```

## API Version Support

To use a specific API version:

```typescript
const vpnGateway = new VirtualNetworkGateway(this, 'vpn-gateway', {
  apiVersion: '2024-01-01',
  // ... other properties
});
```

## Related Resources

- [Azure Resource Group](../azure-resourcegroup)
- [Azure Virtual Network](../azure-virtualnetwork)
- [Azure Subnet](../azure-subnet)
- [Azure Public IP Address](../azure-publicipaddress)

## Azure Documentation

- [Virtual Network Gateway Overview](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpngateways)
- [VPN Gateway SKUs](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-about-vpn-gateway-settings#gwsku)
- [ExpressRoute Gateways](https://learn.microsoft.com/en-us/azure/expressroute/expressroute-about-virtual-network-gateways)
- [BGP Configuration](https://learn.microsoft.com/en-us/azure/vpn-gateway/vpn-gateway-bgp-overview)
- [Point-to-Site VPN](https://learn.microsoft.com/en-us/azure/vpn-gateway/point-to-site-about)

## License

This construct is part of the CDKTF Azure Constructs library.
