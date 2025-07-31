
import React, { useMemo } from 'react';
import { KeyResult, RagStatus } from '../types';
import { UserCircleIcon, CalendarDaysIcon, DocumentTextIcon, LinkIcon, ClipboardDocumentCheckIcon } from './icons';

type AugmentedKeyResult = KeyResult & {
  objectiveId: string;
  objectiveTitle: string;
  ragStatus: RagStatus;
};

interface ProjectCardProps {
  kr: AugmentedKeyResult;
  onOpenLogbook: () => void;
  onOpenDependencyModal: () => void;
  onOpenChecklist: () => void;
}

const statusBorders: { [key in RagStatus]: string } = {
  Red: 'border-red-500',
  Amber: 'border-amber-500',
  Green: 'border-green-500',
  Completed: 'border-sky-500',
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ kr, onOpenLogbook, onOpenDependencyModal, onOpenChecklist }) => {
  const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  const checklistProgress = useMemo(() => {
    if (!kr.checklist || kr.checklist.length === 0) {
        return { completed: 0, total: 0, isComplete: false, exists: false };
    }
    const completed = kr.checklist.filter(item => item.completed).length;
    const total = kr.checklist.length;
    return { completed, total, isComplete: completed === total, exists: true };
  }, [kr.checklist]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Sem prazo';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 border-l-4 ${statusBorders[kr.ragStatus]}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={`Objetivo: ${kr.objectiveTitle}`}>
            Obj: {kr.objectiveTitle}
          </p>
          <h3 className="font-bold text-slate-800 dark:text-slate-100 mt-1">{kr.title}</h3>
        </div>
        <div className="flex-shrink-0 flex items-center gap-1">
            <button
                onClick={onOpenChecklist}
                className={`p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full ${
                    !checklistProgress.exists ? 'text-slate-400 dark:text-slate-500' : 
                    checklistProgress.isComplete ? 'text-green-500 dark:text-green-400' : 'text-sky-500 dark:text-sky-400'
                }`}
                title="Abrir Checklist"
            >
                <ClipboardDocumentCheckIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onOpenDependencyModal}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                title="Adicionar Pendência"
            >
                <LinkIcon className="w-5 h-5" />
            </button>
            <button
                onClick={onOpenLogbook}
                className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"
                title="Abrir Diário de Bordo"
            >
                <DocumentTextIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300 mt-3">
        <div className="flex items-center gap-2" title="Dono">
          <UserCircleIcon className="w-4 h-4 text-slate-400" />
          <span>{kr.owner}</span>
        </div>
        <div className="flex items-center gap-2" title="Prazo">
          <CalendarDaysIcon className="w-4 h-4 text-slate-400" />
          <span>{formatDate(kr.deadline)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Progresso</span>
            <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
      {checklistProgress.exists && (
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>Checklist</span>
                <span>{checklistProgress.completed}/{checklistProgress.total}</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
              <div
                className={`${checklistProgress.isComplete ? 'bg-green-500' : 'bg-sky-500'} h-2 rounded-full`}
                style={{ width: `${(checklistProgress.completed / checklistProgress.total) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
    </div>
  );
};