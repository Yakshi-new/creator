'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import Link from 'next/link';

interface SubscribedCreator {
    id: number;
    avatar?: string;
    bio?: string;
    subscriptionPrice?: number;
    user: {
        name: string;
    };
    _count: {
        subscribers: number;
    };
}

export default function SubscriptionsPage() {
    const [creators, setCreators] = useState<SubscribedCreator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/creators/subscriptions');
            const data = res.data as any[];
            setCreators(data);
        } catch (error) {
            console.error('Failed to load subscriptions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const filteredCreators = creators.filter((creator) =>
        creator.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-10 text-white min-h-screen">
            <h1 className="text-4xl font-black mb-8">Your Subscriptions</h1>

            <div className="mb-10">
                <input
                    type="text"
                    placeholder="Search your creators..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md bg-black border border-white/10 px-5 py-3 rounded-2xl focus:border-emerald-500 outline-none transition-all"
                />
            </div>

            {loading ? (
                <p className="text-neutral-400">Loading subscriptions...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCreators.map((creator) => (
                        <div
                            key={creator.id}
                            className="bg-neutral-900 border border-emerald-500/20 rounded-3xl p-6 relative hover:border-emerald-500/50 transition-all overflow-hidden"
                        >
                            {/* Active badge */}
                            <div className="absolute top-4 right-4 bg-emerald-500/10 text-emerald-400 text-xs font-black px-3 py-1 rounded-xl flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                            </div>

                            <div className="flex items-center gap-4 mb-4 mt-2">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 overflow-hidden ring-4 ring-black">
                                    {creator.avatar && (
                                        <img
                                            src={creator.avatar}
                                            alt={creator.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-lg text-white">{creator.user.name}</h3>
                                    <p className="text-xs text-neutral-400 font-bold">
                                        Renews automatically
                                    </p>
                                </div>
                            </div>

                            <p className="text-sm text-neutral-400 mb-6 line-clamp-2">
                                {creator.bio || 'Your exclusive access to this creator.'}
                            </p>

                            <div className="flex gap-3">
                                <Link
                                    href={`/creator/${creator.id}`}
                                    className="flex-1 text-center bg-white text-black py-3 rounded-xl font-black text-sm hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    View Profile
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredCreators.length === 0 && (
                <div className="mt-10 py-20 text-center bg-neutral-900/50 rounded-3xl border border-white/5">
                    <p className="text-neutral-500 font-bold text-lg mb-2">No active subscriptions found.</p>
                    <Link href="/fan/discover" className="text-emerald-500 hover:underline text-sm font-bold">
                        Discover Creators
                    </Link>
                </div>
            )}
        </div>
    );
}