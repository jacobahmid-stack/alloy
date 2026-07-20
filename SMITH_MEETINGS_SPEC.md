# Smith Meetings — Tier C Spec

**Smith joins your calls, takes the notes, and turns them into next moves.**

Status: spec for greenlight · Drafted 2026-06-03 (Claude + Jacob) · Owner: Jacob

---

## 1. What it is
Smith joins a discovery/sales call (Zoom · Teams · Google Meet), records + transcribes it with **speaker labels**, then turns it into an **account-grounded brief**:

> Summary · Decisions · **Action items (owner + due)** · Recommended next moves (the AWS play) · Funding angle · Risks/objections raised · **A drafted follow-up email**

…saved to the account's memory and wired into the actions we already shipped: action items → **"→ Today"**, follow-up → **"Open in Gmail."** Smith drafts; the rep sends. Advise-then-confirm holds.

## 2. Why it's on-strategy (North Star)
- Fills the **missing middle** of the AWS-partner motion: *call → captured → artifacts → next step.*
- Feeds the **moat** (account memory / the brain) automatically, every call.
- **Closes the loop** with what we already built (Today queue + Gmail hand-off).
- A real **differentiator** for the partner: every customer call auto-becomes co-sell-ready material.

## 3. Architecture — three parts

```
[1] Bot joins the call        →  [2] Transcript + speaker labels        →  [3] Smith writes the brief
    Recall.ai (Zoom/Teams/Meet)   webhook → Supabase edge fn + table        claude-proxy meetingBrief task
    (the GATED piece)             (buildable now)                           → account memory + Today/Gmail
```

**Key insight: [3] is identical no matter how the transcript arrives** (bot, paste, or mic). So **[2]+[3] are the reusable back-half** — they also stand alone as "paste a transcript → get a brief" (the old Tier A), usable day one with zero gate.

### 3.1 Ingestion — the bot (Part 1, the gated piece)
- **Recall.ai** — one API to put a bot into Zoom/Teams/Meet; returns recording + diarized transcript via webhook. (Alternatives: native Zoom RTMS / MS Graph / Meet APIs — each per-platform and months of work; Recall abstracts all three. Trade-off: a paid sub-processor.)
- Flow: app → `meeting-start` edge fn (meeting URL + account) → Recall create-bot → store `bot_id` + status. Recall → `meeting-webhook` edge fn on events (joined / done / transcript-ready).
- Pricing: per bot-hour — **VERIFY current Recall.ai rates**; cap it (see §5).

