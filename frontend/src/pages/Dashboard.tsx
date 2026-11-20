import { useAuth } from '@/hooks/useAuth';
import { MOCK_INVESTMENTS, MOCK_TRANSACTIONS, PROJECTS_DATA } from '@/lib/mockData';
import { formatCurrency, formatPercentage, formatDate, calculateProgress, getStatusLabel, getStatusColor } from '@/lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();

  // Portfolio summary
  const confirmedInvestments = MOCK_INVESTMENTS.filter((inv) => inv.status === 'confirmed');
  const totalInvested = confirmedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalReturns = MOCK_TRANSACTIONS.filter((t) => t.type === 'return' || t.type === 'dividend')
    .reduce((sum, t) => sum + t.amount, 0);
  const activeProjects = confirmedInvestments.length;
  const pendingInvestments = MOCK_INVESTMENTS.filter((inv) => inv.status === 'pending');
  const totalPending = pendingInvestments.reduce((sum, inv) => sum + inv.amount, 0);

  const getProject = (id: string) => PROJECTS_DATA.find((p) => p.id === id);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Bonjour, {user?.full_name || 'Investisseur'}
          </h1>
          <p className="text-slate-400">Bienvenue sur votre tableau de bord investisseur</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total investi', value: formatCurrency(totalInvested), icon: '💰', color: 'from-blue-500 to-blue-600' },
            { label: 'Rendements perçus', value: formatCurrency(totalReturns), icon: '📈', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Projets actifs', value: activeProjects.toString(), icon: '🏗️', color: 'from-purple-500 to-purple-600' },
            { label: 'En attente', value: formatCurrency(totalPending), icon: '⏳', color: 'from-amber-500 to-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Investments */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Mes investissements</h2>

              {confirmedInvestments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-slate-400 mb-4">Vous n'avez pas encore d'investissement</p>
                  <Link to="/projects" className="btn-primary text-sm">
                    Découvrir les projets
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {confirmedInvestments.map((inv) => {
                    const project = getProject(inv.project_id);
                    if (!project) return null;
                    const progress = calculateProgress(project.raised_amount, project.target_amount);
                    return (
                      <Link
                        key={inv.id}
                        to={`/projects/${project.id}`}
                        className="block p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-semibold">{project.title}</h3>
                            <p className="text-sm text-slate-400">{project.location}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-bold">{formatCurrency(inv.amount)}</div>
                            <div className="text-xs text-emerald-400">+{project.expected_return}% / an</div>
                          </div>
                        </div>
                        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1.5">
                          <span>{formatDate(inv.created_at)}</span>
                          <span>{progress}% financé</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Investments */}
            {pendingInvestments.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Investissements en attente</h2>
                <div className="space-y-3">
                  {pendingInvestments.map((inv) => {
                    const project = getProject(inv.project_id);
                    return (
                      <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <div>
                          <div className="text-white text-sm font-medium">{project?.title || inv.project_id}</div>
                          <div className="text-xs text-slate-500">{formatCurrency(inv.amount)}</div>
                        </div>
                        <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg">En cours</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Transactions */}
          <div className="space-y-6">
            {/* History */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Activité récente</h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {MOCK_TRANSACTIONS.slice(0, 10).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        tx.type === 'return' || tx.type === 'dividend' ? 'bg-emerald-400' :
                        tx.type === 'investment' ? 'bg-blue-400' :
                        tx.type === 'deposit' ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <div>
                        <div className="text-sm text-white">{tx.description}</div>
                        <div className="text-xs text-slate-500">{formatDate(tx.created_at)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-semibold ${
                      tx.type === 'return' || tx.type === 'dividend' ? 'text-emerald-400' :
                      tx.type === 'investment' ? 'text-blue-400' :
                      tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'return' || tx.type === 'dividend' ? '+' : ''}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Actions rapides</h2>
              <div className="space-y-3">
                <Link to="/projects" className="btn-primary w-full text-sm">
                  Nouvel investissement
                </Link>
                <button className="btn-secondary w-full text-sm">
                  Effectuer un dépôt
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Résumé</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total investi</span>
                  <span className="text-white font-medium">{formatCurrency(totalInvested)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Rendements cumulés</span>
                  <span className="text-emerald-400 font-medium">{formatCurrency(totalReturns)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Projets actifs</span>
                  <span className="text-white font-medium">{activeProjects}</span>
                </div>
                <div className="border-t border-white/5 pt-3 flex justify-between">
                  <span className="text-slate-300 font-semibold">Valeur totale du portefeuille</span>
                  <span className="text-white font-bold">{formatCurrency(totalInvested + totalReturns)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}