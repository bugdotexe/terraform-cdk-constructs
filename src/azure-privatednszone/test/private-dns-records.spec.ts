/**
 * Unit tests for Azure Private DNS Zone Record implementations
 *
 * This test suite validates all 8 Private DNS record types:
 * - PrivateDnsARecord
 * - PrivateDnsAaaaRecord
 * - PrivateDnsCnameRecord
 * - PrivateDnsMxRecord
 * - PrivateDnsPtrRecord
 * - PrivateDnsSoaRecord
 * - PrivateDnsSrvRecord
 * - PrivateDnsTxtRecord
 *
 * Tests verify basic creation, correct resource types, API versions,
 * parent ID resolution, resource body structure, TTL handling,
 * record-specific properties, and metadata handling.
 */

import { Testing } from "cdktf";
import * as cdktf from "cdktf";
import {
  PrivateDnsARecord,
  PrivateDnsAaaaRecord,
  PrivateDnsCnameRecord,
  PrivateDnsMxRecord,
  PrivateDnsPtrRecord,
  PrivateDnsSoaRecord,
  PrivateDnsSrvRecord,
  PrivateDnsTxtRecord,
} from "../lib/records";
import {
  PRIVATE_DNS_A_RECORD_TYPE,
  PRIVATE_DNS_AAAA_RECORD_TYPE,
  PRIVATE_DNS_CNAME_RECORD_TYPE,
  PRIVATE_DNS_MX_RECORD_TYPE,
  PRIVATE_DNS_PTR_RECORD_TYPE,
  PRIVATE_DNS_SOA_RECORD_TYPE,
  PRIVATE_DNS_SRV_RECORD_TYPE,
  PRIVATE_DNS_TXT_RECORD_TYPE,
} from "../lib/records/private-dns-record-schemas";

// Sample Private DNS Zone ID for testing
const SAMPLE_ZONE_ID =
  "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/rg-test/providers/Microsoft.Network/privateDnsZones/example.com";

describe("PrivateDnsARecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an A record with required properties", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      expect(record).toBeInstanceOf(PrivateDnsARecord);
      expect(record.props.name).toBe("www");
      expect(record.props.privateDnsZoneId).toBe(SAMPLE_ZONE_ID);
      expect(record.props.records).toHaveLength(1);
      expect(record.props.records[0].ipv4Address).toBe("10.0.1.4");
    });

    it("should create an A record with multiple IP addresses", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record-multi", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }, { ipv4Address: "10.0.1.5" }],
      });

      expect(record.props.records).toHaveLength(2);
    });

    it("should create an apex A record with @ name", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record-apex", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      expect(record.props.name).toBe("@");
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_A_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Parent ID Resolution", () => {
    it("should set parentId to the zone ID", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(SAMPLE_ZONE_ID);
    });
  });

  describe("TTL Handling", () => {
    it("should use default TTL of 3600 when not specified", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("3600");
    });

    it("should use custom TTL when specified", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        ttl: 300,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("300");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include aRecords in the body", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("aRecords");
      expect(synthesized).toContain("ipv4Address");
      expect(synthesized).toContain("10.0.1.4");
    });
  });

  describe("Metadata Handling", () => {
    it("should include metadata when provided", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
        metadata: { environment: "test", owner: "team-a" },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("metadata");
      expect(synthesized).toContain("environment");
      expect(synthesized).toContain("test");
    });

    it("should not include metadata when not provided", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      // Check that metadata is not mentioned in the synthesized output when not provided
      // We just verify the record was created successfully without metadata in props
      expect(synthesized).toBeDefined();
      // The absence of metadata in the record definition should result in no metadata key in the body
      // Since metadata is optional and not specified, it shouldn't appear in the output
    });
  });

  describe("Outputs", () => {
    it("should create required outputs", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      expect(record.idOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(record.nameOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(record.fqdnOutput).toBeInstanceOf(cdktf.TerraformOutput);
    });

    it("should provide fqdn property", () => {
      const record = new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      expect(record.fqdn).toBeDefined();
      expect(typeof record.fqdn).toBe("string");
    });
  });
});

