
export type WorkflowStatus = 'A Fazer' | 'Em Progresso' | 'Concluído';

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: WorkflowStatus;
}

export type LogbookTag = 'Decisão' | 'Problema' | 'Lição Aprendida' | 'Próximos Passos';

export interface LogbookEntry {
  id: string;
  date: string; // ISO Date String
  tag: LogbookTag;
  content: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface KeyResult {
  id: string;
  title: string;
  owner: string;
  deadline: string; // ISO Date String
  currentValue: number;
  targetValue: number;

  // Optional detailed sections
  workflow?: WorkflowStep[];
  logbook?: LogbookEntry[];
  checklist?: ChecklistItem[];
}

export interface Objective {
  id: string;
  title: string;
  keyResults: KeyResult[];
}

export type RagStatus = 'Red' | 'Amber' | 'Green' | 'Completed';

// Dependency Management Types
export type DependencyStatus = 'Pendente' | 'Em Andamento' | 'Resolvido' | 'Cancelado';
export type UrgencyLevel = 'Baixa' | 'Média' | 'Alta';
export type BlockingArea = 'Marketing' | 'Produto' | 'SAC' | 'Dados' | 'Engenharia' | 'Outra';

export interface Dependency {
  id: string;
  title: string;
  blockingArea: BlockingArea;
  owner: string; // Person responsible in the other area
  requestDate: string; // ISO Date String
  dueDate: string; // ISO Date String
  status: DependencyStatus;
  urgency: UrgencyLevel;
  linkedKrId: string;
  objectiveId: string;
}