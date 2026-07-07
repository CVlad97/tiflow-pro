import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/AuthModal';
import { useState } from 'react';

export default function Landing() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const features = [
    { icon: '🚀', title: 'Investissement accessible', desc: 'Dès 500€, participez à des projets immobiliers sélectionnés en Martinique et aux Antilles.' },
    { icon: '📊', title: 'Transparence totale', desc: 'Suivez en temps réel l\'avancement de vos investissements et les rendements générés.' },
    { icon: '🤝', title: 'Impact local', desc: 'Soutenez l\'économie antillaise en finançant des projets qui créent de la valeur sur nos territoires.' },
    { icon: '🛡️', title: 'Sécurité renforcée', desc: 'Projets rigoureusement sélectionnés, garanties et pilotage professionnel.' },
  ];

  const stats = [
    { value: '8', label: 'Projets financés' },
    { value: '4,2M€', label: 'Collectés' },
    { value: '6,8%', label: 'Rendement moyen' },
    { value: '350+', label: 'Investisseurs' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-950 to-slate-950" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Plateforme d'investissement participatif
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6">
            Investissez dans
            <br />
            <span className="gradient-text">l'immobilier antillais</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            TiFlow Pro vous permet de participer au financement de projets immobiliers 
            sélectionnés en Martinique. Rendements attractifs, impact local, transparence totale.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/projects" className="btn-primary text-lg">
              Découvrir les projets
            </Link>
            {!user && (
              <button onClick={() => setShowAuth(true)} className="btn-secondary text-lg">
                Créer un compte
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-20" id="concept">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-white mb-4">Comment ça marche</h2>
            <p className="section-subtitle">
              Un processus simple et transparent pour investir dans l'immobilier antillais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Explorez', desc: 'Parcourez les projets disponibles et analysez leurs caractéristiques.' },
              { step: '02', title: 'Simulez', desc: 'Utilisez notre simulateur pour calculer vos rendements potentiels.' },
              { step: '03', title: 'Investissez', desc: 'Choisissez votre montant et participez au financement du projet.' },
              { step: '04', title: 'Suivez', desc: 'Consultez votre dashboard pour suivre vos investissements en temps réel.' },
            ].map((item) => (
              <div key={item.step} className="relative glass-card p-6 text-center group card-hover">
                <div className="text-4xl font-bold text-blue-500/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title text-white mb-4">Pourquoi TiFlow Pro ?</h2>
            <p className="section-subtitle">
              Une plateforme conçue pour les investisseurs antillais et ceux qui croient en nos territoires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat) => (
              <div key={feat.title} className="glass-card p-6 card-hover">
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Prêt à investir dans <span className="gradient-text">l'avenir antillais</span> ?
            </h2>
            <p className="text-slate-400 mb-8 max-w-xl mx-auto">
              Rejoignez une communauté d'investisseurs qui construisent l'immobilier de 
              demain en Martinique et aux Antilles.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/projects" className="btn-primary text-lg">
                Voir les projets
              </Link>
              {!user && (
                <button onClick={() => setShowAuth(true)} className="btn-secondary text-lg">
                  S'inscrire gratuitement
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}