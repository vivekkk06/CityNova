'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Printer,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  Lock,
} from 'lucide-react';
import Navbar, { UserRole } from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommitmentCard from '@/components/CommitmentCard';
import ProofComparison from '@/components/ProofComparison';
import CommunityObservationThread from '@/components/CommunityObservationThread';
import ProvenanceTimeline from '@/components/ProvenanceTimeline';
import CivicMemorySection from '@/components/CivicMemorySection';

function TicketDetailContent() {
  const params = useParams();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [civicMemory, setCivicMemory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('CITIZEN');

  useEffect(() => {
    // Read current persona
    const saved = (localStorage.getItem('citynova_demo_role') || localStorage.getItem('civiclens_demo_role')) as UserRole | null;
    if (saved) setUserRole(saved);

    const onRoleChange = (e: any) => {
      if (e.detail?.role) setUserRole(e.detail.role);
    };

    window.addEventListener('citynova_role_changed', onRoleChange);
    window.addEventListener('civiclens_role_changed', onRoleChange);
    return () => {
      window.removeEventListener('citynova_role_changed', onRoleChange);
      window.removeEventListener('civiclens_role_changed', onRoleChange);
    };
  }, []);

  const loadTicketData = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const data = await res.json();
      if (data.ticket) {
        setTicket(data.ticket);
        setCivicMemory(data.civicMemory || []);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicketData();
  }, [id]);

  // Citizen Verify Action
  const handleVerifyResolution = async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Resolution confirmed and verified! Ticket permanently closed.');
        loadTicketData();
      }
    } catch (err) {
      console.error('Failed to verify:', err);
    }
  };

  // Citizen Dispute Action
  const handleDisputeResolution = async (reason: string, photoUrl?: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPUTE',
          disputeReason: reason,
          disputePhotoUrl: photoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert('Dispute recorded. Case has been escalated to Zonal Supervisor.');
        loadTicketData();
      }
    } catch (err) {
      console.error('Failed to dispute:', err);
    }
  };

  // Add Neighbor Observation
  const handleAddObservation = async (comment: string, type: string, photoUrl?: string) => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/observe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment,
          observationType: type,
          photoUrl,
          authorName: userRole === 'CITIZEN' ? 'Concerned Resident' : 'Field Staff Volunteer',
        }),
      });
      const data = await res.json();
      if (data.success) {
        loadTicketData();
      }
    } catch (err) {
      console.error('Failed to add observation:', err);
    }
  };

  // Upvote Ticket
  const handleUpvote = async () => {
    if (!ticket) return;
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/observe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isUpvoteOnly: true }),
      });
      const data = await res.json();
      if (data.success) {
        setTicket((prev: any) => ({ ...prev, upvoteCount: data.upvoteCount }));
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-600 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold">Loading Municipal Grievance Docket...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 text-2xl font-bold mb-3">
            !
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">
            Civic Record Not Found
          </h2>
          <p className="text-xs text-slate-600 max-w-sm mb-6">
            Could not locate Case Docket &ldquo;{id}&rdquo; in the municipal ledger. Please check the tracking number.
          </p>
          <Link
            href="/"
            className="px-5 py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-blue-800 transition-all"
          >
            Return to Public Portal
          </Link>
        </div>
      </div>
    );
  }

  // Calculate 4-step progress state
  const isResolved = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
  const isProvisionallyResolved = ticket.status === 'PROVISIONALLY_RESOLVED';
  const isInProgress = ticket.status === 'IN_PROGRESS' || ticket.status === 'ASSIGNED';

  let currentStepIndex = 1;
  if (isResolved) currentStepIndex = 4;
  else if (isProvisionallyResolved) currentStepIndex = 3;
  else if (isInProgress) currentStepIndex = 2;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-6">
        {/* Official Header Ribbon */}
        <div className="bg-white rounded-2xl p-5 border-2 border-slate-200 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold mb-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-700" />
                GOVERNMENT OF GOA &bull; PONDA MUNICIPAL COUNCIL (PMC)
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
                <span>Public Grievance Docket:</span>
                <span className="font-mono text-blue-700">{ticket.caseId}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory Public Service Guarantee under Goa Right to Public Services Act 2013 &bull; गोवा लोकसेवा हमी कायदा
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer transition-all shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Docket</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Docket link copied to clipboard!');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 text-xs font-bold cursor-pointer transition-all shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Link</span>
              </button>
            </div>
          </div>

          {/* 4-Stage Resolution Stepper */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { step: 1, label: '1. Registered & Docketed', desc: 'Case ID Generated' },
                { step: 2, label: '2. SLA Clock Active', desc: 'Engineer Dispatched' },
                { step: 3, label: '3. Repaired & Photo Proof', desc: 'Awaiting Citizen Sign-off' },
                { step: 4, label: '4. Verified & Closed', desc: 'SLA Guaranteed' },
              ].map((s) => {
                const isPassed = currentStepIndex > s.step;
                const isCurrent = currentStepIndex === s.step;

                return (
                  <div
                    key={s.step}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isPassed
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : isCurrent
                        ? 'bg-blue-50 border-blue-400 text-blue-900 shadow-xs font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : isCurrent ? (
                        <Clock className="w-4 h-4 text-blue-700 animate-pulse" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                      <span className="text-xs font-bold">{s.label}</span>
                    </div>
                    <span className="text-[10px] block opacity-80">{s.desc}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Grievance Ledger &amp; Map
          </Link>
        </div>

        {/* SECTION 1: Commitment Card */}
        <CommitmentCard
          caseId={ticket.caseId}
          legacyGrievanceNumber={ticket.legacyGrievanceNumber}
          departmentName={ticket.department?.name || 'Municipal Department'}
          departmentCode={ticket.department?.code || 'PWD'}
          assignedOfficerName={ticket.assignedOfficerName}
          publicCommitmentDate={ticket.publicCommitmentDate}
          slaDeadline={ticket.slaDeadline}
          urgency={ticket.urgency}
          status={ticket.status}
          plainLanguageRights={ticket.plainLanguageRights}
          wardName={ticket.ward?.name || 'Central Ward'}
          wardZone={ticket.ward?.zone || 'Zone A'}
        />

        {/* Complaint Summary Description */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                {ticket.category} &bull; {ticket.ward?.name || 'Central Ward'}
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                {ticket.title}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              GPS: {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
            {ticket.description}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 pt-3 border-t border-slate-200">
            <div className="flex flex-wrap items-center gap-2">
              <span>
                <strong>Specific Location:</strong> {ticket.addressDescription}
              </span>
              <span>&bull;</span>
              <span>
                <strong>Reported By:</strong> {ticket.citizenName} ({ticket.citizenPhone})
              </span>
            </div>

            {/* DPDP Act Privacy notice */}
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>DPDP Act 2023: Citizen Data Masked</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: Proof-of-Work Comparison & Two-Stage Resolution Gate */}
        <ProofComparison
          ticketId={ticket.id}
          initialPhotoUrl={ticket.initialPhotoUrl}
          resolutionPhotoUrl={ticket.resolutionPhotoUrl}
          resolutionGpsLat={ticket.resolutionGpsLat}
          resolutionGpsLng={ticket.resolutionGpsLng}
          resolutionTimestamp={ticket.resolutionTimestamp}
          resolutionNotes={ticket.resolutionNotes}
          status={ticket.status}
          disputeReason={ticket.disputeReason}
          disputePhotoUrl={ticket.disputePhotoUrl}
          onVerify={handleVerifyResolution}
          onDispute={handleDisputeResolution}
          isCitizenUser={userRole === 'CITIZEN' || userRole === 'MUNICIPAL_ADMIN'}
        />

        {/* SECTION 3: Community Observation Thread */}
        <CommunityObservationThread
          ticketId={ticket.id}
          upvoteCount={ticket.upvoteCount}
          observations={ticket.observations || []}
          onAddObservation={handleAddObservation}
          onUpvote={handleUpvote}
        />

        {/* SECTION 4: Civic Memory Section */}
        {civicMemory.length > 0 && <CivicMemorySection pastFixes={civicMemory} />}

        {/* SECTION 5: Provenance Audit Trail */}
        <div className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-xs">
          <ProvenanceTimeline logs={ticket.auditLogs || []} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function TicketDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
          <div className="flex items-center gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="w-5 h-5 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold">Loading grievance docket...</span>
          </div>
        </div>
      }
    >
      <TicketDetailContent />
    </Suspense>
  );
}
