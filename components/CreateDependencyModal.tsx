
import React, { useState } from 'react';
import type { Objective, KeyResult, Dependency, BlockingArea, UrgencyLevel } from '../types';
import { LinkIcon, XMarkIcon } from './icons';

interface CreateDependencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  keyResult: KeyResult;
  onAddDependency: (dependency: Omit<Dependency, 'id' | 'requestDate'>) => void;
}

const blockingAreas: BlockingArea[] = ['Marketing', 'Produto', 'SAC', 'Dados', 'Engenharia', 'Outra'];
const urgencyLevels: UrgencyLevel[] = ['Baixa', 'Média', 'Alta'];

const CreateDependencyModal: React.FC<CreateDependencyModalProps> = ({ isOpen, onClose, objective, keyResult, onAddDependency }) => {
  const [title, setTitle] = useState('');
  const [blockingArea, setBlockingArea] = useState<BlockingArea>('Produto');
  const [owner, setOwner] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Média');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !owner.trim() || !dueDate) {
      alert('Por favor, preencha todos os campos obrigatórios: Título, Dono e Prazo.');
      return;
    }
    onAddDependency({
      title,
      blockingArea,
      owner,
      dueDate,
      urgency,
      status: 'Pendente',
      linkedKrId: keyResult.id,
      objectiveId: objective.id,
    });
    // Reset form
    setTitle('');
    setBlockingArea('Produto');
    setOwner('');
    setDueDate('');
    setUrgency('Média');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start">
            <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <LinkIcon className="w-6 h-6 text-yellow-500" />
                    Registrar Nova Pendência
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Bloqueando o KR: "{keyResult.title}"</p>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="depTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                O que está bloqueando o progresso?
              </label>
              <input
                type="text"
                id="depTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Aprovação de design para a nova landing page"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="blockingArea" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Área Responsável
                </label>
                <select id="blockingArea" value={blockingArea} onChange={e => setBlockingArea(e.target.value as BlockingArea)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    {blockingAreas.map(area => <option key={area} value={area}>{area}</option>)}
                </select>
              </div>
               <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Urgência
                </label>
                <select id="urgency" value={urgency} onChange={e => setUrgency(e.target.value as UrgencyLevel)} className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500">
                    {urgencyLevels.map(level => <option key={level} value={level}>{level}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label htmlFor="owner" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Dono da Pendência
                </label>
                <input
                  type="text"
                  id="owner"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="Nome do responsável na outra área"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Prazo Necessário
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
              Salvar Pendência
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDependencyModal;
