# Quattro · Next Level (brainstorm 2026-06-12)

Full genomgång gjord av: landningssidan (live), testmiljön, Quattro_Model.md, Quattro_API_Targets.md, Quattro_Delivery.html (deck), QUATTRO_SELFSERVE_PITCH.md, cheatsheet, Quattro_Demo_Architecture.md, Quattro_Mail_SE.md, Quattro_DevAccess_Requests.md, quattro-connector/.

## Diagnos
Allt som finns är **berättelse** (stark sådan). Det som saknas är **bevis** (0 live-kopplingar, 0 kunder, 0 riktiga siffror), **distribution** (sidan är en ö, ingen trafikkälla) och **Altos ja** (pitchen till Erik & Emilio är inte landad). Next level = berättelse → bevis → pipeline → vallgrav.

---

## A · BEVIS (största gapet)

**A1 · SIE-bryggan ⭐ (bästa nya idén).** Varje svenskt ekonomisystem exporterar **SIE-filer** (standardformat, även till revisorn). Bygg "**Quattro läser er SIE-fil**": dra-och-släpp → 60 sekunder senare en genomlysning (kostnadsavvikelser, leverantörsbild, kostnad per fastighet via kostnadsställen/dimensioner). **Bevis på kundens riktiga data utan en enda koppling, inloggning eller IT-godkännande.** Löser data-förtroendeväggen helt; funkar för 100% av svenska bolag; ingen konkurrent gör det; perfekt outbound-krok ("svara med er SIE så visar vi"). SIE-4 är ett vänligt textformat · parser på en dag. OBS: lova ekonomisk genomlysning, inte hyresreskontra (aging per hyresgäst ligger inte i SIE).

**A2 · Gör EN koppling sann: Fortnox.** Self-serve dev-konto finns idag (developer.fortnox.se, gratis sandbox). Bygg riktig OAuth → kör "förfallna fakturor" på ett riktigt testkonto → **filma 60 sekunder i riktiga Teams**. En sann koppling slår 58 loggor. Dödar "är det på riktigt?"-invändningen i både kunddemos och Alto-mötet.

**A3 · Pilotprogram "Första 5".** 5 namngivna design-partners: gratis uppstart mot publik case + siffror. Rikta mot Kundo-17-listan (bevisat självköpande). Landningsmodul: "Pilotprogram · 2 platser kvar" (knapphet).

**A4 · ROI-räknare på sidan.** "Antal lägenheter · fakturor/mån · ärenden/mån" → timmar + kronor/år. Köpare räknar i kronor; förramar priset som billigt. Kundo har ingen.

**A5 · 60-sek film** (riktig inspelning, inte simulering) i hero-området.

## B · DISTRIBUTION (sidan är en ö)

**B1 · Kör loopen på riktigt: Kundo-17-outbound via Alloy.** Listan finns redan (Stena, Heimstaden, Wallenstam, John Mattson, Nyköpingshem…). Personliga mejl (Smith-utkast) + demolänk + ev. SIE-kroken. Mät: öppnat → demo bokad → pilot. Hela tesen "Alloy hittar → demon bevisar → Alto stänger" får sin första datapunkt.

**B2 · Recept-biblioteket (SEO).** Publicera flödena som publika sidor: "Så automatiserar du leverantörsfakturor i Vitec + Fortnox". 58 system × användningsfall = long-tail-maskin som fångar systempar-sökningar.

**B3 · Upphandlingsdörren.** Allmännyttan (290 bolag) köper via LOU/ramavtal (HBV, Adda, SKR). Långsamt men = vallgraven för offentligt segment. Starta samtalet nu, skörda om 12 mån.

**B4 · BIM Alliance-certifieringen som PR-moment.** Certet är inte bara teknik · det är ett pressmeddelande, en logga på sidan och dörröppnaren i allmännyttan (de äger standarden).

## C · PRODUKT (wow som ger retention)

