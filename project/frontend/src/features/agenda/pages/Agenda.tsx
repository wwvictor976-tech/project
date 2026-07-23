import { useCallback, useState } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { NovoEventoModal, type NovoEventoFormData } from '@/components/ui/NovoEventoModal';
import { agendaService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Agenda() {
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => (await agendaService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  const handleSubmit = (_data: NovoEventoFormData) => setOpen(false);
  return <><ResourcePage title="Agenda" description="Aulas, avaliações e compromissos operacionais." status={state.status} emptyTitle="Agenda sem eventos" emptyDescription="Eventos reais aparecerão aqui após a integração com o backend." actionLabel="Novo Evento" onAction={() => setOpen(true)} /><NovoEventoModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} /></>;
}
