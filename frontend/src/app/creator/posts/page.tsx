'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Grid3X3, List, PlusCircle, Trash2, Edit3, Heart,
    MessageCircle, Eye, Lock, Globe, DollarSign,
    MoreVertical, Search, Filter, Camera, CheckCircle,
    Loader2, X, AlertTriangle
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';


const TYPE_STYLES: Record<string, { label: string; icon: any; class: string }> = {
    PUBLIC: { label: 'Public', icon: Globe, class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    SUBSCRIBER: { label: 'Subscribers', icon: Lock, class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    PAID: { label: 'Pay-Per-View', icon: DollarSign, class: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
};

function TypeBadge({ type }: { type: string }) {
    const s = TYPE_STYLES[type] || TYPE_STYLES.PUBLIC;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${s.class}`}>
            <Icon size={10} /> {s.label}
        </span>
    );
}

function DeleteModal({ post, onConfirm, onCancel, loading }: any) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-md w-full">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-5">
                    <AlertTriangle size={28} className="text-rose-400" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Delete Post?</h3>
                <p className="text-neutral-500 text-sm mb-6">This will permanently hide <span className="text-white font-bold">"{post?.content?.slice(0, 40)}..."</span> from your subscribers.</p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border border-white/10 text-neutral-400 font-black hover:bg-neutral-800 transition-all">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 py-3 rounded-2xl bg-rose-500 text-white font-black hover:bg-rose-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function CreatorPostsPage() {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');
    const [deleteTarget, setDeleteTarget] = useState<any>(null);
    const [deleting, setDeleting] = useState(false);
    const [openMenu, setOpenMenu] = useState<number | null>(null);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts/creator');
            setPosts(res.data as any[]);
        } catch {
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPosts(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await api.patch(`/posts/${deleteTarget.id}/delete`);
            setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
        } catch {
            // Demo mode: just remove from local state
            setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const filtered = posts.filter(p => {
        const matchSearch = !search || p.content?.toLowerCase().includes(search.toLowerCase());
        const matchType = filterType === 'ALL' || p.type === filterType;
        return matchSearch && matchType;
    });

    const stats = {
        total: posts.length,
        public: posts.filter(p => p.type === 'PUBLIC').length,
        subscribers: posts.filter(p => p.type === 'SUBSCRIBER').length,
        paid: posts.filter(p => p.type === 'PAID').length,
        totalLikes: posts.reduce((acc, p) => acc + (p._count?.likes || 0), 0),
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-black">
            <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white p-8">
            {deleteTarget && (
                <DeleteModal
                    post={deleteTarget}
                    onConfirm={handleDelete}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deleting}
                />
            )}

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div>
                    <div className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Content Manager</div>
                    <h1 className="text-3xl font-black text-white">My Posts</h1>
                </div>
                <Link href="/creator/create" className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-5 py-3 rounded-2xl font-black hover:opacity-90 transition-all shadow-lg shadow-rose-500/20">
                    <PlusCircle size={18} /> New Post
                </Link>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                {[
                    { label: 'Total Posts', value: stats.total, color: 'text-white' },
                    { label: 'Public', value: stats.public, color: 'text-emerald-400' },
                    { label: 'Subscriber Only', value: stats.subscribers, color: 'text-amber-400' },
                    { label: 'Pay-Per-View', value: stats.paid, color: 'text-violet-400' },
                    { label: 'Total Likes', value: stats.totalLikes.toLocaleString(), color: 'text-rose-400' },
                ].map(s => (
                    <div key={s.label} className="bg-neutral-900 border border-white/5 rounded-2xl p-4 text-center">
                        <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                        <div className="text-xs text-neutral-500 font-bold mt-1">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 mb-6">
                {/* Search */}
                <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-2xl px-4 py-3">
                    <Search size={16} className="text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search posts…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-white text-sm outline-none placeholder:text-neutral-600 w-full"
                    />
                    {search && <button onClick={() => setSearch('')}><X size={14} className="text-neutral-500" /></button>}
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-2xl px-3 py-2">
                    <Filter size={14} className="text-neutral-500" />
                    {['ALL', 'PUBLIC', 'SUBSCRIBER', 'PAID'].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${filterType === t ? 'bg-rose-500 text-white' : 'text-neutral-500 hover:text-white'}`}>
                            {t === 'ALL' ? 'All' : TYPE_STYLES[t]?.label}
                        </button>
                    ))}
                </div>

                {/* View Toggle */}
                <div className="flex bg-neutral-900 border border-white/10 rounded-2xl p-1">
                    <button onClick={() => setView('grid')} className={`p-2 rounded-xl transition-all ${view === 'grid' ? 'bg-rose-500 text-white' : 'text-neutral-500 hover:text-white'}`}>
                        <Grid3X3 size={16} />
                    </button>
                    <button onClick={() => setView('list')} className={`p-2 rounded-xl transition-all ${view === 'list' ? 'bg-rose-500 text-white' : 'text-neutral-500 hover:text-white'}`}>
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && (
                <div className="text-center py-24">
                    <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center mx-auto mb-5">
                        <Camera size={36} className="text-neutral-700" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-400 mb-2">No posts found</h3>
                    <p className="text-neutral-600 mb-6 text-sm"> {search ? `No posts match "${search}"` : 'Start creating content for your fans!'} </p>
                    <Link href="/creator/create" className="inline-flex items-center gap-2 bg-rose-500 text-white px-6 py-3 rounded-2xl font-black hover:bg-rose-400 transition-all">
                        <PlusCircle size={18} /> Create First Post
                    </Link>
                </div>
            )}

            {/* Grid View */}
            {view === 'grid' && filtered.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(post => (
                        <div key={post.id} className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/15 transition-all group">
                            {/* Image */}
                            <div className="relative aspect-video bg-neutral-800 overflow-hidden">
                                {post.media?.[0] ? (
                                    post.media[0].type === 'video' ? (
                                        <video
                                            src={getMediaUrl(post.media[0].url)}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            muted
                                        />
                                    ) : (
                                        <img
                                            src={getMediaUrl(post.media[0].url)}
                                            alt={post.content}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    )
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Camera size={32} className="text-neutral-600" />
                                    </div>
                                )}
                                {/* Overlays */}
                                <div className="absolute top-3 left-3"><TypeBadge type={post.type} /></div>
                                {!post.published && (
                                    <div className="absolute top-3 right-3 bg-neutral-800/90 text-neutral-400 text-xs font-black px-2 py-1 rounded-lg">DRAFT</div>
                                )}
                                {/* Actions overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all flex items-end gap-3 p-4">
                                    <Link 
                                        href={`/creator/posts/${post.id}/edit`}
                                        className="flex-1 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-white text-xs font-black hover:bg-white/20 transition-all flex items-center justify-center gap-1"
                                    >
                                        <Edit3 size={12} /> Edit
                                    </Link>
                                    <button
                                        onClick={() => setDeleteTarget(post)}
                                        className="py-2 px-3 bg-rose-500/80 backdrop-blur-sm rounded-xl text-white text-xs font-black hover:bg-rose-500 transition-all"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                            {/* Content */}
                            <div className="p-5">
                                <p className="text-white text-sm font-medium line-clamp-2 mb-3">{post.content || 'No caption'}</p>
                                {post.type === 'PAID' && post.price && (
                                    <div className="text-violet-400 font-black text-sm mb-3">${post.price}</div>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span className="flex items-center gap-1"><Heart size={12} className="text-rose-400" /> {post._count?.likes || 0}</span>
                                        <span className="flex items-center gap-1"><MessageCircle size={12} className="text-blue-400" /> {post._count?.comments || 0}</span>
                                    </div>
                                    <div className="text-xs text-neutral-600">{new Date(post.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View */}
            {view === 'list' && filtered.length > 0 && (
                <div className="space-y-3">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-5 py-2 text-xs font-black text-neutral-500 uppercase tracking-wider">
                        <div className="col-span-5">Post</div>
                        <div className="col-span-2 text-center">Type</div>
                        <div className="col-span-1 text-center">Likes</div>
                        <div className="col-span-1 text-center">Comments</div>
                        <div className="col-span-2 text-center">Date</div>
                        <div className="col-span-1 text-center">Actions</div>
                    </div>
                    {filtered.map(post => (
                        <div key={post.id} className="grid grid-cols-12 gap-4 items-center bg-neutral-900 border border-white/5 hover:border-white/15 rounded-2xl px-5 py-4 transition-all">
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-neutral-800 overflow-hidden shrink-0">
                                    {post.media?.[0] ? (
                                        post.media[0].type === 'video' ? (
                                            <video src={getMediaUrl(post.media[0].url)} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={getMediaUrl(post.media[0].url)} className="w-full h-full object-cover" alt="" />
                                        )
                                    ) : (
                                        <Camera size={16} className="text-neutral-600 m-auto h-full" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm text-white font-bold truncate">{post.content || 'No caption'}</p>
                                    {!post.published && <span className="text-xs text-neutral-600 font-bold">DRAFT</span>}
                                </div>
                            </div>
                            <div className="col-span-2 flex justify-center"><TypeBadge type={post.type} /></div>
                            <div className="col-span-1 text-center text-sm text-rose-400 font-bold">{post._count?.likes || 0}</div>
                            <div className="col-span-1 text-center text-sm text-blue-400 font-bold">{post._count?.comments || 0}</div>
                            <div className="col-span-2 text-center text-xs text-neutral-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                            <div className="col-span-1 flex justify-center gap-2">
                                <button 
                                    onClick={() => router.push(`/creator/posts/${post.id}/edit`)}
                                    className="p-2 hover:bg-white/5 rounded-xl transition-all text-neutral-500 hover:text-white"
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button onClick={() => setDeleteTarget(post)} className="p-2 hover:bg-rose-500/10 rounded-xl transition-all text-neutral-500 hover:text-rose-400"><Trash2 size={14} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}