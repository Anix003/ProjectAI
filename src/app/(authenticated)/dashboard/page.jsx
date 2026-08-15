'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogOut } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import CitizenPage from '@/components/dashboard/CitizenPage';
import OfficerPage from '@/components/dashboard/OfficerPage';
import AdminPage from '@/components/dashboard/AdminPage';
import SuperAdminPage from '@/components/dashboard/SuperAdminPage';

export default function DashboardRouter() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute rounded-full h-10 w-10 bg-slate-900 flex items-center justify-center text-[10px] text-blue-400 font-bold">AUTH</div>
        </div>
        <p className="mt-4 text-xs text-gray-400 font-medium tracking-wider uppercase animate-pulse">Hydrating credentials...</p>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const role = user.role;

  if (role === 'Super Admin') {
    return <SuperAdminPage />;
  } else if (role === 'Admin' || role === 'Authority') {
    return <AdminPage />;
  } else if (role === 'Officer') {
    // Render pending approval page if the officer is not active
    const isActive = user.profileDetails?.is_active;
    if (!isActive) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
          <div className="max-w-md w-full bg-slate-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
            <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Officer Approval Pending</h1>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Your officer account for Civic AI has been registered. Your uploaded proof documents and office details are awaiting validation from the administrative staff.
            </p>
            <button
              onClick={() => logout()}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs py-2 px-4 rounded-xl transition-all flex items-center gap-2 mx-auto"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      );
    }
    return <OfficerPage />;
  } else {
    // Default to Citizen Page
    return <CitizenPage />;
  }
}
