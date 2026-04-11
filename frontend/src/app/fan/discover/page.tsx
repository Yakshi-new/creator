'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, UserPlus, UserCheck, Users } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface Creator {
    id: number;
    avatar?: string;
    bio?: string;
    subscriptionPrice?: number;
    subscriptionEndDate?: string;
    user: { name: string };
    _count: { subscriptions: number };
}

export default function DiscoverPage() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subscribed, setSubscribed] = useState<number[]>([]);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const loadCreators = async () => {
        setLoading(true);
        try {
            const [discoverRes, subRes] = await Promise.all([
                api.get('/creators/discover'),
                api.get('/creators/subscriptions')
            ]);
            setCreators(discoverRes.data as any);
            setSubscribed((subRes.data as any[]).map((c: any) => c.id));
        } catch (error) {
            console.error('Failed to load creators', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCreators(); }, []);

    const handleSubscribeToggle = async (creator: Creator) => {
        const isSub = subscribed.includes(creator.id);

        if (isSub) {
            if (!confirm(`Unsubscribe from ${creator.user.name}?`)) return;
        } else {
            if (!confirm(`Subscribe to ${creator.user.name} for ₹${creator.subscriptionPrice || 0}/month using your wallet balance?`)) return;
        }

        setProcessingId(creator.id);
        try {
            await api.post(`/creators/${creator.id}/subscribe`);
            setSubscribed(prev =>
                prev.includes(creator.id)
                    ? prev.filter(id => id !== creator.id)
                    : [...prev, creator.id]
            );
        } catch (err: any) {
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('insufficient wallet balance')) {
                if (confirm('Insufficient wallet balance. Go to Wallet to add funds?')) {
                    window.location.href = '/fan/wallet';
                }
            } else {
                alert(msg || 'Action failed');
            }
        } finally {
            setProcessingId(null);
        }
    };

    const filtered = creators.filter(c =>
        c.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 text-white min-h-screen max-w-4xl mx-auto">
            <h1 className="text-3xl font-black mb-2">Discover Creators</h1>
            <p className="text-neutral-500 text-sm font-medium mb-8">Find and subscribe to creators you love</p>

            {/* Search */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                    type="text"
                    placeholder="Search creators..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 pl-12 pr-5 py-3.5 rounded-2xl focus:border-rose-500 outline-none transition-all font-medium"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-neutral-900 rounded-3xl p-6 animate-pulse h-52" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map(creator => {
                        const isSub = subscribed.includes(creator.id);
                        const isProcessing = processingId === creator.id;
                        const initials = creator.user.name.charAt(0).toUpperCase();

                        return (
                            <div key={creator.id} className="bg-neutral-900 border border-white/10 rounded-3xl p-5 hover:border-white/20 transition-all flex flex-col gap-4">
                                {/* Header */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 overflow-hidden flex items-center justify-center font-black text-white text-xl shrink-0">
                                        {creator.avatar
                                            ? <img src={getMediaUrl(creator.avatar) || creator.avatar} alt="" className="w-full h-full object-cover" />
                                            : initials
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-black text-white truncate">{creator.user.name}</h3>
                                        <p className="text-xs text-neutral-500 flex items-center gap-1 font-bold">
                                            <Users size={12} /> {creator._count.subscriptions} subscribers
                                        </p>
                                    </div>
                                    {isSub && (
                                        <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 shrink-0">
                                            ACTIVE
                                        </span>
                                    )}
                                </div>

                                {/* Bio */}
                                <p className="text-sm text-neutral-400 line-clamp-2 flex-1">
                                    {creator.bio || 'No bio available'}
                                </p>

                                {/* Price */}
                                {creator.subscriptionPrice != null && (
                                    <div className="text-sm text-rose-400 font-black">
                                        ₹{creator.subscriptionPrice}/month
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSubscribeToggle(creator);
                                        }}
                                        disabled={isProcessing}
                                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-50 ${
                                            isSub
                                                ? 'bg-neutral-800 text-neutral-300 border border-white/5 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                                : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/20 hover:opacity-90'
                                        }`}
                                    >
                                        {isSub ? <UserCheck size={15} /> : <UserPlus size={15} />}
                                        {isProcessing ? 'Processing...' : isSub ? 'Unsubscribe' : `Subscribe`}
                                    </button>

                                    <Link
                                        href={`/fan/creator/${creator.id}`}
                                        className="px-5 border border-white/10 text-center py-3 rounded-2xl hover:bg-white/5 text-sm font-black transition-all text-neutral-300"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="mt-20 text-center text-neutral-500 font-bold">
                    No creators found matching "{search}"
                </div>
            )}
        </div>
    );
}