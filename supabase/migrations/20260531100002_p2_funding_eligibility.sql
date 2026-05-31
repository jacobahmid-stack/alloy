-- P2 — funding-eligibility store + tunable config.
-- NOTE: company_id is TEXT — companies.id is text (e.g. '19e700817eepso49e'),
-- NOT bigint as the planning-doc sketch (Appendix A) had it. A bigint FK would fail.

-- Dollar heuristics are partner-blog ESTIMATES, stored as config (never hardcoded gates).
-- Authoritative numbers come from AWS post-handoff (Funding Recommendation agent).
create table if not exists funding_config (
  key        text primary key,
  value      jsonb not null,
  note       text,
  updated_at timestamptz not null default now()
);

insert into funding_config (key, value, note) values
  ('map_floor_usd',        '250000', 'Practical MAP floor (partner heuristic, ~$250K).'),
  ('migration_offset_pct', '25',     'Approx migration-cost offset % (heuristic).'),
  ('poc_cap_usd',          '25000',  'POC cap (~$25K or ~10% of ARR, heuristic).'),
  ('spend_bands',
     '{"<50k":[0,50000],"50-250k":[50000,250000],"250k-1m":[250000,1000000],"1m-10m":[1000000,10000000],">10m":[10000000,null]}',
     'Estimated annual AWS spend bands (USD).'),
  ('employee_band_map',
     '[[10,"<50k"],[50,"50-250k"],[250,"250k-1m"],[1000,"1m-10m"],[null,">10m"]]',
     'employees < threshold -> band (heuristic; null = catch-all top band).')
on conflict (key) do nothing;

create table if not exists funding_eligibility (
  company_id          text primary key references companies(id) on delete cascade,
  primary_track       text not null,
  secondary_tracks    text[] default '{}',
  fundability_score   int  not null,
  confidence          text not null,                 -- min(detection, rule)
  migration_source    text not null,                 -- onprem|colo|azure|gcp|other_cloud|aws|unknown
  est_spend_band      text,
  rationale           text[] default '{}',           -- evidence strings (AE trust layer)
  ace_draft           jsonb,                          -- pre-filled ACE opportunity fields
  needs_human_review  boolean default false,
  scored_at           timestamptz not null default now(),
  constraint funding_track_chk check (primary_track in
    ('MAP','MAP_MODERNIZE','POC','ISV_WMP','GREENFIELD_PGP','NONE')),
  constraint funding_conf_chk  check (confidence in ('high','med','low'))
);
create index if not exists funding_eligibility_track_idx on funding_eligibility(primary_track);
create index if not exists funding_eligibility_score_idx on funding_eligibility(fundability_score desc);
