'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  status: string;
  actorRole: string;
  actorName: string;
  comment: string | null;
  createdAt: string;
}

export default function TicketHistory({ ticketId }: { ticketId: string }) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`/api/tickets/${encodeURIComponent(ticketId)}/history`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load complaint history.');
        if (active) setHistory(data.history ?? []);
      })
      .catch((loadError) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Could not load complaint history.');
      });
    return () => { active = false; };
  }, [ticketId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900"><Clock className="h-5 w-5" />Status history</h2>
      {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : history.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No status updates yet.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {history.map((entry) => (
            <li key={entry.id} className="border-l-2 border-blue-200 pl-4">
              <p className="text-sm font-bold text-slate-900">
                {entry.status.replaceAll('_', ' ')}
                <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {entry.actorRole === 'AUTHORITY' ? 'Authority Employee' : 'Citizen'}
                </span>
              </p>
              <p className="mt-1 text-xs text-slate-500">{entry.actorName} · {new Date(entry.createdAt).toLocaleString()}</p>
              {entry.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{entry.comment}</p>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
