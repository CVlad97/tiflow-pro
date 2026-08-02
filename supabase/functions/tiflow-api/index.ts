import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const path = url.searchParams.get("path") || ""

  if (path === "health") {
    return new Response(JSON.stringify({ status: "ok", service: "tiflow-api" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (path === "projects") {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    )
    const { data } = await supabase.from("projects").select("*").limit(20)
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  if (path === "investments") {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    )
    const { data } = await supabase.from("investments").select("*").limit(20)
    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ status: "ok", path, service: "tiflow-api" }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
})
