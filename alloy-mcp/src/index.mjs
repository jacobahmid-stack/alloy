#!/usr/bin/env node
// Alloy MCP server, stdio entry (local + Claude Desktop / Claude Code). For the remote transport that
// Amazon Quick and partner tenants connect to, see src/http.mjs.
//
// TWO TOOL SURFACES, AND THE DIFFERENCE IS DELIBERATE.
//   src/server.mjs  createAlloyServer()  shared by BOTH entries, so anything registered there is
//                                        reachable by any partner tenant holding an ALLOY_MCP_TOKEN.
//   src/desk.mjs    registerDeskTools()  stdio ONLY, i.e. this process, on Jacob's own machine.
//
// Desk tools read the corpus and the contact table directly over PostgREST. They are kept off the
// HTTP surface for two reasons: contact rows are ~91.6% Vainu-trial data that is founder-use-only
// pending a licence decision, and arbitrary corpus queries are a bulk-export surface that should be
// a deliberate product decision with rate limits, never a side effect of adding a tool.
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAlloyServer } from "./server.mjs";
import { registerDeskTools } from "./desk.mjs";

const server = createAlloyServer();
registerDeskTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(
  "alloy-mcp running on stdio\n" +
  "  shared : alloy_company_read, alloy_cloud_and_stack, alloy_funding_fit, alloy_find_prospects\n" +
  "  desk   : alloy_query_corpus, alloy_account_contacts, alloy_pipeline (NOT on the HTTP surface)",
);
