'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Map as LeafletMap, Marker as LeafletMarker, LayerGroup } from 'leaflet';
import { Locate, Loader2, MapPin, X } from 'lucide-react';

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

export interface ClickedLocationInfo {
  lat: number;
  lng: number;
  shortAddress: string;
  displayName: string;
  city?: string;
  state?: string;
}

interface CivicMapProps {
  tickets?: MapTicket[];
  center?: [number, number];
  zoom?: number;
  isPicker?: boolean;
  selectedCoordinates?: [number, number] | null;
  onCoordinatesChange?: (coords: [number, number]) => void;
  className?: string;
  onLocationClick?: (info: ClickedLocationInfo) => void;
  clickedLocation?: ClickedLocationInfo | null;
}

export default function CivicMap({
  tickets = [],
  center = [20.5937, 78.9629],
  zoom = 5,
  isPicker = false,
  selectedCoordinates,
  onCoordinatesChange,
  className,
  onLocationClick,
  clickedLocation,
}: CivicMapProps) {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const pickerMarkerRef = useRef<LeafletMarker | null>(null);
  const userLocationMarkerRef = useRef<LeafletMarker | null>(null);
  const clickedMarkerRef = useRef<LeafletMarker | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [currentGpsCoords, setCurrentGpsCoords] = useState<[number, number] | null>(null);

  // Trigger GPS Geolocation
  const locateUser = useCallback((fly = true) => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setGpsActive(true);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCurrentGpsCoords([lat, lng]);

        if (mapInstanceRef.current && fly) {
          mapInstanceRef.current.flyTo([lat, lng], 15, { animate: true, duration: 1.2 });
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn('Geolocation access not granted or unavailable:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

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
        scrollWheelZoom: true,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer(MAP_TILES.url, {
        attribution: MAP_TILES.attribution,
        maxZoom: MAP_TILES.maxZoom,
      }).addTo(map);

      L.tileLayer(MAP_LABELS.url, {
        attribution: MAP_LABELS.attribution,
        maxZoom: MAP_LABELS.maxZoom,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map clicks (Takes clicks, points to exact location, reverse-geocodes)
      map.on('click', async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        if (isPicker && onCoordinatesChange) {
          onCoordinatesChange([lat, lng]);
          return;
        }

        // Show immediate clicked marker with loading popup
        if (clickedMarkerRef.current) {
          clickedMarkerRef.current.remove();
        }

        const clickPinIcon = L.divIcon({
          html: `
            <div class="pin-drop-anim" style="position: relative; width: 34px; height: 42px; display: flex; flex-direction: column; align-items: center;">
              <div style="background-color: #ea580c; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(234,88,12,0.6);">
                <div style="transform: rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
              </div>
            </div>
          `,
          className: 'civic-clicked-marker',
          iconSize: [34, 42],
          iconAnchor: [17, 42],
          popupAnchor: [0, -42],
        });

        const newMarker = L.marker([lat, lng], { icon: clickPinIcon }).addTo(map);
        clickedMarkerRef.current = newMarker;

        // Reverse-geocode in background to get location name for sidebar
        try {
          const res = await fetch(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          const data = await res.json();
          const shortAddress = data.shortAddress || `Location [${lat.toFixed(4)}, ${lng.toFixed(4)}]`;
          const displayName = data.displayName || shortAddress;

          const locationInfo: ClickedLocationInfo = {
            lat,
            lng,
            shortAddress,
            displayName,
            city: data.city,
            state: data.state,
          };

          if (onLocationClick) {
            onLocationClick(locationInfo);
          }
        } catch (fetchErr) {
          console.error('Reverse geocode error:', fetchErr);
        }
      });

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

  // Check if browser location is already permitted on mount
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          locateUser(false);
        }
      }).catch(() => {
        // Fallback for browsers without permissions API
      });
    }
  }, [locateUser]);

  // Center pan when center prop changes
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(center, zoom, { animate: false });
  }, [mapLoaded, center[0], center[1], zoom]);

  // Render User Current Location Pin (Pulsing GPS Marker)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !currentGpsCoords) return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;
      if (!map) return;

      if (userLocationMarkerRef.current) {
        userLocationMarkerRef.current.setLatLng(currentGpsCoords);
      } else {
        const gpsIcon = L.divIcon({
          html: `
            <div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
              <div class="gps-pulse-effect" style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(37, 99, 235, 0.4); pointer-events: none;"></div>
              <div style="width: 18px; height: 18px; border-radius: 50%; background: #2563eb; border: 3px solid #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.4); z-index: 2;"></div>
            </div>
          `,
          className: 'civic-gps-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const gpsMarker = L.marker(currentGpsCoords, { icon: gpsIcon, zIndexOffset: 1000 }).addTo(map);
        gpsMarker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; padding: 2px;">
            <div style="font-weight: 800; color: #2563eb;">📍 Your Current Location</div>
            <div style="font-size: 10px; color: #64748b;">GPS Enabled &amp; Pinpointed</div>
          </div>
        `);
        userLocationMarkerRef.current = gpsMarker;
      }
    });
  }, [mapLoaded, currentGpsCoords]);

  // Render Tickets Layer
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

  // Update Location Picker marker (for reporting grievances page)
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

  // If clickedLocation is cleared externally
  useEffect(() => {
    if (!clickedLocation && clickedMarkerRef.current) {
      clickedMarkerRef.current.remove();
      clickedMarkerRef.current = null;
    }
  }, [clickedLocation]);

  return (
    <div className={`relative w-full h-full overflow-hidden shadow-sm border border-slate-200 bg-slate-100 ${className || 'min-h-[480px] lg:min-h-[540px] rounded-2xl'}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* FLOATING "LOCATE ME" / CURRENT GPS POSITION BUTTON */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2">
        <button
          type="button"
          onClick={() => locateUser(true)}
          title="Point to your current location"
          className="flex items-center gap-1.5 px-3 py-2 bg-white/95 hover:bg-white text-slate-800 hover:text-blue-600 rounded-xl shadow-md border border-slate-200/90 backdrop-blur-xs text-xs font-bold transition-all cursor-pointer"
        >
          {gpsLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : (
            <Locate className={`w-3.5 h-3.5 ${gpsActive ? 'text-blue-600' : 'text-slate-600'}`} />
          )}
          <span>{gpsLoading ? 'Locating…' : gpsActive ? 'Current Location Active' : 'Locate Me'}</span>
          {gpsActive && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
        </button>
      </div>

      {/* INFORMATIVE OVERLAY HINT */}
      <div className="absolute bottom-2 left-2 z-[999] pointer-events-none bg-slate-900/75 backdrop-blur-xs text-white text-[10px] px-2.5 py-1 rounded-md font-medium">
        💡 Click anywhere on map to pin &amp; identify address
      </div>
    </div>
  );
}
