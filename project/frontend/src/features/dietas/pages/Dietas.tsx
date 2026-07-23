import { useCallback, useState } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { NovaDietaModal, type NewDietFormData } from '@/components/ui/NovaDietaModal';
import { dietsService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Dietas() {
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => (await dietsService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  const handleSubmit = (_data: NewDietFormData) => setOpen(false);
  return <><ResourcePage title="Dietas" description="Planos alimentares, metas e status nutricional." status={state.status} emptyTitle="Nenhuma dieta criada" emptyDescription="Planos alimentares reais serão exibidos após a integração com o backend." actionLabel="Nova Dieta" onAction={() => setOpen(true)} /><NovaDietaModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} /></>;
}
