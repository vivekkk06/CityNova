'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck,
  XCircle,
  Eye,
  MessageSquare,
  X,
} from 'lucide-react';

interface ProofComparisonProps {
  ticketId: string;
  initialPhotoUrl?: string | null;
  resolutionPhotoUrl?: string | null;
  resolutionGpsLat?: number | null;
  resolutionGpsLng?: number | null;
  resolutionTimestamp?: string | Date | null;
  resolutionNotes?: string | null;
  status: string;
  disputeReason?: string | null;
  onVerify?: (comment?: string) => Promise<void>;
  onDispute?: (reason: string) => Promise<void>;
  isCitizenUser?: boolean;
}

export default function ProofComparison({
  ticketId,
  initialPhotoUrl,
  resolutionPhotoUrl,
  resolutionGpsLat,
  resolutionGpsLng,
  resolutionTimestamp,
  resolutionNotes,
  status,
  disputeReason,
  onVerify,
  onDispute,
  isCitizenUser = true,
}: ProofComparisonProps) {
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffComment, setSignOffComment] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInput, setDisputeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when either modal is active
  useEffect(() => {
    if (showSignOffModal || showDisputeModal) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [showSignOffModal, showDisputeModal]);

  const isProvisionallyResolved = status === 'PROVISIONALLY_RESOLVED';
  const isDisputed = status === 'DISPUTED';
  const isVerified = status === 'RESOLVED' || status === 'CLOSED';

  const handleVerifySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onVerify) {
        await onVerify(signOffComment.trim());
      }
      setShowSignOffModal(false);
      setSignOffComment('');
    } catch (err) {
      console.error('Error submitting sign-off:', err);
      alert('Failed to submit sign-off.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInput.trim()) return;

    setIsSubmitting(true);
    try {
      if (onDispute) {
        await onDispute(disputeInput.trim());
      }
      setShowDisputeModal(false);
      setDisputeInput('');
    } catch (err) {
      console.error('Error submitting dispute:', err);
      alert('Failed to submit dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderModal = (content: React.ReactNode) => {
    if (!mounted || typeof document === 'undefined') return null;
    return createPortal(content, document.body);
  };

  return (
    <div className="govt-card bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block mb-0.5">
            Two-Stage Resolution Gate &bull; समाधान प्रमाण
          </span>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Before &amp; After Photo Proof of Work &bull; काम का सचित्र प्रमाण</span>
          </h3>
        </div>

        <div>
          {isProvisionallyResolved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              Pending Citizen Sign-Off (नागरिक सत्यापन बाकी)
            </span>
          )}
          {isVerified && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Citizen Inspected &amp; Verified (सत्यापित समाधान)
            </span>
          )}
          {(isDisputed || (status === 'IN_PROGRESS' && disputeReason)) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              Escalated to Zonal Supervisor (पुनः जाँच हेतु प्रेषित)
            </span>
          )}
        </div>
      </div>

      {/* Before & After Dual Photographic Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Initial / Before Photo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Stage 1: Before Repair (समस्या का फोटो)</span>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Original Report</span>
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            {initialPhotoUrl ? (
              <img
                src={initialPhotoUrl}
                alt="Initial civic issue condition"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                <Camera className="w-8 h-8 mb-2 opacity-50" />
                <span className="text-xs">No initial photograph provided</span>
              </div>
            )}
            <div className="absolute top-2 left-2 bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
              BEFORE (पहले)
            </div>
          </div>
        </div>

        {/* Resolution / After Photo */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Stage 2: After Repair (मरम्मत के बाद का प्रमाण)</span>
            {resolutionTimestamp && (
              <span className="text-[10px] text-emerald-700 font-mono font-bold">
                ✓ Geo-Tag Verified
              </span>
            )}
          </div>

          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
            {resolutionPhotoUrl ? (
              <img
                src={resolutionPhotoUrl}
                alt="Field completion resolution photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 p-4 text-center">
                <Clock className="w-8 h-8 mb-2 text-amber-500 animate-spin" />
                <span className="text-xs font-bold text-slate-700">
                  Field work in progress
                </span>
                <span className="text-[10px] text-slate-500">
                  Awaiting geo-tagged completion photo from worker
                </span>
              </div>
            )}
            {resolutionPhotoUrl && (
              <div className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3" /> AFTER (मरम्मत के बाद)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Field Geotagging & Officer Notes */}
      {(resolutionGpsLat || resolutionNotes) && (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <span className="flex items-center gap-1.5 font-semibold text-slate-900">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>On-Site Geo-Location Verification:</span>
              <span className="text-emerald-700 font-mono font-bold">
                Lat {resolutionGpsLat?.toFixed(4)}, Lng {resolutionGpsLng?.toFixed(4)}
              </span>
            </span>

            {resolutionTimestamp && (
              <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                {new Date(resolutionTimestamp).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {resolutionNotes && (
            <p className="text-slate-700 text-xs italic bg-white p-2.5 rounded-lg border border-slate-200">
              <strong>Resolution note:</strong> &ldquo;{resolutionNotes}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Dispute Callout if ticket is disputed */}
      {disputeReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Citizen Escalation · Complaint Returned to In Progress</span>
          </div>
          <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-red-200">
            &ldquo;{disputeReason}&rdquo;
          </p>
        </div>
      )}

      {/* Citizen Action Bar */}
      {isProvisionallyResolved && (
        <div className="bg-orange-50/90 p-5 rounded-2xl border-2 border-orange-200/90 shadow-xs space-y-3.5">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-orange-600 shrink-0" />
            <span>Citizen Sign-Off Required</span>
          </h4>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSignOffModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <Eye className="w-3.5 h-3.5 opacity-80" />
              <span>View &amp; Sign Off</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDisputeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 text-xs font-black rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <MessageSquare className="w-3.5 h-3.5 text-red-500" />
              <span>Create Dispute &amp; Comment</span>
            </button>
          </div>
        </div>
      )}

      {/* Citizen Sign-Off & Verification Modal */}
      {showSignOffModal && renderModal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowSignOffModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  Stage 2 Citizen Inspection Gate
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Inspect &amp; Sign Off Resolution</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSignOffModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Authority Resolution Note Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Official Response from Authority:
              </span>
              <p className="text-xs text-slate-800 font-medium italic">
                &ldquo;{resolutionNotes || 'After-repair photo proof submitted by an Authority Employee.'}&rdquo;
              </p>
              {resolutionTimestamp && (
                <p className="text-[10px] font-mono text-slate-500 pt-0.5">
                  Timestamp: {new Date(resolutionTimestamp).toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Photo Comparison in Modal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-700">Before Repair (समस्या)</span>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                  {initialPhotoUrl ? (
                    <img src={initialPhotoUrl} alt="Before" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">No initial photo</div>
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    BEFORE
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-800">After Repair (समाधान प्रमाण)</span>
                <div className="aspect-video rounded-lg overflow-hidden bg-slate-100 border border-emerald-300 relative">
                  {resolutionPhotoUrl ? (
                    <img src={resolutionPhotoUrl} alt="After" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">No after photo</div>
                  )}
                  <span className="absolute top-1.5 left-1.5 bg-emerald-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" /> AFTER
                  </span>
                </div>
              </div>
            </div>

            {/* Citizen Sign-Off Comment Form */}
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Citizen Verification Feedback / Comment (Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={signOffComment}
                  onChange={(e) => setSignOffComment(e.target.value)}
                  placeholder="e.g. Inspected in person. Work has been carried out satisfactorily and the area is clean. Thank you!"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Your sign-off will permanently close this docket and add your verification note to the public status history.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSignOffModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-black bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Signing Off...' : 'Confirm Sign-Off & Close Docket'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Citizen Dispute & Comment Modal */}
      {showDisputeModal && renderModal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowDisputeModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  Citizen Escalation Gate
                </span>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Dispute Resolution &amp; Comment</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Show Authority Response being commented on */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Authority&apos;s Submitted Note:
              </span>
              <p className="italic text-slate-800 font-medium">
                &ldquo;{resolutionNotes || 'After-repair photo proof submitted by an Authority Employee.'}&rdquo;
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Comment on the authority&apos;s response and explain what is defective or incomplete.
              Submitting this will return the complaint to <strong>In Progress</strong>, remove the rejected after-repair photo, and notify the municipal team.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-red-600" />
                  <span>Comment on Authority Response &amp; Reason for Dispute *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeInput}
                  onChange={(e) => setDisputeInput(e.target.value)}
                  placeholder="e.g. The garbage was only pushed to the roadside corner instead of being lifted; or the pothole was filled with loose mud which washed away..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !disputeInput.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Escalating...' : 'Submit Dispute & Return to In Progress'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
