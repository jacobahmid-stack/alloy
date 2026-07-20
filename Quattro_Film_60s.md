# Quattro · 60-sekundersfilmen ("gör det sant")

**Syftet:** en (1) äkta koppling slår 58 loggor. Filmen visar Quattro läsa **riktig data ur ett riktigt Fortnox-konto** via en riktig OAuth-anslutning. Används i: kunddemos, outbound-mejlen, Alto-mötet, och senare på landningssidan.

---

## Förberedelser (en gång, ~20 min totalt)

**1 · Jacob: skapa Fortnox utvecklarkonto (≈5 min, gratis)**
- Gå till `developer.fortnox.se` → registrera utvecklarkonto (self-service).
- Skapa en app → notera **Client-ID** och **Client-Secret**.
- Sätt redirect-URI till `http://localhost:5173/callback`.
- Aktivera en **testmiljö/demobolag** (utvecklarkontot får ett sandbolag med exempeldata; lägg annars in 3-4 kundfakturor med passerade förfallodatum + 3 leverantörsfakturor i sandbolaget så rapporten har något att visa).

**2 · Koppla (i `C:\Users\jacob\alloy\quattro-connector`)**
```powershell
# .env: fyll i FORTNOX_CLIENT_ID + FORTNOX_CLIENT_SECRET (auth/token-URL:erna är förifyllda)
npm run dev -- connect fortnox          # öppna URL:en som skrivs ut → logga in → godkänn
npm run dev -- connect:finish fortnox <code-från-redirecten>
npm run dev -- connections              # ska visa fortnox + utgångstid
```

**3 · Torrkör innan inspelning**
```powershell
npm run dev -- demo:fortnox             # morgonrapporten, live ur Fortnox
```

---

## Storyboard (60 sek)

| Tid | Bild | Replik (lugn, låg tempo) |
|---|---|---|
| 0-8s | forj.se/quattro i webbläsaren, scrolla till demon | "Det här är Quattro. Demon på sidan kör exempeldata." |
| 8-18s | Klipp: Fortnox-sandbolaget öppet i webbläsaren (fakturalistan) | "Det här är ett riktigt Fortnox-konto. Riktiga fakturor, riktiga förfallodatum." |
| 18-30s | Terminalen: kör `npm run dev -- demo:fortnox` | "Nu frågar vi Quattro · via en riktig anslutning, med enbart läsrättigheter." |
| 30-45s | Morgonrapporten skrivs ut: förfallna kundfakturor + obetalda leverantörsfakturor, summor, namn, datum | "Förfallna hyror. Fakturor som väntar på attest. Sammanställt på sekunder · samma siffror som i Fortnox." |
| 45-55s | Split: rapporten bredvid Fortnox-listan (visa att siffrorna matchar) | "Inget byts ut. Quattro läser där datan redan finns · och i produktion kommer det här som ett Teams-meddelande varje morgon klockan sju." |
| 55-60s | Tillbaka till forj.se/quattro · "Boka demo" | "Quattro by Alto. Fråga era system. Få det gjort." |

**Inspelning:** Win+G (Game Bar) eller OBS · 1080p · mörkt terminaltema (matchar varumärket) · zooma terminalen till ~16-18pt så texten syns i mobil.

**Sanningskrav (viktigt):** allt i filmen är äkta · riktig OAuth, riktigt konto, läsrättigheter. Det enda "demo" är att bolaget är ett sandbolag. Säg det rakt ut om någon frågar.

**Nästa nivå av samma film (när Teams-appen finns):** samma flöde men svaret landar i riktiga Microsoft Teams istället för terminalen. Då ersätter den här filmen sig själv.
