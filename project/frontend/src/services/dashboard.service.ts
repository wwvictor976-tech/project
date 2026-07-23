import { emptyResponse } from '@/services/base.service';
import type { ApiResponse, DashboardSummary } from '@/types/domain';

export const dashboardService = {
  summary: (): Promise<ApiResponse<DashboardSummary>> => emptyResponse({ totalStudents: 0, activeStudents: 0, pendingStudents: 0, inactiveStudents: 0, monthlyRecurringRevenue: 0 }),
};
