/**
 * Unit tests for Azure Public DNS Zone Record implementations
 *
 * This test suite validates all 10 Public DNS record types:
 * - DnsARecord
 * - DnsAaaaRecord
 * - DnsCaaRecord (Public DNS only)
 * - DnsCnameRecord
 * - DnsMxRecord
 * - DnsNsRecord (Public DNS only)
 * - DnsPtrRecord
 * - DnsSoaRecord
 * - DnsSrvRecord
 * - DnsTxtRecord
 *
 * Tests verify basic creation, correct resource types, API versions,
 * parent ID resolution, resource body structure, TTL handling,
 * record-specific properties, metadata handling, and alias record support.
 */

import { Testing } from "cdktf";
import * as cdktf from "cdktf";
import {
  DnsARecord,
  DnsAaaaRecord,
  DnsCaaRecord,
  DnsCnameRecord,
  DnsMxRecord,
  DnsNsRecord,
  DnsPtrRecord,
  DnsSoaRecord,
  DnsSrvRecord,
  DnsTxtRecord,
} from "../lib/records";
import {
  DNS_A_RECORD_TYPE,
  DNS_AAAA_RECORD_TYPE,
  DNS_CAA_RECORD_TYPE,
  DNS_CNAME_RECORD_TYPE,
  DNS_MX_RECORD_TYPE,
  DNS_NS_RECORD_TYPE,
  DNS_PTR_RECORD_TYPE,
  DNS_SOA_RECORD_TYPE,
  DNS_SRV_RECORD_TYPE,
  DNS_TXT_RECORD_TYPE,
} from "../lib/records/dns-record-schemas";

// Sample DNS Zone ID for testing
const SAMPLE_ZONE_ID =
  "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/rg-test/providers/Microsoft.Network/dnsZones/example.com";

// Sample Public IP ID for alias record testing
const SAMPLE_PUBLIC_IP_ID =
  "/subscriptions/12345678-1234-1234-1234-123456789012/resourceGroups/rg-test/providers/Microsoft.Network/publicIPAddresses/myPublicIP";

describe("DnsARecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an A record with required properties", () => {
      const record = new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      expect(record).toBeInstanceOf(DnsARecord);
      expect(record.props.name).toBe("www");
      expect(record.props.dnsZoneId).toBe(SAMPLE_ZONE_ID);
      expect(record.props.records).toHaveLength(1);
      expect(record.props.records![0].ipv4Address).toBe("20.30.40.50");
    });

    it("should create an A record with multiple IP addresses", () => {
      const record = new DnsARecord(stack, "test-a-record-multi", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { ipv4Address: "20.30.40.50" },
          { ipv4Address: "20.30.40.51" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });

    it("should create an apex A record with @ name", () => {
      const record = new DnsARecord(stack, "test-a-record-apex", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      expect(record.props.name).toBe("@");
    });
  });

  describe("Alias Record Support", () => {
    it("should create an alias A record with targetResourceId", () => {
      const record = new DnsARecord(stack, "test-a-record-alias", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        targetResourceId: SAMPLE_PUBLIC_IP_ID,
      });

      expect(record.props.targetResourceId).toBe(SAMPLE_PUBLIC_IP_ID);
      expect(record.props.records).toBeUndefined();
    });

    it("should include targetResource in synthesized output for alias records", () => {
      new DnsARecord(stack, "test-a-record-alias", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        targetResourceId: SAMPLE_PUBLIC_IP_ID,
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("targetResource");
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_A_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Parent ID Resolution", () => {
    it("should set parentId to the zone ID", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(SAMPLE_ZONE_ID);
    });
  });

  describe("TTL Handling", () => {
    it("should use default TTL of 3600 when not specified", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("3600");
    });

    it("should use custom TTL when specified", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        ttl: 300,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("300");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include ARecords in the body with PascalCase", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("ARecords");
      expect(synthesized).toContain("ipv4Address");
      expect(synthesized).toContain("20.30.40.50");
    });

    it("should use TTL with uppercase in public DNS", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("TTL");
    });
  });

  describe("Metadata Handling", () => {
    it("should include metadata when provided", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
        metadata: { environment: "production", owner: "team-a" },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("metadata");
      expect(synthesized).toContain("environment");
      expect(synthesized).toContain("production");
    });
  });

  describe("Outputs", () => {
    it("should create required outputs", () => {
      const record = new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      expect(record.idOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(record.nameOutput).toBeInstanceOf(cdktf.TerraformOutput);
      expect(record.fqdnOutput).toBeInstanceOf(cdktf.TerraformOutput);
    });

    it("should provide fqdn property", () => {
      const record = new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      expect(record.fqdn).toBeDefined();
      expect(typeof record.fqdn).toBe("string");
    });
  });
});

