'use client';

import { useEffect, useState, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
    Search, 
    Filter, 
    Eye, 
    Trash2, 
    MoreVertical,
    User,
    Calendar,
    FileText,
    CheckCircle2,
    XCircle,
    Download
} from 'lucide-react';
import api from '@/lib/api';
import { useSearchParams, useRouter } from 'next/navigation';

interface Post {
    id: number;
    content: string;
    type: string;
    published: boolean;
    createdAt: string;
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

function ContentManager() {
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

    const handleToggleStatus = async (postId: number, currentStatus: boolean) => {
        try {
            await api.post('/admin/post-status', { postId, published: !currentStatus });
            fetchPosts();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const handleFilterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userFilter) {
            router.push(`/admin/content?userId=${userFilter}`);
        } else {
            router.push('/admin/content');
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
                        <h1 className="text-3xl font-black mb-2">Platform Content</h1>
                        <p className="text-neutral-500 font-medium">Manage and monitor all content published on the platform.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-4">
                        <form onSubmit={handleFilterSubmit} className="flex gap-2">
                             <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input 
                                    type="text"
                                    placeholder="By User ID..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-rose-500 w-40 transition-all"
                                />
                            </div>
                            <button type="submit" className="px-5 py-3 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all">Apply</button>
                        </form>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input 
                                type="text"
                                placeholder="Search content..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-neutral-500 w-64 transition-all"
                            />
                        </div>
                        
                        <button className="p-3 bg-neutral-900 border border-white/5 rounded-2xl text-white hover:bg-neutral-800 transition-all">
                            <Download size={18} />
                        </button>
                    </div>
                </header>

                <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 text-neutral-500 text-[10px] font-black uppercase tracking-widest bg-white/[0.01]">
                                <th className="px-8 py-5">Post Content</th>
                                <th className="px-8 py-5">Creator</th>
                                <th className="px-8 py-5">Type</th>
                                <th className="px-8 py-5">Engagement</th>
                                <th className="px-8 py-5">Date</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-white text-sm">
                            {filteredPosts.map((post) => (
                                <tr key={post.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5 max-w-xs">
                                        <div className="truncate font-medium text-neutral-200">{post.content || 'Media only post'}</div>
                                        <div className="text-[10px] text-neutral-600 font-bold mt-1">ID: #{post.id}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="font-bold text-rose-500">{post.creator.user.name}</div>
                                        <div className="text-[10px] text-neutral-500 font-bold">UID: {post.creator.userId}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-black uppercase tracking-widest text-neutral-400 border border-white/5">
                                            {post.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-xs font-bold text-neutral-400">
                                            {post._count.likes} Likes • {post._count.comments} Comms
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-neutral-500 font-bold text-xs">
                                        {new Date(post.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => handleToggleStatus(post.id, post.published)}
                                                className={`p-2 rounded-xl transition-all ${post.published ? 'text-amber-500 hover:bg-amber-500/10' : 'text-emerald-500 hover:bg-emerald-500/10'}`}
                                                title={post.published ? "Revoke" : "Publish"}
                                            >
                                                {post.published ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                                            </button>
                                            <button className="p-2 text-neutral-400 hover:text-white" onClick={() => window.open(`/post/${post.id}`, '_blank')}>
                                                <Eye size={18} />
                                            </button>
                                            <button className="p-2 text-neutral-400 hover:text-rose-500">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredPosts.length === 0 && (
                    <div className="h-64 flex flex-col items-center justify-center bg-neutral-900 border border-white/5 rounded-3xl mt-6">
                        <FileText size={48} className="text-neutral-700 mb-4" />
                        <p className="text-neutral-500 font-bold tracking-tight">No platform content matching your filters.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={<div className="flex h-screen bg-black text-white items-center justify-center">Loading Content Management...</div>}>
            <ContentManager />
        </Suspense>
    );
}
