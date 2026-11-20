export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  location: string;
  category: string;
  image_url: string;
  target_amount: number;
  raised_amount: number;
  min_investment: number;
  expected_return: number;
  duration_months: number;
  status: 'fundraising' | 'funded' | 'in_progress' | 'completed';
  risk_level: 'low' | 'medium' | 'high';
  documents_url: string[];
  highlights: string[];
  created_at: string;
  deadline: string;
}

export interface Investment {
  id: string;
  user_id: string;
  project_id: string;
  amount: number;
  shares: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  project?: Project;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'investment' | 'return' | 'dividend';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
}

export interface PortfolioSummary {
  total_invested: number;
  current_value: number;
  total_returns: number;
  total_dividends: number;
  active_projects: number;
  overall_return_percentage: number;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export type ProjectFilter = {
  category?: string;
  status?: string;
  minReturn?: number;
  maxRisk?: string;
  search?: string;
};