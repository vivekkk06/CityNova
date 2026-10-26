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
          alert('GPS permission not granted. Using current simulated coordinates.');
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
    setSubmissionError(null);
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

      if (!uploadData.url) throw new Error('Photo upload failed');

      // 2. Submit Geo-Gated Resolution
      const res = await fetch(`/api/tickets/${selectedTask.id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolutionPhotoUrl: uploadData.url,
          resolutionGpsLat: currentGps[0],
          resolutionGpsLng: currentGps[1],
          resolutionNotes: resolutionNotes || 'Repairs completed according to standard engineering specifications.',
          officerName: 'Datta Gaonkar (PWD Works Division XIV, Ponda)',
          allowGpsOverride: allowGpsOverride,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmissionError(data.error || 'Failed to submit proof of work.');
        return;
      }

      alert('Proof of Work submitted! Ticket is now PROVISIONALLY RESOLVED, awaiting citizen sign-off.');
      setSelectedTask(null);
      loadTasks();
    } catch (err: any) {
      console.error(err);
      setSubmissionError(err.message || 'Error uploading proof of work.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Mobile App Header Banner */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                Mobile Field Officer Terminal
              </div>
              <h1 className="text-xl font-extrabold">Field Work Orders (Ponda Municipal Council)</h1>
              <p className="text-xs text-blue-100">
                Logged in as <strong>Datta Gaonkar</strong> (PWD Works Division XIV, Ponda)
              </p>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black">{tasks.length}</span>
              <span className="text-[10px] uppercase font-bold text-blue-200 block">
                Pending Fixes
              </span>
            </div>
          </div>

          {/* Field GPS Status Bar */}
          <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 font-mono text-blue-100">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              GPS: {currentGps[0].toFixed(4)}, {currentGps[1].toFixed(4)}
              {isGpsLive && <span className="text-emerald-300 font-bold">(Live Device GPS)</span>}
            </span>

            <button
              onClick={handleDeviceGps}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
            >
              Sync Device GPS
            </button>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-600" />
            Assigned Work Orders
          </h2>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Loading field dispatch tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All Field Tasks Cleared!
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                No open work orders in your ward sector. Great job!
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
                  className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                        {task.caseId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{task.addressDescription}</p>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        task.urgency === 'CRITICAL'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {task.urgency}
                    </span>
                  </div>

                  {/* Incident Photo thumbnail if available */}
                  {task.initialPhotoUrl && (
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={task.initialPhotoUrl}
                        alt="Initial problem photo"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        BEFORE (REPORTED)
                      </div>
                    </div>
                  )}

                  {/* Distance from Worker */}
                  <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-blue-500" />
                      Distance from you: <strong>{distance}m</strong>
                    </span>
                    <span className="text-[11px] font-mono">
                      SLA: {new Date(task.slaDeadline).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/ticket/${task.caseId}`}
                      className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Inspect Dossier
                    </Link>

                    <button
                      onClick={() => handleOpenResolveModal(task)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-transform hover:scale-105 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Proof of Work & Resolve
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Proof of Work Geo-Gated Resolution Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-600">
                    {selectedTask.caseId}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    Submit Geo-Gated Proof of Work
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="text-slate-400 hover:text-slate-600 text-xl cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {submissionError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-start gap-2 border border-red-200 dark:border-red-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{submissionError}</span>
                </div>
              )}

              <form onSubmit={handleResolveSubmit} className="space-y-4">
                {/* Photo Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Take &lsquo;After&rsquo; Resolution Photo * (Mandatory)
                  </label>
                  <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl cursor-pointer transition-colors bg-slate-50 dark:bg-slate-800/40">
                    <Camera className="w-8 h-8 text-emerald-600 mb-2" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {resolutionPhoto ? resolutionPhoto.name : 'Tap to Capture or Upload &lsquo;After&rsquo; Photo'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">
                      Photo will be verified with GPS location and timestamp.
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
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        AFTER PHOTO READY
                      </div>
                    </div>
                  )}
                </div>

                {/* Geo-Gating coordinates verification indicator */}
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Incident Coordinates:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedTask.latitude.toFixed(4)}, {selectedTask.longitude.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-500">Current Field GPS:</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {currentGps[0].toFixed(4)}, {currentGps[1].toFixed(4)}
                    </span>
                  </div>
                </div>

                {/* Resolution Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Engineering Resolution Notes
                  </label>
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="e.g. Cleared 150kg solid waste, sanitized drain with lime powder; asphalt patched with hot mix..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !resolutionPhoto}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isSubmitting ? 'Uploading & Geotagging...' : 'Mark Provisionally Resolved'}
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
