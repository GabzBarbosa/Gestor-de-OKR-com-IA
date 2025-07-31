
import React from 'react';
import { Objective, KeyResult, WorkflowStep, WorkflowStatus } from '../types';
import { SparklesIcon, XMarkIcon } from './icons';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  keyResult: KeyResult;
  isLoading: boolean;
  error: string | null;
  onUpdateStatus: (objectiveId: string, krId: string, stepId: string, status: WorkflowStatus) => void;
}

const statusColors: { [key in WorkflowStatus]: string } = {
  'A Fazer': 'bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-200',
  'Em Progresso': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Concluído': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

const WorkflowStepView: React.FC<{
  step: WorkflowStep;
  objectiveId: string;
  krId: string;
  onUpdateStatus: (objectiveId: string, krId: string, stepId: string, status: WorkflowStatus) => void;
}> = ({ step, objectiveId, krId, onUpdateStatus }) => {
  return (
    <div className="p-4 bg-white dark:bg-slate-800/50 rounded-lg shadow-sm">
      <div className="flex justify-between items-start gap-4">
        <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{step.title}</h4>
        <select
          value={step.status}
          onChange={e => onUpdateStatus(objectiveId, krId, step.id, e.target.value as WorkflowStatus)}
          className={`px-2 py-1 text-xs font-semibold rounded-full border-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none ${statusColors[step.status]}`}
        >
          <option>A Fazer</option>
          <option>Em Progresso</option>
          <option>Concluído</option>
        </select>
      </div>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{step.description}</p>
    </div>
  );
};


const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  objective,
  keyResult,
  isLoading,
  error,
  onUpdateStatus,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-slate-100 dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl transform transition-all flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-sky-500" />
              Fluxo de Trabalho Gerado por IA
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Para o KR: "{keyResult.title}"</p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 flex-grow overflow-y-auto">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <SparklesIcon className="w-12 h-12 text-sky-500 animate-pulse" />
              <p className="mt-4 text-lg font-semibold">Gerando seu fluxo de trabalho...</p>
              <p className="text-slate-500">A IA está pensando nas melhores etapas para seu sucesso.</p>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-full text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="font-bold text-red-600 dark:text-red-400">Ocorreu um Erro</p>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {!isLoading && !error && keyResult.workflow && (
            <div className="space-y-4">
              {keyResult.workflow.length > 0 ? (
                keyResult.workflow.map(step => (
                    <WorkflowStepView key={step.id} step={step} objectiveId={objective.id} krId={keyResult.id} onUpdateStatus={onUpdateStatus} />
                ))
              ) : (
                <div className="text-center py-10">
                    <p>O fluxo de trabalho gerado está vazio.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-200 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;
