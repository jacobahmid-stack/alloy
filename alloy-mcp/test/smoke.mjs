// End-to-end MCP smoke test: spawns the stdio server and drives it through a REAL MCP client
// (initialize -> tools/list -> tools/call). Proves the full protocol path, not just a handshake.
// funding_fit is pure (no box, no key), so this runs offline. Run: node test/smoke.mjs
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({ command: "node", args: ["src/index.mjs"] });
const client = new Client({ name: "alloy-smoke", version: "0.1.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("tools/list ->", tools.map((t) => t.name).join(", "));

for (const pc of ["aws", "azure", "gcp"]) {
  const r = await client.callTool({
    name: "alloy_funding_fit",
    arguments: { cloud: "on-prem", partner_cloud: pc, employees: 200, annual_opp_sek: 2000000, has_contact: true },
  });
  const fit = JSON.parse(r.content[0].text);
  console.log(`tools/call funding_fit [${pc}] -> program: "${fit.program}", icp ${fit.icp_score} (${fit.icp_band}), est $${fit.estimated_funding_usd}`);
}

await client.close();
console.log("OK: full MCP path works (initialize, tools/list, tools/call).");
