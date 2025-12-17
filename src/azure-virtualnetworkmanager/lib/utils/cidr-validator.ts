/**
 * CIDR Validator Utility
 *
 * Provides comprehensive validation and parsing utilities for IPv4 CIDR notation.
 * Used by IPAM constructs to ensure proper network address space management.
 */

/* eslint-disable no-bitwise */

/**
 * Result of CIDR validation operations
 */
export interface CidrValidationResult {
  /** Whether the validation passed */
  readonly valid: boolean;
  /** List of validation errors */
  readonly errors: string[];
  /** List of validation warnings */
  readonly warnings: string[];
}

/**
 * Parsed CIDR information
 */
export interface ParsedCidr {
  /** Original CIDR notation (e.g., "10.0.0.0/8") */
  readonly cidr: string;
  /** Network address (e.g., "10.0.0.0") */
  readonly network: string;
  /** Prefix length (e.g., 8) */
  readonly prefix: number;
  /** First usable IP address */
  readonly firstIp: string;
  /** Last usable IP address */
  readonly lastIp: string;
  /** Total number of addresses in the range */
  readonly totalAddresses: number;
  /** Network mask (e.g., "255.0.0.0") */
  readonly netmask: string;
}

const IPV4_REGEX = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\/(\d{1,2})$/;

// RFC 1918 private IP ranges
const PRIVATE_RANGES = [
  { start: "10.0.0.0", end: "10.255.255.255", cidr: "10.0.0.0/8" },
  { start: "172.16.0.0", end: "172.31.255.255", cidr: "172.16.0.0/12" },
  { start: "192.168.0.0", end: "192.168.255.255", cidr: "192.168.0.0/16" },
];

/**
 * Validates if a string is a valid CIDR notation
 *
 * @param cidr - CIDR string (e.g., "10.0.0.0/16")
 * @returns boolean - true if valid CIDR format
 *
 * @example
 * const valid = isValidCidr("10.0.0.0/16");
 * console.log(valid); // true
 */
export function isValidCidr(cidr: string): boolean {
  const result = validateCidr(cidr);
  return result.valid;
}

/**
 * Validates if CIDR is within allowed private ranges (RFC 1918)
 *
 * @param cidr - CIDR string
 * @returns boolean - true if within private IP range
 *
 * @example
 * const isPrivate = isPrivateRange("10.0.0.0/16");
 * console.log(isPrivate); // true
 */
export function isPrivateRange(cidr: string): boolean {
  if (!isValidCidr(cidr)) {
    return false;
  }

  const parsed = parseCidr(cidr);
  const startNum = ipToNumber(parsed.firstIp);
  const endNum = ipToNumber(parsed.lastIp);

  // Check if the entire CIDR range falls within any private range
  return PRIVATE_RANGES.some((range) => {
    const rangeStart = ipToNumber(range.start);
    const rangeEnd = ipToNumber(range.end);
    return startNum >= rangeStart && endNum <= rangeEnd;
  });
}

/**
 * Checks if two CIDR blocks overlap
 *
 * @param cidr1 - First CIDR
 * @param cidr2 - Second CIDR
 * @returns boolean - true if CIDRs overlap
 *
 * @example
 * const overlap = cidrsOverlap("10.0.0.0/8", "10.1.0.0/16");
 * console.log(overlap); // true
 */
export function cidrsOverlap(cidr1: string, cidr2: string): boolean {
  return checkOverlap(cidr1, cidr2);
}

/**
 * Validates if child CIDR is contained within parent CIDR
 *
 * @param childCidr - Child CIDR block
 * @param parentCidr - Parent CIDR block
 * @returns boolean - true if child is subnet of parent
 *
 * @example
 * const isSubnet = isSubnet("10.1.0.0/16", "10.0.0.0/8");
 * console.log(isSubnet); // true
 */
export function isSubnet(childCidr: string, parentCidr: string): boolean {
  return isContained(parentCidr, childCidr);
}

/**
 * Calculates number of IP addresses in a CIDR block
 *
 * @param cidr - CIDR string
 * @returns number - Total IP addresses in the block
 *
 * @example
 * const count = calculateAddressCount("10.0.0.0/24");
 * console.log(count); // 256
 */
export function calculateAddressCount(cidr: string): number {
  const parsed = parseCidr(cidr);
  return parsed.totalAddresses;
}

/**
 * Validates prefix length is within allowed range
 *
 * @param cidr - CIDR string
 * @param minPrefix - Minimum allowed prefix (e.g., 8)
 * @param maxPrefix - Maximum allowed prefix (e.g., 29)
 * @returns boolean - true if prefix length is within range
 *
 * @example
 * const valid = isValidPrefixLength("10.0.0.0/24", 8, 29);
 * console.log(valid); // true
 */
