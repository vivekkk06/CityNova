'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  FileText,
  Camera,
  MapPin,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Building,
  Upload,
  ThumbsUp,
  MessageSquare,
  Scale,
  Crosshair,
  Trash2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VoiceRecorder from '@/components/VoiceRecorder';
import type { AIStructuredDraft } from '@/lib/ai';

const CivicMap = dynamic(() => import('@/components/CivicMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
      Loading GIS Map Picker...
    </div>
  ),
});

export default function ReportPage() {
  const router = useRouter();

  // Wizard Step: 1 = Intake, 2 = AI Draft Review, 3 = GIS Location, 4 = Confirmation/Deduplication
  const [step, setStep] = useState<number>(1);

  // Step 1: Raw Intake
  const [rawText, setRawText] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Step 2: AI Draft Structured State
  const [draft, setDraft] = useState<AIStructuredDraft>({
    title: '',
    description: '',
    category: 'Pothole & Road Damage',
    urgency: 'MEDIUM',
    suggested_department: 'PUBLIC_WORKS',
    plain_language_rights: 'Under the Municipal Citizen Charter, all grievances are resolved with a legal time limit.',
  });

  // Step 3: GIS Location State (Default: Ponda Municipal Council, Upper Bazar)
  const [coordinates, setCoordinates] = useState<[number, number]>([15.4026, 74.0135]);
  const [addressLandmark, setAddressLandmark] = useState('Near PMC Municipal Building, Upper Bazar, Ponda, Goa');
  const [citizenName, setCitizenName] = useState('Rohan Borkar');
  const [citizenPhone, setCitizenPhone] = useState('+91-98221-55667');

  // Step 4: Deduplication Check State
  const [duplicateAlert, setDuplicateAlert] = useState<any[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);

  // Photo change handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // Remove photo handler
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  // Voice note transcript completed
  const handleVoiceTranscript = (transcript: string, audio?: File) => {
    setRawText((prev) => (prev ? `${prev} ${transcript}` : transcript));
    if (audio) setAudioFile(audio);
  };

  // Step 1 -> Step 2: Request AI Structuring
  const handleGenerateAiDraft = async () => {
    if (!rawText.trim()) {
      alert('Please speak or type a brief description of the civic problem.');
      return;
    }

    setIsAiLoading(true);
    try {
      const res = await fetch('/api/tickets/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });

      const data = await res.json();
      if (data.draft) {
        setDraft(data.draft);
        setStep(2);
      } else {
        throw new Error(data.error || 'Failed to parse draft');
      }
    } catch (err) {
      console.error('AI Draft generation failed:', err);
      setDraft({
        title: rawText.slice(0, 60),
        description: rawText,
        category: 'Pothole & Road Damage',
        urgency: 'MEDIUM',
        suggested_department: 'PUBLIC_WORKS',
        plain_language_rights: 'Under the Municipal Citizen Charter, all grievances are resolved with a legal time limit.',
      });
      setStep(2);
    } finally {
      setIsAiLoading(false);
    }
  };

  // GPS "Locate Me" button
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates([pos.coords.latitude, pos.coords.longitude]);
          setAddressLandmark(`GPS Coordinates [${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}]`);
        },
        (err) => {
          console.warn('Geolocation failed:', err);
          alert('GPS location permission denied. Using selected map pin.');
        }
      );
    }
  };

  // Step 3 -> Step 4: Perform Spatial Deduplication Check
  const handleCheckDuplicatesAndProceed = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          category: draft.category,
          latitude: coordinates[0],
          longitude: coordinates[1],
          checkDuplicatesOnly: true,
        }),
      });

      const data = await res.json();
      if (data.duplicatesFound && data.duplicates.length > 0) {
        setDuplicateAlert(data.duplicates);
      } else {
        setDuplicateAlert(null);
      }
      setStep(4);
    } catch (err) {
      console.error('Deduplication check error:', err);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final Submission Handler
  const handleFinalSubmit = async (bypass: boolean = false) => {
    setIsSubmitting(true);
    try {
      let initialPhotoUrl = '';
      let initialAudioUrl = '';

      // Upload Photo if present
      if (photoFile) {
        const formData = new FormData();
        formData.append('file', photoFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) initialPhotoUrl = data.url;
      }

      // Upload Audio if present
      if (audioFile) {
        const formData = new FormData();
        formData.append('file', audioFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) initialAudioUrl = data.url;
      }

      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: draft.title,
          description: draft.description,
          category: draft.category,
          urgency: draft.urgency,
          plainLanguageRights: draft.plain_language_rights,
          latitude: coordinates[0],
          longitude: coordinates[1],
          addressDescription: addressLandmark,
          citizenName,
          citizenPhone,
          initialPhotoUrl: initialPhotoUrl || undefined,
          initialAudioUrl: initialAudioUrl || undefined,
          bypassDuplicates: bypass,
        }),
      });

      const data = await res.json();
      if (data.success && data.ticket) {
        setSubmittedCaseId(data.ticket.caseId);
      } else if (data.duplicateWarning) {
        setDuplicateAlert(data.duplicates);
      } else {
        throw new Error(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Final ticket submission failed:', err);
      alert('Failed to register grievance. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Pothole & Road Damage',
    'Garbage & Waste Accumulation',
    'Water Leakage / Pipe Burst',
    'Streetlight Outage',
    'Drainage & Sewer Overflow',
    'Illegal Encroachment',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Wizard Progress Stepper */}
        <div className="govt-card p-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: '1. Tell Us Problem', titleHi: 'समस्या' },
              { num: 2, title: '2. Review Details', titleHi: 'जाँचें' },
              { num: 3, title: '3. Pick Map Point', titleHi: 'स्थान' },
              { num: 4, title: '4. Confirm & Submit', titleHi: 'जमा करें' },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    step >= s.num
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {submittedCaseId ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                </div>
                <div className="hidden sm:block">
                  <span
                    className={`text-xs font-bold block ${
                      step >= s.num ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="text-[10px] text-slate-500 block -mt-0.5">{s.titleHi}</span>
                </div>
                {idx < 3 && <div className="w-6 sm:w-12 h-0.5 bg-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: Tell Us What is Broken */}
        {step === 1 && !submittedCaseId && (
          <div className="govt-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                Step 1 &bull; पहला चरण
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Describe the Civic Problem &bull; समस्या का विवरण दें
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You can speak using the microphone, upload a photo of the problem, or type in simple language.
              </p>
            </div>

            {/* Voice Recording Widget */}
            <VoiceRecorder onTranscriptComplete={handleVoiceTranscript} />

            {/* Text Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                What is the problem? / क्या समस्या है? *
              </label>
              <textarea
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Example: Big pothole on road near petrol pump, or water leaking from pipe, or garbage not picked up..."
                className="w-full text-sm p-4 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Photo Attachment */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Attach Photo of Problem &bull; समस्या का फोटो जोड़ें (Optional)
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-500 text-xs font-semibold text-slate-700 cursor-pointer transition-colors bg-slate-50 hover:bg-orange-50/50">
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
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 shadow-sm group">
                    <img
                      src={photoPreview}
                      alt="Selected preview"
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

            {/* Next Action */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={handleGenerateAiDraft}
                disabled={isAiLoading || !rawText.trim()}
                className="btn-saffron flex items-center gap-2 px-6 py-3 text-xs font-bold shadow-md hover:scale-105 disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>{isAiLoading ? 'Analyzing grievance...' : 'Review & Next &rarr;'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review & Edit Details */}
        {step === 2 && !submittedCaseId && (
          <div className="govt-card p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  Step 2 &bull; दूसरा चरण
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  Review Grievance Details &bull; विवरण जाँचें
                </h2>
                <p className="text-xs text-slate-500">
                  Please review the title, category, and urgency. You can edit any field.
                </p>
              </div>

              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                ✓ Ready for Review
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Complaint Title &bull; शीर्षक *
                </label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Problem Category &bull; समस्या का प्रकार *
                  </label>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Urgency Level &bull; तात्कालिकता *
                  </label>
                  <select
                    value={draft.urgency}
                    onChange={(e) =>
                      setDraft({ ...draft, urgency: e.target.value as AIStructuredDraft['urgency'] })
                    }
                    className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="LOW">LOW &bull; General Maintenance (सामान्य)</option>
                    <option value="MEDIUM">MEDIUM &bull; Standard Repair (मानक)</option>
                    <option value="HIGH">HIGH &bull; Public Safety Concern (उच्च)</option>
                    <option value="CRITICAL">CRITICAL &bull; Urgent Hazard (अति गंभीर)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Description &bull; पूरा विवरण
                </label>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="w-full text-sm p-3 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              {/* Citizen Charter Rights Box */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-start gap-3">
                <Scale className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-orange-900 uppercase">
                    Statutory Citizen Charter Guarantee &bull; नागरिक अधिकार
                  </h4>
                  <p className="text-xs text-orange-800 leading-relaxed">
                    Under the <strong>Right of Citizens to Time-Bound Delivery of Public Services Act</strong>, the designated Ward Engineer is legally bound to repair this grievance within statutory SLA hours.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setStep(3)}
                className="btn-saffron flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold shadow-md hover:scale-105 cursor-pointer"
              >
                <span>Select Location on Map &rarr;</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Pin Location on Map */}
        {step === 3 && !submittedCaseId && (
          <div className="govt-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-orange-600 block mb-1">
                  Step 3 &bull; तीसरा चरण
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>Pin Location on Map &bull; मानचित्र पर स्थान चुनें</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Click on the map or click &quot;Use My Current GPS&quot; to set the exact spot.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex items-center gap-1.5 px-3 py-2 bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold rounded-xl hover:bg-orange-100 transition-colors cursor-pointer"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Use My Current GPS (मेरा स्थान)</span>
              </button>
            </div>

            {/* Interactive Leaflet Map in Picker Mode */}
            <div className="h-[360px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <CivicMap
                center={coordinates}
                isPicker={true}
                selectedCoordinates={coordinates}
                onCoordinatesChange={(coords) => setCoordinates(coords)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Landmark / Street Address *
                </label>
                <input
                  type="text"
                  value={addressLandmark}
                  onChange={(e) => setAddressLandmark(e.target.value)}
                  placeholder="e.g. Near Market Gate, Main Road"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Geocoded Coordinates
                </label>
                <input
                  type="text"
                  readOnly
                  value={`Lat: ${coordinates[0].toFixed(5)}, Lng: ${coordinates[1].toFixed(5)}`}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono"
                />
              </div>
            </div>

            {/* Citizen Details */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Citizen Contact (Masked automatically on public view for privacy)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="Your Name (आपका नाम)"
                  className="text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
                <input
                  type="text"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="Mobile Phone (फ़ोन नंबर)"
                  className="text-xs p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={handleCheckDuplicatesAndProceed}
                disabled={isSubmitting}
                className="btn-saffron flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold shadow-md hover:scale-105 cursor-pointer"
              >
                <span>{isSubmitting ? 'Checking proximity...' : 'Check & Finalize &rarr;'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Confirm & Submit */}
        {step === 4 && !submittedCaseId && (
          <div className="govt-card p-6 sm:p-8 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                Step 4 &bull; अंतिम चरण
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Confirm & Seal Grievance &bull; पुष्टि करें
              </h2>
              <p className="text-xs text-slate-500">
                Review your report summary. Once submitted, an official legal SLA commitment will be sealed on the ledger.
              </p>
            </div>

            {/* Duplicate Notice if neighbor reported nearby */}
            {duplicateAlert && duplicateAlert.length > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      Neighbor Already Reported a Similar Issue Nearby!
                    </h4>
                    <p className="text-xs text-amber-800 mt-1">
                      A complaint ({duplicateAlert[0].caseId}) exists within {duplicateAlert[0].distanceMeters || 30}m. 
                      You can upvote it to escalate repair priority without creating duplicates.
                    </p>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-700">{duplicateAlert[0].caseId}</span>
                    <h5 className="text-xs font-bold text-slate-900 mt-0.5">{duplicateAlert[0].title}</h5>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/ticket/${duplicateAlert[0].caseId}`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Upvote Existing</span>
                  </button>
                </div>
              </div>
            )}

            {/* Summary Review Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[11px]">Problem Title:</span>
                  <strong className="text-slate-900 text-sm font-bold block">{draft.title}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Category:</span>
                  <span className="font-bold text-slate-800">{draft.category} ({draft.urgency})</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Location Landmark:</span>
                  <span className="font-semibold text-slate-800">{addressLandmark}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Statutory SLA Guarantee:</span>
                  <span className="font-bold text-emerald-700">24h - 48h Time-Bound Redressal</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Change Location</span>
              </button>

              <div className="flex gap-2">
                {duplicateAlert && duplicateAlert.length > 0 && (
                  <button
                    onClick={() => handleFinalSubmit(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                  >
                    Submit Anyway
                  </button>
                )}

                <button
                  onClick={() => handleFinalSubmit(false)}
                  disabled={isSubmitting}
                  className="btn-saffron flex items-center gap-2 px-6 py-3 text-xs font-bold shadow-md hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting Grievance...' : 'Submit & Seal Public Commitment'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SUBMISSION SUCCESS CARD */}
        {submittedCaseId && (
          <div className="govt-card p-8 text-center space-y-6 border-emerald-300 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest font-bold text-emerald-700 block">
                Grievance Registered Successfully &bull; शिकायत दर्ज हुई
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Case Sealed: <span className="text-orange-600">{submittedCaseId}</span>
              </h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your civic grievance has been entered into the public ledger. An official time-bound countdown has started, and the Ward Engineer has been notified.
              </p>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => router.push(`/ticket/${submittedCaseId}`)}
                className="btn-saffron px-6 py-3 text-xs font-bold shadow-md hover:scale-105 transition-transform cursor-pointer flex items-center gap-2"
              >
                <span>View Promise-to-Proof Ledger</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSubmittedCaseId(null);
                  setStep(1);
                  setRawText('');
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="px-5 py-3 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                File Another Report
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
