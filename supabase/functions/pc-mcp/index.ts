// Partner Central agents MCP — SigV4-signed JSON-RPC client (Supabase Edge / Deno).
//
// ⚠️ NOT DEPLOYED. Gated behind the dedicated IAM identity (handover §5 decision #1)
// and Partner Central console migration (§5 decision #2). Until a least-privilege IAM
// user/role (Appendix C policy) exists and its keys are set as Supabase secrets
// (PC_AWS_*), this returns HTTP 403 (AccessDenied on partnercentral:UseSession) — that
// 403 IS the confirmation the permission set is the blocker, not a code bug.
//
// Do NOT set PC_AWS_* secrets or deploy this until Jacob provisions the IAM identity.
// The SSO ViewOnlyAccess login (jacob@novalo.se) must NOT be used here, and the earlier
// exposed creds are BURNED — never reference them.

import { AwsClient } from "npm:aws4fetch@1"; // fallback: "https://esm.sh/aws4fetch@1"

const ENDPOINT = "https://partnercentral-agents-mcp.us-east-1.api.aws/mcp";

const aws = new AwsClient({
  accessKeyId: Deno.env.get("PC_AWS_ACCESS_KEY_ID")!,
  secretAccessKey: Deno.env.get("PC_AWS_SECRET_ACCESS_KEY")!,
  sessionToken: Deno.env.get("PC_AWS_SESSION_TOKEN") || undefined, // only for temp/STS creds
  service: "partnercentral-agents-mcp",
  region: "us-east-1",
});

let rpcId = 0;

async function rpc(method: string, params: Record<string, unknown>) {
  const res = await aws.fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "accept": "application/json, text/event-stream", // server may answer JSON or SSE
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++rpcId, method, params }),
  });
  if (!res.ok) throw new Error(`MCP ${res.status}: ${await res.text()}`); // 403 => missing UseSession

  const ct = res.headers.get("content-type") ?? "";
  if (ct.includes("text/event-stream")) {
    const raw = await res.text();
    const last = raw.split("\n").filter((l) => l.startsWith("data:"))
      .map((l) => l.slice(5).trim()).filter(Boolean).pop();
    return last ? JSON.parse(last) : null;
  }
  return await res.json();
}

// catalog "Sandbox" = isolated test data; "AWS" = real opportunities.
function sendMessage(text: string, opts: { catalog?: "Sandbox" | "AWS"; sessionId?: string } = {}) {
  const args: Record<string, unknown> = {
    content: [{ type: "text", text }],
    catalog: opts.catalog ?? "Sandbox",
  };
  if (opts.sessionId) args.sessionId = opts.sessionId; // continue a conversation
  return rpc("tools/call", { name: "sendMessage", arguments: args });
}

Deno.serve(async (req) => {
  try {
    const { text = "Hello, what can you help me with?", catalog = "Sandbox", sessionId } =
      req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const out = await sendMessage(text, { catalog, sessionId });
    const result = out?.result ?? out; // exact result schema is in the MCP tools reference
    return Response.json({
      ok: true,
      sessionId: result?.sessionId ?? result?.session_id ?? null,
      result,
    });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});
