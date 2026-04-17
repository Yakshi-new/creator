'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    DollarSign, TrendingUp, BarChart3, 
    ArrowUpRight, ArrowDownRight, 
    Calendar, Download, PieChart,
    Wallet, CreditCard
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminRevenue() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [platformFeePercent, setPlatformFeePercent] = useState<number>(25);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, feeRes] = await Promise.all([
                    api.get('/payment/stats'),
                    api.get('/admin/settings')
                ]);
                setData(statsRes.data);
                if (feeRes.data) {
                    setPlatformFeePercent(parseFloat((feeRes.data as { value: string }).value));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateFee = async () => {
        if (platformFeePercent < 0 || platformFeePercent > 100) return alert('Invalid percentage');
        setUpdating(true);
        try {
            await api.post('/admin/settings', { key: 'PLATFORM_FEE_PERCENTAGE', value: platformFeePercent });
            alert('Platform fee updated successfully!');
        } catch (err) {
            alert('Failed to update fee');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return null; // Or skeleton

    const summary = data?.summary?._sum || { amount: 0, platformFee: 0, creatorAmount: 0 };
    const amount = summary.amount ?? 0;
    const platformFee = summary.platformFee ?? 0;
    const creatorAmount = summary.creatorAmount ?? 0;
    const count = data?.summary?._count || 0;

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />
            
            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Revenue Dashboard</h1>
                        <p className="text-neutral-500 font-medium">Detailed breakdown of platform processing and fees.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-neutral-300 px-6 py-3 rounded-2xl text-sm font-black hover:border-white/20 transition-all">
                        <Download size={18} /> Generate Financial Report
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem]">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6">
                            <TrendingUp size={24} />
                        </div>
                        <div className="text-4xl font-black text-white mb-1">${amount.toLocaleString()}</div>
                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Total Transaction Volume</p>
                    </div>
                    
                    <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem]">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                            <DollarSign size={24} />
                        </div>
                        <div className="text-4xl font-black text-white mb-1">${platformFee.toLocaleString()}</div>
                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Platform Net Revenue</p>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 p-8 rounded-[2rem]">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-6">
                            <BarChart3 size={24} />
                        </div>
                        <div className="text-4xl font-black text-white mb-1">{count}</div>
                        <p className="text-sm font-bold text-neutral-500 uppercase tracking-widest">Successful Payments</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <PieChart className="text-rose-500" /> 
                            Earnings Split
                        </h2>
                        
                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-1">Creator Earnings</p>
                                        <p className="text-2xl font-black text-white">${creatorAmount.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-black text-neutral-500">{100 - platformFeePercent}%</p>
                                </div>
                                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full" style={{ width: `${100 - platformFeePercent}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <p className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-1">Platform Fees</p>
                                        <p className="text-2xl font-black text-white">${platformFee.toLocaleString()}</p>
                                    </div>
                                    <p className="text-sm font-black text-neutral-500">{platformFeePercent}%</p>
                                </div>
                                <div className="h-4 bg-neutral-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${platformFeePercent}%` }} />
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center gap-6">
                            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl">
                                <Wallet size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-neutral-500">Estimated platform bank balance</p>
                                <p className="text-xl font-black text-white">${(platformFee * 0.98).toLocaleString()} <span className="text-xs text-neutral-600 font-medium">(Post tax/PG fees)</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10">
                        <h2 className="text-xl font-black text-white mb-8 flex items-center gap-3">
                            <CreditCard className="text-amber-500" /> 
                            Recent Processing
                        </h2>
                        
                        <div className="space-y-6">
                            {/* Daily summaries would go here */}
                            <div className="text-center py-20">
                                <p className="text-neutral-500 font-bold mb-2">Revenue Growth Chart</p>
                                <div className="h-32 flex items-end justify-center gap-2">
                                    {[40, 70, 45, 90, 65, 80, 50, 95, 100].map((h, i) => (
                                        <div 
                                            key={i} 
                                            className="w-8 bg-rose-500/20 hover:bg-rose-500 transition-all rounded-t-lg cursor-pointer group relative" 
                                            style={{ height: `${h}%` }}
                                        >
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                Day {i+1}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-6">March 2026 Transaction Flow</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 max-w-xl">
                    <h2 className="text-xl font-black text-white mb-6">Platform Settings</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-black text-neutral-500 uppercase tracking-widest block mb-2">Global Platform Fee (%)</label>
                            <div className="flex gap-4">
                                <input 
                                    type="number" 
                                    value={platformFeePercent}
                                    onChange={(e) => setPlatformFeePercent(parseFloat(e.target.value))}
                                    className="flex-1 bg-black border border-white/10 rounded-2xl px-6 py-4 text-white font-black focus:border-rose-500/50 outline-none transition-all"
                                    placeholder="25"
                                />
                                <button 
                                    onClick={handleUpdateFee}
                                    disabled={updating}
                                    className="px-8 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-500 transition-all disabled:opacity-50"
                                >
                                    {updating ? 'Saving...' : 'Update Fee'}
                                </button>
                            </div>
                            <p className="text-xs text-neutral-600 mt-2 font-medium italic">
                                * This fee will be applied to all future subscriptions, tips, and paid post purchases.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
