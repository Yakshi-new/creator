'use client';

import { DollarSign, ArrowUpRight, ArrowDownLeft, Wallet as WalletIcon, CreditCard, Clock } from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

export default function FanWallet() {
    const { balance, addFunds } = useWallet();

    const handleAddFunds = () => {
        const amount = prompt('Enter amount to add (USD):');
        if (amount && !isNaN(Number(amount))) {
            addFunds(Number(amount));
            alert('Funds added successfully! Simulated transaction.');
        }
    };

    const dummyTransactions = [
        { id: 1, type: 'DEPOSIT', amount: 50, date: '2026-03-12T10:00:00Z', status: 'SUCCESS' },
        { id: 2, type: 'SUBSCRIPTION', amount: -4.99, date: '2026-03-11T14:30:00Z', status: 'SUCCESS', to: 'creator_1' },
        { id: 3, type: 'TIP', amount: -10, date: '2026-03-10T09:15:00Z', status: 'SUCCESS', to: 'creator_2' },
        { id: 4, type: 'DEPOSIT', amount: 100, date: '2026-03-05T18:45:00Z', status: 'SUCCESS' },
    ];

    return (
        <div className="p-10 text-white min-h-screen">
            <h1 className="text-4xl font-black mb-10">Wallet & Payments</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Balance Card */}
                <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-neutral-900 to-black border border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-rose-500/50 transition-all">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-rose-500/20 transition-all" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-white/5 rounded-2xl">
                                    <WalletIcon className="text-rose-500" size={24} />
                                </div>
                                <h2 className="text-lg font-black text-neutral-400">Available Balance</h2>
                            </div>
                            
                            <div className="text-5xl font-black text-white mb-8 tracking-tight">
                                ${balance.toFixed(2)}
                            </div>

                            <button 
                                onClick={handleAddFunds}
                                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                            >
                                <CreditCard size={20} />
                                Add Funds
                            </button>
                        </div>
                    </div>

                    {/* Payment methods (Dummy) */}
                    <div className="mt-8 bg-neutral-900 border border-white/5 rounded-3xl p-6">
                        <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest mb-4">Payment Methods</h3>
                        <div className="flex items-center justify-between p-4 bg-black rounded-2xl border border-white/5 mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-gradient-to-tr from-blue-600 to-blue-400 rounded flex items-center justify-center text-[10px] font-black italic">VISA</div>
                                <div>
                                    <p className="font-bold text-sm">•••• 4242</p>
                                    <p className="text-xs text-neutral-500 font-medium">Expires 12/28</p>
                                </div>
                            </div>
                            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">Default</span>
                        </div>
                        <button className="w-full py-3 border border-dashed border-white/20 rounded-2xl text-sm font-bold text-neutral-400 hover:text-white hover:border-white/40 transition-all">
                            + Add New Card
                        </button>
                    </div>
                </div>

                {/* Transaction History */}
                <div className="lg:col-span-2">
                    <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 h-full">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black flex items-center gap-3">
                                <Clock className="text-rose-500" />
                                Recent Transactions
                            </h2>
                            <button className="text-sm font-bold text-neutral-500 hover:text-white transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="space-y-4">
                            {dummyTransactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/50 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${
                                            tx.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                        }`}>
                                            {tx.type === 'DEPOSIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="font-black text-white">{tx.type.charAt(0) + tx.type.slice(1).toLowerCase()}</p>
                                            <p className="text-xs font-bold text-neutral-500">
                                                {new Date(tx.date).toLocaleDateString()} • {tx.to ? `To ${tx.to}` : 'Wallet Funding'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${tx.type === 'DEPOSIT' ? 'text-emerald-500' : 'text-white'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : ''}{tx.amount.toFixed(2)} USD
                                        </p>
                                        <p className="text-[10px] font-black text-neutral-500 uppercase">{tx.status}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}