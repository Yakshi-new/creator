'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    ExternalLink,
    MoreVertical,
    ShieldCheck
} from 'lucide-react';
import api from '@/lib/api';

interface Creator {
    id: number;
    userId: number;
    bio: string;
    avatar: string;
    subscriptionPrice: number;
    isKycVerified: boolean;
    user: {
        name: string;
        email: string;
        createdAt: string;
    }
}

export default function AdminCreators() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCreators();
    }, []);

    const fetchCreators = async () => {
        try {
            const res = await api.get('/admin/creators');
            setCreators(res.data as Creator[]);
        } catch (err) {
            console.error("Failed to fetch creators", err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number, verified: boolean) => {
        try {
            await api.post('/admin/verify-creator', 
                { creatorId: id, verified }
            );
            fetchCreators();
        } catch (err) {
            alert("Failed to update verification status");
        }
    };

    const filteredCreators = creators.filter(c => 
        c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white mb-2">Creator Management</h1>
                        <p className="text-neutral-500 font-medium">Review and verify platform creators.</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Search creators..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-rose-500 w-64 transition-all"
                            />
                        </div>
                        <button className="p-3 bg-neutral-900 border border-white/5 rounded-2xl text-white hover:bg-neutral-800 transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-neutral-500 text-xs font-black uppercase tracking-widest">
                                <th className="px-8 py-5">Creator</th>
                                <th className="px-8 py-5">Sub Price</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {filteredCreators.map((creator) => (
                                <tr key={creator.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex-shrink-0 overflow-hidden border border-white/5">
                                                {creator.avatar ? <img src={creator.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600 font-black">?</div>}
                                            </div>
                                            <div>
                                                <div className="font-bold flex items-center gap-1">
                                                    {creator.user?.name}
                                                    {creator.isKycVerified && <ShieldCheck size={14} className="text-blue-500" />}
                                                </div>
                                                <div className="text-xs text-neutral-500">{creator.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold">${creator.subscriptionPrice.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-sm text-neutral-400">{new Date(creator.user?.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-5">
                                        {creator.isKycVerified ? (
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest">Verified</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!creator.isKycVerified ? (
                                                <button 
                                                    onClick={() => handleVerify(creator.id, true)}
                                                    className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20"
                                                    title="Verify Creator"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleVerify(creator.id, false)}
                                                    className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20"
                                                    title="Revoke Verification"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                            <button className="p-2 bg-neutral-800 text-neutral-400 rounded-xl hover:text-white transition-all">
                                                <ExternalLink size={18} />
                                            </button>
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
