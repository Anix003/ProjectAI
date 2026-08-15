'use client';

import React from 'react';
import { Check, Clock, ShieldAlert, FileText, Send, User, CheckCircle } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Submitted', desc: 'Complaint registered and cataloged.' },
  { id: 2, label: 'AI Reviewing', desc: 'Auto-detecting category and routing.' },
  { id: 3, label: 'Assigned', desc: 'Dispatched to department & officer.' },
  { id: 4, label: 'In Progress', desc: 'Officer is investigating and resolving.' },
  { id: 5, label: 'Resolved', desc: 'Resolution verified and closed.' }
];

const getActiveStep = (status) => {
  const norm = (status || '').toLowerCase();
  
  if (norm === 'draft') return 0;
  if (norm === 'submitted') return 1;
  if (norm === 'ai reviewing') return 2;
  if (norm === 'department assigned' || norm === 'officer assigned' || norm === 'assigned') return 3;
  if (norm === 'in progress' || norm === 'progreess' || norm === 'waiting for citizen' || norm === 'reopened') return 4;
  if (norm === 'resolved' || norm === 'closed') return 5;
  if (norm === 'rejected' || norm === 'escalated') return 5; // terminal states
  return 1;
};

export default function Timeline({ status, resolvedAt, assignedAt }) {
  const activeStep = getActiveStep(status);
  const isRejected = (status || '').toLowerCase() === 'rejected';
  const isEscalated = (status || '').toLowerCase() === 'escalated';

  return (
    <div className="bg-bg-card border border-border-subtle rounded-lg p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h4 className="font-bold text-text-main text-sm tracking-tight">Case Progress Timeline</h4>
        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
          isRejected 
            ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
            : isEscalated 
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
            : activeStep === 5 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
        }`}>
          {status || 'Submitted'}
        </span>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {STEPS.map((s, idx) => {
          const stepNum = s.id;
          const isCompleted = activeStep >= stepNum;
          const isActive = activeStep === stepNum - 1;
          
          let icon = <Clock className="w-3.5 h-3.5" />;
          if (stepNum === 1) icon = <FileText className="w-3.5 h-3.5" />;
          if (stepNum === 2) icon = <Clock className="w-3.5 h-3.5" />;
          if (stepNum === 3) icon = <User className="w-3.5 h-3.5" />;
          if (stepNum === 4) icon = <Clock className="w-3.5 h-3.5" />;
          if (stepNum === 5) icon = <CheckCircle className="w-3.5 h-3.5" />;

          return (
            <div key={s.id} className="relative group">
              {/* Timeline dot */}
              <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                isCompleted 
                  ? 'bg-emerald-500 border-emerald-500 text-text-main' 
                  : isActive 
                  ? 'bg-blue-500 border-blue-500 text-text-main animate-pulse'
                  : 'bg-bg-panel border-border-strong text-text-muted'
              }`}>
                {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : null}
              </div>

              <div>
                <h5 className={`text-xs font-bold transition-colors ${
                  isCompleted ? 'text-text-main' : isActive ? 'text-blue-400' : 'text-text-muted'
                }`}>
                  {s.label}
                </h5>
                <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{s.desc}</p>
                {stepNum === 3 && assignedAt && isCompleted && (
                  <span className="text-[9px] text-text-muted block mt-1">Assigned on: {new Date(assignedAt).toLocaleString()}</span>
                )}
                {stepNum === 5 && resolvedAt && isCompleted && (
                  <span className="text-[9px] text-emerald-500 block mt-1">Resolved on: {new Date(resolvedAt).toLocaleString()}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Special terminal states overlays */}
        {isRejected && (
          <div className="relative group p-3 bg-red-500/10 border border-red-500/20 rounded-md mt-4">
            <div className="flex gap-2 items-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <h5 className="text-xs font-bold text-red-400">Complaint Rejected</h5>
            </div>
            <p className="text-[10px] text-text-muted mt-1 leading-relaxed">
              This case has been reviewed and flagged as invalid, duplicate, or spam by department officers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
