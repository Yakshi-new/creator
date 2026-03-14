'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Image as ImageIcon, Lock, Globe, DollarSign,
    X, Plus, Loader2, CheckCircle, AlertCircle,
    Video, FileText, Upload
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

type PostType = 'PUBLIC' | 'SUBSCRIBER' | 'PAID';

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const postId = params.id;

    const [content, setContent] = useState('');
    const [postType, setPostType] = useState<PostType>('PUBLIC');
    const [price, setPrice] = useState('');
    const [existingMedia, setExistingMedia] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/posts/${postId}`);
                const post = res.data as any;
                setContent(post.content || '');
                setPostType(post.type);
                setPrice(post.price ? post.price.toString() : '');
                setExistingMedia(post.media || []);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to fetch post');
            } finally {
                setLoading(false);
            }
        };
        if (postId) fetchPost();
    }, [postId]);

    const typeOptions: { value: PostType; label: string; desc: string; icon: any; color: string }[] = [
        { value: 'PUBLIC', label: 'Public', desc: 'Visible to everyone', icon: Globe, color: 'emerald' },
        { value: 'SUBSCRIBER', label: 'Subscribers Only', desc: 'Only your paid subscribers', icon: Lock, color: 'amber' },
        { value: 'PAID', label: 'Pay-Per-View', desc: 'Set your own price', icon: DollarSign, color: 'violet' },
    ];

    const handleSubmit = async () => {
        if (!content.trim()) { setError('Please add some content.'); return; }
        if (postType === 'PAID' && (!price || Number(price) <= 0)) { setError('Please set a valid price for pay-per-view posts.'); return; }

        setSaving(true);
        setError('');

        try {
            await api.put(`/posts/${postId}`, {
                content: content.trim(),
                type: postType,
                price: postType === 'PAID' ? Number(price) : null
            });
            
            setSuccess(true);
            setTimeout(() => router.push('/creator/posts'), 1800);
        } catch (err: any) {
            console.error('Update error:', err);
            setError(err.response?.data?.message || 'Failed to update post');
        } finally {
            setSaving(false);
        }
    };

    const colorMap: Record<string, string> = {
        emerald: 'border-emerald-400/50 bg-emerald-400/5 text-emerald-400',
        amber: 'border-amber-400/50 bg-amber-400/5 text-amber-400',
        violet: 'border-violet-400/50 bg-violet-400/5 text-violet-400',
    };

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <Loader2 className="animate-spin text-rose-500" size={48} />
        </div>
    );

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Post Updated! 🎉</h2>
                    <p className="text-neutral-500">Redirecting to your posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-3xl mx-auto p-8">
                {/* Header */}
                <div className="mb-10">
                    <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Content Studio</div>
                    <h1 className="text-3xl font-black text-white">Edit Post</h1>
                    <p className="text-neutral-500 mt-1">Update your content and visibility settings</p>
                </div>

                {/* Post Type Selector */}
                <div className="mb-8">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-4 block">Post Type</label>
                    <div className="grid grid-cols-3 gap-3">
                        {typeOptions.map((opt) => {
                            const Icon = opt.icon;
                            const isSelected = postType === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => setPostType(opt.value)}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${isSelected ? colorMap[opt.color] + ' border-2' : 'border-white/5 bg-neutral-900 text-neutral-500 hover:border-white/15'}`}
                                >
                                    <Icon size={20} className="mb-2" />
                                    <div className="font-black text-sm">{opt.label}</div>
                                    <div className={`text-xs mt-0.5 ${isSelected ? 'opacity-80' : 'text-neutral-600'}`}>{opt.desc}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price Input for PAID */}
                {postType === 'PAID' && (
                    <div className="mb-8">
                        <label className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-3 block">Price (USD)</label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-2xl px-5 py-4 focus-within:border-violet-400/50 transition-all">
                            <DollarSign size={20} className="text-violet-400" />
                            <input
                                type="number"
                                min="0.99"
                                step="0.01"
                                placeholder="4.99"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                className="flex-1 bg-transparent text-white font-bold text-lg outline-none placeholder:text-neutral-700"
                            />
                        </div>
                    </div>
                )}

                {/* Content Text */}
                <div className="mb-8">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-3 block">Caption / Content</label>
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl focus-within:border-rose-400/40 transition-all">
                        <textarea
                            rows={5}
                            placeholder="Write something amazing for your fans… 🔥"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-transparent text-white p-5 outline-none resize-none placeholder:text-neutral-700 font-medium"
                        />
                        <div className="flex justify-between items-center px-5 pb-4">
                            <div className="flex gap-3">
                            </div>
                            <div className="text-xs text-neutral-600 font-bold">{content.length} chars</div>
                        </div>
                    </div>
                </div>

                {/* Media (Static display) */}
                <div className="mb-8">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-3 block">Existing Media</label>
                    <div className="grid grid-cols-3 gap-3">
                        {existingMedia.map((m) => (
                            <div key={m.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
                                {m.type === 'image' ? (
                                    <img src={getMediaUrl(m.url)} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                                        <Video size={28} className="text-violet-400" />
                                        <span className="text-[10px] text-neutral-500 font-bold uppercase">Video Content</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] text-neutral-600 mt-2 italic">* Media editing is currently restricted to new posts. Delete and recreate to change media.</p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
                        <AlertCircle size={18} className="text-rose-400 shrink-0" />
                        <p className="text-rose-400 text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Save & Cancel */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/creator/posts')}
                        className="flex-1 py-4 rounded-2xl border border-white/10 text-neutral-400 font-black hover:bg-neutral-900 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black hover:opacity-90 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : '💾 Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
