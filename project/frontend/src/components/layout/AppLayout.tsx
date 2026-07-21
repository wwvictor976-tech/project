import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <div className="p-5 sm:p-6 max-w-[1200px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
