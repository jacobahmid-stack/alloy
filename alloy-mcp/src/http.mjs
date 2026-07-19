#!/usr/bin/env node
// Alloy MCP server, REMOTE (Streamable HTTP) entry. This is what Amazon Quick (and any remote MCP
// client) connects to: an HTTPS endpoint behind a bearer gate. Host it behind TLS, set ALLOY_MCP_TOKEN
// (one token per partner tenant), and register the URL in Amazon Quick as an MCP connector.
//
// Stateless mode: a fresh server + transport per request (the tools are request/response, no long-lived
// streams), which is simple and robust to host. Run: PORT=8787 ALLOY_MCP_TOKEN=... ALLOY_ANON_KEY=... node src/http.mjs
import express from "express";
import cors from "cors";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createAlloyServer } from "./server.mjs";

const PORT = Number(process.env.PORT || 8787);
const TOKEN = process.env.ALLOY_MCP_TOKEN || "";

const app = express();
app.use(cors({ exposedHeaders: ["Mcp-Session-Id"], allowedHeaders: ["Content-Type", "Authorization", "Mcp-Session-Id", "mcp-protocol-version"] }));
app.use(express.json({ limit: "1mb" }));

// Bearer gate. In production ALLOY_MCP_TOKEN MUST be set (issue one per partner tenant so usage +
// budget attribute correctly). If unset, the server runs open and logs a warning (local dev only).
function auth(req, res, next) {
  if (!TOKEN) return next();
  const got = (req.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  if (got !== TOKEN) return res.status(401).json({ jsonrpc: "2.0", error: { code: -32001, message: "unauthorized" }, id: null });
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true, server: "alloy-mcp", transport: "streamable-http", auth: !!TOKEN }));

// MCP endpoint (stateless Streamable HTTP).
app.post("/mcp", auth, async (req, res) => {
  try {
    const server = createAlloyServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); // stateless
    res.on("close", () => { try { transport.close(); server.close(); } catch { /* noop */ } });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: String(e?.message || e) }, id: null });
  }
});

// Stateless server has no GET/DELETE session lifecycle.
const noSession = (_req, res) => res.status(405).json({ jsonrpc: "2.0", error: { code: -32000, message: "Method Not Allowed (stateless server: POST /mcp only)" }, id: null });
app.get("/mcp", noSession);
app.delete("/mcp", noSession);

app.listen(PORT, () => console.error(`alloy-mcp HTTP (streamable) on :${PORT}/mcp  ${TOKEN ? "[bearer auth ON]" : "[NO AUTH - set ALLOY_MCP_TOKEN for production]"}`));