describe("DnsAaaaRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an AAAA record with required properties", () => {
      const record = new DnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      expect(record).toBeInstanceOf(DnsAaaaRecord);
      expect(record.props.name).toBe("www");
      expect(record.props.records![0].ipv6Address).toBe("2001:db8::1");
    });

    it("should create an AAAA record with multiple IPv6 addresses", () => {
      const record = new DnsAaaaRecord(stack, "test-aaaa-record-multi", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { ipv6Address: "2001:db8::1" },
          { ipv6Address: "2001:db8::2" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Alias Record Support", () => {
    it("should create an alias AAAA record with targetResourceId", () => {
      const record = new DnsAaaaRecord(stack, "test-aaaa-record-alias", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        targetResourceId: SAMPLE_PUBLIC_IP_ID,
      });

      expect(record.props.targetResourceId).toBe(SAMPLE_PUBLIC_IP_ID);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_AAAA_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include AAAARecords in the body with PascalCase", () => {
      new DnsAaaaRecord(stack, "test-aaaa-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("AAAARecords");
      expect(synthesized).toContain("ipv6Address");
      expect(synthesized).toContain("2001:db8::1");
    });
  });
});

describe("DnsCaaRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a CAA record with required properties", () => {
      const record = new DnsCaaRecord(stack, "test-caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      expect(record).toBeInstanceOf(DnsCaaRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.records[0].flags).toBe(0);
      expect(record.props.records[0].tag).toBe("issue");
      expect(record.props.records[0].value).toBe("letsencrypt.org");
    });

    it("should create a CAA record with multiple entries", () => {
      const record = new DnsCaaRecord(stack, "test-caa-record-multi", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { flags: 0, tag: "issue", value: "letsencrypt.org" },
          { flags: 0, tag: "issuewild", value: ";" },
          { flags: 0, tag: "iodef", value: "mailto:security@example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(3);
    });

    it("should create a CAA record with critical flag", () => {
      const record = new DnsCaaRecord(stack, "test-caa-record-critical", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 128, tag: "issue", value: "letsencrypt.org" }],
      });

      expect(record.props.records[0].flags).toBe(128);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsCaaRecord(stack, "test-caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_CAA_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsCaaRecord(stack, "test-caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include caaRecords in the body", () => {
      new DnsCaaRecord(stack, "test-caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("caaRecords");
      expect(synthesized).toContain("flags");
      expect(synthesized).toContain("tag");
      expect(synthesized).toContain("issue");
    });
  });
});

describe("DnsCnameRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a CNAME record with required properties", () => {
      const record = new DnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      expect(record).toBeInstanceOf(DnsCnameRecord);
      expect(record.props.name).toBe("app");
      expect(record.props.cname).toBe("www.example.com");
    });
  });

  describe("Alias Record Support", () => {
    it("should create an alias CNAME record with targetResourceId", () => {
      const record = new DnsCnameRecord(stack, "test-cname-record-alias", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        targetResourceId: SAMPLE_PUBLIC_IP_ID,
      });

      expect(record.props.targetResourceId).toBe(SAMPLE_PUBLIC_IP_ID);
      expect(record.props.cname).toBeUndefined();
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_CNAME_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include CNAMERecord in the body with PascalCase", () => {
      new DnsCnameRecord(stack, "test-cname-record", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("CNAMERecord");
      expect(synthesized).toContain("cname");
      expect(synthesized).toContain("www.example.com");
    });
  });
});

describe("DnsMxRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an MX record with required properties", () => {
      const record = new DnsMxRecord(stack, "test-mx-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.example.com" }],
      });

      expect(record).toBeInstanceOf(DnsMxRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.records[0].preference).toBe(10);
      expect(record.props.records[0].exchange).toBe("mail1.example.com");
    });

    it("should create an MX record with multiple mail servers", () => {
      const record = new DnsMxRecord(stack, "test-mx-record-multi", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { preference: 10, exchange: "mail1.example.com" },
          { preference: 20, exchange: "mail2.example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsMxRecord(stack, "test-mx-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_MX_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsMxRecord(stack, "test-mx-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.example.com" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include MXRecords in the body with PascalCase", () => {
      new DnsMxRecord(stack, "test-mx-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ preference: 10, exchange: "mail1.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("MXRecords");
      expect(synthesized).toContain("preference");
      expect(synthesized).toContain("exchange");
    });
  });
});

