
import React, { useMemo } from 'react';
import type { Objective, KeyResult } from '../types';
import { SparklesIcon, UserCircleIcon, CalendarDaysIcon, DocumentTextIcon, LinkIcon, ClipboardDocumentCheckIcon } from './icons';

interface ObjectiveCardProps {
  objective: Objective;
  onUpdateKrValue: (objectiveId: string, krId: string, value: number) => void;
  onGenerateWorkflow: (objectiveId: string, krId: string) => void;
  onOpenLogbook: (objectiveId: string, krId: string) => void;
  onOpenDependencyModal: (objectiveId: string, krId: string) => void;
  onOpenChecklist: (objectiveId: string, krId: string) => void;
}

const KeyResultItem: React.FC<{
    kr: KeyResult;
    objectiveId: string;
    onUpdate: (value: number) => void;
    onGenerate: () => void;
    onOpenLogbook: () => void;
    onOpenDependencyModal: () => void;
    onOpenChecklist: () => void;
}> = ({ kr, onUpdate, onGenerate, onOpenLogbook, onOpenDependencyModal, onOpenChecklist }) => {
    const progress = kr.targetValue > 0 ? (kr.currentValue / kr.targetValue) * 100 : 0;
    const progressPercentage = Math.min(Math.max(progress, 0), 100);

    const checklistProgress = useMemo(() => {
        if (!kr.checklist || kr.checklist.length === 0) {
            return { completed: 0, total: 0, isComplete: false };
        }
        const completed = kr.checklist.filter(item => item.completed).length;
        const total = kr.checklist.length;
        return { completed, total, isComplete: completed === total };
    }, [kr.checklist]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Sem prazo';
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() + userTimezoneOffset).toLocaleDateString('pt-BR');
    };

    return (
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <div className="flex justify-between items-start mb-2 gap-2">
                <p className="font-semibold text-slate-700 dark:text-slate-200 flex-1 pr-2">{kr.title}</p>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={onOpenChecklist}
                        className={`p-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-all ${
                            !kr.checklist ? 'text-slate-400 dark:text-slate-500' : 
                            checklistProgress.isComplete ? 'text-green-500 dark:text-green-400' : 'text-sky-500 dark:text-sky-400'
                        }`}
                        title="Abrir Checklist"
                    >
                        <ClipboardDocumentCheckIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onOpenDependencyModal}
                        className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-600/50 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        title="Adicionar Pendência"
                    >
                        <LinkIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onOpenLogbook}
                        className="p-1.5 text-slate-600 dark:text-slate-300 bg-slate-200 dark:bg-slate-600/50 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                        title="Abrir Diário de Bordo"
                    >
                        <DocumentTextIcon className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onGenerate}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-sky-600 dark:text-sky-300 bg-sky-100 dark:bg-sky-500/20 rounded-full hover:bg-sky-200 dark:hover:bg-sky-500/30 transition-all whitespace-nowrap"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        {kr.workflow ? 'Ver Fluxo' : 'Gerar Fluxo'}
                    </button>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mb-3">
                <div className="flex items-center gap-1.5" title="Dono">
                    <UserCircleIcon className="w-4 h-4" />
                    <span>{kr.owner || 'Não definido'}</span>
                </div>
                <div className="flex items-center gap-1.5" title="Prazo">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>{formatDate(kr.deadline)}</span>
                </div>
                 {kr.checklist && kr.checklist.length > 0 && (
                    <div className="flex items-center gap-1.5" title="Progresso do Checklist">
                        <ClipboardDocumentCheckIcon className={`w-4 h-4 ${checklistProgress.isComplete ? 'text-green-500' : 'text-sky-500'}`} />
                        <span>{checklistProgress.completed}/{checklistProgress.total}</span>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2.5">
                    <div
                        className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                    <input
                        type="range"
                        min="0"
                        max={kr.targetValue}
                        value={kr.currentValue}
                        onChange={(e) => onUpdate(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-transparent cursor-pointer appearance-none focus:outline-none [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200 dark:[&::-webkit-slider-runnable-track]:bg-slate-600 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-500"
                    />
                    <span className="ml-4 font-mono text-xs w-28 text-right">
                        {kr.currentValue} / {kr.targetValue}
                    </span>
                </div>
            </div>
        </div>
    );
};


const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onUpdateKrValue, onGenerateWorkflow, onOpenLogbook, onOpenDependencyModal, onOpenChecklist }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{objective.title}</h2>
      </div>
      <div className="p-6 space-y-4 flex-grow">
        {objective.keyResults.map(kr => (
          <KeyResultItem
            key={kr.id}
            kr={kr}
            objectiveId={objective.id}
            onUpdate={(value) => onUpdateKrValue(objective.id, kr.id, value)}
            onGenerate={() => onGenerateWorkflow(objective.id, kr.id)}
            onOpenLogbook={() => onOpenLogbook(objective.id, kr.id)}
            onOpenDependencyModal={() => onOpenDependencyModal(objective.id, kr.id)}
            onOpenChecklist={() => onOpenChecklist(objective.id, kr.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ObjectiveCard;
