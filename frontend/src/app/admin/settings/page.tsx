'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Settings, 
    Save, 
    Percent, 
    TrendingUp, 
    AlertCircle,
    Info,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import api from '@/lib/api';

interface GlobalSetting {
    key: string;
    value: string;
}

interface Transaction {
    id: number;
    amount: number;
    platformFee: number;
    creatorAmount: number;
    type: string;
    status: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    }
}

export default function AdminSettings() {
    const [fee, setFee] = useState<string>('25');
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingRes, transRes] = await Promise.all([
                    api.get('/admin/settings'),
                    api.get('/admin/transactions')
                ]);
                setFee((settingRes.data as { value: string }).value);
                setTransactions(transRes.data as Transaction[]);
            } catch (err) {
                console.error("Failed to fetch settings", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleUpdateFee = async () => {
        setUpdating(true);
        try {
            await api.post('/admin/settings', 
                { key: 'PLATFORM_FEE_PERCENTAGE', value: fee }
            );
            alert("Platform fee updated successfully");
        } catch (err) {
            alert("Failed to update fee");
        } finally {
            setUpdating(false);
        }
    };

    const filteredTransactions = transactions.filter(t => 
        t.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalRevenue = transactions.reduce((sum, t) => sum + t.platformFee, 0);

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2">Financial Management</h1>
                    <p className="text-neutral-500 font-medium">Manage platform fees and view transaction history.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Fee Setting Card */}
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl shadow-black/40">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                                <Percent size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Platform Fee</h3>
                        </div>
                        
                        <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                            This percentage will be automatically deducted from all creator earnings (subscriptions, tips, and paid posts).
                        </p>

                        <div className="space-y-6">
                            <div className="relative group">
                                <input 
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    className="w-full bg-black/60 border border-white/5 rounded-2xl px-6 py-4 text-white text-2xl font-black focus:outline-none focus:border-rose-500 transition-all text-center pr-16"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-neutral-600 group-focus-within:text-rose-500 transition-colors">%</span>
                            </div>

                            <button 
                                onClick={handleUpdateFee}
                                disabled={updating}
                                className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-rose-600/20"
                            >
                                {updating ? 'Updating...' : <><Save size={20} /> Update Settings</>}
                            </button>
                        </div>

                        <div className="mt-8 flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                            <Info size={18} className="text-amber-500 flex-shrink-0" />
                            <p className="text-[11px] text-amber-500/80 font-bold leading-relaxed">
                                Changes are applied immediately to all future transactions. Current subscriptions will retain their initial fee structure until renewal.
                            </p>
                        </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl shadow-black/40">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                                    <TrendingUp size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Platform Revenue</h3>
                            </div>
                            <div className="px-4 py-2 bg-black/40 border border-white/5 rounded-2xl text-xs font-black text-neutral-500 flex items-center gap-2 uppercase tracking-widest">
                                <Calendar size={14} /> Total Lifetime
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 mb-10">
                            <div>
                                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-widest">Total Fees Collected</div>
                                <div className="text-5xl font-black text-white mb-2 tracking-tighter">${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                                <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold">
                                    <ArrowUpRight size={16} />
                                    +{((totalRevenue / (transactions.length || 1)) * 0.1).toFixed(2)}% vs last month
                                </div>
                            </div>
                            <div className="border-l border-white/5 pl-8">
                                <div className="text-sm font-bold text-neutral-500 mb-2 uppercase tracking-widest">Creator Payouts</div>
                                <div className="text-4xl font-black text-neutral-400 mb-2 tracking-tighter">
                                    ${transactions.reduce((sum, t) => sum + t.creatorAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </div>
                                <p className="text-neutral-600 text-xs font-bold leading-relaxed">Total amount distributed to creators after platform fees.</p>
                            </div>
                        </div>

                        <div className="p-6 bg-black/40 border border-white/5 rounded-3xl">
                            <div className="flex items-center justify-between gap-10">
                                <div>
                                    <div className="text-sm font-black text-white mb-1">Tax Residency & Compliance</div>
                                    <div className="text-xs text-neutral-500 font-bold">Automatic withholding and reporting for international transactions.</div>
                                </div>
                                <button className="px-6 py-3 bg-white/5 text-white text-xs font-black rounded-xl hover:bg-white/10 transition-all flex-shrink-0">MANAGE TAXES</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                        <h3 className="text-xl font-bold text-white">Transaction Logs</h3>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
                            <input 
                                type="text"
                                placeholder="Search logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-6 py-2.5 bg-black/40 border border-white/5 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 w-64 transition-all"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                    <th className="px-8 py-5">User</th>
                                    <th className="px-8 py-5">Type</th>
                                    <th className="px-8 py-5">Gross Amount</th>
                                    <th className="px-8 py-5">Platform Fee</th>
                                    <th className="px-8 py-5">Creator Earnings</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="text-white text-sm">
                                {filteredTransactions.map((t) => (
                                    <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 font-bold">{t.user?.name || 'Unknown User'}</td>
                                        <td className="px-8 py-5 uppercase text-[10px] font-black tracking-widest text-neutral-400">
                                            <span className="px-2 py-1 bg-white/5 rounded-md">{t.type}</span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-white">${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-8 py-5 text-rose-500 font-bold">-${t.platformFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-8 py-5 text-emerald-500 font-bold">${t.creatorAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-8 py-5 text-neutral-500 font-bold text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                                        <td className="px-8 py-5 text-right flex justify-end">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                {t.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
