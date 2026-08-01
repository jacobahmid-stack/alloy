# EUROPE NIGHT ORDERS
### A standing, resumable, near-zero-cost work order for the next 48 hours

**How to use this:** paste the block in section 1 as the prompt. Run it with a cheap model (Haiku is enough) and low reasoning effort. It is designed so the model orchestrates and the box does the work, because the box is already paid for and tokens are not. Run it as many times as you like: it is idempotent and picks up where it stopped.

**Cost rule, absolute:** free sources only. No paid API, no credits, no enrichment vendor, no per-record spend, no new subscription. If a step would cost money, it is skipped and logged, never "just this once".

---

## 1. THE PROMPT (paste this)

```
You are continuing Forgeby's European build overnight. Cheap and resumable is the whole point.

GROUND YOURSELF (read only these, in this order, then stop reading):
- alloy/EUROPE_NIGHT_ORDERS.md          (this file: the work order and the ledger)
- alloy/EUROPE_OPENING_ORDER.md         (which markets, why, and the free routes)
- alloy/EUROPE_NORDIC_PARITY_MAP.md     (per-country data reality)
- the box skill (SSM access; there is no SSH)

HARD RULES
1. FREE ONLY. No paid API, no credits, no vendor, no subscription, no per-record cost. If a task needs
   money, skip it, write it to the ledger under BLOCKED with the price, and move on.
2. The box does the work. Write a script, run it under nohup, poll it. Do not stream large output into
   your context. Never SELECT * on companies (jsonb columns cause statement timeouts): name the columns.
3. NEVER write to AWS. Reading state is fine. IAM, security groups and instance changes are Jacob's.
4. Never deploy. box-deploy.timer only ships what is named in box/DEPLOY_MANIFEST.
5. One task at a time, finish it, append to the ledger, then take the next. If a task fails twice, mark
   it FAILED with the error and move to the next one. Do not retry in a loop.
6. Secrets stay in SSM Parameter Store and the box's edge secrets. Never echo one.
7. Stop and write a summary when the queue is empty or you have run for two hours.

PICK THE NEXT TASK from section 2 of the work order, highest value first (A and A2 come before everything), honouring the dependencies.
Before you start one, check the ledger in section 4: if it says DONE, skip it.

AFTER EVERY TASK, append one line to the ledger in section 4 of alloy/EUROPE_NIGHT_ORDERS.md:
  <date> | <task id> | DONE|PARTIAL|FAILED|BLOCKED | <the number that changed> | <one sentence>
Commit that file only, with a one-line message. Commit nothing else unless the task says to.

HONESTY: every count you report must come from a query you actually ran. If a load half-finished, say
PARTIAL and give both numbers. Never estimate a row count. Never mark DONE what you did not verify.
```

---

## 2. THE QUEUE (highest value first)

Each task names its cost. Anything not marked FREE does not run.

### A. RECONCILE THE CLOUD FIELD (FREE, do this first)
The `cloud_ecosystem` column disagrees with the estate reader: on 2026-08-01, 74,726 of 78,210 `azure`
rows and 16,757 of 16,821 `aws` rows carried no estate-read evidence at all. The public site had to drop
its per-vendor split because of it. This is the highest-value free work available.
1. Characterise it: for each `cloud_ecosystem` value, how many rows have `enrichment->'estate_read'`
   populated, and what do the populated ones actually say (`infra_hosts`, `cloud_asns`, `mx_class`)?
2. Decide, and write down, which field is authoritative for a public claim. Expect the answer to be:
   estate_read where present, unknown otherwise, and `cloud_ecosystem` demoted to a first-pass hint.
3. Add a derived, honest column or view (for example `cloud_confidence`: `measured` | `hint` | `unread`)
   so the site can publish a split again without lying. Do not delete the old column.
Deliverable: the numbers, the decision, the view. This unblocks the vendor split on forgeby.com.

