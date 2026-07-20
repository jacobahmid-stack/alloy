# ACCOUNTS — every commercial account the company runs on (skeleton 2026-07-14)

Bus-factor closer: if Jacob is unreachable, this is the map. **Jacob fills the ⬜ columns** (owner email, payment method, recovery path, 2FA custody). No secrets here — locations only.

| Service | What it runs | Account / id | Billing | Recovery + 2FA |
|---|---|---|---|---|
| AWS (Forj) | Box, Bedrock, Amplify, Route53, SES, SSM | 701275662474 (eu-north-1 primary) | ⬜ card? | ⬜ root email + MFA custody |
| AWS (Novalo) | Partner Central cross-account read (`smith-integration` role) | 497260983102 (THEIR account) | theirs | n/a — access via role only |
| Anthropic | Claude API (proxy fallback + evals); org spend limit $1k/mo, soft cap $900 in claude_budget | ⬜ org id | ⬜ | ⬜ |
| GitHub | `Novalo-Technologies/alloy-page` (product — MOVE per NORTH_STAR_GAPS), `jacobahmid-stack/alloy` (strategy) | ⬜ | free? | ⬜ |
| one.com | forj.se domain + the REAL mailbox `jacob@forj.se` (partner@ is an alias — aliases can't SMTP-auth) | ⬜ | ⬜ renewal date | ⬜ |
| Slack | Forj workspace + Smith bot (brief, lead-notify, kpi receipts) | ⬜ workspace | free? | ⬜ |
| Twilio | Dialer (voice-token/twiml fns) | ⬜ SID in box env | ⬜ | ⬜ |
| Recall.ai | Meeting capture (ON HOLD; keys pending rotation) | ⬜ | ⬜ | ⬜ |
| BuiltWith | Tech-stack enrichment (REST key on box) | ⬜ | ⬜ | ⬜ |
| Explorium | Champion-watch contacts (covers Norway) | ⬜ | ⬜ | ⬜ |
| Vainu | SE contacts layer (trial-era token — RETENTION RIGHTS UNVERIFIED, see NORTH_STAR_GAPS #5) | ⬜ | ended? | ⬜ |
| Google | GTM `GTM-KDSHWRP5` + GA4 `G-9S5HS9GLLJ`; gmail recovery hub (jacob.ahmid@gmail.com) | ⬜ | free | ⬜ THE recovery root — 2FA + backup codes custody matters most here |
| Supabase (managed) | DORMANT revert target `nvjizahtcqgmfhiodtej` — do not deploy here | ⬜ | ⬜ paused? | ⬜ |
| PRV / Bolagsverket | FORJ trademark filing (pending) + Forj AB rename (org.nr 559019-9161) | ⬜ | — | — |

**Rule:** any new paid service gets a row here the day it's adopted.
