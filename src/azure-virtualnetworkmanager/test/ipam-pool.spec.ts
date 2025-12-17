/**
 * IPAM Pool Tests
 *
 * Unit tests for the IPAM Pool construct
 */

import { Testing } from "cdktf";
import * as cdktf from "cdktf";
import { IpamPool } from "../lib/ipam-pool";
import { VirtualNetworkManager } from "../lib/virtual-network-manager";

describe("IpamPool", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;
  let manager: VirtualNetworkManager;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "test-stack");
    manager = new VirtualNetworkManager(stack, "TestManager", {
      name: "test-manager",
      location: "eastus",
      resourceGroupId: "/subscriptions/test/resourceGroups/rg",
      networkManagerScopes: {
        subscriptions: ["/subscriptions/test"],
      },
      networkManagerScopeAccesses: ["Connectivity"],
    });
  });

  describe("Basic Instantiation", () => {
    it("should create pool with single address prefix", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(pool).toBeInstanceOf(IpamPool);
      expect(pool.props.addressPrefixes).toEqual(["10.0.0.0/8"]);
      expect(pool.props.name).toBe("test-pool");
      expect(pool.props.location).toBe("eastus");
    });

    it("should create pool with multiple non-overlapping prefixes", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"],
      });

      expect(pool.props.addressPrefixes).toHaveLength(3);
      expect(pool.totalAddressCount).toBe(16777216 + 1048576 + 65536);
    });

    it("should create pool with description and display name", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        description: "Test IPAM pool",
        displayName: "Test Pool",
      });

      expect(pool.props.description).toBe("Test IPAM pool");
      expect(pool.props.displayName).toBe("Test Pool");
    });

    it("should create pool with tags", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        tags: {
          environment: "test",
          purpose: "ipam",
        },
      });

      expect(pool.props.tags).toEqual({
        environment: "test",
        purpose: "ipam",
      });
    });
  });

  describe("CIDR Validation", () => {
    it("should throw error for overlapping prefixes", () => {
      expect(() => {
        new IpamPool(stack, "TestPool", {
          name: "test-pool",
          location: "eastus",
          networkManagerId: manager.id,
          addressPrefixes: ["10.0.0.0/8", "10.1.0.0/16"],
        });
      }).toThrow(/overlap/i);
    });

    it("should throw error for invalid CIDR format", () => {
      expect(() => {
        new IpamPool(stack, "TestPool", {
          name: "test-pool",
          location: "eastus",
          networkManagerId: manager.id,
          addressPrefixes: ["10.0.0.0/33"],
        });
      }).toThrow(/Invalid CIDR/i);
    });

    it("should throw error for missing CIDR prefix", () => {
      expect(() => {
        new IpamPool(stack, "TestPool", {
          name: "test-pool",
          location: "eastus",
          networkManagerId: manager.id,
          addressPrefixes: ["10.0.0.0"],
        });
      }).toThrow(/Invalid CIDR/i);
    });

    it("should throw error for empty address prefixes", () => {
      expect(() => {
        new IpamPool(stack, "TestPool", {
          name: "test-pool",
          location: "eastus",
          networkManagerId: manager.id,
          addressPrefixes: [],
        });
      }).toThrow(/At least one address prefix is required/i);
    });

    it("should throw error for invalid octets", () => {
      expect(() => {
        new IpamPool(stack, "TestPool", {
          name: "test-pool",
          location: "eastus",
          networkManagerId: manager.id,
          addressPrefixes: ["256.0.0.0/24"],
        });
      }).toThrow(/Invalid CIDR/i);
    });
  });

  describe("Hierarchical Pools", () => {
    it("should create child pool with parent reference", () => {
      const parentPool = new IpamPool(stack, "ParentPool", {
        name: "parent-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      const childPool = new IpamPool(stack, "ChildPool", {
        name: "child-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.1.0.0/16"],
        parentPoolName: parentPool.props.name,
      });

      expect(childPool.props.parentPoolName).toBe("parent-pool");
    });

    it("should create multiple child pools under same parent", () => {
      const parentPool = new IpamPool(stack, "ParentPool", {
        name: "parent-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      const child1 = new IpamPool(stack, "ChildPool1", {
        name: "child-pool-1",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.1.0.0/16"],
        parentPoolName: parentPool.props.name,
      });

      const child2 = new IpamPool(stack, "ChildPool2", {
        name: "child-pool-2",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.2.0.0/16"],
        parentPoolName: parentPool.props.name,
      });

      expect(child1.props.parentPoolName).toBe("parent-pool");
      expect(child2.props.parentPoolName).toBe("parent-pool");
    });

    it("should create root pool without parent reference", () => {
      const rootPool = new IpamPool(stack, "RootPool", {
        name: "root-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(rootPool.props.parentPoolName).toBeUndefined();
    });
  });

  describe("Terraform Outputs", () => {
    it("should create proper Terraform outputs", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(pool.idOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(pool.nameOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(pool.locationOutput).toBeInstanceOf(cdktf.TerraformOutput);
    });

    it("should have correct output logical IDs", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      const synthesized = Testing.synth(stack);
      const stackConfig = JSON.parse(synthesized);
      expect(stackConfig.output).toBeDefined();
      expect(stackConfig.output.id).toBeDefined();
      expect(stackConfig.output.name).toBeDefined();
      expect(stackConfig.output.location).toBeDefined();
    });
  });

  describe("API Version Handling", () => {
    it("should use default API version", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(pool.resolvedApiVersion).toBe("2024-05-01");
    });

    it("should use specified API version", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        apiVersion: "2024-05-01",
      });

      expect(pool.resolvedApiVersion).toBe("2024-05-01");
    });

    it("should have correct resource type", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain(
        "Microsoft.Network/networkManagers/ipamPools@2024-05-01",
      );
    });
  });

  describe("Helper Properties", () => {
    it("should calculate total address count for single prefix", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/24"],
      });

      expect(pool.totalAddressCount).toBe(256);
    });

    it("should calculate total address count for multiple prefixes", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/24", "172.16.0.0/24"],
      });

      expect(pool.totalAddressCount).toBe(512); // 256 + 256
    });

    it("should calculate total for large CIDR blocks", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(pool.totalAddressCount).toBe(16777216); // 2^24
    });

    it("should calculate total for small CIDR blocks", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/32"],
      });

      expect(pool.totalAddressCount).toBe(1);
    });
  });

  describe("Lifecycle Management", () => {
    it("should apply ignore changes for tags", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        ignoreChanges: ["tags"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("ignore_changes");
    });

    it("should apply multiple ignore changes", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        ignoreChanges: ["tags", "description"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("ignore_changes");
    });
  });

  describe("Terraform Synthesis", () => {
    it("should synthesize valid Terraform configuration", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        description: "Test pool",
      });

      const output = Testing.synth(stack);
      expect(output).toBeDefined();
    });

    it("should include address prefixes in resource body", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8", "172.16.0.0/12"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("10.0.0.0/8");
      expect(manifest).toContain("172.16.0.0/12");
    });

    it("should include optional properties when specified", () => {
      new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
        description: "Test description",
        displayName: "Test Display Name",
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("Test description");
      expect(manifest).toContain("Test Display Name");
    });
  });

  describe("Edge Cases", () => {
    it("should handle /0 prefix (entire IPv4 space)", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["0.0.0.0/0"],
      });

      expect(pool.totalAddressCount).toBe(4294967296); // 2^32
    });

    it("should handle /32 prefix (single IP)", () => {
      const pool = new IpamPool(stack, "TestPool", {
        name: "test-pool",
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["192.168.1.1/32"],
      });

      expect(pool.totalAddressCount).toBe(1);
    });

    it("should handle maximum valid name length", () => {
      const longName = "a".repeat(64);
      const pool = new IpamPool(stack, "TestPool", {
        name: longName,
        location: "eastus",
        networkManagerId: manager.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(pool.props.name).toBe(longName);
    });
  });
});
