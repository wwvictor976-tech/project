import { useCallback, useState } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { NovoTreinoModal, type NewWorkoutFormData } from '@/components/ui/NovoTreinoModal';
import { workoutsService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Treinos() {
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => (await workoutsService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  const handleSubmit = (_data: NewWorkoutFormData) => setOpen(false);
  return <><ResourcePage title="Treinos" description="Prescrições, fichas e acompanhamento de treino." status={state.status} emptyTitle="Nenhum treino criado" emptyDescription="Fichas de treino serão listadas quando existirem registros reais no backend." actionLabel="Novo Treino" onAction={() => setOpen(true)} /><NovoTreinoModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} /></>;
}
