// ads-pull — AWS Lambda for Alloy v2 migration agent.
// Assumes a CUSTOMER's cross-account read-only role, pulls AWS Application Discovery Service (ADS)
// server inventory, and returns it RAW for Alloy's measured migration assessment (the LLM reads the
// ADS fields directly — no fragile field mapping here). Runtime: nodejs20.x (AWS SDK v3 is built in).
//
// ⚠️ UNTESTED until first real deploy — validate against live ADS data (exact region + whether you
// need the export path for utilization time-series). Deploy via template.yaml (SAM). See README.md.
import { STSClient, AssumeRoleCommand } from "@aws-sdk/client-sts";
import {
  ApplicationDiscoveryServiceClient,
  GetDiscoverySummaryCommand,
  ListConfigurationsCommand,
  DescribeConfigurationsCommand,
} from "@aws-sdk/client-application-discovery-service";

const SHARED_SECRET = process.env.ALLOY_SHARED_SECRET || "";
const json = (statusCode, obj) => ({ statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(obj) });

export const handler = async (event) => {
  // Lambda Function URL: JSON body + a shared-secret header (swap to AWS_IAM auth once Alloy signs).
  let body = {};
  try { body = JSON.parse(event?.body || "{}"); } catch { /* leave {} */ }
  const headers = event?.headers || {};
  const secret = headers["x-alloy-secret"] || headers["X-Alloy-Secret"] || "";
  if (SHARED_SECRET && secret !== SHARED_SECRET) return json(401, { error: "unauthorized" });

  const roleArn = String(body.roleArn || "").trim();
  const externalId = body.externalId ? String(body.externalId) : undefined;
  const region = String(body.region || "us-west-2").trim(); // ADS home region — confirm per customer
  const max = Math.min(Math.max(Number(body.limit) || 200, 1), 1000);
  if (!roleArn) return json(400, { error: "roleArn required" });

  try {
    // 1) Assume the customer's cross-account read-only role (this Lambda's exec role must allow sts:AssumeRole).
    const sts = new STSClient({});
    const a = await sts.send(new AssumeRoleCommand({
      RoleArn: roleArn, RoleSessionName: "alloy-ads-pull", ExternalId: externalId, DurationSeconds: 3600,
    }));
    const credentials = {
      accessKeyId: a.Credentials.AccessKeyId,
      secretAccessKey: a.Credentials.SecretAccessKey,
      sessionToken: a.Credentials.SessionToken,
    };

    // 2) Read ADS in the customer account.
    const ads = new ApplicationDiscoveryServiceClient({ region, credentials });
    const summary = await ads.send(new GetDiscoverySummaryCommand({}));

    // 3) List SERVER configuration ids (paginated), then describe in batches of 100 — return RAW configs.
    const ids = [];
    let token;
    do {
      const page = await ads.send(new ListConfigurationsCommand({ configurationType: "SERVER", maxResults: 100, nextToken: token }));
      for (const c of (page.configurations || [])) {
        const id = c["server.configurationId"] || c.configurationId;
        if (id) ids.push(id);
      }
      token = page.nextToken;
    } while (token && ids.length < max);

    const servers = [];
    for (let i = 0; i < Math.min(ids.length, max); i += 100) {
      const d = await ads.send(new DescribeConfigurationsCommand({ configurationIds: ids.slice(i, i + 100) }));
      servers.push(...(d.configurations || []));
    }

    return json(200, { ok: true, region, serverCount: servers.length, summary, servers });
  } catch (e) {
    return json(502, { error: String(e?.name || "error") + ": " + String(e?.message || e).slice(0, 200) });
  }
};
