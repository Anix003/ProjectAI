"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { databases } from "@/lib/appwrite-client";
import { Query, ID } from "appwrite";
import logo from "@/assets/images/civiclogo.png";
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  Settings,
  LogOut,
  MapPin,
  User,
  ShieldAlert,
  Award,
  Briefcase,
  Activity,
  Check,
  UserCheck,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [officerApps, setOfficerApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const complRes = await databases.listDocuments(
          databaseId,
          "complaints",
          [Query.limit(100)],
        );
        setComplaints(complRes.documents);

        const deptRes = await databases.listDocuments(
          databaseId,
          "departments",
          [Query.limit(100)],
        );
        setDepartments(deptRes.documents);

        const appsRes = await databases.listDocuments(
          databaseId,
          "OfficerApplications",
          [Query.limit(100)],
        );
        setOfficerApps(appsRes.documents);
      } catch (err) {
        console.error("Error fetching admin data:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAdminData();
  }, [databaseId]);

  const handleApproveOfficer = async (appId, adminId) => {
    try {
      // 1. Update Application status
      await databases.updateDocument(databaseId, "OfficerApplications", appId, {
        status: "Approved",
      });

      // 2. Set Admin status active
      await databases.updateDocument(databaseId, "admin", adminId, {
        is_active: true,
      });

      // Update state locally
      setOfficerApps((prev) =>
        prev.map((app) =>
          app.$id === appId ? { ...app, status: "Approved" } : app,
        ),
      );
      alert("Officer account verified and approved successfully.");
    } catch (err) {
      alert(`Approval failed: ${err.message}`);
    }
  };

  const pendingApps = officerApps.filter((a) => a.status === "Pending");
  const activeComplaints = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Rejected",
  );

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 rounded-xl flex items-center justify-center font-black text-white text-xl">
              <Image
                src={logo}
                alt="logo"
                fill
                className="w-10 h-10 object-contain"
              />
            </div>
            <span className="font-black text-lg tracking-tight uppercase">
              Civic AI
            </span>
            <span className="bg-purple-600/10 text-purple-400 text-[9px] font-bold px-2 py-0.5 rounded border border-purple-500/20 ml-2 uppercase">
              Admin Console
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button> */}
            <div className="h-8 w-[1px] bg-white/10" />
            <button
              onClick={() => logout()}
              className="bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white font-bold text-xs py-2 px-4 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Panel */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8 relative">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-2">
          {[
            { id: "overview", label: "Dashboard Overview", icon: Activity },
            { id: "complaints", label: "Active Complaints", icon: FileText },
            {
              id: "applications",
              label: "Officer Applications",
              icon: UserCheck,
              badge: pendingApps.length,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-between transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                    : "bg-slate-900/40 hover:bg-slate-900 text-gray-400 hover:text-white border border-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </div>
                {tab.badge > 0 && (
                  <span className="bg-rose-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Tab Content */}
        <section className="flex-1">
          {isLoading ? (
            <div className="h-[300px] w-full flex items-center justify-center text-xs text-gray-500 font-bold border border-white/5 rounded-2xl bg-slate-900/15">
              <Clock className="w-4 h-4 animate-spin text-blue-500 mr-2" />
              Loading admin dashboard data...
            </div>
          ) : activeTab === "overview" ? (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Active Complaints
                  </span>
                  <p className="text-2xl font-black text-white">
                    {activeComplaints.length}
                  </p>
                </div>
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Total Departments
                  </span>
                  <p className="text-2xl font-black text-white">
                    {departments.length}
                  </p>
                </div>
                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">
                    Officer Applications
                  </span>
                  <p className="text-2xl font-black text-white">
                    {officerApps.length}
                  </p>
                </div>
              </div>

              {/* Quick Queue */}
              <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-white">
                  System Health & Summary
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Civic AI is functioning as normal. You have{" "}
                  <strong className="text-rose-400">
                    {pendingApps.length} pending officer applications
                  </strong>{" "}
                  that require manual validation of physical proof documents
                  before department access credentials can be granted.
                </p>
              </div>
            </div>
          ) : activeTab === "complaints" ? (
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  System Grievance Registry
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Comprehensive view of all grievances registered on the
                  platform.
                </p>
              </div>

              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto pr-1">
                {complaints.map((c) => (
                  <div
                    key={c.$id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-0.5 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-gray-500">
                          {c.id_complaint}
                        </span>
                        <span className="text-[8px] bg-slate-800 text-gray-400 px-1.5 py-0.25 rounded">
                          {c.ai_category}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate">
                        {c.complaint_title}
                      </h4>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 border border-white/5 rounded-full bg-slate-950 flex-shrink-0">
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Municipal Officer Registration Queue
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Approve or reject credentials for municipal officers on the
                  grid.
                </p>
              </div>

              {pendingApps.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <ShieldCheck className="w-10 h-10 text-gray-600 mb-2" />
                  <h3 className="font-bold text-xs text-gray-400">
                    Queue is Clear
                  </h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    No pending officer applications require verification.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApps.map((app) => (
                    <div
                      key={app.$id}
                      className="bg-slate-950 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-gray-500 uppercase">
                          {app.application_id}
                        </span>
                        <h4 className="font-bold text-xs text-white">
                          Identity Proof Validation Required
                        </h4>
                        <p className="text-[10px] text-gray-400">
                          Proof type:{" "}
                          <strong className="text-gray-300">
                            {app.identity_proof}
                          </strong>
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleApproveOfficer(app.$id, app.id_admin)
                        }
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-2 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all self-end sm:self-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Approve Credentials
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
