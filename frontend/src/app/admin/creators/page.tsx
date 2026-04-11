'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    CheckCircle2, 
    XCircle, 
    ShieldCheck,
    Trash2,
    Lock,
    Unlock,
    Eye,
    Pencil
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Creator {
    id: number;
    userId: number;
    bio: string;
    avatar: string;
    subscriptionPrice: number;
    isKycVerified: boolean;
    user: {
        id: number;
        name: string;
        email: string;
        isActive: boolean;
        createdAt: string;
    }
}

export default function AdminCreators() {
    const [creators, setCreators] = useState<Creator[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

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

    const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
        try {
            await api.post('/admin/user-status', { userId, isActive: !currentStatus });
            fetchCreators();
        } catch (err) {
            alert("Failed to update user status");
        }
    };

    const [editModal, setEditModal] = useState<{show: boolean, creator: Creator | null}>({show: false, creator: null});
    const [editData, setEditData] = useState({ name: '', email: '', bio: '', subscriptionPrice: '0' });

    const handleEdit = (creator: Creator) => {
        setEditData({
            name: creator.user.name,
            email: creator.user.email,
            bio: creator.bio || '',
            subscriptionPrice: creator.subscriptionPrice.toString()
        });
        setEditModal({show: true, creator});
    };

    const handleSaveEdit = async () => {
        if (!editModal.creator) return;
        try {
            await api.post('/admin/creator-update', {
                creatorId: editModal.creator.id,
                ...editData
            });
            alert("Creator profile updated successfully");
            setEditModal({show: false, creator: null});
            fetchCreators();
        } catch (err) {
            alert("Failed to update creator profile");
        }
    };

    const handleDelete = async (userId: number) => {
        if (!confirm("Are you sure you want to delete this creator? This action is irreversible.")) return;
        try {
            await api.delete(`/admin/user/${userId}`);
            fetchCreators();
        } catch (err) {
            alert("Failed to delete user");
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
                    </div>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
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
                                                {creator.avatar ? <img src={creator.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-600 font-black italic">CH</div>}
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
                                    <td className="px-8 py-5 font-black text-emerald-500">${creator.subscriptionPrice.toFixed(2)}</td>
                                    <td className="px-8 py-5 text-sm font-bold text-neutral-500">{new Date(creator.user?.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-5">
                                        {creator.isKycVerified ? (
                                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Verified</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">Pending</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            {!creator.isKycVerified ? (
                                                <button onClick={() => handleVerify(creator.id, true)} className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/0 hover:shadow-emerald-500/20" title="Verify"><CheckCircle2 size={18} /></button>
                                            ) : (
                                                <button onClick={() => handleVerify(creator.id, false)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/0 hover:shadow-rose-500/20" title="Revoke"><XCircle size={18} /></button>
                                            )}
                                            <button 
                                                onClick={() => handleStatusToggle(creator.userId, creator.user.isActive)}
                                                className={`p-2 rounded-xl transition-all ${creator.user.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                title={creator.user.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {creator.user.isActive ? <Lock size={18} /> : <Unlock size={18} />}
                                            </button>
                                            <button onClick={() => handleEdit(creator)} className="p-2 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all" title="Edit Detail"><Pencil size={18} /></button>
                                            <button onClick={() => router.push(`/admin/creators/${creator.id}`)} className="p-2 bg-neutral-800 text-neutral-400 rounded-xl hover:text-white transition-all" title="View Profile"><Eye size={18} /></button>
                                            <button onClick={() => handleDelete(creator.userId)} className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all" title="Delete"><Trash2 size={18} /></button>
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
                        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
                            <h2 className="text-2xl font-black mb-6">Update Creator</h2>
                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Full Name</label>
                                    <input type="text" value={editData.name} onChange={(e) => setEditData({...editData, name: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Email</label>
                                    <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Subscription Price ($)</label>
                                    <input type="number" value={editData.subscriptionPrice} onChange={(e) => setEditData({...editData, subscriptionPrice: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-neutral-500 mb-1 block">Bio</label>
                                    <textarea value={editData.bio} onChange={(e) => setEditData({...editData, bio: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500 h-24 resize-none" />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setEditModal({show: false, creator: null})} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleSaveEdit} className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl hover:bg-rose-500 transition-all shadow-xl shadow-rose-600/20">Save Changes</button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
