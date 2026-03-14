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
        <div className="flex h-screen bg-black">


            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-10 px-6">
                    {/* Top Bar */}
                    <div className="flex items-center gap-4 mb-10 bg-neutral-900/50 border border-white/5 rounded-3xl p-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search creators..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    handleSearch(e.target.value);
                                }}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-3 focus:border-rose-500 focus:outline-none transition-all"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="p-3 bg-rose-600 rounded-2xl text-white shadow-lg shadow-rose-600/20">
                                <Flame size={20} />
                            </button>
                            <button className="p-3 bg-neutral-800 rounded-2xl text-neutral-400 hover:text-white transition-all">
                                <Star size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Categories */}
                    <div className="flex gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
                        {['All', 'Trending', 'Photos', 'Videos', 'Music', 'Fitness', 'Models'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-neutral-900 text-neutral-400 border border-white/5 hover:border-white/20'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Feed */}
                    <div className="space-y-6">
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
            </main>

            {/* Right Sidebar - Suggestions */}
            <div className="w-80 h-full border-l border-white/5 p-8 hidden xl:block">
                <h3 className="text-xl font-black text-white mb-6">Suggestions</h3>
                <div className="space-y-6">
                    {suggestions.map((creator) => (
                        <div key={creator.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 overflow-hidden">
                                    {creator.avatar && <img src={creator.avatar} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div>
                                    <div className="text-sm font-black text-white truncate max-w-[100px]">{creator.user.name}</div>
                                    <div className="text-xs text-neutral-500 font-bold">@creator_{creator.id}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSubscribe(creator.id)}
                                className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all ${subscribed.includes(creator.id)
                                    ? 'bg-neutral-800 text-neutral-400'
                                    : 'bg-rose-500 text-white hover:bg-rose-400'
                                    }`}
                            >
                                {subscribed.includes(creator.id) ? 'Subscribed' : 'Subscribe'}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-gradient-to-br from-neutral-900 to-black border border-white/5 rounded-3xl">
                    <h4 className="font-black text-white mb-2">Support Creators</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">Subscribe to unlock exclusive content and support your favorite artists directly.</p>
                    <button className="w-full bg-white text-black py-3 rounded-xl font-black text-xs hover:bg-rose-500 hover:text-white transition-all">
                        ADD FUNDS
                    </button>
                </div>
            </div>
        </div>
    );
}
