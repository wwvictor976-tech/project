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

export interface AgendaEvent { id: string; title: string; startsAt: string; endsAt?: string; }
export interface WorkoutPlan { id: string; studentId?: string; title: string; status: string; }
export interface DietPlan { id: string; studentId?: string; title: string; status: string; }
export interface Transaction { id: string; description: string; amount: number; status: string; }
export interface ReportSummary { id: string; title: string; value: number | string; }
