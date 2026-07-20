import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-fine">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
