import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Activity } from '../types/itinerary';
import { Navigation } from 'lucide-react';

interface TripMapProps {
  activities: Activity[];
  selectedDay?: number | null;
  destinationName: string;
}

export const TripMap: React.FC<TripMapProps> = ({ activities, selectedDay, destinationName }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Filter activities that have valid coordinates
  const geoActivities = activities.filter(
    (a) => typeof a.latitude === 'number' && typeof a.longitude === 'number' && !isNaN(a.latitude) && !isNaN(a.longitude)
  );

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if not yet initialized
    if (!mapInstanceRef.current) {
      const initialLat = geoActivities.length > 0 ? geoActivities[0].latitude! : 35.0116;
      const initialLng = geoActivities.length > 0 ? geoActivities[0].longitude! : 135.7681;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // CartoDB Positron tiles for an elegant, understated editorial look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    const bounds: [number, number][] = [];

    // Color definitions for time slots
    const slotColors: Record<string, { bg: string; text: string; border: string }> = {
      morning: { bg: '#F59E0B', text: '#FFFFFF', border: '#D97706' },
      afternoon: { bg: '#C85A32', text: '#FFFFFF', border: '#A9421C' },
      evening: { bg: '#2D4A3E', text: '#FFFFFF', border: '#1E332A' },
      night: { bg: '#4338CA', text: '#FFFFFF', border: '#3730A3' },
    };

    geoActivities.forEach((act, idx) => {
      const lat = act.latitude!;
      const lng = act.longitude!;
      bounds.push([lat, lng]);

      const colors = slotColors[act.time_slot] || slotColors.morning;

      // Custom HTML Pin icon
      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${colors.bg};
            color: ${colors.text};
            border: 2px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 12px;
            font-weight: 700;
          ">
            ${idx + 1}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 200px; padding: 4px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${colors.bg}; margin-bottom: 2px;">
            ${act.time_slot} &bull; ${act.category}
          </div>
          <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 16px; font-weight: 700; color: #1C1917; margin-bottom: 4px; line-height: 1.2;">
            ${act.title}
          </div>
          <div style="font-size: 12px; color: #57534E; margin-bottom: 6px;">
            <strong>${act.location_name}</strong>
          </div>
          ${act.insider_tip ? `<div style="font-size: 11px; background: #FEF3C7; padding: 4px 6px; border-radius: 4px; color: #92400E; margin-top: 4px;"><em>Tip:</em> ${act.insider_tip}</div>` : ''}
        </div>
      `;

      const marker = L.marker([lat, lng], { icon: customIcon }).bindPopup(popupContent);
      markersGroup.addLayer(marker);
    });

    // Fit map bounds to encompass all activities
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }

    return () => {
      // Map stays persistent across day toggles
    };
  }, [geoActivities, selectedDay]);

  // Teardown map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 mb-3 border-b border-[#F0EAE1]">
        <div>
          <h3 className="font-serif text-xl font-bold text-[#1C1917] flex items-center space-x-2">
            <Navigation className="w-5 h-5 text-[#C85A32]" />
            <span>Interactive Route & Landmarks Map</span>
          </h3>
          <p className="text-xs text-[#78716C]">
            {destinationName} &bull; {geoActivities.length} mapped journey stops
          </p>
        </div>
        
        {/* Map Legend */}
        <div className="flex items-center space-x-3 text-xs mt-2 sm:mt-0">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span>
            <span className="text-[#57534E]">Morning</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C85A32]"></span>
            <span className="text-[#57534E]">Afternoon</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#2D4A3E]"></span>
            <span className="text-[#57534E]">Evening</span>
          </span>
        </div>
      </div>

      <div className="h-[460px] w-full rounded-xl overflow-hidden relative border border-[#E8E2D9]">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
