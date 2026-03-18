// src/components/layout/Layout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNav from './MobileNav';

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}