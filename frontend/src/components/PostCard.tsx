'use client';

import { useState } from 'react';
import {
    Heart,
    MessageCircle,
    MoreHorizontal,
    Lock,
    DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

interface PostCardProps {
    post: {
        id: number;
        content: string;
        type: 'PUBLIC' | 'SUBSCRIBER' | 'PAID';
        isLocked: boolean;
        isLiked: boolean;
        _count: {
            likes: number;
            comments: number;
        };
        creator: {
            id: number;
            user: {
                name: string;
            };
            avatar?: string;
        };
        media: { url: string; type: string }[];
    };
    onSubscribe?: (creatorId: number) => void;
}

export default function PostCard({ post, onSubscribe }: PostCardProps) {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post._count.likes);
    const [loading, setLoading] = useState(false);
    
    // Tipping state
    const [showTipModal, setShowTipModal] = useState(false);
    const [tipAmount, setTipAmount] = useState('');
    const [tipMessage, setTipMessage] = useState('');

    // Comment state
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);


    const handleLike = async () => {
        try {
            const res = await api.post(`/posts/${post.id}/like`);
            const data = res.data as any;
            setIsLiked(data.isLiked);
            setLikeCount(data.likeCount);
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            if (post.type === 'SUBSCRIBER') {
                if (!confirm(`Subscribe to ${post.creator.user.name} using your wallet balance?`)) {
                    setLoading(false);
                    return;
                }
                await api.post(`/creators/${post.creator.id}/subscribe`);
                if (onSubscribe) onSubscribe(post.creator.id);
                window.location.reload(); 
            } else if (post.type === 'PAID') {
                if (!confirm(`Purchase this post using your wallet balance?`)) {
                    setLoading(false);
                    return;
                }
                await api.post(`/posts/${post.id}/purchase`);
                window.location.reload();
            }
        } catch (err: any) {
            console.error('Action error:', err);
            const msg = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('insufficient wallet balance')) {
                if (confirm('Insufficient wallet balance. Go to Wallet to add funds?')) {
                    window.location.href = '/fan/wallet';
                }
            } else {
                alert(msg || 'Failed to complete transaction.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTip = async () => {
        if (!tipAmount || isNaN(Number(tipAmount))) return;
        setLoading(true);
        try {
            await api.post(`/creators/${post.creator.id}/tip`, {
                amount: Number(tipAmount),
                message: tipMessage
            });
            setShowTipModal(false);
            setTipAmount('');
            setTipMessage('');
            alert('Tip sent successfully!');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to send tip');
        } finally {
            setLoading(false);
        }
    };

    const toggleComments = async () => {
        if (!showComments) {
            setLoadingComments(true);
            try {
                const res = await api.get(`/posts/${post.id}/comments`);
                const data = res.data as any[];
                setComments(data);
            } catch (err) {
                console.error('Fetch comments error:', err);
            } finally {
                setLoadingComments(false);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        setLoading(true);
        try {
            const res = await api.post(`/posts/${post.id}/comment`, { content: commentContent });
            const newComment = res.data as any;
            setComments([...comments, newComment]);
            setCommentContent('');
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to add comment');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all mb-6">
            {/* Post Header */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 overflow-hidden">
                        {post.creator.avatar && <img src={getMediaUrl(post.creator.avatar)} alt="" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <div className="font-black text-white">{post.creator.user.name}</div>
                        <div className="text-sm text-neutral-500 font-bold">@creator_{post.creator.id}</div>
                    </div>
                </div>
                <button className="text-neutral-500 hover:text-white">
                    <MoreHorizontal />
                </button>
            </div>

            {/* Post Content */}
            <div className="px-6 pb-4">
                <p className="text-neutral-300 leading-relaxed">{post.content}</p>
            </div>

            {/* Media Section */}
            {(post.media.length > 0 || post.isLocked) && (
                <div className={`relative aspect-video border-y border-white/5 flex items-center justify-center overflow-hidden ${post.isLocked ? 'bg-gradient-to-br from-neutral-800 to-black' : 'bg-black'}`}>
                    {post.media.length > 0 && (
                        post.media[0].type === 'video' ? (
                            <video
                                src={getMediaUrl(post.media[0].url)}
                                controls
                                className={`w-full h-full object-contain select-none ${post.isLocked ? 'blur-2xl opacity-50' : ''}`}
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <img
                                src={getMediaUrl(post.media[0].url)}
                                alt="Content"
                                draggable={false}
                                onContextMenu={(e) => e.preventDefault()}
                                className={`w-full h-full object-contain select-none ${post.isLocked ? 'blur-2xl opacity-50' : ''}`}
                            />
                        )
                    )}

                    {post.isLocked && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-md">
                            <div className="p-5 bg-white/10 rounded-full mb-4">
                                <Lock size={32} className="text-white" />
                            </div>
                            <h4 className="text-xl font-black text-white mb-2">
                                {post.type === 'SUBSCRIBER' ? 'Subscriber Only' : 'Unlock Post'}
                            </h4>
                            <p className="text-neutral-400 text-sm mb-6 text-center max-w-[200px]">
                                {post.type === 'SUBSCRIBER'
                                    ? 'Subscribe to creator to view this content.'
                                    : 'Unlock this exclusive content'}
                            </p>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="bg-rose-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-rose-700 hover:scale-105 transition-all shadow-xl shadow-rose-600/20 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : (post.type === 'SUBSCRIBER' ? 'Subscribe Now' : 'Purchase Access')}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Post Actions */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 transition-colors ${isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-rose-500'}`}
                    >
                        <Heart size={24} fill={isLiked ? "currentColor" : "none"} />
                        <span className="text-sm font-bold">{likeCount}</span>
                    </button>
                    <button 
                        onClick={toggleComments}
                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                    >
                        <MessageCircle size={24} />
                        <span className="text-sm font-bold">{post._count.comments}</span>
                    </button>

                </div>
                <button 
                    onClick={() => setShowTipModal(true)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-rose-500 px-4 py-2 rounded-xl transition-all"
                >
                    <DollarSign size={18} />
                    <span className="text-sm font-black">TIP</span>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="px-6 pb-6 border-t border-white/5 pt-4">
                    <div className="space-y-4 mb-4 max-h-60 overflow-y-auto custom-scrollbar">
                        {loadingComments ? (
                            <div className="text-center py-4 text-neutral-500 text-sm animate-pulse">Loading comments...</div>
                        ) : comments.length > 0 ? (
                            comments.map((comment, i) => (
                                <div key={i} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500/20 to-amber-500/20 flex-shrink-0 border border-white/5" />
                                    <div>
                                        <div className="text-xs font-black text-white">{comment.user?.name || 'User'}</div>
                                        <p className="text-sm text-neutral-400 leading-relaxed">{comment.content}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-neutral-500 text-sm">No comments yet. Be the first!</div>
                        )}
                    </div>

                    <form onSubmit={handleAddComment} className="flex gap-2">
                        <input 
                            type="text"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-rose-500 outline-none transition-all"
                        />
                        <button 
                            disabled={loading || !commentContent.trim()}
                            className="bg-rose-500 text-white px-5 py-2 rounded-xl text-sm font-black hover:bg-rose-600 transition-all disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
                        >
                            {loading ? '...' : 'Post'}
                        </button>
                    </form>
                </div>
            )}


            {/* Tip Modal */}
            {showTipModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-black text-white mb-4">Send a Tip</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-neutral-500 mb-1 block">Amount (INR)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                                    <input 
                                        type="number"
                                        min="1"
                                        value={tipAmount}
                                        onChange={e => setTipAmount(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-white focus:border-rose-500 outline-none"
                                        placeholder="5.00"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-neutral-500 mb-1 block">Message (Optional)</label>
                                <textarea 
                                    value={tipMessage}
                                    onChange={e => setTipMessage(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white focus:border-rose-500 outline-none resize-none"
                                    placeholder="Love this content! 🔥"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setShowTipModal(false)}
                                    className="flex-1 py-3 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleTip}
                                    disabled={loading || !tipAmount}
                                    className="flex-1 bg-rose-500 text-white font-black py-3 rounded-2xl hover:bg-rose-400 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Sending...' : 'Send Tip'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
