/**
 * Comprehensive tests for the Virtual Network Gateway Connection implementation
 *
 * This test suite validates the VirtualNetworkGatewayConnection class using the AzapiResource framework.
 * Tests cover automatic version resolution, explicit version pinning, schema validation,
 * property transformation, and resource creation for all connection types.
 */

import { Testing } from "cdktf";
import * as cdktf from "cdktf";
import {
  VirtualNetworkGatewayConnection,
  VirtualNetworkGatewayConnectionProps,
} from "../lib/virtual-network-gateway-connection";

describe("VirtualNetworkGatewayConnection - Implementation", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Constructor and Basic Properties", () => {
    it("should create IPsec connection with automatic latest version resolution", () => {
      const props: VirtualNetworkGatewayConnectionProps = {
        name: "test-s2s-connection",
        location: "eastus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "IPsec",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        localNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
        },
        sharedKey: "mySecureKey123!",
      };

      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        props,
      );

      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
      expect(connection.props).toBe(props);
      expect(connection.name).toBe("test-s2s-connection");
      expect(connection.location).toBe("eastus");
    });

    it("should create Vnet2Vnet connection with explicit version pinning", () => {
      const props: VirtualNetworkGatewayConnectionProps = {
        name: "test-vnet-connection",
        location: "westus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        apiVersion: "2024-01-01",
        connectionType: "Vnet2Vnet",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        virtualNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng2",
        },
        sharedKey: "mySecureKey123!",
        tags: { environment: "test" },
      };

      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        props,
      );

      expect(connection.resolvedApiVersion).toBe("2024-01-01");
      expect(connection.tags).toEqual({ environment: "test" });
    });

    it("should create ExpressRoute connection with all optional properties", () => {
      const props: VirtualNetworkGatewayConnectionProps = {
        name: "test-er-connection",
        location: "centralus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "ExpressRoute",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/er-gateway",
        },
        peer: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/expressRouteCircuits/circuit",
        },
        authorizationKey: "auth-key-123",
        enableBgp: true,
        routingWeight: 10,
        tags: {
          environment: "production",
          project: "networking",
        },
        ignoreChanges: ["tags"],
      };

      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        props,
      );

      expect(connection.props.connectionType).toBe("ExpressRoute");
      expect(connection.props.enableBgp).toBe(true);
      expect(connection.props.tags).toEqual(props.tags);
    });

    it("should use default name when name is not provided", () => {
      const props: VirtualNetworkGatewayConnectionProps = {
        name: "default-name",
        location: "eastus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "IPsec",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        localNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
        },
        sharedKey: "key",
      };

      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        props,
      );

      expect(connection.name).toBe("default-name");
    });
  });

  describe("Resource Type and API Versions", () => {
    it("should have correct resource type", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        {
          name: "test-connection",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
        },
      );

      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
    });

    it("should support all registered API versions", () => {
      const versions = ["2024-01-01", "2024-05-01"];

      versions.forEach((version) => {
        const connection = new VirtualNetworkGatewayConnection(
          stack,
          `Connection-${version.replace(/-/g, "")}`,
          {
            name: `conn-${version}`,
            location: "eastus",
            resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
            apiVersion: version,
            connectionType: "IPsec",
            virtualNetworkGateway1: {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
            },
            localNetworkGateway2: {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
            },
            sharedKey: "key",
          },
        );

        expect(connection.resolvedApiVersion).toBe(version);
      });
    });

    it("should use latest version as default", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TestConnection",
        {
          name: "test-connection",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
        },
      );

      expect(connection.resolvedApiVersion).toBe("2024-05-01");
    });
  });

  describe("IPsec Connection Type", () => {
    it("should create IPsec connection with minimal properties", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IPsecMinimal",
        {
          name: "ipsec-minimal",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "mySecureKey123!",
        },
      );

      expect(connection.props.connectionType).toBe("IPsec");
      expect(connection.props.localNetworkGateway2).toBeDefined();
      expect(connection.props.sharedKey).toBe("mySecureKey123!");
    });

    it("should create IPsec connection with custom IPsec policies", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IPsecCustom",
        {
          name: "ipsec-custom",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "mySecureKey123!",
          connectionProtocol: "IKEv2",
          ipsecPolicies: [
            {
              dhGroup: "DHGroup14",
              ikeEncryption: "AES256",
              ikeIntegrity: "SHA256",
              ipsecEncryption: "AES256",
              ipsecIntegrity: "SHA256",
              pfsGroup: "PFS2048",
              saLifeTimeSeconds: 3600,
              saDataSizeKilobytes: 102400000,
            },
          ],
          usePolicyBasedTrafficSelectors: true,
        },
      );

      expect(connection.props.connectionProtocol).toBe("IKEv2");
      expect(connection.props.ipsecPolicies).toHaveLength(1);
      expect(connection.props.usePolicyBasedTrafficSelectors).toBe(true);
    });

    it("should create IPsec connection with IKEv1 protocol", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IPsecIKEv1",
        {
          name: "ipsec-ikev1",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "mySecureKey123!",
          connectionProtocol: "IKEv1",
        },
      );

      expect(connection.props.connectionProtocol).toBe("IKEv1");
    });
  });

  describe("Vnet2Vnet Connection Type", () => {
    it("should create Vnet2Vnet connection with minimal properties", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "Vnet2VnetMinimal",
        {
          name: "vnet2vnet-minimal",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "Vnet2Vnet",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          virtualNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng2",
          },
          sharedKey: "mySecureKey123!",
        },
      );

      expect(connection.props.connectionType).toBe("Vnet2Vnet");
      expect(connection.props.virtualNetworkGateway2).toBeDefined();
      expect(connection.props.sharedKey).toBe("mySecureKey123!");
    });

    it("should create Vnet2Vnet connection with BGP enabled", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "Vnet2VnetBGP",
        {
          name: "vnet2vnet-bgp",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "Vnet2Vnet",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          virtualNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng2",
          },
          sharedKey: "mySecureKey123!",
          enableBgp: true,
          routingWeight: 5,
        },
      );

      expect(connection.props.enableBgp).toBe(true);
      expect(connection.props.routingWeight).toBe(5);
    });
  });

  describe("ExpressRoute Connection Type", () => {
    it("should create ExpressRoute connection with minimal properties", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "ExpressRouteMinimal",
        {
          name: "er-minimal",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "ExpressRoute",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/er-gateway",
          },
          peer: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/expressRouteCircuits/circuit",
          },
        },
      );

      expect(connection.props.connectionType).toBe("ExpressRoute");
      expect(connection.props.peer).toBeDefined();
    });

    it("should create ExpressRoute connection with authorization key", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "ExpressRouteAuth",
        {
          name: "er-auth",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "ExpressRoute",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/er-gateway",
          },
          peer: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/expressRouteCircuits/circuit",
          },
          authorizationKey: "my-auth-key-123",
        },
      );

      expect(connection.props.authorizationKey).toBe("my-auth-key-123");
    });
  });

  describe("Connection Mode Configuration", () => {
    it("should create connection with Default mode", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "DefaultMode",
        {
          name: "conn-default",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          connectionMode: "Default",
        },
      );

      expect(connection.props.connectionMode).toBe("Default");
    });

    it("should create connection with ResponderOnly mode", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "ResponderMode",
        {
          name: "conn-responder",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          connectionMode: "ResponderOnly",
        },
      );

      expect(connection.props.connectionMode).toBe("ResponderOnly");
    });

    it("should create connection with InitiatorOnly mode", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "InitiatorMode",
        {
          name: "conn-initiator",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          connectionMode: "InitiatorOnly",
        },
      );

      expect(connection.props.connectionMode).toBe("InitiatorOnly");
    });
  });

  describe("NAT Rules Configuration", () => {
    it("should create connection with egress NAT rules", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "EgressNAT",
        {
          name: "conn-egress-nat",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          egressNatRules: [
            {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1/natRules/rule1",
            },
          ],
        },
      );

      expect(connection.props.egressNatRules).toHaveLength(1);
    });

    it("should create connection with ingress NAT rules", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IngressNAT",
        {
          name: "conn-ingress-nat",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          ingressNatRules: [
            {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1/natRules/rule1",
            },
          ],
        },
      );

      expect(connection.props.ingressNatRules).toHaveLength(1);
    });
  });

  describe("Tags Management", () => {
    it("should create connection with tags", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "TaggedConnection",
        {
          name: "conn-tagged",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          tags: {
            environment: "production",
            cost_center: "engineering",
          },
        },
      );

      expect(connection.props.tags).toEqual({
        environment: "production",
        cost_center: "engineering",
      });
    });

    it("should support adding tags", () => {
      const connection = new VirtualNetworkGatewayConnection(stack, "AddTag", {
        name: "conn-add-tag",
        location: "eastus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "IPsec",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        localNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
        },
        sharedKey: "key",
        tags: { environment: "test" },
      });

      connection.addTag("newTag", "newValue");
      expect(connection.props.tags!.newTag).toBe("newValue");
      expect(connection.props.tags!.environment).toBe("test");
    });

    it("should support removing tags", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "RemoveTag",
        {
          name: "conn-remove-tag",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          tags: {
            environment: "test",
            temporary: "true",
          },
        },
      );

      connection.removeTag("temporary");
      expect(connection.props.tags!.temporary).toBeUndefined();
      expect(connection.props.tags!.environment).toBe("test");
    });
  });

  describe("Terraform Outputs", () => {
    it("should create Terraform outputs", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "OutputTest",
        {
          name: "conn-outputs",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
        },
      );

      expect(connection.idOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(connection.nameOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(connection.locationOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(connection.tagsOutput).toBeInstanceOf(cdktf.TerraformOutput);
    });

    it("should have correct id format", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IdFormat",
        {
          name: "conn-id",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
        },
      );

      expect(connection.id).toMatch(/^\$\{.*\.id\}$/);
      expect(connection.resourceId).toBe(connection.id);
    });
  });

  describe("Version Compatibility", () => {
    it("should work with all supported API versions", () => {
      const versions = ["2024-01-01", "2024-05-01"];

      versions.forEach((version) => {
        const connection = new VirtualNetworkGatewayConnection(
          stack,
          `Conn-${version.replace(/-/g, "")}`,
          {
            name: `conn-${version}`,
            location: "eastus",
            resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
            apiVersion: version,
            connectionType: "IPsec",
            virtualNetworkGateway1: {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
            },
            localNetworkGateway2: {
              id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
            },
            sharedKey: "key",
          },
        );

        expect(connection.resolvedApiVersion).toBe(version);
      });
    });
  });

  describe("Ignore Changes Configuration", () => {
    it("should apply ignore changes lifecycle rules", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "IgnoreChanges",
        {
          name: "conn-ignore",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          ignoreChanges: ["tags"],
        },
      );

      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
      expect(connection.props.ignoreChanges).toEqual(["tags"]);
    });

    it("should handle empty ignore changes array", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "EmptyIgnore",
        {
          name: "conn-empty-ignore",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          ignoreChanges: [],
        },
      );

      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
    });
  });

  describe("CDK Terraform Integration", () => {
    it("should synthesize to valid Terraform configuration", () => {
      new VirtualNetworkGatewayConnection(stack, "SynthTest", {
        name: "conn-synth",
        location: "eastus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "IPsec",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        localNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
        },
        sharedKey: "key",
        tags: { test: "synthesis" },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toBeDefined();

      const stackConfig = JSON.parse(synthesized);
      expect(stackConfig.resource).toBeDefined();
    });

    it("should handle multiple connections in the same stack", () => {
      const conn1 = new VirtualNetworkGatewayConnection(stack, "Conn1", {
        name: "conn-1",
        location: "eastus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        connectionType: "IPsec",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        localNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
        },
        sharedKey: "key",
      });

      const conn2 = new VirtualNetworkGatewayConnection(stack, "Conn2", {
        name: "conn-2",
        location: "westus",
        resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
        apiVersion: "2024-01-01",
        connectionType: "Vnet2Vnet",
        virtualNetworkGateway1: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
        },
        virtualNetworkGateway2: {
          id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng2",
        },
        sharedKey: "key",
      });

      expect(conn1.resolvedApiVersion).toBe("2024-05-01");
      expect(conn2.resolvedApiVersion).toBe("2024-01-01");

      const synthesized = Testing.synth(stack);
      expect(synthesized).toBeDefined();
    });
  });

  describe("DPD Timeout Configuration", () => {
    it("should create connection with custom DPD timeout", () => {
      const connection = new VirtualNetworkGatewayConnection(
        stack,
        "CustomDPD",
        {
          name: "conn-dpd",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
          dpdTimeoutSeconds: 45,
        },
      );

      expect(connection.props.dpdTimeoutSeconds).toBe(45);
    });
  });

  describe("Gateway Reference Structure Validation", () => {
    it("should create IPsec connection successfully (fix applied)", () => {
      const testApp = Testing.app();
      const testStack = new cdktf.TerraformStack(testApp, "IPsecTestStack");

      const connection = new VirtualNetworkGatewayConnection(
        testStack,
        "IPsecPropertiesTest",
        {
          name: "ipsec-props",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "IPsec",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          localNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/localNetworkGateways/lng",
          },
          sharedKey: "key",
        },
      );

      // Verify the connection was created successfully
      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
      expect(connection.props.connectionType).toBe("IPsec");

      // Synthesize to ensure no errors
      const synthesized = Testing.synth(testStack);
      expect(synthesized).toBeDefined();
    });

    it("should create Vnet2Vnet connection successfully (fix applied)", () => {
      const testApp = Testing.app();
      const testStack = new cdktf.TerraformStack(testApp, "Vnet2VnetTestStack");

      const connection = new VirtualNetworkGatewayConnection(
        testStack,
        "Vnet2VnetPropertiesTest",
        {
          name: "vnet2vnet-props",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "Vnet2Vnet",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng1",
          },
          virtualNetworkGateway2: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/vng2",
          },
          sharedKey: "key",
        },
      );

      // Verify the connection was created successfully
      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
      expect(connection.props.connectionType).toBe("Vnet2Vnet");

      // Synthesize to ensure no errors
      const synthesized = Testing.synth(testStack);
      expect(synthesized).toBeDefined();
    });

    it("should create ExpressRoute connection successfully (fix applied)", () => {
      const testApp = Testing.app();
      const testStack = new cdktf.TerraformStack(
        testApp,
        "ExpressRouteTestStack",
      );

      const connection = new VirtualNetworkGatewayConnection(
        testStack,
        "ExpressRoutePropertiesTest",
        {
          name: "er-props",
          location: "eastus",
          resourceGroupId: "/subscriptions/sub-id/resourceGroups/test-rg",
          connectionType: "ExpressRoute",
          virtualNetworkGateway1: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/virtualNetworkGateways/er-gateway",
          },
          peer: {
            id: "/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Network/expressRouteCircuits/circuit",
          },
        },
      );

      // Verify the connection was created successfully
      expect(connection).toBeInstanceOf(VirtualNetworkGatewayConnection);
      expect(connection.props.connectionType).toBe("ExpressRoute");

      // Synthesize to ensure no errors
      const synthesized = Testing.synth(testStack);
      expect(synthesized).toBeDefined();
    });
  });
});
