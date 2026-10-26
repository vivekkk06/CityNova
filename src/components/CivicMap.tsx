'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  PhoneCall,
  Mail,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  Crosshair,
  UserCheck,
  X,
  Camera,
  ExternalLink,
} from 'lucide-react';
import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from 'leaflet';

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
  wardId?: string;
}

export interface MapWard {
  id: string;
  code: string;
  name: string;
  zone: string;
  boundaries: {
    type: string;
    coordinates: number[][][];
  };
  centerLat: number;
  centerLng: number;
  officerName?: string;
  officerPhone?: string;
  officerEmail?: string;
  emergencyContact?: string;
  stats?: {
    total: number;
    open: number;
    resolved: number;
  };
}

interface CivicMapProps {
  tickets?: MapTicket[];
  wards?: MapWard[];
  center?: [number, number];
  zoom?: number;
  isPicker?: boolean;
  selectedCoordinates?: [number, number] | null;
  onCoordinatesChange?: (coords: [number, number]) => void;
  activeWardId?: string;
}

export default function CivicMap({
  tickets = [],
  wards = [],
  center = [15.4050, 74.0170],
  zoom = 14,
  isPicker = false,
  selectedCoordinates,
  onCoordinatesChange,
  activeWardId,
}: CivicMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const clusterLayerRef = useRef<LayerGroup | null>(null);
  const polygonsLayerRef = useRef<LayerGroup | null>(null);
  const pickerMarkerRef = useRef<LeafletMarker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedWardForContact, setSelectedWardForContact] = useState<MapWard | null>(null);
  const [showClusters, setShowClusters] = useState(true);
  const [showBoundaries, setShowBoundaries] = useState(true);

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
        zoomControl: true,
        scrollWheelZoom: !isPicker,
      });

      // Official Clean Light Government Cartography Tiles (CartoDB Voyager)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      polygonsLayerRef.current = L.layerGroup().addTo(map);
      clusterLayerRef.current = L.layerGroup().addTo(map);
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

  // Sync active ward or default ward for contact card
  useEffect(() => {
    if (activeWardId && activeWardId !== 'all') {
      const found = wards.find((w) => w.id === activeWardId);
      if (found) setSelectedWardForContact(found);
    } else if (wards.length > 0 && !selectedWardForContact) {
      setSelectedWardForContact(wards[0]);
    }
  }, [activeWardId, wards]);

  // Update Ward Polygons & Boundaries
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !polygonsLayerRef.current) return;

    import('leaflet').then((L) => {
      const polyLayer = polygonsLayerRef.current;
      if (!polyLayer) return;

      polyLayer.clearLayers();

      if (!showBoundaries) return;

      const colors = ['#2563eb', '#059669', '#7c3aed', '#ea580c'];

      wards.forEach((ward, index) => {
        if (!ward.boundaries?.coordinates?.[0]) return;
        const color = colors[index % colors.length];
        const isHighlight = activeWardId === ward.id || selectedWardForContact?.id === ward.id;

        // Convert [lng, lat] to [lat, lng] for Leaflet
        const latLngs = ward.boundaries.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);

        const polygon = L.polygon(latLngs, {
          color: isHighlight ? '#ea580c' : color,
          weight: isHighlight ? 3.5 : 2,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: isHighlight ? 0.22 : 0.08,
        }).addTo(polyLayer);

        polygon.on('click', () => {
          setSelectedWardForContact(ward);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([ward.centerLat, ward.centerLng], 15);
          }
        });

        polygon.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong style="color: #0f172a; display: block;">${ward.name}</strong>
            <span style="color: #64748b; font-size: 10px;">Click to view Ward Officers & Contacts</span>
          </div>`,
          { sticky: true }
        );
      });
    });
  }, [mapLoaded, wards, activeWardId, selectedWardForContact, showBoundaries]);

  // Update Nagarika-Style Ward Cluster Bubbles
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !clusterLayerRef.current) return;

    import('leaflet').then((L) => {
      const clusterLayer = clusterLayerRef.current;
      if (!clusterLayer) return;

      clusterLayer.clearLayers();

      if (!showClusters || isPicker) return;

      wards.forEach((ward) => {
        // Calculate count of tickets in this ward
        const wardTickets = tickets.filter((t) => t.wardId === ward.id);
        const count = ward.stats?.total || wardTickets.length || 0;
        if (count === 0 && wardTickets.length === 0) return;

        const displayCount = count || wardTickets.length;
        const size = Math.min(58, Math.max(38, 36 + Math.log2(displayCount + 1) * 4));

        const clusterHtml = `
          <div class="nagarika-cluster-badge" style="width: ${size}px; height: ${size}px; font-size: ${size > 44 ? '13px' : '11px'};">
            ${displayCount}
          </div>
        `;

        const clusterIcon = L.divIcon({
          html: clusterHtml,
          className: 'nagarika-bubble-icon',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([ward.centerLat, ward.centerLng], { icon: clusterIcon }).addTo(clusterLayer);

        marker.on('click', () => {
          setSelectedWardForContact(ward);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([ward.centerLat, ward.centerLng], 15);
          }
        });

        marker.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px;">
            <strong>${ward.name}</strong><br/>
            <span style="color: #ea580c; font-weight: 700;">${displayCount} Civic Grievances</span>
          </div>`,
          { direction: 'top' }
        );
      });
    });
  }, [mapLoaded, wards, tickets, showClusters, isPicker]);

  // Update Individual Ticket Markers with Image Preview
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !markersLayerRef.current) return;

    import('leaflet').then((L) => {
      const markersLayer = markersLayerRef.current;
      if (!markersLayer) return;

      markersLayer.clearLayers();

      if (isPicker) return;

      tickets.forEach((ticket) => {
        let pinColor = '#dc2626'; // Red for open/critical
        let statusBadge = 'Open / Urgent';
        let statusBg = '#fef2f2';
        let statusText = '#b91c1c';

        if (ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED') {
          pinColor = '#d97706'; // Amber
          statusBadge = 'In Progress (SLA Active)';
          statusBg = '#fffbeb';
          statusText = '#b45309';
        } else if (ticket.status === 'PROVISIONALLY_RESOLVED') {
          pinColor = '#7c3aed'; // Violet
          statusBadge = 'Pending Resident Check';
          statusBg = '#f5f3ff';
          statusText = '#6d28d9';
        } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          pinColor = '#059669'; // Green
          statusBadge = 'Verified Closed';
          statusBg = '#ecfdf5';
          statusText = '#047857';
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
          popupAnchor: [0, -14],
        });

        const marker = L.marker([ticket.latitude, ticket.longitude], { icon });

        // Build popup with image thumbnail and clean government layout
        const hasPhoto = Boolean(ticket.initialPhotoUrl || ticket.resolutionPhotoUrl);
        const photoUrl = ticket.resolutionPhotoUrl || ticket.initialPhotoUrl;

        const popupContent = `
          <div style="font-family: inherit; width: 260px; overflow: hidden; background: white; border-radius: 10px;">
            ${
              hasPhoto
                ? `<div style="position: relative; width: 100%; height: 110px; background: #e2e8f0; overflow: hidden;">
                    <img src="${photoUrl}" alt="Civic Photo Proof" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
                    <span style="position: absolute; bottom: 6px; left: 6px; background: rgba(15, 23, 42, 0.75); color: white; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">
                      📸 Citizen Photo Proof
                    </span>
                  </div>`
                : `<div style="background: #f1f5f9; padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 10px; color: #64748b;">
                    No photo uploaded with report
                  </div>`
            }

            <div style="padding: 10px 12px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 700; color: #475569; letter-spacing: 0.5px;">${ticket.caseId}</span>
                <span style="font-size: 10px; background: ${statusBg}; color: ${statusText}; font-weight: 700; padding: 2px 7px; border-radius: 999px;">
                  ${statusBadge}
                </span>
              </div>

              <h4 style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #0f172a; line-height: 1.35;">
                ${ticket.title}
              </h4>

              <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b;">
                ${ticket.category} ${ticket.addressDescription ? `&bull; ${ticket.addressDescription.slice(0, 35)}...` : ''}
              </p>

              <a href="/ticket/${ticket.caseId}" style="display: block; text-align: center; background: #ea580c; color: white; padding: 7px 12px; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 4px rgba(234, 88, 12, 0.3);">
                View Promise-to-Proof Ledger &rarr;
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, { maxWidth: 280 });
        markersLayer.addLayer(marker);
      });
    });
  }, [mapLoaded, tickets, isPicker]);

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

  // Reset view to city center
  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(center, zoom);
      setSelectedWardForContact(null);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[480px] lg:min-h-[540px] rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <button
          onClick={handleResetView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 text-slate-800 text-xs font-bold shadow-md border border-slate-200 hover:bg-slate-50 transition-colors"
          title="Reset Map to Full City View"
        >
          <Crosshair className="w-3.5 h-3.5 text-orange-600" />
          <span>City View &bull; पूरा शहर</span>
        </button>

        <button
          onClick={() => setShowClusters(!showClusters)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md border transition-colors ${
            showClusters
              ? 'bg-red-800 text-white border-red-900'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Nagarika-style Ward Issue Clusters"
        >
          <span>🔴 {showClusters ? 'Clusters ON' : 'Clusters OFF'}</span>
        </button>

        <button
          onClick={() => setShowBoundaries(!showBoundaries)}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-md border transition-colors ${
            showBoundaries
              ? 'bg-blue-800 text-white border-blue-900'
              : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
          title="Toggle Ward Boundary Outlines"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showBoundaries ? 'Ward Boundaries ON' : 'Boundaries OFF'}</span>
        </button>
      </div>

      {/* FLOATING WARD OFFICIAL DIRECTORY CARD (Requested: In map -> all contact info regarding officials) */}
      {selectedWardForContact && !isPicker && (
        <div className="absolute top-3 right-3 z-30 w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-3">
          <div className="flex justify-between items-start border-b border-slate-100 pb-2.5 mb-2.5">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  {selectedWardForContact.code} &bull; {selectedWardForContact.zone}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                {selectedWardForContact.name}
              </h3>
            </div>
            <button
              onClick={() => setSelectedWardForContact(null)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Close ward official card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Officer In-Charge */}
            <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-100">
              <span className="text-[10px] text-orange-800 font-bold uppercase block">
                Nodal Ward Officer (प्रभारी अधिकारी)
              </span>
              <strong className="text-slate-900 text-xs font-bold block mt-0.5">
                {selectedWardForContact.officerName || 'Er. Pradeep Naik (Chief Officer)'}
              </strong>
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <a
                href={`tel:${selectedWardForContact.officerPhone || '08322312148'}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Officer</span>
              </a>

              <a
                href={`mailto:${selectedWardForContact.officerEmail || 'grievance.pmc@goa.gov.in'}`}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Officer</span>
              </a>
            </div>

            {/* Helpline Numbers */}
            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-600">
              <span>Emergency 24x7 Helpline:</span>
              <strong className="text-slate-900 font-bold">
                {selectedWardForContact.emergencyContact || '1913 / 0832-2312148'}
              </strong>
            </div>

            {/* Ward Grievance Stats */}
            <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-[11px]">
              <div>
                <span className="text-slate-500">Active Grievances:</span>
                <strong className="text-orange-600 font-bold ml-1">
                  {selectedWardForContact.stats?.open ?? tickets.filter((t) => t.wardId === selectedWardForContact.id && t.status !== 'RESOLVED').length}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Resolved:</span>
                <strong className="text-emerald-600 font-bold ml-1">
                  {selectedWardForContact.stats?.resolved ?? tickets.filter((t) => t.wardId === selectedWardForContact.id && t.status === 'RESOLVED').length}
                </strong>
              </div>
            </div>

            {/* Quick Action: Report for this ward */}
            <Link
              href={`/report?ward=${selectedWardForContact.id}`}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-md transition-colors"
            >
              <span>+ Report Grievance in this Ward</span>
            </Link>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-3 shadow-lg border border-slate-200 text-xs space-y-1.5 max-w-[220px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <span className="font-bold text-slate-800 text-[11px]">Civic Status Legend</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0"></span>
          <span className="text-slate-700 font-medium">Open / Critical (तुरंत ध्यान)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
          <span className="text-slate-700 font-medium">In Progress (कार्य जारी)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600 shrink-0"></span>
          <span className="text-slate-700 font-medium">Citizen Verification Check</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0"></span>
          <span className="text-slate-700 font-medium">Verified & Closed (समाधान)</span>
        </div>
      </div>
    </div>
  );
}
