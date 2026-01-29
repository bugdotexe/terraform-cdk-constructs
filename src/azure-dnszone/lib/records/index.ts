/**
 * Azure Public DNS Zone Records module
 *
 * This module exports all Public DNS Zone record types and their schemas.
 *
 * Supported Record Types:
 * - DnsARecord (A records with IPv4 addresses)
 * - DnsAaaaRecord (AAAA records with IPv6 addresses)
 * - DnsCaaRecord (CAA records - PUBLIC DNS ONLY)
 * - DnsCnameRecord (CNAME records)
 * - DnsMxRecord (MX records)
 * - DnsNsRecord (NS records - PUBLIC DNS ONLY)
 * - DnsPtrRecord (PTR records)
 * - DnsSoaRecord (SOA records)
 * - DnsSrvRecord (SRV records)
 * - DnsTxtRecord (TXT records)
 */

// Export schemas
export * from "./dns-record-schemas";

// Export record implementations
export * from "./dns-records";
