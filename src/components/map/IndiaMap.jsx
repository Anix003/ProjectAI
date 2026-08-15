'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const MapWrapper = dynamic(
  () => import('./MapWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center min-h-[450px] w-full bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/10">
        <div className="relative flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <div className="absolute rounded-full h-10 w-10 bg-slate-900 flex items-center justify-center text-[10px] text-blue-400 font-bold">MAP</div>
        </div>
        <p className="mt-4 text-xs text-gray-400 font-medium tracking-wider uppercase animate-pulse">Loading India Geospatial Grid...</p>
      </div>
    )
  }
);

export default function IndiaMap({ complaints, onSelectComplaint }) {
  return <MapWrapper complaints={complaints} onSelectComplaint={onSelectComplaint} />;
}
