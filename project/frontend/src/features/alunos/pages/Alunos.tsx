import { useCallback, useState } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { NovoAlunoModal, type NewAlunoFormData } from '@/components/ui/NovoAlunoModal';
import { studentsService } from '@/services/students.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Alunos() {
  const [open, setOpen] = useState(false);
  const loadStudents = useCallback(async () => (await studentsService.list()).data, []);
  const state = useResourceState(loadStudents, [], (items) => items.length === 0);
  const handleSubmit = async (_data: NewAlunoFormData) => setOpen(false);

  return <><ResourcePage title="Alunos" description="Cadastros, filtros e ações de relacionamento com alunos." status={state.status} emptyTitle="Nenhum aluno cadastrado" emptyDescription="Quando o backend for integrado, alunos cadastrados aparecerão aqui com busca, filtros, paginação e ações." actionLabel="Novo Aluno" onAction={() => setOpen(true)} /><NovoAlunoModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} /></>;
}
