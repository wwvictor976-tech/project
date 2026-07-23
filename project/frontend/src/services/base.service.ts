import type { ApiResponse } from '@/types/domain';

export const emptyResponse = <T>(data: T): Promise<ApiResponse<T>> => Promise.resolve({ data });
