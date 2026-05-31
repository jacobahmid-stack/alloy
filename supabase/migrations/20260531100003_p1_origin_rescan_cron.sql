-- P1 — scheduled re-run of aws-origin-detect => longitudinal cloud-migration data.
-- REPORT-ONLY by default (apply:false): appends to origin_scan_results, never mutates
-- companies. Fires async via pg_net in <=20-domain slices to stay under the edge
-- function time limit. Requires pg_cron + pg_net (both installed).

create or replace function schedule_origin_rescan(p_apply boolean default false, p_slice int default 20)
returns int
language plpgsql
security definer
as $$
declare
  v_total int;
  v_off   int := 0;
  v_fired int := 0;
  v_url   text := 'https://nvjizahtcqgmfhiodtej.supabase.co/functions/v1/aws-origin-detect';
  -- anon JWT is public (ships to browsers); embedding is safe. The gateway (verify_jwt)
  -- just needs a structurally-valid Supabase JWT; the function itself runs as service-role.
  v_jwt   text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52aml6YWh0Y3FnbWZoaW9kdGVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5ODk0NDMsImV4cCI6MjA5NTU2NTQ0M30.G0gf0z0wg9RQqsyZcEBXPYJ1YVeTe_NOULtDAEI2xEA';
begin
  select count(*) into v_total
  from companies
  where cloud_provider = 'cloudflare'
    and (list_tag is null or list_tag <> 'archived_shell')
    and domain is not null;

  while v_off < v_total loop
    perform net.http_post(
      url     := v_url,
      headers := jsonb_build_object(
                   'Content-Type', 'application/json',
                   'Authorization', 'Bearer ' || v_jwt,
                   'apikey', v_jwt),
      body    := jsonb_build_object('limit', p_slice, 'offset', v_off, 'apply', p_apply),
      timeout_milliseconds := 120000
    );
    v_off   := v_off + p_slice;
    v_fired := v_fired + 1;
  end loop;

  return v_fired;  -- number of async slices fired
end
$$;

-- Weekly, Monday 03:00 UTC, report-only. (Registered separately via execute_sql so the
-- jobid surfaces; included here for completeness / git.)
-- do $$ begin perform cron.unschedule('origin-rescan-weekly'); exception when others then null; end $$;
-- select cron.schedule('origin-rescan-weekly', '0 3 * * 1', $cron$ select schedule_origin_rescan(false, 20); $cron$);
