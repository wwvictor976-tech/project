import { emptyResponse } from '@/services/base.service';
import type { ApiResponse, CreateStudentDTO, Student, UpdateStudentDTO } from '@/types/domain';
import { backendNotImplemented } from './errors';

export const studentsService = {
  list: (): Promise<ApiResponse<Student[]>> => emptyResponse([]),
  getById: async (_id: string): Promise<ApiResponse<Student | null>> => emptyResponse(null),
  create: async (_payload: CreateStudentDTO): Promise<ApiResponse<Student>> => { throw backendNotImplemented('students.create'); },
  update: async (_payload: UpdateStudentDTO): Promise<ApiResponse<Student>> => { throw backendNotImplemented('students.update'); },
  remove: async (_id: string): Promise<void> => { throw backendNotImplemented('students.remove'); },
};
