export type ResourceStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error' | 'offline' | 'forbidden';

export interface ApiResponse<T> {
  data: T;
  meta?: { total?: number; page?: number; pageSize?: number };
}

export interface ApiErrorPayload {
  message: string;
  code?: string;
  status?: number;
}

export type StudentStatus = 'Ativo' | 'Inativo' | 'Pendente';
export type PlanType = 'Basic' | 'Pro' | 'Enterprise';
export type TrainingLevelType = 'Iniciante' | 'Intermediário' | 'Avançado' | 'Atleta';

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  plan?: PlanType;
  status: StudentStatus;
  createdAt?: string;
  age?: string;
  height?: string;
  weight?: string;
  trainingLevel?: TrainingLevelType;
  allergies?: string;
  medications?: string;
  observations?: string;
}

export interface CreateStudentDTO extends Omit<Student, 'id' | 'createdAt'> {}
export interface UpdateStudentDTO extends Partial<CreateStudentDTO> { id: string }

export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  pendingStudents: number;
  inactiveStudents: number;
  monthlyRecurringRevenue: number;
}

export interface AgendaEvent { id: string; title: string; startsAt: string; endsAt?: string; studentIds?: string[]; }
export interface WorkoutPlan { id: string; studentId?: string; title: string; status: string; }
export interface DietPlan { id: string; studentId?: string; title: string; status: string; }

export type FinancialEntryType = 'revenue' | 'expense';
export type FinancialEntryStatus = 'paid' | 'pending' | 'overdue' | 'cancelled' | 'draft';

export interface FinancialAttachmentDTO {
  id?: string;
  fileName: string;
  contentType?: string;
  url?: string;
}

export interface FinancialEntry {
  id: string;
  type: FinancialEntryType;
  name: string;
  description?: string;
  category: string;
  counterpartyName: string;
  amount: number;
  paymentMethod: string;
  date: string;
  accrualMonth: string;
  status: FinancialEntryStatus;
  notes?: string;
  attachments: FinancialAttachmentDTO[];
  responsibleUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialEntryInput extends Omit<FinancialEntry, 'id' | 'createdAt' | 'updatedAt'> {}
export interface FinancialEntryFilters { type?: FinancialEntryType; status?: FinancialEntryStatus; query?: string; page?: number; pageSize?: number; sortBy?: keyof FinancialEntry; sortDirection?: 'asc' | 'desc'; }

export interface FinancialSummary {
  totalRevenue: number;
  totalExpense: number;
  netProfit: number;
  currentBalance: number;
  cashFlow: { inflow: number; outflow: number; balance: number };
}

export interface ReportSummary { id: string; title: string; value: number | string; }
export interface ReportDefinition { id: string; title: string; description: string; endpoint: string; exportFormats: Array<'pdf' | 'xlsx' | 'csv'>; }
