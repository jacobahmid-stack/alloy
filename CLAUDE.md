# READ THIS FIRST

This repository (`jacobahmid-stack/alloy`) is the **strategy and documentation** repo.

## The code in this repo is STALE. Do not read it to understand how Alloy works.

`src/` and `supabase/` here are a frozen copy from early June 2026. The live product lives in
**`C:\Users\jacob\alloy-page`** (`Novalo-Technologies/alloy-page`).

| | this repo (stale) | alloy-page (authoritative) |
| --- | --- | --- |
| edge functions | 21 | 101 |
| `src/forge.jsx` last touched | 2026-06-11 | current |
| `supabase/functions/claude-proxy` last touched | 2026-06-02 | current |

### What reading the stale copy will tell you, wrongly

- `src/forge.jsx:655` says the Anthropic API is "the only path now". **False.** The live
  `claude-proxy` routes through Amazon Bedrock (EU inference profiles) as well, with the Anthropic
  API as one of several paths.
- The stale `supabase/functions/claude-proxy` has no Bedrock support at all.

This exact drift caused a real error on 2026-07-20: the stale copy was read, and an EU data
residency claim was reported as defensible when the live measurement showed 91.7% of inference
going to the US Anthropic API. Do not repeat it.

### Where to look instead

| I need | Go to |
| --- | --- |
| Edge functions, Smith, the app | `C:\Users\jacob\alloy-page\` |
| forj.se | `C:\Users\jacob\alloy-landing\` (a git worktree of alloy-page, branch `landing`) |
| Infrastructure as code | `jacobahmid-stack/smith-aws`, `jacobahmid-stack/supabase-aws` |
| Strategy, ICP, program research, decisions | **this repo, the `.md` files** |

The `.md` files here ARE current and ARE the point of this repo. It is only `src/` and `supabase/`
that are stale.

## Verification discipline

Several load-bearing "facts" in these documents turned out to be Forj documents citing other Forj
documents. A Forj internal doc asserting something is the claim restated, not a primary source.
Before repeating a figure, a date or a program rule to anyone outside the company, find the primary
source. See `aws-mechanics-verified` in memory for the ones already checked, including three that
were false and shipped.
