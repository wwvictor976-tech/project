import { useCallback, useState } from 'react';
import { ResourcePage } from '@/components/shared/ResourcePage';
import { NovoFaturamentoModal, type NewTransactionFormData } from '@/components/ui/NovoFaturamentoModal';
import { financeService } from '@/services/resources.service';
import { useResourceState } from '@/hooks/useResourceState';

export default function Financeiro() {
  const [open, setOpen] = useState(false);
  const load = useCallback(async () => (await financeService.list()).data, []);
  const state = useResourceState(load, [], (items) => items.length === 0);
  const handleSubmit = (_data: NewTransactionFormData) => setOpen(false);
  return <><ResourcePage title="Financeiro" description="Receitas, despesas, status de cobrança e conciliação." status={state.status} emptyTitle="Nenhuma movimentação financeira" emptyDescription="Transações reais serão exibidas quando a camada de serviços for conectada ao backend." actionLabel="Novo Lançamento" onAction={() => setOpen(true)} /><NovoFaturamentoModal isOpen={open} onClose={() => setOpen(false)} onSubmit={handleSubmit} /></>;
}
