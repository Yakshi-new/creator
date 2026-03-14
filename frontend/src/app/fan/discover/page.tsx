'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

interface Creator {
    id: number;
    avatar?: string;
    bio?: string;
    subscriptionPrice?: number;
    user: {
        name: string;
    };
    _count: {
        subscriptions: number;
    };
}

export default function DiscoverPage() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [subscribed, setSubscribed] = useState<number[]>([]); 
    const router = useRouter();

    const loadCreators = async () => {
        setLoading(true);
        try {
            const [discoverRes, subRes] = await Promise.all([
                api.get('/creators/discover'),
                api.get('/creators/subscriptions')
            ]);
            const discoverData = discoverRes.data as any;
            const subData = subRes.data as any;
            setCreators(discoverData);
            setSubscribed(subData.map((c: any) => c.id));
        } catch (error) {
            console.error('Failed to load creators', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCreators();
    }, []);

    // Subscribe to creator
    const handleSubscribe = async (creatorId: number) => {
        try {
            await api.post(`/creators/${creatorId}/subscribe`);
            setSubscribed((prev) =>
                prev.includes(creatorId)
                    ? prev.filter((id) => id !== creatorId)
                    : [...prev, creatorId]
            );
            toast.success(subscribed.includes(creatorId) ? 'Unsubscribed' : 'Subscribed successfully!');
        } catch (err) {
            console.error(err);
            toast.error('Failed to subscribe');
        }
    };

    const filteredCreators = creators.filter((creator) =>
        creator.user.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-10 text-white min-h-screen">
            {/* Page Title */}
            <h1 className="text-4xl font-black mb-8">Discover Creators</h1>

            {/* Search */}
            <div className="mb-10">
                <input
                    type="text"
                    placeholder="Search creators..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md bg-black border border-white/10 px-5 py-3 rounded-2xl focus:border-rose-500 outline-none transition-all"
                />
            </div>

            {loading ? (
                <p className="text-neutral-400">Loading creators...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCreators.map((creator) => (
                        <div
                            key={creator.id}
                            className="bg-neutral-900 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition-all"
                        >
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 overflow-hidden">
                                    {creator.avatar && (
                                        <img
                                            src={creator.avatar}
                                            alt={creator.user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-black text-white">{creator.user.name}</h3>
                                    <p className="text-sm text-neutral-400">
                                        {creator._count.subscriptions} subscribers
                                    </p>
                                </div>
                            </div>

                            {/* Bio */}
                            <p className="text-sm text-neutral-400 mb-6">
                                {creator.bio || 'No bio available'}
                            </p>

                            {/* Subscription Price */}
                            {creator.subscriptionPrice && (
                                <div className="text-sm text-rose-500 font-bold mb-4">
                                    ${creator.subscriptionPrice}/month
                                </div>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleSubscribe(creator.id)}
                                    className={`flex-1 py-3 rounded-xl font-black text-sm transition-all shadow-lg hover:shadow-none ${subscribed.includes(creator.id)
                                        ? 'bg-neutral-800 text-neutral-400 border border-white/5 hover:bg-neutral-700'
                                        : 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-rose-500/20 hover:opacity-90'
                                        }`}
                                >
                                    {subscribed.includes(creator.id) ? 'Subscribed' : `Subscribe for $${creator.subscriptionPrice || 'Free'}`}
                                </button>

                                <Link
                                    href={`/creator/${creator.id}`}
                                    className="flex-1 border border-white/10 text-center py-2 rounded-xl hover:bg-white/5 transition-all"
                                >
                                    View
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredCreators.length === 0 && (
                <div className="mt-10 text-neutral-500">No creators found.</div>
            )}
        </div>
    );
}