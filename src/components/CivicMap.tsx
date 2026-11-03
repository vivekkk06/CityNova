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

// High-precision Civic Picker Pin with sharp downward needle tip touching the exact coordinate
function createPickerIcon(L: any) {
  return L.divIcon({
    html: `
      <div class="civic-custom-picker-pin pin-drop-anim" style="position: relative; width: 36px; height: 50px; display: flex; flex-direction: column; align-items: center; user-select: none; cursor: grab;">
        <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.45));">
          <path d="M18 1.5C8.89 1.5 1.5 8.89 1.5 18C1.5 29.5 18 44.5 18 44.5C18 44.5 34.5 29.5 34.5 18C34.5 8.89 27.11 1.5 18 1.5Z" fill="#ea580c" stroke="#ffffff" stroke-width="2.5"/>
          <circle cx="18" cy="18" r="6" fill="#ffffff"/>
        </svg>
        <div style="width: 10px; height: 3px; background: rgba(0,0,0,0.35); border-radius: 50%; margin-top: -1px;"></div>
      </div>
    `,
    className: 'picker-marker-container',
    iconSize: [36, 50],
    iconAnchor: [18, 47],
    popupAnchor: [0, -47],
  });
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
  const leafletRef = useRef<any>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const pickerMarkerRef = useRef<LeafletMarker | null>(null);
  const userLocationMarkerRef = useRef<LeafletMarker | null>(null);
  const clickedMarkerRef = useRef<LeafletMarker | null>(null);

  const onCoordinatesChangeRef = useRef(onCoordinatesChange);
  useEffect(() => {
    onCoordinatesChangeRef.current = onCoordinatesChange;
  }, [onCoordinatesChange]);

  const isPickerRef = useRef(isPicker);
  useEffect(() => {
    isPickerRef.current = isPicker;
  }, [isPicker]);

  const prevCenterRef = useRef<string>(`${center[0].toFixed(5)},${center[1].toFixed(5)}`);

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
      leafletRef.current = L;

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

      // In picker mode, if selectedCoordinates already provided on mount, place marker immediately
      if (isPickerRef.current && selectedCoordinates) {
        const pickerIcon = createPickerIcon(L);
        const marker = L.marker(selectedCoordinates, {
          icon: pickerIcon,
          draggable: true,
          zIndexOffset: 3000,
        }).addTo(map);

        marker.on('dragend', (dragEvt: any) => {
          const pos = dragEvt.target.getLatLng();
          if (onCoordinatesChangeRef.current) {
            onCoordinatesChangeRef.current([pos.lat, pos.lng]);
          }
        });

        pickerMarkerRef.current = marker;
      }

      // Handle map clicks (Takes clicks, points to exact location, reverse-geocodes)
      map.on('click', async (e) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        // In Picker mode: immediately pin location at exact click coordinates without resetting camera or reloading tiles
        if (isPickerRef.current) {
          const LeafletLib = leafletRef.current || L;
          if (!pickerMarkerRef.current) {
            const pickerIcon = createPickerIcon(LeafletLib);
            const marker = LeafletLib.marker([lat, lng], {
              icon: pickerIcon,
              draggable: true,
              zIndexOffset: 3000,
            }).addTo(map);

            marker.on('dragend', (dragEvt: any) => {
              const pos = dragEvt.target.getLatLng();
              if (onCoordinatesChangeRef.current) {
                onCoordinatesChangeRef.current([pos.lat, pos.lng]);
              }
            });

            pickerMarkerRef.current = marker;
          } else {
            pickerMarkerRef.current.setLatLng([lat, lng]);
          }

          if (onCoordinatesChangeRef.current) {
            onCoordinatesChangeRef.current([lat, lng]);
          }
          return;
        }

        // Show immediate clicked marker with loading popup for explore mode
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

      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      if (mapContainerRef.current) {
        resizeObserver.observe(mapContainerRef.current);
      }

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

  // Center pan when center prop changes (smoothly pan without jerking or resetting manual zoom)
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current) return;
    const centerKey = `${center[0].toFixed(5)},${center[1].toFixed(5)}`;
    if (prevCenterRef.current === centerKey) return;
    prevCenterRef.current = centerKey;

    const map = mapInstanceRef.current;
    const curCenter = map.getCenter();
    const distance = Math.hypot(curCenter.lat - center[0], curCenter.lng - center[1]);
    if (distance < 0.0001) return;

    const targetZoom = isPicker ? Math.max(map.getZoom(), zoom || 14) : (zoom || 14);
    map.flyTo(center, targetZoom, { animate: true, duration: 0.8 });
  }, [mapLoaded, center[0], center[1], zoom, isPicker]);

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

      tickets.forEach((ticket) => {
        let pinColor = '#dc2626'; // Red for open/critical

        if (ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED') {
          pinColor = '#d97706'; // Amber
        } else if (ticket.status === 'PROVISIONALLY_RESOLVED' || ticket.status === 'PENDING_APPROVAL') {
          pinColor = '#7c3aed'; // Violet
        } else if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
          pinColor = '#059669'; // Green
        }

        const customHtml = `
          <div style="background-color: ${pinColor}; width: 24px; height: 24px; border-radius: 50%; border: 2.5px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.35); cursor: pointer;" class="${
            ticket.urgency === 'CRITICAL' ? 'pulse-critical' : ''
          }">
            <span style="width: 6px; height: 6px; background: white; border-radius: 50%;"></span>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'civic-marker-pin',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        const marker = L.marker([ticket.latitude, ticket.longitude], { icon });

        if (isPicker) {
          const statusLabel =
            ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED'
              ? 'In Progress'
              : ticket.status === 'PROVISIONALLY_RESOLVED' || ticket.status === 'PENDING_APPROVAL'
              ? 'Pending Sign-off'
              : ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'
              ? 'Resolved'
              : 'Open';

          marker.bindPopup(`
            <div style="font-family: inherit; font-size: 12px; min-width: 170px; padding: 2px;">
              <span style="font-size: 10px; font-weight: 800; color: ${pinColor}; text-transform: uppercase;">
                ● ${statusLabel}
              </span>
              <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-top: 3px; line-height: 1.3;">
                ${ticket.title}
              </div>
              <div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                ${ticket.category} &bull; #${ticket.caseId}
              </div>
            </div>
          `);
        } else {
          marker.on('click', () => router.push(`/ticket/${ticket.caseId}`));
        }

        markersLayer.addLayer(marker);
      });
    });
  }, [mapLoaded, tickets, isPicker, router]);

  // Update Location Picker marker when selectedCoordinates prop changes externally
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !isPicker) return;

    const L = leafletRef.current;
    const map = mapInstanceRef.current;
    if (!map) return;

    const syncMarker = (leafletLib: any) => {
      if (selectedCoordinates) {
        if (!pickerMarkerRef.current) {
          const pickerIcon = createPickerIcon(leafletLib);
          const marker = leafletLib.marker(selectedCoordinates, {
            icon: pickerIcon,
            draggable: true,
            zIndexOffset: 3000,
          }).addTo(map);

          marker.on('dragend', (dragEvt: any) => {
            const pos = dragEvt.target.getLatLng();
            if (onCoordinatesChangeRef.current) {
              onCoordinatesChangeRef.current([pos.lat, pos.lng]);
            }
          });

          pickerMarkerRef.current = marker;
        } else {
          const cur = pickerMarkerRef.current.getLatLng();
          if (Math.abs(cur.lat - selectedCoordinates[0]) > 0.00001 || Math.abs(cur.lng - selectedCoordinates[1]) > 0.00001) {
            pickerMarkerRef.current.setLatLng(selectedCoordinates);
          }
        }
      } else if (!selectedCoordinates && pickerMarkerRef.current) {
        pickerMarkerRef.current.remove();
        pickerMarkerRef.current = null;
      }
    };

    if (L) {
      syncMarker(L);
    } else {
      import('leaflet').then((leafletLib) => {
        leafletRef.current = leafletLib;
        syncMarker(leafletLib);
      });
    }
  }, [mapLoaded, selectedCoordinates?.[0], selectedCoordinates?.[1], isPicker]);

  // If clickedLocation is cleared externally
  useEffect(() => {
    if (!clickedLocation && clickedMarkerRef.current) {
      clickedMarkerRef.current.remove();
      clickedMarkerRef.current = null;
    }
  }, [clickedLocation]);

  return (
    <div className={`relative isolate z-0 w-full h-full overflow-hidden bg-slate-900 ${className || 'aspect-square rounded-2xl'}`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Subtle Inset Edge Bevel / Shadow for map boundary */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.25)] z-10" />

      {/* FLOATING "LOCATE ME" / CURRENT GPS POSITION BUTTON */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
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
    </div>
  );
}
