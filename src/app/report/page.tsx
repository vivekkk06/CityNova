'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Camera,
  Trash2,
  Crosshair,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  Scale,
  ShieldCheck,
  Clock,
  Sparkles,
  Phone,
  User,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceRecorder from '@/components/VoiceRecorder';
import { useLanguage } from '@/lib/i18n';

const CivicMap = dynamic(() => import('@/components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
      Loading Google Maps GIS Layer...
    </div>
  ),
});

interface CityAreaOption {
  id: string;
  name: string;
  nameHi: string;
  nameKok: string;
  lat: number;
  lng: number;
}

const CITY_AREAS: CityAreaOption[] = [
  {
    id: 'ward-01',
    name: 'Ward 1 - Upper Bazar & Sadar Heritage (Central Market)',
    nameHi: 'वार्ड 1 - अपर बाज़ार एवं सदर हेरिटेज (केंद्रीय बाज़ार)',
    nameKok: 'वॉर्ड 1 - अपर बाझार आनी सादार (मध्यवर्ती बाजार)',
    lat: 15.4025,
    lng: 74.0135,
  },
  {
    id: 'ward-02',
    name: 'Ward 2 - Tisk & Khadpabandh (Kranti Maidan & Residential)',
    nameHi: 'वार्ड 2 - तिस्क एवं खडपाबांध (क्रांति मैदान व आवासीय)',
    nameKok: 'वॉर्ड 2 - तिस्क आनी खडपाबांध (क्रांती मैदान)',
    lat: 15.4085,
    lng: 74.018,
  },
  {
    id: 'ward-03',
    name: 'Ward 3 - Curti & Khandepar (Industrial & Highway Corridor)',
    nameHi: 'वार्ड 3 - कुर्ति एवं खांडेपार (औद्योगिक व हाईवे)',
    nameKok: 'वॉर्ड 3 - कुर्टी आनी खांडेपार (हायवे कॉरिडोअर)',
    lat: 15.415,
    lng: 74.025,
  },
  {
    id: 'ward-central',
    name: 'Ponda Municipal Core / Other Area',
    nameHi: 'पोंडा नगर पालिका क्षेत्र / अन्य क्षेत्र',
    nameKok: 'पोंडा पालिका क्षेत्र / हेर विभाग',
    lat: 15.4026,
    lng: 74.0151,
  },
];

const CATEGORIES = [
  {
    id: 'Pothole & Road Damage',
    icon: '🕳️',
    labelEn: 'Pothole & Road Damage',
    labelHi: 'सड़क खड्डे एवं क्षति',
    labelKok: 'रस्त्याचे खड्डे आनी मोडतोड',
  },
  {
    id: 'Water Leakage / Pipe Burst',
    icon: '💧',
    labelEn: 'Water Leak / Pipe Burst',
    labelHi: 'पानी पाइप लीकेज / बर्स्ट',
    labelKok: 'उदकाची पाईप गळती',
  },
  {
    id: 'Streetlight Outage',
    icon: '💡',
    labelEn: 'Streetlight Outage',
    labelHi: 'स्ट्रीट लाइट बंद',
    labelKok: 'रस्त्यावयले दिवे बंद',
  },
  {
    id: 'Garbage & Waste Accumulation',
    icon: '🗑️',
    labelEn: 'Garbage & Waste Pile',
    labelHi: 'कचरा एवं सफाई समस्या',
    labelKok: 'कचरो आनी नितळसाण',
  },
  {
    id: 'Drainage & Sewer Overflow',
    icon: '🌊',
    labelEn: 'Drainage & Sewer Overflow',
    labelHi: 'नाली / सीवर जाम',
    labelKok: 'गटारांचे उदक व्हांवप',
  },
  {
    id: 'Illegal Encroachment',
    icon: '🚧',
    labelEn: 'Encroachment / Public Hazard',
    labelHi: 'अतिक्रमण व बाधा',
    labelKok: 'बेकायदेशीर अतिक्रमण',
  },
];