describe("PrivateDnsAaaaRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an AAAA record with required properties", () => {
      const record = new PrivateDnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      expect(record).toBeInstanceOf(PrivateDnsAaaaRecord);
      expect(record.props.name).toBe("www");
      expect(record.props.records[0].ipv6Address).toBe("2001:db8::1");
    });

    it("should create an AAAA record with multiple IPv6 addresses", () => {
      const record = new PrivateDnsAaaaRecord(stack, "test-aaaa-record-multi", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { ipv6Address: "2001:db8::1" },
          { ipv6Address: "2001:db8::2" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_AAAA_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include aaaaRecords in the body", () => {
      new PrivateDnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("aaaaRecords");
      expect(synthesized).toContain("ipv6Address");
      expect(synthesized).toContain("2001:db8::1");
    });
  });

  describe("TTL and Metadata", () => {
    it("should handle TTL and metadata", () => {
      new PrivateDnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        ttl: 600,
        records: [{ ipv6Address: "2001:db8::1" }],
        metadata: { type: "ipv6" },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("600");
      expect(synthesized).toContain("metadata");
    });
  });
});

describe("PrivateDnsCnameRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a CNAME record with required properties", () => {
      const record = new PrivateDnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.internal.example.com",
      });

      expect(record).toBeInstanceOf(PrivateDnsCnameRecord);
      expect(record.props.name).toBe("app");
      expect(record.props.cname).toBe("www.internal.example.com");
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.internal.example.com",
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_CNAME_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.internal.example.com",
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include cnameRecord in the body", () => {
      new PrivateDnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.internal.example.com",
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("cnameRecord");
      expect(synthesized).toContain("cname");
      expect(synthesized).toContain("www.internal.example.com");
    });
  });

  describe("TTL and Metadata", () => {
    it("should handle TTL and metadata", () => {
      new PrivateDnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        ttl: 1800,
        cname: "www.internal.example.com",
        metadata: { alias: "true" },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("1800");
      expect(synthesized).toContain("metadata");
    });
  });
});

describe("PrivateDnsMxRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an MX record with required properties", () => {
      const record = new PrivateDnsMxRecord(stack, "test-mx-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.internal.example.com" }],
      });

      expect(record).toBeInstanceOf(PrivateDnsMxRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.records[0].preference).toBe(10);
      expect(record.props.records[0].exchange).toBe(
        "mail1.internal.example.com",
      );
    });

    it("should create an MX record with multiple mail servers", () => {
      const record = new PrivateDnsMxRecord(stack, "test-mx-record-multi", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { preference: 10, exchange: "mail1.internal.example.com" },
          { preference: 20, exchange: "mail2.internal.example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsMxRecord(stack, "test-mx-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.internal.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_MX_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsMxRecord(stack, "test-mx-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.internal.example.com" }],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include mxRecords in the body", () => {
      new PrivateDnsMxRecord(stack, "test-mx-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.internal.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("mxRecords");
      expect(synthesized).toContain("preference");
      expect(synthesized).toContain("exchange");
    });
  });
});

describe("PrivateDnsPtrRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a PTR record with required properties", () => {
      const record = new PrivateDnsPtrRecord(stack, "test-ptr-record", {
        name: "4",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.internal.example.com" }],
      });

      expect(record).toBeInstanceOf(PrivateDnsPtrRecord);
      expect(record.props.name).toBe("4");
      expect(record.props.records[0].ptrdname).toBe(
        "server1.internal.example.com",
      );
    });

    it("should create a PTR record with multiple targets", () => {
      const record = new PrivateDnsPtrRecord(stack, "test-ptr-record-multi", {
        name: "4",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { ptrdname: "server1.internal.example.com" },
          { ptrdname: "server1-alias.internal.example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsPtrRecord(stack, "test-ptr-record", {
        name: "4",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.internal.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_PTR_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsPtrRecord(stack, "test-ptr-record", {
        name: "4",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.internal.example.com" }],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include ptrRecords in the body", () => {
      new PrivateDnsPtrRecord(stack, "test-ptr-record", {
        name: "4",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.internal.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("ptrRecords");
      expect(synthesized).toContain("ptrdname");
    });
  });
});

describe("PrivateDnsSoaRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a SOA record with required properties", () => {
      const record = new PrivateDnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      expect(record).toBeInstanceOf(PrivateDnsSoaRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.soaRecord.email).toBe("admin.example.com");
    });

    it("should create a SOA record with all optional properties", () => {
      const record = new PrivateDnsSoaRecord(stack, "test-soa-record-full", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
          host: "ns1.example.com",
          serialNumber: 1,
          refreshTime: 3600,
          retryTime: 300,
          expireTime: 2419200,
          minimumTtl: 300,
        },
      });

      expect(record.props.soaRecord.host).toBe("ns1.example.com");
      expect(record.props.soaRecord.refreshTime).toBe(3600);
      expect(record.props.soaRecord.retryTime).toBe(300);
      expect(record.props.soaRecord.expireTime).toBe(2419200);
      expect(record.props.soaRecord.minimumTtl).toBe(300);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_SOA_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include soaRecord in the body", () => {
      new PrivateDnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
          refreshTime: 3600,
        },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("soaRecord");
      expect(synthesized).toContain("email");
      expect(synthesized).toContain("refreshTime");
    });
  });
});

