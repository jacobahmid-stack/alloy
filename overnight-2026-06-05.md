# Overnight 2026-06-05 — BuiltWith + Smith

## Shipped this session (live on main → Amplify)
- **Smith streaming** proxy branch (claude-proxy v32) — deployed + verified (SSE 200, prompt intact).
- **BuiltWith consolidated**: `builtwith-lookup` is the keeper (credit-safe: per-company cache, 60-day freshness, 50/call cap, writes techstack/cloud/email/signals). My duplicate `builtwith` fn **retired** (410 tombstone, v3).
- **Cron dialed**: `builtwith-enrich-batch` (jobid 1) `*/5 * * * *` → **`0 * * * *`** (hourly) — caps any influx burst at 50/hr.
- **Company card** (CompanyIntelPanel ~forge.jsx:2919):
  - **Deep-stack display block** — total tech spend + ICP signals + technology list (commit fb7402a).
  - **On-demand "BuiltWith" button** — force-enrich one company via builtwith-lookup, cached, ~1 credit (commit a306b41).
- **Credits**: 1,988 / 2,000. Nothing burned overnight.
- Spawned task: cloud-detect HTTP 546 timeouts (deep-scan cron failing).

## Held for you (consequential / needs a call) — NOT done blind

### A. Train Smith on AWS / Azure / GCP — needs a scope decision
Smith already grounds tri-cloud + parallel-fetches all three. The grounding fns:
- `aws-knowledge` + `aws-docs` — solid.
- `ms-docs` (Azure via MS Learn API) — solid.
- `gcp-docs` — **WEAK**: falls back to `web_search` because **Google CSE keys aren't set** (your action: GOOGLE_CSE_ID + GOOGLE_CSE_KEY as edge secrets) → then GCP grounding is first-class like AWS/Azure.
Deeper "training" options (pick one): (a) ingest GCP+Azure reference docs into the KB/RAG (best, needs source docs); (b) better free GCP source in gcp-docs (no keys); (c) tune the smith_chat tri-cloud prompt in claude-proxy (careful redeploy — the crown jewel). I held this rather than do a low-value/risky blind version.

### B. Import + enrich the prospect list (below) — needs target + ICP filter
- **Target project**: `novalo` (2,718 cos, software/migration ICP) or `alto` (2,297, mid-market)? Your pick.
- **ICP filter REQUIRED**: the list is mixed — keep mid-market (lifesum, rugvista, compricer, bytbil, signomatic, weleda, notar, studentum, cloudamqp, appspotr…); **drop the tiny local-service sites** (saljabil*, fasadtvatt*, taklaggare*, kranbil*, varmepump*, bergvarme*, klottersanering*, etc.) and the **too-large** (volvoce, teliacompany, northvolt, nissan, warnerbros — likely above ICP cap).
- Plan once you pick: dedupe by domain → insert with `list_tag='builtwith-2026-06'` → the hourly cron enriches them (≤50/hr, bounded). ~few-hundred credits worst case.

### C. Reconcile the two card BuiltWith spots
There's a panel at ~forge.jsx:2522 with its own BuiltWith key/fnurl settings (window.storage `forjg:builtwith:*`) AND the CompanyIntelPanel (2919) where I added the display + button. Decide the canonical one and dedupe so the card has a single, clean BuiltWith surface ("best practice"). Low risk, just needs eyes-on, not blind.

## Prospect list (raw, as pasted — preserved verbatim)
Columns appear to be: domain · country · [revenue kr] · [tech spend kr/mo] · [?] · [employees/visits] · [?] · [traffic rank]. Verify mapping at import.

