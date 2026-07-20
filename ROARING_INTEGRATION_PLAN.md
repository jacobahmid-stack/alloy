# Roaring → Alloy — integration plan, mapping & spend cap (v1)

Roaring = Nordic company-data API (Integrations plan, 1 495 SEK/mo ex VAT + per-call
consumption). Becomes a core grounding source for Smith: firmographics, financials,
decision-makers, qualification, and a live signal feed. Replaces the expiring Vainu trial.

> Spend note: the 1 495/mo base includes some volume; **data calls are metered on top**
> (see the portal Consumption/Prices tabs). Everything below runs behind a hard SEK cap.

---

## 1. API → Alloy map
| Roaring API (confirm exact names in portal "APIs" tab) | Alloy target | What it fills |
|---|---|---|
| Company overview (org-nr) | `companies` | name, orgnr, address, city, SNI/industry, status, founded |
| Financial records / KPIs | `companies` | revenue_ksek, employees, + new: profit, equity, year |
| Group / corporate structure | `companies.enrichment` | parent / group context |
| Company roles (board, CEO, signatories) | `contacts` | real decision-makers (name, title/role) |
| Beneficial owners (verklig huvudman) | `contacts` | owners (role = "beneficial owner") |
| Credit rating / payment remarks | `companies.enrichment` | credit score + risk flag (qualification) |
| **Monitoring + Webhooks** | **`signals` (new)** | change events → "reach out now" triggers |

## 2. Schema
- `companies` — reuse existing fields; add (optional) `roaring_at timestamptz`, and stash
  financials/credit in `enrichment` jsonb to avoid a wide migration.
- `contacts` — reuse (first_name/last_name/title/role/source='roaring'). Roles + beneficial
  owners both land here; `source` distinguishes them.
- **`signals` (new):**
  ```sql
  create table signals (
    id text primary key,                 -- 'sig-'+uuid
    company_id text references companies(id) on delete cascade,
    orgnr text,
    type text,                           -- financials_filed | board_change | status_change | address_change | ...
    title text,                          -- human one-liner Smith shows
    payload jsonb,                       -- raw Roaring event
    occurred_at timestamptz,
    seen boolean default false,
    created_at timestamptz default now()
  );
  ```
- **`roaring_budget` (spend cap, mirrors `claude_budget`):**
  ```sql
  create table roaring_budget (
    id int primary key default 1,
    cap_sek numeric default 500,         -- monthly consumption ceiling (raise/reset via SQL)
    spent_sek numeric default 0,
    period_start date default now()
  );
  ```

## 3. Edge functions
**`roaring-enrich`** (like `vainu-se-scan`)
- Input: one org-nr or a batch (project_id, list).
- Auth: Roaring OAuth2 client-credentials → bearer (confirm; some endpoints use API key).
- Per org-nr: company overview + financials (always); roles + beneficial owners + credit
  (optional flags, since each adds cost).
- Writes firmographics/financials → `companies`, people → `contacts`.
- **Spend gate:** before each call class, check `spent_sek + cost <= cap_sek`; after a
  successful call, `spent_sek += cost`. Refuse + log when over. Pace + per-run cap like Vainu.

**`roaring-webhook`** (verify_jwt off)
- Validates Roaring's webhook signature/secret (shared secret in edge secrets).
- Maps event → `signals` row (type/title/payload/occurred_at), links to `company_id` by orgnr.
- Optional: ping Slack / mark the account hot so Smith surfaces it.
- **Monitoring cap:** only subscribe high-value pipeline accounts (not all ~7,600) — monitoring
  is a recurring per-company cost. Cap the monitored count (e.g. `MONITOR_MAX`).

## 4. Spend cap (the discipline)
- Single source of truth: `roaring_budget`. Same playbook as the $90 Claude cap.
- A cost map per endpoint (fill from the portal **Prices** tab): overview=?, financials=?,
  roles=?, beneficial-owner=?, credit=?, monitoring=?/company/mo.
- `roaring-enrich` never calls past `cap_sek`; raise/reset with one SQL update.
- Monitoring bounded by company count, not just calls.

## 5. Secrets (Supabase edge — NEVER in chat)
- `ROARING_CLIENT_ID`, `ROARING_CLIENT_SECRET` (or `ROARING_API_KEY`)
- `ROARING_WEBHOOK_SECRET`
- Added in the Supabase dashboard → Edge Function secrets, same as the Vainu/Slack tokens.

## 6. GDPR / trust
- Roaring carries **personal data** (board members, beneficial owners) → it's a **sub-processor**:
  add to the DPA / sub-processor list (already drafted). EU/Swedish-hosted = good for residency.
- Keep this data inside tenant-isolated tables (RLS), never on the public forj.se.

## 7. Sequence
1. **Scope** (sandbox / portal): confirm exact endpoint names, fields, auth method, and per-call
   prices (APIs + Prices tabs). Lock the cost map.
2. **Wedge 1 — enrichment:** ship `roaring-enrich` behind the cap → retire the Vainu trial.
3. **Wedge 2 — signals:** `roaring-webhook` + `signals` table → Smith's "reach out now" feed.

## 8. To confirm before building (the only unknowns)
- Exact endpoint paths + response field names (portal "APIs" / Swagger).
- Auth: OAuth2 client-credentials vs API key.
- Per-call prices for the cost map (portal "Prices").
- Webhook event types + signature scheme (portal "Webhooks").
