-- ============================================================================
-- Governance: app_is_admin() = PLATFORM OPERATOR only (Jacob), not "sees all"
-- ----------------------------------------------------------------------------
-- Today anders@novalo.se + andrej@novalo.se are in app_admins, so app_is_admin()
-- is true for them and they bypass every project boundary. That is fine while all
-- data belongs to the Forj tenant, but it is exactly the breach that occurs once
-- Alto (or any partner) becomes its own tenant: a Novalo person must not be a
-- superuser over another tenant's pipeline.
--
-- This migration removes the two external users from app_admins, leaving Jacob as
-- the sole platform operator. Their DATA access is preserved via project_members
-- (both are 'admin' on alto + novalo), and their Forj tenant membership stands.
-- So nothing they can see today disappears — only the platform-superuser bypass.
--
-- Verified blast radius (pg_policies):
--   * Every DATA table (companies, contacts, activities, funding_eligibility,
--     lead_outcomes, fundings, company_signals) is `app_is_admin() OR
--     app_can_see_project(...)` → membership keeps their access.
--   * Admin-only surfaces they lose = platform management they should NOT have:
--     project_invites, project_members write, tenants/tenant_members write,
--     se_ingest_state, alloy_backup_*. (Self-read of their own membership still
--     works via the user_id = auth.uid() path.)
--
-- Reversible: re-insert the two user_ids into app_admins to restore.
-- ============================================================================
begin;

delete from public.app_admins
where user_id in (
  select id from auth.users where email in ('anders@novalo.se','andrej@novalo.se')
);

commit;
