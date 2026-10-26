'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Printer,
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
    const saved = localStorage.getItem('civiclens_demo_role') as UserRole | null;
    if (saved) setUserRole(saved);

    const onRoleChange = (e: any) => {
      if (e.detail?.role) setUserRole(e.detail.role);
    };

    window.addEventListener('civiclens_role_changed', onRoleChange);
    return () => window.removeEventListener('civiclens_role_changed', onRoleChange);
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
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading Promise-to-Proof Ledger...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Civic Record Not Found
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Could not locate case ID &ldquo;{id}&rdquo; in the municipal ledger.
          </p>
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg"
          >
            Return to Ledger Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
        {/* Top Back / Action bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Public Ledger
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-white text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Ledger Docket
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Docket link copied to clipboard!');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              Share Docket
            </button>
          </div>
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {ticket.title}
            </h2>
            <span className="text-xs font-semibold text-slate-500 font-mono">
              GPS: {ticket.latitude.toFixed(4)}, {ticket.longitude.toFixed(4)}
            </span>
          </div>

          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {ticket.description}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <span>
              <strong>Location:</strong> {ticket.addressDescription}
            </span>
            <span>&bull;</span>
            <span>
              <strong>Citizen:</strong> {ticket.citizenName} ({ticket.citizenPhone})
            </span>
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Loading ticket details...</span>
          </div>
        </div>
      }
    >
      <TicketDetailContent />
    </Suspense>
  );
}
