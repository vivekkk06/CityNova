'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, Upload } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommitmentCard from '@/components/CommitmentCard';
import TicketHistory from '@/components/TicketHistory';
import { useAuth } from '@/lib/auth-context';

const STATUS_OPTIONS = [
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PROVISIONALLY_RESOLVED', label: 'Repaired & Photo Proof' },
];

const STATUS_STEPS = [
  { value: 'OPEN', label: 'Registered & Docketed' },
  ...STATUS_OPTIONS,
  { value: 'CLOSED', label: 'Closed' },
];

function AuthorityComplaintContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [ticket, setTicket] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== 'AUTHORITY') {
      router.replace('/posts');
      return;
    }
    let active = true;
    fetch(`/api/tickets/${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load complaint.');
        if (active) {
          setTicket(data.ticket);
          const currentStatus = data.ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : data.ticket.status;
          setStatus(STATUS_OPTIONS.some((option) => option.value === currentStatus) ? currentStatus : '');
        }
      })
      .catch((loadError) => { if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load complaint.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [authLoading, id, router, user?.role]);

  const saveStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!STATUS_OPTIONS.some((option) => option.value === status)) {
      setError('Choose an allowed status: In Progress or Repaired & Photo Proof.');
      return;
    }
    if (status === 'PROVISIONALLY_RESOLVED' && !photo) {
      setError('Upload the required Stage 2: After Repair image.');
      return;
    }
    const form = new FormData();
    form.set('status', status);
    form.set('comment', comment);
    if (photo) form.set('afterRepairPhoto', photo);
    setSaving(true);
    try {
      const response = await fetch(`/api/tickets/${encodeURIComponent(id)}/authority-status`, { method: 'PATCH', body: form });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update complaint.');
      setTicket((current: any) => ({ ...current, ...data.ticket }));
      setPhoto(null);
      setComment('');
      const input = document.getElementById('after-repair-photo') as HTMLInputElement | null;
      if (input) input.value = '';
      setSuccess('Complaint status updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not update complaint.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <Link href="/posts" className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-blue-700"><ArrowLeft className="h-4 w-4" />Back to Posts</Link>
        {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading complaint...</div> : !ticket ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error || 'Complaint not found.'}</div>
        ) : <>
          <header className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Authority Employee · Complaint Details</p>
            <h1 className="mt-2 text-2xl font-black">Public Grievance Docket: <span className="font-mono text-blue-700">{ticket.caseId}</span></h1>
            <p className="mt-1 text-sm text-slate-600">{ticket.city?.name || user?.city?.name || 'Your city'} · Complaint status and evidence</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-4">
              {STATUS_STEPS.map((item, index) => {
                const persistedStatus = ticket.status === 'ASSIGNED' ? 'IN_PROGRESS' : ticket.status;
                const currentIndex = Math.max(0, STATUS_STEPS.findIndex((option) => option.value === persistedStatus));
                return <div key={item.value} className={`rounded-xl border p-3 text-center text-xs font-bold ${index === currentIndex ? 'border-blue-400 bg-blue-50 text-blue-900' : index < currentIndex ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>{item.label}</div>;
              })}
            </div>
          </header>

          <CommitmentCard caseId={ticket.caseId} cityName={ticket.city?.name || user?.city?.name || 'Your city'} publicCommitmentDate={ticket.publicCommitmentDate} slaDeadline={ticket.slaDeadline} urgency={ticket.urgency} status={ticket.status} />

          <section className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">{ticket.category}</p>
              <h2 className="mt-1 text-xl font-extrabold">{ticket.title}</h2>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-red-600" />{ticket.addressDescription}</span>
              <span>Reported by: {ticket.citizenName}</span>
              <span>Reported: {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
            {ticket.initialPhotoUrl && <div><h3 className="mb-2 text-sm font-bold">Stage 1: Reported Issue</h3><img src={ticket.initialPhotoUrl} alt="Photo submitted with the complaint" className="max-h-96 rounded-xl border border-slate-200 object-contain" /></div>}
            {ticket.resolutionPhotoUrl && <div><h3 className="mb-2 text-sm font-bold">Stage 2: After Repair</h3><img src={ticket.resolutionPhotoUrl} alt="After-repair photo proof" className="max-h-96 rounded-xl border border-slate-200 object-contain" /></div>}
          </section>

          <form onSubmit={(event) => void saveStatus(event)} className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-sm">
            <div><h2 className="text-lg font-extrabold">Update complaint status</h2><p className="mt-1 text-sm text-slate-600">Status changes are visible in the public grievance docket.</p></div>
            <label className="block text-sm font-bold text-slate-800" htmlFor="complaint-status">Status</label>
            <select id="complaint-status" value={status} onChange={(event) => setStatus(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
              <option value="">Choose an allowed status</option>
              {STATUS_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            {status === 'PROVISIONALLY_RESOLVED' && <label className="block rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-950" htmlFor="after-repair-photo">
              <span className="flex items-center gap-2"><Upload className="h-4 w-4" />Stage 2: After Repair image <span className="text-red-600">*</span></span>
              <input id="after-repair-photo" type="file" accept="image/*" required onChange={(event) => setPhoto(event.target.files?.[0] ?? null)} className="mt-3 block w-full text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-blue-700 file:px-3 file:py-2 file:font-bold file:text-white" />
              <span className="mt-2 block text-xs font-normal text-blue-800">Upload an image up to 8 MB.</span>
            </label>}
            <label className="block text-sm font-bold text-slate-800" htmlFor="authority-status-comment">Comment (optional)</label>
            <textarea id="authority-status-comment" value={comment} onChange={(event) => setComment(event.target.value)} maxLength={1000} rows={3} placeholder="Add a note about this status update..." className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" />
            {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">{error}</p>}
            {success && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{success}</p>}
            <button type="submit" disabled={saving || !status} className="rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-60">{saving ? 'Saving...' : 'Save Status'}</button>
          </form>

          <TicketHistory key={ticket.updatedAt} ticketId={ticket.id} />
        </>}
      </main>
      <Footer />
    </div>
  );
}

export default function AuthorityComplaintPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-sm text-slate-500">Loading complaint...</div>}>
      <AuthorityComplaintContent />
    </Suspense>
  );
}
