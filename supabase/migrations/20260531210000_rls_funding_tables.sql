-- ============================================================================
-- Stage B: close the funding-table cross-project read leak
-- ----------------------------------------------------------------------------
-- BEFORE: funding_eligibility + funding_config had RLS OFF and anon had full
-- grants → any holder of the public anon key could read EVERY project's funding
-- scores. This migration enables RLS and scopes reads to project membership,
-- reusing the proven app_can_see_project(app_project_of_company()) pattern.
--
-- Read paths preserved:
--   * Browser (FundingFitPanel, OutcomePanel) reads funding_eligibility AS THE
--     SIGNED-IN USER → authenticated SELECT policy below covers it.
--   * Edge functions (funding-eligibility scorer, batch cron) use the
--     service_role key, which BYPASSES RLS → scoring/writes are unaffected.
--   * funding_config is read only by the edge fn (service_role); the frontend
--     hardcodes the display copy (CALC). So it is locked to service_role here.
--   * origin_scan_results + aws_discovery_candidates already have RLS on with no
--     public policy (locked to service_role; the discovery UI reads them via edge
--     functions). Left unchanged — already safe.
-- Reversible: `alter table ... disable row level security;` instantly restores
-- the prior behavior if anything regresses.
-- ============================================================================
begin;

-- 1. funding_eligibility — the actual leak. Enable RLS + project-scoped read.
alter table public.funding_eligibility enable row level security;

drop policy if exists funding_eligibility_read on public.funding_eligibility;
create policy funding_eligibility_read on public.funding_eligibility
  for select to authenticated
  using (app_is_admin() or app_can_see_project(app_project_of_company(company_id)));

-- (No INSERT/UPDATE policy: writes come exclusively from the edge fn via
--  service_role, which bypasses RLS. The browser never writes this table.)

-- 2. funding_config — scoring weights. Read only by the edge fn (service_role).
--    Enable RLS with no public policy → locked to service_role.
alter table public.funding_config enable row level security;

commit;
