# ZONE LEVERAGE PLAN — what 165M domains actually buy us
**2026-07-22.** The .com oracle is LIVE on the box: 164,761,019 domains, 4.3 GB SQLite, ~1ms lookups,
provider histogram: aws 2,301,925 · cloudflare 19,665,634 · gcp 8,028,643 · azure 205,164 · other 134.6M.
Built from CZDS with the box self-authenticating (SSM param `/forj/czds/password`); weekly re-pull is one cron away.

Research basis: 5-finder + 10-skeptic workflow, 2026-07-22, every claim below CONFIRMED against primary
sources (Nominet pages + licence, Companies House product pages + field-spec PDF, ICANN base RA Spec 4,
W3Techs/BuiltWith/arXiv/Dataprovider, brreg live API sampling, ERST/Virk docs).

---

## The reframe

The stale verdict ("marginal, rainy-day, Nordic ICP lives on ccTLDs") was true of the .com zone alone.
It is NOT true of the *capability* we now have: a proven pipeline that turns any zone file into an
offline existence + DNS-provider oracle on the box. That capability composes with what's already
verified open (.se/.nu/.ee AXFR, .fi odata) and with the two channels research just confirmed (Nominet
.uk = free to all; CZDS = 10 more gTLDs, ~39M domains, one account). Together it becomes the **domain
layer of the library**: existence census, free cloud prior, and an unclaimed signal feed — in every
market we care about.

Library reality it acts on (measured today):
- 8,287 companies already domained on **.com** → NS-stampable tonight, free.
- 20,334 undomained (NO 14,006 · SE 6,328) → free offline guess-testing.
- se_registry ~821k shelf → .se zone name-match (R2) at census scale.
- FI 19,973 with **zero** undomained → proof the registry-join route dominates; look for it everywhere.

---

## Ranked moves

### 1. NS-stamp the library (tonight, free, ~zero risk)
Batch the 8,287 .com-domained companies through the oracle; store the DNS bucket as **evidence feeding
cloud-detect priority**, never as a verdict. Honest calibration (verified):
- `awsdns-*` = HIGH precision / LOW recall. Route 53 has no free tier and exists only inside a billed
  AWS account — but W3Techs shows Amazon at 3.4% NS share vs 11.0% hosting share, so NS catches at most
  ~1/3 of AWS estates. **Positive-only flag: presence = strong prior, absence = no information.**
- Cloudflare NS (17.6% of the web) = proxy adoption, not cloud. Dataprovider could identify origin for
  only 27% of Cloudflare-fronted domains, and those skew GoDaddy/WP Engine shared hosting. Ignore as a
  cloud signal.
- azure-dns = moderate precision, 0.5% base rate. Google NS = polluted by legacy Google Domains. Weak.
Action: awsdns hits jump the cloud-detect queue (the ladder — A/AAAA vs ip-ranges.json, CNAME targets,
MX — remains the verifier). Also stamp `.se`-domained companies once move 2 lands.

