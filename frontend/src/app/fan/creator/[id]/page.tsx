'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Loader2, Lock, UserCheck, UserPlus, ArrowLeft } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import Link from 'next/link';
import { getMediaUrl } from '@/lib/utils';

export default function FanCreatorProfilePage() {
    const params = useParams();
    const id = params?.id;
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [subLoading, setSubLoading] = useState(false);
    const { initiatePayment } = useRazorpay();

    const fetchProfile = async () => {
        try {
            const { data } = await api.get(`/creators/${id}`);
            setProfile(data);
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProfile();
    }, [id]);

    const handleSubscribe = async () => {
        if (!profile) return;
        if (profile.isSubscribed) {
            if (!confirm('Are you sure you want to unsubscribe from this creator?')) return;
            setSubLoading(true);
            try {
                await api.post(`/creators/${profile.id}/subscribe`);
                fetchProfile();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Failed');
            } finally {
                setSubLoading(false);
            }
            return;
        }

        if (!confirm(`Subscribe to ${profile.user?.name} for ₹${profile.subscriptionPrice}/month using your wallet balance?`)) return;

        setSubLoading(true);
        try {
            await api.post(`/creators/${profile.id}/subscribe`);
            alert('Subscribed successfully!');
            fetchProfile();
        } catch (err: any) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('insufficient wallet balance')) {
                if (confirm('Insufficient wallet balance. Go to Wallet to add funds?')) {
                    window.location.href = '/fan/wallet';
                }
            } else {
                alert(msg || 'Failed to subscribe');
            }
        } finally {
            setSubLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-rose-500" size={48} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
                <p className="font-black text-2xl">Creator Not Found</p>
                <Link href="/fan/discover" className="text-rose-500 font-bold hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Discover
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-y-auto">
            {/* Back Button */}
            <div className="p-4">
                <Link href="/fan/discover" className="inline-flex items-center gap-2 text-sm font-bold text-neutral-400 hover:text-white transition-all">
                    <ArrowLeft size={16} /> Back to Discover
                </Link>
            </div>

            {/* Cover */}
            <div className="h-48 md:h-64 relative bg-gradient-to-r from-rose-900/50 to-amber-900/50 -mt-1">
                {profile.coverImage && (
                    <img src={getMediaUrl(profile.coverImage) || profile.coverImage} className="w-full h-full object-cover" alt="cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            </div>

            <div className="max-w-2xl mx-auto px-4 relative -mt-16">
                {/* Avatar & Subscribe */}
                <div className="flex items-end justify-between gap-4 mb-6">
                    <div className="w-24 h-24 rounded-full ring-4 ring-black bg-neutral-900 overflow-hidden shrink-0">
                        {profile.avatar && (
                            <img src={getMediaUrl(profile.avatar) || profile.avatar} className="w-full h-full object-cover" alt="avatar" />
                        )}
                    </div>
                    <button
                        onClick={handleSubscribe}
                        disabled={subLoading}
                        className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-60 ${
                            profile.isSubscribed
                                ? 'bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/25 hover:opacity-90'
                        }`}
                    >
                        {profile.isSubscribed ? <UserCheck size={16} /> : <UserPlus size={16} />}
                        {subLoading ? 'Processing...' : profile.isSubscribed ? 'Subscribed ✓' : `Subscribe · ₹${profile.subscriptionPrice}/mo`}
                    </button>
                </div>

                {/* Info */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-white">{profile.user?.name}</h1>
                    <p className="text-neutral-500 text-sm font-bold">@creator_{profile.id}</p>
                    {profile.isSubscribed && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active Subscription
                        </span>
                    )}
                </div>

                {/* Stats row */}
                <div className="flex gap-6 mb-6 text-center">
                    <div>
                        <div className="text-xl font-black text-white">{profile._count?.subscribers ?? 0}</div>
                        <div className="text-xs text-neutral-500 font-bold">Subscribers</div>
                    </div>
                    <div>
                        <div className="text-xl font-black text-white">{profile.posts?.length ?? 0}</div>
                        <div className="text-xs text-neutral-500 font-bold">Posts</div>
                    </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                    <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-900/50 p-5 rounded-2xl border border-white/5 mb-8">
                        {profile.bio}
                    </p>
                )}

                {/* Lock notice */}
                {!profile.isSubscribed && profile.posts?.some((p: any) => p.type === 'SUBSCRIBER') && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold text-sm">
                        <Lock size={18} />
                        Subscribe to unlock exclusive content.
                    </div>
                )}

                {/* Posts */}
                <div className="space-y-5 mb-20">
                    <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest">Posts</h3>
                    {profile.posts?.map((post: any) => (
                        <PostCard key={post.id} post={post} onSubscribe={fetchProfile} />
                    ))}
                    {(!profile.posts || profile.posts.length === 0) && (
                        <div className="text-center py-16 text-neutral-500 font-bold bg-neutral-900/50 rounded-3xl border border-white/5">
                            No posts yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