export default function ReportPage() {
  const router = useRouter();
  const { language } = useLanguage();

  // Problem Form State
  const [category, setCategory] = useState<string>('Pothole & Road Damage');
  const [description, setDescription] = useState<string>('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // City Location State
  const [selectedAreaId, setSelectedAreaId] = useState<string>('ward-01');
  const [streetAddress, setStreetAddress] = useState<string>('Near PMC Municipal Building, Upper Bazar');
  const [coordinates, setCoordinates] = useState<[number, number]>([15.4025, 74.0135]);
  const [isGpsLoading, setIsGpsLoading] = useState<boolean>(false);
  const [showMapPicker, setShowMapPicker] = useState<boolean>(false);

  // Citizen Details State
  const [citizenName, setCitizenName] = useState<string>('Rohan Borkar');
  const [citizenPhone, setCitizenPhone] = useState<string>('+91-98221-55667');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any[] | null>(null);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  // Photo handlers
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Voice transcript handler
  const handleVoiceTranscript = (transcript: string, audio?: File) => {
    setDescription((prev) => (prev ? `${prev} ${transcript}` : transcript));
    if (audio) setAudioFile(audio);
  };

  // Area Selection handler
  const handleAreaChange = (areaId: string) => {
    setSelectedAreaId(areaId);
    const found = CITY_AREAS.find((a) => a.id === areaId);
    if (found) {
      setCoordinates([found.lat, found.lng]);
    }
  };

  // 1-Tap GPS Locate Handler
  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoordinates([lat, lng]);
        setStreetAddress((prev) =>
          prev && !prev.includes('GPS')
            ? `${prev} (GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)})`
            : `GPS Location [${lat.toFixed(5)}, ${lng.toFixed(5)}]`
        );
      },
      (err) => {
        setIsGpsLoading(false);
        console.warn('Geolocation error:', err);
        alert('Could not retrieve GPS location. Please select your area from the dropdown or type your street address.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // 1-Minute Direct Submission
  const handleSubmitGrievance = async (bypassDuplicate = false) => {
    if (!description.trim()) {
      alert('Please describe the problem or record a short voice note.');
      return;
    }

    if (!streetAddress.trim()) {
      alert('Please enter a street address or landmark in the city location section.');
      return;
    }

    setIsSubmitting(true);
    try {
      let initialPhotoUrl = '';
      let initialAudioUrl = '';

      // Upload photo if selected
      if (photoFile) {
        try {
          const formData = new FormData();
          formData.append('file', photoFile);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.url) initialPhotoUrl = data.url;
        } catch (e) {
          console.warn('Photo upload failed:', e);
        }
      }

      // Upload audio if recorded
      if (audioFile) {
        try {
          const formData = new FormData();
          formData.append('file', audioFile);
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.url) initialAudioUrl = data.url;
        } catch (e) {
          console.warn('Audio upload failed:', e);
        }
      }

      const title = description.length > 50 ? `${description.slice(0, 48)}...` : description;

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          category,
          urgency: 'MEDIUM',
          plainLanguageRights:
            'Under the Goa Right of Citizens to Time-Bound Delivery of Public Services Act 2013, municipal services must be resolved within statutory hours with photo proof.',
          latitude: coordinates[0],
          longitude: coordinates[1],
          addressDescription: streetAddress,
          citizenName: citizenName || 'Civic Resident',
          citizenPhone: citizenPhone || '+91-98221-55667',
          initialPhotoUrl: initialPhotoUrl || undefined,
          initialAudioUrl: initialAudioUrl || undefined,
          bypassDuplicates: bypassDuplicate,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setSubmittedCaseId(data.ticket.caseId);
        setDuplicateWarning(null);
      } else if (data.duplicateWarning) {
        setDuplicateWarning(data.duplicates);
      } else {
        throw new Error(data.error || 'Failed to submit grievance');
      }
    } catch (err) {
      console.error('Failed to submit grievance:', err);
      alert('Failed to register grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-orange-600 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>
              {language === 'kok' ? 'मुख्या पानाकडे परत' : language === 'hi' ? 'मुख्य पृष्ठ पर वापस' : 'Back to Home'}
            </span>
          </Link>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px]">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>1-Minute Fast Filing &bull; १ मिनिटात तक्रार</span>
          </span>
        </div>

        {/* SUCCESS CONFIRMATION SCREEN */}
        {submittedCaseId ? (
          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-emerald-300 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-black text-emerald-700 block">
                {language === 'kok'
                  ? 'तक्रार यशस्वीरित्या नोंदवली'
                  : language === 'hi'
                  ? 'शिकायत सफलतापूर्वक दर्ज हुई'
                  : 'Grievance Registered Successfully'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Official Case ID: <span className="text-orange-600">{submittedCaseId}</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your civic complaint is now sealed in the public municipal docket. Statutory resolution timer under the{' '}
                <strong>Goa Right to Public Services Act 2013</strong> is now active.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-xs text-left space-y-2">
              <div className="flex justify-between items-center text-slate-600">
                <span>Category:</span>
                <span className="font-bold text-slate-900">{category}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Location:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{streetAddress}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600">
                <span>Guaranteed SLA:</span>
                <span className="font-bold text-emerald-700">24h - 48h Time-Bound Redressal</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/ticket/${submittedCaseId}`)}
                className="btn-saffron px-6 py-3 text-xs font-bold shadow-md hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>View Promise-to-Proof Docket</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSubmittedCaseId(null);
                  setDescription('');
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="px-5 py-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                File Another Complaint
              </button>
            </div>
          </div>
        ) : (
          /* FAST 1-MINUTE SINGLE SCREEN FORM */
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-900 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Ponda Municipal Council &bull; पोंडा नगरपालिका</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {language === 'kok'
                  ? '१ मिनिटात जन तक्रार नोंदवा'
                  : language === 'hi'
                  ? '१ मिनट में जन शिकायत दर्ज करें'
                  : 'Report a Civic Problem'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600">
                Fast, 1-minute submission. Direct action by the municipal ward team with guaranteed time-bound resolution.
              </p>
            </div>

            {/* SECTION 1: WHAT IS THE PROBLEM? */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <span>
                    {language === 'kok'
                      ? 'समस्या काय आसा? (समस्येचो प्रकार निवडा)'
                      : language === 'hi'
                      ? 'समस्या क्या है? (समस्या का प्रकार चुनें)'
                      : 'What is the Problem?'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Choose a category and describe what needs to be fixed.
                </p>
              </div>

              {/* Category Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        isSelected
                          ? 'border-orange-600 bg-orange-50/70 text-orange-950 font-bold ring-2 ring-orange-500/20 shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-xs font-semibold leading-tight">
                        {language === 'kok' ? cat.labelKok : language === 'hi' ? cat.labelHi : cat.labelEn}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Voice Recorder Integration */}
              <VoiceRecorder onTranscriptComplete={handleVoiceTranscript} />

              {/* Description Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'kok'
                    ? 'तक्रारीचे विवरण • समस्या काय आसा?'
                    : language === 'hi'
                    ? 'समस्या का विवरण • क्या समस्या है? *'
                    : 'Problem Description *'}
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: Big pothole on road near petrol pump, or water leaking from pipe, or garbage not picked up..."
                  className="w-full text-sm p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              {/* Photo Upload (Optional) */}
              <div className="space-y-2 pt-1 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'kok'
                    ? 'समस्येचो फोटो जोडा (ऐच्छिक)'
                    : language === 'hi'
                    ? 'समस्या का फोटो जोड़ें (ऐच्छिक)'
                    : 'Attach Photo of Problem (Optional)'}
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 text-xs font-semibold text-slate-700 cursor-pointer transition-colors bg-slate-50 hover:bg-orange-50/40">
                    <Camera className="w-4 h-4 text-orange-600" />
                    <span>{photoFile ? photoFile.name : 'Click / Choose Photo (फोटो लें)'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>

                  {photoPreview && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 shadow-xs">
                      <img
                        src={photoPreview}
                        alt="Problem preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-80 hover:opacity-100 shadow-xs"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: LOCATION IN THE CITY (DEDICATED SECTION) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      {language === 'kok'
                        ? 'शहरांतील ठिकाण'
                        : language === 'hi'
                        ? 'शहर में स्थान (Location in the City) *'
                        : 'Location in the City *'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select your city area and landmark so municipal teams can find the spot instantly.
                  </p>
                </div>

                {/* 1-Tap GPS Button */}
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isGpsLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  <Crosshair className={`w-3.5 h-3.5 ${isGpsLoading ? 'animate-spin' : ''}`} />
                  <span>{isGpsLoading ? 'Locating...' : '📍 Auto-Detect My GPS'}</span>
                </button>
              </div>

              {/* Area / Ward Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'kok'
                    ? 'शहर विभाग / वॉर्ड'
                    : language === 'hi'
                    ? 'शहर का वार्ड / इलाका चुनें *'
                    : 'City Ward / Area *'}
                </label>
                <div className="relative">
                  <select
                    value={selectedAreaId}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3.5 pr-10 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {CITY_AREAS.map((area) => (
                      <option key={area.id} value={area.id}>
                        {language === 'kok' ? area.nameKok : language === 'hi' ? area.nameHi : area.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Street Address / Landmark Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {language === 'kok'
                    ? 'रस्तो, लँडमार्क वा पत्तो *'
                    : language === 'hi'
                    ? 'सड़क का नाम, निकटतम लैंडमार्क या पता *'
                    : 'Street Name, Landmark, or House/Shop No. *'}
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="e.g. Near Old Bus Stand, Opp PMC Building, Sadar Market entrance..."
                  className="w-full text-xs sm:text-sm p-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              {/* Optional Pin on Map Toggle */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowMapPicker((prev) => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  <span>{showMapPicker ? 'Hide Interactive Map' : '🗺️ Fine-tune Pin on Google Map / Satellite (Optional)'}</span>
                  {showMapPicker ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showMapPicker && (
                  <div className="mt-3 space-y-2">
                    <div className="h-72 w-full rounded-xl overflow-hidden border border-slate-300 shadow-inner">
                      <CivicMap
                        center={coordinates}
                        isPicker={true}
                        selectedCoordinates={coordinates}
                        onCoordinatesChange={(coords) => setCoordinates(coords)}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 font-mono">
                      <span>Latitude: {coordinates[0].toFixed(5)}</span>
                      <span>Longitude: {coordinates[1].toFixed(5)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: CITIZEN CONTACT & SUBMISSION */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <span>
                    {language === 'kok'
                      ? 'संपर्क तपशील व तक्रार नोंदणी'
                      : language === 'hi'
                      ? 'संपर्क विवरण एवं पुष्टि'
                      : 'Citizen Contact & Quick Submission'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Your phone number will be used to send SMS tracking updates. Private info is masked on the public ledger.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Your Name &bull; नाव</span>
                  </label>
                  <input
                    type="text"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                    placeholder="e.g. Rohan Borkar"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Mobile Number &bull; फोन नंबर (फॉर एसएमएस)</span>
                  </label>
                  <input
                    type="text"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                    placeholder="+91-98221-55667"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                  />
                </div>
              </div>

              {/* DUPLICATE WARNING MODAL / INLINE NOTICE */}
              {duplicateWarning && duplicateWarning.length > 0 && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-900">
                        Similar Active Issue Already Reported Nearby ({duplicateWarning[0].caseId})
                      </h4>
                      <p className="text-xs text-amber-800 mt-0.5">
                        A neighbor already reported &quot;{duplicateWarning[0].title}&quot; within 50m of this spot. You can upvote it for faster resolution, or submit your separate report.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/ticket/${duplicateWarning[0].caseId}`)}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Upvote Existing Issue</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitGrievance(true)}
                      disabled={isSubmitting}
                      className="px-3.5 py-1.5 border border-amber-400 text-amber-900 hover:bg-amber-100 rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Submit Anyway
                    </button>
                  </div>
                </div>
              )}

              {/* Statutory Guarantee Badge */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-900">
                <Scale className="w-4 h-4 text-blue-700 shrink-0" />
                <span>
                  <strong>Statutory Guarantee:</strong> 24 to 72 hours time-bound delivery with mandatory geo-tagged photo proof under the Goa Right to Public Services Act 2013.
                </span>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSubmitGrievance(false)}
                  disabled={isSubmitting || !description.trim()}
                  className="btn-saffron w-full py-4 rounded-xl text-sm font-black shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {isSubmitting
                      ? 'Submitting Grievance...'
                      : language === 'kok'
                      ? '🚀 १ मिनिटात तक्रार नोंदवा (Submit Grievance)'
                      : language === 'hi'
                      ? '🚀 १ मिनट में शिकायत दर्ज करें (Submit Grievance)'
                      : '🚀 Submit Grievance (1-Minute Fast Filing)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
