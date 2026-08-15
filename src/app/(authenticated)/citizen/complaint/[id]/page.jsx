'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { databases } from '@/lib/appwrite-client';
import { Query } from 'appwrite';
import {
  ArrowLeft, Clock, MapPin, Shield, FileText, Brain,
  Calendar, Activity, CheckCircle, AlertTriangle, Eye
} from 'lucide-react';

export default function ComplaintDetailPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const complaintId = params?.id;

  const [complaint, setComplaint] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

  useEffect(() => {
    const fetchDetails = async () => {
      if (!complaintId || !user) return;
      try {
        // 1. Fetch Complaint document by id_complaint
        const compRes = await databases.listDocuments(databaseId, 'complaints', [
          Query.equal('id_complaint', complaintId),
          Query.limit(1)
        ]);

        if (compRes.total === 0) {
          setError('Grievance not found.');
          setIsLoading(false);
          return;
        }

        const compDoc = compRes.documents[0];
        setComplaint(compDoc);

        // 2. Fetch Audit logs for this complaint
        const auditRes = await databases.listDocuments(databaseId, 'audit', [
          Query.equal('id_complaint', complaintId),
          Query.orderDesc('$createdAt'),
          Query.limit(50)
        ]);
        setAuditLogs(auditRes.documents);

      } catch (err) {
        console.error('Error fetching grievance details:', err.message);
        setError('Failed to load grievance details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [databaseId, complaintId, user]);

  const getStatusStepIndex = (status) => {
    const s = status?.toLowerCase();
    if (s === 'rejected') return -1;
    if (s === 'resolved') return 3;
    if (s === 'in progress' || s === 'in_progress') return 2;
    // Submitted or AI Processed
    return 1;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'rejected') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (s === 'resolved') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'in progress' || s === 'in_progress') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs text-gray-500 font-bold">
        <Clock className="w-5 h-5 animate-spin text-blue-500 mr-2.5" />
        Retrieving grievance files...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-rose-500 mb-4" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">{error || 'Grievance not found'}</h3>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 bg-slate-900 hover:bg-slate-800 text-gray-300 hover:text-white font-bold text-xs py-2.5 px-5 rounded-xl border border-white/5 cursor-pointer transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Parse attached images
  let imageUrls = [];
  try {
    imageUrls = JSON.parse(complaint.imageUrls || '[]');
  } catch (e) {
    imageUrls = [];
  }

  const stepIndex = getStatusStepIndex(complaint.status);
  const steps = [
    { label: 'Submitted', desc: 'Grievance registered' },
    { label: 'Reviewed', desc: 'Cosmos AI processed' },
    { label: 'In Progress', desc: 'Officer assigned' },
    { label: 'Resolved', desc: 'Resolution finalized' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-sans pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/70 border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Dashboard
          </button>
          <span className="bg-slate-900 border border-white/10 text-gray-400 font-mono text-[10px] px-3 py-1 rounded-full">
            {complaint.id_complaint}
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint & Status Details */}
        <section className="lg:col-span-2 space-y-8">
          {/* Card: Primary Grievance */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap justify-between items-start gap-4">
              <div className="space-y-1.5">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 border rounded-full uppercase tracking-wider ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
                <h1 className="text-xl md:text-2xl font-black text-white leading-tight">
                  {complaint.complaint_title}
                </h1>
              </div>
              <div className="text-right text-[10px] text-gray-500 font-medium">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Filed: {new Date(complaint.$createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Grievance Description</h3>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                {complaint.original_text}
              </p>
            </div>

            {/* Stepper Status Progress */}
            <div className="border-t border-white/5 pt-6 space-y-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Resolution Progress</h3>
              
              {stepIndex === -1 ? (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-rose-400">Grievance Rejected</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">This grievance has been reviewed and flagged as invalid, spam, or out of scope.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                  {steps.map((step, idx) => {
                    const isCompleted = idx <= stepIndex;
                    const isActive = idx === stepIndex;
                    return (
                      <div key={idx} className="space-y-2 relative">
                        <div className="flex items-center gap-2">
                          <div className={`h-6 w-6 rounded-full flex items-center justify-center border font-bold text-[10px] transition-all ${
                            isActive
                              ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/15 scale-110'
                              : isCompleted
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-slate-950 border-white/10 text-gray-500'
                          }`}>
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span className={`text-[11px] font-bold ${
                            isActive ? 'text-blue-400' : isCompleted ? 'text-white' : 'text-gray-500'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        <p className="text-[9px] text-gray-500 pl-8 leading-normal">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Card: Attached Media */}
          {imageUrls.length > 0 && (
            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                Attached Media Proof
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {imageUrls.map((url, index) => (
                  <div key={index} className="border border-white/5 rounded-xl overflow-hidden bg-slate-950 max-h-[300px] flex items-center justify-center">
                    {url.startsWith('data:image/') || url.startsWith('http') ? (
                      <img
                        src={url}
                        alt={`Attachment Proof #${index + 1}`}
                        className="object-contain w-full h-full max-h-[300px] hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="p-6 text-[10px] text-gray-500 italic">
                        Binary source file parsed correctly.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Audit Logs */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Audit & Verification Timeline
            </h3>

            {auditLogs.length === 0 ? (
              <div className="text-[10px] text-gray-500 italic">No timeline entries registered yet.</div>
            ) : (
              <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
                {auditLogs.map((log) => (
                  <div key={log.$id} className="relative">
                    {/* Pulsing dot on timeline */}
                    <div className="absolute -left-[30px] top-1 h-2 w-2 rounded-full bg-blue-500 border border-slate-950 ring-4 ring-blue-500/10" />
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-xs text-white">{log.action}</h4>
                        <span className="text-[9px] text-gray-500">
                          {new Date(log.$createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                        {log.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Right Column: AI Analysis Diagnostics */}
        <section className="space-y-6">
          {/* Card: Cosmos AI Insights */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/5 pb-3">
              <div className="h-7 w-7 bg-purple-600/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-widest leading-none">Cosmos Diagnostics</h3>
                <span className="text-[8px] text-purple-400 font-bold block uppercase tracking-wider mt-0.5">AI Copilot Analysis</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">AI Category</span>
                <p className="text-xs font-bold text-white">{complaint.ai_category || 'Other'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Assigned Department</span>
                <p className="text-xs font-bold text-white">{complaint.department || 'Other Department'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Priority</span>
                  <p className={`text-xs font-bold ${
                    complaint.priority === 'Critical' ? 'text-rose-400' : 'text-amber-400'
                  }`}>
                    {complaint.priority || 'Medium'}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Severity Score</span>
                  <p className="text-xs font-bold text-white">{complaint.severity || '5'} / 10</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Estimated Resolution</span>
                <p className="text-xs font-bold text-white">{complaint.estimated_resolution_hours || '72'} Hours</p>
              </div>

              {complaint.ai_summary && (
                <div className="space-y-1 border-t border-white/5 pt-4">
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">AI Executive Summary</span>
                  <p className="text-xs text-gray-300 leading-relaxed font-semibold italic">
                    &quot;{complaint.ai_summary}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Card: Geographic Metadata */}
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              Pinned Location
            </h3>
            
            <div className="space-y-3">
              <div className="bg-slate-950 border border-white/5 rounded-xl p-3.5 space-y-1">
                <span className="text-[8px] font-mono text-gray-500 uppercase">Resolved Street Address</span>
                <p className="text-xs text-gray-300 leading-relaxed font-medium">
                  {complaint.address || 'Address coordinates unpinned.'}
                </p>
              </div>

              {complaint.latitude && complaint.longitude && (
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-semibold">
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Latitude</span>
                    <span className="text-white font-mono">{complaint.latitude.toFixed(6)}</span>
                  </div>
                  <div className="bg-slate-950 border border-white/5 rounded-xl p-2.5 space-y-0.5">
                    <span className="text-[8px] text-gray-500 uppercase tracking-wider block">Longitude</span>
                    <span className="text-white font-mono">{complaint.longitude.toFixed(6)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