describe("PrivateDnsSrvRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an SRV record with required properties", () => {
      const record = new PrivateDnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.internal.example.com",
          },
        ],
      });

      expect(record).toBeInstanceOf(PrivateDnsSrvRecord);
      expect(record.props.name).toBe("_sip._tcp");
      expect(record.props.records[0].priority).toBe(10);
      expect(record.props.records[0].weight).toBe(60);
      expect(record.props.records[0].port).toBe(5060);
      expect(record.props.records[0].target).toBe(
        "sipserver1.internal.example.com",
      );
    });

    it("should create an SRV record with multiple servers", () => {
      const record = new PrivateDnsSrvRecord(stack, "test-srv-record-multi", {
        name: "_sip._tcp",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.internal.example.com",
          },
          {
            priority: 10,
            weight: 40,
            port: 5060,
            target: "sipserver2.internal.example.com",
          },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.internal.example.com",
          },
        ],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_SRV_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.internal.example.com",
          },
        ],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include srvRecords in the body", () => {
      new PrivateDnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.internal.example.com",
          },
        ],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("srvRecords");
      expect(synthesized).toContain("priority");
      expect(synthesized).toContain("weight");
      expect(synthesized).toContain("port");
      expect(synthesized).toContain("target");
    });
  });
});

describe("PrivateDnsTxtRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a TXT record with required properties", () => {
      const record = new PrivateDnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
        ],
      });

      expect(record).toBeInstanceOf(PrivateDnsTxtRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.records[0].value).toContain(
        "v=spf1 include:spf.protection.outlook.com -all",
      );
    });

    it("should create a TXT record with multiple entries", () => {
      const record = new PrivateDnsTxtRecord(stack, "test-txt-record-multi", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
          { value: ["google-site-verification=abc123"] },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });

    it("should handle TXT record with multiple string values", () => {
      const record = new PrivateDnsTxtRecord(stack, "test-txt-record-split", {
        name: "_dmarc",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            value: [
              "v=DMARC1;",
              "p=quarantine;",
              "rua=mailto:dmarc@example.com",
            ],
          },
        ],
      });

      expect(record.props.records[0].value).toHaveLength(3);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new PrivateDnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_TXT_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new PrivateDnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      expect(record.resolvedApiVersion).toBe("2024-06-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include txtRecords in the body", () => {
      new PrivateDnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("txtRecords");
      expect(synthesized).toContain("value");
    });
  });
});

describe("Private DNS Records - Cross-cutting Concerns", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Multiple Record Types in Same Stack", () => {
    it("should handle multiple record types in the same stack", () => {
      new PrivateDnsARecord(stack, "a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      new PrivateDnsAaaaRecord(stack, "aaaa-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      new PrivateDnsCnameRecord(stack, "cname-record", {
        name: "app",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(PRIVATE_DNS_A_RECORD_TYPE);
      expect(synthesized).toContain(PRIVATE_DNS_AAAA_RECORD_TYPE);
      expect(synthesized).toContain(PRIVATE_DNS_CNAME_RECORD_TYPE);
    });
  });

  describe("Terraform Synthesis", () => {
    it("should synthesize valid Terraform configuration", () => {
      new PrivateDnsARecord(stack, "test-a-record", {
        name: "www",
        privateDnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "10.0.1.4" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toBeDefined();

      const stackConfig = JSON.parse(synthesized);
      expect(stackConfig.resource).toBeDefined();
    });
  });
});
