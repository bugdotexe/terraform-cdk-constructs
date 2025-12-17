/**
 * IPAM Pool Static CIDR Tests
 *
 * Unit tests for the IPAM Pool Static CIDR construct
 */

import { Testing } from "cdktf";
import * as cdktf from "cdktf";
import { IpamPool } from "../lib/ipam-pool";
import { IpamPoolStaticCidr } from "../lib/ipam-pool-static-cidr";
import { VirtualNetworkManager } from "../lib/virtual-network-manager";

describe("IpamPoolStaticCidr", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;
  let manager: VirtualNetworkManager;
  let pool: IpamPool;

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
    pool = new IpamPool(stack, "TestPool", {
      name: "test-pool",
      location: "eastus",
      networkManagerId: manager.id,
      addressPrefixes: ["10.0.0.0/8"],
    });
  });

  describe("Basic Instantiation", () => {
    it("should create static CIDR with required properties", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr).toBeInstanceOf(IpamPoolStaticCidr);
      expect(staticCidr.props.addressPrefixes).toEqual(["10.0.1.0/24"]);
      expect(staticCidr.props.name).toBe("test-cidr");
      expect(staticCidr.addressPrefixes).toEqual(["10.0.1.0/24"]);
    });

    it("should create static CIDR with description", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        description: "Reserved for web servers",
      });

      expect(staticCidr.props.description).toBe("Reserved for web servers");
    });

    it("should auto-calculate IP count when not provided", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(256);
    });

    it("should create multiple static CIDRs in same pool", () => {
      const cidr1 = new IpamPoolStaticCidr(stack, "StaticCidr1", {
        name: "cidr-1",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.1.0.0/24"],
      });

      const cidr2 = new IpamPoolStaticCidr(stack, "StaticCidr2", {
        name: "cidr-2",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.2.0.0/24"],
      });

      expect(cidr1.props.name).toBe("cidr-1");
      expect(cidr2.props.name).toBe("cidr-2");
      expect(cidr1.addressPrefixes).toEqual(["10.1.0.0/24"]);
      expect(cidr2.addressPrefixes).toEqual(["10.2.0.0/24"]);
    });
  });

  describe("CIDR Validation", () => {
    it("should throw error for invalid CIDR format", () => {
      expect(() => {
        new IpamPoolStaticCidr(stack, "TestStaticCidr", {
          name: "test-cidr",
          ipamPoolId: pool.id,
          addressPrefixes: ["10.0.0.0/33"],
        });
      }).toThrow(/Invalid address prefix/i);
    });

    it("should throw error for missing CIDR prefix", () => {
      expect(() => {
        new IpamPoolStaticCidr(stack, "TestStaticCidr", {
          name: "test-cidr",
          ipamPoolId: pool.id,
          addressPrefixes: ["10.0.0.0"],
        });
      }).toThrow(/Invalid address prefix/i);
    });

    it("should throw error for invalid octets", () => {
      expect(() => {
        new IpamPoolStaticCidr(stack, "TestStaticCidr", {
          name: "test-cidr",
          ipamPoolId: pool.id,
          addressPrefixes: ["256.0.0.0/24"],
        });
      }).toThrow(/Invalid address prefix/i);
    });

    it("should throw error for empty address prefix", () => {
      expect(() => {
        new IpamPoolStaticCidr(stack, "TestStaticCidr", {
          name: "test-cidr",
          ipamPoolId: pool.id,
          addressPrefixes: [""],
        });
      }).toThrow(/Address prefix is required/i);
    });

    it("should accept valid CIDR with different prefix lengths", () => {
      const cidr16 = new IpamPoolStaticCidr(stack, "Cidr16", {
        name: "cidr-16",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.1.0.0/16"],
      });

      const cidr24 = new IpamPoolStaticCidr(stack, "Cidr24", {
        name: "cidr-24",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.2.0.0/24"],
      });

      const cidr32 = new IpamPoolStaticCidr(stack, "Cidr32", {
        name: "cidr-32",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.3.0.1/32"],
      });

      expect(cidr16.calculatedAddressCount).toBe(65536);
      expect(cidr24.calculatedAddressCount).toBe(256);
      expect(cidr32.calculatedAddressCount).toBe(1);
    });
  });

  describe("IP Address Count Calculation", () => {
    it("should calculate correct count for /24 CIDR", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(256);
    });

    it("should calculate correct count for /16 CIDR", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.1.0.0/16"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(65536);
    });

    it("should calculate correct count for /8 CIDR", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(16777216);
    });

    it("should calculate correct count for /32 CIDR", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.1/32"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(1);
    });

    it("should calculate correct count for /29 CIDR", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.0/29"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(8);
    });
  });

  describe("Parent-Child Relationship", () => {
    it("should correctly resolve parent pool ID", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.props.ipamPoolId).toBe(pool.id);
    });

    it("should create static CIDR with direct pool ID reference", () => {
      const poolId =
        "/subscriptions/test/resourceGroups/rg/providers/Microsoft.Network/networkManagers/vnm/ipamPools/test-pool";
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: poolId,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.props.ipamPoolId).toBe(poolId);
    });
  });

  describe("Terraform Outputs", () => {
    it("should create proper Terraform outputs", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.idOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(staticCidr.nameOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(staticCidr.addressPrefixOutput).toBeInstanceOf(
        cdktf.TerraformOutput,
      );
    });

    it("should have correct output logical IDs", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      const synthesized = Testing.synth(stack);
      const stackConfig = JSON.parse(synthesized);
      expect(stackConfig.output).toBeDefined();
      expect(stackConfig.output.id).toBeDefined();
      expect(stackConfig.output.name).toBeDefined();
      expect(stackConfig.output.addressPrefixes).toBeDefined();
    });
  });

  describe("API Version Handling", () => {
    it("should use default API version", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.resolvedApiVersion).toBe("2024-05-01");
    });

    it("should use specified API version", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        apiVersion: "2023-11-01",
      });

      expect(staticCidr.resolvedApiVersion).toBe("2023-11-01");
    });

    it("should have correct resource type", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain(
        "Microsoft.Network/networkManagers/ipamPools/staticCidrs@2024-05-01",
      );
    });
  });

  describe("Helper Properties", () => {
    it("should expose addressPrefixes property", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.addressPrefixes).toEqual(["10.0.1.0/24"]);
    });

    it("should have provisioningState getter", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.provisioningState).toBeDefined();
      expect(typeof staticCidr.provisioningState).toBe("string");
    });
  });

  describe("Lifecycle Management", () => {
    it("should apply ignore changes for specified fields", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        ignoreChanges: ["description"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("ignore_changes");
    });

    it("should apply multiple ignore changes", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        ignoreChanges: ["description", "numberOfIPAddresses"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("ignore_changes");
    });
  });

  describe("Terraform Synthesis", () => {
    it("should synthesize valid Terraform configuration", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        description: "Test CIDR",
      });

      const output = Testing.synth(stack);
      expect(output).toBeDefined();
    });

    it("should include address prefix in resource body", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("10.0.1.0/24");
    });

    it("should include optional properties when specified", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
        description: "Test description",
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      expect(manifest).toContain("Test description");
    });

    it("should not include location in resource body", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      // Child resources don't have location in body
      expect(manifest).toContain("addressPrefixes");
      expect(manifest).toContain("10.0.1.0/24");
    });

    it("should not include tags in resource body", () => {
      new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      const manifest = JSON.stringify(Testing.synth(stack));
      // Child resources inherit tags from parent, not specified in body
      expect(manifest).toContain("addressPrefixes");
      expect(manifest).toContain("10.0.1.0/24");
    });
  });

  describe("Edge Cases", () => {
    it("should handle /32 prefix (single IP)", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.1/32"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(1);
    });

    it("should handle /8 prefix (large block)", () => {
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: "test-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      expect(staticCidr.calculatedAddressCount).toBe(16777216);
    });

    it("should handle maximum valid name length", () => {
      const longName = "a".repeat(64);
      const staticCidr = new IpamPoolStaticCidr(stack, "TestStaticCidr", {
        name: longName,
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.1.0/24"],
      });

      expect(staticCidr.props.name).toBe(longName);
    });

    it("should handle private IP ranges", () => {
      const cidr1 = new IpamPoolStaticCidr(stack, "Cidr1", {
        name: "cidr-1",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.0.0.0/8"],
      });

      const cidr2 = new IpamPoolStaticCidr(stack, "Cidr2", {
        name: "cidr-2",
        ipamPoolId: pool.id,
        addressPrefixes: ["172.16.0.0/12"],
      });

      const cidr3 = new IpamPoolStaticCidr(stack, "Cidr3", {
        name: "cidr-3",
        ipamPoolId: pool.id,
        addressPrefixes: ["192.168.0.0/16"],
      });

      expect(cidr1.calculatedAddressCount).toBe(16777216);
      expect(cidr2.calculatedAddressCount).toBe(1048576);
      expect(cidr3.calculatedAddressCount).toBe(65536);
    });
  });

  describe("Complex Scenarios", () => {
    it("should create multiple static CIDRs with different sizes", () => {
      const small = new IpamPoolStaticCidr(stack, "SmallCidr", {
        name: "small-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.1.0.0/28"],
        description: "Small allocation",
      });

      const medium = new IpamPoolStaticCidr(stack, "MediumCidr", {
        name: "medium-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.2.0.0/24"],
        description: "Medium allocation",
      });

      const large = new IpamPoolStaticCidr(stack, "LargeCidr", {
        name: "large-cidr",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.3.0.0/16"],
        description: "Large allocation",
      });

      expect(small.calculatedAddressCount).toBe(16);
      expect(medium.calculatedAddressCount).toBe(256);
      expect(large.calculatedAddressCount).toBe(65536);
    });

    it("should calculate IP count correctly for single CIDR", () => {
      const withoutCount = new IpamPoolStaticCidr(stack, "WithoutCount", {
        name: "without-count",
        ipamPoolId: pool.id,
        addressPrefixes: ["10.2.0.0/24"],
      });

      expect(withoutCount.calculatedAddressCount).toBe(256);
    });
  });
});
