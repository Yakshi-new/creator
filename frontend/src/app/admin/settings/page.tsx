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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Total Gross Volume</div>
                        <div className="text-2xl font-black text-white">$ {transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Platform Revenue</div>
                        <div className="text-2xl font-black text-emerald-500">$ {totalRevenue.toLocaleString()}</div>
                    </div>
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Creator Payouts</div>
                        <div className="text-2xl font-black text-amber-500">$ {transactions.reduce((sum, t) => sum + t.creatorAmount, 0).toLocaleString()}</div>
                    </div>
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                        <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Successful Trans.</div>
                        <div className="text-2xl font-black text-blue-500">{transactions.filter(t => t.status === 'SUCCESS' || t.status === 'PENDING').length}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                    {/* Fee Setting Card */}
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors shadow-2xl shadow-black/40">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl">
                                <Percent size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Platform Fee</h3>
                        </div>
                        
                        <p className="text-neutral-500 text-sm mb-8 leading-relaxed font-medium">
                            Global commission rate for all transactions including subscriptions and tips.
                        </p>

                        <div className="space-y-6">
                            <div className="relative group">
                                <input 
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(e.target.value)}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white text-3xl font-black focus:outline-none focus:border-rose-500 transition-all text-center pr-16"
                                    min="0"
                                    max="100"
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl font-black text-neutral-700 group-focus-within:text-rose-500 transition-colors">%</span>
                            </div>

                            <button 
                                onClick={handleUpdateFee}
                                disabled={updating}
                                className="w-full bg-gradient-to-tr from-rose-600 to-rose-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-rose-600/20"
                            >
                                {updating ? 'Saving...' : <><Save size={20} /> Update Settings</>}
                            </button>
                        </div>

                        <div className="mt-8 p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-2">
                                <Info size={14} className="text-neutral-400" />
                                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Active System</span>
                            </div>
                            <p className="text-[11px] text-neutral-500 font-bold leading-relaxed">
                                Latest payment gateway integration active. TLS 1.3 encryption enabled for all vault transactions.
                            </p>
                        </div>
                    </div>

                    {/* Transaction Activity Chart Mock/Summary */}
                    <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
                         <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Financial Health</h3>
                                <p className="text-neutral-500 text-sm font-medium">Monthly revenue and payout distribution.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            </div>
                         </div>

                         <div className="flex-1 flex items-end gap-2 px-2 h-32 mb-8">
                            {/* Simple CSS Bar Chart */}
                            {[45, 60, 35, 80, 55, 90, 70, 40, 65, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-gradient-to-t from-rose-500/20 to-rose-500/60 rounded-t-lg transition-all hover:brightness-150" style={{ height: `${h}%` }}></div>
                            ))}
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                <div className="text-[10px] font-black text-neutral-500 uppercase mb-1">Net Margin</div>
                                <div className="text-xl font-black text-white">{fee}%</div>
                            </div>
                            <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                                <div className="text-[10px] font-black text-neutral-500 uppercase mb-1">Avg Ticket</div>
                                <div className="text-xl font-black text-white">${(transactions.reduce((sum, t) => sum + t.amount, 0) / (transactions.length || 1)).toFixed(2)}</div>
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
