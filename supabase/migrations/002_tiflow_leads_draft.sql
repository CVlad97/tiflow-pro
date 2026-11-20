-- TiFlow beta: optional, non-financial lead intake; use only in a dedicated TiFlow Supabase project.
-- Do NOT deploy this migration to DELIKREOL, IKABAY or ANBAYBOT.
CREATE TABLE IF NOT EXISTS public.tiflow_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile text NOT NULL CHECK (profile IN ('porteur','partenaire','institution','autre')),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 1200),
  consent boolean NOT NULL CHECK (consent IS TRUE),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tiflow_leads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.tiflow_leads FROM anon, authenticated;
GRANT SELECT, INSERT, DELETE ON TABLE public.tiflow_leads TO authenticated;
DROP POLICY IF EXISTS "tiflow_leads_select_own" ON public.tiflow_leads;
CREATE POLICY "tiflow_leads_select_own" ON public.tiflow_leads FOR SELECT TO authenticated
USING ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "tiflow_leads_insert_own" ON public.tiflow_leads;
CREATE POLICY "tiflow_leads_insert_own" ON public.tiflow_leads FOR INSERT TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id AND consent IS TRUE);
DROP POLICY IF EXISTS "tiflow_leads_delete_own" ON public.tiflow_leads;
CREATE POLICY "tiflow_leads_delete_own" ON public.tiflow_leads FOR DELETE TO authenticated
USING ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS tiflow_leads_user_date_idx ON public.tiflow_leads (user_id, created_at DESC);
