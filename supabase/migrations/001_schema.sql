-- ============================================================
-- TiFlow Pro - Schema Supabase Complet
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. PROJECTS
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  target_amount NUMERIC(12,2) NOT NULL CHECK (target_amount > 0),
  raised_amount NUMERIC(12,2) DEFAULT 0 CHECK (raised_amount >= 0),
  min_investment NUMERIC(10,2) NOT NULL CHECK (min_investment >= 100),
  expected_return NUMERIC(5,2) NOT NULL,
  duration_months INTEGER NOT NULL CHECK (duration_months > 0),
  status TEXT NOT NULL DEFAULT 'fundraising' CHECK (status IN ('fundraising', 'funded', 'in_progress', 'completed')),
  risk_level TEXT NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  documents_url TEXT[] DEFAULT '{}',
  highlights TEXT[] DEFAULT '{}',
  deadline TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 3. INVESTMENTS
CREATE TABLE IF NOT EXISTS public.investments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 100),
  shares INTEGER NOT NULL CHECK (shares >= 1),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- 4. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'investment', 'return', 'dividend')),
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 5. PORTFOLIO SNAPSHOTS (optionnel, pour historique)
CREATE TABLE IF NOT EXISTS public.portfolio_snapshots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  total_invested NUMERIC(12,2) DEFAULT 0,
  current_value NUMERIC(12,2) DEFAULT 0,
  total_returns NUMERIC(12,2) DEFAULT 0,
  snapshot_date DATE DEFAULT CURRENT_DATE
);

ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Profiles: users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects: public read, admin write
CREATE POLICY "Anyone can read projects"
  ON public.projects FOR SELECT
  USING (true);

-- Investments: users can read own, admins can read all
CREATE POLICY "Users can read own investments"
  ON public.investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
  ON public.investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Transactions: users can read own
CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

-- Portfolio snapshots
CREATE POLICY "Users can read own snapshots"
  ON public.portfolio_snapshots FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON public.investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_project_id ON public.investments(project_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);

-- ============================================================
-- SEED DATA: Exemple de projets
-- ============================================================
INSERT INTO public.projects (title, subtitle, description, location, category, image_url, target_amount, min_investment, expected_return, duration_months, status, risk_level, highlights, deadline)
VALUES
  ('Résidence Les Alizés', 'Logements sociaux et intermédiaires', 'Construction de 24 logements sociaux BBC à Fort-de-France avec panneaux solaires.', 'Fort-de-France, Martinique', 'Logement social', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 2800000, 1000, 6.5, 36, 'fundraising', 'medium', ARRAY['24 logements BBC', 'Panneaux solaires', 'Mixité sociale'], '2025-12-31T00:00:00Z'),
  ('Village Créole - Boutiques', 'Pôle commercial artisanal', 'Aménagement de 12 boutiques artisanales et coworking au Lamentin.', 'Le Lamentin, Martinique', 'Commercial', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800', 1500000, 500, 8.0, 24, 'fundraising', 'medium', ARRAY['12 boutiques', 'Coworking', 'Parking 60 places'], '2025-11-30T00:00:00Z'),
  ('Parc Solaire du Nord', 'Centrale photovoltaïque citoyenne', 'Centrale solaire de 2 MWc sur friches agricoles à Basse-Pointe. Modèle coopératif.', 'Basse-Pointe, Martinique', 'Énergie', 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800', 2200000, 1000, 6.0, 18, 'fundraising', 'low', ARRAY['Centrale 2 MWc', 'Contrat EDF 20 ans', 'Coopératif'], '2025-12-15T00:00:00Z'),
  ('Résidence Les Flamboyants', 'Logements seniors', '18 logements adaptés aux seniors avec services partagés à Trinité.', 'La Trinité, Martinique', 'Logement social', 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800', 2100000, 500, 5.5, 30, 'funded', 'low', ARRAY['18 logements seniors', 'Services partagés', 'Habitat inclusif'], '2025-12-31T00:00:00Z')
ON CONFLICT DO NOTHING;