'use client';

import { useEffect, useState } from 'react';
import {
    DollarSign, TrendingUp, Users, ArrowUpRight,
    Calendar, Download, CreditCard, Banknote,
    PieChart, Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';


function BarSegment({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-24 text-xs text-neutral-500 font-bold shrink-0">{label}</div>
            <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} />
            </div>
            <div className="w-14 text-xs font-black text-white text-right">${value.toLocaleString()}</div>
        </div>
    );
}

const STATUS_STYLES: Record<string, string> = {
    SUCCESS: 'text-emerald-400 bg-emerald-400/10',
    PENDING: 'text-amber-400 bg-amber-400/10',
    FAILED: 'text-rose-400 bg-rose-400/10',
};

const TYPE_LABELS: Record<string, string> = {
    subscription: 'Subscription',
    tip: 'Tip',
    paid_post: 'Pay-Per-View',
};

type Period = '7d' | '30d' | '90d' | 'all';

export default function EarningsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('30d');
    const [txFilter, setTxFilter] = useState<string>('all');
    const [showPayoutModal, setShowPayoutModal] = useState(false);
    const [payoutForm, setPayoutForm] = useState({ amount: '', method: 'BANK', details: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [bankDetails, setBankDetails] = useState<{ accountNumber?: string; ifscCode?: string }>({});

    const fetch = async () => {
        setLoading(true);
        try {
            const { data: earningsData } = await api.get('/creators/earnings');
            setData(earningsData);
        } catch {
            setData({
                stats: { totalEarnings: 0, thisMonth: 0, lastMonth: 0, subscriptionRevenue: 0, tipRevenue: 0, paidPostRevenue: 0, pendingPayout: 0, lifetimePayout: 0 },
                monthlyBreakdown: [],
                transactions: [],
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
        // Fetch KYC bank details to auto-populate payout form
        api.get('/kyc/status').then((res: any) => {
            const d = res.data as any;
            if (d?.bankAccountNumber) {
                setBankDetails({ accountNumber: d.bankAccountNumber, ifscCode: d.bankIfscCode });
                setPayoutForm(prev => ({
                    ...prev,
                    details: `Account: ${d.bankAccountNumber}, IFSC: ${d.bankIfscCode}`
                }));
            }
        }).catch(() => {});
    }, []);

    const handlePayoutRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(payoutForm.amount) < 50) {
            alert("Minimum payout is $50");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post('/withdrawals/request', {
                amount: parseFloat(payoutForm.amount),
                payoutMethod: payoutForm.method,
                payoutDetails: payoutForm.details
            });
            alert("Withdrawal request submitted!");
            setShowPayoutModal(false);
            fetch(); // Refresh data
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-black">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const d = data || {
        stats: { totalEarnings: 0, thisMonth: 0, lastMonth: 0, subscriptionRevenue: 0, tipRevenue: 0, paidPostRevenue: 0, pendingPayout: 0, lifetimePayout: 0 },
        monthlyBreakdown: [],
        transactions: [],
    };
    const growthPct = d.stats.lastMonth > 0
        ? (((d.stats.thisMonth - d.stats.lastMonth) / d.stats.lastMonth) * 100).toFixed(1)
        : '0';
    const isUp = parseFloat(growthPct) >= 0;

    const maxTotal = Math.max(...(d.monthlyBreakdown || []).map((m: any) => m.total));
    const filteredTx = (d.transactions || []).filter((t: any) => txFilter === 'all' || t.type === txFilter);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
                <div>
                    <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Revenue Center</div>
                    <h1 className="text-3xl font-black text-white">Earnings & Payouts</h1>
                    <p className="text-neutral-500 mt-1">Track your income across all revenue streams</p>
                </div>
                <div className="flex gap-3">
                    {/* Period selector */}
                    <div className="flex bg-neutral-900 border border-white/10 rounded-2xl p-1">
                        {(['7d', '30d', '90d', 'all'] as Period[]).map(p => (
                            <button key={p} onClick={() => setPeriod(p)}
                                className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${period === p ? 'bg-rose-500 text-white' : 'text-neutral-500 hover:text-white'}`}>
                                {p === 'all' ? 'All time' : p}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-neutral-300 px-4 py-2 rounded-2xl text-sm font-black hover:border-white/20 transition-all">
                        <Download size={15} /> Export CSV
                    </button>
                </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Earned', value: `$${d.stats.totalEarnings.toLocaleString()}`, sub: 'All-time revenue', icon: DollarSign, color: 'rose', iconClass: 'text-rose-400 bg-rose-400/10' },
                    { label: 'This Month', value: `$${d.stats.thisMonth.toLocaleString()}`, sub: `${isUp ? '▲' : '▼'} ${growthPct}% vs last month`, icon: TrendingUp, color: 'emerald', iconClass: 'text-emerald-400 bg-emerald-400/10' },
                    { label: 'Pending Payout', value: `$${d.stats.pendingPayout.toLocaleString()}`, sub: 'Processing ~3 business days', icon: Clock, color: 'amber', iconClass: 'text-amber-400 bg-amber-400/10' },
                    { label: 'Lifetime Paid Out', value: `$${d.stats.lifetimePayout.toLocaleString()}`, sub: 'To your bank account', icon: CreditCard, color: 'violet', iconClass: 'text-violet-400 bg-violet-400/10' },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-neutral-900 border border-white/5 rounded-3xl p-6 hover:border-white/15 transition-all">
                            <div className={`w-10 h-10 rounded-2xl ${s.iconClass} flex items-center justify-center mb-4`}>
                                <Icon size={18} />
                            </div>
                            <div className="text-2xl font-black text-white">{s.value}</div>
                            <div className="text-xs font-black text-neutral-500 uppercase tracking-wider mt-1">{s.label}</div>
                            <div className="text-xs text-neutral-600 mt-1">{s.sub}</div>
                        </div>
                    );
                })}
            </div>

            {/* Main Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Monthly Bar Chart */}
                <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-3xl p-8">
                    <h2 className="text-lg font-black text-white mb-6">Monthly Revenue Breakdown</h2>
                    <div className="space-y-6">
                        {(d.monthlyBreakdown || []).map((m: any) => (
                            <div key={m.month}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-neutral-400">{m.month}</span>
                                    <span className="text-sm font-black text-white">${m.total.toLocaleString()}</span>
                                </div>
                                <div className="h-3 bg-neutral-800 rounded-full overflow-hidden flex gap-0.5">
                                    <div className="bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-700" style={{ width: `${(m.subscriptions / m.total) * 100}%` }} />
                                    <div className="bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700" style={{ width: `${(m.tips / m.total) * 100}%` }} />
                                    <div className="bg-gradient-to-r from-violet-500 to-violet-400 rounded-full transition-all duration-700" style={{ width: `${(m.paidPosts / m.total) * 100}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Legend */}
                    <div className="flex gap-6 mt-6">
                        {[
                            { color: 'bg-rose-400', label: 'Subscriptions' },
                            { color: 'bg-amber-400', label: 'Tips' },
                            { color: 'bg-violet-400', label: 'Pay-Per-View' },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                                <span className="text-xs text-neutral-500 font-bold">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Sources */}
                <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                        <PieChart size={18} className="text-rose-400" /> Revenue Sources
                    </h2>
                    <div className="space-y-5">
                        <BarSegment label="Subscriptions" value={d.stats.subscriptionRevenue} max={d.stats.totalEarnings} color="bg-gradient-to-r from-rose-500 to-rose-400" />
                        <BarSegment label="Tips" value={d.stats.tipRevenue} max={d.stats.totalEarnings} color="bg-gradient-to-r from-amber-500 to-amber-400" />
                        <BarSegment label="Paid Posts" value={d.stats.paidPostRevenue} max={d.stats.totalEarnings} color="bg-gradient-to-r from-violet-500 to-violet-400" />
                    </div>

                    {/* Payout button */}
                    <div className="mt-8 p-5 bg-gradient-to-br from-rose-500/10 to-amber-500/10 border border-rose-500/20 rounded-2xl">
                        <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Available to Withdraw</div>
                        <div className="text-3xl font-black text-white mb-1">${d.balance?.toFixed(2) || d.stats.pendingPayout.toFixed(2)}</div>
                        <div className="text-xs text-neutral-500 mb-4">Minimum payout: $50.00</div>
                        <button 
                            onClick={() => {
                                setPayoutForm({ ...payoutForm, amount: (d.balance || 0).toString() });
                                setShowPayoutModal(true);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <Banknote size={16} /> Request Payout
                        </button>
                    </div>
                </div>
            </div>

            {/* Payout Modal */}
            {showPayoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-[2.5rem] p-10 relative shadow-2xl">
                        <h2 className="text-2xl font-black mb-2 text-white">Request Payout</h2>
                        <p className="text-neutral-500 mb-8 font-medium">Funds will be sent to your preferred payment method.</p>
                        
                        <form onSubmit={handlePayoutRequest} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Amount ($)</label>
                                <input 
                                    type="number"
                                    value={payoutForm.amount}
                                    onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})}
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 focus:border-rose-500 outline-none transition-all font-bold"
                                    placeholder="Enter amount"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Payout Method</label>
                                <div className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold text-sm">
                                    Bank Transfer (NEFT/IMPS)
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Bank Details</label>
                                <textarea 
                                    value={payoutForm.details}
                                    onChange={e => setPayoutForm({...payoutForm, details: e.target.value})}
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 focus:border-rose-500 outline-none transition-all font-medium h-24 resize-none"
                                    placeholder="Account number and IFSC code"
                                    required
                                />
                                {bankDetails.accountNumber && (
                                    <p className="text-[10px] text-emerald-500 font-bold mt-1 pl-1">✓ Auto-filled from your KYC bank details</p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowPayoutModal(false)}
                                    className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-neutral-400 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-rose-500 rounded-2xl font-black hover:bg-rose-600 transition-all text-white disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                        <CreditCard size={18} className="text-amber-400" /> Transaction History
                    </h2>
                    {/* Filter */}
                    <div className="flex bg-neutral-800 rounded-2xl p-1">
                        {[
                            { value: 'all', label: 'All' },
                            { value: 'subscription', label: 'Subscriptions' },
                            { value: 'tip', label: 'Tips' },
                            { value: 'paid_post', label: 'PPV' },
                        ].map(opt => (
                            <button key={opt.value} onClick={() => setTxFilter(opt.value)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${txFilter === opt.value ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'}`}>
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5">
                                {['Type', 'Fan', 'Amount', 'Date', 'Status'].map(h => (
                                    <th key={h} className="text-left text-xs font-black text-neutral-500 uppercase tracking-wider pb-4 pr-6">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredTx.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-white/2 transition-all">
                                    <td className="py-4 pr-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{tx.icon}</span>
                                            <span className="text-sm font-bold text-neutral-300">{TYPE_LABELS[tx.type]}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-sm text-white font-medium">{tx.fan}</td>
                                    <td className="py-4 pr-6 text-sm font-black text-emerald-400">+${tx.amount.toFixed(2)}</td>
                                    <td className="py-4 pr-6 text-xs text-neutral-500">{new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td className="py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-black ${STATUS_STYLES[tx.status] || STATUS_STYLES.PENDING}`}>
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}