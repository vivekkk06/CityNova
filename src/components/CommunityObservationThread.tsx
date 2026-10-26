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
  const [authorName, setAuthorName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    } catch (err) {
      console.error('Error adding observation:', err);
      alert('Failed to add neighbor observation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getObservationTypeBadge = (type: string) => {
    switch (type) {
      case 'VERIFICATION':
        return { label: 'Eyewitness Verified', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' };
      case 'ADDITIONAL_PHOTO':
        return { label: 'Additional Photo Proof', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' };
      case 'CORRECTION':
        return { label: 'Location / Fact Correction', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' };
      default:
        return { label: 'Field Status Update', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      {/* Header with Upvote count */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-indigo-500" />
            Community Observation Thread
          </h3>
          <p className="text-xs text-slate-500">
            Neighbors can submit corroborating photos, condition changes, or verify repairs.
          </p>
        </div>

        <button
          onClick={handleUpvoteClick}
          disabled={hasUpvoted}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            hasUpvoted
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300'
              : 'bg-blue-600 hover:bg-blue-700 text-white hover:scale-105'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
          <span>{hasUpvoted ? 'Upvoted' : 'Upvote Priority'}</span>
          <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[11px] font-mono">
            {upvoteCount}
          </span>
        </button>
      </div>

      {/* Observation List */}
      <div className="space-y-3">
        {observations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <p className="text-xs text-slate-400">
              No neighbor observations recorded yet. Be the first to share an update from the scene!
            </p>
          </div>
        ) : (
          observations.map((obs) => {
            const badge = getObservationTypeBadge(obs.observationType);
            const dateObj = new Date(obs.createdAt);

            return (
              <div
                key={obs.id}
                className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                      {obs.authorName[0]?.toUpperCase() || 'N'}
                    </div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {obs.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400">({obs.authorRole})</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {dateObj.toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}{' '}
                    {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {obs.comment}
                </p>

                {obs.photoUrl && (
                  <div className="pt-1">
                    <img
                      src={obs.photoUrl}
                      alt="Neighbor observation"
                      className="w-36 h-24 object-cover rounded-lg border border-slate-300 dark:border-slate-700 hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Observation Form */}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Post Neighbor Observation
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Your Name / Alias
            </label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. Resident from Bldg 3 / Vikram P."
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Observation Type
            </label>
            <select
              value={observationType}
              onChange={(e) => setObservationType(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
            >
              <option value="STATUS_UPDATE">Status Update (e.g. work crew arrived)</option>
              <option value="VERIFICATION">Eyewitness Verification (confirmed issue)</option>
              <option value="ADDITIONAL_PHOTO">Additional Photographic Evidence</option>
              <option value="CORRECTION">Correction (e.g. wrong lane landmark)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Observation Comment *
          </label>
          <textarea
            required
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your eyewitness update, current ground condition, or verification details..."
            className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer">
            <Camera className="w-4 h-4 text-slate-400" />
            <span>{selectedFile ? selectedFile.name : 'Attach on-site photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Posting...' : 'Post Observation'}
          </button>
        </div>
      </form>
    </div>
  );
}