describe("DnsNsRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an NS record with required properties", () => {
      const record = new DnsNsRecord(stack, "test-ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.subdomain.example.com" }],
      });

      expect(record).toBeInstanceOf(DnsNsRecord);
      expect(record.props.name).toBe("subdomain");
      expect(record.props.records[0].nsdname).toBe("ns1.subdomain.example.com");
    });

    it("should create an NS record with multiple name servers", () => {
      const record = new DnsNsRecord(stack, "test-ns-record-multi", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { nsdname: "ns1.subdomain.example.com" },
          { nsdname: "ns2.subdomain.example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsNsRecord(stack, "test-ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.subdomain.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_NS_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsNsRecord(stack, "test-ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.subdomain.example.com" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include NSRecords in the body with PascalCase", () => {
      new DnsNsRecord(stack, "test-ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.subdomain.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("NSRecords");
      expect(synthesized).toContain("nsdname");
    });
  });
});

describe("DnsPtrRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a PTR record with required properties", () => {
      const record = new DnsPtrRecord(stack, "test-ptr-record", {
        name: "50",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.example.com" }],
      });

      expect(record).toBeInstanceOf(DnsPtrRecord);
      expect(record.props.name).toBe("50");
      expect(record.props.records[0].ptrdname).toBe("server1.example.com");
    });

    it("should create a PTR record with multiple targets", () => {
      const record = new DnsPtrRecord(stack, "test-ptr-record-multi", {
        name: "50",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { ptrdname: "server1.example.com" },
          { ptrdname: "server1-alias.example.com" },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsPtrRecord(stack, "test-ptr-record", {
        name: "50",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_PTR_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsPtrRecord(stack, "test-ptr-record", {
        name: "50",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.example.com" }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include PTRRecords in the body with PascalCase", () => {
      new DnsPtrRecord(stack, "test-ptr-record", {
        name: "50",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ptrdname: "server1.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("PTRRecords");
      expect(synthesized).toContain("ptrdname");
    });
  });
});

describe("DnsSoaRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a SOA record with required properties", () => {
      const record = new DnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      expect(record).toBeInstanceOf(DnsSoaRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.soaRecord.email).toBe("admin.example.com");
    });

    it("should create a SOA record with all optional properties", () => {
      const record = new DnsSoaRecord(stack, "test-soa-record-full", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
          host: "ns1.example.com",
          serialNumber: 1,
          refreshTime: 3600,
          retryTime: 300,
          expireTime: 2419200,
          minimumTTL: 300,
        },
      });

      expect(record.props.soaRecord.host).toBe("ns1.example.com");
      expect(record.props.soaRecord.refreshTime).toBe(3600);
      expect(record.props.soaRecord.retryTime).toBe(300);
      expect(record.props.soaRecord.expireTime).toBe(2419200);
      expect(record.props.soaRecord.minimumTTL).toBe(300);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_SOA_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
        },
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include SOARecord in the body with PascalCase", () => {
      new DnsSoaRecord(stack, "test-soa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        soaRecord: {
          email: "admin.example.com",
          refreshTime: 3600,
        },
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("SOARecord");
      expect(synthesized).toContain("email");
      expect(synthesized).toContain("refreshTime");
    });
  });
});

describe("DnsSrvRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create an SRV record with required properties", () => {
      const record = new DnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.example.com",
          },
        ],
      });

      expect(record).toBeInstanceOf(DnsSrvRecord);
      expect(record.props.name).toBe("_sip._tcp");
      expect(record.props.records[0].priority).toBe(10);
      expect(record.props.records[0].weight).toBe(60);
      expect(record.props.records[0].port).toBe(5060);
      expect(record.props.records[0].target).toBe("sipserver1.example.com");
    });

    it("should create an SRV record with multiple servers", () => {
      const record = new DnsSrvRecord(stack, "test-srv-record-multi", {
        name: "_sip._tcp",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.example.com",
          },
          {
            priority: 10,
            weight: 40,
            port: 5060,
            target: "sipserver2.example.com",
          },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });
  });

  describe("Resource Type and API Version", () => {
    it("should set correct resource type", () => {
      new DnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.example.com",
          },
        ],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_SRV_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.example.com",
          },
        ],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include SRVRecords in the body with PascalCase", () => {
      new DnsSrvRecord(stack, "test-srv-record", {
        name: "_sip._tcp",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          {
            priority: 10,
            weight: 60,
            port: 5060,
            target: "sipserver1.example.com",
          },
        ],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("SRVRecords");
      expect(synthesized).toContain("priority");
      expect(synthesized).toContain("weight");
      expect(synthesized).toContain("port");
      expect(synthesized).toContain("target");
    });
  });
});

