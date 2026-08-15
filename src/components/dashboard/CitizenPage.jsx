"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import useTheme from "@/hooks/useTheme";
import { databases } from "@/lib/appwrite-client";
import { Query } from "appwrite";
import logo from "@/assets/images/civiclogo.png";
import {
  Plus,
  MessageSquare,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  ChevronRight,
  MapPin,
  User,
  Sun,
  Moon,
} from "lucide-react";
import Image from "next/image";

export default function CitizenPage() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  const kycStatus = (
    user?.profileDetails?.kyc_status || "UNVERIFIED"
  ).toUpperCase();

  const getKYCButtonDetails = () => {
    switch (kycStatus) {
      case "VERIFIED":
        return {
          text: "KYC Verified",
          icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
          border: "border-emerald-500/20",
        };
      case "PENDING":
        return {
          text: "KYC Pending",
          icon: (
            <ShieldAlert className="w-4 h-4 text-amber-400 animate-pulse" />
          ),
          border: "border-amber-500/30",
        };
      default: // UNVERIFIED
        return {
          text: "Verify KYC",
          icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
          border: "border-rose-500/20",
        };
    }
  };

  const kycDetails = getKYCButtonDetails();

  useEffect(() => {
    const fetchUserComplaints = async () => {
      if (!user) return;
      try {
        const res = await databases.listDocuments(databaseId, "complaints", [
          Query.equal("tableUsers", user.$id),
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]);
        setComplaints(res.documents);
      } catch (err) {
        console.error("Error fetching user complaints:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserComplaints();
  }, [user, databaseId]);

  const filteredComplaints = complaints.filter((c) => {
    if (filterStatus === "All") return true;
    if (filterStatus === "Active")
      return c.status !== "Resolved" && c.status !== "Rejected";
    if (filterStatus === "Resolved") return c.status === "Resolved";
    return c.status === filterStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "Submitted":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

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
          </div>

          <div className="flex items-center gap-4">
            {/* <button
              onClick={toggleTheme}
              className="p-2 hover:bg-slate-900 rounded-xl transition-colors cursor-pointer text-gray-400 hover:text-white"
              title="Toggle Theme"
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8 relative">
        {/* Welcome Section */}
        <div className="bg-linear-to-r from-blue-600/10 via-indigo-600/5 to-transparent border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <User className="text-blue-500 w-6 h-6" />
              Welcome back, {user?.name || "Citizen"}
            </h1>
            <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
              File new complaints, check status of past grievances, verify your
              identity profile, or consult with our AI assistant for local
              guidance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/citizen/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-5 rounded-xl transition-all shadow-lg shadow-blue-500/15 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              File Grievance
            </button>
            <button
              onClick={() => router.push("/citizen/chat")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-5 rounded-xl border border-white/5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Cosmos AI Chat
            </button>
            <button
              onClick={() => router.push("/citizen/kyc")}
              className={`bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-5 rounded-xl border ${kycDetails.border} transition-all flex items-center gap-1.5 cursor-pointer`}
            >
              {kycDetails.icon}
              {kycDetails.text}
            </button>
          </div>
        </div>

        {/* Complaints Grid Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <FileText className="text-blue-500 w-5 h-5" />
                Your Registered Grievances
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Overview of complaints you filed on the portal.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-slate-950 border border-white/5 rounded-xl">
              {["All", "Active", "Resolved", "Submitted"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterStatus === status
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="h-[250px] w-full flex items-center justify-center text-xs text-gray-500 font-bold border border-white/5 rounded-2xl bg-slate-900/10">
              <Clock className="w-4 h-4 animate-spin text-blue-500 mr-2" />
              Loading complaints queue...
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div className="h-[250px] w-full border border-dashed border-white/5 rounded-2xl bg-slate-900/10 flex flex-col items-center justify-center text-center p-6">
              <FileText className="w-12 h-12 text-gray-600 mb-3" />
              <h3 className="font-bold text-sm text-gray-400">
                No Grievances Found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mt-1">
                You have not filed any grievances matching this filter. Click
                &quot;File Grievance&quot; above to submit one.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComplaints.map((c) => (
                <div
                  key={c.$id}
                  onClick={() =>
                    router.push(`/citizen/complaint/${c.id_complaint}`)
                  }
                  className="bg-slate-900/40 border border-white/10 backdrop-blur-md rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-md group relative overflow-hidden cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-bold text-gray-500 tracking-wider">
                        {c.id_complaint}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(c.status)}`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {c.complaint_title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">
                      {c.ai_summary || c.original_text}
                    </p>
                  </div>

                  <div className="border-t border-white/5 mt-4 pt-4 flex justify-between items-center text-[10px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate max-w-[150px]">
                        {c.address || "Address unpinned"}
                      </span>
                    </div>
                    {c.priority && (
                      <span
                        className={`font-bold ${c.priority === "Critical" ? "text-rose-400" : "text-amber-400"}`}
                      >
                        {c.priority}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
