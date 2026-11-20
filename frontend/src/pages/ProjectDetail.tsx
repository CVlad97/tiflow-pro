import { useParams, Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency, calculateProgress, getTimeRemaining, getStatusLabel, getStatusColor, getRiskLabel, getRiskColor, formatPercentage, formatDate } from '@/lib/utils';
import { useState } from 'react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { getProjectById } = useProjects();
  const { user } = useAuth();
  const project = getProjectById(id || '');
  const [investAmount, setInvestAmount] = useState(project?.min_investment || 1000);
  const [showInvest, setShowInvest] = useState(false);

  if (!project) {
    return (
      <div className="min-h-screen pt-24 text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-white mb-2">Projet non trouvé</h2>
        <Link to="/projects" className="text-blue-400 hover:underline">Retour aux projets</Link>
      </div>
    );
  }

  const progress = calculateProgress(project.raised_amount, project.target_amount);
  const expectedAnnualReturn = investAmount * (project.expected_return / 100);
  const expectedTotalReturn = expectedAnnualReturn * (project.duration_months / 12);
  const shares = Math.floor(investAmount / 500);

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/projects" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← Retour aux projets
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative h-80 rounded-2xl overflow-hidden">
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)}
                  </span>
                  <span className="text-xs text-slate-400 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg">
                    {project.category}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{project.title}</h1>
                <p className="text-lg text-slate-300 mt-1">{project.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">À propos du projet</h2>
              <p className="text-slate-300 leading-relaxed">{project.description}</p>
            </div>

            {/* Highlights */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Points clés</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {project.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <span className="text-sm text-slate-300">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Location & Details */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Informations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-500 mb-1">Localisation</div>
                  <div className="text-white flex items-center gap-2">
                    <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {project.location}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Durée du projet</div>
                  <div className="text-white">{project.duration_months} mois</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Date de clôture</div>
                  <div className="text-white">{formatDate(project.deadline)}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-1">Niveau de risque</div>
                  <div className={`font-medium ${getRiskColor(project.risk_level)}`}>{getRiskLabel(project.risk_level)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Investissement Card */}
            <div className="glass-card p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Investissement</h3>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-emerald-400 font-semibold">{formatCurrency(project.raised_amount)}</span>
                  <span className="text-slate-500">sur {formatCurrency(project.target_amount)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1.5">
                  <span className="text-emerald-400">{progress}% atteint</span>
                  <span className="text-slate-500">Objectif</span>
                </div>
              </div>

              {/* Key info */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Rendement attendu</span>
                  <span className="text-emerald-400 font-semibold">{project.expected_return}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Investissement min.</span>
                  <span className="text-white font-medium">{formatCurrency(project.min_investment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Temps restant</span>
                  <span className="text-white font-medium">{getTimeRemaining(project.deadline)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Risque</span>
                  <span className={`font-medium ${getRiskColor(project.risk_level)}`}>{getRiskLabel(project.risk_level)}</span>
                </div>
              </div>

              {!showInvest ? (
                <button
                  onClick={() => setShowInvest(true)}
                  className="btn-primary w-full"
                  disabled={project.status !== 'fundraising'}
                >
                  {project.status === 'fundraising' ? 'Investir maintenant' : getStatusLabel(project.status)}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Montant de l'investissement</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                      <input
                        type="number"
                        value={investAmount}
                        onChange={(e) => setInvestAmount(Math.max(project.min_investment, Number(e.target.value) || 0))}
                        className="input-field pl-8"
                        min={project.min_investment}
                        step={100}
                      />
                    </div>
                    <div className="flex gap-2 mt-2">
                      {[1000, 2500, 5000, 10000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setInvestAmount(amount)}
                          className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                            investAmount === amount
                              ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                              : 'border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                        >
                          {amount}€
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simulation */}
                  <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Parts ({shares}x 500€)</span>
                      <span className="text-white">{shares}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Rendement annuel estimé</span>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(expectedAnnualReturn)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Rendement total estimé</span>
                      <span className="text-emerald-400 font-semibold">{formatCurrency(expectedTotalReturn)}</span>
                    </div>
                    <div className="border-t border-white/5 pt-2 mt-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-white">Valeur finale estimée</span>
                        <span className="text-white">{formatCurrency(investAmount + expectedTotalReturn)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowInvest(false)}
                      className="btn-secondary flex-1 text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      className="btn-primary flex-1 text-sm"
                      onClick={() => {
                        if (user) alert(`✅ Simulation validée ! Investissement de ${formatCurrency(investAmount)} dans "${project.title}". Veuillez compléter le paiement depuis votre dashboard.`);
                        else alert('Veuillez vous connecter pour investir');
                      }}
                    >
                      Valider
                    </button>
                  </div>
                </div>
              )}

              {!user && (
                <p className="text-xs text-slate-500 text-center mt-4">
                  Connectez-vous pour investir dans ce projet
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}