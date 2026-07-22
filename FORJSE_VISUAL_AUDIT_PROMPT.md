# Visual audit prompt for forj.se + Alloy + Smith

**Synced 2026-07-21 to `FORJ_LEVEL_UP_PROMPT.md` §6b. If the two drift, §6b wins.**

**Why this exists:** the Claude Code session that builds these surfaces cannot see rendered pixels
(screenshots time out in that environment). It measures the DOM, computes contrast, and verifies every
claim; that side is covered. What it cannot judge is whether any of it is beautiful, whether the
character carries, whether the motion feels right. That needs eyes.

**How to use:** open Claude desktop or claude.ai with browsing, paste everything below the line, and
let it look at https://forj.se properly. If you also want the Alloy app judged (recommended), paste
screenshots into the same conversation: the dashboard letter, an account card, the co-sell panel, and
a brand-new empty workspace, in both themes if you can.

---

You are a design director reviewing a live B2B product family. Look at **https://forj.se** properly:
scroll the entire homepage top to bottom, use the theme toggle in the left rail to see both light and
dark, view it at desktop and at phone width, and then do the same for **https://forj.se/pricing.html**
and **https://forj.se/smith/**. If screenshots of the Alloy app are attached, judge them as part of
the same family. Then give me a hard, specific critique.

## What you are looking at

Forj sells **Alloy**, a go-to-market platform for firms that sell on AWS, and **Smith**, an AI
co-worker presented openly as an AI. The buyer is a Nordic AWS partner: a consultancy or ISV with a
small sales team. Two prices, both on the pricing page: Alloy with Smith at 10 000 SEK a month, or
the Forj desk on top at 100 000 SEK a month. The pages must feel like enterprise software from a
serious company.

The intended identity is **industrial forge**: steel-violet, ember as a rare content accent, warm
bone paper in light mode, soot in dark, materials over glow. Space Grotesk display, Inter body,
Space Mono small labels. The character is Smith, a semi-realistic cartoon blacksmith, recently locked
to one consistent face.

The structural benchmark the owner admires is **altahq.com**: character-led, dense with product
imagery, restrained type. Forj should learn Alta's structure and density, never its pastel Pixar
styling.

## Judge these, in this order

**1. Five-second test.** No scrolling. What does this company appear to do? Expensive or template?
Where does the eye land first, and is that the right place?

**2. Smith, the character.** He appears in the hero as a cut-out figure with an ink name-bar, on
three scene cards, above the closing CTA, as the chat console avatar, and on /smith. Does he read as
a credible senior colleague, a mascot, or stock AI art? Right size in the hero? Does the name-bar sit
naturally or look stuck on? Are the cut-out edges clean on both grounds? Is the face the SAME MAN
everywhere you see him? Be blunt: if the illustration style undercuts the enterprise positioning,
that is the single biggest visual bet on the table and I need it said plainly.

**3. The bands.** Homepage order: hero, co-sell record, morning brief, signals wall, loop track,
free read, Smith console, product shots, program grid, two-doors comparison, FAQ, CTA. Does each band
feel like a distinct kind of thing, or is it card-card-card? Which bands earn their space, and which
would you cut entirely? Judge two specifically: the **record band** (four large numbers plus two
figures inline in sentences: composed or crowded?) and the **pricing page's two plates** (the 100k
card carries price, a quarterly-plus-effective line, and an MDF sentence: does that block read
confident or like small print?).

**4. Colour.** Is the violet earning its rare appearances or sprinkled? Do the amber AWS tags sit
with the violet or fight it? Is dark mode a design or an inversion? Name the specific elements that
are the wrong colour.

**5. Type.** Hierarchy at a glance? Headline weight right or timid? Too many sizes? Do the mono
labels help or clutter? Anything hard to read?

**6. Iconography and illustration language.** Rail icons, small line icons, the convergence lines
under the signals wall, the arc dividers, Smith's painterly style: one language or several? Anything
that looks borrowed from a different design system?

**7. Motion.** The hero panel cycles company rows, counters animate, a molten bar draws on load,
hover states. Watch it. Purposeful or fidgety? Anything that stutters, distracts, or repeats often
enough to annoy? Anything that should move and does not?

**8. Density and rhythm.** Dead zones, pile-ups, or a consistent beat while scrolling? This site
carries more copy per band than the benchmark: does it breathe?

**9. The navigation, and I need a ruling.** The homepage and legal pages use a fixed left rail; the
pricing and integrations pages use a topbar. Two paradigms on one site is a defect. Your verdict
picks the winner: rail everywhere, topbar everywhere, or something else. State it as a decision, not
an observation.

**10. Cross-surface coherence.** Put the homepage, pricing, /smith, and any Alloy screenshots side by
side. One company or three? Same Smith, same violet, same type discipline, same tone?

**11. Mobile.** Full scroll at phone width on the homepage and pricing. What breaks, what gets ugly,
what becomes pointless at that size?

## Rules for your suggestions

- **Do not suggest changing any number, statistic or factual claim.** Those are verified against live
  systems and audited separately. Visual and structural feedback only.
- No em dashes in any copy you propose.
- No customer or partner names anywhere.
- Prefer removing over adding. If a band should die, say so plainly.

## What I want back

1. **The five things that most damage the impression of quality**, ranked, each naming the element
   and the concrete fix.
2. **Three things that are genuinely good** and must survive any redesign.
3. **The one structural change** with the highest payoff, even if it is expensive.
4. **The navigation ruling** from point 9, stated as a decision.
5. **A blunt verdict:** does this look like software a Nordic AWS partner pays 10 000 SEK a month
   for, and does the Desk page look worth 100 000? If not, the gap in one sentence each.

Be specific and be harsh. Vague encouragement is useless here.
