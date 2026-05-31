-- P1 — cloud-migration time-series (the moat).
-- Read-only views over the append-only origin_scan_results log. No writes; safe to
-- recreate. origin_scan_results.company_id is TEXT (companies.id is text).

-- Latest non-error scan per company. Also consumed by funding-eligibility.
create or replace view latest_origin_scan as
select distinct on (company_id)
  company_id, domain, verdict, confidence, services, assets,
  checked_hosts, ct_count, applied, scanned_at
from origin_scan_results
where verdict <> 'error'
order by company_id, scanned_at desc;

-- Per-company AWS-origin verdict over time, with the previous verdict inline.
-- (origin_scan_results tracks AWS-or-not behind Cloudflare over time — that is the
--  longitudinal signal we actually capture; companies.cloud_provider is current-state only.)
create or replace view cloud_state_history as
select
  o.company_id,
  c.name,
  o.domain,
  o.verdict,
  o.confidence,
  o.scanned_at,
  lag(o.verdict)    over w as prev_verdict,
  lag(o.scanned_at) over w as prev_scanned_at
from origin_scan_results o
left join companies c on c.id = o.company_id
where o.verdict <> 'error'
window w as (partition by o.company_id order by o.scanned_at)
order by o.company_id, o.scanned_at;

-- Companies whose AWS-origin verdict flipped between consecutive scans = the movers.
create or replace view movers as
with seq as (
  select
    company_id, domain, verdict, scanned_at,
    lag(verdict) over w as prev_verdict
  from origin_scan_results
  where verdict <> 'error'
  window w as (partition by company_id order by scanned_at)
)
select
  s.company_id,
  c.name,
  s.domain,
  s.prev_verdict,
  s.verdict as new_verdict,
  s.scanned_at as changed_at,
  case when s.prev_verdict = 'none' and s.verdict = 'aws'  then s.scanned_at end as became_aws_at,
  case when s.prev_verdict = 'aws'  and s.verdict = 'none' then s.scanned_at end as left_aws_at,
  true as provider_changed
from seq s
left join companies c on c.id = s.company_id
where s.prev_verdict is not null and s.prev_verdict <> s.verdict
order by s.scanned_at desc;
