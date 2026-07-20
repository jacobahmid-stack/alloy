# AWS IAM cleanup — Forj account 701275662474 (2026-07-14)

Grounded in the IAM Users screenshot + live STS checks. **Jacob runs these** (I don't modify access controls). Doing this now doubles as **Well-Architected security-pillar remediation**, which pre-clears the FTR you need for the Marketplace/ISVA chain. Verify each "unused" claim in the console's *Last activity* / *Access Advisor* before deleting.

## The 9 users, classified

| User | Role | Verdict |
|---|---|---|
| `jacob-admin` | Admin, **Passkey MFA ✅**, used now | **Keep.** The one thing done right. |
| `alloy-pc-readonly` | Partner Central read — assumes `arn:aws:iam::497260983102:role/smith-integration` cross-account; active 7h ago (nightly co-sell cron) | **Keep.** Verified working (3 opps live). |
| `bedrockInvokeModel` | Smith's Bedrock inference (claude-proxy), 6h ago | **Keep.** |
| `claude-box-deploy` | Box deploy / SSM automation key, 25 min ago | **Keep** (in active use). |
| `alloy-bedrock-invoke` | Older Bedrock invoke, key 41d, **idle 28d** | **Retire** — looks superseded by `bedrockInvokeModel`. Confirm nothing references it, then deactivate its key (don't delete for 1 week), then delete. |
| `alloy-pricing` | Pricing/Marketplace-price reader, key 40d, **idle 39d** | **Retire** if the pricing-MCP path is parked. Deactivate key first. |
| `anders-novalo` | Console user (Novalo's Anders), **no MFA**, no access key, last sign-in 42d | **Decide:** the entity-separation call means a Novalo employee likely shouldn't have console access to *Forj's own* account. If the May handover is done → **remove**. If still needed → **enforce MFA**. Either way, no-MFA console access is the #1 WAFR flag. |
| `BedrockAPIKey-88z7` | **Never used**, no activity | **Delete.** Dangling. |
| `MantleApiKey-rvbvobiw` | **Never used**, no activity | **Delete.** Dangling. |

## Priority order (highest security value first)

1. **`anders-novalo`**: enforce MFA or remove access. (WAFR security pillar cares most about human console users without MFA.)
2. **Delete the two never-used API-key users** (`BedrockAPIKey-88z7`, `MantleApiKey-rvbvobiw`) — pure attack-surface reduction.
3. **Deactivate then delete the two idle Bedrock/pricing users** (`alloy-bedrock-invoke`, `alloy-pricing`) after confirming nothing uses them.
4. **Rotate the long-lived access keys** on the keepers (`bedrockInvokeModel`, `alloy-pc-readonly`, `claude-box-deploy`) — several are 40+ days old. Set a 90-day rotation reminder. (WAFR flags static long-lived keys; the modern pattern is roles/STS, but rotation is the pragmatic near-term step.)

## Console click-path (for the deletes/deactivations)

- **Deactivate a key** (reversible safety step before delete): IAM → Users → *user* → Security credentials → Access keys → *key* → **Actions → Deactivate**. Wait a few days; if nothing breaks, delete.
- **Delete a user**: IAM → Users → tick the box → **Delete** (type the username to confirm). Deletes keys + login profile with it.
- **Enforce MFA on `anders-novalo`**: IAM → Users → anders-novalo → Security credentials → **Assign MFA device** (or remove console access under *Console sign-in* if the handover is done).

## Note

None of this touches the working integrations — Smith's Bedrock (`bedrockInvokeModel`), the Partner Central read (`alloy-pc-readonly` → Novalo cross-account role), and box deploys (`claude-box-deploy`) are all keepers. Once done, you have a clean IAM story for the WAFR/FTR review and a tidy account to link for Activate Founders + APN.
