import { RouterProvider } from 'react-router-dom';

import { AppProviders } from '@/app/providers/Providers';
import { router } from '@/app/router';

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}