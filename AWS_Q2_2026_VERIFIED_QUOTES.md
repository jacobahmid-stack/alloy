# AWS Q2 2026: what we may actually say

**Verified 2026-07-31** against the Amazon Q2 2026 earnings release (8-K Ex-99.1), the conference
call slides, Amazon's 10-Qs, Microsoft's FY2026 10-K, Alphabet's Q2 2026 10-Q, and the 30 July 2026
call transcript read across four independent aggregators.

**Source under test:** Tomasz Tunguz, "AWS' Road to $1t". Honest and unusually well footnoted.
Roughly 80% is safe. It also carries **one false attribution, one misquote and one category error**.

---

## SAFE TO SAY

**The barbell.** Andy Jassy, Amazon Q2 2026 earnings call, 30 July 2026, answering Brian Nowak of
Morgan Stanley:

> "we see this adoption curve in AI right now is very barbellled. There is, on one end of the
> barbell, the AI labs are consuming gobs and gobs of compute..."

> "In the middle of the barbell is all of the current enterprise production workloads, some of which
> are using inference in a pervasive way, but most of which aren't. That is going to change very
> significantly over time."

> "**In my opinion**, that will be the largest absolute segment, the existing production workloads in
> the enterprise and new businesses and workloads that startups build too."

**Ship the hedge and the caveat with it.** Jassy volunteered this in the same answer:

> "I don't know if the trajectory of that middle part of the barbell will be the same wildly steep
> trajectory that we've seen with the current barbell AI labs piece."

**Capacity. This is the line that actually sells to a partner audience.**

> "Even at that amount, we will still not have enough capacity to meet all the demand we have in
> 2026, and I believe this dynamic will also be true in 2027, too. In fact, the demand we already
> have for 2028 is striking."

> "the lion's share of capacity in 2027... is largely reserved, and we have quite a bit of capacity
> that's already been reserved for 2028."

**Market size, and arguably the best single line for us.**

> "Remember, by the way, that 85% of the global IT spend is still on premises. That equation is going
> to flip in the next 10-20 years."

**Growth.** AWS grew **36.7%** year over year, its fastest in 18 quarters and the fifth straight
quarter of acceleration. I re-ran the acceleration from Amazon's own segment tables: 16.9 / 17.5 /
20.2 / 23.6 / 28.4 / 36.8. Monotonic, five steps, no ties. Ended at a **$169b annualized run rate**,
which Jassy said "would place it 24th on the Fortune 500 list if it was a standalone company."

**Scale ambition.** Jassy: AWS "has the potential to be a $1 trillion revenue business for AWS".
**He attached no date.**

**Contract shape.** "most of our AI capacity these days is being contracted for at least five-year
terms"; servers take "a little less than three years to break even" against "at least five to six
years" of life.

---

## DO NOT SAY

**The false attribution.** The article says Olsavsky noted Amazon has been issuing debt. **Jassy said
it.** Colin Sebastian addressed the question to "Brian" and Jassy intercepted with "Let me take your
second question first." Olsavsky never speaks in that exchange, and "debt" occurs exactly once in the
whole call. Same error on the $220b capex figure, which is also Jassy. This is the most checkable
mistake in the piece and the one most likely to embarrass us in front of an AWS audience.

**The misquote.** "the current barbelled AI Labs piece" is inside quote marks in the article. The
transcripts say "the current **barbell AI labs** piece".

**"Most of which do not yet use inference pervasively" is not a Jassy quote.** It is Tunguz's
paraphrase, and he correctly leaves it outside his quote marks. Preserve that punctuation.

**"Largest absolute segment" without "In my opinion".** Removing the hedge turns an opinion into
guidance. He also widened it beyond the middle to include startups' new workloads, so the article's
framing is narrower than the thing he called largest.

**The backlog comparison, which would do the most damage.** "AWS has the smallest backlog of the big
three" is a category error, four ways:
- Microsoft's $678b is *commercial RPO* spanning Server products, M365 Commercial, part of LinkedIn,
  Dynamics and Enterprise services. It is **not an Azure number**. Alphabet's $513.9b is Google Cloud
  only. Amazon's $496b is "primarily related to AWS".
- Amazon counts only contracts over one year. **Alphabet changed its policy in Q1 2026** to include
  contracts of a year or less, so its base is wider by construction.
- Microsoft's and Alphabet's include deferred revenue; Amazon's sits on top of unearned revenue.
- Duration differs: AWS 5.5 years weighted average, Microsoft ~2.3 years. Backlog scales with
  duration, so the ranking is partly a contract-length artefact.

**And the growth figure is wrong.** "Triple digits against $364b" welds two different disclosures.
Jassy's "growing triple digits year-over-year" is against **$195b** (Q2 2025 10-Q) = +154%. Against
$364b it is +36% in a quarter. Worse, Jassy said on the Q1 call that the $364b excluded a
"recent deal... over $100 billion" - so if that landed in Q2, organic growth is roughly +7%.

**Do not name that ~$100b counterparty.** Amazon's Q1 10-Q documents an OpenAI expansion; two
transcripts of the same call have Jassy naming Anthropic. Unresolved. Say "a previously announced
commitment of over $100 billion" and stop.

**Everything about the trillion's timing or a $10t market cap** is the author's own model, which he
flags in footnote 7. Never attribute to Amazon.

**Margin needs both numbers.** 39.4% is Amazon-printed and real, but the +650bp is **520bp excluding
an energy derivative gain** (Olsavsky's own words), and it is measured off an unusually weak Q2 2025
at 32.9%. It is also **not a record**: Amazon's table prints 39.5% for Q1 2025.

**Do not say AWS has a "$50 billion AI business".** Two separate $25b **run rates**, and Trainium sits
inside the chips number while being sold as AI capacity. Summing double-counts.

**Never quote a name from a transcript.** These are machine transcripts. Confirmed mangles in this
one: "Bedrock Agents" for **AgentCore**, "Descartes Labs" for **Decart**, "Neurorobotics" for
**NEURA Robotics**, "Poolside AI" for **Poolside**, "Twelve Labs" for **TwelveLabs**. Figures survive
the pipeline; names do not.

---

## Why this matters for Forj

The middle of the barbell is the library: mid-market enterprises running production workloads that
mostly do not use inference yet. AWS's CEO named it the largest absolute segment and admitted he
cannot time it. AWS does not reach those companies directly. It reaches them through partners.

Pair it with the capacity line and the 85% on-premises line and the argument writes itself, entirely
in AWS's own words, with no vendor, method or economics disclosed.
