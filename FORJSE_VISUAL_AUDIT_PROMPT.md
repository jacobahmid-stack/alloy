# Visual audit prompt for forj.se

**Why this exists:** the Claude Code session that builds forj.se cannot see rendered pixels (screenshots
time out in that environment). It can measure the DOM, compute contrast, and check every claim, and it is
doing that separately. What it cannot judge is whether the page is *beautiful*, whether the character art
carries, and whether the motion feels right. That needs eyes.

**How to use:** open https://forj.se in Claude desktop or claude.ai with browsing, paste everything below
the line, and let it look. Ask it to scroll the whole page, toggle the theme, and resize to mobile.

---

You are a design director reviewing a live B2B website. Look at **https://forj.se** properly: scroll the
entire page top to bottom, use the theme toggle in the left rail to see both light and dark, and view it at
desktop and at phone width. Then give me a hard, specific critique.

## What the site is

Forj sells **Alloy**, a go-to-market platform for firms that sell on AWS, and **Smith**, an AI co-worker
presented openly as an AI. The buyer is a Nordic AWS partner: a consultancy or ISV with a small sales team.
The page has to feel like enterprise software from a serious company, not a startup landing page.

The intended visual identity is **industrial forge**: steel-violet, ember as a rare content accent, warm
bone paper in light mode, soot in dark, materials over glow. Space Grotesk for display, Inter for body,
Space Mono for small labels. The character is Smith, a semi-realistic cartoon blacksmith, recently locked to
one consistent face.

The benchmark the owner admires is **altahq.com**: character-led, dense with product imagery, restrained
type, playful but premium. Forj should learn Alta's *structure and density*, never its pastel-purple Pixar
styling.

## Judge these, specifically

**1. First impression.** Five seconds, no scrolling. What does it look like this company does? Does it feel
expensive or does it feel like a template? Where does your eye go first, and is that the right place?

**2. The character.** Smith appears in the hero as a cut-out figure with a name label, again on three scene
cards, and again above the closing CTA. Does he read as a credible colleague, or as a mascot, or as stock
AI art? Is he the right size in the hero? Does the ink name-bar under him work or does it look stuck on?
Is the cut-out edge clean against both backgrounds? Be blunt: if the illustration style undercuts the
enterprise positioning, say so, because that is the single biggest visual bet on the page.

**3. The boxes.** The owner's recurring complaint has been that every band looks the same. Bands are: hero,
the co-sell record, the morning brief, a signals wall of eight tiles, a four-station loop, a free-read
form, the Smith console, product screenshots, an eight-tile program grid, an Alloy-vs-Desk comparison, FAQ,
and a closing CTA. Does each band feel like a distinct *kind* of thing, or is it card-card-card? Which
bands are pulling their weight and which are filler you would cut entirely?

**4. Colour.** Is the palette working, or muddy? Is the violet accent earning its rare appearances or
sprinkled? Do the amber AWS tags sit correctly against the violet, or fight it? Is dark mode a real design
or an inversion? Name specific elements that are the wrong colour.

**5. Type.** Is the hierarchy clear at a glance? Is the headline the right size and weight, or timid? Are
there too many type sizes? Do the mono labels help or clutter? Is anything hard to read?

**6. Illustration and iconography.** The rail icons, the small SVG line icons, the convergence lines under
the signals wall, the arc dividers between bands. Are these consistent in weight and style with each other
and with Smith's illustration style? Anything that looks borrowed from a different design language?

**7. Motion.** There is a hero panel that cycles company rows, counters that animate, a molten bar that
draws on load, and hover states. Watch it. Is the motion purposeful or fidgety? Anything that distracts,
stutters, or repeats often enough to annoy? Anything that should move and does not?

**8. Density and rhythm.** Too sparse, too crowded, or right? Is the vertical rhythm consistent as you
scroll, or are there dead zones and pile-ups?

**9. The left rail.** A fixed vertical nav on desktop, a top bar on mobile. Does it help or does it eat
space and attention? Would the page be better with a conventional top nav?

**10. Mobile.** Resize to phone width and scroll it all. What breaks, what gets ugly, what becomes
pointless at that size?

## Rules for your suggestions

- **Do not suggest changing any number, statistic or factual claim.** Those are verified against live
  systems and are being audited separately. Visual and structural feedback only.
- Assume no em dashes are allowed in copy. Do not introduce any.
- Do not suggest naming customers or partners. The site names none deliberately.
- Prefer removing over adding. If a band should be deleted, say so plainly.

## What I want back

1. **The five things that most damage the impression of quality**, ranked, each with the specific element
   and a concrete fix.
2. **Three things that are genuinely good** and must not be lost in a redesign.
3. **The one structural change** that would most improve the page, even if it is expensive.
4. A blunt verdict: does this look like software a Nordic AWS partner would pay for monthly? If not, what
   is the gap in one sentence.

Be specific and be harsh. Vague encouragement is useless here.
