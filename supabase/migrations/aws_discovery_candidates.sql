-- Staging / review queue for the AWS-discovery agent.
-- The agent NEVER writes companies directly — it writes candidates here,
-- you approve in the UI, and approval inserts into companies. RLS: service-role only
-- (same posture as origin_scan_results); the app reads/writes it via edge functions.

create table if not exists public.aws_discovery_candidates (
  id            uuid primary key default gen_random_uuid(),
  -- identity
  name          text not null,
  domain        text,                       -- bare, lowercased (dedup key)
  orgnr         text,
  city          text,
  county        text,
  country       text default 'SE',
  industry      text,
  employees     numeric,
  -- AWS evidence (from aws-origin-detect when a domain resolved, else model-asserted)
  aws_verdict     text,                     -- 'aws' | 'none' | 'unverified'
  aws_confidence  text,                     -- 'high' | 'medium' | 'low' | 'asserted'
  aws_services    text[] default '{}',
  aws_evidence    jsonb  default '[]'::jsonb,
  -- discovery provenance
  discovery_method   text,                  -- 'case_study' | 'job_ad' | 'web_search'
  discovery_evidence text,                  -- short why-on-AWS + why-Swedish, with a quote
  source_urls        text[] default '{}',
  -- review lifecycle
  status        text not null default 'pending',  -- pending | approved | rejected | imported
  dup_of        text,                        -- companies.id if it already exists
  imported_id   text,                        -- companies.id created on approval
  note          text,
  created_at    timestamptz default now(),
  reviewed_at   timestamptz
);

-- dedup helper: one live candidate per domain (case-insensitive); allows re-runs
create unique index if not exists aws_disc_domain_uq
  on public.aws_discovery_candidates (lower(domain))
  where domain is not null and status in ('pending','approved');

create index if not exists aws_disc_status_idx on public.aws_discovery_candidates (status, created_at desc);

alter table public.aws_discovery_candidates enable row level security;
-- no policies => only the service role (edge functions) can touch it.
