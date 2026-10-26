'use client';

import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  XCircle,
  Upload,
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
  disputePhotoUrl?: string | null;
  onVerify?: () => Promise<void>;
  onDispute?: (reason: string, photoUrl?: string) => Promise<void>;
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
  disputePhotoUrl,
  onVerify,
  onDispute,
  isCitizenUser = true,
}: ProofComparisonProps) {
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeInput, setDisputeInput] = useState('');
  const [disputeFile, setDisputeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isProvisionallyResolved = status === 'PROVISIONALLY_RESOLVED';
  const isDisputed = status === 'DISPUTED';
  const isVerified = status === 'RESOLVED' || status === 'CLOSED';

  const handleDisputeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeInput.trim()) return;

    setIsSubmitting(true);
    try {
      let uploadedPhotoUrl = '';
      if (disputeFile) {
        const formData = new FormData();
        formData.append('file', disputeFile);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.url) uploadedPhotoUrl = data.url;
      }

      if (onDispute) {
        await onDispute(disputeInput, uploadedPhotoUrl);
      }
      setShowDisputeModal(false);
    } catch (err) {
      console.error('Error submitting dispute:', err);
      alert('Failed to submit dispute.');
    } finally {
      setIsSubmitting(false);
    }
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
            <span>Before & After Photo Proof of Work &bull; काम का सचित्र प्रमाण</span>
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
              Citizen Inspected & Verified (सत्यापित समाधान)
            </span>
          )}
          {isDisputed && (
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
              <strong>Ward Staff Notes:</strong> &ldquo;{resolutionNotes}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Dispute Callout if ticket is disputed */}
      {isDisputed && disputeReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-red-800 font-bold">
            <AlertTriangle className="w-4 h-4" />
            <span>Citizen Dispute Escalated to Zonal Supervisor</span>
          </div>
          <p className="text-slate-800 italic bg-white p-3 rounded-lg border border-red-200">
            &ldquo;{disputeReason}&rdquo;
          </p>
          {disputePhotoUrl && (
            <div className="mt-2">
              <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                Citizen Dispute Evidence Photo:
              </span>
              <img
                src={disputePhotoUrl}
                alt="Dispute evidence"
                className="w-48 h-32 object-cover rounded-lg border border-red-300"
              />
            </div>
          )}
        </div>
      )}

      {/* Two-Stage Resolution Gate Citizen Action Bar */}
      {isProvisionallyResolved && isCitizenUser && (
        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 space-y-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-orange-600" />
              <span>Citizen Sign-Off Required &bull; आपका सत्यापन आवश्यक है</span>
            </h4>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              Municipal field staff has submitted the completion photo above. As the reporting citizen,
              you have the sovereign authority to inspect the work and confirm resolution:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={onVerify}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Close Ticket &bull; काम पूरा हुआ (सत्यापित करें)</span>
            </button>

            <button
              onClick={() => setShowDisputeModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Dispute & Reopen Case &bull; असंतुष्ट (पुनः खोलें)</span>
            </button>
          </div>
        </div>
      )}

      {/* Citizen Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span>Dispute Resolution & Escalate &bull; असंतोष दर्ज करें</span>
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please explain why the repair is inadequate. Your dispute will reopen the ticket and escalate it directly to the Zonal Supervisor for executive audit.
            </p>

            <form onSubmit={handleDisputeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reason for Dispute / Deficiency Found *
                </label>
                <textarea
                  required
                  rows={3}
                  value={disputeInput}
                  onChange={(e) => setDisputeInput(e.target.value)}
                  placeholder="e.g. Only gravel was poured, pothole is still sinking; or waste was only partially cleared..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Attach Photo Evidence (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDisputeFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !disputeInput.trim()}
                  className="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg cursor-pointer"
                >
                  {isSubmitting ? 'Escalating...' : 'Submit Dispute to Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
