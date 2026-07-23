import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { StateView } from '@/components/feedback/StateView';

export default function StudentWorkspace() {
  const { id } = useParams<{ id: string }>();
  return <main className="mx-auto max-w-[1200px] space-y-5 pb-8"><Link to={ROUTES.alunos} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> Voltar para alunos</Link><StateView status="empty" title="Aluno não carregado" description={`O cadastro solicitado${id ? ` (${id})` : ''} será carregado pela camada de serviços quando o backend estiver disponível.`} /></main>;
}
