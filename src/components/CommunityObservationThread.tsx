'use client';

import React, { useState } from 'react';
import {
  ThumbsUp,
  MessageSquarePlus,
  Camera,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  User,
  Clock,
  Sparkles,
  Send,
  Upload,
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
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const handleUpvoteClick = async () => {
    if (hasUpvoted) return;
    try {
      await onUpvote();
      setHasUpvoted(true);
    } catch (err) {
      console.error(err);
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

  const getObservationTypeBadge = (type: string) => {
    switch (type) {
      case 'VERIFICATION':
        return { label: 'Eyewitness Verified', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'ADDITIONAL_PHOTO':
        return { label: 'Photo Evidence', color: 'bg-blue-100 text-blue-800 border-blue-300' };
      case 'CORRECTION':
        return { label: 'Location Correction', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      default:
        return { label: 'Citizen Note', color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-6">
      {/* Header with Upvote count */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-blue-700" />
            <span>Community Remarks &amp; Citizen Notes</span>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase">
              नागरिक सहभाग
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Neighbors and ward residents can confirm the ground situation, post follow-up photos, or verify repairs.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUpvoteClick}
          disabled={hasUpvoted}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            hasUpvoted
              ? 'bg-blue-100 text-blue-800 border-2 border-blue-400'
              : 'bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white hover:scale-105'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
          <span>{hasUpvoted ? 'Upvoted by You' : 'Upvote Priority (+1)'}</span>
          <span className="bg-white/25 px-2 py-0.5 rounded-full text-xs font-mono">
            {upvoteCount}
          </span>
        </button>
      </div>

      {/* Observation List */}
      <div className="space-y-3">
        {observations.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <p className="text-xs font-medium text-slate-500">
              No citizen remarks recorded yet. If you are near this spot, share what you see!
            </p>
          </div>
        ) : (
          observations.map((obs) => {
            const badge = getObservationTypeBadge(obs.observationType);
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
          <span>Add Ground Update as a Resident / Passer-by</span>
        </h4>

        {/* Observation Type Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'STATUS_UPDATE', label: 'Field Status Update' },
            { id: 'VERIFICATION', label: '✅ Eyewitness Confirmation' },
            { id: 'ADDITIONAL_PHOTO', label: '📸 Photo Evidence' },
            { id: 'CORRECTION', label: '📍 Landmark Correction' },
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
          className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          required
        />

        {/* Upload Photo Button & Preview */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-semibold cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-blue-700" />
              <span>{selectedFile ? 'Change Photo' : 'Attach Photo'}</span>
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
            <span>{isSubmitting ? 'Posting...' : 'Post Public Update'}</span>
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
