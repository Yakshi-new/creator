'use client';

import { useEffect, useState, use } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    ArrowLeft, 
    Wallet, 
    TrendingUp, 
    Users, 
    FileText,
    ShieldCheck,
    Calendar,
    Mail,
    Lock,
    Unlock,
    MessageSquare,
    Heart
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface CreatorDetail {
    id: number;
    bio: string;
    avatar: string;
    subscriptionPrice: number;
    user: {
        name: string;
        email: string;
        isActive: boolean;
        createdAt: string;
        isVerified: boolean;
    };
    posts: any[];
    _count: {
        subscribers: number;
        posts: number;
    };
    stats: {
        totalEarnings: number;
        netEarnings: number;
        feesPaid: number;
        payouts: number;
    };
}

export default function CreatorProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [creator, setCreator] = useState<CreatorDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCreatorDetail();
    }, [id]);

    const fetchCreatorDetail = async () => {
        try {
            const res = await api.get(`/admin/creator/${id}`);
            setCreator(res.data as CreatorDetail);
        } catch (err) {
            console.error("Failed to fetch creator detail", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen bg-black items-center justify-center text-white font-black animate-pulse text-2xl tracking-tighter">LOADING PROFILE...</div>;
    if (!creator) return <div className="text-white">Creator not found</div>;

    return (
        <div className="flex h-screen bg-black text-white">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-neutral-500 hover:text-white mb-8 group transition-all"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-black text-sm uppercase tracking-widest">Back to Creators</span>
                </button>

                <div className="flex flex-col xl:flex-row gap-10">
                    {/* Left Column: Info & Stats */}
                    <div className="flex-1 space-y-8">
                        {/* Header Profile Card */}
                        <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -mr-32 -mt-32"></div>
                            
                            <div className="flex items-start justify-between relative">
                                <div className="flex gap-8 items-center">
                                    <div className="w-32 h-32 rounded-[2rem] bg-neutral-800 border-2 border-white/10 overflow-hidden shadow-2xl">
                                        {creator.avatar ? <img src={creator.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-black text-neutral-700">C</div>}
                                    </div>
                                    <div>
                                        <h1 className="text-5xl font-black tracking-tighter mb-2 flex items-center gap-3">
                                            {creator.user.name}
                                            {creator.user.isVerified && <ShieldCheck className="text-blue-500" size={32} />}
                                        </h1>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm font-bold text-neutral-400">
                                                <Mail size={16} /> {creator.user.email}
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full text-sm font-bold text-neutral-400">
                                                <Calendar size={16} /> Joined {new Date(creator.user.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${creator.user.isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                                {creator.user.isActive ? <Unlock size={14} /> : <Lock size={14} />}
                                                {creator.user.isActive ? 'Active' : 'Suspended'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Subscription Price</div>
                                    <div className="text-4xl font-black text-emerald-500">${creator.subscriptionPrice.toFixed(2)}</div>
                                </div>
                            </div>

                            <p className="mt-10 text-neutral-400 text-lg leading-relaxed max-w-3xl font-medium">
                                {creator.bio || "No biography provided for this creator."}
                            </p>
                        </div>

                        {/* Financial Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                        <Wallet size={24} />
                                    </div>
                                    <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Gross Revenue</span>
                                </div>
                                <div className="text-4xl font-black text-white">$ {creator.stats.totalEarnings.toLocaleString()}</div>
                                <div className="mt-2 text-xs font-bold text-neutral-600">Total volume processed</div>
                            </div>

                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors border-rose-500/20 shadow-2xl shadow-rose-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                                        <TrendingUp size={24} />
                                    </div>
                                    <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Platform Fees</span>
                                </div>
                                <div className="text-4xl font-black text-rose-500">$ {creator.stats.feesPaid.toLocaleString()}</div>
                                <div className="mt-2 text-xs font-bold text-rose-500/40">25% automatic deduction</div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-white/20 transition-colors">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                        <Users size={24} />
                                    </div>
                                    <span className="text-xs font-black text-neutral-500 uppercase tracking-widest">Net Payouts</span>
                                </div>
                                <div className="text-4xl font-black text-blue-500">$ {creator.stats.netEarnings.toLocaleString()}</div>
                                <div className="mt-2 text-xs font-bold text-neutral-600">Distributed to creator</div>
                            </div>
                        </div>

                        {/* Recent Platform Content */}
                        <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                                        <FileText size={20} />
                                    </div>
                                    <h3 className="text-xl font-bold">Recent Posts</h3>
                                </div>
                                <button className="text-xs font-black text-neutral-500 hover:text-white uppercase tracking-widest">View All</button>
                            </div>
                            <div className="p-0">
                                {creator.posts.length > 0 ? (
                                    <table className="w-full text-left">
                                        <tbody className="text-sm">
                                            {creator.posts.map((post) => (
                                                <tr key={post.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="font-bold text-neutral-200 truncate max-w-md">{post.content || 'Media Post'}</div>
                                                    </td>
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-4 text-xs font-bold text-neutral-500">
                                                            <div className="flex items-center gap-1.5"><Heart size={14} /> {post._count.likes}</div>
                                                            <div className="flex items-center gap-1.5"><MessageSquare size={14} /> {post._count.comments}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right text-[10px] font-black text-neutral-600 uppercase">
                                                        {new Date(post.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-20 text-center">
                                        <p className="text-neutral-600 font-bold">No posts published by this creator yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mini Stats */}
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 sticky top-10">
                            <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-6">Quick Overview</h3>
                            
                            <div className="space-y-8">
                                <div>
                                    <div className="text-[10px] font-black text-neutral-600 uppercase mb-1">Subscribers</div>
                                    <div className="text-3xl font-black text-white">{creator._count.subscribers}</div>
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-neutral-600 uppercase mb-1">Total Posts</div>
                                    <div className="text-3xl font-black text-white">{creator._count.posts}</div>
                                </div>
                                <div className="pt-8 border-t border-white/5">
                                    <div className="text-[10px] font-black text-neutral-600 uppercase mb-4">Risk Profile</div>
                                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className="w-[15%] h-full bg-emerald-500"></div>
                                    </div>
                                    <div className="mt-2 text-xs font-bold text-emerald-500 flex justify-between">
                                        <span>LOW RISK</span>
                                        <span>15/100</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => alert("Verification review system not implemented.")}
                                    className="w-full py-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl font-black text-xs hover:bg-emerald-500 hover:text-white transition-all"
                                >
                                    MANAGE VERIFICATION
                                </button>
                                <button 
                                    onClick={() => alert("Payout request system not implemented.")}
                                    className="w-full py-4 bg-white/5 text-white rounded-2xl font-black text-xs hover:bg-white/10 transition-all border border-white/5"
                                >
                                    INITIATE PAYOUT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
