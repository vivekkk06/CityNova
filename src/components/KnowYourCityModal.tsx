'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Compass,
  PhoneCall,
  MapPin,
  Building2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  CheckCircle2,
  HelpCircle,
  LogIn,
  User,
  ShieldCheck,
  Building,
  Navigation,
  RefreshCw,
  Layers,
  FileText,
  Users,
  AlertCircle,
  X,
  ChevronRight,
  Flame,
  PlusCircle,
} from 'lucide-react';
import { CityInfo, CitySummary } from '@/data/cities/types';
import {
  getCitizenProfile,
  loginCitizen,
  updateCitizenCity,
  logoutCitizen,
  onCitizenProfileChange,
  CitizenProfile,
} from '@/lib/citizenAuth';

// Dynamically load the Leaflet Facilities Map without SSR
const CityFacilitiesMap = dynamic(() => import('@/components/CityFacilitiesMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 border border-slate-200">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="font-bold text-xs">Loading Interactive City Map...</span>
      </div>
    </div>
  ),
});

type TabType = 'all' | 'emergency' | 'offices' | 'services' | 'representatives' | 'map' | 'notices';

interface KnowYourCityModalProps {
  onClose: () => void;
}

export default function KnowYourCityModal({ onClose }: KnowYourCityModalProps) {
  const [profile, setProfile] = useState<CitizenProfile | null>(null);
  const [availableCities, setAvailableCities] = useState<CitySummary[]>([]);
  const [cityData, setCityData] = useState<CityInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab & Search
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Login / Profile Update State
  const [loginName, setLoginName] = useState<string>('Rohan Borkar');
  const [loginPhone, setLoginPhone] = useState<string>('+91-98221-55667');
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [isChangingCity, setIsChangingCity] = useState<boolean>(false);

  // 1. Initial Profile & City List Load
  useEffect(() => {
    const currentProfile = getCitizenProfile();
    setProfile(currentProfile);

    // Fetch list of available cities
    fetch('/api/city-info')
      .then((res) => res.json())
      .then((data) => {
        if (data.availableCities) {
          setAvailableCities(data.availableCities);
        }
      })
      .catch((err) => console.error('Failed to load available cities:', err));

    // Listen for profile changes from elsewhere in the app
    const unsubscribe = onCitizenProfileChange((newProfile) => {
      setProfile(newProfile);
    });

    return () => unsubscribe();
  }, []);

  // 2. Fetch City Details whenever the citizen profile city changes
  useEffect(() => {
    if (!profile || !profile.isLoggedIn || !profile.city) {
      setCityData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/city-info?city=${encodeURIComponent(profile.city)}`)
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error || 'Failed to retrieve city information');
        }
        setCityData(json.city);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading city data:', err);
        setError(err.message || 'Failed to fetch information for your city.');
        setLoading(false);
      });
  }, [profile?.city, profile?.isLoggedIn]);

  // Handle Quick Citizen Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) return;

    const matched = availableCities.find((c) => c.id === selectedCityId);
    const newProfile = loginCitizen({
      name: loginName || 'Citizen Resident',
      phone: loginPhone || '',
      city: matched ? matched.name : selectedCityId,
      state: matched ? matched.state : '',
    });
    setProfile(newProfile);
  };

  // Handle City Update
  const handleUpdateCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCityId) return;

    const matched = availableCities.find((c) => c.id === selectedCityId);
    const updated = updateCitizenCity(
      matched ? matched.name : selectedCityId,
      matched ? matched.state : ''
    );
    setProfile(updated);
    setIsChangingCity(false);
  };

  // One-click demo logins for convenience
  const handleDemoLogin = (cityName: string, defaultName: string) => {
    const matched = availableCities.find(
      (c) => c.name.toLowerCase() === cityName.toLowerCase() || c.id.toLowerCase() === cityName.toLowerCase()
    );
    const newProfile = loginCitizen({
      name: defaultName,
      phone: '+91-98221-55667',
      city: matched ? matched.name : cityName,
      state: matched ? matched.state : 'Goa',
    });
    setProfile(newProfile);
  };

  const handleLogout = () => {
    logoutCitizen();
    setProfile(null);
    setCityData(null);
  };

  // Filtered Items based on Search Query
  const query = searchQuery.trim().toLowerCase();

  const filteredEmergency = (cityData?.emergencyContacts || []).filter(
    (item) =>
      query === '' ||
      item.service.toLowerCase().includes(query) ||
      item.number.includes(query) ||
      item.description.toLowerCase().includes(query)
  );

  const filteredOffices = (cityData?.governmentOffices || []).filter(
    (item) =>
      query === '' ||
      item.name.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      item.address.toLowerCase().includes(query)
  );

  const filteredServices = (cityData?.publicServices || []).filter(
    (item) =>
      query === '' ||
      item.serviceName.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.responsibleAuthority.toLowerCase().includes(query)
  );

  const filteredRepresentatives = (cityData?.representatives || []).filter(
    (item) =>
      query === '' ||
      item.designation.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.jurisdiction.toLowerCase().includes(query)
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          STATE 1: LOGGED OUT - Welcoming Prompt (No City Hardcoded)
      ========================================================================== */}
      {(!profile || !profile.isLoggedIn) && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-6 sm:p-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Compass className="w-7 h-7" />
            </div>
            <div className="max-w-xl mx-auto space-y-2">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Welcome to Know Your City
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                CityNova delivers hyper-local municipal information tailored to your specific city. Please log in with your citizen account to access your local municipal council or corporation, 24x7 verified emergency helplines, ward representatives, and interactive city map.
              </p>
            </div>

            {/* Quick Sign-In Form */}
            <div className="max-w-md mx-auto pt-2 text-left">
              <form
                onSubmit={handleLoginSubmit}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5"
              >
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Citizen Quick Sign-In</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Rohan Borkar"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Your City
                  </label>
                  <select
                    required
                    value={selectedCityId}
                    onChange={(e) => setSelectedCityId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-blue-500 focus:bg-white text-slate-900 font-medium"
                  >
                    <option value="">-- Choose Your City --</option>
                    {availableCities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}, {c.state} ({c.governingBodyName})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!selectedCityId}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Access My City Information Hub</span>
                </button>
              </form>
            </div>

            {/* Instant Demo Switchers */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                Or instantly explore a demo city profile:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Ponda', 'Rohan Borkar')}
                  className="px-3 py-1.5 rounded-lg bg-orange-100/70 hover:bg-orange-100 text-orange-800 text-xs font-bold border border-orange-200 transition-colors cursor-pointer"
                >
                  🌴 Ponda, Goa (PMC)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Panaji', 'Maria Fernandes')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100/70 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                >
                  🏛️ Panaji, Goa (CCP)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Bengaluru', 'Anand Kumar')}
                  className="px-3 py-1.5 rounded-lg bg-purple-100/70 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors cursor-pointer"
                >
                  🏙️ Bengaluru (BBMP)
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('Mumbai', 'Pooja Sharma')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
                >
                  🌊 Mumbai (BMC)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STATE 2: LOGGED IN BUT MISSING CITY
      ========================================================================== */}
      {profile?.isLoggedIn && !profile.city && (
        <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/60 text-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Hello, {profile.name}! Please Select Your City
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                Your authenticated citizen account is active, but your profile has not been assigned a registered city. Please select your city to display verified municipal offices, emergency hotlines, and ward resources.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateCitySubmit} className="max-w-md pt-2 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Choose City &amp; Municipal Jurisdiction
              </label>
              <select
                required
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select Your City --</option>
                {availableCities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}, {c.state} ({c.governingBodyName})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!selectedCityId}
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              Save City to Profile
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          STATE 3: LOGGED IN WITH CITY SELECTED - Dynamic City Information Hub
      ========================================================================== */}
      {profile?.isLoggedIn && profile.city && (
        <div className="space-y-6">
          {/* Authenticated Citizen City Header & Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Authenticated Citizen</span>
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {profile.name}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{cityData?.name || profile.city}</span>
                <span className="text-sm font-normal text-slate-400">
                  &bull; {cityData?.state || profile.state}
                </span>
              </h3>
              <p className="text-xs text-slate-300 font-medium">
                {cityData?.governingBodyName || 'Local Municipal Authority'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsChangingCity(!isChangingCity)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>Switch City</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-semibold border border-red-500/30 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Quick City Switcher Dropdown (When triggered) */}
          {isChangingCity && (
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">
                  Switch Your City Profile:
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingCity(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableCities.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      updateCitizenCity(c.name, c.state);
                      setIsChangingCity(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                      profile.city?.toLowerCase() === c.name.toLowerCase()
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {c.name}, {c.state}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading and Error States */}
          {loading && (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold">Loading official data for {profile.city}...</p>
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span>Error retrieving city data</span>
              </div>
              <p>{error}</p>
            </div>
          )}

          {!loading && cityData && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={`Search offices, emergency numbers, services, or representatives in ${cityData.name}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50/60 focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-100">
                {[
                  { id: 'all', label: 'All Categories' },
                  { id: 'emergency', label: '🚨 Emergency Contacts' },
                  { id: 'offices', label: '🏛️ Govt Offices' },
                  { id: 'services', label: '🛠️ Public Services' },
                  { id: 'representatives', label: '👥 Representatives' },
                  { id: 'map', label: '🗺️ Interactive Map' },
                  { id: 'notices', label: '📢 Notices & Portals' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* =========================================================================
                  CATEGORY B: EMERGENCY CONTACTS (Prominently Placed Near Top)
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'emergency') && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        24x7 Verified Emergency Helplines &bull; {cityData.name}
                      </h4>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      Tap to Call Enabled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredEmergency.map((contact) => (
                      <div
                        key={contact.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-xs transition-all flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                              {contact.service}
                            </span>
                            {contact.isNationalNumber && (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                                National
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {contact.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {contact.availableHours}
                          </span>
                          <a
                            href={`tel:${contact.number.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs transition-colors"
                          >
                            <PhoneCall className="w-3 h-3 text-red-600" />
                            <span>{contact.number}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  CATEGORY C: INTERACTIVE CITY MAP
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'map') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <span>Verified Public Facilities &amp; Map &bull; {cityData.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Center: {cityData.coordinates.lat.toFixed(4)}°N, {cityData.coordinates.lng.toFixed(4)}°E
                    </span>
                  </div>

                  <CityFacilitiesMap
                    facilities={cityData.facilities}
                    center={cityData.coordinates}
                    cityName={cityData.name}
                    zoom={cityData.coordinates.defaultZoom}
                  />
                </div>
              )}

              {/* =========================================================================
                  CATEGORY A: MUNICIPAL & GOVERNMENT OFFICES
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'offices') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <Building2 className="w-4 h-4 text-slate-700" />
                      <span>Municipal &amp; Government Offices &bull; {cityData.name}</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                      Verified Official Directories
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredOffices.map((office) => (
                      <div
                        key={office.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block">
                              {office.department}
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5">
                              {office.name}
                            </h5>
                          </div>
                          {office.isVerified && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{office.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{office.workingHours}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <a
                            href={`tel:${office.phone.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-emerald-700"
                          >
                            <PhoneCall className="w-3 h-3 text-emerald-600" />
                            <span>{office.phone}</span>
                          </a>

                          <div className="flex items-center gap-3 text-[11px]">
                            {office.websiteUrl && (
                              <a
                                href={office.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <span>Website</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${office.latitude},${office.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-bold text-orange-600 hover:text-orange-700"
                            >
                              <Navigation className="w-3 h-3" />
                              <span>Map Directions</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  CATEGORY D: ESSENTIAL PUBLIC SERVICES
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'services') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <Layers className="w-4 h-4 text-purple-600" />
                      <span>Essential Public Services &amp; Redressal Portals</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredServices.map((service) => (
                      <div
                        key={service.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all space-y-2.5"
                      >
                        <div>
                          <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {service.serviceName}
                          </h5>
                          <span className="text-[11px] font-semibold text-purple-700 block mt-0.5">
                            Authority: {service.responsibleAuthority}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {service.description}
                        </p>

                        {service.statutorySla && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 font-medium">
                            ⏱️ <strong>Statutory SLA:</strong> {service.statutorySla}
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                          <a
                            href={`tel:${service.contactNumber.replace(/[^0-9+]/g, '')}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:text-emerald-700"
                          >
                            <PhoneCall className="w-3 h-3 text-emerald-600" />
                            <span>{service.contactNumber}</span>
                          </a>

                          {service.complaintPortalUrl && (
                            <a
                              href={service.complaintPortalUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:text-purple-900 hover:underline"
                            >
                              <span>Official Portal</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  CATEGORY E: LOCAL REPRESENTATIVES
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'representatives') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span>Know Your Local Representatives &amp; Public Offices</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Public office contacts only &bull; No private data exposed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredRepresentatives.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider block">
                              {rep.designation}
                            </span>
                            <h5 className="font-extrabold text-slate-900 text-xs sm:text-sm mt-0.5">
                              {rep.name}
                            </h5>
                            <span className="text-[11px] text-slate-500 block">
                              Jurisdiction: {rep.jurisdiction}
                            </span>
                          </div>
                          {rep.isVerified ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded shrink-0">
                              Verified Office
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shrink-0">
                              Awaiting Verification
                            </span>
                          )}
                        </div>

                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                            <span>{rep.officeAddress}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Official Contact: {rep.officeContact}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 text-[10px] text-emerald-900">
                          ℹ️ {rep.verificationNote}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* =========================================================================
                  CATEGORY F: NOTICES & OFFICIAL PORTALS
              ========================================================================== */}
              {(activeTab === 'all' || activeTab === 'notices') && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm sm:text-base">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span>Verified Local Announcements &amp; Official Portals</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Last Verified: {cityData.lastVerifiedDate}
                    </span>
                  </div>

                  {/* Announcements */}
                  <div className="space-y-2.5">
                    {cityData.announcements.map((anc) => (
                      <div
                        key={anc.id}
                        className="p-3.5 rounded-xl border border-orange-200 bg-orange-50/40 space-y-1.5 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                            {anc.title}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Updated: {anc.lastUpdatedDate}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                          {anc.summary}
                        </p>
                        <div className="pt-1 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500">Source: {anc.sourceName}</span>
                          <a
                            href={anc.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-orange-700 font-bold hover:underline"
                          >
                            <span>Official Source</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Official Portals */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {cityData.officialPortals.map((portal, idx) => (
                      <a
                        key={idx}
                        href={portal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-xs transition-all flex flex-col justify-between gap-2 group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs group-hover:text-blue-700">
                              {portal.title}
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {portal.description}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-blue-600">
                          Visit Official Portal &rarr;
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

