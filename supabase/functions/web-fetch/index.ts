// Server-side page fetcher for the research agent (fetch_page tool).
// Deploy: supabase functions deploy web-fetch  (verify_jwt = true, like aws-detect)
// Returns readable text only, capped at 8k chars, with SSRF blocking.
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
function json(o: unknown, status = 200): Response {
  return new Response(JSON.stringify(o), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "169.254.169.254") return true;
  if (/^(10|127)\./.test(h)) return true;
  if (/^192\.168\./.test(h)) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(h)) return true;
  return false;
}
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST only" }, 405);
  try {
    const body = await req.json();
    const url = body?.url;
    const mode = body?.mode === "tech" ? "tech" : "text";
    if (!url || !/^https?:\/\//i.test(url)) return json({ error: "valid http(s) url required" }, 400);
    let parsed: URL;
    try { parsed = new URL(url); } catch { return json({ error: "bad url" }, 400); }
    if (isBlockedHost(parsed.hostname)) return json({ error: "host not allowed" }, 400);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let res: Response;
    try {
      res = await fetch(parsed.toString(), {
        signal: ctrl.signal, redirect: "follow",
        headers: { "User-Agent": "AlloyBot/1.0 (+prospecting research)", "Accept": "text/html,application/xhtml+xml,*/*" },
      });
    } finally { clearTimeout(timer); }

    const ctype = res.headers.get("content-type") || "";
    const raw = await res.text();
    if (!/text|html|xml|json/i.test(ctype)) {
      return json({ url, status: res.status, title: "", text: "", note: "non-text content (" + ctype + ")" });
    }
    const title = (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();

    // mode:"tech" — return the FINGERPRINT SURFACE (scripts/hosts/headers/globals) instead
    // of stripped prose, so a tech analyzer can see window.posthog / cdn.segment.com etc.
    // Default mode keeps the readable-text behaviour the research agent relies on.
    if (mode === "tech") {
      const cap = 60; // bound each list
      const uniq = (a: string[]) => [...new Set(a.filter(Boolean))].slice(0, cap);
      const grab = (re: RegExp) => { const out: string[] = []; let m: RegExpExecArray | null; while ((m = re.exec(raw)) && out.length < cap * 2) out.push(m[1]); return out; };
      const hostOf = (u: string) => { try { return new URL(u, parsed!.toString()).host.toLowerCase(); } catch { return ""; } };

      const scriptSrcs = grab(/<script[^>]+src=["']([^"']+)["']/gi);
      const linkHrefs = grab(/<link[^>]+href=["']([^"']+)["']/gi);
      const iframeSrcs = grab(/<iframe[^>]+src=["']([^"']+)["']/gi);
      const scriptHosts = uniq(scriptSrcs.map(hostOf));
      const linkHosts = uniq(linkHrefs.map(hostOf));
      const iframeHosts = uniq(iframeSrcs.map(hostOf));

      // Known JS-global / inline-token fingerprints (presence only — not values).
      const GLOBALS: [string, RegExp][] = [
        ["window.analytics", /window\.analytics|cdn\.segment\.com/i],
        ["window.rudderanalytics", /rudderanalytics|cdn\.rudderlabs\.com/i],
        ["snowplow", /snowplowanalytics|\/tp2\b|sp\.js/i],
        ["window.amplitude", /\bamplitude\b|cdn\.amplitude\.com|api\.eu\.amplitude\.com/i],
        ["window.mixpanel", /\bmixpanel\b|cdn\.mxpnl\.com/i],
        ["window.heap", /\bheap\b|heapanalytics\.com/i],
        ["window.posthog", /posthog/i],
        ["gtag/GA4", /gtag\(|googletagmanager\.com|\/g\/collect/i],
        ["algolia", /algolia(net|search)?|\.algolia\.net/i],
        ["supabase", /supabase\.co|supabase-js/i],
        ["firebase", /firebaseio\.com|firebaseapp\.com|window\.firebase/i],
        ["vercel-ai-sdk", /x-vercel-ai-data-stream|@ai-sdk|ai\/react/i],
        ["copilotkit", /copilotkit/i],
        ["streamlit", /_stcore|class=["']stApp/i],
        ["gradio", /gradio_config|gradio-app/i],
        ["chainlit", /__chainlit/i],
        ["huggingface", /\.hf\.space|huggingface\.co/i],
        ["intercom", /widget\.intercom\.io|window\.Intercom/i],
        ["hubspot", /js\.hs-scripts\.com|hsforms/i],
      ];
      const head = raw.slice(0, 600000);
      const globals = GLOBALS.filter(([, re]) => re.test(head)).map(([n]) => n);
      const generator = (raw.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i)?.[1] || "").trim();
      const interestingHeaders: Record<string, string> = {};
      for (const h of ["server", "x-powered-by", "x-vercel-ai-data-stream", "x-amz-cf-id", "x-amz-request-id", "x-goog-generation", "x-vercel-id", "via", "x-shopify-stage", "x-drupal-cache", "x-generator"]) {
        const v = res.headers.get(h); if (v) interestingHeaders[h] = v.slice(0, 120);
      }
      return json({
        url, status: res.status, title, mode: "tech",
        generator, globals,
        script_hosts: scriptHosts, link_hosts: linkHosts, iframe_hosts: iframeHosts,
        headers: interestingHeaders,
      });
    }

    const text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
      .replace(/\s+/g, " ").trim().slice(0, 8000);
    return json({ url, status: res.status, title, text });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 200);
  }
});
