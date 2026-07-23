import type { AgendaEvent, ApiResponse, DietPlan, FinancialEntry, FinancialEntryFilters, FinancialEntryInput, FinancialSummary, ReportDefinition, WorkoutPlan } from '@/types/domain';
import { emptyResponse } from '@/services/base.service';
import { backendNotImplemented } from '@/services/errors';

const financialDefinitions: ReportDefinition[] = [
  { id: 'revenues', title: 'Receitas', description: 'Entradas por período, categoria, status e forma de pagamento.', endpoint: '/reports/revenues', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'expenses', title: 'Despesas', description: 'Saídas por competência, fornecedor, categoria e responsável.', endpoint: '/reports/expenses', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'profit', title: 'Lucro', description: 'Lucro líquido calculado por receitas menos despesas.', endpoint: '/reports/profit', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'cash-flow', title: 'Fluxo de Caixa', description: 'Entradas, saídas e saldo por período.', endpoint: '/reports/cash-flow', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'students', title: 'Alunos', description: 'Cadastros, evolução, planos e relacionamento.', endpoint: '/reports/students', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'enrollments', title: 'Matrículas', description: 'Novas matrículas, cancelamentos e conversão.', endpoint: '/reports/enrollments', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'payments', title: 'Pagamentos', description: 'Pagamentos realizados, pendentes e conciliados.', endpoint: '/reports/payments', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'delinquency', title: 'Inadimplência', description: 'Títulos vencidos e risco financeiro.', endpoint: '/reports/delinquency', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'schedule', title: 'Agenda', description: 'Ocupação, eventos e disponibilidade.', endpoint: '/reports/schedule', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'attendance', title: 'Presença', description: 'Assiduidade e faltas por aluno ou turma.', endpoint: '/reports/attendance', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'teachers', title: 'Professores', description: 'Carga horária, agenda e produtividade.', endpoint: '/reports/teachers', exportFormats: ['pdf', 'xlsx', 'csv'] },
  { id: 'performance', title: 'Performance', description: 'Indicadores operacionais e evolução do negócio.', endpoint: '/reports/performance', exportFormats: ['pdf', 'xlsx', 'csv'] },
];

export const agendaService = { list: (): Promise<ApiResponse<AgendaEvent[]>> => emptyResponse([]) };
export const workoutsService = { list: (): Promise<ApiResponse<WorkoutPlan[]>> => emptyResponse([]) };
export const dietsService = { list: (): Promise<ApiResponse<DietPlan[]>> => emptyResponse([]) };
export const financeService = {
  list: (_filters?: FinancialEntryFilters): Promise<ApiResponse<FinancialEntry[]>> => emptyResponse([]),
  summary: (): Promise<ApiResponse<FinancialSummary>> => emptyResponse({ totalRevenue: 0, totalExpense: 0, netProfit: 0, currentBalance: 0, cashFlow: { inflow: 0, outflow: 0, balance: 0 } }),
  create: async (_payload: FinancialEntryInput): Promise<ApiResponse<FinancialEntry>> => { throw backendNotImplemented('finance.create'); },
  update: async (_id: string, _payload: Partial<FinancialEntryInput>): Promise<ApiResponse<FinancialEntry>> => { throw backendNotImplemented('finance.update'); },
  duplicate: async (_id: string): Promise<ApiResponse<FinancialEntry>> => { throw backendNotImplemented('finance.duplicate'); },
  remove: async (_id: string): Promise<void> => { throw backendNotImplemented('finance.remove'); },
};
export const reportsService = { list: (): Promise<ApiResponse<ReportDefinition[]>> => emptyResponse(financialDefinitions), export: async (_id: string, _format: 'pdf' | 'xlsx' | 'csv'): Promise<Blob> => { throw backendNotImplemented('reports.export'); } };
