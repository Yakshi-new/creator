'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import {
    Users,
    ShieldAlert,
    BarChart3,
    CreditCard,
    CheckCircle2,
    XCircle,
    TrendingUp,
    LayoutDashboard
} from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
    totalUsers: number;
    totalCreators: number;
    totalFans: number;
    totalVolume: number;
    totalPlatformFees: number;
    recentStats: {
        earnings: number;
        fees: number;
        newPosts: number;
        newUsers: number;
    }
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats(res.data as DashboardStats);
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers || '0', icon: Users, color: 'blue' },
        { label: 'Active Creators', value: stats?.totalCreators || '0', icon: BarChart3, color: 'emerald' },
        { label: 'Total Volume', value: `$${stats?.totalVolume.toLocaleString() || '0'}`, icon: CreditCard, color: 'amber' },
        { label: 'Platform Revenue', value: `$${stats?.totalPlatformFees.toLocaleString() || '0'}`, icon: TrendingUp, color: 'rose' },
    ];

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Admin Control Center</h1>
                        <p className="text-neutral-500 font-medium">Global platform health and moderation overview.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-4 py-2 bg-neutral-900 border border-white/5 rounded-2xl flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-sm font-bold text-white">System Live</span>
                        </div>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="bg-neutral-900 border border-white/5 p-6 rounded-3xl hover:border-white/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-white mb-1">{loading ? '...' : stat.value}</div>
                                <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Quick Actions & Recent Info */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-3xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <LayoutDashboard className="text-neutral-500" size={20} />
                                Platform Overview
                            </h3>
                            <button className="text-rose-500 text-sm font-bold hover:underline">Download Report</button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-tighter">Creator Adoption</div>
                                <div className="text-4xl font-black text-white mb-2">+{((stats?.totalCreators || 0) / (stats?.totalUsers || 1) * 100).toFixed(1)}%</div>
                                <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                                    <TrendingUp size={16} />
                                    Growing trend
                                </div>
                            </div>
                            <div className="p-6 bg-black/40 border border-white/5 rounded-2xl">
                                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-tighter">Fan Activity</div>
                                <div className="text-4xl font-black text-white mb-2">{stats?.totalFans || 0}</div>
                                <div className="text-neutral-500 text-sm font-bold">Total active fans</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8">
                        <h3 className="text-xl font-bold text-white mb-6 uppercase text-xs tracking-widest text-neutral-500">Recent Platform Stats (30D)</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-neutral-400 font-bold">New Earnings</span>
                                <span className="text-white font-black">${stats?.recentStats?.earnings.toLocaleString() || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-neutral-400 font-bold">Platform Fees</span>
                                <span className="text-emerald-500 font-black">${stats?.recentStats?.fees.toLocaleString() || '0.00'}</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-neutral-400 font-bold">New Content</span>
                                <span className="text-amber-500 font-black">+{stats?.recentStats?.newPosts || 0} Posts</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                                <span className="text-neutral-400 font-bold">New Joinings</span>
                                <span className="text-rose-500 font-black">+{stats?.recentStats?.newUsers || 0} Users</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
