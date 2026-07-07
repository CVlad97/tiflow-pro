import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    navigate('/dashboard');
    return data;
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return { signIn, signUp, signOut };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function calculateProgress(raised: number, target: number): number {
  return Math.min(Math.round((raised / target) * 100), 100);
}

export function getTimeRemaining(deadline: string): string {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) return 'Terminé';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);

  if (months > 0) {
    const remainingDays = days % 30;
    return `${months} mois${remainingDays > 0 ? ` ${remainingDays}j` : ''}`;
  }
  return `${days} jours`;
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    fundraising: 'Collecte en cours',
    funded: 'Fonds récoltés',
    in_progress: 'En travaux',
    completed: 'Terminé',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    fundraising: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    funded: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    completed: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };
  return colors[status] || 'bg-slate-500/20 text-slate-400';
}

export function getRiskColor(risk: string): string {
  const colors: Record<string, string> = {
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-red-400',
  };
  return colors[risk] || 'text-slate-400';
}

export function getRiskLabel(risk: string): string {
  const labels: Record<string, string> = {
    low: 'Faible',
    medium: 'Modéré',
    high: 'Élevé',
  };
  return labels[risk] || risk;
}

export const CATEGORIES = [
  'Tous',
  'Logement social',
  'Commercial',
  'Écologique',
  'Étudiant',
  'Hôtellerie',
  'Énergie',
] as const;