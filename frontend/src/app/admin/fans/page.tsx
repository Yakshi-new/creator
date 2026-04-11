'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    CreditCard,
    Trash2,
    Lock,
    Unlock,
    Pencil,
    User
} from 'lucide-react';
import api from '@/lib/api';

interface Fan {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    createdAt: string;
    wallet: { balance: number };
    _count: { subscriptions: number };
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

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            await api.post('/admin/user-status', { userId, isActive: !currentStatus });
            fetchFans();
        } catch (err) {
            alert("Failed to update user status");
        }
    };

    const [editModal, setEditModal] = useState<{show: boolean, fan: Fan | null}>({show: false, fan: null});

    const handleEdit = (fan: Fan) => {
        setEditModal({show: true, fan});
    };

    const handleSaveEdit = async () => {
        alert("Fan details updated (Stub)");
        setEditModal({show: false, fan: null});
    };

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this fan?")) return;
        try {
            await api.delete(`/admin/user/${userId}`);
            fetchFans();
        } catch (err) {
            alert("Failed to delete user");
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
                        <p className="text-neutral-500 font-medium">Manage and support platform users.</p>
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
                    </div>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-neutral-500 text-xs font-black uppercase tracking-widest">
                                <th className="px-8 py-5">Fan</th>
                                <th className="px-8 py-5">Wallet</th>
                                <th className="px-8 py-5">Subs</th>
                                <th className="px-8 py-5">Joined</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white">
                            {filteredFans.map((fan) => (
                                <tr key={fan.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="font-bold">{fan.name}</div>
                                        <div className="text-xs text-neutral-500">{fan.email}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="text-sm font-black text-emerald-500">${fan.wallet?.balance?.toFixed(2)}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-sm text-neutral-400">{fan._count.subscriptions}</td>
                                    <td className="px-8 py-5 text-sm text-neutral-400">{new Date(fan.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleStatusToggle(fan.id, fan.isActive)}
                                                className={`p-2 rounded-xl transition-all ${fan.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                title={fan.isActive ? "Deactivate Account" : "Activate Account"}
                                            >
                                                {fan.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>

                                            <button 
                                                onClick={() => handleEdit(fan)}
                                                className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                                title="Edit Fan Detail"
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button 
                                                onClick={() => alert(`Wallet Detail for ${fan.name}: $${fan.wallet?.balance?.toFixed(2)}`)}
                                                className="p-2 bg-neutral-800 text-neutral-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all" 
                                                title="View Wallet Detail"
                                            >
                                                <CreditCard size={18} />
                                            </button>

                                            <button 
                                                onClick={() => handleDelete(fan.id)}
                                                className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                title="Delete Fan"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Edit Modal */}
                {editModal.show && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 max-w-md w-full">
                            <h2 className="text-2xl font-black mb-6">Edit Fan Detail</h2>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Full Name</label>
                                    <input type="text" defaultValue={editModal.fan?.name} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Email</label>
                                    <input type="email" defaultValue={editModal.fan?.email} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setEditModal({show: false, fan: null})} className="flex-1 py-3 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleSaveEdit} className="flex-1 py-3 bg-cyan-600 text-white font-black rounded-2xl hover:bg-cyan-500 transition-all">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
