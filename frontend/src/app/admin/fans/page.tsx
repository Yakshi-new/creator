'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    MoreVertical,
    Wallet,
    Heart,
    CreditCard,
    Star
} from 'lucide-react';
import api from '@/lib/api';

interface Fan {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    wallet: {
        balance: number;
    };
    _count: {
        subscriptions: number;
    }
}

export default function AdminFans() {
    const [fans, setFans] = useState<Fan[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFans();
    }, []);

    const fetchFans = async () => {
        try {
            const res = await api.get('/admin/fans');
            setFans(res.data as Fan[]);
        } catch (err) {
            console.error("Failed to fetch fans", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (userId: number) => {
        if (!confirm('Upgrade this fan to a creator?')) return;
        try {
            await api.post('/admin/upgrade-user', { userId });
            alert('User upgraded successfully!');
            fetchFans(); // Refresh list
        } catch (err) {
            alert('Failed to upgrade user.');
        }
    };

    const filteredFans = fans.filter(f => 
        f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Fan Management</h1>
                        <p className="text-neutral-500 font-medium">Manage platform fans and their wallets.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Search fans..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-cyan-500 w-64 transition-all"
                            />
                        </div>
                        <button className="p-3 bg-neutral-900 border border-white/5 rounded-2xl text-white hover:bg-neutral-800 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/20">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                <th className="px-8 py-5">Fan</th>
                                <th className="px-8 py-5">Wallet Balance</th>
                                <th className="px-8 py-5">Subscriptions</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5 text-right">Activity</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {filteredFans.map((fan) => (
                                <tr key={fan.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 flex-shrink-0 flex items-center justify-center border border-cyan-500/10 font-bold text-cyan-500 text-sm">
                                                {fan.name?.charAt(0) || 'F'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm tracking-tight text-white">{fan.name}</div>
                                                <div className="text-[11px] text-neutral-500 font-medium">{fan.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 font-black text-rose-500">
                                            <Wallet size={14} />
                                            ${fan.wallet?.balance?.toFixed(2) || '0.00'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-neutral-400 font-bold text-sm">
                                            <Heart size={14} className="text-rose-500/60" />
                                            {fan._count.subscriptions} Sub
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-xs text-neutral-500 font-bold">{new Date(fan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleUpgrade(fan.id)}
                                                className="p-2 bg-white/5 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-lg shadow-amber-500/0 hover:shadow-amber-500/20 group-hover:scale-105" 
                                                title="Upgrade to Creator"
                                            >
                                                <Star size={16} />
                                            </button>
                                            <button className="p-2 bg-white/5 text-neutral-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20 group-hover:scale-105" title="View Wallet Detail"><CreditCard size={16} /></button>
                                            <button className="p-2 bg-white/5 text-neutral-400 rounded-xl hover:text-white hover:bg-neutral-800 transition-all group-hover:scale-105"><MoreVertical size={16} /></button>
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
