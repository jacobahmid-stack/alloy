# Deploy the Alloy MCP server

The server is finished and proven end-to-end (`npm test` drives a real MCP client through
initialize → tools/list → tools/call). The last mile is hosting it behind HTTPS and registering the
URL in an AI assistant. Two host options; the first reuses your existing box + Caddy, no new cost.

## Env it needs
| Var | Value |
|---|---|
| `ALLOY_SUPABASE_URL` | `https://db.forj.se` (the box) |
| `ALLOY_ANON_KEY` | the box `ANON_KEY` from `/opt/supabase/docker/.env` (public anon JWT) |
| `ALLOY_MCP_TOKEN` | a strong bearer token you choose (one per partner tenant later) |
| `ALLOY_MODEL` | optional, defaults to `claude-sonnet-4-5` (must be in the proxy ALLOWED_MODELS) |

The bearer (`ALLOY_MCP_TOKEN`) gates who reaches the server; inside, it calls the box with the anon
JWT and the box's budget caps bound the spend.

## Option A (recommended): on the box, behind Caddy

Reuses the TLS Caddy already terminates for `db.forj.se`. In the SSM shell:

```bash
# 1. get the code onto the box (clone, or scp the alloy-mcp folder) into /opt/alloy-mcp, then:
cd /opt/alloy-mcp && npm install --omit=dev

# 2. run it as a service (pm2 shown; systemd works too). Keep the token out of shell history:
read -rsp "MCP token: " T && ALLOY_MCP_TOKEN="$T" \
  ALLOY_SUPABASE_URL=https://db.forj.se ALLOY_ANON_KEY="<box ANON_KEY>" \
  pm2 start src/http.mjs --name alloy-mcp && unset T

# 3. add a Caddy route (Caddyfile): a new block, then reload Caddy
#    mcp.forj.se {
#        reverse_proxy localhost:8787
#    }
sudo caddy reload --config /etc/caddy/Caddyfile   # path may differ
```
Point `mcp.forj.se` at the box in Route 53. Endpoint: `https://mcp.forj.se/mcp`.

## Option B: Docker (any host)

```bash
docker build -t alloy-mcp .
docker run -d -p 8787:8787 \
  -e ALLOY_SUPABASE_URL=https://db.forj.se \
  -e ALLOY_ANON_KEY=<box anon jwt> \
  -e ALLOY_MCP_TOKEN=<token> \
  --name alloy-mcp alloy-mcp
```
Put it behind any TLS terminator (Caddy, an ALB, Cloudflare). Endpoint: `https://<host>/mcp`.

## Verify it's up
```bash
curl https://mcp.forj.se/health         # {"ok":true,"transport":"streamable-http","auth":true}
# full check: point the MCP Inspector at the URL with the bearer:
npx -y @modelcontextprotocol/inspector
```

## Register in an AI assistant
Same URL + bearer for all three (one server, tri-cloud):
- **Microsoft Copilot Studio / Azure AI Foundry** (most MCP-mature today): add a tool → MCP server →
  URL `https://mcp.forj.se/mcp`, auth `Authorization: Bearer <ALLOY_MCP_TOKEN>`.
- **Amazon Quick**: add an MCP connector with the same URL + bearer.
- **Google Vertex AI / Gemini**: add the MCP server URL + bearer in the agent config.

Tell the assistant which `partner_cloud` to pass (`aws` | `azure` | `gcp`) and the tools answer in that
cloud's own programs.
