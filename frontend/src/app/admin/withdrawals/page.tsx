'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    CheckCircle, XCircle, Clock, 
    Banknote, User, Calendar, 
    ExternalLink, Search, Filter 
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminWithdrawals() {
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    const fetchWithdrawals = async () => {
        try {
            const { data } = await api.get('/withdrawals/all') as { data: any[] };
            setWithdrawals(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, []);

    const handleUpdateStatus = async (id: number, status: string) => {
        if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
        
        try {
            await api.post(`/withdrawals/update/${id}`, { status });
            alert(`Updated to ${status}`);
            fetchWithdrawals();
        } catch (err: any) {
            alert(err.response?.data?.message || "Update failed");
        }
    };

    const filtered = withdrawals.filter(w => filter === 'ALL' || w.status === filter);

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />
            
            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2">Withdrawal Management</h1>
                    <p className="text-neutral-500 font-medium">Review and process creator payout requests.</p>
                </header>

                <div className="flex gap-4 mb-8">
                    {['PENDING', 'APPROVED', 'COMPLETED', 'REJECTED', 'ALL'].map(s => (
                        <button 
                            key={s} 
                            onClick={() => setFilter(s)}
                            className={`px-6 py-3 rounded-2xl font-black text-xs transition-all ${
                                filter === s 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                                : 'bg-neutral-900 text-neutral-500 hover:text-white border border-white/5'
                            }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Creator</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Amount</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Method</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Date</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={5} className="p-20 text-center text-neutral-500 font-bold">Loading requests...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="p-20 text-center text-neutral-500 font-bold">No requests found.</td></tr>
                            ) : filtered.map((w) => (
                                <tr key={w.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-black text-xs text-rose-500">
                                                {w.creator.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">{w.creator.user.name}</p>
                                                <p className="text-xs text-neutral-500 font-bold">{w.creator.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-white">${w.amount.toFixed(2)}</p>
                                        <p className={`text-[10px] font-black uppercase ${
                                            w.status === 'PENDING' ? 'text-amber-500' : 
                                            w.status === 'COMPLETED' ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>{w.status}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 inline-block">
                                            <p className="text-[10px] font-black text-neutral-500 uppercase mb-1">{w.payoutMethod}</p>
                                            <p className="text-xs font-bold text-white max-w-[200px] truncate">{w.payoutDetails}</p>
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs text-neutral-500 font-bold">
                                        {new Date(w.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end gap-2">
                                            {w.status === 'PENDING' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(w.id, 'APPROVED')}
                                                        className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleUpdateStatus(w.id, 'REJECTED')}
                                                        className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                            {w.status === 'APPROVED' && (
                                                <button 
                                                    onClick={() => handleUpdateStatus(w.id, 'COMPLETED')}
                                                    className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-black hover:bg-rose-600 transition-all"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
