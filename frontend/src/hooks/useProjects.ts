import { useState, useMemo } from 'react';
import { PROJECTS_DATA } from '@/lib/mockData';
import type { Project, ProjectFilter } from '@/types';

export function useProjects() {
  const [projects] = useState<Project[]>(PROJECTS_DATA as Project[]);
  const [filters, setFilters] = useState<ProjectFilter>({});

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (filters.category && filters.category !== 'Tous' && p.category !== filters.category) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.minReturn && p.expected_return < filters.minReturn) return false;
      if (filters.maxRisk && p.risk_level !== filters.maxRisk) {
        const riskOrder = ['low', 'medium', 'high'];
        if (riskOrder.indexOf(p.risk_level) > riskOrder.indexOf(filters.maxRisk)) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!p.title.toLowerCase().includes(q) && !p.description.toLowerCase().includes(q) && !p.location.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [projects, filters]);

  const getProjectById = (id: string): Project | undefined => {
    return projects.find((p) => p.id === id);
  };

  return { projects: filteredProjects, allProjects: projects, filters, setFilters, getProjectById };
}