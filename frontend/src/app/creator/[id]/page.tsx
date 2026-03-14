'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Loader2, Lock } from 'lucide-react';

export default function CreatorProfilePage() {
    const params = useParams();
    const id = params?.id;
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
        try {
            await api.post(`/creators/${id}/subscribe`);
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to subscribe');
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
            <div className="min-h-screen bg-black flex items-center justify-center text-white font-black text-2xl">
                Creator Not Found
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-y-auto">
            {/* Cover */}
            <div className="h-64 md:h-80 relative bg-gradient-to-r from-rose-900/50 to-amber-900/50">
                {profile.coverImage && (
                    <img src={profile.coverImage} className="w-full h-full object-cover" alt="cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative -mt-24">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                    <div className="flex items-end gap-6">
                        <div className="w-32 h-32 rounded-full ring-4 ring-black bg-neutral-900 overflow-hidden shrink-0">
                            {profile.avatar && (
                                <img src={profile.avatar} className="w-full h-full object-cover" alt="avatar" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">{profile.user?.name}</h1>
                            <p className="text-neutral-400 font-bold">@creator_{profile.id}</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={handleSubscribe}
                            className={`px-8 py-3 rounded-2xl font-black transition-all ${
                                profile.isSubscribed
                                    ? 'bg-neutral-800 text-neutral-400'
                                    : 'bg-rose-500 text-white hover:bg-rose-400 shadow-lg shadow-rose-500/20'
                            }`}
                        >
                            {profile.isSubscribed ? 'Subscribed' : `Subscribe for $${profile.subscriptionPrice}`}
                        </button>
                    </div>
                </div>

                {/* Bio & Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="md:col-span-2">
                        <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-4">About</h3>
                        <p className="text-neutral-300 leading-relaxed bg-neutral-900/50 p-6 rounded-3xl border border-white/5">
                            {profile.bio || 'This creator hasn\'t added a bio yet.'}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-4">Stats</h3>
                        <div className="bg-neutral-900/50 rounded-3xl border border-white/5 p-6 space-y-4">
                            <div>
                                <div className="text-2xl font-black text-white">{profile._count?.subscribers || 0}</div>
                                <div className="text-sm text-neutral-400">Subscribers</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-white">{profile.posts?.length || 0}</div>
                                <div className="text-sm text-neutral-400">Posts</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Posts */}
                <div className="mb-12">
                    <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-6">Recent Posts</h3>
                    
                    {!profile.isSubscribed && profile.posts?.some((p: any) => p.type === 'SUBSCRIBER') && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-2xl mb-6 flex items-center gap-3 font-bold text-sm">
                            <Lock size={18} />
                            Subscribe to unlock exclusive content.
                        </div>
                    )}

                    <div className="space-y-6">
                        {profile.posts?.map((post: any) => (
                            <PostCard key={post.id} post={post} onSubscribe={fetchProfile} />
                        ))}

                        {(!profile.posts || profile.posts.length === 0) && (
                            <div className="text-center py-20 text-neutral-500 font-bold bg-neutral-900/50 rounded-3xl border border-white/5">
                                No posts to show.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
