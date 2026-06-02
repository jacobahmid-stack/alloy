-- FREE, deterministic ICP pre-qualification gate (no Claude / no paid API).
-- pick_icp_candidates feeds the icp-screen importer, and EVERY row it returns triggers a PAID
-- Claude firmographics call. So the cheapest place to qualify is HERE, in SQL, before a single
-- token is spent. Rejects are never returned (and never inserted), so a re-run re-evaluates them
-- for free; imported orgs are deduped via the anti-join exactly as before.
--
-- FREE rules (all from se_registry fields we already hold):
--   1. Industry   : sni_code in the caller's target set          (ICP fit)
--   2. Legal form : juridisk_form = '49' (Aktiebolag only)       (operating co, not forening/stiftelse/branch)
--   3. Real entity: has a city (postort)                         (data quality; lan is never populated)
--   4. Not junk   : name avoids holding/investment/property/management/dormant/shell patterns
--   5. New only   : not already in companies                     (dedupe)
-- LIMIT: employee SIZE is NOT free here — se_registry has no headcount (raw/status null) and
-- allabolag/proff block server fetches — so size is still confirmed by one Claude call per survivor.
CREATE OR REPLACE FUNCTION public.pick_icp_candidates(p_sni text[], p_digit text, p_limit integer)
 RETURNS TABLE(orgnr text, name text, city text, kommun text, lan text, sni_code text)
 LANGUAGE sql STABLE
AS $function$
  SELECT r.orgnr, r.name, r.postort, r.kommun, r.lan, r.sni_code
  FROM se_registry r
  WHERE r.sni_code = ANY(p_sni)
    AND (p_digit IS NULL OR right(r.orgnr,1) = p_digit)
    AND r.juridisk_form = '49'
    AND coalesce(r.postort,'') <> ''
    AND r.name !~* '(holding|invest|förvaltning|intressenter|fastighet|likvidation|konkurs|vilande|lagerbolag)'
    AND NOT EXISTS (SELECT 1 FROM companies c WHERE replace(c.orgnr,'-','') = r.orgnr)
  ORDER BY r.orgnr
  LIMIT p_limit
$function$;
