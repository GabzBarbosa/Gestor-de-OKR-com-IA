
import React, { useState, useMemo } from 'react';
import type { Objective, KeyResult, ChecklistItem } from '../types';
import { ClipboardDocumentCheckIcon, XMarkIcon, PlusIcon, TrashIcon } from './icons';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  keyResult: KeyResult;
  onAddItem: (objectiveId: string, krId: string, text: string) => void;
  onToggleItem: (objectiveId: string, krId: string, itemId: string) => void;
  onDeleteItem: (objectiveId: string, krId: string, itemId: string) => void;
}

const ChecklistModal: React.FC<ChecklistModalProps> = ({ isOpen, onClose, objective, keyResult, onAddItem, onToggleItem, onDeleteItem }) => {
  const [newItemText, setNewItemText] = useState('');

  const checklist = useMemo(() => keyResult.checklist || [], [keyResult.checklist]);

  const progress = useMemo(() => {
    if (checklist.length === 0) return { percent: 0, completed: 0, total: 0 };
    const completed = checklist.filter(item => item.completed).length;
    const total = checklist.length;
    return {
      percent: Math.round((completed / total) * 100),
      completed,
      total,
    };
  }, [checklist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    onAddItem(objective.id, keyResult.id, newItemText);
    setNewItemText('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 pt-16" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all flex flex-col max-h-[calc(100vh-8rem)]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardDocumentCheckIcon className="w-6 h-6 text-sky-500" />
              Checklist de Acompanhamento
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate max-w-md" title={keyResult.title}>
              KR: {keyResult.title}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-grow overflow-y-auto">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                    <span>Progresso</span>
                    <span>{progress.completed} / {progress.total}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                    <div
                        className="bg-sky-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percent}%` }}
                    ></div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newItemText}
                    onChange={e => setNewItemText(e.target.value)}
                    placeholder="Adicionar novo item ao checklist..."
                    className="flex-grow px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
                />
                <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-lg shadow-sm hover:bg-sky-600 disabled:opacity-50" disabled={!newItemText.trim()}>
                    <PlusIcon className="w-4 h-4" />
                    Adicionar
                </button>
            </form>

            <div className="space-y-2">
                {checklist.length > 0 ? (
                    checklist.map(item => (
                        <div key={item.id} className="group flex items-center gap-3 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                            <input
                                type="checkbox"
                                id={`check-${item.id}`}
                                checked={item.completed}
                                onChange={() => onToggleItem(objective.id, keyResult.id, item.id)}
                                className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                            />
                            <label htmlFor={`check-${item.id}`} className={`flex-grow text-sm cursor-pointer ${item.completed ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {item.text}
                            </label>
                            <button onClick={() => onDeleteItem(objective.id, keyResult.id, item.id)} className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        <p>Nenhum item no checklist.</p>
                        <p className="text-sm">Adicione o primeiro passo para começar.</p>
                    </div>
                )}
            </div>
        </div>
        
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-md hover:bg-sky-700 focus:outline-none">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChecklistModal;
