# Quattro · API-mål (verifierade, rankade)

Researchad 2026-06-11 via webb (riktiga API-dok; "unverified" = leverantören hävdar API men publika tekniska doc gick inte att bekräfta). Mål: vad Quattro ska bygga koppling mot, i vilken ordning. Kärnan = **Fastighet + Ekonomi** (beviset); räckvidd = CRM, Lön & HR, Dokument & avtal.

Rank: **1 = bygg först … 5 = senare.** Öppenhet styr nästan lika mycket som marknadsandel: self-serve OAuth/nyckel går att bygga utan att be om lov; partner-gated kräver leverantörsavtal.

---

## Nyckelinsikt · bygg per auth-kluster, inte per system

Fyra auth-relationer täcker en oproportionerligt stor del av alla fem kategorier. Bygg i den här ordningen och varje steg återanvänder förra stegets arbete:

1. **fastAPI / Fi2-standarden** (BIM Alliance, Sveriges Allmännytta) → en Fi2-koppling når **Fast2, Vitec, Momentum, Aareon Incit Xpand** (alla certifierade). Fast2 ensamt = 9 av 13 största allmännyttan. *Detta är kilen.*
2. **Fortnox OAuth** → bokföring **och** lön under ett OAuth (Fortnox + Fortnox Lön).
3. **Visma-ekosystemet** (en partnerrelation) → eEkonomi + Visma.net Financials + Visma Lön Smart + Planday + Agda PS + Kontek. Enormt spann på ett avtal.
4. **Microsoft Entra ID** (en app-registrering) → Dynamics 365 Business Central + Dynamics 365 Sales + Microsoft 365/SharePoint (Graph).

Lägg därtill de self-serve som står på egna ben: **Pigello, Bokio, HubSpot, Pipedrive, Upsales, Lime, Oneflow, Scrive**.

---

## Första vågen · bygg dessa först (tvärs kategorier)

| # | System | Kategori | Varför först |
|---|---|---|---|
| 1 | **Fast2 (fastAPI 1.0)** | Fastighet | Standarden. En koppling → Vitec/Momentum/Aareon. 9/13 största allmännyttan |
| 2 | **Momentum** | Fastighet | Bäst publika doc (REST + GraphQL), OAuth2, alla objekt, marquee-hyresvärdar |
| 3 | **Fortnox** | Ekonomi | 612k kunder, öppen OAuth2, full AP/AR/huvudbok |
| 4 | **Visma eEkonomi** | Ekonomi | Co-ledare SMB, öppen OAuth2 |
| 5 | **Pigello** | Fastighet | Lättast att bygga: öppet self-serve, RealEstateCore, MCP-native |
| 6 | **Oneflow + Scrive** | Dokument | Svenska, self-serve, BankID → hela hyreskontrakt-loopen |
| 7 | **Lime + Upsales** | CRM | Mest svensk-dominanta; Lime ~6 000 kunder, Upsales ~83% svenska |
| 8 | **Fortnox Lön + Visma Lön Smart** | Lön & HR | Self-serve sandboxes, svenska orsakskoder (sjuk/VAB/föräldra) |
| 9 | **Microsoft 365 (Graph)** | Dokument | Filsubstratet · där avtalen redan ligger |

Property + Ekonomi = rad 1-5 (beviset). Resten = räckvidden.

---

## Fastighet (property)

| System | API + doc | Auth | Öppen? | SE-reach | Rank |
|---|---|---|---|---|---|
| **Momentum** | "Fastighet Integrera" REST+GraphQL · docs.momentum.se/fastighet-api | OAuth2 | Öppna doc, gated onboarding | ~200 kunder (Riksbyggen, Castellum, MKB) | **1** |
| **Fast2** | fastAPI 1.0 `/boit/v1/api/` · fastapi.se | fastAPI-plattform | Standard öppen, access gated | 9/13 största allmännyttan | **1** |
| **Vitec** | Evo / fastAPI 1.0 / Realestate · vitec-fastighet.com/partners-integrationer | Per-API, mest gated | Partner-gated | Störst, 600+ kunder | **2** |
| **Pigello** | REST · docs.api.pigello.io | OAuth2/token | **Öppet self-serve + MCP** | Modern challenger | **2** |
| **Aareon / Incit Xpand** | Smart Platform · smartplatform.aareon.com | OAuth2 (Kong) | Partner (Smart Partner) | Aareon-grupp >8 000 EU | **3** |
| Hogia Fastighet | "öppna API:er" · hogia.se | unverified | Gated doc | Mid-market | **3** |
| Planima | Öppet API · planima.se | token (unverified) | Öppet | Underhållsnisch | **4** |
| Pythagoras | REST · pythagoras.se | unverified | Partner | FM/offentlig nisch | **4** |
| Sokigo/Tietoevry | GEOSECMA · sokigo.com | unverified | Offentlig upphandling | Kommunal GIS | **5** |

