'use client';

import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquarePlus,
  Camera,
  CheckCircle,
  AlertTriangle,
  Flag,
  User,
  Clock,
  Send,
  Upload,
  ShieldCheck,
  CheckCircle2,
  Copy,
} from 'lucide-react';

export interface ObservationItem {
  id: string;
  authorName: string;
  authorRole: string;
  comment: string;
  photoUrl?: string | null;
  observationType: string;
  createdAt: string | Date;
}

interface CommunityObservationThreadProps {
  ticketId: string;
  upvoteCount: number;
  observations: ObservationItem[];
  onAddObservation: (comment: string, type: string, photoUrl?: string) => Promise<void>;
  onUpvote: () => Promise<void>;
}

export default function CommunityObservationThread({
  ticketId,
  upvoteCount,
  observations,
  onAddObservation,
  onUpvote,
}: CommunityObservationThreadProps) {
  const [comment, setComment] = useState('');
  const [observationType, setObservationType] = useState('STATUS_UPDATE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasConfirmedGenuine, setHasConfirmedGenuine] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagType, setFlagType] = useState<'DUPLICATE' | 'FAKE'>('DUPLICATE');
  const [flagReason, setFlagReason] = useState('');

  const handleConfirmGenuine = async () => {
    if (hasConfirmedGenuine) return;
    try {
      await onUpvote();
      await onAddObservation('Confirmed genuine by local resident.', 'VERIFICATION');
      setHasConfirmedGenuine(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagReason.trim()) return;

    try {
      const typeLabel = flagType === 'DUPLICATE' ? 'Flagged as Duplicate' : 'Flagged as Fake / Misleading';
      await onAddObservation(`[${typeLabel}]: ${flagReason.trim()}`, 'CORRECTION');
      setFlagModalOpen(false);
      setFlagReason('');
      alert('Your flag notice has been posted to the public ledger for zonal supervisor review.');
    } catch (err) {
      console.error(err);
      alert('Failed to submit flag notice.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      let photoUrl = '';
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) photoUrl = data.url;
      }

      await onAddObservation(comment.trim(), observationType, photoUrl || undefined);
      setComment('');
      setSelectedFile(null);
      setFilePreview(null);
    } catch (err) {
      console.error('Error adding observation:', err);
      alert('Failed to add citizen observation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getObservationTypeBadge = (type: string, commentText: string) => {
    if (commentText.includes('Flagged as Duplicate') || commentText.includes('Flagged as Fake')) {
      return { label: '🚩 Community Flag Notice', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    switch (type) {
      case 'VERIFICATION':
        return { label: '✓ Confirmed Genuine (सत्य)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ADDITIONAL_PHOTO':
        return { label: '📸 Photo Proof Evidence', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'CORRECTION':
        return { label: '⚠️ Community Correction / Flag', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: '💬 Resident Remark', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-6">
      {/* Header with Social Proof Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-blue-700" />
            <span>Community Peer Review &amp; Evidence Thread</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase">
              नागरिक पडताळणी
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ward residents can confirm reports as genuine, flag duplicates/fake claims, and provide additional photo evidence.
          </p>
        </div>

        {/* Action Buttons: Confirm Genuine & Flag Duplicate/Fake */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Confirm Genuine Button */}
          <button
            type="button"
            onClick={handleConfirmGenuine}
            disabled={hasConfirmedGenuine}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              hasConfirmedGenuine
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:scale-105'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{hasConfirmedGenuine ? 'Confirmed Genuine (सत्य)' : 'Confirm Genuine (सत्य)'}</span>
            <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-mono">
              {upvoteCount}
            </span>
          </button>

          {/* Flag Duplicate / Fake Button */}
          <button
            type="button"
            onClick={() => setFlagModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-300 hover:border-red-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-red-500" />
            <span>Flag Duplicate / Fake</span>
          </button>
        </div>
      </div>

      {/* Flag Duplicate / Fake Modal */}
      {flagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-600" />
                <span>Flag Civic Report &bull; तक्रार ध्वजांकन</span>
              </h4>
              <button
                type="button"
                onClick={() => setFlagModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFlagSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Flag Reason:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFlagType('DUPLICATE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      flagType === 'DUPLICATE'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-700" />
                    <span>Duplicate Report</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFlagType('FAKE')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      flagType === 'FAKE'
                        ? 'bg-red-100 border-red-400 text-red-900'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                    <span>Fake / Misleading</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Explanation / Evidence:
                </label>
                <textarea
                  rows={3}
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  placeholder={
                    flagType === 'DUPLICATE'
                      ? "Mention original case number (e.g. 'Already reported under #CTN-2026-W01-6143')..."
                      : "Explain why this report is inaccurate or already resolved..."
                  }
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Submit Public Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Observation List */}
      <div className="space-y-3">
        {observations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              No resident comments or flags recorded yet. Confirm this problem is genuine or attach evidence below!
            </p>
          </div>
        ) : (
          observations.map((obs) => {
            const badge = getObservationTypeBadge(obs.observationType, obs.comment);
            const dateObj = new Date(obs.createdAt);

            return (
              <div
                key={obs.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 text-[11px] font-bold">
                      {obs.authorName[0]?.toUpperCase() || 'C'}
                    </div>
                    <span className="text-xs font-bold text-slate-900">
                      {obs.authorName}
                    </span>
                    <span className="text-[10px] text-slate-500">({obs.authorRole})</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {dateObj.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-800 leading-relaxed font-sans">
                  {obs.comment}
                </p>

                {obs.photoUrl && (
                  <div className="pt-1">
                    <img
                      src={obs.photoUrl}
                      alt="Neighbor observation"
                      className="w-40 h-28 object-cover rounded-lg border-2 border-slate-200 hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Observation Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <MessageSquarePlus className="w-4 h-4 text-blue-700" />
          <span>Provide Comment or Additional Photo Evidence</span>
        </h4>

        {/* Observation Type Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'STATUS_UPDATE', label: '💬 General Update' },
            { id: 'VERIFICATION', label: '✓ Confirm Genuine' },
            { id: 'ADDITIONAL_PHOTO', label: '📸 Upload Photo Proof' },
            { id: 'CORRECTION', label: '📍 Landmark / Detail Correction' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setObservationType(type.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                observationType === type.id
                  ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your observation in plain language (e.g. 'I passed by this morning, work has started on the water pipe' or 'Debris still blocking the footpath')..."
          className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium"
          required
        />

        {/* Upload Photo Button & Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-blue-700" />
              <span>{selectedFile ? 'Change Photo' : 'Attach Photo Proof'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSelectedFile(f);
                    setFilePreview(URL.createObjectURL(f));
                  }
                }}
              />
            </label>
            {selectedFile && (
              <span className="text-[11px] text-emerald-700 font-semibold truncate max-w-xs">
                {selectedFile.name}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSubmitting ? 'Posting...' : 'Post Public Remark'}</span>
          </button>
        </div>

        {filePreview && (
          <div className="relative w-32 h-20 rounded-lg overflow-hidden border border-slate-300 mt-2">
            <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]"
            >
              &times;
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
