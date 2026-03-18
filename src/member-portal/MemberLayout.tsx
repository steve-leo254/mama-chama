// src/components/member-portal/MemberLayout.tsx
import { Outlet } from 'react-router-dom';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';
import MemberMobileNav from './MemberMobileNav';

export default function MemberLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <MemberSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <MemberHeader />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MemberMobileNav />
    </div>
  );
}