**Korrigering:** "Real Fastighetssystem" är **inte** en egen leverantör · "Realestate System API" är en Vitec-modul. Slå ihop med Vitec (ta bort `real` ur registret).
fastAPI-certifierade: **Vitec, Fast2, Momentum, Aareon Incit Xpand.**

## Ekonomi / ERP

| System | API + doc | Auth | Öppen? | SE-reach | Rank |
|---|---|---|---|---|---|
| **Fortnox** | REST · api.fortnox.se/apidocs | OAuth2 | Öppet self-serve | ~612k subs, ~60% SE moln-bokföring | **1** |
| **Visma eEkonomi/Spiris** | REST · developer.vismaonline.com | OAuth2 | Öppet (partnerprogram) | Hundratusentals SMB | **1** |
| **Bokio** | REST · docs.bokio.se | OAuth2 | **Öppet + gratis** (5k req/mån) | Stor mikro/små-bas | **2** |
| **Björn Lundén** | REST · developer.bjornlunden.se | OAuth2 client-cred | Öppet self-serve | Byrå-stark | **2** |
| **Visma.net Financials** | REST · integration.visma.net | OAuth2 (App Store-godk.) | Partner-gated | Mid-market ERP | **2** |
| **Dynamics 365 BC** | REST v2.0 · learn.microsoft.com | OAuth2 (Entra) | Öppet, Entra-onboarding | Mid-market (växer) | **2** |
| PE Accounting | REST · api-doc.accounting.pe | OAuth2+token | Öppet | Service-nisch | **3** |
| Monitor ERP | REST · api.monitor.se | API-licens (läs ingår) | Läs öppen f. kund | SE tillverkning #1 | **3** |
| Xledger | GraphQL · xledger.net/graphql | token (ej OAuth) | Per-tenant token | Mindre Nordic | **3** |
| Hogia (Star) | developer.hogia.se | unverified | Portal-gated | Stor (kommun/SMB) | **3** |
| Unit4 (Raindance) | ap.unit4.com/rest | Partner/IAM | Partner-gated | SE offentlig sektor | **4** |
| SAP / IFS / NetSuite | OData/REST | OAuth2/BTP/IAM | Enterprise-gated | Storföretag | **4-5** |

Reskontra/aging härleds ur fakturasaldon + förfallodatum (Fortnox/Visma).
**Unverified:** Wint, SpeedLedger, Mamut (inga publika API hittade).

## CRM / sälj

| System | API + doc | Auth | Öppen? | SE-reach | Rank |
|---|---|---|---|---|---|
| **Lime CRM** | Limeobject/Query REST · docs.lime-crm.com | API-nyckel (LISA) | Kund/partner-gated | Starkast Nordic, ~6 000 kunder | **1** |
| **Upsales** | REST · api-docs.upsales.com | API-nyckel | Self-serve | ~11,5% SE, ~83% kunder svenska | **1** |
| **HubSpot** | CRM v3 · developers.hubspot.com | OAuth2 + private-app | Öppet self-serve | ~22% SE (2:a) | **2** |
| **SuperOffice** | REST · docs.superoffice.com | OAuth2/OIDC | Gratis dev-signup | Nordic B2B mid-market | **2** |
| **Pipedrive** | API v2 · developers.pipedrive.com | OAuth2 + token | Öppet self-serve | Mid SE SMB | **2** |
| Dynamics 365 Sales | Dataverse OData · learn.microsoft.com | OAuth2 (Entra) | Öppet, tungt | SE enterprise/MS-stack | **3** |
| Lime Go | REST · lime-go.readme.io | API-nyckel | Self-serve | SE/Nordic prospektering | **3** |
| webCRM / Membrain | REST | JWT / API-nyckel | Self-serve | DK/SE SMB-nisch | **4** |
| Salesforce | REST · developer.salesforce.com | OAuth2 | Öppet, tungt | SE enterprise, ej SE-specifik | **5** |

