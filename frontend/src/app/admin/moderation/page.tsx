'use client';

import { useEffect, useState, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    Eye, 
    Trash2, 
    ShieldCheck, 
    ShieldX, 
    MoreVertical,
    User,
    Calendar,
    MessageSquare,
    Heart,
    Lock,
    Unlock,
    Image as ImageIcon,
    Video,
    FileText
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';
import { useSearchParams, useRouter } from 'next/navigation';

interface Post {
    id: number;
    content: string;
    type: string;
    published: boolean;
    createdAt: string;
    media: { url: string; type: string }[];
    creator: {
        userId: number;
        user: {
            name: string;
            email: string;
        }
    };
    _count: {
        likes: number;
        comments: number;
    }
}

function ModerationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const userIdFilter = searchParams.get('userId');
    
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userFilter, setUserFilter] = useState(userIdFilter || '');

    useEffect(() => {
        fetchPosts();
    }, [userIdFilter]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/posts', {
                params: { userId: userIdFilter }
            });
            setPosts(res.data as Post[]);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (postId: number, currentStatus: boolean) => {
        try {
            await api.post('/admin/post-status', { postId, published: !currentStatus });
            fetchPosts();
        } catch (err) {
            alert("Failed to update post status");
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        try {
            await api.delete(`/admin/post/${postId}`);
            fetchPosts();
        } catch (err) {
            alert("Failed to delete post");
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userFilter) {
            router.push(`/admin/moderation?userId=${userFilter}`);
        } else {
            router.push('/admin/moderation');
        }
    };

    const filteredPosts = posts.filter(p => {
        const contentMatch = p.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const creatorMatch = p.creator.user.name?.toLowerCase().includes(searchTerm.toLowerCase());
        return !searchTerm || contentMatch || creatorMatch;
    });

    return (
        <div className="flex h-screen bg-black text-white">
            <Sidebar role="ADMIN" />

            <main className="flex-1 overflow-y-auto p-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Content Moderation</h1>
                        <p className="text-neutral-500 font-medium">Review, publish, or revoke platform content across all creators.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <form onSubmit={handleFilterSubmit} className="flex gap-2">
                             <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Filter by User ID..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-rose-500 w-48 transition-all"
                                />
                            </div>
                            <button type="submit" className="px-6 py-3 bg-rose-600 rounded-2xl font-bold hover:bg-rose-500 transition-all">Filter</button>
                        </form>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Search content or creator..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-neutral-500 w-64 transition-all"
                            />
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-rose-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all group">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-white/5 font-bold text-rose-500">
                                                {post.creator.user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm tracking-tight">{post.creator.user.name}</div>
                                                <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${post.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                                {post.published ? 'Published' : 'Revoked'}
                                            </span>
                                            <span className="px-3 py-1 bg-white/5 text-neutral-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {post.type}
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-neutral-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                                        {post.content || <span className="italic text-neutral-600">No text content</span>}
                                    </p>

                                    {post.media && post.media.length > 0 && (
                                        <div className="grid grid-cols-4 gap-2 mb-6">
                                            {post.media.slice(0, 4).map((m, idx) => (
                                                <div key={idx} className="aspect-square rounded-2xl bg-black border border-white/5 overflow-hidden relative">
                                                    {m.type.startsWith('image') ? (
                                                        <img src={getMediaUrl(m.url)} alt="" className="w-full h-full object-contain" />
                                                    ) : m.type.startsWith('video') ? (
                                                        <video 
                                                            src={getMediaUrl(m.url)} 
                                                            className="w-full h-full object-contain" 
                                                            muted 
                                                            playsInline 
                                                            onMouseEnter={(e) => e.currentTarget.play()}
                                                            onMouseLeave={(e) => e.currentTarget.pause()}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-neutral-800">
                                                            <Video size={18} className="text-neutral-600" />
                                                        </div>
                                                    )}
                                                    {idx === 3 && post.media.length > 4 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-sm">
                                                            +{post.media.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-bold">
                                                <Heart size={14} className="text-rose-500" />
                                                {post._count.likes}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-neutral-500 text-xs font-bold">
                                                <MessageSquare size={14} className="text-blue-500" />
                                                {post._count.comments}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleTogglePublish(post.id, post.published)}
                                                className={`p-2 rounded-xl transition-all ${post.published ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                                                title={post.published ? "Revoke Post" : "Publish Post"}
                                            >
                                                {post.published ? <ShieldX size={18} /> : <ShieldCheck size={18} />}
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-2 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
                                                title="Delete Post"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => window.open(`/post/${post.id}`, '_blank')}
                                                className="p-2 bg-neutral-800 text-neutral-400 rounded-xl hover:text-white transition-all"
                                                title="View Original"
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredPosts.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center bg-neutral-900 border border-white/5 rounded-3xl">
                        <FileText size={48} className="text-neutral-700 mb-4" />
                        <p className="text-neutral-500 font-bold">No content found matching your criteria.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ModerationPage() {
    return (
        <Suspense fallback={<div className="flex h-screen bg-black text-white items-center justify-center">Loading Moderation...</div>}>
            <ModerationContent />
        </Suspense>
    );
}
