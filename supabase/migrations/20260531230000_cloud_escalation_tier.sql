-- ============================================================================
-- Cloud-detection escalation ladder (tier 2)
-- ----------------------------------------------------------------------------
-- THE LADDER:
--   Tier 1 = aws-detect (fast: apex DNS + AWS/GCP IP-ranges) on the */5 cron
--            `cloudcheck-batch`. Sweeps everything; catches the easy majority.
--   Tier 2 = cloud-detect (deep: CT-log subdomains + ASN-over-DoH ownership) on a
--            NEW */5 cron `cloud-escalate-batch` (offset 2 min). Retries ONLY the
--            residue tier 1 couldn't resolve (cloud 'other'/'unknown'/'cloudflare')
--            and that hasn't been deep-scanned yet.
--
-- Why two tools: cloud-detect is far more accurate on CDN-fronted / vanity-DNS sites
-- (it inspects subdomains + IP ownership, not just the apex's published-range match),
-- but it's ~10-30x slower and can't batch — so it can't be the always-on sweep.
-- Pairing them = fast coverage + deep accuracy, self-healing, $0 (DNS/ASN only).
--
-- Idempotency: cloud_escalation_apply ALWAYS stamps enrichment.cloud_deep_at, even
-- when no upgrade is found — so a genuinely hidden origin is deep-scanned once then
-- skipped. The cron converges instead of looping. normalize_company_cloud trigger
-- keeps aws_detected in sync with cloud_provider.
--
-- The matching batch handler lives in supabase/functions/cloud-detect/index.ts
-- ({ run_batch:true, limit?, dry_run? }). Deployed alongside this migration.
-- ============================================================================

-- candidates = active, real domain, cloud still unverified, not yet deep-scanned
create or replace function public.cloud_escalation_candidates(p_limit int default 3)
returns table(id text, domain text)
language sql security definer set search_path to 'public' as $$
  select id, domain from companies
  where domain is not null and domain like '%.%'
    and coalesce(nullif(cloud_provider,''),'') in ('other','unknown','cloudflare')
    and coalesce(list_tag,'') <> 'archived_shell'
    and coalesce(stage,'') <> 'archived'
    and not (coalesce(enrichment,'{}'::jsonb) ? 'cloud_deep_at')
  order by updated_at asc nulls first
  limit greatest(1, least(p_limit, 8));
$$;

-- apply one deep-scan result: upgrade cloud only on a real compute cloud; ALWAYS stamp.
create or replace function public.cloud_escalation_apply(p_id text, p_provider text, p_confidence text default '')
returns void language sql security definer set search_path to 'public' as $$
  update companies set
    cloud_provider = case when p_provider in ('aws','azure','gcp') then p_provider else cloud_provider end,
    enrichment = coalesce(enrichment,'{}'::jsonb)
      || jsonb_build_object('cloud_deep_at', now()::text,
                            'cloud_deep_provider', p_provider,
                            'cloud_deep_confidence', p_confidence)
  where id = p_id;
$$;

-- Tier-2 cron: every 5 min (offset +2 from tier 1), deep-scan a tiny slice (3).
do $$ begin perform cron.unschedule('cloud-escalate-batch'); exception when others then null; end $$;
select cron.schedule(
  'cloud-escalate-batch', '2-57/5 * * * *',
  $cron$
  select net.http_post(
    url := 'https://nvjizahtcqgmfhiodtej.supabase.co/functions/v1/cloud-detect',
    body := jsonb_build_object('run_batch', true, 'limit', 3),
    headers := jsonb_build_object('Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA'),
    timeout_milliseconds := 170000);
  $cron$
);
