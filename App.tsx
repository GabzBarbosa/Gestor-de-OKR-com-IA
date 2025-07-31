
import React, { useState, useCallback, useMemo } from 'react';
import { Objective, KeyResult, WorkflowStatus, Dependency, LogbookEntry, ChecklistItem } from './types';
import { PlusIcon, SparklesIcon, TargetIcon, RectangleGroupIcon, CalendarIcon, LinkIcon } from './components/icons';
import CreateOkrModal from './components/CreateOkrModal';
import WorkflowModal from './components/WorkflowModal';
import ObjectiveCard from './components/ObjectiveCard';
import ProjectAgenda from './components/ProjectAgenda';
import LogbookModal from './components/LogbookModal';
import ChecklistModal from './components/ChecklistModal';
import CreateDependencyModal from './components/CreateDependencyModal';
import DependencyDashboard from './components/DependencyDashboard';
import { generateWorkflow } from './services/geminiService';

const App: React.FC = () => {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [currentView, setCurrentView] = useState<'okrs' | 'agenda' | 'dependencies'>('okrs');
  
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  
  const [isWorkflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [selectedKrForWorkflow, setSelectedKrForWorkflow] = useState<{ objectiveId: string; krId: string } | null>(null);
  
  const [isLogbookModalOpen, setLogbookModalOpen] = useState(false);
  const [selectedKrForLogbook, setSelectedKrForLogbook] = useState<{ objectiveId: string; krId: string } | null>(null);

  const [isDependencyModalOpen, setDependencyModalOpen] = useState(false);
  const [selectedKrForDependency, setSelectedKrForDependency] = useState<{ objectiveId: string; krId: string } | null>(null);
  
  const [isChecklistModalOpen, setChecklistModalOpen] = useState(false);
  const [selectedKrForChecklist, setSelectedKrForChecklist] = useState<{ objectiveId: string; krId: string } | null>(null);

  const [isLoadingWorkflow, setIsLoadingWorkflow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddObjective = (objective: Omit<Objective, 'id'>) => {
    const newObjective: Objective = {
      ...objective,
      id: `obj-${Date.now()}`,
    };
    setObjectives([...objectives, newObjective]);
    setCreateModalOpen(false);
  };

  const handleUpdateKrValue = useCallback((objectiveId: string, krId: string, value: number) => {
    setObjectives(prevObjectives =>
      prevObjectives.map(obj =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map(kr =>
                kr.id === krId ? { ...kr, currentValue: value } : kr
              ),
            }
          : obj
      )
    );
  }, []);

  const handleGenerateWorkflow = useCallback(async (objectiveId: string, krId: string) => {
    setSelectedKrForWorkflow({ objectiveId, krId });
    setWorkflowModalOpen(true);
    setIsLoadingWorkflow(true);
    setError(null);

    const objective = objectives.find(o => o.id === objectiveId);
    const keyResult = objective?.keyResults.find(kr => kr.id === krId);

    if (!objective || !keyResult) {
      setError("Objetivo ou Resultado-Chave não encontrado.");
      setIsLoadingWorkflow(false);
      return;
    }

    try {
      const workflow = await generateWorkflow(objective.title, keyResult.title);
      setObjectives(prev => prev.map(obj => 
        obj.id === objectiveId 
        ? {
            ...obj,
            keyResults: obj.keyResults.map(kr => 
              kr.id === krId ? {...kr, workflow} : kr
            )
          }
        : obj
      ));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoadingWorkflow(false);
    }
  }, [objectives]);

  const handleUpdateWorkflowStatus = useCallback((objectiveId: string, krId: string, stepId: string, status: WorkflowStatus) => {
    setObjectives(prev => prev.map(obj => {
      if (obj.id !== objectiveId) return obj;
      return {
        ...obj,
        keyResults: obj.keyResults.map(kr => {
          if (kr.id !== krId || !kr.workflow) return kr;
          return {
            ...kr,
            workflow: kr.workflow.map(step => 
              step.id === stepId ? {...step, status} : step
            )
          }
        })
      }
    }));
  }, []);

  const handleOpenLogbookModal = useCallback((objectiveId: string, krId: string) => {
    setSelectedKrForLogbook({ objectiveId, krId });
    setLogbookModalOpen(true);
  }, []);

  const handleAddLogbookEntry = useCallback((objectiveId: string, krId: string, entry: Omit<LogbookEntry, 'id' | 'date'>) => {
    const newEntry: LogbookEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      date: new Date().toISOString(),
    };
    
    setObjectives(prev => prev.map(obj => {
      if (obj.id !== objectiveId) return obj;
      return {
        ...obj,
        keyResults: obj.keyResults.map(kr => {
          if (kr.id !== krId) return kr;
          const updatedLogbook = kr.logbook ? [newEntry, ...kr.logbook] : [newEntry];
          return {
            ...kr,
            logbook: updatedLogbook
          };
        })
      };
    }));
  }, []);
  
  const handleOpenDependencyModal = useCallback((objectiveId: string, krId: string) => {
    setSelectedKrForDependency({ objectiveId, krId });
    setDependencyModalOpen(true);
  }, []);
  
  const handleAddDependency = useCallback((dependency: Omit<Dependency, 'id' | 'requestDate'>) => {
    const newDependency: Dependency = {
        ...dependency,
        id: `dep-${Date.now()}`,
        requestDate: new Date().toISOString(),
    };
    setDependencies(prev => [...prev, newDependency]);
    setDependencyModalOpen(false);
  }, []);

  const handleUpdateDependencyStatus = useCallback((dependencyId: string, status: Dependency['status']) => {
    setDependencies(prev => prev.map(dep => dep.id === dependencyId ? { ...dep, status } : dep));
  }, []);

  const handleOpenChecklistModal = useCallback((objectiveId: string, krId: string) => {
    setSelectedKrForChecklist({ objectiveId, krId });
    setChecklistModalOpen(true);
  }, []);

  const updateKrChecklist = (objectiveId: string, krId: string, updateFn: (checklist: ChecklistItem[]) => ChecklistItem[]) => {
    setObjectives(prev => prev.map(obj => {
      if (obj.id !== objectiveId) return obj;
      return {
        ...obj,
        keyResults: obj.keyResults.map(kr => {
          if (kr.id !== krId) return kr;
          const currentChecklist = kr.checklist || [];
          return { ...kr, checklist: updateFn(currentChecklist) };
        })
      };
    }));
  };

  const handleAddChecklistItem = useCallback((objectiveId: string, krId: string, text: string) => {
    const newItem: ChecklistItem = {
      id: `check-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      text,
      completed: false,
    };
    updateKrChecklist(objectiveId, krId, checklist => [...checklist, newItem]);
  }, []);

  const handleToggleChecklistItem = useCallback((objectiveId: string, krId: string, itemId: string) => {
    updateKrChecklist(objectiveId, krId, checklist => 
      checklist.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item)
    );
  }, []);

  const handleDeleteChecklistItem = useCallback((objectiveId: string, krId: string, itemId: string) => {
    updateKrChecklist(objectiveId, krId, checklist => checklist.filter(item => item.id !== itemId));
  }, []);


  const activeData = useMemo(() => {
    const selectedKr = selectedKrForWorkflow || selectedKrForLogbook || selectedKrForDependency || selectedKrForChecklist;
    if (!selectedKr) return null;
    const obj = objectives.find(o => o.id === selectedKr.objectiveId);
    const kr = obj?.keyResults.find(k => k.id === selectedKr.krId);
    if (!obj || !kr) return null;
    return { objective: obj, keyResult: kr };
  }, [selectedKrForWorkflow, selectedKrForLogbook, selectedKrForDependency, selectedKrForChecklist, objectives]);


  const ViewSwitcherButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${
        isActive
          ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-900'
          : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
      }`}
    >
      {icon}
      {label}
    </button>
  );
  
  const renderContent = () => {
    switch(currentView) {
      case 'okrs':
        return objectives.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <SparklesIcon className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900 dark:text-white">Nenhum objetivo definido</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando seu primeiro objetivo para ver a mágica acontecer.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                Criar Objetivo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:gap-8 grid-cols-1 xl:grid-cols-2">
            {objectives.map(obj => (
              <ObjectiveCard 
                key={obj.id} 
                objective={obj} 
                onUpdateKrValue={handleUpdateKrValue} 
                onGenerateWorkflow={handleGenerateWorkflow}
                onOpenLogbook={handleOpenLogbookModal}
                onOpenDependencyModal={handleOpenDependencyModal}
                onOpenChecklist={handleOpenChecklistModal}
              />
            ))}
          </div>
        );
      case 'agenda':
        return <ProjectAgenda objectives={objectives} onOpenLogbook={handleOpenLogbookModal} onOpenDependencyModal={handleOpenDependencyModal} onOpenChecklist={handleOpenChecklistModal} />;
      case 'dependencies':
        return <DependencyDashboard dependencies={dependencies} objectives={objectives} onUpdateDependencyStatus={handleUpdateDependencyStatus} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <TargetIcon className="w-8 h-8 text-sky-500" />
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestor de OKR com IA</h1>
            </div>
            
            <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center space-x-1 bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
              <ViewSwitcherButton label="OKRs" icon={<RectangleGroupIcon className="w-5 h-5"/>} isActive={currentView === 'okrs'} onClick={() => setCurrentView('okrs')} />
              <ViewSwitcherButton label="Agenda" icon={<CalendarIcon className="w-5 h-5"/>} isActive={currentView === 'agenda'} onClick={() => setCurrentView('agenda')} />
              <ViewSwitcherButton label="Pendências" icon={<LinkIcon className="w-5 h-5"/>} isActive={currentView === 'dependencies'} onClick={() => setCurrentView('dependencies')} />
            </div>

            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-sky-500 rounded-lg shadow-md hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Novo Objetivo
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>

      <CreateOkrModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onAddObjective={handleAddObjective}
      />
      
      {activeData && (
        <WorkflowModal
          isOpen={isWorkflowModalOpen}
          onClose={() => setWorkflowModalOpen(false)}
          objective={activeData.objective}
          keyResult={activeData.keyResult}
          isLoading={isLoadingWorkflow}
          error={error}
          onUpdateStatus={handleUpdateWorkflowStatus}
        />
      )}

      {activeData && (
        <LogbookModal
          isOpen={isLogbookModalOpen}
          onClose={() => setLogbookModalOpen(false)}
          objective={activeData.objective}
          keyResult={activeData.keyResult}
          onAddEntry={handleAddLogbookEntry}
        />
      )}

      {activeData && (
        <ChecklistModal
          isOpen={isChecklistModalOpen}
          onClose={() => setChecklistModalOpen(false)}
          objective={activeData.objective}
          keyResult={activeData.keyResult}
          onAddItem={handleAddChecklistItem}
          onToggleItem={handleToggleChecklistItem}
          onDeleteItem={handleDeleteChecklistItem}
        />
      )}
      
      {activeData && (
        <CreateDependencyModal
            isOpen={isDependencyModalOpen}
            onClose={() => setDependencyModalOpen(false)}
            objective={activeData.objective}
            keyResult={activeData.keyResult}
            onAddDependency={handleAddDependency}
        />
      )}
    </div>
  );
};

export default App;