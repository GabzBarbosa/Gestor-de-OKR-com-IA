
import React from 'react';
import { Objective, KeyResult, RagStatus } from '../types';
import { ProjectCard } from './ProjectCard';
import { SparklesIcon } from './icons';

interface ProjectAgendaProps {
    objectives: Objective[];
    onOpenLogbook: (objectiveId: string, krId: string) => void;
    onOpenDependencyModal: (objectiveId: string, krId: string) => void;
    onOpenChecklist: (objectiveId: string, krId: string) => void;
}

const calculateRagStatus = (kr: KeyResult): RagStatus => {
  const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
  if (progress >= 100) {
    return 'Completed';
  }

  if (!kr.deadline) {
    return 'Green'; // No deadline, no urgency
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(kr.deadline);
  // Adjust for timezone offset to compare dates correctly
  const userTimezoneOffset = deadlineDate.getTimezoneOffset() * 60000;
  const correctedDeadline = new Date(deadlineDate.getTime() + userTimezoneOffset);
  correctedDeadline.setHours(0, 0, 0, 0);

  if (correctedDeadline < today) {
    return 'Red'; // Overdue
  }

  const oneWeekFromNow = new Date(today);
  oneWeekFromNow.setDate(today.getDate() + 7);

  if (correctedDeadline <= oneWeekFromNow) {
    return 'Amber'; // Approaching deadline
  }

  return 'Green';
};

const statusConfig: { [key in RagStatus]: { title: string; classes: string; } } = {
  Red: { title: 'Em Risco', classes: 'text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-200' },
  Amber: { title: 'Atenção', classes: 'text-amber-800 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200' },
  Green: { title: 'Em Dia', classes: 'text-green-800 bg-green-100 dark:bg-green-900/30 dark:text-green-200' },
  Completed: { title: 'Concluído', classes: 'text-sky-800 bg-sky-100 dark:bg-sky-900/30 dark:text-sky-200' },
};

const ProjectAgenda: React.FC<ProjectAgendaProps> = ({ objectives, onOpenLogbook, onOpenDependencyModal, onOpenChecklist }) => {
  const allKrs = objectives.flatMap(obj =>
    obj.keyResults.map(kr => ({
      ...kr,
      objectiveId: obj.id,
      objectiveTitle: obj.title,
      ragStatus: calculateRagStatus(kr),
    }))
  ).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());

  if (allKrs.length === 0) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <SparklesIcon className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">Nenhum projeto na agenda</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione objetivos e resultados-chave para começar a acompanhar os projetos.</p>
      </div>
    );
  }

  const groupedKrs = allKrs.reduce((acc, kr) => {
    const status = kr.ragStatus;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(kr);
    return acc;
  }, {} as Record<RagStatus, typeof allKrs>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-start">
      {(Object.keys(statusConfig) as RagStatus[]).map(status => (
        <div key={status} className="bg-slate-100/50 dark:bg-slate-800/50 rounded-lg pb-4 h-full">
          <h2 className={`text-base font-bold mb-4 p-3 rounded-t-lg ${statusConfig[status].classes}`}>
            {statusConfig[status].title}
            <span className="ml-2 font-normal text-sm opacity-80">({groupedKrs[status]?.length || 0})</span>
          </h2>
          <div className="space-y-4 px-3">
            {groupedKrs[status] && groupedKrs[status].length > 0 ? (
              groupedKrs[status].map(kr => <ProjectCard key={kr.id} kr={kr} onOpenLogbook={() => onOpenLogbook(kr.objectiveId, kr.id)} onOpenDependencyModal={() => onOpenDependencyModal(kr.objectiveId, kr.id)} onOpenChecklist={() => onOpenChecklist(kr.objectiveId, kr.id)} />)
            ) : (
              <p className="text-sm text-slate-500 p-4 text-center">Nenhum projeto neste status.</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectAgenda;