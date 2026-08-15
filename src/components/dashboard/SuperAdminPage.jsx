'use client';

import React, { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import useTheme from '@/hooks/useTheme';
import useRoleDashboardTab from '@/hooks/useRoleDashboardTab';
import IndiaMap from '@/components/map/IndiaMap';
import StateStats from '@/components/map/StateStats';
import { databases } from '@/lib/appwrite-client';
import { Query, ID } from 'appwrite';
import { 
  Users, Settings, Brain, FileText, Activity, LogOut, 
  Map, UserCheck, Plus, CheckCircle, Settings2, Trash2, Award,
  Sun, Moon
} from 'lucide-react';

const TAB_MAP = {
  overview: 'Platform Overview',
  complaints: 'All Grievances',
  departments: 'Departments & Regions',
  users: 'Users & Permissions',
  aiops: 'AI Operations'
};

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { activeTab, activeView, setActiveTab } = useRoleDashboardTab(TAB_MAP, 'overview');

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [officerApps, setOfficerApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptPhone, setDeptPhone] = useState('');
  const [deptEmail, setDeptEmail] = useState('');
  const [activeProvider, setActiveProvider] = useState('gemini');

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const complRes = await databases.listDocuments(databaseId, 'complaints', [Query.limit(100)]);
        setComplaints(complRes.documents);

        const deptRes = await databases.listDocuments(databaseId, 'departments', [Query.limit(100)]);
        setDepartments(deptRes.documents);

        const userRes = await databases.listDocuments(databaseId, 'users', [Query.limit(100)]);
        setUsersList(userRes.documents);

        const appsRes = await databases.listDocuments(databaseId, 'OfficerApplications', [Query.limit(100)]);
        setOfficerApps(appsRes.documents);
      } catch (err) {
        console.error('Error fetching superadmin data:', err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [databaseId]);

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    if (!deptName || !deptEmail) {
      alert('Department Name and Contact Email are required.');
      return;
    }
    try {
      const code = `DEP00${departments.length + 1}`;
      const newDept = await databases.createDocument(databaseId, 'departments', ID.unique(), {
        id_departments: code,
        departments_name: deptName,
        description: deptDesc,
        contact_phone: deptPhone,
        contact_email: deptEmail
      });
      setDepartments(prev => [...prev, newDept]);
      setDeptName('');
      setDeptDesc('');
      setDeptPhone('');
      setDeptEmail('');
      alert('Department added successfully!');
    } catch (err) {
      alert(`Failed to add department: ${err.message}`);
    }
  };

  const handleSwitchProvider = async (provider) => {
    setActiveProvider(provider);
    alert(`AI Provider switched globally to: ${provider.toUpperCase()}. The AI Server is now routing requests through the ${provider.toUpperCase()} provider.`);
  };

  const handleApproveOfficer = async (appId, adminId) => {
    try {
      await databases.updateDocument(databaseId, 'OfficerApplications', appId, {
        status: 'Approved'
      });
      await databases.updateDocument(databaseId, 'admin', adminId, {
        is_active: true
      });
      setOfficerApps(prev => prev.map(app => app.$id === appId ? { ...app, status: 'Approved' } : app));
      alert('Officer account activated.');
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-base text-text-main font-sans">
      <aside className="w-64 bg-bg-panel border-r border-border-subtle flex flex-col justify-between p-4 sticky top-0 h-screen">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 py-3 border-b border-border-subtle">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-text-main text-lg">S</div>
            <span className="font-extrabold text-sm tracking-tight text-text-main uppercase">Civic AI <span className="text-[10px] text-emerald-400 font-bold block">Super Admin</span></span>
          </div>

          <nav className="space-y-1">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-md transition-all ${
                activeTab === 'overview' ? 'bg-blue-600 text-text-main' : 'text-text-muted hover:bg-bg-panel border border-border-strong text-text-main hover:text-text-main'
              }`}
            >
              <Map className="w-4 h-4" />
              Geospatial Hub
            </button>
            <button 
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-md transition-all ${
                activeTab === 'complaints' ? 'bg-blue-600 text-text-main' : 'text-text-muted hover:bg-bg-panel border border-border-strong text-text-main hover:text-text-main'
              }`}
            >
              <FileText className="w-4 h-4" />
              All Complaints
            </button>
            <button 
              onClick={() => setActiveTab('departments')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-md transition-all ${
                activeTab === 'departments' ? 'bg-blue-600 text-text-main' : 'text-text-muted hover:bg-bg-panel border border-border-strong text-text-main hover:text-text-main'
              }`}
            >
              <Plus className="w-4 h-4" />
              Departments Setup
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-md transition-all ${
                activeTab === 'users' ? 'bg-blue-600 text-text-main' : 'text-text-muted hover:bg-bg-panel border border-border-strong text-text-main hover:text-text-main'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Officer Approvals
              {officerApps.filter(a => a.status === 'Pending').length > 0 && (
                <span className="ml-auto bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded-full">
                  {officerApps.filter(a => a.status === 'Pending').length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('aiops')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-md transition-all ${
                activeTab === 'aiops' ? 'bg-blue-600 text-text-main' : 'text-text-muted hover:bg-bg-panel border border-border-strong text-text-main hover:text-text-main'
              }`}
            >
              <Brain className="w-4 h-4" />
              AI Operation Control
            </button>
          </nav>
        </div>

        <div>
          <div className="p-3 bg-bg-card border border-border-subtle rounded-md mb-4 text-xs">
            <span className="text-text-muted block font-medium">Logged in as</span>
            <span className="font-bold text-text-main block mt-0.5 truncate">{user?.name}</span>
            <span className="text-[10px] text-emerald-400 font-bold block uppercase mt-0.5">Platform Owner</span>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center justify-center gap-2 bg-bg-panel border border-border-strong text-text-main hover:bg-red-900/20 hover:text-red-400 border border-border-subtle text-text-muted font-bold text-xs py-2.5 px-4 rounded-md transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-border-subtle px-6 flex items-center justify-between sticky top-0 bg-bg-base/80 backdrop-blur-md z-30">
          <h2 className="text-base font-extrabold text-text-main tracking-tight">{activeView}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-bg-panel border border-border-strong text-text-main hover:bg-bg-base transition-all cursor-pointer flex items-center justify-center"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
            </button>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-md border border-blue-500/20">
              SuperAdmin System Override Enabled
            </div>
          </div>
        </header>

        <section className="flex-1 p-6 space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-[450px]">
                  <IndiaMap complaints={complaints} onSelectComplaint={() => {}} />
                </div>
              </div>

              <div>
                <StateStats complaints={complaints} />
              </div>
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6">
              <h3 className="text-sm font-bold text-text-main mb-4">Grievance Master Registry</h3>
              {isLoading ? (
                <div className="py-6 flex justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-text-muted">
                    <thead>
                      <tr className="border-b border-border-subtle text-text-muted uppercase text-[9px] tracking-wider">
                        <th className="py-3 px-4">ID</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {complaints.map((c) => (
                        <tr key={c.$id} className="hover:bg-bg-card">
                          <td className="py-3.5 px-4 font-mono font-bold">{c.id_complaint}</td>
                          <td className="py-3.5 px-4 text-text-main font-bold max-w-[250px] truncate">{c.complaint_title}</td>
                          <td className="py-3.5 px-4">{c.ai_category || 'General'}</td>
                          <td className="py-3.5 px-4">{c.priority || 'Medium'}</td>
                          <td className="py-3.5 px-4 text-emerald-400 font-bold">{c.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'departments' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-bold text-text-main">Create New Department</h3>
                
                <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
                  <div>
                    <label className="text-text-muted block mb-1">Department Name</label>
                    <input 
                      type="text" 
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Health & Safety"
                      className="w-full bg-bg-base border border-border-strong rounded-md p-3.5 text-text-main focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted block mb-1">Description</label>
                    <textarea 
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                      placeholder="Handles hospital hygiene, clinics..."
                      className="w-full bg-bg-base border border-border-strong rounded-md p-3.5 text-text-main focus:outline-none"
                      rows="3"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted block mb-1">Contact Phone</label>
                    <input 
                      type="text" 
                      value={deptPhone}
                      onChange={(e) => setDeptPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full bg-bg-base border border-border-strong rounded-md p-3.5 text-text-main focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted block mb-1">Contact Email</label>
                    <input 
                      type="email" 
                      value={deptEmail}
                      onChange={(e) => setDeptEmail(e.target.value)}
                      placeholder="health@civicai.gov.in"
                      className="w-full bg-bg-base border border-border-strong rounded-md p-3.5 text-text-main focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-text-main font-bold py-2.5 rounded-md transition-all">
                    Create Department
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6">
                <h3 className="text-sm font-bold text-text-main mb-4">Active Municipal Departments</h3>
                <div className="space-y-3">
                  {departments.map((d) => (
                    <div key={d.$id} className="p-4 bg-bg-card border border-border-subtle rounded-md flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono text-text-muted font-black">{d.id_departments}</span>
                        <h4 className="font-bold text-sm text-text-main mt-0.5">{d.departments_name}</h4>
                        <p className="text-[10px] text-text-muted mt-1">{d.description}</p>
                      </div>
                      <div className="text-right text-[10px] text-text-muted">
                        <p>{d.contact_email}</p>
                        <p className="mt-0.5">{d.contact_phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6">
              <h3 className="text-sm font-bold text-text-main mb-4">Pending Officer Registration Audits</h3>
              
              {officerApps.filter(a => a.status === 'Pending').length === 0 ? (
                <div className="text-center py-6 text-xs text-text-muted">
                  No pending officer approvals in the queue.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {officerApps.filter(a => a.status === 'Pending').map((app) => (
                    <div key={app.$id} className="bg-bg-card border border-border-subtle rounded-md p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-text-muted font-black">{app.application_id}</span>
                          <h4 className="text-sm font-bold text-text-main mt-1">Pending Officer Claim</h4>
                        </div>
                      </div>
                      <div className="text-xs text-text-muted space-y-1">
                        <p><strong>Office Info:</strong> {app.office_details}</p>
                        <p><strong>Jurisdiction:</strong> {app.region_details}</p>
                      </div>
                      <button 
                        onClick={() => handleApproveOfficer(app.$id, app.id_admin)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-text-main font-bold text-xs py-2 rounded-md transition-all"
                      >
                        Verify & Activate Credentials
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'aiops' && (
            <div className="bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-text-main">Global AI Operations</h3>
                <p className="text-xs text-text-muted mt-0.5">Toggle primary LLM orchestrator and update prompt settings.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div 
                  onClick={() => handleSwitchProvider('gemini')}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    activeProvider === 'gemini' ? 'border-blue-600 bg-blue-600/5' : 'border-border-subtle bg-bg-card hover:border-border-strong'
                  }`}
                >
                  <Brain className="text-blue-400 w-8 h-8 mb-4" />
                  <h4 className="font-bold text-sm text-text-main">Google Gemini</h4>
                  <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                    Uses gemini-1.5-flash. Ideal for image OCR, KYC face matching, and multilingual summarization. (Recommended)
                  </p>
                </div>

                <div 
                  onClick={() => handleSwitchProvider('openai')}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    activeProvider === 'openai' ? 'border-blue-600 bg-blue-600/5' : 'border-border-subtle bg-bg-card hover:border-border-strong'
                  }`}
                >
                  <Award className="text-purple-400 w-8 h-8 mb-4" />
                  <h4 className="font-bold text-sm text-text-main">OpenAI GPT-4o-mini</h4>
                  <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                    Uses gpt-4o-mini. Highly accurate for complex classification, spam filtering, and structured JSON parsing.
                  </p>
                </div>

                <div 
                  onClick={() => handleSwitchProvider('local')}
                  className={`p-5 rounded-lg border cursor-pointer transition-all ${
                    activeProvider === 'local' ? 'border-blue-600 bg-blue-600/5' : 'border-border-subtle bg-bg-card hover:border-border-strong'
                  }`}
                >
                  <Settings2 className="text-amber-400 w-8 h-8 mb-4" />
                  <h4 className="font-bold text-sm text-text-main">Local Llama 3.2</h4>
                  <p className="text-[10px] text-text-muted mt-2 leading-relaxed">
                    Uses local Llama 3.2 model via Ollama. Fully offline, no internet required, zero API costs, and runs locally.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
