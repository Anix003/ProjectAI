'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getMarkerIcon = (status, priority) => {
  let color = '#3b82f6'; // blue for submitted/draft
  if (status === 'Resolved' || status === 'Closed') {
    color = '#10b981'; // green
  } else if (status === 'Rejected' || status === 'Ignored') {
    color = '#6b7280'; // gray
  } else if (priority === 'Critical') {
    color = '#ef4444'; // red
  } else if (priority === 'High') {
    color = '#f59e0b'; // amber
  } else if (status === 'In Progress' || status === 'Progreess') {
    color = '#f59e0b'; // amber
  }

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
      <path fill-rule="evenodd" d="M11.54 22.351l.07.04.02.006a.75.75 0 00.74 0l.02-.006.07-.04c.166-.094.425-.26.711-.477C14.733 20.8 17.5 18.067 17.5 14a5.5 5.5 0 00-11 0c0 4.068 2.767 6.8 4.56 7.874.286.216.545.383.71.477zM12 11a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

export default function MapWrapper({ complaints, onSelectComplaint }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map centered on India
      const map = L.map(mapRef.current, {
        center: [20.5937, 78.9629],
        zoom: 5,
        zoomControl: true,
        maxBounds: [
          [5.0, 60.0],  // southwest bounds
          [40.0, 100.0] // northeast bounds
        ]
      });

      // Add light tiles for sleek modern UI (using CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      mapInstance.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && markersLayerRef.current && complaints) {
      // Clear existing markers
      markersLayerRef.current.clearLayers();

      complaints.forEach((c) => {
        const lat = parseFloat(c.latitude);
        const lng = parseFloat(c.longitude);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng], {
            icon: getMarkerIcon(c.status, c.priority)
          });

          // Custom Popup Content
          const popupContent = document.createElement('div');
          popupContent.className = 'p-2 min-w-[200px] font-sans';
          popupContent.innerHTML = `
            <h4 class="font-bold text-gray-800 text-sm mb-1">${c.complaint_title}</h4>
            <div class="flex gap-2 mb-2">
              <span class="px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700">${c.ai_category || 'General'}</span>
              <span class="px-2 py-0.5 text-xs font-semibold rounded ${c.priority === 'Critical' ? 'bg-red-100 text-red-700' : c.priority === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}">${c.priority || 'Medium'}</span>
            </div>
            <p class="text-xs text-gray-600 mb-2 truncate-2-lines">${c.original_text}</p>
            <p class="text-[10px] text-text-muted mb-2">Status: <span class="font-semibold text-gray-700">${c.status}</span></p>
            <button class="w-full bg-blue-600 hover:bg-blue-700 text-text-main font-medium text-xs py-1.5 px-3 rounded shadow transition-colors inspect-btn">
              Inspect Case
            </button>
          `;

          // Add click event for details button
          popupContent.querySelector('.inspect-btn').addEventListener('click', () => {
            if (onSelectComplaint) {
              onSelectComplaint(c);
            }
          });

          marker.bindPopup(popupContent);
          markersLayerRef.current.addLayer(marker);
        }
      });
    }
  }, [complaints, onSelectComplaint]);

  return (
    <div className="relative w-full h-full min-h-[450px] rounded-lg overflow-hidden border border-white/20 shadow-lg">
      <div ref={mapRef} className="w-full h-full min-h-[450px]" />
    </div>
  );
}