### 3.2 Pipeline — backend (Part 2, buildable now)
- **Table `meetings`**: `id, tenant_id, project_id, company_id (nullable), created_by, meeting_url, provider, bot_id, status (scheduled|joining|recording|done|failed), started_at, ended_at, transcript (text), brief (jsonb), follow_up (text), created_at`. **RLS: tenant-scoped** (a partner never sees another's meetings — same model as the private brain).
- **`meeting-webhook`** edge fn (verify_jwt OFF; authenticated by **Recall's HMAC signature** — only Recall can call it → safe): transcript-ready → store → invoke [3] → store brief.
- **`meeting-start`** edge fn (verify_jwt ON): rep sends meeting URL + company → calls Recall → records the row. **Per-tenant meeting cap checked here.**
- Storage: `meetings.transcript` (or a Storage bucket if large), **EU region**.

### 3.3 Smith brief — processing (Part 3, buildable now)
- A **`meetingBrief`** task in claude-proxy (budget-capped, Bedrock-eligible): transcript + account context → the brief sections (§1). Grounded in the KB (AWS facts) + the account's pipeline state. **Honest**: only what's in the transcript; flags gaps; never invents a commitment nobody made.
- Saved to: `meetings.brief` + the account card (research + the follow-up as a draft) + appended to `enrichment.smith_thread` (so it's in Smith's memory). Action items → "→ Today"; follow-up → "Open in Gmail" (reuses Tier-1 close-the-loop).

## 4. Frontend
- Account card / Smith: **"Bring Smith to a meeting"** → paste the live meeting URL → bot joins.
- A **meetings list** per account (date · duration · status) → open the brief.
- Brief view: the sections, action items as "→ Today," follow-up as "Open in Gmail."
- **Tier A standalone** (Phase 1): "Summarize a transcript" → paste/upload (reuses attach + the new Office/text extractors) → same brief, no bot.

## 5. Cost model
- **Recall.ai**: ~per bot-hour — **verify on recall.ai** (first feature with real COGS).
- **Transcription**: Recall includes async transcription (or pipe to Deepgram/AssemblyAI/Whisper — verify).
- **Claude brief**: ~one Sonnet call per meeting (cheap; on the existing budget; Bedrock-eligible).
- **Controls**: a **per-tenant meeting cap** (mirror `tenant_budgets`) + a global cap; show remaining; never auto-join past the cap.

## 6. Compliance — GDPR / consent (EU/Sweden) — the real gate
- **Personal data**: a call transcript incl. the prospect = personal data. GDPR applies in full.
- **Lawful basis**: legitimate interest (sales) or consent. For recording others, best practice = **notice + the chance to object**; safest = explicit consent.
- **Notice**: the bot joins as a **clearly named participant** ("[Partner] AI Notetaker"); the rep states up front the call is recorded for notes. A **pre-join confirm**: "I've informed participants."
- **Recall.ai = sub-processor**: needs a **DPA**; confirm their EU data residency + SOC 2 / GDPR posture.
- **Storage**: **EU region**, encrypted at rest; a **retention policy** (e.g., auto-delete after 90 days, configurable); honor deletion requests (data-subject rights).
- **Isolation**: `meetings` RLS-scoped per tenant — consistent with the private-brain promise.
- **Recommendation**: ship with (a) visible bot name, (b) the "participants informed" gate, (c) EU storage + default retention, (d) a signed DPA with Recall, (e) a recording-notice line Smith can drop into the calendar invite. **Get a quick legal review before live prospect use.**

## 7. Phasing
| Phase | Scope | Gate |
|---|---|---|
| **1 — Brief engine (now)** | Parts [2]+[3] back-half: paste/upload a transcript → brief → account memory + Today/Gmail | **None** — build anytime |
| **2 — The bot** | Recall.ai: `meeting-start` + `meeting-webhook`, `meetings` table, consent gate, cost cap, UI | Recall account+key · budget · consent/DPA |
| **3 — Auto-join** | Bot auto-joins scheduled meetings via calendar | Google/MS calendar OAuth (shares the Tier-2 send + CASA track) |

## 8. What I need from you (to do Phase 2)
1. **Recall.ai account + API key** (or pick an alternative provider).
2. **Budget sign-off** + a cap (per-tenant + global), like the Claude budget.
3. **Consent/GDPR decision**: bot display name · the "participants informed" gate · retention period · EU-region confirm · a **DPA** with Recall.
4. *(Phase 3)* Google/MS **calendar OAuth** — shares the Tier-2 send/CASA work.

## 9. Risks / open questions
- Recall.ai pricing, platform coverage, bot-join reliability (waiting rooms / host-admit) — **verify**.
- Diarization quality (who said what) — affects action-item attribution.
- Consent UX vs. friction — make it standard, not scary.
- **Legal review** before live prospect use.

## 10. Rough effort
- **Phase 1**: ~0.5–1 day (reuses attach/extractors/proxy/account-memory + Tier-1 actions).
- **Phase 2**: ~2–4 days (Recall, webhook, table/RLS, consent gate, cost cap, UI).
- **Phase 3**: ~2–3 days (calendar OAuth + auto-join), gated on CASA.

---

### Recommended first step
Build **Phase 1** (the brief engine) whenever — it's no-gate, immediately useful (paste any Zoom/Teams/Otter transcript you already have), and it's the exact back-half the bot plugs into. Meanwhile, line up the Recall.ai key + the consent stance for Phase 2.
