-- Global Claude spend ledger + cap. Every paid Claude call funnels through the claude-proxy edge
-- function, which checks this row BEFORE calling Anthropic (refuses once spent_usd >= cap_usd, so it
-- stops WITHOUT spending) and increments spent_usd AFTER each call with the real usage-based cost.
-- This caps ALL app-side Claude spend (Smith chat, aws-discovery, bulk-enrich, icp-screen,
-- domain-fill) at one number. Raise/reset:
--   update public.claude_budget set cap_usd = 150;     -- raise the ceiling
--   update public.claude_budget set spent_usd = 0, since = now();  -- reset the running total
create table if not exists public.claude_budget (
  id int primary key default 1,
  cap_usd numeric not null default 90,
  spent_usd numeric not null default 0,
  since timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint claude_budget_singleton check (id = 1)
);
insert into public.claude_budget (id, cap_usd, spent_usd) values (1, 90, 0)
  on conflict (id) do nothing;
alter table public.claude_budget enable row level security;
-- No policies: only the service role (claude-proxy) can read/write it.

-- Atomic increment so concurrent calls (discovery + crons + Smith) don't clobber the total.
create or replace function public.claude_budget_add(p_cost numeric)
returns numeric language sql as $$
  update public.claude_budget
     set spent_usd = spent_usd + greatest(coalesce(p_cost,0),0), updated_at = now()
   where id = 1
  returning spent_usd;
$$;
