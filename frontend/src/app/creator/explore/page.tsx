'use client';

import { useEffect, useState } from 'react';
import PostCard from '@/components/PostCard';
import { Search, Flame, Star, Loader2, ShieldAlert, Wallet } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';

const MIN_BALANCE = 300;

export default function CreatorExplorePage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                const [walletRes, postsRes] = await Promise.all([
                    api.get('/creators/dashboard'),
                    api.get('/posts/feed?page=1')
                ]);
                const walletData = walletRes.data as any;
                const wallet = walletData?.wallet;
                setWalletBalance(wallet ? wallet.balance : 0);
                setPosts(postsRes.data as any[]);
            } catch (e) {
                setWalletBalance(0);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="animate-spin text-rose-500" size={40} />
            </div>
        );
    }

    // Enforce minimum ₹300 balance
    if (walletBalance !== null && walletBalance < MIN_BALANCE) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center p-8">
                <div className="max-w-sm w-full text-center bg-neutral-900 border border-amber-500/20 rounded-[2.5rem] p-10">
                    <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="text-amber-500" size={30} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-2">Minimum Balance Required</h2>
                    <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                        To access and subscribe to other creators' content, you need at least <span className="text-amber-500 font-black">₹{MIN_BALANCE}</span> in your wallet.
                    </p>
                    <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5">
                        <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-1">Your Balance</p>
                        <p className="text-3xl font-black text-rose-500">₹{walletBalance?.toFixed(2)}</p>
                    </div>
                    <Link
                        href="/creator/earnings"
                        className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black py-4 rounded-2xl hover:opacity-90 transition-all"
                    >
                        <Wallet size={18} /> Request Payout / Check Earnings
                    </Link>
                    <p className="text-xs text-neutral-600 mt-4 font-medium">
                        Add funds through the platform or earn from your content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-2xl mx-auto py-10 px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-black text-white">Explore Feed</h1>
                        <p className="text-neutral-500 text-sm">Discover and subscribe to other creators</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-black px-3 py-1.5 rounded-xl">
                        <Wallet size={12} /> ₹{walletBalance?.toFixed(0)}
                    </div>
                </div>

                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}

                    {posts.length === 0 && (
                        <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/5">
                            <p className="text-neutral-500 font-bold">No posts to explore yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