export function isValidPrefixLength(
  cidr: string,
  minPrefix: number,
  maxPrefix: number,
): boolean {
  if (!isValidCidr(cidr)) {
    return false;
  }

  const parsed = parseCidr(cidr);
  return parsed.prefix >= minPrefix && parsed.prefix <= maxPrefix;
}

/**
 * Validate CIDR format and structure
 *
 * @param cidr - CIDR notation string (e.g., "10.0.0.0/8")
 * @returns Validation result with errors and warnings
 *
 * @example
 * const result = validateCidr("10.0.0.0/8");
 * if (!result.valid) {
 *   console.error("Invalid CIDR:", result.errors);
 * }
 */
export function validateCidr(cidr: string): CidrValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!cidr || typeof cidr !== "string") {
    errors.push("CIDR must be a non-empty string");
    return { valid: false, errors, warnings };
  }

  const match = cidr.match(IPV4_REGEX);
  if (!match) {
    errors.push(`Invalid CIDR format: ${cidr}. Expected format: x.x.x.x/y`);
    return { valid: false, errors, warnings };
  }

  const [, oct1, oct2, oct3, oct4, prefix] = match;
  const octets = [oct1, oct2, oct3, oct4].map(Number);
  const prefixLength = Number(prefix);

  // Validate octets (0-255)
  for (let i = 0; i < octets.length; i++) {
    if (octets[i] < 0 || octets[i] > 255) {
      errors.push(
        `Invalid octet value: ${octets[i]}. Must be between 0 and 255`,
      );
    }
  }

  // Validate prefix length (0-32)
  if (prefixLength < 0 || prefixLength > 32) {
    errors.push(
      `Invalid prefix length: ${prefixLength}. Must be between 0 and 32`,
    );
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Verify network address alignment
  const ipNum = ipToNumber(octets.join("."));
  const mask = prefixToMask(prefixLength);
  const networkNum = ipNum & mask;

  if (ipNum !== networkNum) {
    const correctNetwork = numberToIp(networkNum);
    warnings.push(
      `IP address ${octets.join(".")} is not aligned to network boundary. ` +
        `Network address should be ${correctNetwork}/${prefixLength}`,
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Parse CIDR into structured information
 *
 * @param cidr - CIDR notation string
 * @returns Parsed CIDR information
 * @throws Error if CIDR format is invalid
 *
 * @example
 * const parsed = parseCidr("10.0.0.0/8");
 * console.log(`Network: ${parsed.network}, Prefix: ${parsed.prefix}`);
 * console.log(`Range: ${parsed.firstIp} - ${parsed.lastIp}`);
 * console.log(`Total addresses: ${parsed.totalAddresses}`);
 */
export function parseCidr(cidr: string): ParsedCidr {
  const validation = validateCidr(cidr);
  if (!validation.valid) {
    throw new Error(`Invalid CIDR: ${validation.errors.join(", ")}`);
  }

  const match = cidr.match(IPV4_REGEX)!;
  const [, oct1, oct2, oct3, oct4, prefix] = match;
  const ipAddress = `${oct1}.${oct2}.${oct3}.${oct4}`;
  const prefixLength = Number(prefix);

  const ipNum = ipToNumber(ipAddress);
  const mask = prefixToMask(prefixLength);
  const networkNum = ipNum & mask;
  const broadcastNum = networkNum | (~mask >>> 0);

  const totalAddresses = Math.pow(2, 32 - prefixLength);
  const firstIpNum = networkNum;
  const lastIpNum = broadcastNum;

  return {
    cidr,
    network: numberToIp(networkNum),
    prefix: prefixLength,
    firstIp: numberToIp(firstIpNum),
    lastIp: numberToIp(lastIpNum),
    totalAddresses,
    netmask: numberToIp(mask),
  };
}

/**
 * Check if two CIDRs overlap
 *
 * @param cidr1 - First CIDR block
 * @param cidr2 - Second CIDR block
 * @returns True if the CIDRs overlap
 *
 * @example
 * const overlaps = checkOverlap("10.0.0.0/16", "10.0.1.0/24");
 * console.log(overlaps); // true
 */
export function checkOverlap(cidr1: string, cidr2: string): boolean {
  const parsed1 = parseCidr(cidr1);
  const parsed2 = parseCidr(cidr2);

  const start1 = ipToNumber(parsed1.firstIp);
  const end1 = ipToNumber(parsed1.lastIp);
  const start2 = ipToNumber(parsed2.firstIp);
  const end2 = ipToNumber(parsed2.lastIp);

  // Check if ranges overlap
  return !(end1 < start2 || end2 < start1);
}

/**
 * Validate that multiple CIDRs don't overlap
 *
 * @param cidrs - Array of CIDR blocks to check
 * @returns Validation result with details of any overlaps
 *
 * @example
 * const result = validateNoOverlaps([
 *   "10.0.0.0/16",
 *   "10.1.0.0/16",
 *   "10.0.1.0/24"
 * ]);
 * if (!result.valid) {
 *   console.error("Overlapping CIDRs:", result.errors);
 * }
 */
export function validateNoOverlaps(cidrs: string[]): CidrValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // First validate each CIDR individually
  for (const cidr of cidrs) {
    const validation = validateCidr(cidr);
    if (!validation.valid) {
      errors.push(`Invalid CIDR ${cidr}: ${validation.errors.join(", ")}`);
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // Check for overlaps
  for (let i = 0; i < cidrs.length; i++) {
    for (let j = i + 1; j < cidrs.length; j++) {
      if (checkOverlap(cidrs[i], cidrs[j])) {
        errors.push(`CIDRs overlap: ${cidrs[i]} and ${cidrs[j]}`);
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Check if a child CIDR is contained within a parent CIDR
 *
 * @param parentCidr - Parent CIDR block
 * @param childCidr - Child CIDR block to check
 * @returns True if child is fully contained in parent
 *
 * @example
 * const contained = isContained("10.0.0.0/16", "10.0.1.0/24");
 * console.log(contained); // true
 */
export function isContained(parentCidr: string, childCidr: string): boolean {
  const parent = parseCidr(parentCidr);
  const child = parseCidr(childCidr);

  const parentStart = ipToNumber(parent.firstIp);
  const parentEnd = ipToNumber(parent.lastIp);
  const childStart = ipToNumber(child.firstIp);
  const childEnd = ipToNumber(child.lastIp);

  // Child must be fully within parent range
  return childStart >= parentStart && childEnd <= parentEnd;
}

/**
 * Validate that multiple child CIDRs are all contained within a parent CIDR
 *
 * @param parentCidr - Parent CIDR block
 * @param childCidrs - Array of child CIDR blocks
 * @returns Validation result with details of any containment violations
 *
 * @example
 * const result = validateContainment("10.0.0.0/16", [
 *   "10.0.1.0/24",
 *   "10.0.2.0/24"
 * ]);
 * if (!result.valid) {
 *   console.error("Containment violations:", result.errors);
 * }
 */
export function validateContainment(
  parentCidr: string,
  childCidrs: string[],
): CidrValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate parent CIDR
  const parentValidation = validateCidr(parentCidr);
  if (!parentValidation.valid) {
    errors.push(
      `Invalid parent CIDR ${parentCidr}: ${parentValidation.errors.join(", ")}`,
    );
    return { valid: false, errors, warnings };
  }

  // Validate each child CIDR
  for (const childCidr of childCidrs) {
    const childValidation = validateCidr(childCidr);
    if (!childValidation.valid) {
      errors.push(
        `Invalid child CIDR ${childCidr}: ${childValidation.errors.join(", ")}`,
      );
      continue;
    }

    // Check containment
    if (!isContained(parentCidr, childCidr)) {
      errors.push(
        `Child CIDR ${childCidr} is not contained within parent CIDR ${parentCidr}`,
      );
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Convert an IP address string to a 32-bit number
 *
 * @param ip - IP address string (e.g., "10.0.0.1")
 * @returns 32-bit number representation
 *
 * @example
 * const num = ipToNumber("10.0.0.1");
 * console.log(num); // 167772161
 */
export function ipToNumber(ip: string): number {
  const octets = ip.split(".").map(Number);
  return (
    ((octets[0] << 24) >>> 0) +
    ((octets[1] << 16) >>> 0) +
    ((octets[2] << 8) >>> 0) +
    octets[3]
  );
}

/**
 * Convert a 32-bit number to an IP address string
 *
 * @param num - 32-bit number representation
 * @returns IP address string
 *
 * @example
 * const ip = numberToIp(167772161);
 * console.log(ip); // "10.0.0.1"
 */
export function numberToIp(num: number): string {
  return [
    (num >>> 24) & 0xff,
    (num >>> 16) & 0xff,
    (num >>> 8) & 0xff,
    num & 0xff,
  ].join(".");
}

/**
 * Convert a prefix length to a netmask number
 *
 * @param prefix - Prefix length (0-32)
 * @returns 32-bit netmask number
 *
 * @example
 * const mask = prefixToMask(24);
 * const maskIp = numberToIp(mask);
 * console.log(maskIp); // "255.255.255.0"
 */
export function prefixToMask(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}
