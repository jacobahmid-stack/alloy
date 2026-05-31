-- ============================================================================
-- Strangler-fig multi-tenancy foundation + outcome capture (predicted vs actual)
-- ----------------------------------------------------------------------------
-- ADDITIVE ONLY. This migration:
--   * adds a tenant layer ABOVE the existing project scaffold (tenants,
--     tenant_members, projects.tenant_id) and backfills a single 'forj' tenant
--   * adds tenant-aware helper functions mirroring app_is_admin/app_can_see_project
--   * adds the lead_outcomes table (the moat: predicted-vs-actual funding result),
--     RLS-scoped via the SAME proven app_project_of_company() pattern as
--     company_signals, so it is tenant-safe by construction
--
-- It does NOT modify any existing table's RLS or policies. The live app behaves
-- identically (there is exactly one tenant today, so every tenant check is a
-- no-op for current users). Tightening RLS on the currently-unprotected funding
-- tables is a separate, individually-verified migration.
-- ============================================================================
begin;

-- 1. TENANTS -----------------------------------------------------------------
create table if not exists public.tenants (
  id          text primary key,                  -- slug id, e.g. 'forj'
  name        text not null,
  plan        text not null default 'internal',  -- internal | trial | paid
  country     text default 'SE',
  settings    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.tenant_members (
  tenant_id   text not null references public.tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'member',    -- owner | admin | member | stakeholder
  created_at  timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

alter table public.tenants        enable row level security;
alter table public.tenant_members enable row level security;

-- 2. PROJECTS gain a tenant --------------------------------------------------
alter table public.projects add column if not exists tenant_id text references public.tenants(id);

-- 3. BACKFILL: one tenant 'forj' owns everything that exists today ------------
insert into public.tenants (id, name, plan, country)
  values ('forj', 'Forj', 'internal', 'SE')
  on conflict (id) do nothing;

update public.projects set tenant_id = 'forj' where tenant_id is null;

-- every current account is a Forj user (only one tenant exists today);
-- the global admin becomes tenant owner, everyone else a member.
insert into public.tenant_members (tenant_id, user_id, role)
  select 'forj', u.id,
         case when exists (select 1 from public.app_admins a where a.user_id = u.id)
              then 'owner' else 'member' end
  from auth.users u
  on conflict (tenant_id, user_id) do nothing;

-- 4. TENANT HELPER FUNCTIONS (mirror app_is_admin / app_can_see_project) ------
create or replace function public.app_can_see_tenant(p_tenant text)
  returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists (
    select 1 from tenant_members m
    where m.tenant_id = p_tenant and m.user_id = auth.uid()
  ) or app_is_admin();
$$;

create or replace function public.app_tenant_of_project(p_project text)
  returns text language sql stable security definer set search_path to 'public' as $$
  select tenant_id from projects p where p.id = p_project limit 1;
$$;

create or replace function public.app_tenant_of_company(p_company text)
  returns text language sql stable security definer set search_path to 'public' as $$
  select p.tenant_id from companies c join projects p on p.id = c.project_id
  where c.id = p_company limit 1;
$$;

-- 5. RLS for the new tenant tables -------------------------------------------
drop policy if exists tenants_read on public.tenants;
create policy tenants_read on public.tenants for select to authenticated
  using (app_can_see_tenant(id));

drop policy if exists tenants_admin_write on public.tenants;
create policy tenants_admin_write on public.tenants for all to authenticated
  using (app_is_admin()) with check (app_is_admin());

drop policy if exists tenant_members_read on public.tenant_members;
create policy tenant_members_read on public.tenant_members for select to authenticated
  using (app_is_admin() or user_id = auth.uid() or app_can_see_tenant(tenant_id));

drop policy if exists tenant_members_admin_write on public.tenant_members;
create policy tenant_members_admin_write on public.tenant_members for all to authenticated
  using (app_is_admin()) with check (app_is_admin());

-- 6. LEAD OUTCOMES — the moat: predicted vs actual ---------------------------
-- One row per company, capturing the funding-engine PREDICTION (snapshot at the
-- moment of prediction) alongside what ACTUALLY happened. This delta is the only
-- data a competitor cannot buy or backfill, and it is what later turns the
-- deterministic scorer into a learning one.
create table if not exists public.lead_outcomes (
  id                   uuid primary key default gen_random_uuid(),
  company_id           text not null references public.companies(id) on delete cascade,
  tenant_id            text,           -- denormalized for cross-tenant learning; auto-maintained
  -- prediction snapshot (immutable record of what the engine said, when)
  predicted_track      text,
  predicted_score      integer,
  predicted_confidence text,
  predicted_at         timestamptz,
  -- what actually happened
  actual_track         text,
  actual_outcome       text check (actual_outcome in
                         ('pending','won','lost','stalled','disqualified','no_decision')),
  stage_reached        text,
  actual_value_sek     numeric,
  funding_submitted    boolean default false,
  funding_approved_usd numeric,
  lost_reason          text,
  notes                text,
  recorded_by          uuid references auth.users(id),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index  if not exists lead_outcomes_company_idx on public.lead_outcomes(company_id);
create index  if not exists lead_outcomes_tenant_idx  on public.lead_outcomes(tenant_id);
create unique index if not exists lead_outcomes_company_ux on public.lead_outcomes(company_id);

alter table public.lead_outcomes enable row level security;

-- Same project-scoped pattern as company_signals -> tenant-safe by construction.
drop policy if exists lead_outcomes_rw on public.lead_outcomes;
create policy lead_outcomes_rw on public.lead_outcomes for all to authenticated
  using      (app_is_admin() or app_can_see_project(app_project_of_company(company_id)))
  with check (app_is_admin() or app_can_see_project(app_project_of_company(company_id)));

-- Keep tenant_id correct + updated_at fresh automatically.
create or replace function public.lead_outcomes_set_tenant()
  returns trigger language plpgsql security definer set search_path to 'public' as $$
  begin
    if new.tenant_id is null then
      new.tenant_id := app_tenant_of_company(new.company_id);
    end if;
    new.updated_at := now();
    return new;
  end;
$$;

drop trigger if exists lead_outcomes_tenant_trg on public.lead_outcomes;
create trigger lead_outcomes_tenant_trg before insert or update on public.lead_outcomes
  for each row execute function public.lead_outcomes_set_tenant();

commit;
