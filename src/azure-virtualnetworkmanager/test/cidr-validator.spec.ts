/**
 * CIDR Validator Tests
 *
 * Unit tests for the CIDR validation utility
 */

import {
  isValidCidr,
  isPrivateRange,
  cidrsOverlap,
  isSubnet,
  calculateAddressCount,
  isValidPrefixLength,
  validateCidr,
  parseCidr,
  checkOverlap,
  validateNoOverlaps,
  isContained,
  validateContainment,
  ipToNumber,
  numberToIp,
  prefixToMask,
} from "../lib/utils/cidr-validator";

describe("CIDR Validator Functions", () => {
  describe("isValidCidr", () => {
    it("should return true for valid CIDR formats", () => {
      expect(isValidCidr("10.0.0.0/8")).toBe(true);
      expect(isValidCidr("172.16.0.0/12")).toBe(true);
      expect(isValidCidr("192.168.0.0/16")).toBe(true);
      expect(isValidCidr("0.0.0.0/0")).toBe(true);
      expect(isValidCidr("255.255.255.255/32")).toBe(true);
    });

    it("should return false for invalid CIDR formats", () => {
      expect(isValidCidr("")).toBe(false);
      expect(isValidCidr("not-a-cidr")).toBe(false);
      expect(isValidCidr("10.0.0.0")).toBe(false);
      expect(isValidCidr("10.0.0.0/")).toBe(false);
      expect(isValidCidr("256.0.0.0/24")).toBe(false);
      expect(isValidCidr("10.0.0.0/33")).toBe(false);
    });
  });

  describe("isPrivateRange", () => {
    it("should return true for RFC 1918 private IP ranges", () => {
      expect(isPrivateRange("10.0.0.0/8")).toBe(true);
      expect(isPrivateRange("10.50.0.0/16")).toBe(true);
      expect(isPrivateRange("172.16.0.0/12")).toBe(true);
      expect(isPrivateRange("172.20.0.0/16")).toBe(true);
      expect(isPrivateRange("192.168.0.0/16")).toBe(true);
      expect(isPrivateRange("192.168.1.0/24")).toBe(true);
    });

    it("should return false for public IP ranges", () => {
      expect(isPrivateRange("8.8.8.0/24")).toBe(false);
      expect(isPrivateRange("1.1.1.0/24")).toBe(false);
      expect(isPrivateRange("172.32.0.0/16")).toBe(false);
      expect(isPrivateRange("11.0.0.0/8")).toBe(false);
    });

    it("should return false for invalid CIDR", () => {
      expect(isPrivateRange("invalid")).toBe(false);
    });
  });

  describe("cidrsOverlap", () => {
    it("should detect overlapping CIDRs", () => {
      expect(cidrsOverlap("10.0.0.0/16", "10.0.1.0/24")).toBe(true);
      expect(cidrsOverlap("10.0.0.0/8", "10.1.0.0/16")).toBe(true);
      expect(cidrsOverlap("192.168.0.0/24", "192.168.0.128/25")).toBe(true);
    });

    it("should detect non-overlapping CIDRs", () => {
      expect(cidrsOverlap("10.0.0.0/16", "10.1.0.0/16")).toBe(false);
      expect(cidrsOverlap("192.168.0.0/24", "192.168.1.0/24")).toBe(false);
      expect(cidrsOverlap("172.16.0.0/16", "192.168.0.0/16")).toBe(false);
    });
  });

  describe("isSubnet", () => {
    it("should return true when child is subnet of parent", () => {
      expect(isSubnet("10.1.0.0/16", "10.0.0.0/8")).toBe(true);
      expect(isSubnet("10.0.1.0/24", "10.0.0.0/16")).toBe(true);
      expect(isSubnet("192.168.1.0/24", "192.168.0.0/16")).toBe(true);
    });

    it("should return false when child is not subnet of parent", () => {
      expect(isSubnet("10.0.1.0/24", "10.0.0.0/24")).toBe(false);
      expect(isSubnet("10.1.0.0/24", "10.0.0.0/16")).toBe(false);
      expect(isSubnet("192.168.1.0/24", "192.168.0.0/24")).toBe(false);
    });

    it("should return true when child equals parent", () => {
      expect(isSubnet("10.0.0.0/24", "10.0.0.0/24")).toBe(true);
    });
  });

  describe("calculateAddressCount", () => {
    it("should calculate correct address count for various prefixes", () => {
      expect(calculateAddressCount("10.0.0.0/8")).toBe(16777216);
      expect(calculateAddressCount("10.0.0.0/16")).toBe(65536);
      expect(calculateAddressCount("10.0.0.0/24")).toBe(256);
      expect(calculateAddressCount("10.0.0.0/32")).toBe(1);
      expect(calculateAddressCount("0.0.0.0/0")).toBe(4294967296);
    });
  });

  describe("isValidPrefixLength", () => {
    it("should return true for prefix within range", () => {
      expect(isValidPrefixLength("10.0.0.0/24", 8, 29)).toBe(true);
      expect(isValidPrefixLength("10.0.0.0/8", 8, 29)).toBe(true);
      expect(isValidPrefixLength("10.0.0.0/29", 8, 29)).toBe(true);
      expect(isValidPrefixLength("10.0.0.0/16", 16, 16)).toBe(true);
    });

    it("should return false for prefix outside range", () => {
      expect(isValidPrefixLength("10.0.0.0/7", 8, 29)).toBe(false);
      expect(isValidPrefixLength("10.0.0.0/30", 8, 29)).toBe(false);
      expect(isValidPrefixLength("10.0.0.0/32", 8, 29)).toBe(false);
    });

    it("should return false for invalid CIDR", () => {
      expect(isValidPrefixLength("invalid", 8, 29)).toBe(false);
    });
  });

  describe("validateCidr", () => {
    it("should validate valid CIDR formats", () => {
      const validCidrs = [
        "10.0.0.0/8",
        "172.16.0.0/12",
        "192.168.0.0/16",
        "10.0.0.0/24",
        "0.0.0.0/0",
        "255.255.255.255/32",
      ];

      validCidrs.forEach((cidr) => {
        const result = validateCidr(cidr);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it("should detect invalid CIDR formats", () => {
      const invalidCidrs = [
        "",
        "not-a-cidr",
        "10.0.0.0",
        "10.0.0.0/",
        "10.0.0/24",
        "10.0.0.0.0/24",
        "256.0.0.0/24",
        "10.0.0.0/33",
        "10.0.0.0/-1",
      ];

      invalidCidrs.forEach((cidr) => {
        const result = validateCidr(cidr);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    it("should warn about misaligned network addresses", () => {
      const result = validateCidr("10.0.0.1/24");
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("not aligned to network boundary");
    });

    it("should validate properly aligned network addresses without warnings", () => {
      const result = validateCidr("10.0.0.0/24");
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe("parseCidr", () => {
    it("should parse valid CIDR notation", () => {
      const parsed = parseCidr("10.0.0.0/24");

      expect(parsed.cidr).toBe("10.0.0.0/24");
      expect(parsed.network).toBe("10.0.0.0");
      expect(parsed.prefix).toBe(24);
      expect(parsed.firstIp).toBe("10.0.0.0");
      expect(parsed.lastIp).toBe("10.0.0.255");
      expect(parsed.totalAddresses).toBe(256);
      expect(parsed.netmask).toBe("255.255.255.0");
    });

    it("should parse /8 CIDR correctly", () => {
      const parsed = parseCidr("10.0.0.0/8");

      expect(parsed.network).toBe("10.0.0.0");
      expect(parsed.prefix).toBe(8);
      expect(parsed.firstIp).toBe("10.0.0.0");
      expect(parsed.lastIp).toBe("10.255.255.255");
      expect(parsed.totalAddresses).toBe(16777216);
      expect(parsed.netmask).toBe("255.0.0.0");
    });

    it("should parse /32 CIDR correctly", () => {
      const parsed = parseCidr("192.168.1.1/32");

      expect(parsed.network).toBe("192.168.1.1");
      expect(parsed.prefix).toBe(32);
      expect(parsed.firstIp).toBe("192.168.1.1");
      expect(parsed.lastIp).toBe("192.168.1.1");
      expect(parsed.totalAddresses).toBe(1);
      expect(parsed.netmask).toBe("255.255.255.255");
    });

    it("should throw error for invalid CIDR", () => {
      expect(() => {
        parseCidr("invalid");
      }).toThrow("Invalid CIDR");
    });
  });

  describe("checkOverlap", () => {
    it("should detect overlapping CIDRs", () => {
      expect(checkOverlap("10.0.0.0/16", "10.0.1.0/24")).toBe(true);
      expect(checkOverlap("10.0.0.0/8", "10.1.0.0/16")).toBe(true);
      expect(checkOverlap("192.168.0.0/24", "192.168.0.128/25")).toBe(true);
    });

    it("should detect non-overlapping CIDRs", () => {
      expect(checkOverlap("10.0.0.0/16", "10.1.0.0/16")).toBe(false);
      expect(checkOverlap("192.168.0.0/24", "192.168.1.0/24")).toBe(false);
      expect(checkOverlap("172.16.0.0/16", "192.168.0.0/16")).toBe(false);
    });

    it("should detect adjacent non-overlapping CIDRs", () => {
      expect(checkOverlap("10.0.0.0/24", "10.0.1.0/24")).toBe(false);
    });
  });

  describe("validateNoOverlaps", () => {
    it("should validate non-overlapping CIDR array", () => {
      const cidrs = ["10.0.0.0/24", "10.0.1.0/24", "10.0.2.0/24"];

      const result = validateNoOverlaps(cidrs);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect overlaps in CIDR array", () => {
      const cidrs = ["10.0.0.0/16", "10.0.1.0/24", "10.0.2.0/24"];

      const result = validateNoOverlaps(cidrs);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("overlap");
    });

    it("should detect invalid CIDRs in array", () => {
      const cidrs = ["10.0.0.0/24", "invalid-cidr"];

      const result = validateNoOverlaps(cidrs);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("isContained", () => {
    it("should detect child CIDR contained in parent", () => {
      expect(isContained("10.0.0.0/16", "10.0.1.0/24")).toBe(true);
      expect(isContained("10.0.0.0/8", "10.0.0.0/16")).toBe(true);
      expect(isContained("192.168.0.0/16", "192.168.1.0/24")).toBe(true);
    });

    it("should detect child CIDR not contained in parent", () => {
      expect(isContained("10.0.0.0/24", "10.0.1.0/24")).toBe(false);
      expect(isContained("10.0.0.0/16", "10.1.0.0/24")).toBe(false);
      expect(isContained("192.168.0.0/24", "192.168.1.0/24")).toBe(false);
    });

    it("should handle parent and child being the same", () => {
      expect(isContained("10.0.0.0/24", "10.0.0.0/24")).toBe(true);
    });
  });

  describe("validateContainment", () => {
    it("should validate all children contained in parent", () => {
      const parent = "10.0.0.0/16";
      const children = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"];

      const result = validateContainment(parent, children);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect children not contained in parent", () => {
      const parent = "10.0.0.0/16";
      const children = ["10.0.1.0/24", "10.1.0.0/24", "192.168.0.0/24"];

      const result = validateContainment(parent, children);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(
        result.errors.some((e: string) => e.includes("not contained")),
      ).toBe(true);
    });

    it("should detect invalid parent CIDR", () => {
      const result = validateContainment("invalid", ["10.0.0.0/24"]);
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Invalid parent CIDR");
    });

    it("should detect invalid child CIDRs", () => {
      const parent = "10.0.0.0/16";
      const children = ["10.0.1.0/24", "invalid-cidr"];

      const result = validateContainment(parent, children);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e: string) => e.includes("Invalid child CIDR")),
      ).toBe(true);
    });
  });

  describe("ipToNumber and numberToIp", () => {
    it("should convert IP to number and back", () => {
      const testIps = ["0.0.0.0", "10.0.0.1", "192.168.1.1", "255.255.255.255"];

      testIps.forEach((ip) => {
        const num = ipToNumber(ip);
        const converted = numberToIp(num);
        expect(converted).toBe(ip);
      });
    });

    it("should handle specific IP conversions", () => {
      expect(ipToNumber("10.0.0.1")).toBe(167772161);
      expect(numberToIp(167772161)).toBe("10.0.0.1");

      expect(ipToNumber("192.168.1.1")).toBe(3232235777);
      expect(numberToIp(3232235777)).toBe("192.168.1.1");
    });
  });

  describe("prefixToMask", () => {
    it("should convert prefix to correct netmask", () => {
      const prefixTests = [
        { prefix: 0, mask: "0.0.0.0" },
        { prefix: 8, mask: "255.0.0.0" },
        { prefix: 16, mask: "255.255.0.0" },
        { prefix: 24, mask: "255.255.255.0" },
        { prefix: 32, mask: "255.255.255.255" },
      ];

      prefixTests.forEach(({ prefix, mask }) => {
        const maskNum = prefixToMask(prefix);
        const maskIp = numberToIp(maskNum);
        expect(maskIp).toBe(mask);
      });
    });
  });
});
