'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

import PostCard from '@/components/PostCard';
import { Search, Flame, Star, Loader2 } from 'lucide-react';
import api from '@/lib/api';
// @ts-ignore
import debounce from 'lodash/debounce';

export default function FanFeed() {
    const [posts, setPosts] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [subscribed, setSubscribed] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const observer = useRef<IntersectionObserver>(null);

    const lastPostRef = useCallback((node: any) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        // @ts-ignore
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const fetchPosts = async (currentPage: number, category: string, reset: boolean = false) => {
        try {
            setLoading(true);
            const endpoint = category === 'All' ? '/posts/feed' : `/posts/category/${category.toLowerCase()}`;
            const { data } = await api.get(`${endpoint}?page=${currentPage}`) as { data: any[] };

            if (reset) {
                setPosts(data);
            } else {
                setPosts(prev => [...prev, ...data]);
            }
            setHasMore(data.length > 0);
        } catch (err) {
            console.error('Fetch posts error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchContent = async () => {
        try {
            const [suggRes, subRes] = await Promise.all([
                api.get('/creators/suggestions'),
                api.get('/creators/subscriptions')
            ]);
            const suggData = suggRes.data as any;
            const subData = subRes.data as any;
            setSuggestions(suggData);
            setSubscribed(subData.map((c: any) => c.id));
        } catch (err) {
            console.error('Fetch suggestions/subs error:', err);
        }
    };

    const handleSearch = useCallback(debounce(async (query: string) => {
        if (!query) {
            fetchPosts(1, activeCategory, true);
            return;
        }
        try {
            setLoading(true);
            const { data } = await api.get(`/creators?search=${query}`) as { data: any[] };
            const creatorPosts = data.map((creator: any) => ({
                id: `creator-${creator.id}`,
                content: creator.bio || "Creator profile found in search.",
                type: 'PUBLIC',
                isLocked: false,
                isLiked: false,
                _count: { likes: 0, comments: 0 },
                creator: creator,
                media: creator.coverImage ? [{ url: creator.coverImage, type: 'image' }] : []
            }));
            setPosts(creatorPosts);
            setHasMore(false);
        } catch (err) {
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, 500), [activeCategory]);

    const handleSubscribe = async (creatorId: number) => {
        try {
            await api.post(`/creators/${creatorId}/subscribe`);
            setSubscribed((prev) =>
                prev.includes(creatorId)
                    ? prev.filter((id) => id !== creatorId)
                    : [...prev, creatorId]
            );
        } catch (err) {
            console.error('Subscribe error:', err);
        }
    };

    useEffect(() => {
        if (page > 1) {
            fetchPosts(page, activeCategory);
        }
    }, [page]);

    useEffect(() => {
        setPage(1);
        fetchPosts(1, activeCategory, true);
    }, [activeCategory]);

    useEffect(() => {
        fetchContent();
    }, []);

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-2xl mx-auto py-6 px-4">
                    {/* Top Bar */}
                    <div className="flex items-center gap-3 mb-6 bg-neutral-900/50 border border-white/5 rounded-2xl p-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search creators..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearch(e.target.value);
                                }}
                                className="w-full bg-black/40 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 focus:border-rose-500 focus:outline-none transition-all text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2.5 bg-rose-600 rounded-xl text-white shadow-lg shadow-rose-600/20">
                                <Flame size={18} />
                            </button>
                            <button className="p-2.5 bg-neutral-800 rounded-xl text-neutral-400 hover:text-white transition-all">
                                <Star size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
                        {['All', 'Trending', 'Photos', 'Videos', 'Music', 'Fitness', 'Models'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/20'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Feed */}
                    <div className="space-y-5">
                        {posts.map((post, index) => {
                            if (posts.length === index + 1) {
                                return (
                                    <div ref={lastPostRef} key={post.id}>
                                        <PostCard post={post} />
                                    </div>
                                );
                            } else {
                                return <PostCard key={post.id} post={post} />;
                            }
                        })}

                        {loading && (
                            <div className="flex justify-center p-8">
                                <Loader2 className="animate-spin text-rose-500" size={32} />
                            </div>
                        )}

                        {!loading && posts.length === 0 && (
                            <div className="text-center py-20 bg-neutral-900/50 rounded-3xl border border-white/5">
                                <p className="text-neutral-500 font-bold">No posts found.</p>
                            </div>
                        )}
                    </div>
                </div>
        </div>
    );
}