**Bygg-not:** Lime har **per-install variabel datamodell** · introspekta via Limetype/metadata-API vid connect, hårdkoda inte fält. (HubSpot/Pipedrive/Upsales har fasta scheman.)
Vainu/Got-it = enrichment (read-only), inte CRM-mål.

## Lön & HR

| System | API + doc | Auth | Öppen? | SE-reach | Rank |
|---|---|---|---|---|---|
| **Fortnox Lön** | Salary API · developer.fortnox.se | OAuth2 | Self-serve (publish-review) | Mycket hög SMB | **1** |
| **Visma Lön Smart** | developer.vismaonline.com | OAuth2 | **Self-serve sandbox** | Störst SE lönefamilj | **1** |
| **Planday** (Visma) | openapi.planday.com | OAuth2 | Self-serve portal | Skift/retail | **2** |
| **Quinyx** | api.quinyx.com/v2/docs | OAuth2 client-cred | Partner-gated | WFM-ledare Nordic | **2** |
| **Hailey HR** | api.haileyhr.app/docs | API-nyckel (support) | Öppen REST, nyckel-gated | Snabbväxande HRIS | **2** |
| Hogia Lön Plus | developer.hogia.se | OAuth2 (portal) | Partner-gated | Stor (big-3 legacy) | **3** |
| Sympa | hub.sympa.com (PDF) | X-ApiKey + Secret | Kund-provisionerad | Nordic enterprise HRIS | **3** |
| Agda PS (Visma) | agdaps.se/losningar/api | per-endpoint | Partner | Etablerad SE lön | **3** |
| Flex HRM | WebApi/swagger | token (verify) | Partner-assisterad | SE tid+lön mid | **3** |
| Kontek (→Visma) | "öppet API" · kontek.se | unverified | Partner-gated | SE 50-1000 anst | **4** |
| Crona Lön | crona.se/cronaapi + **PAXml** | API + fil | Fil-centrerad | SE SMB lön | **4** |

PAXml (paxml.se) = svensk lönefilstandard · värd att stödja som generisk lön-in.

## Dokument & avtal

| System | API + doc | Auth | Öppen? | SE-reach | Rank |
|---|---|---|---|---|---|
| **Oneflow** 🇸🇪 | developer.oneflow.com | API-token, self-serve | Öppet | Mycket hög, allmännytta-traction | **1** |
| **Scrive** 🇸🇪 | apidocs.scrive.com + eID Hub | OAuth2 | Öppet self-serve | Mycket hög, BankID-incumbent | **1** |
| **Microsoft 365** (Graph) | learn.microsoft.com/graph | OAuth2 (Entra) | Öppet | Filsubstrat, mycket hög | **2** |
| **GetAccept** 🇸🇪 | getaccept.com/api | JWT/OAuth2 | Öppet (eID plan-gated) | Hög, sälj-led | **2** |
| **Assently** | docs.assently.com | OAuth2 (v3) | Öppet self-serve | SE/Nordic e-sign | **2** |
| Google Workspace | developers.google.com/drive | OAuth2 | Öppet | Lågt (SE = M365) | **3** |
| Penneo / Visma Addo / Verified | REST/OIDC | nyckel/OIDC | Öppet/gated | Moderat Nordic | **3** |
| DocuSign / Adobe Sign | REST · OAuth2 | OAuth2 | Öppet | Global, ej BankID-default | **4** |
| Kivra företag | developer.kivra.com | OAuth2 client-cred | Self-serve (legal onboarding) | Hög som **leveranskanal** (ej kontrakt) | **4** |

Alla svenska (Oneflow/Scrive/GetAccept/Assently) stödjer **Swedish BankID** · avgörande för hyreskontrakt.

---

## Legend
- **Öppen self-serve** = registrera app + bygg utan leverantörsavtal (OAuth2 eller API-nyckel).
- **Partner-gated** = kräver leverantörsavtal/credentials → assisterade vägen (matchar `assisted: true` i connector-registret).
- "unverified" = API hävdas men publika tekniska doc obekräftade per 2026-06-11.
