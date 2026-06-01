// forj-notify — relays a "Contact Forj" message from Smith's Contact tab to Slack + email.
// Browsers can't POST to Slack webhooks (CORS) or send mail, so this server-side relay does it.
// Config (Supabase secrets, all optional — each channel fires only if its secret is set):
//   FORJ_SLACK_WEBHOOK   Slack Incoming Webhook URL  -> posts the message to your channel
//   FORJ_RESEND_KEY      Resend API key              -> emails jacob.ahmid@gmail.com + jacob@forj.se
//   FORJ_MAIL_FROM       verified sender (Resend)    -> defaults to onboarding@resend.dev
// Returns { ok, channels:[...] } so the UI can show what was delivered (and fall back to mailto if none).
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (o: unknown, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { ...cors, "Content-Type": "application/json" } });
const MAILTO = ["jacob.ahmid@gmail.com", "jacob@forj.se"];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return J({ error: "POST only" }, 405);

  let b: any = {};
  try { b = await req.json(); } catch { return J({ error: "bad json" }, 400); }
  const from = String(b.from || "").slice(0, 200).trim();
  const message = String(b.message || "").slice(0, 4000).trim();
  const context = String(b.context || "").slice(0, 300).trim();
  if (!message) return J({ error: "message required" }, 400);

  const subject = `Alloy · Contact from ${from || "a rep"}${context ? " · " + context : ""}`;
  const channels: string[] = [];
  const errors: string[] = [];

  // 1) Slack
  const hook = Deno.env.get("FORJ_SLACK_WEBHOOK");
  if (hook) {
    try {
      const r = await fetch(hook, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `:speech_balloon: *Alloy contact*${from ? ` from *${from}*` : ""}${context ? ` _(${context})_` : ""}\n${message}` }),
      });
      if (r.ok) channels.push("slack"); else errors.push("slack " + r.status);
    } catch (e) { errors.push("slack " + String((e as Error).message || e).slice(0, 60)); }
  }

  // 2) Email via Resend (optional)
  const rk = Deno.env.get("FORJ_RESEND_KEY");
  if (rk) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { "Authorization": "Bearer " + rk, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: Deno.env.get("FORJ_MAIL_FROM") || "Alloy <onboarding@resend.dev>",
          to: MAILTO, reply_to: from && from.includes("@") ? from : undefined,
          subject, text: `${message}\n\n— sent from Smith · Contact${context ? " · " + context : ""}${from ? " · from " + from : ""}`,
        }),
      });
      if (r.ok) channels.push("email"); else errors.push("email " + r.status + " " + (await r.text()).slice(0, 120));
    } catch (e) { errors.push("email " + String((e as Error).message || e).slice(0, 60)); }
  }

  return J({ ok: channels.length > 0, channels, errors, mailto: MAILTO, subject });
});
