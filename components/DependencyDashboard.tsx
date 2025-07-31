
import React, { useState, useMemo } from 'react';
import { Dependency, Objective, BlockingArea, UrgencyLevel, DependencyStatus } from '../types';
import { LinkIcon } from './icons';
import { DependencyCard } from './DependencyCard';
import { Charts } from './Charts';

interface DependencyDashboardProps {
    dependencies: Dependency[];
    objectives: Objective[];
    onUpdateDependencyStatus: (dependencyId: string, status: DependencyStatus) => void;
}

const blockingAreas: BlockingArea[] = ['Marketing', 'Produto', 'SAC', 'Dados', 'Engenharia', 'Outra'];
const urgencyLevels: UrgencyLevel[] = ['Baixa', 'Média', 'Alta'];

const areaConfig: { [key in BlockingArea]: { title: string; classes: string; } } = {
  Marketing: { title: 'Marketing', classes: 'text-pink-800 bg-pink-100 dark:bg-pink-900/30 dark:text-pink-200' },
  Produto: { title: 'Produto', classes: 'text-indigo-800 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-200' },
  SAC: { title: 'SAC', classes: 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-200' },
  Dados: { title: 'Dados', classes: 'text-cyan-800 bg-cyan-100 dark:bg-cyan-900/30 dark:text-cyan-200' },
  Engenharia: { title: 'Engenharia', classes: 'text-orange-800 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-200' },
  Outra: { title: 'Outra', classes: 'text-slate-800 bg-slate-200 dark:bg-slate-700 dark:text-slate-200' },
};

const DependencyDashboard: React.FC<DependencyDashboardProps> = ({ dependencies, objectives, onUpdateDependencyStatus }) => {
  const [areaFilter, setAreaFilter] = useState<BlockingArea | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');

  const augmentedDependencies = useMemo(() => {
    return dependencies.map(dep => {
        const objective = objectives.find(o => o.id === dep.objectiveId);
        const keyResult = objective?.keyResults.find(kr => kr.id === dep.linkedKrId);
        return {
            ...dep,
            keyResultTitle: keyResult?.title || 'KR não encontrado',
        }
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [dependencies, objectives]);

  const filteredDependencies = useMemo(() => {
    return augmentedDependencies.filter(dep => {
        const areaMatch = areaFilter === 'all' || dep.blockingArea === areaFilter;
        const urgencyMatch = urgencyFilter === 'all' || dep.urgency === urgencyFilter;
        return areaMatch && urgencyMatch;
    });
  }, [augmentedDependencies, areaFilter, urgencyFilter]);

  const groupedDependencies = useMemo(() => {
    return filteredDependencies.reduce((acc, dep) => {
        const area = dep.blockingArea;
        if (!acc[area]) {
            acc[area] = [];
        }
        acc[area].push(dep);
        return acc;
    }, {} as Record<BlockingArea, typeof filteredDependencies>);
  }, [filteredDependencies]);

  if (dependencies.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <LinkIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">Nenhuma pendência registrada</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use o ícone 🔗 nos KRs para adicionar uma nova pendência.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
            <Charts dependencies={dependencies} areaConfig={areaConfig} />
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm flex items-center gap-4">
             <h3 className="text-lg font-semibold whitespace-nowrap">Filtros:</h3>
             <div>
                <label htmlFor="areaFilter" className="sr-only">Filtrar por Área</label>
                <select id="areaFilter" value={areaFilter} onChange={e => setAreaFilter(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    <option value="all">Todas as Áreas</option>
                    {blockingAreas.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="urgencyFilter" className="sr-only">Filtrar por Urgência</label>
                <select id="urgencyFilter" value={urgencyFilter} onChange={e => setUrgencyFilter(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    <option value="all">Todas as Urgências</option>
                    {urgencyLevels.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
            </div>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
        {blockingAreas.map(area => {
          const depsInArea = groupedDependencies[area] || [];
          if (depsInArea.length === 0 && areaFilter !== 'all' && areaFilter !== area) {
            return null; // Hide column if no deps and not actively filtered
          }
          return (
            <div key={area} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-lg pb-4 h-full">
              <h2 className={`text-base font-bold mb-4 p-3 rounded-t-lg ${areaConfig[area].classes}`}>
                {areaConfig[area].title}
                <span className="ml-2 font-normal text-sm opacity-80">({depsInArea.length})</span>
              </h2>
              <div className="space-y-4 px-3">
                {depsInArea.length > 0 ? (
                  depsInArea.map(dep => <DependencyCard key={dep.id} dependency={dep} onUpdateStatus={onUpdateDependencyStatus} />)
                ) : (
                  <p className="text-sm text-slate-500 p-4 text-center">Nenhuma pendência para esta área.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DependencyDashboard;
