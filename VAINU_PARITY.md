# Vainu data parity: what to build, what to buy, what to skip

**2026-07-21.** Vainu's claims from https://www.vainu.com/product/data/ (public marketing page,
fetched today). Alloy's numbers measured live on the box today, scope = non-archived SE/NO/FI
(**85,485 rows**). Nothing below is from memory.

**Vainu's headline:** 5M+ Nordic companies, 700+ data fields, 9M+ contacts
(FI 1.3M companies / 2.2M contacts, SE 1.8M / 2.8M, NO 1.1M / 2.6M, DK 0.8M / 1.5M).

**Scale caveat before the table:** Vainu counts every registered entity including sole traders.
Alloy's 85,485 is the filtered addressable layer (10+ employees, wedge-shaped), with 820,926 SE
registry rows and the FI registry staged behind it. Matching their 5M is anti-goal: most of it is
anti-ICP. Parity only matters field-by-field on the addressable layer.

## The gap table

| # | Vainu family (their words) | Alloy, measured today | Verdict | Route if short |
|---|---|---|---|---|
| 1a | Basic: industry | `industry` 66,958 (78%) | **PARTIAL-strong** | Registry backfill, free |
| 1b | Basic: size | `employees` 54,754 (64%): NO 35,406/35,458, SE 19,348/30,079, **FI 0/19,948** | **PARTIAL, FI = zero** | SE: the SCB email (FREE, waits on Jacob, `SCB_FILE_GUIDE.md`). FI: **no free route exists** (verified 2026-07-17): pay or license |
| 1c | Basic: location | `city` 84,850 (99%) | **HAVE** | — |
| 1d | Basic: web profile | domained 65,194 (76%); 20,291 domainless are invisible to every detector | **PARTIAL** | `domain-fill` exists (paid Claude, country-gated); R0-R5 engine in the Library Campaign |
| 2 | Financials: revenue, profit, staff | `revenue_ksek` 55,913 (65%): NO 34,267, SE 21,646, **FI 0**. Profit: not held | **PARTIAL, FI = zero** | SE: Bolagsverket HVD (free, running). NO: done via brreg. FI: same paid/license gate as size. Profit: skip, ICP does not use it |
| 3 | Vehicle data | none | **SKIP** | Irrelevant to the funded-door wedge. Their differentiator for other ICPs, not ours |
| 4 | Technology data (CRM, CMS, ATS...) | `techstack` 57,220 (67%) via BuiltWith, PLUS `cloud_ecosystem` on every domained row: a verdict Vainu does not sell | **HAVE, arguably ahead** where it counts: they list tools, we call the funded door |
| 5 | Group structure + owners | not held (`is_chain_outlet` flag covers the worst failure case) | **MISSING, medium priority** | Free registries (brreg roller, Bolagsverket, PRH), engineering days not money. Matters for multi-entity deals (the record's own first deal was 3 orgs) |
| 6 | Location data (registered + reported sites) | HQ city 99%; NO underenheter join done 2026-07-17 | **HAVE** for wedge purposes | — |
| 7 | Event data / buying signals (funding, M&A, people changes) | 5 live feeds (brreg, jobtech, vinnova, ted, nav + explorium-events) but ~550 companies touched | **PARTIAL-weak. Gap #2.** | BUILD: the feeds are free and live, coverage is a volume-tuning problem, not a licensing one. News layer is the planned next rung |
| 8 | Vainu Custom Industry (AI classification) | registry SNI/NACE at 78% | **SKIP for now** | ICP runs on cloud + size + industry and produces the 70/40 bands that already work. If ever needed: Haiku classify the qualified subset, ~$94-class cost |
| 9 | Contacts / decision-makers (9M+, human-verified) | 48,354 contacts; dm-companies SE 8,064; **NO ~0.6%, FI ~0.2% coverage**; `ceo` column dead (12 rows) | **PARTIAL, SE-only. Gap #1.** | This is the one family where their moat is real: BUY/LICENSE. Explorium NO is proven (Art-14 gate applies); a Vainu FI/NO extension is a negotiation with an existing vendor, not a new integration |

## Bottom line

**Already ahead where the wedge lives:** technographics-plus-cloud-verdict (their tool list vs our
funded door), location, and the classification the product actually runs on.

**The two gaps that matter, in order:**
1. **Contacts outside Sweden** (family 9). Not rebuildable free at any realistic effort. Buy or license.
2. **Finland size + financials** (families 1b/2). Zero coverage on 19,948 accounts, no free route,
   and it caps FI ICP scoring structurally (ceiling 66 < hot 70 without it). Pay or license.

**Everything else is build or skip.** Signals breadth (#7) is engineering on feeds we already run.
Group structure (#5) is free-registry work. Vehicles and custom industry are not our fight.

## The three moves, ranked by cost per unlocked account

1. **Send the SCB email** (SE size class): FREE, unlocks the ~10.7k SE sized gap. Jacob's action,
   ready-to-paste in `SCB_FILE_GUIDE.md`. Blocking on a stamp, effectively.
2. **Price a Vainu FI module + NO/FI contacts extension on the next vendor call**: one conversation
   answers both gap #1 and #2 with a number to compare against Explorium (NO contacts, proven, paid)
   and against doing nothing. We are already their customer; this is leverage, not procurement.
3. **Tune the signal feeds for volume** (free, engineering): jobtech ingestion breadth first, news
   layer second. Moves family 7 from ~550 companies to thousands without spending against the $429.

**What we do NOT do:** chase 5M entities, buy vehicle data, or license custom industry AI. Parity for
its own sake is vanity; the wedge needs exactly the two purchases and one email above.
