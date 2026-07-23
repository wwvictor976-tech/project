import { useCallback } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { dashboardService } from '@/services/dashboard.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Dashboard() {
  const loadSummary = useCallback(async () => (await dashboardService.summary()).data, []);
  const state = useResourceState(loadSummary, null, (summary) => !summary || Object.values(summary).every((value) => value === 0));
  return <ResourcePage title="Painel de Controle" description="Visão executiva de alunos, agenda, receita e evolução operacional." status={state.status} emptyTitle="Dashboard aguardando dados reais" emptyDescription="Os indicadores serão preenchidos assim que a API disponibilizar métricas consolidadas." />;
}
