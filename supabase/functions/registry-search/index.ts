import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import postgres from "https://deno.land/x/postgresjs@v3.4.5/mod.js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function host(url?: string): string {
  if (!url) return "";
  let s = String(url).trim().toLowerCase();
  if (!s) return "";
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  s = s.split("/")[0].split("?")[0].split("#")[0];
  return s;
}

// Normalize a Swedish org number to 10 digits (strip dash, optional leading 16 prefix).
function normOrgnr(raw: string): string {
  const d = String(raw || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("16")) return d.slice(2);
  return d;
}

async function searchNorway(p: any) {
  const qs = new URLSearchParams();
  if (p.navn) qs.set("navn", String(p.navn));
  if (p.naeringskode) qs.set("naeringskode", String(p.naeringskode));
  if (p.kommunenummer) qs.set("kommunenummer", String(p.kommunenummer));
  if (p.orgform) qs.set("organisasjonsform", String(p.orgform));
  if (p.minAnsatte !== undefined && p.minAnsatte !== null && p.minAnsatte !== "") qs.set("fraAntallAnsatte", String(p.minAnsatte));
  if (p.maxAnsatte !== undefined && p.maxAnsatte !== null && p.maxAnsatte !== "") qs.set("tilAntallAnsatte", String(p.maxAnsatte));
  qs.set("size", String(Math.min(Number(p.size) || 50, 100)));
  qs.set("page", String(Number(p.page) || 0));
  const url = "https://data.brreg.no/enhetsregisteret/api/enheter?" + qs.toString();
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) { const t = await r.text(); throw new Error("Bronnoysund " + r.status + ": " + t.slice(0, 200)); }
  const data = await r.json();
  const arr = (data && data._embedded && data._embedded.enheter) || [];
  const results = arr.filter((e: any) => !(e && e.konkurs)).map((e: any) => ({
    name: (e && e.navn) || "",
    orgnr: (e && e.organisasjonsnummer) || "",
    domain: host(e && e.hjemmeside),
    industry: (e && e.naeringskode1 && e.naeringskode1.beskrivelse) || "",
    industry_code: (e && e.naeringskode1 && e.naeringskode1.kode) || "",
    employees: (e && typeof e.antallAnsatte === "number") ? e.antallAnsatte : null,
    city: (e && e.forretningsadresse && e.forretningsadresse.poststed) || "",
    county: (e && e.forretningsadresse && e.forretningsadresse.kommune) || "",
    country: "Norge",
    company_type: (e && e.organisasjonsform && e.organisasjonsform.beskrivelse) || "",
    source: "Bronnoysund",
  }));
  const page = (data && data.page) || {};
  return { results, total: page.totalElements != null ? page.totalElements : results.length, page: page.number != null ? page.number : 0, totalPages: page.totalPages != null ? page.totalPages : 1 };
}

function mapSeRow(e: any) {
  return {
    name: e.name || "",
    orgnr: e.orgnr || e.peorgnr || "",
    domain: "",
    industry: e.sni_text || "",
    industry_code: e.sni_code || "",
    employees: null,
    city: e.postort || "",
    county: e.kommun || e.lan || "",
    country: "Sverige",
    company_type: e.juridisk_form || "",
    source: "SCB",
  };
}

async function searchSweden(p: any) {
  const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 1 });
  try {
    // Org-number lookup mode: paste an orgnr -> exact match (used by the dashboard search bar).
    const orgnr = normOrgnr(p.orgnr || (/^[\d\s-]+$/.test(String(p.navn || "")) ? p.navn : ""));
    if (orgnr && orgnr.length >= 6) {
      const rows = await sql`
        select peorgnr, orgnr, name, sni_code, sni_text, postort, kommun, lan, juridisk_form
        from public.se_registry
        where orgnr = ${orgnr} or peorgnr = ${orgnr} or peorgnr = ${"16" + orgnr}
        limit 5`;
      const results = rows.map(mapSeRow);
      return { results, total: results.length, page: 0, totalPages: 1, mode: "orgnr", orgnr };
    }

    const size = Math.min(Number(p.size) || 50, 100);
    const page = Math.max(0, Number(p.page) || 0);
    const offset = page * size;
    const navn = (p.navn || "").trim();
    const sni = (p.naeringskode || "").trim();
    const ort = (p.kommunenummer || p.ort || "").trim();
    const lan = (p.lan || "").trim();

    const conds: any[] = [];
    if (navn) conds.push(sql`name ilike ${"%" + navn + "%"}`);
    if (sni) conds.push(sql`sni_code like ${sni + "%"}`);
    if (ort) conds.push(sql`(lower(postort) = ${ort.toLowerCase()} or lower(kommun) = ${ort.toLowerCase()})`);
    if (lan) conds.push(sql`lower(lan) like ${"%" + lan.toLowerCase() + "%"}`);
    let where = sql``;
    for (let i = 0; i < conds.length; i++) where = i === 0 ? sql`where ${conds[i]}` : sql`${where} and ${conds[i]}`;

    const rows = await sql`select peorgnr, orgnr, name, sni_code, sni_text, postort, kommun, lan, juridisk_form from public.se_registry ${where} order by name asc limit ${size} offset ${offset}`;
    const cnt = await sql`select count(*)::bigint as n from public.se_registry ${where}`;
    const total = Number(cnt[0]?.n || 0);
    const results = rows.map(mapSeRow);
    return { results, total, page, totalPages: Math.max(1, Math.ceil(total / size)) };
  } finally {
    try { await sql.end({ timeout: 5 }); } catch (_) {}
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const country = String(body.country || "NO").toUpperCase();
    let out;
    if (country === "NO") out = await searchNorway(body);
    else if (country === "SE") out = await searchSweden(body);
    else throw new Error("No free live search for " + country + " yet.");
    return new Response(JSON.stringify(out), { headers: { ...CORS, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e && (e as any).message) || e), results: [] }), { status: 200, headers: { ...CORS, "Content-Type": "application/json" } });
  }
});