describe("DnsTxtRecord", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Basic Creation", () => {
    it("should create a TXT record with required properties", () => {
      const record = new DnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
        ],
      });

      expect(record).toBeInstanceOf(DnsTxtRecord);
      expect(record.props.name).toBe("@");
      expect(record.props.records[0].value).toContain(
        "v=spf1 include:spf.protection.outlook.com -all",
      );
    });

    it("should create a TXT record with multiple entries", () => {
      const record = new DnsTxtRecord(stack, "test-txt-record-multi", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [
          { value: ["v=spf1 include:spf.protection.outlook.com -all"] },
          { value: ["google-site-verification=abc123"] },
        ],
      });

      expect(record.props.records).toHaveLength(2);
    });

    it("should handle TXT record with multiple string values", () => {
      const record = new DnsTxtRecord(stack, "test-txt-record-split", {
        name: "_dmarc",
        dnsZoneId: SAMPLE_ZONE_ID,
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
      new DnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_TXT_RECORD_TYPE);
    });

    it("should use correct API version", () => {
      const record = new DnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      expect(record.resolvedApiVersion).toBe("2018-05-01");
    });
  });

  describe("Resource Body Structure", () => {
    it("should include TXTRecords in the body with PascalCase", () => {
      new DnsTxtRecord(stack, "test-txt-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ value: ["v=spf1 -all"] }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain("TXTRecords");
      expect(synthesized).toContain("value");
    });
  });
});

describe("Public DNS Records - Cross-cutting Concerns", () => {
  let app: cdktf.App;
  let stack: cdktf.TerraformStack;

  beforeEach(() => {
    app = Testing.app();
    stack = new cdktf.TerraformStack(app, "TestStack");
  });

  describe("Multiple Record Types in Same Stack", () => {
    it("should handle multiple record types in the same stack", () => {
      new DnsARecord(stack, "a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      new DnsAaaaRecord(stack, "aaaa-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv6Address: "2001:db8::1" }],
      });

      new DnsCnameRecord(stack, "cname-record", {
        name: "app",
        dnsZoneId: SAMPLE_ZONE_ID,
        cname: "www.example.com",
      });

      new DnsCaaRecord(stack, "caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      new DnsNsRecord(stack, "ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.example.com" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toContain(DNS_A_RECORD_TYPE);
      expect(synthesized).toContain(DNS_AAAA_RECORD_TYPE);
      expect(synthesized).toContain(DNS_CNAME_RECORD_TYPE);
      expect(synthesized).toContain(DNS_CAA_RECORD_TYPE);
      expect(synthesized).toContain(DNS_NS_RECORD_TYPE);
    });
  });

  describe("Terraform Synthesis", () => {
    it("should synthesize valid Terraform configuration", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      expect(synthesized).toBeDefined();

      const stackConfig = JSON.parse(synthesized);
      expect(stackConfig.resource).toBeDefined();
    });
  });

  describe("Public DNS vs Private DNS Differences", () => {
    it("should use PascalCase property names for public DNS", () => {
      new DnsARecord(stack, "test-a-record", {
        name: "www",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ ipv4Address: "20.30.40.50" }],
      });

      const synthesized = Testing.synth(stack);
      // Public DNS uses PascalCase (ARecords, TTL)
      expect(synthesized).toContain("ARecords");
      expect(synthesized).toContain("TTL");
    });

    it("should support CAA records (public DNS only)", () => {
      const record = new DnsCaaRecord(stack, "caa-record", {
        name: "@",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ flags: 0, tag: "issue", value: "letsencrypt.org" }],
      });

      expect(record).toBeInstanceOf(DnsCaaRecord);
    });

    it("should support NS records (public DNS only)", () => {
      const record = new DnsNsRecord(stack, "ns-record", {
        name: "subdomain",
        dnsZoneId: SAMPLE_ZONE_ID,
        records: [{ nsdname: "ns1.example.com" }],
      });

      expect(record).toBeInstanceOf(DnsNsRecord);
    });
  });
});
