'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from 'leaflet';

const MAP_TILES = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Tiles &copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community',
  maxZoom: 19,
};

const MAP_LABELS = {
  url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
  attribution: 'Labels &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS User Community',
  maxZoom: 19,
};
export interface MapTicket {
  id: string;
  caseId: string;
  title: string;
  category: string;
  urgency: string;
  status: string;
  latitude: number;
  longitude: number;
  addressDescription?: string;
  slaDeadline?: string | Date;
  initialPhotoUrl?: string | null;
  resolutionPhotoUrl?: string | null;
}

interface CivicMapProps {
  tickets?: MapTicket[];
  center?: [number, number];
  zoom?: number;
  isPicker?: boolean;
  selectedCoordinates?: [number, number] | null;
  onCoordinatesChange?: (coords: [number, number]) => void;
}

export default function CivicMap({
  tickets = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  isPicker = false,
  selectedCoordinates,
  onCoordinatesChange,
}: CivicMapProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const pickerMarkerRef = useRef<LeafletMarker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');

      if (!isMounted || !mapContainerRef.current) return;

      const initialCenter = selectedCoordinates || center;
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: zoom,
        zoomControl: false,
        scrollWheelZoom: !isPicker,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);
      const initialTileLayer = L.tileLayer(MAP_TILES.url, {
        attribution: MAP_TILES.attribution,
        maxZoom: MAP_TILES.maxZoom,
      }).addTo(map);
      L.tileLayer(MAP_LABELS.url, {
        attribution: MAP_LABELS.attribution,
        maxZoom: MAP_LABELS.maxZoom,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      if (isPicker && onCoordinatesChange) {
        map.on('click', (e) => {
          onCoordinatesChange([e.latlng.lat, e.latlng.lng]);
        });
      }

      // Invalidate size to ensure clean rendering on all screen sizes
      setTimeout(() => {
        map.invalidateSize();
      }, 200);

      if (isMounted) setMapLoaded(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(center, zoom, { animate: false });
  }, [mapLoaded, center[0], center[1], zoom]);

  // Show one pin for each reported issue.
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      const markersLayer = markersLayerRef.current;
      if (!markersLayer) return;

      markersLayer.clearLayers();

      if (isPicker) return;

      tickets.forEach((ticket) => {
        let pinColor = '#dc2626'; // Red for open/critical

        if (ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED') {
          pinColor = '#d97706'; // Amber
        } else if (ticket.status === 'PROVISIONALLY_RESOLVED') {
          pinColor = '#7c3aed'; // Violet
        } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          pinColor = '#059669'; // Green
        }

        const customHtml = `
          <div style="background-color: ${pinColor}; width: 26px; height: 26px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.35); cursor: pointer;" class="${
            ticket.urgency === 'CRITICAL' ? 'pulse-critical' : ''
          }">
            <span style="width: 7px; height: 7px; background: white; border-radius: 50%;"></span>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'civic-marker-pin',
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([ticket.latitude, ticket.longitude], { icon });

        marker.on('click', () => router.push(`/ticket/${ticket.caseId}`));

        markersLayer.addLayer(marker);
      });
    });
  }, [mapLoaded, tickets, isPicker, router]);

  // Update Location Picker marker (for reporting grievances)
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !isPicker) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (selectedCoordinates) {
        if (!pickerMarkerRef.current) {
          const pickerIcon = L.divIcon({
            html: `
              <div style="background-color: #ea580c; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(234,88,12,0.6);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
            `,
            className: 'picker-marker-pin',
            iconSize: [36, 36],
            iconAnchor: [18, 36],
          });

          pickerMarkerRef.current = L.marker(selectedCoordinates, {
            icon: pickerIcon,
            draggable: true,
          }).addTo(map);

          pickerMarkerRef.current.on('dragend', (e) => {
            const latlng = e.target.getLatLng();
            if (onCoordinatesChange) onCoordinatesChange([latlng.lat, latlng.lng]);
          });
        } else {
          pickerMarkerRef.current.setLatLng(selectedCoordinates);
        }
      }
    });
  }, [mapLoaded, selectedCoordinates, isPicker, onCoordinatesChange]);

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[540px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />


    </div>
  );
}
