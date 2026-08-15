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
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";

export default function OfficerPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
  const deptId = user?.profileDetails?.department_id || "DEP001";

  useEffect(() => {
    const fetchDeptComplaints = async () => {
      if (!deptId) return;
      try {
        const res = await databases.listDocuments(databaseId, "complaints", [
          Query.equal("tableDepartments", deptId),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]);
        setComplaints(res.documents);
      } catch (err) {
        console.error("Error fetching department complaints:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeptComplaints();
  }, [deptId, databaseId]);

  const handleUpdateStatus = async (complaintDocId, complaintId, newStatus) => {
    setIsUpdating(true);
    try {
      const updateData = { status: newStatus };
      if (newStatus === "Resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      // 1. Update Complaint Document
      await databases.updateDocument(
        databaseId,
        "complaints",
        complaintDocId,
        updateData,
      );

      // 2. Create Audit Log
      try {
        await databases.createDocument(databaseId, "audit", ID.unique(), {
          id_audit: `AUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          id_complaint: complaintId,
          action: "Status Updated",
          module: "Complaint",
          target_id: complaintId,
          description: `Officer ${user.name} updated grievance status to ${newStatus}.`,
        });
      } catch (logErr) {
        console.error("Audit logging failed:", logErr.message);
      }

      // Update local state
      setComplaints((prev) =>
        prev.map((c) =>
          c.$id === complaintDocId ? { ...c, ...updateData } : c,
        ),
      );
      if (selectedComplaint && selectedComplaint.$id === complaintDocId) {
        setSelectedComplaint((prev) => ({ ...prev, ...updateData }));
      }

      alert(`Grievance status updated to: ${newStatus}`);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Pending")
      return c.status === "Submitted" || c.status === "Assigned";
    if (activeFilter === "In Progress") return c.status === "In Progress";
    if (activeFilter === "Resolved") return c.status === "Resolved";
    return c.status === activeFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "In Progress":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Critical":
      case "High":
        return "bg-rose-500/10 text-rose-400 border-rose-500/15";
      case "Medium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/15";
      default:
        return "bg-slate-500/10 text-gray-400 border-slate-500/15";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

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
            <span className="bg-blue-600/10 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded border border-blue-500/20 ml-2 uppercase">
              Officer Console
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

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative">
        {/* Left 2 Columns: Lists */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Dashboard Banner */}
          <div className="bg-linear-to-r from-blue-600/10 via-slate-900 to-transparent border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-6 h-6 text-blue-500" />
              <h1 className="text-xl font-bold text-white">
                Welcome back, Officer {user?.name}
              </h1>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Managing grievance queue for Department:{" "}
              <strong className="text-gray-200">{deptId}</strong>. Keep
              resolution times within SLAs and mark actions as completed.
            </p>
          </div>

          {/* Complaints Table/List Card */}
          <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-md font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Department Grievance Queue
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Filter and update complaints assigned to your jurisdiction.
                </p>
              </div>

              {/* Filters */}
              <div className="flex gap-1 bg-slate-950 border border-white/5 rounded-lg p-0.5">
                {["All", "Pending", "In Progress", "Resolved"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`text-[9px] font-bold px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                      activeFilter === filter
                        ? "bg-blue-600 text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-gray-500 font-bold">
                <Clock className="w-4 h-4 animate-spin text-blue-500 mr-2" />
                Loading department queue...
              </div>
            ) : filteredComplaints.length === 0 ? (
              <div className="h-[200px] border border-dashed border-white/5 rounded-xl bg-slate-900/10 flex flex-col items-center justify-center text-center p-6">
                <FileText className="w-10 h-10 text-gray-600 mb-2" />
                <h3 className="font-bold text-xs text-gray-400">
                  Queue is Clear
                </h3>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  No grievances matched your active filter.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredComplaints.map((c) => (
                  <div
                    key={c.$id}
                    onClick={() => setSelectedComplaint(c)}
                    className={`py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 px-3 -mx-3 rounded-xl transition-all ${
                      selectedComplaint?.$id === c.$id ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="space-y-1 pr-4 truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-gray-500">
                          {c.id_complaint}
                        </span>
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${getPriorityBadge(c.priority)}`}
                        >
                          {c.priority || "Medium"}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-white truncate max-w-[280px]">
                        {c.complaint_title}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate max-w-[400px]">
                        {c.ai_summary || c.original_text}
                      </p>
                    </div>

                    <span
                      className={`text-[8px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${getStatusBadge(c.status)}`}
                    >
                      {c.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complaint Inspector / Actions */}
        <div className="space-y-6">
          {selectedComplaint ? (
            <div className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-6 space-y-6 shadow-xl animate-fade-in">
              <div className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[9px] font-mono text-gray-500">
                    {selectedComplaint.id_complaint}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(selectedComplaint.status)}`}
                  >
                    {selectedComplaint.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-sm text-white leading-snug">
                  {selectedComplaint.complaint_title}
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Grievance Description
                  </h4>
                  <p className="text-gray-300 leading-relaxed max-h-[150px] overflow-y-auto pr-1">
                    {selectedComplaint.original_text}
                  </p>
                </div>

                {selectedComplaint.ai_summary && (
                  <div>
                    <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">
                      AI Diagnostics Summary
                    </h4>
                    <p className="text-gray-400 leading-relaxed bg-blue-500/5 border border-blue-500/10 rounded-xl p-3">
                      {selectedComplaint.ai_summary}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-gray-400">
                  <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="truncate">
                    {selectedComplaint.address || "No geo pinned"}
                  </span>
                </div>
              </div>

              {/* Status Update Options */}
              <div className="border-t border-white/5 pt-5 space-y-3">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Update Grievance Action
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        selectedComplaint.$id,
                        selectedComplaint.id_complaint,
                        "In Progress",
                      )
                    }
                    disabled={
                      isUpdating || selectedComplaint.status === "In Progress"
                    }
                    className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Set In Progress
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateStatus(
                        selectedComplaint.$id,
                        selectedComplaint.id_complaint,
                        "Resolved",
                      )
                    }
                    disabled={
                      isUpdating || selectedComplaint.status === "Resolved"
                    }
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-[10px] py-2.5 rounded-xl transition-all cursor-pointer text-center"
                  >
                    Mark Resolved
                  </button>
                </div>
                <button
                  onClick={() =>
                    handleUpdateStatus(
                      selectedComplaint.$id,
                      selectedComplaint.id_complaint,
                      "Rejected",
                    )
                  }
                  disabled={
                    isUpdating || selectedComplaint.status === "Rejected"
                  }
                  className="w-full bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-400 font-bold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center"
                >
                  Reject Complaint
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl p-6 text-center text-xs text-gray-500 font-medium">
              Select a grievance from the queue list to inspect details and
              perform status update actions.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
