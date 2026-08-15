'use client';

import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const detectState = (address) => {
  if (!address) return 'Other Regions';
  const addr = address.toLowerCase();
  
  if (addr.includes('west bengal') || addr.includes('kolkata') || addr.includes('midnapore') || addr.includes('bankura') || addr.includes('722101') || addr.includes('7000')) {
    return 'West Bengal';
  }
  if (addr.includes('maharashtra') || addr.includes('mumbai') || addr.includes('pune')) {
    return 'Maharashtra';
  }
  if (addr.includes('delhi') || addr.includes('ncr')) {
    return 'Delhi';
  }
  if (addr.includes('karnataka') || addr.includes('bengaluru') || addr.includes('bangalore')) {
    return 'Karnataka';
  }
  if (addr.includes('tamil nadu') || addr.includes('chennai')) {
    return 'Tamil Nadu';
  }
  if (addr.includes('gujarat') || addr.includes('ahmedabad') || addr.includes('surat')) {
    return 'Gujarat';
  }
  if (addr.includes('uttar pradesh') || addr.includes('lucknow') || addr.includes('noida')) {
    return 'Uttar Pradesh';
  }
  
  return 'Other Regions';
};

export default function StateStats({ complaints }) {
  const stats = React.useMemo(() => {
    const stateData = {};

    complaints.forEach((c) => {
      const stateName = detectState(c.address);
      if (!stateData[stateName]) {
        stateData[stateName] = {
          total: 0,
          solved: 0,
          ignored: 0,
          inProgress: 0
        };
      }

      stateData[stateName].total += 1;
      
      const status = c.status;
      if (status === 'Resolved' || status === 'Closed') {
        stateData[stateName].solved += 1;
      } else if (status === 'Rejected' || status === 'Ignored') {
        stateData[stateName].ignored += 1;
      } else {
        stateData[stateName].inProgress += 1;
      }
    });

    // Convert object to sorted array
    return Object.entries(stateData)
      .map(([name, data]) => ({
        name,
        ...data,
        solvedRate: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);
  }, [complaints]);

  // Overall stats
  const totals = React.useMemo(() => {
    let registered = complaints.length;
    let solved = 0;
    let ignored = 0;
    let pending = 0;

    complaints.forEach((c) => {
      if (c.status === 'Resolved' || c.status === 'Closed') solved++;
      else if (c.status === 'Rejected' || c.status === 'Ignored') ignored++;
      else pending++;
    });

    return { registered, solved, ignored, pending };
  }, [complaints]);

  return (
    <div className="bg-bg-card border border-border-strong backdrop-blur-md rounded-lg p-6 font-sans">
      <h3 className="text-lg font-bold text-text-main mb-4 tracking-tight flex items-center gap-2">
        <ShieldCheck className="text-blue-500 w-5 h-5" />
        Geospatial Performance Grid
      </h3>

      {/* Global Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-bg-card border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Registered</span>
          <span className="text-2xl font-black text-text-main mt-1">{totals.registered}</span>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Solved</span>
          <span className="text-2xl font-black text-emerald-400 mt-1">{totals.solved}</span>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">In Progress</span>
          <span className="text-2xl font-black text-amber-400 mt-1">{totals.pending}</span>
        </div>
        <div className="bg-bg-card border border-border-subtle rounded-md p-3 flex flex-col justify-between">
          <span className="text-[10px] text-text-muted font-semibold uppercase tracking-wider">Ignored / Spam</span>
          <span className="text-2xl font-black text-text-muted mt-1">{totals.ignored}</span>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {stats.length === 0 ? (
          <div className="text-center py-6 text-xs text-text-muted font-medium">
            No geographic complaint logs found in this scope.
          </div>
        ) : (
          stats.map((s) => (
            <div key={s.name} className="p-3 bg-bg-card border border-border-subtle rounded-md hover:border-blue-500/30 transition-all flex flex-col justify-between gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-text-main">{s.name}</span>
                <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full">{s.total} cases</span>
              </div>
              
              {/* Progress Bar of Resolution */}
              <div className="w-full bg-bg-panel h-2 rounded-full overflow-hidden flex">
                <div 
                  className="bg-emerald-500 h-full" 
                  style={{ width: `${s.total > 0 ? (s.solved / s.total) * 100 : 0}%` }} 
                  title={`Solved: ${s.solved}`} 
                />
                <div 
                  className="bg-amber-500 h-full" 
                  style={{ width: `${s.total > 0 ? (s.inProgress / s.total) * 100 : 0}%` }} 
                  title={`In Progress: ${s.inProgress}`} 
                />
                <div 
                  className="bg-gray-500 h-full" 
                  style={{ width: `${s.total > 0 ? (s.ignored / s.total) * 100 : 0}%` }} 
                  title={`Ignored: ${s.ignored}`} 
                />
              </div>

              <div className="flex justify-between text-[10px] text-text-muted">
                <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Solved: {s.solvedRate}%</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 text-amber-500" /> Active: {s.inProgress}</span>
                <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3 text-text-muted" /> Ignored: {s.ignored}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
