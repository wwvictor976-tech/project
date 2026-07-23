import { useCallback } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { reportsService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Relatorios() {
  const load = useCallback(async () => (await reportsService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  return <ResourcePage title="Relatórios" description="Análises operacionais e indicadores estratégicos." status={state.status} emptyTitle="Nenhum relatório disponível" emptyDescription="Relatórios reais serão renderizados quando houver dados analíticos vindos do backend." />;
}
