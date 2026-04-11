'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';
import { Search, X, Calendar } from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

interface SubscribedCreator {
    id: number;
    avatar?: string;
    bio?: string;
    subscriptionPrice?: number;
    currentPeriodEnd?: string;
    user: { name: string };
}

export default function SubscriptionsPage() {
    const [creators, setCreators] = useState<SubscribedCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [unsubscribing, setUnsubscribing] = useState<number | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/creators/subscriptions') as { data: any[] };
            setCreators(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const handleUnsubscribe = async (creator: SubscribedCreator) => {
        if (!confirm(`Unsubscribe from ${creator.user.name}? You will lose access to their exclusive content.`)) return;
        setUnsubscribing(creator.id);
        try {
            await api.post(`/creators/${creator.id}/subscribe`);
            load();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setUnsubscribing(null);
        }
    };

    const filtered = creators.filter(c => c.user.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="p-6 text-white min-h-screen max-w-4xl mx-auto">
            <h1 className="text-3xl font-black mb-2">Your Subscriptions</h1>
            <p className="text-neutral-500 text-sm font-medium mb-8">{creators.length} active subscription{creators.length !== 1 ? 's' : ''}</p>

            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                <input
                    type="text"
                    placeholder="Search subscriptions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/10 pl-12 pr-5 py-3.5 rounded-2xl focus:border-emerald-500 outline-none transition-all font-medium"
                />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {[...Array(3)].map((_, i) => <div key={i} className="bg-neutral-900 rounded-3xl p-6 animate-pulse h-48" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filtered.map(creator => (
                        <div
                            key={creator.id}
                            className="bg-neutral-900 border border-emerald-500/20 rounded-3xl p-5 hover:border-emerald-500/40 transition-all flex flex-col gap-4"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 overflow-hidden flex items-center justify-center font-black text-white text-xl shrink-0 ring-2 ring-emerald-500/20">
                                    {creator.avatar
                                        ? <img src={getMediaUrl(creator.avatar) || creator.avatar} alt="" className="w-full h-full object-cover" />
                                        : creator.user.name.charAt(0)
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-black text-white truncate">{creator.user.name}</h3>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-xs text-emerald-400 font-bold">Active</span>
                                    </div>
                                </div>
                                {creator.currentPeriodEnd && (
                                    <div className="text-[10px] text-neutral-500 font-bold flex items-center gap-1 shrink-0">
                                        <Calendar size={10} />
                                        {new Date(creator.currentPeriodEnd).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-neutral-400 line-clamp-2 flex-1">
                                {creator.bio || 'Your exclusive access to this creator.'}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Link
                                    href={`/fan/creator/${creator.id}`}
                                    className="flex-1 text-center bg-white text-black py-3 rounded-2xl font-black text-sm hover:bg-emerald-400 transition-all"
                                >
                                    View Content
                                </Link>
                                <button
                                    onClick={() => handleUnsubscribe(creator)}
                                    disabled={unsubscribing === creator.id}
                                    className="flex items-center gap-1 px-4 py-3 rounded-2xl border border-white/10 text-neutral-400 text-xs font-black hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 transition-all disabled:opacity-50"
                                >
                                    <X size={14} />
                                    {unsubscribing === creator.id ? '...' : 'Unsub'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="mt-20 py-16 text-center bg-neutral-900/50 rounded-3xl border border-white/5">
                    <p className="text-neutral-500 font-bold text-lg mb-4">No active subscriptions</p>
                    <Link href="/fan/discover" className="text-emerald-500 hover:underline font-bold">
                        Discover Creators →
                    </Link>
                </div>
            )}
        </div>
    );
}