### 2. Nordic zone oracles: .se/.nu/.ee on the box (this week, free)
AXFR from zonedata.iis.se (CC BY 4.0, hourly; **courtesy email to hostmaster@iis.se first** — drafted
below) and zone.internet.ee (CC BY 4.0, attribution). ~1.5M .se domains; same builder, minutes to build.
Unlocks three things at once:
- **R2 census name-match**: se_registry 821k shelf × full .se name set = the domain choke point attacked
  at census scale, free (the Library Campaign's own plan, now with the infra actually standing).
- **NS buckets on the home market**: the .se zone carries NS records; the 21,414 .se-domained library
  companies get the same free AWS prior as move 1.
- **The diff feed** (see move 6).

### 3. R4 guess-testing for the undomained 20k (this week, free)
Slug-candidate generation × offline existence tests. Norway is the prize: no .no zone will ever open
(Norid refuses bulk), so `slug.com` (+ .net/.org once move 4 lands) is the ONLY free existence test for
the 14,006 undomained NO companies. Also: re-pull brreg `hjemmeside` (verified in all bulk formats,
~30% coverage on the 10+ employee slice) to close any gap our loader left.

### 4. CZDS: request 10 more zones (5 minutes, free, +39M domains)
.net 12.3M · .org 12.0M · .info 5.3M · .biz 1.3M · .online 3.4M · .site 1.8M · .app 1.5M · .dev 713k ·
.tech 542k · .cloud 524k. All confirmed requestable (base-RA registries MUST serve zones via CZDS);
auto-renew is the default since Nov 2022; >90% approval odds, days-to-weeks for Verisign. Same account,
same `czds-pull.sh` (the links endpoint already returns every approved zone). Purpose statement must be
accurate: *"matching official business-registry records to domains for B2B data quality and market
analysis."* Bonus: .dev/.app/.cloud registrations by known companies are a tech-initiative flavor signal.
ccTLDs .io/.ai/.co confirmed NOT in CZDS — no path there, don't chase.

### 5. THE UK UNLOCK (two free applications, then the largest shelf we'd own)
Research overturned the old zone-table caution — **Nominet .uk zone files are free and available to
ALL since mid-2023.** Email registrars@nominet.uk (company, contact, address, accepted licence,
intended use) → online ID check → Files.com/SFTP credentials. Daily snapshots, 1 pull/24h. AND a second
product: the **full registered-domain list** (includes suspended/NS-less domains the zone misses).
Pair with Companies House (no application at all):
- Free monthly snapshot: **4.93M live companies**, SIC codes, status, incorporation, addresses (no
  website field — that's what our oracle layer is for).
- Accounts bulk (daily iXBRL): **average employees is a mandatory tagged field** (CA2006 s411, even
  micro companies); the UK-government-maintained `uktrade/stream-read-xbrl` parses a day's zip in ~10s
  into 38 columns incl. employees + turnover.
- Net: the UK arrives with **size data Sweden still lacks** (SCB email pending) and a full domain
  universe. Verdict flip: the 2026-07-17 table said UK "domainless=reject" — that is now false.
Sequencing per the pivot memory: build the shelf, DON'T build a UK campaign — activation waits for a
seller-attached partner pull. The roadmap band on forj.se ("UK, Europe on the roadmap") is now backed
by a concrete, costed route.
Licence tripwires (hard): no redistribution of the data; nothing construable as supporting **mass
unsolicited outreach** — compatible with the standing human-sends-only rule, but zone data must never
be cited as the source of an outreach list.

### 6. The unclaimed signal: registry-joined new-domain feed (after 2 & 4)
Verified gap: NRD (newly-registered-domain) feeds exist but are security-focused because raw NRD is
>70% malicious/junk (Unit 42); every lead-gen use targets NEW businesses. **Nobody sells "an EXISTING
known company just registered a domain" as a B2B intent signal** — the registry join that kills the
noise is exactly what we have (org-nr joins in FI, name-matches in SE/EE, house-number matches in UK
later). Implementation: weekly zone diffs (hourly possible on .se) → match against library + registries
→ `signal_events` ("Acme AB registered acme-cloud.se on Monday") → brief ACT NOW lines. Cost ~zero;
genuinely novel; feeds the existing matcher/brief pipeline.

### 7. Denmark: already in flight
ERST email SENT 2026-07-22. When credentials arrive: CVR Elasticsearch `Vrvirksomhed.hjemmeside` is a
real field, scroll-search is the sanctioned bulk pattern → **DK loads domained on arrival** (Norway-
style). Hard rule: respect `reklamebeskyttelse` (ad-protection) as a suppression list — marketing use
of protected entities is prohibited and fine-backed.

### 8. Smith "enter a domain" polish (already live, small lift)
The oracle now backs the domain path with instant existence + DNS bucket; once move 2 lands, add
sister-domain discovery (same name across .se/.com/.ee/.uk) to the read.

---

## Guardrails (all verified, all binding)
- **CZDS Spec 4 §2.1.5 + Nominet licence**: zones are a *matching/verification layer* over registry-
  sourced company lists. Outreach is never sourced from or justified by zone data. No raw-zone
  redistribution, ever. Aggregated analysis (scores, matches, stats) is the industry-standard permitted
  use (DomainTools-class businesses run on CZDS).
- **NS bucket is a prior, not a claim.** Never tell a partner "runs on AWS" from NS alone; the
  cloud-detect ladder verifies. Absence of awsdns means nothing (recall ≤ ~1/3).
- Public site copy never mentions zone files/methods (standing redaction rule).
- DK reklamebeskyttelse suppression once loaded.

## What NOT to do
- Don't buy NRD feeds or WHOIS databases — our registry join beats them for our use, free.
- Don't request all 1,151 CZDS zones — the 10 above cover the B2B namespace; the rest is noise.
- Don't treat Cloudflare NS as cloud evidence. Don't chase .io/.ai/.co (no route exists).
- Don't build UK outreach/campaigns — shelf only, until a partner pulls.

## Jacob's part (everything else is mine)
1. **Nominet application email** — draft ready below; send from jacob@forj.se, then complete the ID
   check link when it arrives. That's the whole UK domain universe.
2. **IIS courtesy note** to hostmaster@iis.se — one paragraph, drafted below.
3. **Say "go" on the CZDS 10-zone request** — I can submit it via the API with the stored credential
   (accurate purpose statement, auto-renew default); nothing new to provision.

### Draft — Nominet (send to registrars@nominet.uk)
Subject: .UK zone file access application — Novalo Technologies AB (forj.se)
> Hello, I would like to apply for .UK zone file access as a non-member under the Zone File Access
> Licence, which we accept. Company: Novalo Technologies AB (Sweden). Contact: Jacob Ahmid,
> jacob@forj.se, [postal address]. Intended use: internal analysis only — matching official business-
> registry records to their web domains for B2B data quality and market analysis in our software
> platform. No redistribution of the data, and no use in unsolicited mass communication. We would also
> like access to the registered-domain list file alongside the zone files. Happy to complete identity
> verification. Best regards, Jacob Ahmid

### Draft — IIS courtesy (send to hostmaster@iis.se)
Subject: Heads-up: regular .se/.nu zone transfers from zonedata.iis.se
> Hej! Novalo Technologies AB (forj.se) will be pulling the .se and .nu zones from zonedata.iis.se
> under CC BY 4.0 for internal B2B analysis (matching Swedish registry companies to domains), roughly
> daily from one AWS eu-north-1 IP (51.21.44.111). Just a courtesy note per your guidance — happy to
> adjust cadence if you prefer. Mvh, Jacob Ahmid
