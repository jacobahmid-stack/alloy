-- Scheduled jobs (pg_cron) running in the live Supabase project, captured for git/AWS parity.
-- These were created ad-hoc via the dashboard; this file is the source of truth going forward.
-- Requires extensions: pg_cron, pg_net. On AWS (Aurora/RDS) replace these with EventBridge
-- Scheduler -> Lambda (see HANDOVER-AWS.md §Migration). The anon JWT below is the PUBLIC
-- publishable key (safe to commit) used only to satisfy the function gateway; functions run
-- as service-role from their own env.

-- jobid 1 — BuiltWith enrichment batch (PAID API; capped at 30/run, credit-safe gate in fn)
-- every 5 min
select cron.schedule('builtwith-enrich-batch', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://nvjizahtcqgmfhiodtej.supabase.co/functions/v1/builtwith-lookup',
    body := jsonb_build_object('run_batch', true, 'limit', 30),
    headers := jsonb_build_object('Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA'),
    timeout_milliseconds := 150000);
$job$);

-- jobid 2 — Cloud-check batch (FREE DNS/IP heuristics; 40/run)
-- every 5 min
select cron.schedule('cloudcheck-batch', '*/5 * * * *', $job$
  select net.http_post(
    url := 'https://nvjizahtcqgmfhiodtej.supabase.co/functions/v1/aws-detect',
    body := jsonb_build_object('run_batch', true, 'limit', 40),
    headers := jsonb_build_object('Content-Type','application/json',
      'Authorization','Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA'),
    timeout_milliseconds := 150000);
$job$);

-- jobid 3 — AWS discovery agent, daily 06:13 UTC (calls a SECURITY DEFINER wrapper fn)
select cron.schedule('aws-discovery-morning', '13 6 * * *', $job$ select public.run_aws_discovery_daily(); $job$);

-- jobid 4 — Origin re-scan -> cloud-migration time-series, weekly Mon 03:00 UTC (report-only)
select cron.schedule('origin-rescan-weekly', '0 3 * * 1', $job$ select schedule_origin_rescan(false, 20); $job$);

-- NOTE: builtwith-enrich-batch + cloudcheck-batch run continuously every 5 min. If you are
-- pausing enrichment (e.g. to control BuiltWith spend), unschedule jobid 1:
--   select cron.unschedule('builtwith-enrich-batch');
