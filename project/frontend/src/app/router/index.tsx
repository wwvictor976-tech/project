import { createBrowserRouter, Navigate } from 'react-router-dom';

import Auth from '@/features/auth/pages/Auth';
import ResetPassword from '@/features/auth/pages/ResetPassword';
import { ROUTES } from '@/constants/routes';

export const router = createBrowserRouter([
  {
    path: ROUTES.root,
    element: <Auth />,
  },
  {
    path: ROUTES.resetPassword,
    element: <ResetPassword />,
  },
  {
    path: '*',
    element: <Navigate to={ROUTES.root} replace />,
  },
]);