**C1 · Quattro Daily ⭐ (vänd ask→tell).** Proaktiv morgonrapport i Teams: "God morgon · 3 fakturor över attestgräns, 2 förfallna hyror, myndighetsdeadline fredag." Chat används ibland; en digest används **varje dag** = synligt värde dagligen = retention + intern spridning ("vad är det där?"). Lätt att lägga som flöde i sandbox-demon NU (1-2 h) och känna på reaktionen i demos.

**C2 · Personaliserad demo: "Välj era system".** Dropdown i sandboxen (Vitec+Fortnox / Momentum+Visma/…) → källetiketterna anpassas. Noll risk, "det är ju vi"-effekt. ~2 h bygge.

**C3 · MCP-gateway-positionen (12-mån-bet).** Exponera kopplingarna som MCP så **vilken AI-klient som helst** (Microsoft Copilot, Claude, ChatGPT Enterprise) kan använda dem. När Copilot landar i varje Teams-tenant är Quattro **handlingslagret det behöver**, inte konkurrenten. Rider vågen istället för att slåss mot den; matchar Altos ursprungs-DNA (Universal Intelligence Connectivity) men nu med kil + distribution. (Pigello är redan MCP-native · bra första parhäst.)

**C4 · Attest som killer-första-modul.** Alla hatar fakturaattest; det rör pengar = höga insatser = autonomi-ratten lyser. Led modulberättelsen med den.

**C5 · Per-lägenhet-prisexperiment.** Branschen räknar per objekt/lägenhet (Momentum prissätter så). Testa "från X kr/lägenhet/mån" muntligt i demos innan något ändras på sidan.

## D · FÖRTROENDE (väggen vi identifierat)

**D1 · Publik säkerhetssida.** DPA, underbiträden, EU-hosting, "läser bara först", GDPR-bilaga, pentest-plan. Krav innan pilot i allmännyttan; halv dag att skriva (forj.se-mallarna finns).

**D2 · "Bjud in er IT"-knapp i testmiljön.** Skickar säkerhets-one-pagern till IT → gör blockeraren till ett steg i flödet.

---

## Hårda frågor (provokationen)
1. **Vem är economic buyer?** Privata (Stena/Heimstaden) = vd/CFO som kan signa själva; allmännytta = digitaliseringschef + upphandling. Sidan talar till båda (ok), men outbound MÅSTE splitta budskapen.
2. **Det riktiga nästa steget kanske inte är kundvänt alls:** Altos ja. Allt byggt (sidan, testmiljön, priserna, decket) är hävstång för DET mötet. Boka det.
3. **"58 system" med 0 live** = överlöftesrisk. A2 (en sann koppling) är motgiftet · prioritera den före mer bredd.
4. **3 900 kr/mån + 19k uppstart** täcker knappast cost-to-serve om uppstarten är hands-on. Ok som land-pris, men räkna CAC/LTV innan skalning.

## Konvergens · topp 3 (mina val)
1. **A1 SIE-bryggan** · unik, löser förtroendeväggen, funkar för alla, outbound-krok. *Billigaste testet:* erbjud det manuellt i nästa 3 demos ("skicka er SIE-fil") innan något byggs.
2. **A2 Fortnox på riktigt + 60-sek film** · gör en sak sann. *Billigaste testet:* dev-konto idag, koppling + film inom en vecka.
3. **B1 Kundo-17-loopen** · första datapunkten på hela tesen. *Billigaste testet:* 5 mejl denna vecka via Alloy, mät svar.

**Snabba vinster (timmar):** C1 Quattro Daily i sandboxen · C2 systemväljaren · D1 säkerhetssidan.
**Strategiska bet (kvartal):** C3 MCP-gateway · B4 BIM-cert · B3 ramavtal.

## Medvetet åt sidan (inte nu)
- Fler system i katalogen (bredd bevisar inget längre · 58 räcker tills 1 är live).
- Engelsk version / fler vertikaler (horisontellt språk finns; bevisa fastighet först).
- Self-serve-betalning/checkout (Kundo-benchmarken + LOU säger: demo-led vinner nu).
- Per-lägenhet-pris på sidan (testa muntligt först, C5).
