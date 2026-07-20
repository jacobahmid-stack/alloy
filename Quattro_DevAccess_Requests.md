# Quattro — utvecklaråtkomst att begära (första kopplingarna)

Två konton räcker för att börja bygga: **Momentum** (fastighetssidan, via fastAPI) och **Fortnox** (ekonomisidan, öppet API).

---

## 1. Momentum — fastAPI / Fastighet-API (fastighetssidan)
**Hur:** Momentum har utvecklardokumentation på `docs.momentum.se/fastighet-api/`. Be deras support/partner om test-credentials.

**Mejl att skicka:**

> **Ämne:** Utvecklaråtkomst till Momentums fastAPI
>
> Hej,
>
> Vi på Alto bygger en integration ovanpå fastighetssystem via fastAPI-standarden och vill testa mot Momentums Fastighet-API. Vi behöver:
> - En utvecklar-/testmiljö, gärna en testkund med exempeldata.
> - OAuth2-credentials (client credentials) för läs- och skrivåtkomst.
> - Åtkomst till fastAPI-entiteterna (Fi2Partner, Fi2LeaseContract, Errand m.fl.) och modulerna Customers, Errands och Payment.
>
> Målet är en demo där man ställer frågor och agerar tvärs över systemen från Teams. Vi följer fastAPI 1.0 och avser certifiera oss hos BIM Alliance.
>
> Vem är rätt kontakt för utvecklaråtkomst?
>
> Tack, [namn] · Alto

---

## 2. Fortnox — öppet API (ekonomisidan)
**Hur:** Fortnox har en utvecklarportal / integrationsprogram (`developer.fortnox.se`). Registrera er som integrationspartner och skapa en app för OAuth2-credentials — mycket är self-service.

**Mejl / registrering:**

> **Ämne:** Integrationspartner / utvecklarkonto
>
> Hej,
>
> Vi bygger en integration som läser ekonomidata (fakturor, hyresreskontra, huvudbok) via ert öppna API, för fastighetsbolag. Vi vill:
> - Registrera oss som integrations-/utvecklarpartner.
> - Skapa en app och få test-credentials (OAuth2).
> - Förstå processen för att längre fram listas i er App Market.
>
> Tack, [namn] · Alto

---

## Sen är ordningen:
1. Bygg **fastAPI/Fi2-klienten** mot Momentums testmiljö (Partner · Kontrakt · Ärende).
2. Bygg **Fortnox-kopplingen** mot ett testkonto (faktura · reskontra · huvudbok).
3. Koppla ihop till en **frågetjänst i Teams** — det är demon.
4. **Visma** och **BIM Alliance-certifiering** som nästa steg.
