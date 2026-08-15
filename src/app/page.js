"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { databases } from "@/lib/appwrite-client";
import { Query } from "appwrite";
import IndiaMap from "@/components/map/IndiaMap";
import StateStats from "@/components/map/StateStats";
import {
  Brain,
  ShieldCheck,
  Map,
  ArrowRight,
  MessageSquare,
  Users,
  Award,
  Lock,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  useEffect(() => {
    const fetchPublicComplaints = async () => {
      try {
        const res = await databases.listDocuments(databaseId, "complaints", [
          Query.limit(50),
          Query.orderDesc("$createdAt"),
        ]);
        setComplaints(res.documents);
      } catch (err) {
        console.error("Error fetching public complaints:", err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublicComplaints();
  }, [databaseId]);

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans flex flex-col selection:bg-blue-600/30">
      {/* Premium Gradient Backgrounds */}
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-150 h-150 bg-purple-500/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Floating Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              C
            </div>
            <span className="font-black text-lg tracking-tight text-white uppercase">
              Civic AI
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/login")}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Officer Access
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-2 px-4.5 rounded-xl transition-all shadow-md shadow-blue-500/15 flex items-center gap-1 cursor-pointer"
            >
              Citizen Portal
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Intro */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 text-center space-y-6 relative">
        <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black tracking-widest uppercase px-3.5 py-1.5 rounded-full border border-blue-500/20">
          Smart Governance Platform
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
          Modernizing India&apos;s Grievance Redressal with{" "}
          <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-400 via-indigo-400 to-purple-400">
            Artificial Intelligence
          </span>
        </h1>
        <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Civic AI automatically classifies citizen complaints, predicts
          municipal departments, detects duplicates, matches KYC profiles, and
          accelerates resolution timelines.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            File a Complaint Now
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.push("/register")}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 px-6 rounded-xl border border-white/5 transition-all cursor-pointer"
          >
            Register Account
          </button>
        </div>
      </section>

      {/* Interactive India Map Stats Section */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative">
        <div className="text-center md:text-left">
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
            <Map className="text-blue-500 w-6 h-6" />
            Live National Grievance Grid
          </h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Real-time geospatial distribution of complaints registered across
            India, showing resolution rates and status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Leaflet Map of India */}
          <div className="lg:col-span-2 h-[480px]">
            <IndiaMap
              complaints={complaints}
              onSelectComplaint={(c) => setSelectedComplaint(c)}
            />
          </div>

          {/* State Wise Stats Sidebar */}
          <div className="space-y-6">
            <StateStats complaints={complaints} />

            {selectedComplaint && (
              <div className="bg-slate-900/50 border border-white/10 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl">
                <div className="flex justify-between items-start">
                  <h4 className="font-extrabold text-xs text-gray-300 uppercase tracking-wider">
                    Complaint Inspect
                  </h4>
                  <button
                    className="text-gray-500 hover:text-white"
                    onClick={() => setSelectedComplaint(null)}
                  >
                    Close
                  </button>
                </div>
                <h3 className="font-bold text-sm text-white">
                  {selectedComplaint.complaint_title}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed truncate-3-lines">
                  {selectedComplaint.original_text}
                </p>
                <div className="flex gap-2 text-[10px] font-bold">
                  <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/15">
                    {selectedComplaint.ai_category}
                  </span>
                  <span className="bg-slate-800 text-gray-400 px-2 py-0.5 rounded">
                    {selectedComplaint.status}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core AI Features highlights */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all flex flex-col justify-between gap-4">
          <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <Brain className="text-blue-500 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Automated AI Routing
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Our neural pipeline interprets complain details, predicts
              municipal categories, and dispatches files directly to the
              respective department queue.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all flex flex-col justify-between gap-4">
          <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-blue-500 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              Automated KYC Matching
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Instant profile verification comparing citizen selfies against
              document OCR scans to prevent fraud while maintaining citizen
              trust.
            </p>
          </div>
        </div>

        <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all flex flex-col justify-between gap-4">
          <div className="h-10 w-10 bg-blue-600/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-blue-500 w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Cosmos AI Copilot</h3>
            <p className="text-xs text-gray-400 leading-relaxed mt-2">
              Context-aware chatbot guiding users through registration,
              explaining complaint status, and explaining legal municipal
              guidelines.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-white/5 bg-slate-950 py-8 text-center text-xs text-gray-500">
        <p>
          &copy; 2026 Civic AI. Built for Smart Governance and Democratic
          Grievance Management.
        </p>
      </footer>
    </div>
  );
}
