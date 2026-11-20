import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { formatCurrency, calculateProgress, getTimeRemaining, getStatusLabel, getStatusColor, getRiskColor, getRiskLabel, CATEGORIES } from '@/lib/utils';
import { useState } from 'react';

export default function Projects() {
  const { projects, allProjects, filters, setFilters } = useProjects();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (val: string) => {
    setSearchInput(val);
    setFilters({ ...filters, search: val || undefined });
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Projets <span className="gradient-text">disponibles</span>
          </h1>
          <p className="text-slate-400 text-lg">
            {allProjects.length} projets immobiliers sélectionnés en Martinique
          </p>
        </div>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder="Rechercher un projet..."
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters({ ...filters, category: cat === 'Tous' ? undefined : cat })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (cat === 'Tous' && !filters.category) || filters.category === cat
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-transparent hover:border-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun projet trouvé</h3>
            <p className="text-slate-400">Essayez de modifier vos filtres de recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="group glass-card overflow-hidden card-hover"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

                  {/* Status badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white backdrop-blur-sm">
                      {project.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{project.subtitle}</p>

                  {/* Location */}
                  <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {project.location}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-slate-300">{formatCurrency(project.raised_amount)}</span>
                      <span className="text-slate-500">{formatCurrency(project.target_amount)}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                        style={{ width: `${calculateProgress(project.raised_amount, project.target_amount)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-emerald-400">{calculateProgress(project.raised_amount, project.target_amount)}%</span>
                      <span className="text-slate-500">Objectif</span>
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-emerald-400 font-semibold">{project.expected_return}%</span>
                      <span className={`text-xs ${getRiskColor(project.risk_level)}`}>
                        • {getRiskLabel(project.risk_level)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {getTimeRemaining(project.deadline)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}