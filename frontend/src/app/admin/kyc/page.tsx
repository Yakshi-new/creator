'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    CheckCircle, XCircle, Clock, 
    User, Eye, ShieldCheck,
    FileText, AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

export default function AdminKyc() {
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

    const fetchSubmissions = async () => {
        try {
            const { data } = await api.get('/kyc/pending') as { data: any[] };
            setSubmissions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        let reason = '';
        if (status === 'REJECTED') {
            reason = prompt('Enter rejection reason:') || '';
            if (!reason) return;
        }

        try {
            await api.post(`/kyc/process/${id}`, { status, reason });
            alert(`KYC ${status.toLowerCase()} successfully`);
            fetchSubmissions();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Action failed');
        }
    };

    return (
        <div className="flex h-screen bg-black">
            <Sidebar role="ADMIN" />
            
            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-black text-white mb-2 text-rose-500 uppercase italic">KYC Verification Inbox</h1>
                    <p className="text-neutral-500 font-medium">Verify creator identities to maintain platform safety.</p>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Creator</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">ID / PAN</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Bank Details</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Document</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-xs font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="p-20 text-center text-neutral-500 font-bold">Loading submissions...</td></tr>
                            ) : submissions.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-neutral-500 font-bold">All caught up! No pending KYC checks.</td></tr>
                            ) : submissions.map((sub) => (
                                <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center font-black text-xs text-rose-500">
                                                {sub.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-white text-sm">{sub.user.name}</p>
                                                <p className="text-xs text-neutral-500 font-bold">{sub.user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white font-mono flex items-center gap-2">
                                                <span className="text-[10px] text-neutral-500 uppercase w-6">ID:</span> {sub.idNumber}
                                            </p>
                                            <p className="text-sm font-black text-amber-500 font-mono flex items-center gap-2">
                                                <span className="text-[10px] text-neutral-500 uppercase w-6">PAN:</span> {sub.panCardNumber}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-white font-mono">{sub.bankAccountNumber}</p>
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{sub.bankIfscCode}</p>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <button 
                                            onClick={() => setSelectedDoc(getMediaUrl(sub.kycDocument))}
                                            className="p-2 bg-neutral-800 text-white rounded-xl hover:bg-neutral-700 transition-all flex items-center gap-2 text-xs font-black"
                                        >
                                            <Eye size={14} /> View Doc
                                        </button>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                            PENDING
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleAction(sub.id, 'APPROVED')}
                                                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all group"
                                                title="Approve KYC"
                                            >
                                                <CheckCircle size={20} />
                                            </button>
                                            <button 
                                                onClick={() => handleAction(sub.id, 'REJECTED')}
                                                className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all group"
                                                title="Reject KYC"
                                            >
                                                <XCircle size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Document Preview Modal */}
            {selectedDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/90 backdrop-blur-sm">
                    <div className="relative w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-[3rem] overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white">Document Preview</h3>
                            <button 
                                onClick={() => setSelectedDoc(null)}
                                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>
                        <div className="p-10 flex items-center justify-center bg-black">
                            <img src={selectedDoc} className="max-h-[70vh] rounded-2xl shadow-2xl" alt="KYC Document" />
                        </div>
                        <div className="p-6 border-t border-white/5 bg-neutral-900/50 flex justify-center gap-4">
                            <button className="px-8 py-3 bg-white text-black font-black rounded-2xl hover:bg-neutral-200 transition-all">Download</button>
                            <button onClick={() => setSelectedDoc(null)} className="px-8 py-3 bg-neutral-800 text-white font-black rounded-2xl hover:bg-neutral-700 transition-all">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
