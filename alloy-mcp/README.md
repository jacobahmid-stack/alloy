# Alloy MCP server

Smith's hyperscaler-partner GTM intelligence, exposed as MCP tools, so it runs **inside the AI
assistant the user already works in** (Amazon Quick, Claude, Slack, Teams), the headless MCP pattern
AWS is standardizing for Amazon Quick.

## Why this exists (the wedge)

The horizontal layer (verified identity, firmographics, ownership) is being commoditized into AI
assistants like Amazon Quick. Alloy is the **vertical layer on top** that a horizontal graph cannot do:

| Horizontal identity / firmographic graph | Alloy MCP (this) |
|---|---|
| Who the company is (legal identity, ownership, firmographics) | **Which cloud they run** (even behind a CDN) |
| Relationships between entities | **Funding-program fit** (MAP / PoC / Modernize / Resell) + ICP score |
| Risk / compliance signals | **The co-sell play** and the funding angle |
| Generic "find prospects" | Prospects scored for **hyperscaler-partner fit**, grounded |

A horizontal identity graph tells you who a company is. Alloy tells you which cloud they run, what
funding fits, and how to co-sell it. Alloy runs on its own Swedish-market data; this server adds the
cloud + funding + co-sell layer no horizontal graph provides.

## Tools

| Tool | What it does | Backed by |
|---|---|---|
| `alloy_company_read` | Grounded read: cloud, stack, size, the play, the funding angle | Smith brain (claude-proxy `smith_chat` + web search), budget-capped |
| `alloy_cloud_and_stack` | Which hyperscaler + public tech stack for a domain | claude-proxy `techstack` + web search |
| `alloy_funding_fit` | Program (MAP/PoC/Modernize/Resell) + ICP score + directional funding estimate | **pure local scorer** (`scoring.mjs`), free, no LLM |
| `alloy_find_prospects` | Real companies matching a target description, scored for partner fit | claude-proxy `discover_prospects` + web search |

`alloy_funding_fit` is deterministic and free, the moat layer; the other three route to the live Alloy
box, which enforces the task allow-list and the global + per-tenant Claude budget caps.

**Tri-cloud, neutral by design.** Every tool takes a `partner_cloud` (`aws` | `azure` | `gcp`). The same
play is named in the partner's own program: migrate → AWS MAP / Azure Migrate and Modernize / Google
RAMP; AI → AWS GenAI PoC / Azure Innovate / Google Cloud AI funding. One server, correct for each
cloud's ecosystem, which is the point: the neutral partner-GTM layer, not any one cloud's tool.

## Run (stdio, local / Claude Desktop)

```bash
cd alloy-mcp
cp .env.example .env        # fill ALLOY_ANON_KEY (the public anon JWT)
npm install
# set the env, then:
node src/index.mjs          # speaks MCP over stdio
# or inspect interactively:
npm run inspect
```

Claude Desktop / Claude Code config:
```json
{ "mcpServers": { "alloy": { "command": "node", "args": ["C:/Users/jacob/alloy/alloy-mcp/src/index.mjs"],
  "env": { "ALLOY_ANON_KEY": "<anon jwt>" } } } }
```

## Remote (Copilot Studio / Amazon Quick / Gemini)

`src/http.mjs` is the remote transport: a stateless **Streamable HTTP** server with a bearer gate, the
shape any remote MCP client connects to over HTTPS.

```bash
PORT=8787 ALLOY_MCP_TOKEN=<strong-token> ALLOY_ANON_KEY=<box anon jwt> npm run start:http
# endpoint: POST /mcp   ·   health: GET /health
```

Hosting + registration (box+Caddy or Docker, then Copilot Studio / Quick / Gemini): see **DEPLOY.md**.

Auth model: the bearer token gates *who can reach the server*; inside, it calls the box with the public
anon JWT, and the box's budget caps + task allow-list bound *what it can spend*.

## Verify
`npm test` runs an end-to-end MCP smoke test (spawns the server, real client does initialize →
tools/list → tools/call funding_fit for aws/azure/gcp). Offline, no key needed.

## Note

Status: 4 tools, tri-cloud, stdio + Streamable-HTTP transports, **proven end-to-end** (`npm test`).
The funding scorer mirrors `alloy-page/src/scoring.js`. Before production hardening: per-tenant tokens,
rate limits, and a thin cache on the read tools.
