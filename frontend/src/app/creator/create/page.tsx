'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Image as ImageIcon, Lock, Globe, DollarSign,
    X, Plus, Loader2, CheckCircle, AlertCircle,
    Video, FileText, Upload
} from 'lucide-react';
import api from '@/lib/api';

type PostType = 'PUBLIC' | 'SUBSCRIBER' | 'PAID';

interface MediaPreview {
    id: string;
    url: string;
    type: 'image' | 'video';
    name: string;
}

export default function CreatePostPage() {
    const router = useRouter();
    const [content, setContent] = useState('');
    const [postType, setPostType] = useState<PostType>('PUBLIC');
    const [price, setPrice] = useState('');
    const [mediaPreviews, setMediaPreviews] = useState<MediaPreview[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [urlInput, setUrlInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const typeOptions: { value: PostType; label: string; desc: string; icon: any; color: string }[] = [
        { value: 'PUBLIC', label: 'Public', desc: 'Visible to everyone', icon: Globe, color: 'emerald' },
        { value: 'SUBSCRIBER', label: 'Subscribers Only', desc: 'Only your paid subscribers', icon: Lock, color: 'amber' },
        { value: 'PAID', label: 'Pay-Per-View', desc: 'Set your own price', icon: DollarSign, color: 'violet' },
    ];

    const addMediaUrl = () => {
        const trimmed = urlInput.trim();
        if (!trimmed) return;
        const isVideo = trimmed.includes('.mp4') || trimmed.includes('.mov') || trimmed.includes('video');
        const preview: MediaPreview = {
            id: Date.now().toString(),
            url: trimmed,
            type: isVideo ? 'video' : 'image',
            name: trimmed.split('/').pop() || 'media',
        };
        setMediaPreviews(prev => [...prev, preview]);
        setUrlInput('');
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
        
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                const isVideo = file.type.startsWith('video');
                const preview: MediaPreview = {
                    id: Math.random().toString(36).substr(2, 9),
                    url,
                    type: isVideo ? 'video' : 'image',
                    name: file.name,
                };
                setMediaPreviews(prev => [...prev, preview]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeMedia = (id: string, index: number) => {
        setMediaPreviews(prev => prev.filter(m => m.id !== id));
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!content.trim()) { setError('Please add some content.'); return; }
        if (postType === 'PAID' && (!price || Number(price) <= 0)) { setError('Please set a valid price for pay-per-view posts.'); return; }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('content', content.trim());
            formData.append('type', postType);
            if (postType === 'PAID') {
                formData.append('price', price);
            }
            
            selectedFiles.forEach(file => {
                formData.append('media', file);
            });

            await api.post('/posts', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            setSuccess(true);
            setTimeout(() => router.push('/creator/posts'), 1800);
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.response?.data?.message || 'Failed to publish post');
        } finally {
            setLoading(false);
        }
    };

    const colorMap: Record<string, string> = {
        emerald: 'border-emerald-400/50 bg-emerald-400/5 text-emerald-400',
        amber: 'border-amber-400/50 bg-amber-400/5 text-amber-400',
        violet: 'border-violet-400/50 bg-violet-400/5 text-violet-400',
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle size={48} className="text-emerald-400" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">Post Published! 🎉</h2>
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
                    <h1 className="text-3xl font-black text-white">Create New Post</h1>
                    <p className="text-neutral-500 mt-1">Share exclusive content with your subscribers</p>
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
                                <button className="text-neutral-500 hover:text-white transition-all text-xs font-bold">😍 Emoji</button>
                                <button className="text-neutral-500 hover:text-white transition-all text-xs font-bold">📍 Location</button>
                            </div>
                            <div className="text-xs text-neutral-600 font-bold">{content.length} chars</div>
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className="mb-8">
                    <label className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-3 block">Media (Image / Video Upload)</label>

                    {/* Previews */}
                    {mediaPreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {mediaPreviews.map((m, index) => (
                                <div key={m.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-white/10">
                                    {m.type === 'image' ? (
                                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center gap-2">
                                            <Video size={28} className="text-violet-400" />
                                            <span className="text-xs text-neutral-500 text-center px-2 truncate">{m.name}</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                        <button onClick={() => removeMedia(m.id, index)} className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-400 transition-all">
                                            <X size={14} />
                                        </button>
                                    </div>
                                    <div className="absolute top-2 left-2">
                                        {m.type === 'video'
                                            ? <span className="text-[10px] bg-violet-500 text-white px-2 py-0.5 rounded-lg font-bold">VIDEO</span>
                                            : <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-lg font-bold">IMG</span>
                                        }
                                    </div>
                                </div>
                            ))}
                            {/* Add more placeholder */}
                            <button
                                onClick={() => document.getElementById('fileInput')?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-neutral-600 hover:border-white/20 hover:text-neutral-400 transition-all"
                            >
                                <Plus size={24} />
                                <span className="text-xs font-bold">Add more</span>
                            </button>
                        </div>
                    )}

                        <button 
                            onClick={() => document.getElementById('fileInput')?.click()}
                            className="w-full border-2 border-dashed border-white/10 rounded-2xl p-12 text-center hover:bg-white/5 transition-all group"
                        >
                            <input type="file" id="fileInput" className="hidden" multiple accept="image/*,video/*" onChange={handleFileUpload} />
                            <ImageIcon size={40} className="text-neutral-700 mx-auto mb-3 group-hover:text-rose-400 transition-all" />
                            <p className="text-neutral-600 font-medium group-hover:text-white transition-all">Select photos/videos from your device</p>
                            <p className="text-neutral-700 text-sm mt-1">Upload files to store them securely</p>
                        </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4">
                        <AlertCircle size={18} className="text-rose-400 shrink-0" />
                        <p className="text-rose-400 text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* Preview & Publish */}
                <div className="flex gap-4">
                    <button
                        onClick={() => router.push('/creator/posts')}
                        className="flex-1 py-4 rounded-2xl border border-white/10 text-neutral-400 font-black hover:bg-neutral-900 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black hover:opacity-90 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <><Loader2 size={18} className="animate-spin" /> Publishing…</> : '🚀 Publish Post'}
                    </button>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                    <p className="text-xs text-neutral-500 text-center">
                        {postType === 'PUBLIC' && '🌍 This post will be visible to everyone, including non-subscribers.'}
                        {postType === 'SUBSCRIBER' && '🔒 Only your active subscribers can unlock this content.'}
                        {postType === 'PAID' && `💰 Fans pay once to unlock this content. You earn 80% of each purchase.`}
                    </p>
                </div>
            </div>
        </div>
    );
}