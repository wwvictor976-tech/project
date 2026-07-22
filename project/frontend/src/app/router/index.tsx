import { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { ROUTES } from '@/constants/routes';
import FullPageLoader from '@/components/ui/FullPageLoader';

const Auth = lazy(() => import('@/features/auth/pages/Auth'));
const ResetPassword = lazy(() => import('@/features/auth/pages/ResetPassword'));
const Dashboard = lazy(() => import('@/features/dashboard/pages/Dashboard'));
const Alunos = lazy(() => import('@/features/alunos/pages/Alunos'));
const StudentWorkspace = lazy(() => import('@/pages/StudentWorkspace'));
const Agenda = lazy(() => import('@/features/agenda/pages/Agenda'));
const Financeiro = lazy(() => import('@/features/financeiro/pages/Financeiro'));
const Relatorios = lazy(() => import('@/features/Relatorio/pages/Relatorios'));
const Dietas = lazy(() => import('@/features/dietas/pages/Dietas'));
const Perfil = lazy(() => import('@/features/perfil/pages/Perfi'));
const Configuracoes = lazy(() => import('@/features/configuracoes/pages/configuracoes'));
const Help = lazy(() => import('@/features/help/pages/Help'));
const Treinos = lazy(() => import('@/features/treinos/pages/Treinos'));
const Planos = lazy(() => import('@/features/planos/pages/Planos'));

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <Auth />
      </Suspense>
    ),
  },
  {
    path: ROUTES.resetPassword,
    element: (
      <Suspense fallback={<FullPageLoader />}>
        <ResetPassword />
      </Suspense>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: ROUTES.dashboard,    element: (<Suspense fallback={<FullPageLoader />}><Dashboard /></Suspense>) },
          { path: ROUTES.alunos,       element: (<Suspense fallback={<FullPageLoader />}><Alunos /></Suspense>) },
          { path: ROUTES.aluno,        element: (<Suspense fallback={<FullPageLoader />}><StudentWorkspace /></Suspense>) },
          { path: ROUTES.agenda,       element: (<Suspense fallback={<FullPageLoader />}><Agenda /></Suspense>) },
          { path: ROUTES.financeiro,   element: (<Suspense fallback={<FullPageLoader />}><Financeiro /></Suspense>) },
          { path: ROUTES.relatorios,   element: (<Suspense fallback={<FullPageLoader />}><Relatorios /></Suspense>) },
          { path: ROUTES.dietas,       element: (<Suspense fallback={<FullPageLoader />}><Dietas /></Suspense>) },
          { path: ROUTES.treinos,      element: (<Suspense fallback={<FullPageLoader />}><Treinos /></Suspense>) },
          { path: ROUTES.planos,       element: (<Suspense fallback={<FullPageLoader />}><Planos /></Suspense>) },
          { path: ROUTES.perfil,       element: (<Suspense fallback={<FullPageLoader />}><Perfil /></Suspense>) },
          { path: ROUTES.configuracoes, element: (<Suspense fallback={<FullPageLoader />}><Configuracoes /></Suspense>) },
          { path: ROUTES.ajuda,        element: (<Suspense fallback={<FullPageLoader />}><Help /></Suspense>) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.root} replace />,
  },
]);
