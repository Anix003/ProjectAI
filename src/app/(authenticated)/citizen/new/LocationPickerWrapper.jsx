'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MOCK_LOCATIONS = [
  { lat: 23.2325, lng: 87.0789, addr: 'Main Road, Bankura, West Bengal - 722101' },
  { lat: 22.5726, lng: 88.3639, addr: 'Sector 2, Salt Lake, Kolkata, West Bengal - 700091' },
  { lat: 22.4257, lng: 87.3199, addr: 'Ward 10, Midnapore, West Bengal - 721101' },
  { lat: 28.6139, lng: 77.2090, addr: 'Connaught Place, New Delhi, Delhi - 110001' },
  { lat: 19.0760, lng: 72.8777, addr: 'Bandra West, Mumbai, Maharashtra - 400050' }
];

export default function LocationPickerWrapper({ lat, lng, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      // Initialize map centered at the current location
      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 12
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 20
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([lat, lng], {
        draggable: true,
        icon: L.divIcon({
          html: `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#2563eb" width="32" height="32">
              <path fill-rule="evenodd" d="M11.54 22.351l.07.04.02.006a.75.75 0 00.74 0l.02-.006.07-.04c.166-.094.425-.26.711-.477C14.733 20.8 17.5 18.067 17.5 14a5.5 5.5 0 00-11 0c0 4.068 2.767 6.8 4.56 7.874.286.216.545.383.71.477zM12 11a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
            </svg>
          `,
          className: 'custom-marker-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        })
      }).addTo(map);

      // Helper function to update coordinates and mock address
      const updateLocation = (newLat, newLng) => {
        // Find closest mock location or generate a generic one
        let closest = MOCK_LOCATIONS[0];
        let minDiff = Infinity;
        
        MOCK_LOCATIONS.forEach(loc => {
          const diff = Math.abs(loc.lat - newLat) + Math.abs(loc.lng - newLng);
          if (diff < minDiff) {
            minDiff = diff;
            closest = loc;
          }
        });

        let finalAddr = closest.addr;
        if (minDiff > 0.5) {
          // Outside mock zones, generate dynamic mock address
          const states = ['West Bengal', 'Maharashtra', 'Delhi', 'Karnataka', 'Gujarat'];
          const selectedState = states[Math.abs(Math.floor(newLat * 10)) % states.length];
          finalAddr = `Municipal Road, Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)}, ${selectedState}, India`;
        }

        if (onChange) {
          onChange(newLat, newLng, finalAddr);
        }
      };

      // Map click handler
      map.on('click', (e) => {
        const { lat: clickLat, lng: clickLng } = e.latlng;
        marker.setLatLng([clickLat, clickLng]);
        updateLocation(clickLat, clickLng);
      });

      // Marker dragend handler
      marker.on('dragend', (e) => {
        const newLatLng = e.target.getLatLng();
        updateLocation(newLatLng.lat, newLatLng.lng);
      });

      mapInstance.current = map;
      markerRef.current = marker;
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstance.current && markerRef.current) {
      const markerLatLng = markerRef.current.getLatLng();
      if (markerLatLng.lat !== lat || markerLatLng.lng !== lng) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstance.current.setView([lat, lng], mapInstance.current.getZoom());
      }
    }
  }, [lat, lng]);

  return (
    <div className="relative w-full h-[220px] rounded-md overflow-hidden border border-border-strong shadow-inner">
      <div ref={mapRef} className="w-full h-full min-h-[220px]" />
    </div>
  );
}
