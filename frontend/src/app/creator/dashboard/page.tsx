'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Users, DollarSign, Eye, TrendingUp,
    ArrowUpRight, ArrowDownRight, PlusCircle,
    Heart, MessageSquare, Banknote, Star,
    BarChart2, Camera, Bell
} from 'lucide-react';
import api from '@/lib/api';



function Avatar({ name, size = 40, gradient = 'from-rose-500 to-amber-500' }: { name: string; size?: number; gradient?: string }) {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
    return (
        <div
            style={{ width: size, height: size, minWidth: size }}
            className={`rounded-full bg-gradient-to-tr ${gradient} flex items-center justify-center text-white font-black text-xs`}
        >
            {initials}
        </div>
    );
}

function MiniBarChart({ data }: { data: { month: string; amount: number }[] }) {
    const max = Math.max(...data.map(d => d.amount));
    return (
        <div className="flex items-end gap-2 h-32 mt-4">
            {data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] text-neutral-500 font-bold">${(d.amount / 1000).toFixed(1)}k</div>
                    <div
                        style={{ height: `${(d.amount / max) * 100}%` }}
                        className={`w-full rounded-t-lg transition-all ${i === data.length - 1 ? 'bg-gradient-to-t from-rose-600 to-amber-400' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                    />
                    <div className="text-[10px] text-neutral-500">{d.month}</div>
                </div>
            ))}
        </div>
    );
}

const typeColors: Record<string, string> = {
    PUBLIC: 'text-emerald-400 bg-emerald-400/10',
    SUBSCRIBER: 'text-amber-400 bg-amber-400/10',
    PAID: 'text-violet-400 bg-violet-400/10',
};

export default function CreatorDashboard() {
    const [dashboard, setDashboard] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get('/creators/dashboard');
                setDashboard(data);
            } catch {
                setDashboard({
                    creator: { user: { name: 'Creator', email: '' }, avatar: null, bio: '' },
                    stats: { totalEarnings: 0, activeSubscribers: 0, profileViews: 0, avgTip: 0, totalPosts: 0 },
                    recentSubscribers: [],
                    recentTips: [],
                    posts: [],
                    revenueByMonth: []
                });
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const d = dashboard || {
        creator: {}, stats: { totalEarnings: 0, activeSubscribers: 0, profileViews: 0, avgTip: 0, totalPosts: 0 },
        recentSubscribers: [], recentTips: [], posts: [], revenueByMonth: []
    };
    const stats = [
        { label: 'Total Earnings', value: `$${d.stats.totalEarnings.toFixed(2)}`, icon: DollarSign, trend: '+22%', up: true, color: 'rose' },
        { label: 'Subscribers', value: d.stats.activeSubscribers, icon: Users, trend: '+13%', up: true, color: 'amber' },
        { label: 'Profile Views', value: (d.stats.profileViews || 0).toLocaleString(), icon: Eye, trend: '+8%', up: true, color: 'emerald' },
        { label: 'Avg. Tip', value: `$${d.stats.avgTip.toFixed(2)}`, icon: TrendingUp, trend: '+5%', up: true, color: 'violet' },
    ];

    const colorMap: Record<string, string> = {
        rose: 'text-rose-400 bg-rose-400/10',
        amber: 'text-amber-400 bg-amber-400/10',
        emerald: 'text-emerald-400 bg-emerald-400/10',
        violet: 'text-violet-400 bg-violet-400/10',
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-10 gap-4">
                <div>
                    <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Creator Dashboard</div>
                    <h1 className="text-3xl font-black text-white">
                        Welcome back, <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">{d.creator?.user?.name || 'Creator'}</span> 👋
                    </h1>
                    <p className="text-neutral-500 mt-1">Here's what's happening with your content today.</p>
                </div>
                <div className="flex gap-3 relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`relative p-3 rounded-2xl bg-neutral-900 border transition-all ${showNotifications ? 'border-rose-500/50 bg-rose-500/5 text-rose-400' : 'border-white/5 text-neutral-400 hover:border-white/20'}`}
                    >
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                    </button>

                    {showNotifications && (
                        <div className="absolute top-14 right-0 w-80 bg-neutral-900 border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                <h3 className="font-black text-sm">Notifications</h3>
                                <button className="text-[10px] text-rose-400 font-bold hover:underline">Mark all read</button>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {[
                                    { id: 1, text: 'New subscriber: Sarah Jones 🔥', time: '2m ago', icon: Heart, color: 'text-rose-400' },
                                    { id: 2, text: 'You received a $25.00 tip! 💰', time: '45m ago', icon: Banknote, color: 'text-emerald-400' },
                                    { id: 3, text: 'New comment on your latest post 💬', time: '2h ago', icon: MessageSquare, color: 'text-amber-400' },
                                ].map(n => (
                                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-all flex gap-3">
                                        <div className={`w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${n.color}`}>
                                            <n.icon size={14} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-white">{n.text}</div>
                                            <div className="text-[10px] text-neutral-500 mt-1">{n.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="w-full py-3 text-[10px] font-black text-neutral-500 hover:text-white transition-all bg-black/20">VIEW ALL NOTIFICATIONS</button>
                        </div>
                    )}

                    <Link href="/creator/create" className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-5 py-3 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-rose-500/20">
                        <PlusCircle size={18} />
                        New Post
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {stats.map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-neutral-900 border border-white/5 rounded-3xl p-6 hover:border-white/15 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-2xl ${colorMap[s.color]}`}>
                                    <Icon size={20} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${s.up ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {s.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    {s.trend}
                                </div>
                            </div>
                            <div className="text-2xl font-black text-white mb-1">{s.value}</div>
                            <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="col-span-2 bg-neutral-900 border border-white/5 rounded-3xl p-8">
                    <div className="flex justify-between items-center mb-2">
                        <div>
                            <h2 className="text-lg font-black text-white">Revenue Overview</h2>
                            <p className="text-xs text-neutral-500 mt-1">Last 6 months earnings</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-400/10 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-black">
                            <ArrowUpRight size={12} /> +71% this month
                        </div>
                    </div>
                    <MiniBarChart data={d.revenueByMonth || []} />
                </div>

                {/* Recent Subscribers */}
                <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-black text-white">Recent Fans</h2>
                        <Link href="/creator/earnings" className="text-xs text-rose-400 font-bold hover:underline">View all</Link>
                    </div>
                    <div className="space-y-4">
                        {(d.recentSubscribers || []).map((fan: any) => (
                            <div key={fan.id} className="flex items-center gap-3">
                                <Avatar name={fan.name} size={36} />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{fan.name}</div>
                                    <div className="text-xs text-neutral-500">{fan.joinedAt || 'recently'}</div>
                                </div>
                                <div className="flex items-center gap-1 text-rose-400">
                                    <Heart size={12} fill="currentColor" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Grid: Recent Tips & Top Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Tips */}
                <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-black text-white flex items-center gap-2">
                            <Banknote size={18} className="text-amber-400" /> Recent Tips
                        </h2>
                        <Link href="/creator/earnings" className="text-xs text-rose-400 font-bold hover:underline">See all</Link>
                    </div>
                    <div className="space-y-4">
                        {(d.recentTips || []).map((tip: any) => (
                            <div key={tip.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                                <Avatar name={tip.fan?.name || 'Fan'} size={36} gradient="from-amber-500 to-rose-500" />
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white">{tip.fan?.name}</div>
                                    {tip.message && <div className="text-xs text-neutral-500 truncate">"{tip.message}"</div>}
                                </div>
                                <div className="text-lg font-black text-amber-400">${tip.amount}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Posts */}
                <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-base font-black text-white flex items-center gap-2">
                            <Star size={18} className="text-rose-400" /> Top Posts
                        </h2>
                        <Link href="/creator/posts" className="text-xs text-rose-400 font-bold hover:underline">Manage</Link>
                    </div>
                    <div className="space-y-3">
                        {(d.posts || []).map((post: any) => (
                            <div key={post.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/3 border border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-700 to-neutral-600 flex items-center justify-center">
                                    <Camera size={16} className="text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-white truncate">{post.content || 'Untitled post'}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${typeColors[post.type]}`}>{post.type}</span>
                                        <span className="text-[10px] text-neutral-500">❤️ {post._count?.likes || 0}</span>
                                        <span className="text-[10px] text-neutral-500">💬 {post._count?.comments || 0}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Create Post', href: '/creator/create', icon: PlusCircle, color: 'from-rose-500 to-pink-600' },
                    { label: 'View Messages', href: '/creator/messages', icon: MessageSquare, color: 'from-violet-500 to-blue-600' },
                    { label: 'See Earnings', href: '/creator/earnings', icon: BarChart2, color: 'from-amber-500 to-orange-500' },
                    { label: 'Edit Profile', href: '/creator/settings', icon: Users, color: 'from-emerald-500 to-teal-500' },
                ].map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link key={action.href} href={action.href}
                            className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r ${action.color} text-white font-black text-sm hover:opacity-90 transition-all shadow-lg hover:scale-[1.02]`}>
                            <Icon size={18} />
                            {action.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}