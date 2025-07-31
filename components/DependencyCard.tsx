
import React from 'react';
import { Dependency, DependencyStatus, UrgencyLevel } from '../types';
import { UserCircleIcon, CalendarDaysIcon } from './icons';

type AugmentedDependency = Dependency & {
  keyResultTitle: string;
};

interface DependencyCardProps {
  dependency: AugmentedDependency;
  onUpdateStatus: (dependencyId: string, status: DependencyStatus) => void;
}

const statusColors: { [key in DependencyStatus]: { bg: string, text: string } } = {
  Pendente: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200' },
  'Em Andamento': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-200' },
  Resolvido: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200' },
  Cancelado: { bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-300 line-through' },
};

const urgencyColors: { [key in UrgencyLevel]: string } = {
  Baixa: 'border-green-500',
  Média: 'border-yellow-500',
  Alta: 'border-red-500',
};


export const DependencyCard: React.FC<DependencyCardProps> = ({ dependency, onUpdateStatus }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border-l-4 ${urgencyColors[dependency.urgency]}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={`Ligado ao KR: ${dependency.keyResultTitle}`}>
            KR: {dependency.keyResultTitle}
          </p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-1">{dependency.title}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 mt-3">
        <div className="flex items-center gap-2" title={`Dono (${dependency.blockingArea})`}>
          <UserCircleIcon className="w-4 h-4 text-slate-400" />
          <span>{dependency.owner}</span>
        </div>
        <div className="flex items-center gap-2" title="Prazo Necessário">
          <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
          <span>{formatDate(dependency.dueDate)}</span>
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor={`status-${dependency.id}`} className="sr-only">Status</label>
        <select
          id={`status-${dependency.id}`}
          value={dependency.status}
          onChange={e => onUpdateStatus(dependency.id, e.target.value as DependencyStatus)}
          className={`w-full px-2 py-1 text-sm font-semibold rounded-md border-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none text-center transition-colors ${statusColors[dependency.status].bg} ${statusColors[dependency.status].text}`}
        >
          {(Object.keys(statusColors) as DependencyStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );
};
