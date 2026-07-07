import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
                T
              </div>
              <span className="text-lg font-bold text-white">
                TiFlow<span className="text-blue-400">Pro</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              TiFlow Pro est une plateforme d'investissement immobilier participatif 
              dédiée aux projets antillais. Investissez local, construisons ensemble 
              l'avenir de nos territoires.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Plateforme</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">Accueil</Link></li>
              <li><Link to="/projects" className="text-sm text-slate-400 hover:text-white transition-colors">Projets</Link></li>
              <li><Link to="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Légal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Mentions légales</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">CGU</a></li>
              <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} TiFlow Pro. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}