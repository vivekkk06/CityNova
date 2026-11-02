'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { MapPin, MessageCircle, ThumbsUp, Bookmark } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

interface PostComment {
  id: string;
  body: string;
  createdAt: string;
  authorUsername: string;
}

interface CityPost {
  id: string;
  caseId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  addressDescription: string;
  createdAt: string;
  authorUsername: string;
  plusOneCount: number;
  reactedByMe: boolean;
  comments: PostComment[];
}

function statusOrder(status: string) {
  if (status === 'PROVISIONALLY_RESOLVED') return 0;
  if (['IN_PROGRESS', 'ASSIGNED', 'DISPUTED'].includes(status)) return 1;
  if (status === 'OPEN') return 2;
  if (['CLOSED', 'RESOLVED'].includes(status)) return 3;
  return 2;
}

export default function PostsPage() {
  const { user, loading: authLoading } = useAuth();
  const canInteract = !authLoading && user?.role !== 'AUTHORITY';
  const [posts, setPosts] = useState<CityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [reactionBusy, setReactionBusy] = useState<string | null>(null);
  const [commentBusy, setCommentBusy] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const key = user?.id ? `citynova_saved_posts_${user.id}` : 'citynova_saved_posts';
      const stored = localStorage.getItem(key);
      if (stored) {
        setSavedPostIds(JSON.parse(stored));
      } else {
        const fallback = localStorage.getItem('citynova_saved_posts');
        if (fallback) setSavedPostIds(JSON.parse(fallback));
      }
    } catch {}
  }, [user?.id]);

  const toggleSavePost = (postId: string) => {
    setSavedPostIds((prev) => {
      const updated = prev.includes(postId)
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      try {
        const key = user?.id ? `citynova_saved_posts_${user.id}` : 'citynova_saved_posts';
        localStorage.setItem(key, JSON.stringify(updated));
        localStorage.setItem('citynova_saved_posts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };
  const orderedPosts = [...posts].sort((a, b) =>
    statusOrder(a.status) - statusOrder(b.status) ||
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const loadPosts = useCallback(async () => {
    setError('');
    try {
      const response = await fetch('/api/posts');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load posts.');
      setPosts(data.posts ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPosts(); }, [loadPosts]);

  const toggleReaction = async (post: CityPost) => {
    setReactionBusy(post.id);
    setError('');
    try {
      const response = await fetch(`/api/posts/${post.id}/reaction`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update your +1.');
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, plusOneCount: data.plusOneCount, reactedByMe: data.reactedByMe }
        : item));
    } catch (reactionError) {
      setError(reactionError instanceof Error ? reactionError.message : 'Could not update your +1.');
    } finally {
      setReactionBusy(null);
    }
  };

  const addComment = async (event: FormEvent<HTMLFormElement>, post: CityPost) => {
    event.preventDefault();
    const body = (drafts[post.id] ?? '').trim();
    if (!body) return;
    setCommentBusy(post.id);
    setError('');
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not post your comment.');
      setPosts((current) => current.map((item) => item.id === post.id
        ? { ...item, comments: [...item.comments, data.comment] }
        : item));
      setDrafts((current) => ({ ...current, [post.id]: '' }));
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : 'Could not post your comment.');
    } finally {
      setCommentBusy(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-orange-700">Community posts</p>
          <h1 className="mt-2 text-3xl font-black">Complaints in {user?.city?.name || 'your city'}</h1>
          <p className="mt-2 text-sm text-slate-600">Discuss reported issues with people in your city. Post authors are shown by username.</p>
        </header>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">{error}</p>}
        {loading && <p className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-500">Loading city posts...</p>}
        {!loading && !posts.length && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <MessageCircle className="mx-auto h-8 w-8 text-slate-400" />
            <h2 className="mt-3 text-lg font-bold">No complaints have been posted yet</h2>
            <p className="mt-1 text-sm text-slate-500">New complaints registered in {user?.city?.name || 'your city'} will appear here.</p>
            {user?.role !== 'AUTHORITY' && <Link href="/report" className="mt-5 inline-flex rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700">Report a problem</Link>}
          </div>
        )}

        <div className="space-y-4">
          {orderedPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">@{post.authorUsername}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(post.createdAt).toLocaleString()}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{post.status.replaceAll('_', ' ')}</span>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-700">{post.category}</p>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-900">{post.title}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{post.addressDescription}</span>
                  {user?.role === 'AUTHORITY' ? (
                    <Link href={`/authority/complaints/${post.caseId}`} className="inline-flex rounded-lg bg-blue-700 px-3 py-1.5 font-bold text-white hover:bg-blue-800">View Complaint</Link>
                  ) : (
                    <Link href={`/ticket/${post.caseId}`} className="inline-flex rounded-lg bg-blue-700 px-3 py-1.5 font-bold text-white hover:bg-blue-800">View Complaint</Link>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {canInteract ? (
                    <button
                      type="button"
                      onClick={() => void toggleReaction(post)}
                      disabled={reactionBusy === post.id}
                      aria-pressed={post.reactedByMe}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-bold transition-colors disabled:opacity-60 ${post.reactedByMe ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      +1 <span>{post.plusOneCount}</span>
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-bold text-slate-600">
                      <ThumbsUp className="h-4 w-4" />
                      +1 <span>{post.plusOneCount}</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => toggleSavePost(post.id)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-bold transition-all ${
                      savedPostIds.includes(post.id)
                        ? 'border-amber-300 bg-amber-50 text-amber-800 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                    title={savedPostIds.includes(post.id) ? 'Remove from Saved' : 'Save post to your Profile'}
                  >
                    <Bookmark className={`h-4 w-4 ${savedPostIds.includes(post.id) ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span>{savedPostIds.includes(post.id) ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                <section className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800"><MessageCircle className="h-4 w-4" />Comments ({post.comments.length})</h3>
                  {post.comments.length > 0 ? (
                    <div className="mb-4 space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="rounded-xl bg-slate-50 px-3.5 py-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800">@{comment.authorUsername}</span>
                            <time className="text-[11px] text-slate-500">{new Date(comment.createdAt).toLocaleString()}</time>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{comment.body}</p>
                        </div>
                      ))}
                    </div>
                  ) : <p className="mb-4 text-xs text-slate-500">No comments yet.</p>}

                  {canInteract && <form onSubmit={(event) => void addComment(event, post)} className="flex flex-col gap-2 sm:flex-row">
                    <input
                      value={drafts[post.id] ?? ''}
                      onChange={(event) => setDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                      maxLength={1000}
                      placeholder="Add a comment..."
                      aria-label={`Comment on ${post.title}`}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                    <button type="submit" disabled={commentBusy === post.id || !(drafts[post.id] ?? '').trim()} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
                      {commentBusy === post.id ? 'Posting...' : 'Comment'}
                    </button>
                  </form>}
                </section>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
