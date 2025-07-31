
import React, { useState } from 'react';
import type { Objective } from '../types';
import { PlusIcon, TrashIcon, XMarkIcon } from './icons';

interface CreateOkrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddObjective: (objective: Omit<Objective, 'id'>) => void;
}

const CreateOkrModal: React.FC<CreateOkrModalProps> = ({ isOpen, onClose, onAddObjective }) => {
  const [objectiveTitle, setObjectiveTitle] = useState('');
  const [keyResults, setKeyResults] = useState([{ title: '', targetValue: 100, owner: '', deadline: '' }]);

  const handleAddKr = () => {
    setKeyResults([...keyResults, { title: '', targetValue: 100, owner: '', deadline: '' }]);
  };

  const handleRemoveKr = (index: number) => {
    setKeyResults(keyResults.filter((_, i) => i !== index));
  };

  const handleKrChange = (index: number, field: 'title' | 'targetValue' | 'owner' | 'deadline', value: string | number) => {
    const newKrs = [...keyResults];
    const krToUpdate = { ...newKrs[index] };
    
    if (field === 'title' && typeof value === 'string') {
        krToUpdate.title = value;
    } else if (field === 'targetValue' && typeof value === 'number') {
        krToUpdate.targetValue = value > 0 ? value : 0;
    } else if (field === 'owner' && typeof value === 'string') {
        krToUpdate.owner = value;
    } else if (field === 'deadline' && typeof value === 'string') {
        krToUpdate.deadline = value;
    }
    
    newKrs[index] = krToUpdate;
    setKeyResults(newKrs);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectiveTitle.trim() || keyResults.some(kr => !kr.title.trim() || !kr.owner.trim() || !kr.deadline)) {
      alert("Por favor, preencha o título do objetivo e todos os campos dos resultados-chave (título, dono e prazo).");
      return;
    }
    onAddObjective({
      title: objectiveTitle,
      keyResults: keyResults.map(kr => ({
        ...kr,
        id: `kr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        currentValue: 0,
      })),
    });
    // Reset form
    setObjectiveTitle('');
    setKeyResults([{ title: '', targetValue: 100, owner: '', deadline: '' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Criar Novo Objetivo</h2>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            <div>
              <label htmlFor="objectiveTitle" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Objetivo
              </label>
              <input
                type="text"
                id="objectiveTitle"
                value={objectiveTitle}
                onChange={(e) => setObjectiveTitle(e.target.value)}
                placeholder="Ex: Lançar o produto X no mercado"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                required
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Resultados-Chave</h3>
              <div className="space-y-4">
                {keyResults.map((kr, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                    <div className="flex-grow space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título do KR</label>
                        <input
                          type="text"
                          value={kr.title}
                          onChange={e => handleKrChange(index, 'title', e.target.value)}
                          placeholder="Ex: Atingir 10k usuários ativos"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dono</label>
                            <input
                              type="text"
                              value={kr.owner}
                              onChange={e => handleKrChange(index, 'owner', e.target.value)}
                              placeholder="Ex: João Silva"
                              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                              required
                            />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prazo</label>
                          <input
                            type="date"
                            value={kr.deadline}
                            onChange={e => handleKrChange(index, 'deadline', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Alvo</label>
                          <input
                            type="number"
                            value={kr.targetValue}
                            onChange={e => handleKrChange(index, 'targetValue', parseInt(e.target.value, 10) || 0)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    {keyResults.length > 1 && (
                      <button type="button" onClick={() => handleRemoveKr(index)} className="mt-7 p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddKr}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50 rounded-md hover:bg-sky-200 dark:hover:bg-sky-900"
                >
                  <PlusIcon className="w-4 h-4" />
                  Adicionar Resultado-Chave
                </button>
              </div>
            </div>
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500">
              Salvar Objetivo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOkrModal;
