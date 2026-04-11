'use client';

import { DollarSign, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CreditCard, Clock, Plus, X } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { useRazorpay } from '@/hooks/useRazorpay';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function FanWallet() {
    const { balance, fetchBalance } = useWallet();
    const { initiatePayment } = useRazorpay();

    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingTx, setLoadingTx] = useState(true);

    // Add Funds Modal
    const [showAddFunds, setShowAddFunds] = useState(false);
    const [fundAmount, setFundAmount] = useState('');
    const [addingFunds, setAddingFunds] = useState(false);

    const fetchTransactions = async () => {
        try {
            const { data } = await api.get('/payment/my-payments') as { data: any[] };
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoadingTx(false);
        }
    };

    useEffect(() => { fetchTransactions(); }, []);

    const handleAddFunds = () => {
        const amount = parseFloat(fundAmount);
        if (!amount || amount <= 0) return;
        setAddingFunds(true);
        initiatePayment({
            amount,
            type: 'WALLET_DEPOSIT',
            onSuccess: () => {
                setShowAddFunds(false);
                setFundAmount('');
                setAddingFunds(false);
                fetchBalance();
                fetchTransactions();
            },
            onError: () => {
                alert('Payment failed. Please try again.');
                setAddingFunds(false);
            }
        });
    };

    const QUICK_AMOUNTS = [100, 300, 500, 1000];

    return (
        <div className="p-6 text-white min-h-screen max-w-4xl mx-auto">
            <h1 className="text-3xl font-black mb-8">Wallet & Payments</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-3xl p-7 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all" />

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <WalletIcon className="text-rose-500" size={22} />
                                </div>
                                <h2 className="text-base font-black text-neutral-400">Available Balance</h2>
                            </div>

                            <div className="text-5xl font-black text-white mb-8 tracking-tight">
                                ₹{balance.toFixed(2)}
                            </div>

                            <button
                                onClick={() => setShowAddFunds(true)}
                                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                            >
                                <Plus size={20} /> Add Funds
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-4 bg-neutral-900 border border-white/5 rounded-2xl p-4">
                        <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                            Funds added to your wallet can be used to subscribe to creators, send tips, and unlock paid posts.
                        </p>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <Clock className="text-rose-500" size={20} />
                                Transaction History
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {loadingTx ? (
                                <div className="py-10 text-center text-neutral-500 font-bold">Loading...</div>
                            ) : transactions.length === 0 ? (
                                <div className="py-16 text-center">
                                    <CreditCard className="text-neutral-700 mx-auto mb-3" size={40} />
                                    <p className="text-neutral-500 font-bold">No transactions yet</p>
                                    <p className="text-xs text-neutral-600 mt-1">Add funds to get started</p>
                                </div>
                            ) : transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-2xl ${
                                            tx.type === 'WALLET_DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {tx.type === 'WALLET_DEPOSIT' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm">{tx.type.replace(/_/g, ' ')}</p>
                                            <p className="text-xs font-bold text-neutral-500">
                                                {new Date(tx.createdAt).toLocaleDateString('en-IN')} {tx.creator ? `· ${tx.creator.user.name}` : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${tx.type === 'WALLET_DEPOSIT' ? 'text-emerald-500' : 'text-white'}`}>
                                            {tx.type === 'WALLET_DEPOSIT' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                                        </p>
                                        <p className={`text-[10px] font-black uppercase ${tx.status === 'SUCCESS' ? 'text-emerald-500' : tx.status === 'PENDING' ? 'text-amber-500' : 'text-rose-500'}`}>
                                            {tx.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Funds Modal */}
            {showAddFunds && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-[2.5rem] p-8 relative shadow-2xl">
                        <button
                            onClick={() => setShowAddFunds(false)}
                            className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-500/10 rounded-2xl">
                                <WalletIcon className="text-rose-500" size={22} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Add Funds</h2>
                                <p className="text-xs text-neutral-500 font-medium">Secure payment via Razorpay</p>
                            </div>
                        </div>

                        {/* Quick amounts */}
                        <div className="grid grid-cols-4 gap-2 mb-5">
                            {QUICK_AMOUNTS.map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setFundAmount(amt.toString())}
                                    className={`py-2 rounded-xl text-sm font-black transition-all ${
                                        fundAmount === amt.toString()
                                            ? 'bg-rose-500 text-white'
                                            : 'bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                                >
                                    ₹{amt}
                                </button>
                            ))}
                        </div>

                        <label className="block text-xs font-black text-neutral-500 uppercase tracking-widest mb-2">Custom Amount (₹)</label>
                        <input
                            type="number"
                            value={fundAmount}
                            onChange={e => setFundAmount(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-4 text-white text-xl font-black mb-6 outline-none focus:border-rose-500 transition-all"
                            placeholder="0"
                            min="1"
                        />

                        <button
                            onClick={handleAddFunds}
                            disabled={addingFunds || !fundAmount || parseFloat(fundAmount) <= 0}
                            className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-2xl hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-rose-500/20"
                        >
                            {addingFunds ? 'Opening payment...' : `Pay ₹${fundAmount || '0'}`}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}