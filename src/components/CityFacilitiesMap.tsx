'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  MapPin,
  PhoneCall,
  ExternalLink,
  Search,
  Filter,
  Navigation,
  Building2,
  Shield,
  Flame,
  PlusCircle,
  Building,
} from 'lucide-react';
import type { Map as LeafletMap, LayerGroup } from 'leaflet';
import { CityFacility } from '@/data/cities/types';

interface CityFacilitiesMapProps {
  facilities: CityFacility[];
  center: { lat: number; lng: number };
  cityName: string;
  zoom?: number;
}

export default function CityFacilitiesMap({
  facilities,
  center,
  cityName,
  zoom = 14,
}: CityFacilitiesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFacility, setSelectedFacility] = useState<CityFacility | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const filteredFacilities = facilities.filter((f) => {
    const matchesCat = selectedCategory === 'all' || f.category === selectedCategory;
    const matchesQuery =
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const getCategoryColor = (cat: CityFacility['category']) => {
    switch (cat) {
      case 'hospital':
        return '#dc2626'; // Red
      case 'police':
        return '#2563eb'; // Blue
      case 'fire':
        return '#ea580c'; // Orange
      case 'municipal':
        return '#059669'; // Emerald
      case 'government':
        return '#7c3aed'; // Purple
      case 'transit':
        return '#0891b2'; // Cyan
      default:
        return '#475569';
    }
  };

  const getCategoryIconSvg = (cat: CityFacility['category']) => {
    switch (cat) {
      case 'hospital':
        return '🏥';
      case 'police':
        return '🚓';
      case 'fire':
        return '🚒';
      case 'municipal':
        return '🏛️';
      case 'government':
        return '🏢';
      case 'transit':
        return '🚌';
      default:
        return '📍';
    }
  };

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      // Use clean standard OSM / Carto light basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 250);

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
  }, [center.lat, center.lng, zoom]);

  // Update Markers when filters change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markersLayerRef.current) return;

    let isMounted = true;

    async function renderMarkers() {
      const L = await import('leaflet');
      if (!isMounted || !markersLayerRef.current || !mapInstanceRef.current) return;

      markersLayerRef.current.clearLayers();

      filteredFacilities.forEach((facility) => {
        const pinColor = getCategoryColor(facility.category);
        const iconSvg = getCategoryIconSvg(facility.category);

        const customIcon = L.divIcon({
          className: 'custom-facility-pin',
          html: `
            <div style="
              width: 34px;
              height: 34px;
              border-radius: 50%;
              background-color: ${pinColor};
              border: 2px solid white;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.25);
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              cursor: pointer;
              transition: transform 0.15s ease;
            ">
              ${iconSvg}
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -34],
        });

        const popupContent = `
          <div style="padding: 4px; font-family: inherit; max-width: 240px;">
            <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: ${pinColor}; margin-bottom: 2px;">
              ${facility.category}
            </div>
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 4px; line-height: 1.2;">
              ${facility.name}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 6px; line-height: 1.3;">
              ${facility.address}
            </div>
            ${
              facility.phone
                ? `<div style="margin-bottom: 6px;">
                    <a href="tel:${facility.phone}" style="font-size: 11px; font-weight: 700; color: #0284c7; text-decoration: none;">
                      📞 ${facility.phone}
                    </a>
                  </div>`
                : ''
            }
            <div style="padding-top: 6px; border-top: 1px solid #e2e8f0;">
              <a href="https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 style="display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; color: #ea580c; text-decoration: none;">
                🧭 Open Directions &rarr;
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([facility.latitude, facility.longitude], { icon: customIcon });
        marker.bindPopup(popupContent);
        marker.on('click', () => setSelectedFacility(facility));
        markersLayerRef.current?.addLayer(marker);
      });
    }

    renderMarkers();

    return () => {
      isMounted = false;
    };
  }, [filteredFacilities, mapLoaded]);

  const handleFlyTo = (facility: CityFacility) => {
    setSelectedFacility(facility);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([facility.latitude, facility.longitude], 16, {
        duration: 1.2,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls: Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search facilities in ${cityName}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All' },
            { id: 'municipal', label: '🏛️ Municipal' },
            { id: 'hospital', label: '🏥 Healthcare' },
            { id: 'police', label: '🚓 Police' },
            { id: 'fire', label: '🚒 Fire' },
            { id: 'government', label: '🏢 Govt' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-80 sm:h-96 z-0" />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-slate-50/90 flex items-center justify-center text-slate-500 text-xs font-bold gap-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading {cityName} Interactive Map...</span>
          </div>
        )}

        <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-slate-200 text-[10px] text-slate-600 font-medium shadow-xs">
          📍 {filteredFacilities.length} verified public facilities shown in {cityName}
        </div>
      </div>

      {/* Facility Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
        {filteredFacilities.map((fac) => (
          <div
            key={fac.id}
            className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between gap-2 cursor-pointer ${
              selectedFacility?.id === fac.id
                ? 'border-blue-400 bg-blue-50/60 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            onClick={() => handleFlyTo(fac)}
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">
                  {fac.name}
                </span>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white shrink-0"
                  style={{ backgroundColor: getCategoryColor(fac.category) }}
                >
                  {fac.category}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] mt-1 line-clamp-1">{fac.address}</p>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
              {fac.phone ? (
                <a
                  href={`tel:${fac.phone}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 font-bold text-slate-700 hover:text-emerald-700 text-[11px]"
                >
                  <PhoneCall className="w-3 h-3 text-emerald-600" />
                  <span>{fac.phone}</span>
                </a>
              ) : (
                <span className="text-slate-400 text-[10px]">Official Office</span>
              )}

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${fac.latitude},${fac.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700 text-[11px]"
              >
                <Navigation className="w-3 h-3" />
                <span>Directions</span>
              </a>
            </div>
          </div>
        ))}
        {filteredFacilities.length === 0 && (
          <div className="col-span-full py-6 text-center text-slate-400 text-xs">
            No public facilities match your search filter.
          </div>
        )}
      </div>
    </div>
  );
}