### A2. THE THREE MARKETS THE DOOR ALREADY OFFERS BUT CANNOT SERVE (FREE, do with A)
This is a credibility gap, not a backlog item. The door lets a partner pick the United Kingdom, France
and Ireland, and the honest reads behind them are thin or missing. Measured 2026-08-01: the library holds
**1** GB company while 365,809 sit on the `gb_registry` shelf unpromoted, France holds 19,395 and was
loaded ICT-only, Ireland holds 18,687 and was also loaded IT-only. The open agent tier already refuses
those markets for exactly this reason, which is correct and also embarrassing. Fix the data, not the copy.

**United Kingdom, the biggest single win available.** The shelf is loaded and paid for in effort already;
it is simply not in the library. Promote `gb_registry` into `companies` with the same dedup and
list-tag discipline as every other shelf. Then, in order: fix the iXBRL headcount parse first (task #5,
95,065 employees on a micro shell is a bug that will poison every size band you promote), re-scope
all-sector rather than SIC 62 only (task #6), then domain-fill and estate-read the promoted rows. Verify
the promoted count against the shelf count and report both. Do not promote a row whose domain proof is
below the verified tier: the door shows cloud reads and a wrong domain becomes a wrong read.

**France, from ICT-only to all-sector.** The .fr oracle is already built and Afnic publishes the zone
free, so domain-fill here is cheaper than anywhere else in Europe. Re-run the Sirene load without the
NACE 62/63 gate, keep the non-diffusible suppression gate exactly as it is, normalise the registry date
formats, then domain-fill from the .fr oracle and the .com oracle and estate-read the result.

**Belgium, check the scope before adding anything.** The library shows 36,417 BE companies, which is
more than the plan expected, so the first job is to find out what is actually in there: which source,
which sectors, which vintage, how many have a domain, how many have been read. Then fill the gaps.
The KBO registry fields carry web and email contact data, which is rare and valuable, so check whether
that came across. Belgium is impersonal-email lawful, so encode that channel at load time.
If the load turns out to be partial or from an unexpected source, say so plainly in the ledger rather
than building on top of it.

Deliverable for all three: a real count, a real domained count, a real read count, per market, from
queries you ran. When one of them is genuinely complete, that is the moment the door stops being a
promise for that market.

### B. FINISH THE ESTATE READ ON WHAT IS ALREADY DOMAINED (FREE)
222,858 companies have a verified domain; 111,217 are not yet read. The reader is free and already
built. Run it in batches over the unread domained rows, oldest shelf first. Log the batch size and the
rows measured each pass so it can resume. Stop if error rate exceeds 20 percent and say why.

### C. ESTONIA: FINISH THE STALLED SHELF (FREE, task #1)
340,886 rows loaded, zero EMTAK activity codes, zero promoted. The activity codes are in the RIK
`__yldandmed` (general data) file, not the basic one that was loaded. Load it, join on registry code,
gate on EMTAK 62/63, then domain-fill from the open .ee zone and the .com oracle.
NOTE: EMTA headcount is CC-BY-SA (share-alike). Use it for internal gating and scoring only. Do not
surface the number in-product until Jacob rules on the licence.

### D. DOMAIN-FILL WHATEVER IS DARK (FREE)
Run the R4 guess-and-prove engine over companies with no domain, biggest shelf first. The rule stands:
the page must prove the company (registration number, or a distinctive token of six characters or more).
A slug that merely resolves is not a proof. Log proven vs rejected per country.

### E. CROSS-SHELF DOMAIN RE-VERIFY (FREE, task #30)
Slug-name proofs measured ~62 percent precise. Re-verify them and demote the ones that fail. This
matters more than it looks: a wrong domain becomes a wrong cloud read, and the door shows cloud reads.
Report verified / candidate / demoted per shelf.

### F. UK AND IRELAND, ALL-SECTOR (FREE, tasks #6 and #25)
Both shelves were loaded IT-only, which is a doctrine error: the library is all-sector, and IT firms are
the BUYERS, not the library. Re-load all-sector from the same free sources. Also fix the UK iXBRL
headcount outliers (task #5: 95,065 employees on a micro shell is a parse bug, not a company).

### G. THE CHEAP CEE WINS (FREE, roughly two nights each)
Only after A to F. Estonia is already in C. Then, in this order, each with a free bulk registry:
Slovakia (RUZ API gives the whole ICP gate in one call), Croatia (Sudreg; note the documented host does
not resolve, use the live one recorded in EUROPE_OPENING_ORDER), Latvia, Lithuania, Slovenia, Romania.
These are library assets, not revenue markets. Load them because they are nearly free, and say so.

### H. GERMANY, THE FLAGSHIP (FREE data, real engineering)
The biggest prize in Europe and the trap label is dead: the register has been free since 2022. Seed from
offeneregister, harvest the Registerbekanntmachungen gazette for deltas, classify the Gegenstand text
into NACE, and domain-fill with Impressum verification (section 5 DDG makes the imprint mandatory, which
makes German domain proof unusually reliable).
Set the channel to CALL-FIRST and block cold email for DE at load time, before any outreach surface can
see the rows. Do not skip that step to save an hour.

### BLOCKED, DO NOT ATTEMPT (needs Jacob or money)
- Belgium KBO: needs Jacob's free account first. One download after that.
- Netherlands: KVK selectiebestand needs a quote and an email from Jacob.
- Finland headcount (Tilastokeskus, about EUR 1,300 to 2,300 a year), Spain, Switzerland headcount feeds.
- Anything requiring an AWS write, a deploy, or a new credential.

---

## 3. WHAT GOOD LOOKS LIKE AFTER 48 HOURS

Ranked by what actually helps the business, not by row count:

1. The cloud field is reconciled and the site can publish a vendor split again without lying.
2. The United Kingdom is in the library rather than on a shelf, all-sector, with the headcount parse
   fixed, so the market the door offers most prominently is the market it can actually serve.
3. France is all-sector and read, and Belgium's real scope is known rather than assumed.
4. The unread pile is meaningfully smaller and every new read carries evidence.
5. Ireland is all-sector too, so a sales leader tapping a non-IT market sees a real read.
6. Estonia is unstalled, or honestly marked FAILED with the reason.
7. The domain re-verify has run, so the door is not showing cloud reads built on 62-percent guesses.
8. Germany is started, with call-first encoded from the first row.
9. Nobody spent a krona, and the ledger says who did what.

**Not a goal:** the biggest possible library. A row nobody can reach, in a market nobody can lawfully
contact, is a cost. Reachability beats rows. That is the standing doctrine and it does not change
because there is a free registry available.

---

## 4. THE LEDGER (append one line per task, newest at the bottom)

```
date       | task | status | number | note
2026-08-01 | --   | START  | --     | work order written; queue A to H; nothing run yet
```

---

## 5. NOTES FOR WHOEVER PICKS THIS UP

- The box is `i-0f5162624bebb00d8` in `eu-north-1`, profile `forj-box`, reached only by SSM Run Command.
  Write the command to a file first; inline JSON quoting on Windows will bite you. The Windows AWS CLI
  cannot read `/tmp` paths from the shell: write command files to the scratchpad and use a `file://C:/...` path.
- `pg_cron` is in UTC. A job that looks like 07:05 local is not 07:05 UTC.
- The library is the shared corpus. Never scope a company load by `project_id`: it corrupts dedup.
- Public-surface rule, unchanged and absolute: `alloy/FORGEBY_PUBLIC_EXPOSURE_DOCTRINE.md`. Loading a
  country is internal work. Nothing about which registers, which routes, or which markets are coming
  goes on a public page, ever.
- If you finish the queue, do not invent work. Write the summary and stop.
