
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { Objective, KeyResult, LogbookTag, LogbookEntry } from '../types';
import { DocumentTextIcon, XMarkIcon, PlusIcon, ArrowDownTrayIcon } from './icons';

interface LogbookModalProps {
  isOpen: boolean;
  onClose: () => void;
  objective: Objective;
  keyResult: KeyResult;
  onAddEntry: (objectiveId: string, krId: string, entry: Omit<LogbookEntry, 'id' | 'date'>) => void;
}

const tagColors: { [key in LogbookTag]: { bg: string; text: string; border: string } } = {
  'Decisão': { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-300' },
  'Problema': { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-200', border: 'border-red-300' },
  'Lição Aprendida': { bg: 'bg-purple-100 dark:bg-purple-900/50', text: 'text-purple-800 dark:text-purple-200', border: 'border-purple-300' },
  'Próximos Passos': { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-200', border: 'border-green-300' },
};

const LogbookModal: React.FC<LogbookModalProps> = ({ isOpen, onClose, objective, keyResult, onAddEntry }) => {
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryTag, setNewEntryTag] = useState<LogbookTag>('Próximos Passos');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryContent.trim()) {
      alert('O conteúdo da entrada não pode estar vazio.');
      return;
    }
    onAddEntry(objective.id, keyResult.id, {
      tag: newEntryTag,
      content: newEntryContent,
    });
    setNewEntryContent('');
    setNewEntryTag('Próximos Passos');
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = 20;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Relatório do Diário de Bordo', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    const objText = `Objetivo: ${objective.title}`;
    const objLines = doc.splitTextToSize(objText, doc.internal.pageSize.getWidth() - margin * 2);
    doc.text(objLines, margin, y);
    y += objLines.length * 7 + 5;

    doc.setFont('helvetica', 'normal');
    const krText = `Resultado-Chave: ${keyResult.title}`;
    const krLines = doc.splitTextToSize(krText, doc.internal.pageSize.getWidth() - margin * 2);
    doc.text(krLines, margin, y);
    y += krLines.length * 7 + 10;
    
    doc.setDrawColor(200);
    doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
    y += 10;

    (keyResult.logbook || []).forEach(entry => {
        if (y > doc.internal.pageSize.getHeight() - 30) {
            doc.addPage();
            y = 20;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const entryDate = new Date(entry.date).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        doc.text(`${entryDate} - [${entry.tag}]`, margin, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const contentLines = doc.splitTextToSize(entry.content, doc.internal.pageSize.getWidth() - margin * 2);
        doc.text(contentLines, margin, y);
        y += contentLines.length * 5 + 10;
    });

    doc.save(`Diario_Bordo_${keyResult.title.replace(/\s/g, '_')}.pdf`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 pt-16" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl transform transition-all flex flex-col max-h-[calc(100vh-8rem)]" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <DocumentTextIcon className="w-6 h-6 text-sky-500" />
              Diário de Bordo
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate max-w-md" title={keyResult.title}>
                KR: {keyResult.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={!keyResult.logbook || keyResult.logbook.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              PDF
            </button>
            <button type="button" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-3">
            <textarea
              value={newEntryContent}
              onChange={(e) => setNewEntryContent(e.target.value)}
              placeholder="Descreva a decisão, problema, lição ou próximo passo..."
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 text-sm"
              required
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Tag:</label>
                <select
                  value={newEntryTag}
                  onChange={(e) => setNewEntryTag(e.target.value as LogbookTag)}
                  className={`px-2 py-1 text-sm font-semibold rounded-md border-transparent focus:ring-2 focus:ring-sky-500 focus:outline-none ${tagColors[newEntryTag].bg} ${tagColors[newEntryTag].text}`}
                >
                  {(Object.keys(tagColors) as LogbookTag[]).map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-lg shadow-sm hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900">
                <PlusIcon className="w-4 h-4" />
                Adicionar
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {keyResult.logbook && keyResult.logbook.length > 0 ? (
              keyResult.logbook.map(entry => (
                <div key={entry.id} className="p-4 border-l-4 rounded-r-md bg-white dark:bg-slate-800/50" style={{ borderColor: tagColors[entry.tag].border.replace('border-', '#') }}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${tagColors[entry.tag].bg} ${tagColors[entry.tag].text}`}>
                      {entry.tag}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400">
                      {new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{entry.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                <p>Nenhuma entrada no diário ainda.</p>
                <p className="text-sm">Seja o primeiro a adicionar uma nota!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogbookModal;