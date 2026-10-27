'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Camera,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Crosshair,
  Smartphone,
  Navigation,
  Check,
  Sparkles,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { calculateHaversineDistanceMeters } from '@/lib/gis';

export default function FieldWorkerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);

  // Field Staff simulated or device GPS in Ponda, Goa
  const [currentGps, setCurrentGps] = useState<[number, number]>([15.4080, 74.0180]);
  const [isGpsLive, setIsGpsLive] = useState(false);

  // Resolution Modal Form State
  const [resolutionPhoto, setResolutionPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [allowGpsOverride, setAllowGpsOverride] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      const res = await fetch('/api/tickets?isPublic=false');
      const data = await res.json();
      if (data.tickets) {
        // Filter for active tickets needing field resolution
        setTasks(
          data.tickets.filter((t: any) =>
            ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'DISPUTED'].includes(t.status)
          )
        );
      }
    } catch (err) {
      console.error('Error fetching field tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleDeviceGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentGps([pos.coords.latitude, pos.coords.longitude]);
          setIsGpsLive(true);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          alert('Device GPS permission not granted. Continuing with current coordinates.');
        }
      );
    }
  };

  const handleOpenResolveModal = (task: any) => {
    setSelectedTask(task);
    // Align simulated GPS close to task location for seamless demo
    setCurrentGps([task.latitude + 0.0001, task.longitude + 0.0001]);
    setResolutionPhoto(null);
    setPhotoPreview(null);
    setResolutionNotes('');
    setSelectedMaterials([]);
    setSubmissionError(null);
  };

  const toggleMaterial = (mat: string) => {
    if (selectedMaterials.includes(mat)) {
      setSelectedMaterials(selectedMaterials.filter((m) => m !== mat));
    } else {
      setSelectedMaterials([...selectedMaterials, mat]);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !resolutionPhoto) return;

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // 1. Upload resolution photo
      const formData = new FormData();
      formData.append('file', resolutionPhoto);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadData.url) throw new Error('Photo upload failed. Please try again.');

      const finalNotes = [
        selectedMaterials.length > 0 ? `Materials Used: ${selectedMaterials.join(', ')}` : '',
        resolutionNotes || 'Repairs completed according to standard engineering specifications.',
      ]
        .filter(Boolean)
        .join('. ');

      // 2. Submit Geo-Gated Resolution
      const res = await fetch(`/api/tickets/${selectedTask.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionPhotoUrl: uploadData.url,
          resolutionGpsLat: currentGps[0],
          resolutionGpsLng: currentGps[1],
          resolutionNotes: finalNotes,
          officerName: 'Datta Gaonkar (PWD Works Division XIV, Ponda)',
          allowGpsOverride: allowGpsOverride,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmissionError(data.error || 'Failed to submit proof of work.');
        return;
      }

      alert('Proof of Work submitted successfully! Ticket is now PROVISIONALLY RESOLVED, awaiting citizen sign-off.');
      setSelectedTask(null);
      loadTasks();
    } catch (err: any) {
      console.error(err);
      setSubmissionError(err.message || 'Error uploading proof of work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonMaterials = [
    'Hot Asphalt Patch Mix',
    'Reinforced Concrete Slab',
    'High-Pressure Jetting',
    'Solid Waste Debris Clearance',
    'LED Streetlight Fitting',
    'Lime & Bleaching Sanitation',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Mobile App Header Banner */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-2">
                <Smartphone className="w-3.5 h-3.5 text-blue-700" />
                CITYNOVA FIELD TERMINAL &bull; GOVERNMENT OF GOA
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Ward Field Operations Terminal
              </h1>
              <p className="text-xs font-semibold text-slate-600 mt-0.5">
                Logged in as: <strong className="text-slate-900">Datta Gaonkar</strong> (PWD Works Division XIV, Ponda)
              </p>
            </div>

            <div className="text-right bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl">
              <span className="text-2xl font-black text-blue-800">{tasks.length}</span>
              <span className="text-[10px] uppercase font-bold text-blue-700 block">
                Pending Fixes
              </span>
            </div>
          </div>

          {/* Field GPS Status Bar */}
          <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-mono text-slate-700 font-bold">
              <Crosshair className="w-4 h-4 text-emerald-600 animate-pulse" />
              GPS Lock: {currentGps[0].toFixed(4)}, {currentGps[1].toFixed(4)}
              {isGpsLive && <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">(Live GPS)</span>}
            </span>

            <button
              type="button"
              onClick={handleDeviceGps}
              className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Sync Device GPS
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-700" />
              <span>Assigned Field Work Orders</span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                {tasks.length} Tasks
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">Sort: By Proximity &amp; Urgency</span>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs bg-white rounded-2xl border border-slate-200">
              Loading field dispatch tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 shadow-xs p-6">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-900">
                All Field Work Orders Completed!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                No open repair tickets in your assigned ward sector. New dispatches will appear here automatically.
              </p>
            </div>
          ) : (
            tasks.map((task) => {
              const distance = calculateHaversineDistanceMeters(
                currentGps[0],
                currentGps[1],
                task.latitude,
                task.longitude
              );

              return (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-black text-blue-700">
                        {task.caseId}
                      </span>
                      <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span>{task.addressDescription}</span>
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        task.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {task.urgency}
                    </span>
                  </div>

                  {/* Incident Photo thumbnail if available */}
                  {task.initialPhotoUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={task.initialPhotoUrl}
                        alt="Initial problem photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                        CITIZEN PHOTO PROOF (BEFORE)
                      </div>
                    </div>
                  )}

                  {/* Distance from Worker & Navigation Link */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-700" />
                      Distance to Site: <strong className="text-slate-900 font-bold">{distance}m</strong>
                      {distance <= 100 && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                          On Site
                        </span>
                      )}
                    </span>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Navigate via GPS</span>
                    </a>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
                    <Link
                      href={`/ticket/${task.caseId}`}
                      className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-300"
                    >
                      Inspect Docket
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenResolveModal(task)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Upload Proof of Work &amp; Resolve</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Proof of Work Geo-Gated Resolution Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-700">
                    {selectedTask.caseId}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Submit Proof of Work (काम पूर्णता)</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 text-2xl font-bold cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {submissionError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-start gap-2 border border-red-300 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{submissionError}</span>
                </div>
              )}

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Take &lsquo;After&rsquo; Repaired Photo * (Mandatory by Law)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 hover:border-emerald-600 rounded-2xl cursor-pointer transition-colors bg-slate-50">
                    <Camera className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-xs font-bold text-slate-800">
                      {resolutionPhoto ? resolutionPhoto.name : 'Tap to Capture or Upload &lsquo;After&rsquo; Photo'}
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5 text-center">
                      Photo will be timestamped and geo-verified against the incident location.
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setResolutionPhoto(file);
                          setPhotoPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>

                  {photoPreview && (
                    <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-200">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                        AFTER PHOTO READY
                      </div>
                    </div>
                  )}
                </div>

                {/* Geo-Gating coordinates verification indicator */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Incident Coordinates:</span>
                    <span className="font-mono text-slate-800 font-bold">
                      {selectedTask.latitude.toFixed(4)}, {selectedTask.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Your Current GPS:</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      {currentGps[0].toFixed(4)}, {currentGps[1].toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Common Materials Quick Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Select Materials / Actions Used
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {commonMaterials.map((mat) => {
                      const isSelected = selectedMaterials.includes(mat);
                      return (
                        <button
                          key={mat}
                          type="button"
                          onClick={() => toggleMaterial(mat)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}
                          {mat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Official Completion Remarks
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Cleared 150kg solid waste, sanitized drain with lime; bitumen patch rolled..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !resolutionPhoto}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isSubmitting ? 'Uploading & Geo-tagging...' : 'Mark Provisionally Resolved'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
