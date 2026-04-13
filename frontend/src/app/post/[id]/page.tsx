'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import PostCard from '@/components/PostCard';
import { Loader2, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';

export default function SinglePostPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id;
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/posts/${id}`);
            setPost(data);
        } catch (err: any) {
            console.error('Error fetching post:', err);
            setError(err.response?.data?.message || 'Failed to load post');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchPost();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="animate-spin text-rose-500" size={48} />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-4 text-white">
                <div className="text-center">
                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">404</h1>
                    <p className="text-xl font-bold text-neutral-400">{error || 'Post Not Found'}</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-2 px-6 py-3 bg-neutral-900 border border-white/10 rounded-2xl font-bold hover:bg-neutral-800 transition-all text-sm"
                    >
                        <ArrowLeft size={16} /> Go Back
                    </button>
                    <Link 
                        href="/" 
                        className="flex items-center gap-2 px-6 py-3 bg-rose-600 rounded-2xl font-black hover:bg-rose-500 transition-all text-sm shadow-lg shadow-rose-600/20"
                    >
                        <Home size={16} /> Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-10">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-2 text-sm font-bold text-neutral-500 hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} /> Back
                    </button>
                    <div className="text-lg font-black bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">
                        CREATOR HUB
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <PostCard post={post} />
                </div>
            </div>
        </div>
    );
}
