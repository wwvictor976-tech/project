import { emptyResponse } from '@/services/base.service';
import type { AgendaEvent, ApiResponse, DietPlan, ReportSummary, Transaction, WorkoutPlan } from '@/types/domain';

export const agendaService = { list: (): Promise<ApiResponse<AgendaEvent[]>> => emptyResponse([]) };
export const workoutsService = { list: (): Promise<ApiResponse<WorkoutPlan[]>> => emptyResponse([]) };
export const dietsService = { list: (): Promise<ApiResponse<DietPlan[]>> => emptyResponse([]) };
export const financeService = { list: (): Promise<ApiResponse<Transaction[]>> => emptyResponse([]) };
export const reportsService = { list: (): Promise<ApiResponse<ReportSummary[]>> => emptyResponse([]) };
export const usersService = { current: () => emptyResponse(null) };
export const authService = { login: async () => { throw new Error('auth.login: backend não implementado'); }, logout: async () => undefined };
