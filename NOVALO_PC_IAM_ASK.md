# Novalo · pc-mcp IAM — det 15-minuters-ärende Anders behöver göra

**Vad detta låser upp:** idag LÄSER Alloy Novalos Partner Central (nattlig co-sell-synk, read-only).
Med den här nyckeln kan Smith dessutom förbereda ACE-ärenden och UTKAST till funding-ansökningar
direkt i Partner Central-flödet. Fortfarande: ingen submit utan människa — policyn nedan saknar
medvetet Submit-rättigheten.

**Var:** Novalos AWS-konto (497260983102), IAM-konsolen. Rail A-principen: varje partners
Partner Central-koppling bor på partnerns eget konto.

## Klickväg för Anders (~15 min)

1. AWS Console → **IAM → Users → Create user**. Namn: `alloy-pc-mcp` (ingen konsolåtkomst).
2. **Attach policies directly → Create policy → JSON** — klistra in policyn nedan → namnge
   `alloy-pc-mcp-least-priv` → koppla till användaren.
3. Användaren → **Security credentials → Create access key** (typ: Application running outside AWS).
4. Lämna över nyckeln säkert (ALDRIG i mejl/chat i klartext): lägg Access key ID + Secret i ett
   1Password/Bitwarden-delat valv till Jacob, eller ring och läs upp. Jacob lägger dem som
   Supabase edge-secrets (`PC_MCP_AWS_*`) och pingar Claude för deploy-verifiering.
5. Klart. Ingenting mer körs på Novalos sida.

## Policyn (kopiera exakt; `_comment`/`_note`-fälten kan strykas, AWS ignorerar dem inte — ta bort dem före Create policy)

Se den underhållna källan: `alloy-page/supabase/functions/pc-mcp/IAM_POLICY.json`
(verifierad mot AWS Partner Central Getting Started Guide 2026, agent-prerequisites).
Ren version utan kommentarfält:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "MCPSession", "Effect": "Allow",
      "Action": ["partnercentral:UseSession"], "Resource": "*",
      "Condition": { "StringEquals": { "partnercentral:Catalog": ["AWS", "Sandbox"] } } },
    { "Sid": "OpportunityRead", "Effect": "Allow",
      "Action": ["partnercentral:Get*", "partnercentral:List*"], "Resource": "*" },
    { "Sid": "FundingBenefits", "Effect": "Allow",
      "Action": ["partnercentral:CreateBenefitApplication",
                  "partnercentral:UpdateBenefitApplication",
                  "partnercentral:AssociateBenefitApplicationResource",
                  "partnercentral:DisassociateBenefitApplicationResource"],
      "Resource": "*" },
    { "Sid": "MarketplaceRead", "Effect": "Allow",
      "Action": ["aws-marketplace:DescribeEntity", "aws-marketplace:SearchAgreements"],
      "Resource": "*" }
  ]
}
```

## Mejlutkast till Anders (Jacob skickar, redigera fritt)

> Ämne: 15 min i IAM — sista biten för co-sell-flödet
>
> Hej Anders,
>
> Alloy läser redan er Partner Central varje natt (det är därifrån co-sell-panelen hämtas).
> Nästa steg är att Smith ska kunna förbereda ACE-ärenden och utkast till funding-ansökningar
> åt er — fortfarande alltid en människa som godkänner och skickar in.
>
> Det kräver en dedikerad IAM-användare på ert AWS-konto med en minimal policy (ingen
> submit-rättighet, ingen åtkomst utanför Partner Central). Jag har klickväg + färdig policy,
> tar ca 15 minuter. Vill du göra det själv efter instruktionen, eller tar vi det på en
> skärmdelning?
>
> /Jacob

**Status:** paketet är klart att skicka. Blockerat på: Jacob skickar mejlet, Anders klickar,
nyckeln överlämnas säkert. Sedan verifierar Claude pc-mcp mot Sandbox-katalogen före AWS-katalogen.
