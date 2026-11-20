import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// Security: no payment, investment or portfolio endpoints in the beta.
// Public data here is explicitly fictional and cannot be mistaken for a live offering.
const origin = Deno.env.get("TIFLOW_ALLOWED_ORIGIN") ?? "https://cvlad97.github.io";
const enabled = Deno.env.get("TIFLOW_LEADS_ENABLED") === "true";
const examples = [
  { id: "atelier-partage", title: "Atelier partagé", category: "Commerce", fictional: true },
  { id: "coliving-pro", title: "Coliving professionnel", category: "Hébergement", fictional: true },
  { id: "hub-quartier", title: "Hub de quartier", category: "Logistique locale", fictional: true }
];
function json(data: unknown, status = 200, allowedOrigin?: string) {
  const headers: Record<string,string> = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Vary": "Origin",
  };
  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
    headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "authorization, content-type, apikey";
  }
  return new Response(JSON.stringify(data), { status, headers });
}
Deno.serve(async (request) => {
  const requestOrigin = request.headers.get("origin");
  const allowedOrigin = requestOrigin === origin ? origin : undefined;
  if (requestOrigin && !allowedOrigin) return json({ error: "origin_denied" }, 403);
  if (request.method === "OPTIONS") return new Response(null, {
    status: 204, headers: {
      "Access-Control-Allow-Origin": allowedOrigin ?? origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type, apikey",
      "Access-Control-Max-Age": "600",
      "Vary": "Origin",
    }
  });
  const pathname = new URL(request.url).searchParams.get("path") ?? "";
  if (pathname === "health" && request.method === "GET") return json({
    status: "ok", mode: "demo", service: "tiflow-api",
    leadsEnabled: enabled
  }, 200, allowedOrigin);
  if (pathname === "projects" && request.method === "GET") return json({
    data: examples, fictional: true, financialOffers: false
  }, 200, allowedOrigin);
  if (pathname === "leads" && request.method === "POST") {
    if (!enabled) return json({ error: "lead_capture_not_enabled" }, 503, allowedOrigin);
    const bearer = request.headers.get("authorization") ?? "";
    if (!/^Bearer\s+[^\s]+$/i.test(bearer)) return json({ error: "auth_required" }, 401, allowedOrigin);
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !anonKey) return json({ error: "service_unconfigured" }, 503, allowedOrigin);
    let body: unknown;
    try {
      if (Number(request.headers.get("content-length") ?? 0) > 4096) return json({ error: "payload_too_large" }, 413, allowedOrigin);
      const raw = await request.text();
      if (raw.length > 4096) return json({ error: "payload_too_large" }, 413, allowedOrigin);
      body = JSON.parse(raw);
    } catch { return json({ error: "invalid_json" }, 400, allowedOrigin); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ error: "invalid_payload" }, 400, allowedOrigin);
    const item = body as Record<string,unknown>;
    const profile = typeof item.profile === "string" ? item.profile.trim() : "";
    const message = typeof item.message === "string" ? item.message.trim() : "";
    if (!["porteur", "partenaire", "institution", "autre"].includes(profile) || message.length < 10 || message.length > 1200 || item.consent !== true) {
      return json({ error: "invalid_fields_or_consent" }, 422, allowedOrigin);
    }
    const token = bearer.replace(/^Bearer\s+/i, "");
    const client = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: "Bearer " + token } } });
    const { data: auth, error: authError } = await client.auth.getUser(token);
    if (authError || !auth.user) return json({ error: "invalid_session" }, 401, allowedOrigin);
    const { error } = await client.from("tiflow_leads").insert({
      user_id: auth.user.id, profile, message, consent: true
    });
    if (error) return json({ error: "submission_unavailable" }, 503, allowedOrigin);
    return json({ status: "received" }, 201, allowedOrigin);
  }
  return json({ error: "not_found" }, 404, allowedOrigin);
});
