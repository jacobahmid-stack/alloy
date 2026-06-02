-- FREE nightly prospect feeder — pure SQL, no Claude, no paid API. Runs server-side via pg_cron
-- every night, independent of any laptop/agent session, so the top of funnel keeps filling for $0.
-- Walks se_registry (lowest unimported orgnr first) and inserts the next batch of FREE-gate-qualified
-- prospects (see icp_free_prequalify_gate). Carries only what's free: name, org-nr, industry (SNI
-- division label), city, AB form. No size/domain (those cost money) — leads are tagged 'nightly-free'
-- for triage / on-demand enrich. Idempotent via the anti-join, so each night advances further.

-- Readable industry label by SNI division (standard public taxonomy; 5-digit text is NOT guessed).
CREATE OR REPLACE FUNCTION public.sni_label(p_code text)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE left(coalesce(p_code,''),2)
    WHEN '62' THEN 'Dataprogrammering / IT'
    WHEN '58' THEN 'Programvaru- & spelutgivning'
    WHEN '63' THEN 'Databehandling & hosting'
    WHEN '25' THEN 'Metallvarutillverkning'
    WHEN '28' THEN 'Maskintillverkning'
    WHEN '46' THEN 'Partihandel'
    ELSE 'Övrigt'
  END || ' (SNI ' || coalesce(nullif(p_code,''),'?') || ')'
$$;

CREATE OR REPLACE FUNCTION public.feed_free_prospects(p_limit int DEFAULT 80)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_each int := greatest(p_limit / 2, 1);
  v_total int := 0;
  v_n int;
BEGIN
  -- Novalo software ICP
  WITH ins AS (
    INSERT INTO companies (id, name, orgnr, project_id, source, country, city, industry, stage, list_tag, enrichment)
    SELECT 'se-' || r.orgnr, r.name,
           CASE WHEN length(r.orgnr) = 10 THEN left(r.orgnr,6) || '-' || right(r.orgnr,4) ELSE r.orgnr END,
           'novalo', 'Bolagsverket/SCB (free nightly feed)', 'SE', r.postort,
           public.sni_label(r.sni_code), 'lead', 'nightly-free',
           jsonb_build_object('screened','free-gate','fed_free',true,'needs','domain+size')
    FROM se_registry r
    WHERE r.sni_code = ANY (ARRAY['62100','58290','63100','58210'])
      AND r.juridisk_form = '49' AND coalesce(r.postort,'') <> ''
      AND r.name !~* '(holding|invest|förvaltning|intressenter|fastighet|likvidation|konkurs|vilande|lagerbolag)'
      AND NOT EXISTS (SELECT 1 FROM companies c WHERE replace(c.orgnr,'-','') = r.orgnr)
    ORDER BY r.orgnr LIMIT v_each ON CONFLICT (id) DO NOTHING RETURNING 1
  ) SELECT count(*) INTO v_n FROM ins;
  v_total := v_total + v_n;

  -- Alto mid-market ICP (manufacturing + wholesale)
  WITH ins AS (
    INSERT INTO companies (id, name, orgnr, project_id, source, country, city, industry, stage, list_tag, enrichment)
    SELECT 'se-' || r.orgnr, r.name,
           CASE WHEN length(r.orgnr) = 10 THEN left(r.orgnr,6) || '-' || right(r.orgnr,4) ELSE r.orgnr END,
           'alto', 'Bolagsverket/SCB (free nightly feed)', 'SE', r.postort,
           public.sni_label(r.sni_code), 'lead', 'nightly-free',
           jsonb_build_object('screened','free-gate','fed_free',true,'needs','domain+size')
    FROM se_registry r
    WHERE r.sni_code = ANY (ARRAY['25530','25110','25510','25999','28990','46649','46420','46499'])
      AND r.juridisk_form = '49' AND coalesce(r.postort,'') <> ''
      AND r.name !~* '(holding|invest|förvaltning|intressenter|fastighet|likvidation|konkurs|vilande|lagerbolag)'
      AND NOT EXISTS (SELECT 1 FROM companies c WHERE replace(c.orgnr,'-','') = r.orgnr)
    ORDER BY r.orgnr LIMIT v_each ON CONFLICT (id) DO NOTHING RETURNING 1
  ) SELECT count(*) INTO v_n FROM ins;
  v_total := v_total + v_n;

  RETURN v_total;
END;
$$;

-- Nightly schedule (01:00 UTC ~= 02:00-03:00 Europe/Stockholm). Re-running by the same job name
-- updates the existing schedule. Adjust the 80 to feed more/fewer per night.
SELECT cron.schedule('feed-free-prospects-nightly', '0 1 * * *', $$select public.feed_free_prospects(80)$$);
