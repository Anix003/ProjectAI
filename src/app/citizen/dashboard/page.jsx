'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { account } from '@/lib/appwrite';
import { 
  LayoutDashboard, 
  FileText, 
  User, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  FileUp, 
  MessageSquare, 
  HelpCircle, 
  Menu, 
  X, 
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

export default function CitizenDashboardPage() {
  const router = useRouter();
  
  // Dashboard states
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const currentDate = useMemo(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  }, []);

  // Fetch citizen info from custom JWT endpoint or Appwrite
  useEffect(() => {
    async function loadCitizenSession() {
      try {
        // 1. Try to load user session from custom API cookie
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser({
              name: data.user.name,
              email: data.user.email,
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Custom backend session not found. Checking Appwrite session...');
      }

      try {
        // 2. Try to load session from Appwrite Client (for Google OAuth)
        const appwriteUser = await account.get();
        setUser({
          name: appwriteUser.name,
          email: appwriteUser.email,
        });
      } catch (err) {
        console.error('No active session found. Redirecting to login...');
        router.push('/citizen/login');
        router.refresh();
      } finally {
        setLoading(false);
      }
    }

    loadCitizenSession();
  }, [router]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // 1. Clear local custom JWT cookie
      await fetch('/api/auth/logout');
      
      // 2. Clear Appwrite sessions if any
      try {
        await account.deleteSession('current');
      } catch (e) {
        // Safe to ignore if Appwrite session wasn't active
      }
      
      router.push('/citizen/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b19] flex flex-col items-center justify-center select-none relative">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/20 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/15 blur-[120px] pointer-events-none" />
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4 animate-spin">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>
        </div>
        <p className="text-slate-400 text-sm font-semibold animate-pulse">Initializing Portal Session...</p>
      </div>
    );
  }

  // Mock application data
  const mockApplications = [
    { id: 'APP-2026-081', name: 'Housing Allowance Subsidy', type: 'Financial Aid', status: 'Under Review', date: 'May 18, 2026', color: 'border-amber-500 bg-amber-500/10 text-amber-300' },
    { id: 'APP-2026-042', name: 'Solar Panel Grid Grant', type: 'Infrastructure', status: 'Approved', date: 'May 12, 2026', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
    { id: 'APP-2026-015', name: 'Municipal Resident Permit', type: 'Documentation', status: 'Action Required', date: 'Apr 28, 2026', color: 'border-rose-500 bg-rose-500/10 text-rose-300' }
  ];

  // Mock notification list
  const mockNotifications = [
    { id: 1, message: 'Solar Panel Grid Grant application has been approved!', time: '2 hours ago', type: 'success' },
    { id: 2, message: 'Additional proof of address is required for resident permit.', time: '1 day ago', type: 'warning' },
    { id: 3, message: 'Welcome to the Civic AI portal! Set up your profile configuration.', time: '3 days ago', type: 'info' }
  ];

  return (
    <div className="min-h-screen bg-[#070b19] flex text-slate-100 font-sans overflow-hidden">
      
      {/* Sidebar background overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-30 transition-transform duration-300 transform md:translate-x-0 md:relative ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-0 hidden md:flex'
      } flex flex-col justify-between`}>
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50">
            <Link href="/citizen/dashboard" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-wide">
                Civic <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI</span>
              </span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1 text-slate-400 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <button 
              onClick={() => setCurrentTab('dashboard')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                currentTab === 'dashboard' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </button>

            <button 
              onClick={() => setCurrentTab('applications')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition ${
                currentTab === 'applications' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <FileText className="h-5 w-5" />
                <span>My Applications</span>
              </div>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-bold">3</span>
            </button>

            <button 
              onClick={() => setCurrentTab('profile')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                currentTab === 'profile' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <User className="h-5 w-5" />
              <span>Profile</span>
            </button>

            <button 
              onClick={() => setCurrentTab('settings')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                currentTab === 'settings' 
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <SettingsIcon className="h-5 w-5" />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-violet-500/10">
              {user ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'C'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition duration-150 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-10">
        
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/35 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1 text-slate-400 hover:text-white md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h2 className="text-lg font-bold text-white capitalize hidden sm:block">Citizen dashboard</h2>
          </div>
          
          {/* Header Actions */}
          <div className="flex items-center gap-4">
            {/* Date Display */}
            <div className="hidden lg:flex items-center gap-2 text-slate-400 text-xs font-semibold bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
              <Calendar className="h-4 w-4 text-violet-400" />
              <span>{currentDate}</span>
            </div>
            
            {/* Notification Bell */}
            <button className="p-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 rounded-xl relative transition">
              <Bell className="h-5 w-5 text-slate-300 hover:text-white" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-violet-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Dashboard Pages wrapper */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8 flex-grow">
          
          {/* Welcome Banner */}
          <div className="rounded-2xl bg-gradient-to-r from-violet-950/40 via-slate-900/80 to-cyan-950/20 border border-slate-800/80 p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-800/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Welcome back, {user?.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-400 text-sm max-w-xl">
                Submit claims, track active application statuses, and manage your civic profile config. Powered by Civic AI.
              </p>
            </div>
            <button 
              onClick={() => setCurrentTab('applications')}
              className="bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 text-white font-semibold px-5 py-3 rounded-xl shadow-lg shadow-violet-500/10 flex items-center gap-2 group shrink-0 transition duration-150 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              <span>New Application</span>
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            
            {/* Left and Middle Columns (Dashboard Content) */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Submitted</span>
                    <FileText className="h-5 w-5 text-violet-400" />
                  </div>
                  <span className="text-2xl font-black text-white">3</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                  </div>
                  <span className="text-2xl font-black text-white">1</span>
                </div>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between h-28">
                  <div className="flex justify-between items-center text-slate-400">
                    <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-2xl font-black text-white">1</span>
                </div>
              </div>

              {/* My Applications Placeholder Section */}
              <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-white">Active Applications</h3>
                  <button 
                    onClick={() => setCurrentTab('applications')}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 group transition"
                  >
                    <span>View all</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition duration-150" />
                  </button>
                </div>
                
                {/* Applications List */}
                <div className="space-y-4">
                  {mockApplications.map((app) => (
                    <div 
                      key={app.id}
                      className="bg-slate-950/40 hover:bg-slate-950/80 border border-slate-900 hover:border-slate-800 p-4 rounded-xl flex items-center justify-between transition duration-150"
                    >
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-white truncate mb-1">{app.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                          <span>{app.id}</span>
                          <span>•</span>
                          <span>{app.type}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${app.color}`}>
                          {app.status}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:block">{app.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column (Notifications & Quick Actions) */}
            <div className="space-y-6 md:space-y-8">
              
              {/* Notifications Widget */}
              <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-violet-400" />
                  <span>Recent Alerts</span>
                </h3>
                <div className="space-y-3.5">
                  {mockNotifications.map((notif) => (
                    <div key={notif.id} className="text-sm flex gap-3 pb-3.5 border-b border-slate-800/50 last:border-b-0 last:pb-0">
                      {notif.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />}
                      {notif.type === 'warning' && <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />}
                      {notif.type === 'info' && <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />}
                      <div className="space-y-1">
                        <p className="text-slate-300 leading-snug">{notif.message}</p>
                        <span className="text-slate-500 text-xs font-medium block">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="backdrop-blur-xl bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-5">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  <span>Quick Actions</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex flex-col items-center gap-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl text-center transition group cursor-pointer outline-none">
                    <FileUp className="h-6 w-6 text-violet-400 group-hover:scale-105 transition" />
                    <span className="text-xs font-bold text-slate-300">Upload Doc</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl text-center transition group cursor-pointer outline-none">
                    <MessageSquare className="h-6 w-6 text-cyan-400 group-hover:scale-105 transition" />
                    <span className="text-xs font-bold text-slate-300">Support Chat</span>
                  </button>
                  
                  <button className="flex flex-col items-center gap-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl text-center transition group cursor-pointer outline-none">
                    <User className="h-6 w-6 text-emerald-400 group-hover:scale-105 transition" />
                    <span className="text-xs font-bold text-slate-300">Verify KYC</span>
                  </button>

                  <button className="flex flex-col items-center gap-2 bg-slate-950/40 hover:bg-slate-950 border border-slate-900 hover:border-slate-800 p-3.5 rounded-xl text-center transition group cursor-pointer outline-none">
                    <SettingsIcon className="h-6 w-6 text-amber-400 group-hover:scale-105 transition" />
                    <span className="text-xs font-bold text-slate-300">Preferences</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <footer className="h-14 border-t border-slate-800/80 bg-slate-950/30 flex items-center justify-between px-8 text-xs text-slate-500 mt-auto font-semibold">
          <span>&copy; 2026 Civic AI. All rights reserved.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-300">Terms of Service</Link>
          </div>
        </footer>

      </main>
    </div>
  );
}
