# Smith Managed Agent — full build runbook

End-to-end build for the one-agent experiment. Pairs with:
- `SMITH_MANAGED_AGENT_EXPERIMENT.md` (the why + success/cost bars)
- `SMITH_AGENT_SYSTEM_PROMPT.md` (the system prompt this loads)

Verified against the Claude Managed Agents docs (2026-06-03). API is **beta** — every request needs the header `anthropic-beta: managed-agents-2026-04-01` (the SDK sets it for you).

```
   ACCOUNT ROW (pasted from Alloy)
            │
            ▼
   ┌──────────────────────┐   tools (multi-step loop)
   │  SMITH (agent)       │◄► AWS Knowledge MCP   (mcp_servers)
   │  sonnet-4-5          │◄► web_search + web_fetch (toolset, read-only)
   │  read-only, drafts   │◄► [v1] SCB MCP / MS Learn MCP
   └──────────────────────┘
            │
            ▼
   ONE-PAGE AWS ACCOUNT BRIEF (cited)
```

---

## 0. Two ways to build it

- **Console wizard** (matches the Quickstart screen you showed): Build → Managed Agents → Quickstart → "Describe your agent", or pick the **Blank agent config** / **Deep researcher** template, then paste the system prompt. Fastest to eyeball ONE run.
- **API / SDK** (recommended for this experiment): repeatable across the 5 accounts and scriptable, so you can run the bake-off and capture cost per run. The rest of this runbook uses Python (cleanest on Windows; the doc's curl heredocs do not run in PowerShell, use git-bash/WSL if you prefer curl).

---

## 1. Prerequisites

1. Anthropic Console account + an **API key** (platform.claude.com → Settings → API keys). Managed Agents access is on by default for API accounts.
2. Python 3 + the SDK:
   ```powershell
   pip install anthropic
   ```
3. Set the key in your shell (PowerShell):
   ```powershell
   $env:ANTHROPIC_API_KEY = "sk-ant-..."
   ```
   (Do not paste the key into any file or into chat. Env var only.)

Optional CLI (`ant`) exists too (`brew`/`curl`/`go install`), but Python covers the whole flow.

---

## 2. Create the agent (once)

Loads the system prompt from `SMITH_AGENT_SYSTEM_PROMPT.md`, turns the toolset down to **read-only** (web only, no bash/write/edit), and attaches the AWS Knowledge MCP.

```python
# build_agent.py  —  run once, save the printed agent id
from anthropic import Anthropic
from pathlib import Path

client = Anthropic()  # reads ANTHROPIC_API_KEY

SYSTEM = Path("SMITH_AGENT_SYSTEM_PROMPT.md").read_text(encoding="utf-8")
# (or paste the prompt text directly into SYSTEM = """...""")

agent = client.beta.agents.create(
    name="Smith - account research (experiment)",
    model="claude-sonnet-4-5",          # apples-to-apples with current Smith + cheaper for the bake-off
    system=SYSTEM,
    tools=[
        {
            "type": "agent_toolset_20260401",
            # start everything OFF, enable only web (read-only research; no code exec, no file writes)
            "default_config": {"enabled": False},
            "configs": [
                {"name": "web_search", "enabled": True},
                {"name": "web_fetch",  "enabled": True},
            ],
        },
    ],
    mcp_servers=[
        # AWS Knowledge MCP: hosted, free, no auth. Bare base URL (NOT /mcp).
        {"type": "url", "url": "https://knowledge-mcp.global.api.aws", "name": "aws_knowledge"},
    ],
    metadata={"experiment": "smith-ma-research"},   # lets you filter usage later
)
print("AGENT_ID:", agent.id, "version:", agent.version)
```

Notes:
- `mcp_servers` is a top-level agent field (separate from `tools`). Confirm the exact remote-server fields in the **MCP connector** doc (`/docs/en/managed-agents/mcp-connector`); the `{type:"url", url, name}` shape is the standard no-auth connector and AWS Knowledge needs no auth.
- **v1 add SCB / MS Learn:** append more entries to `mcp_servers`. SCB = your `scb-mcp-http` — a hosted Anthropic sandbox reaches it only via a public URL or an MCP tunnel (limited preview), so deploy scb-mcp-http to a public URL first, or skip SCB for v0 and let web_search cover market context. MS Learn = `{type:"url", url:"https://learn.microsoft.com/api/mcp", name:"ms_learn"}` (Azure framing only).
- Updating the prompt later: `client.beta.agents.update(agent_id, version=<current>, system=NEW)` makes a new version. Each version is tracked.

---

## 3. Create the environment (once)

The sandbox the session runs in. Cloud + unrestricted networking so it can reach the AWS Knowledge MCP and the web.

```python
# build_env.py  —  run once, save the printed environment id
from anthropic import Anthropic
client = Anthropic()

env = client.beta.environments.create(
    name="smith-research-env",
    config={"type": "cloud", "networking": {"type": "unrestricted"}},
)
print("ENVIRONMENT_ID:", env.id)
```

(For customer-facing later: swap to a **self-hosted sandbox** or **Claude Platform on AWS** for EU residency. Not needed for v0.)

---

## 4. The user message (what the rep pastes per account)

Save as `account_template.txt` and fill one per account:

```
Research this account and produce the one-page AWS account brief per your instructions.

ACCOUNT (from Alloy)
- Name:
- Org-nr:
- Domain:
- City:
- Industry / SNI:
- Employees:
- Revenue (kSEK):
- Current cloud (Alloy detection):
- AI/data maturity band (0-4):
- Known contacts:
- Project / tenant:

Notes (anything the rep already knows):
```

---

## 5. Run one account (session + stream)

```python
# run_one.py AGENT_ID ENVIRONMENT_ID account.txt
import sys
from anthropic import Anthropic
client = Anthropic()

agent_id, env_id, acct_path = sys.argv[1], sys.argv[2], sys.argv[3]
user_text = open(acct_path, encoding="utf-8").read()

session = client.beta.sessions.create(agent=agent_id, environment_id=env_id, title="research")

brief = []
with client.beta.sessions.events.stream(session.id) as stream:
    client.beta.sessions.events.send(session.id, events=[
        {"type": "user.message", "content": [{"type": "text", "text": user_text}]},
    ])
    for event in stream:
        if event.type == "agent.message":
            for block in event.content:
                t = getattr(block, "text", "")
                brief.append(t); print(t, end="")
        elif event.type == "agent.tool_use":
            print(f"\n[tool: {event.name}]")
        elif event.type == "session.status_idle":
            break

open(acct_path + ".brief.md", "w", encoding="utf-8").write("".join(brief))
print(f"\n\nSaved {acct_path}.brief.md  (session {session.id})")
```

Run it (PowerShell):
```powershell
python run_one.py <AGENT_ID> <ENVIRONMENT_ID> account_nordvind.txt
```

---

## 6. The 5-account bake-off

1. Pick 5 real accounts spanning the model: one on AWS (Modernize/Resell), one Azure/GCP (Migrate), one AI-native (GenAI POC), one net-new small (Greenfield), one deliberately too-large (must be flagged off-ICP). Export each row into its own `account_*.txt`.
2. Run each through the agent (`run_one.py`) → `*.brief.md`.
3. Run the SAME 5 through current Smith (the in-app launcher chat) → save its output.
4. Score both, 1-5 per account, on: grounding (zero fabrication = auto-fail), play + funding correctness (and it flags the too-large one), named decision-maker, market context, "caught something single-shot missed". Win = loop better on >= 3 of 5 for grounding + play, no new fabrication.

---

## 7. Cost (meter it; the caps do NOT auto-apply)

Managed Agents bill through the API account. Your `claude_budget` / `tenant_budgets` proxy caps do NOT apply here, so watch it:
- **Console → Usage** (filter to the time window / the API key you used; the `metadata.experiment` tag helps you spot the agent).
- Target ≤ **$0.75 / account**, hard stop **$2 / account**. If a run is climbing, interrupt the session (send another user event to steer, or stop the session).
- A research run does 5-15 tool calls, so it will cost more than the ~$0.04-0.10 single-shot enrich. That is expected; judge value, not just cents.

---

## 8. Guardrails (built into this setup)

- **Read-only by construction:** only `web_search` + `web_fetch` + the AWS Knowledge MCP are enabled. No `bash`/`write`/`edit`, so the agent cannot run code or write files, and it has no tools that touch HubSpot/DB/email/calendar. It drafts; the human acts.
- **Data:** feed only the account row + public research. No Wagyu-confidential docs, no other tenant's data (e.g. Alto's MDF doc). Managed Agents are stateful and not ZDR/HIPAA-eligible.
- **Clean up:** delete sessions after the test (`client.beta.sessions.delete(...)`); archive the agent when done (`client.beta.agents.archive(...)`).

---

## 9. Decision

- **Graduate** (loop clears quality + cost): move async jobs (overnight enrichment/ICP-screen, Smith Meetings transcript→brief, deep research) onto Managed Agents; rebuild budget metering at that layer; consider self-hosted/on-AWS for residency.
- **Park** (doesn't clear): keep `claude-proxy` + retrieve-then-inject; revisit at GA or after the Bedrock cutover.
- **Always:** the multi-tenant interactive Smith chat stays on the cost-capped proxy until Bedrock + per-tenant budget control + GA are all in place.

---

### Quick reference (endpoints, if you script raw HTTP)
- POST `/v1/agents` (name, model, system, tools, mcp_servers) → agent.id, agent.version
- POST `/v1/environments` (name, config) → environment.id
- POST `/v1/sessions` (agent, environment_id, title) → session.id
- POST `/v1/sessions/{id}/events` (events:[{type:"user.message", content:[{type:"text", text}]}])
- GET (SSE) `/v1/sessions/{id}/stream` → events: `agent.message`, `agent.tool_use`, `session.status_idle`
- Headers on all: `x-api-key`, `anthropic-version: 2023-06-01`, `anthropic-beta: managed-agents-2026-04-01`, `content-type: application/json`
