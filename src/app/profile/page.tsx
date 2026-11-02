'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Phone,
  MapPin,
  ShieldCheck,
  Building2,
  FileText,
  Bookmark,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  MessageSquare,
  ThumbsUp,
  PlusCircle,
  LogOut,
  Calendar,
  Sparkles,
  Camera,
  Mail,
  Edit3,
  Landmark,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/lib/auth-context';

interface UserTicket {
  id: string;
  caseId: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  latitude: number;
  longitude: number;
  addressDescription: string;
  cityName: string;
  state: string;
  initialPhotoUrl?: string | null;
  resolutionPhotoUrl?: string | null;
  createdAt: string;
  reactionsCount: number;
  commentsCount: number;
}

interface SavedPost {
  id: string;
  caseId: string;
  title: string;
  description: string;
  category: string;
  status: string;
  addressDescription: string;
  createdAt: string;
  initialPhotoUrl?: string | null;
  authorUsername: string;
  cityName: string;
  stateName: string;
  plusOneCount: number;
  commentsCount: number;
}

type TabType = 'info' | 'complaints' | 'saved';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refresh } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Complaints State
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [ticketsError, setTicketsError] = useState('');
  const [complaintFilter, setComplaintFilter] = useState<string>('ALL');
  const [copiedCaseId, setCopiedCaseId] = useState<string | null>(null);

  // Saved Posts State
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [savedLoading, setSavedLoading] = useState(true);
  const [savedError, setSavedError] = useState('');

  // Profile Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`citynova_avatar_${user.id}`);
      if (stored) {
        setAvatarUrl(stored);
      } else {
        const fallback = localStorage.getItem('citynova_avatar');
        if (fallback) setAvatarUrl(fallback);
      }
    } catch {}
  }, [user?.id]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Please select an image smaller than 5MB.');
      return;
    }

    setPhotoError('');
    setUploadingPhoto(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      if (preview && user?.id) {
        setAvatarUrl(preview);
        try {
          localStorage.setItem(`citynova_avatar_${user.id}`, preview);
          localStorage.setItem('citynova_avatar', preview);
        } catch {}
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url && user?.id) {
        setAvatarUrl(data.url);
        try {
          localStorage.setItem(`citynova_avatar_${user.id}`, data.url);
          localStorage.setItem('citynova_avatar', data.url);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to upload avatar to server:', err);
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl(null);
    if (user?.id) {
      try {
        localStorage.removeItem(`citynova_avatar_${user.id}`);
        localStorage.removeItem('citynova_avatar');
      } catch {}
    }
  };

  // Profile Cover Background State
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    try {
      const storedCover = localStorage.getItem(`citynova_cover_${user.id}`);
      if (storedCover) {
        setCoverUrl(storedCover);
      } else {
        const fallback = localStorage.getItem('citynova_cover');
        if (fallback) setCoverUrl(fallback);
      }
    } catch {}
  }, [user?.id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('Please choose an image smaller than 8MB.');
      return;
    }

    setUploadingCover(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const preview = event.target?.result as string;
      if (preview && user?.id) {
        setCoverUrl(preview);
        try {
          localStorage.setItem(`citynova_cover_${user.id}`, preview);
          localStorage.setItem('citynova_cover', preview);
        } catch {}
      }
    };
    reader.readAsDataURL(file);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url && user?.id) {
        setCoverUrl(data.url);
        try {
          localStorage.setItem(`citynova_cover_${user.id}`, data.url);
          localStorage.setItem('citynova_cover', data.url);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to upload cover to server:', err);
    } finally {
      setUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const handleRemoveCover = () => {
    setCoverUrl(null);
    if (user?.id) {
      try {
        localStorage.removeItem(`citynova_cover_${user.id}`);
        localStorage.removeItem('citynova_cover');
      } catch {}
    }
  };

  // Profile Details: DOB, Email, Bio, Designation
  const [profileForm, setProfileForm] = useState({
    dob: user?.dob || '',
    email: user?.email || '',
    bio: user?.bio || '',
    designation: user?.designation || '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');

  useEffect(() => {
    if (user?.id) {
      let localExtras: any = {};
      try {
        const stored = localStorage.getItem(`citynova_profile_extras_${user.id}`);
        if (stored) localExtras = JSON.parse(stored);
      } catch {}

      setProfileForm({
        dob: user.dob || localExtras.dob || '',
        email: user.email || localExtras.email || '',
        bio: user.bio || localExtras.bio || '',
        designation: user.designation || localExtras.designation || '',
      });
    }
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingProfile(true);
    setProfileSaveError('');
    setProfileSaveSuccess(false);

    try {
      if (user?.id) {
        localStorage.setItem(
          `citynova_profile_extras_${user.id}`,
          JSON.stringify(profileForm)
        );
      }

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      await refresh();
      setProfileSaveSuccess(true);
      setIsEditingProfile(false);
      setTimeout(() => setProfileSaveSuccess(false), 3000);
    } catch (err) {
      setProfileSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Fetch User Complaints
  const loadUserComplaints = useCallback(async () => {
    setTicketsLoading(true);
    setTicketsError('');
    try {
      const res = await fetch('/api/user/tickets');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load complaints');
      setTickets(data.tickets || []);
    } catch (err) {
      setTicketsError(err instanceof Error ? err.message : 'Error loading complaints');
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Fetch Saved Posts
  const loadSavedPosts = useCallback(async () => {
    setSavedLoading(true);
    setSavedError('');
    try {
      const key = user?.id ? `citynova_saved_posts_${user.id}` : 'citynova_saved_posts';
      let storedIds: string[] = [];
      try {
        const raw = localStorage.getItem(key);
        if (raw) storedIds = JSON.parse(raw);
        else {
          const fallback = localStorage.getItem('citynova_saved_posts');
          if (fallback) storedIds = JSON.parse(fallback);
        }
      } catch {}

      if (storedIds.length === 0) {
        setSavedPosts([]);
        setSavedLoading(false);
        return;
      }

      const res = await fetch('/api/user/saved-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: storedIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load saved posts');
      setSavedPosts(data.posts || []);
    } catch (err) {
      setSavedError(err instanceof Error ? err.message : 'Error loading saved posts');
    } finally {
      setSavedLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      void loadUserComplaints();
      void loadSavedPosts();
    }
  }, [user, authLoading, router, loadUserComplaints, loadSavedPosts]);

  // Remove post from saved
  const removeSavedPost = (postId: string) => {
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    try {
      const key = user?.id ? `citynova_saved_posts_${user.id}` : 'citynova_saved_posts';
      const raw = localStorage.getItem(key);
      if (raw) {
        const ids: string[] = JSON.parse(raw);
        const filtered = ids.filter((id) => id !== postId);
        localStorage.setItem(key, JSON.stringify(filtered));
        localStorage.setItem('citynova_saved_posts', JSON.stringify(filtered));
      }
    } catch {}
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCaseId(text);
    setTimeout(() => setCopiedCaseId(null), 2000);
  };

  // Helper status color styling
  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'OPEN') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
          Open
        </span>
      );
    }
    if (s === 'IN_PROGRESS' || s === 'ASSIGNED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3 text-amber-600" />
          In Progress
        </span>
      );
    }
    if (s === 'PROVISIONALLY_RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
          <Sparkles className="w-3 h-3 text-purple-600" />
          Pending Sign-off
        </span>
      );
    }
    if (s === 'RESOLVED' || s === 'CLOSED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Resolved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  // Filter complaints
  const filteredTickets = tickets.filter((t) => {
    if (complaintFilter === 'ALL') return true;
    if (complaintFilter === 'OPEN') return t.status.toUpperCase() === 'OPEN';
    if (complaintFilter === 'IN_PROGRESS') return ['IN_PROGRESS', 'ASSIGNED'].includes(t.status.toUpperCase());
    if (complaintFilter === 'PENDING') return t.status.toUpperCase() === 'PROVISIONALLY_RESOLVED';
    if (complaintFilter === 'RESOLVED') return ['RESOLVED', 'CLOSED'].includes(t.status.toUpperCase());
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Loading your profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const isAuthority = user.role === 'AUTHORITY';
  const cityName = user.city?.name || 'Local City';
  const stateName = user.state || user.city?.state || 'India';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Header Banner */}
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="h-44 sm:h-56 bg-linear-to-r from-slate-950 via-slate-900 to-teal-950 relative overflow-hidden group">
            {coverUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverUrl}
                alt="Profile Cover Background"
                className="w-full h-full object-cover"
              />
            )}

            {/* Change / Add Background Picture Controls */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-2 z-10">
              {coverUrl && (
                <button
                  type="button"
                  onClick={handleRemoveCover}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-red-900/80 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm"
                  title="Remove cover photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer hover:scale-105 shadow-sm"
                title="Add or change background picture"
                aria-label="Add or change background picture"
              >
                {uploadingCover ? (
                  <div className="w-3.5 h-3.5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>{coverUrl ? 'Change Cover' : 'Add Cover Photo'}</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="px-6 sm:px-8 pb-6 pt-0 relative">
            {/* Top row: Avatar overlapping banner on left */}
            <div className="flex items-end justify-between -mt-14 sm:-mt-16 gap-4 mb-4">
              {/* Profile Avatar with Camera upload trigger */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl bg-slate-900 overflow-hidden flex items-center justify-center ring-1 ring-slate-200/80">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={user.name || 'Citizen'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl sm:text-4xl font-black select-none tracking-tight">
                      {user.name ? user.name.slice(0, 2).toUpperCase() : 'CN'}
                    </span>
                  )}
                </div>

                {/* Camera upload badge button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-md border-2 border-white transition-all hover:scale-110 cursor-pointer"
                  title="Upload profile photo"
                  aria-label="Upload profile photo"
                >
                  {uploadingPhoto ? (
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Action area on the right: Report Problem and Sign out removed as requested */}
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-red-700 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
                  title="Remove custom profile photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove photo</span>
                </button>
              )}
            </div>

            {photoError && (
              <p className="text-xs text-red-600 font-semibold mb-3">{photoError}</p>
            )}

            {/* User Info - strictly below the banner on crisp white background */}
            <div className="space-y-1 mb-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {user.name || 'Citizen User'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isAuthority ? 'Authority Official' : 'Verified Citizen'}
                </span>
                {isAuthority && profileForm.designation && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <Landmark className="w-3.5 h-3.5 text-amber-700" />
                    {profileForm.designation}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 font-medium flex items-center gap-2 pt-0.5">
                <span>@{user.username || 'citizen'}</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  {cityName}, {stateName}
                </span>
              </p>

              {profileForm.bio && (
                <p className="pt-2 text-sm text-slate-700 leading-relaxed max-w-2xl font-normal">
                  {profileForm.bio}
                </p>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">My Complaints</p>
                  <p className="text-lg font-black text-slate-900">{tickets.length}</p>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Saved Posts</p>
                  <p className="text-lg font-black text-slate-900">{savedPosts.length}</p>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Jurisdiction</p>
                  <p className="text-sm font-black text-slate-900 truncate max-w-[140px]">{cityName}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-2xl px-3 py-2 shadow-xs gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'info'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <span>Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('complaints')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-400" />
            <span>My Complaints</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'complaints' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tickets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Saved Posts</span>
            <span
              className={`ml-1 px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'saved' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {savedPosts.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Personal Info */}
        {activeTab === 'info' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="border-b border-slate-100 pb-4 mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Personal Details</h2>
                  <p className="text-xs text-slate-500">
                    Your authenticated civic citizen credentials and official details.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setProfileSaveError('');
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isEditingProfile
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingProfile ? 'Cancel Edit' : 'Edit Profile Info'}</span>
                  </button>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Civic Account Active
                  </span>
                </div>
              </div>

              {profileSaveSuccess && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Profile details updated successfully!</span>
                </div>
              )}

              {profileSaveError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{profileSaveError}</span>
                </div>
              )}

              {/* Editing Form Mode */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Full Legal Name (Verified)
                      </span>
                      <p className="text-base font-extrabold text-slate-800">{user.name || 'Not provided'}</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200/70 space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        CityNova Username (Fixed)
                      </span>
                      <p className="text-base font-extrabold text-slate-800">@{user.username || 'citizen'}</p>
                    </div>

                    {/* Email ID Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-600" />
                        Email ID
                      </label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="e.g. citizen@example.com"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* Date of Birth Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        Date of Birth (DOB)
                      </label>
                      <input
                        type="date"
                        value={profileForm.dob}
                        onChange={(e) => setProfileForm({ ...profileForm, dob: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    {/* Authority Designation Dropdown (in the case of authority) */}
                    {isAuthority && (
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-amber-600" />
                          Authority Designation *
                        </label>
                        <select
                          value={profileForm.designation}
                          onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                        >
                          <option value="">-- Choose Designation --</option>
                          <option value="District Magistrate (DM)">District Magistrate (DM)</option>
                          <option value="Sub-divisional Magistrate (SDM)">Sub-divisional Magistrate (SDM)</option>
                          <option value="Mayor">Mayor</option>
                          <option value="Commissioner of Police (CP)">Commissioner of Police (CP)</option>
                        </select>
                      </div>
                    )}

                    {/* Bio Textarea */}
                    <div className="space-y-1.5 md:col-span-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 block flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          Bio
                        </label>
                        <span className="text-[10px] text-slate-400">
                          {profileForm.bio.length}/500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        maxLength={500}
                        value={profileForm.bio}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        placeholder="Tell your local community a little about yourself, civic interests, or municipal department..."
                        className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-transform hover:scale-102 cursor-pointer disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Display Mode */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Full Legal Name
                    </span>
                    <p className="text-base font-extrabold text-slate-900">{user.name || 'Not provided'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      CityNova Username
                    </span>
                    <p className="text-base font-extrabold text-slate-900">@{user.username || 'citizen'}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      Mobile Phone Number
                    </span>
                    <p className="text-base font-extrabold text-slate-900">
                      {user.phone ? user.phone : 'Not linked'}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <Mail className="w-3 h-3 text-blue-600" />
                      Email ID
                    </span>
                    <p className="text-base font-extrabold text-slate-900">
                      {profileForm.email ? (
                        profileForm.email
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-xs text-blue-600 hover:underline font-bold"
                        >
                          + Add Email ID
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-600" />
                      Date of Birth (DOB)
                    </span>
                    <p className="text-base font-extrabold text-slate-900">
                      {profileForm.dob ? (
                        new Date(profileForm.dob).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-xs text-purple-600 hover:underline font-bold"
                        >
                          + Add Date of Birth
                        </button>
                      )}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-blue-600" />
                      Account Role & Access
                    </span>
                    <p className="text-base font-extrabold text-slate-900">
                      {isAuthority ? 'Municipal Authority Official' : 'Standard Citizen Account'}
                    </p>
                  </div>

                  {/* Authority Designation Card (for Authority accounts) */}
                  {isAuthority && (
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1 md:col-span-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-amber-700" />
                        Authority Designation
                      </span>
                      <p className="text-base font-extrabold text-amber-950">
                        {profileForm.designation ? (
                          profileForm.designation
                        ) : (
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(true)}
                            className="text-xs text-amber-700 hover:underline font-bold"
                          >
                            + Select Designation
                          </button>
                        )}
                      </p>
                    </div>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      Registered State
                    </span>
                    <p className="text-base font-extrabold text-slate-900">{stateName}</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-purple-600" />
                      City / District Jurisdiction
                    </span>
                    <p className="text-base font-extrabold text-slate-900">{cityName}</p>
                  </div>

                  {/* Bio Card */}
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-1 md:col-span-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block flex items-center gap-1">
                      <FileText className="w-3 h-3 text-emerald-600" />
                      Bio
                    </span>
                    {profileForm.bio ? (
                      <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-wrap">
                        {profileForm.bio}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">
                        No bio added yet.{' '}
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="text-emerald-700 font-bold not-italic hover:underline ml-1"
                        >
                          Write a bio &rarr;
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Civic Rights & Guarantee Note */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <p className="font-bold">Citizen Privacy & Verification Guarantee</p>
                  <p className="mt-0.5 text-amber-800">
                    Under CityNova civic standards, your phone number and personal contact details remain encrypted
                    and protected. Public grievance dockets display complaints without exposing citizen personal numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User's Own Complaints */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Complaints Filed by You</h2>
                  <p className="text-xs text-slate-500">
                    Track the live status, department assignment, and public dockets of your grievances.
                  </p>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'OPEN', label: 'Open' },
                    { id: 'IN_PROGRESS', label: 'In Progress' },
                    { id: 'PENDING', label: 'Sign-off' },
                    { id: 'RESOLVED', label: 'Resolved' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setComplaintFilter(filter.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        complaintFilter === filter.id
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {ticketsError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 mb-4">
                  {ticketsError}
                </div>
              )}

              {ticketsLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Loading your complaints...</p>
                </div>
              ) : filteredTickets.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 p-8">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-extrabold text-slate-800">
                    {tickets.length === 0 ? 'No complaints filed yet' : 'No complaints match this filter'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {tickets.length === 0
                      ? 'When you report civic issues like potholes, drainage leaks, or streetlights in your city, they will appear here with live tracking.'
                      : 'Try switching filters to view your other active or resolved civic issues.'}
                  </p>
                  {tickets.length === 0 && !isAuthority && (
                    <Link
                      href="/report"
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Report a Civic Problem
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(ticket.caseId)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-bold transition-colors cursor-pointer"
                            title="Click to copy Case ID"
                          >
                            <span>{ticket.caseId}</span>
                            {copiedCaseId === ticket.caseId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                            {ticket.category}
                          </span>
                        </div>
                        <div>{getStatusBadge(ticket.status)}</div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900">{ticket.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
                          {ticket.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            {ticket.addressDescription || ticket.cityName}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/ticket/${ticket.caseId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-transform hover:scale-102"
                          >
                            <span>View Public Docket</span>
                            <ExternalLink className="w-3.5 h-3.5 text-teal-400" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Saved Posts */}
        {activeTab === 'saved' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Saved Community Posts</h2>
                  <p className="text-xs text-slate-500">
                    Grievance posts and civic updates you have bookmarked to follow or reference.
                  </p>
                </div>
                <Link
                  href="/posts"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
                >
                  <span>Go to Community Feed</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {savedError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700 mb-4">
                  {savedError}
                </div>
              )}

              {savedLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Loading saved posts...</p>
                </div>
              ) : savedPosts.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-slate-100 p-8">
                  <Bookmark className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-base font-extrabold text-slate-800">No saved posts yet</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You can save any community issue by clicking the &ldquo;Save&rdquo; bookmark button in the Posts tab
                    to track it here.
                  </p>
                  <Link
                    href="/posts"
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-sky-400" />
                    Browse Community Posts
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedPosts.map((post) => (
                    <article
                      key={post.id}
                      className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-800">@{post.authorUsername}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200">
                            {post.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(post.status)}
                          <button
                            type="button"
                            onClick={() => removeSavedPost(post.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Remove from Saved"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-black text-slate-900">{post.title}</h3>
                        <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed line-clamp-3">
                          {post.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-orange-600" />
                            {post.addressDescription}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                            {post.plusOneCount} {post.plusOneCount === 1 ? 'upvote' : 'upvotes'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                            {post.commentsCount} comments
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/ticket/${post.caseId}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition-transform hover:scale-102"
                          >
                            <span>View Complaint</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