```
zettle.com SE kr3,446,409+ kr216,491+ 14,668+ 485+ 55,615
nissan.se FR kr213,731+ 1,421+ 362,176
volvoce.com SE kr209,317+ 24,962+ 13,043+ 95,485
teliacompany.com SE kr189,059+ 4,664+ 20,800+ 84,655
us.bona.com SE kr132,495+ 3,231+ 512+ 121,124
opdivopatient.se SE kr117,989+
northvolt.com SE kr113,036+ 13,674+ 234,305
link.info.arkenzoo.se SE kr110,917+ 36,770+ 164,048
ikaros.net SE kr2,266,290+ kr91,505+ 66+ 1,588,094
appspotr.com SE kr85,046+ 5,649+
tv4play.se SE kr62,865+ 44,135
avis.se SE kr62,725+ 208+ 500+ 568,633
nwx.new-work.se DE kr55,700+ 882+ 124,607
innocentdrinks.se SE kr51,137+ 272,564+
adaptil.com SE kr47,067+ 992+ 621,350
svd.se SE kr45,673+ 6,990
kungalvsposten.se SE kr41,687+ 768+ 595,232
cars.travellink.se US kr40,330+ 123+ 862,403
cloudamqp.com SE kr34,197+ 1,920+ 16,044
abounderrattelser.fi SE kr29,337+ 8,647+ 436,174
lifesum.com SE kr88,215+ kr28,212+ 2+ 7,286+ 72+ 34,140
prvcy.vkmedia.se SE kr27,999+ 762+ 607,385
pixartprinting.se IT kr27,469+ 15,228+ 3+
clicktrans.se SE kr26,112+
bytbil.com SE kr26,103+ 97+ 66,455
takab.nu SE kr25,666+ 1,526,040
fotbollskanalen.se SE kr24,402+ 57,418
annelundstak.se SE kr23,650+
rugvista.no SE kr20,750+ 142,707+
studentum.se SE kr18,372+ 362,476
iqan.se SE kr16,076+
bornholmtours.se SE kr15,797+
notar.se SE kr14,394+ 573+ 594,987
weleda.se SE kr13,800+ 12,602+
signomatic.com SE kr12,945+
varumarke.stangastaden.se SE kr11,802+ 3,431+ 828,683
compricer.se SE kr8,782+ 512+ 101+ 146,279
proviva.se SE kr8,456+ 2,494+
coface.se SE kr7,824+ 7,518+ 4,608+
studentum.nl SE kr7,601+ 50+ 717,024
riverton.se SE kr6,384+ 4,710+ 33+
presencosport.se DK kr6,226+ 124+
nra.ie SE kr5,901+
jetfinans.se GB kr5,585+
slojd-detaljer.com SE kr5,483+ 6,846+ 402,207
teliaplay-pilot.se SE kr5,195+
rentaeasy.se SE kr4,349+ 1,590,182
perfectfools.com SE kr4,349+ 580+ 31+
sekoklubbsjvast.se SE kr4,349+
polhemspriset.se SE kr3,252+
seobyravastmanland.se SE kr3,252+
northosts.se SE kr3,252+
stenlaggningvarmdo.se SE kr3,252+
saljabiljarfalla.se SE kr3,252+
saljabilhalland.se SE kr3,252+
bk-feedback-se.com SE kr3,252+
vasbylas.se SE kr1,580+ 143+
framme.com SE kr748,699+ kr446+ 314+ 636+ 17+
warnerbros.se US 115+
taktvattodeshog.se SE
restaurangesplanad.se SE kr266,764+
bergvarme-sodertalje.se SE
kontorsbelysning-stockholm.se SE
stockholmformosa.se SE kr266,764+ 1,512,872
holidaylettings.se GB 12,553+
kursbok.se SE
robertburen.com SE
kranbilsundbyberg.se SE
a-o.ooo SE
varmepumpar-ystad.se SE
taklaggarehasselby.se SE
status.treasurysystems.com SE
tommysskidservice.se SE
levy.se SE
fasadtvattnorrtalje.se SE
solfilmvarmdo.se SE
paysoft.se SE
eyen.se SE
showit.se SE
verisign.se US
ibxgroup.net SE
puredelivery.se SE
sodrateatern.com SE 16,774+
eroxon.se SE
fasadtvatt-vasteras.se SE
ketoplanner.se FR 268,613
badrumsrenoveringjonkoping.se SE
hogbergshalsa.se SE
gronhag.se SE
injekteringbetongnorrtalje.se SE
kopabil-gavle.se SE
taplantyreso.se SE
klottersanering-helsingborg.se SE
avari.se SE
zyax.se SE 13+
xn--topp10-bsta-gratis-hemsidebyggare-n1c.se SE
saljabiltaby.se SE
enskiltavlopp-kramfors.se SE
kranbilleksand.se SE
iconara.org SE
```
