'use client';

import { useState } from 'react';
import {
    Heart, MessageCircle, Lock, Globe, DollarSign,
    Trash2, Edit3, Camera, MoreVertical
} from 'lucide-react';
import { getMediaUrl } from '@/lib/utils';

const TYPE_STYLES: Record<string, any> = {
    PUBLIC: { label: 'Public', icon: Globe, class: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
    SUBSCRIBER: { label: 'Subscribers', icon: Lock, class: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
    PAID: { label: 'Pay-Per-View', icon: DollarSign, class: 'text-violet-400 bg-violet-400/10 border-violet-400/20' },
};

export default function PostCard({ post, refresh }: any) {
    const [menuOpen, setMenuOpen] = useState(false);
    const typeStyle = TYPE_STYLES[post.type] || TYPE_STYLES.PUBLIC;
    const TypeIcon = typeStyle.icon;

    return (
        <div className="bg-neutral-900 border border-white/5 rounded-3xl overflow-hidden hover:border-white/15 transition-all group relative">
            {/* Image */}
            <div className="relative aspect-video bg-neutral-800 overflow-hidden">
                {post.media?.[0] ? (
                    <img src={getMediaUrl(post.media[0].url)} alt={post.content} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Camera size={30} className="text-neutral-700" />
                    </div>
                )}
                {/* Type badge */}
                <div className="absolute top-3 left-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${typeStyle.class}`}>
                        <TypeIcon size={10} /> {typeStyle.label}
                    </span>
                </div>
                {/* Menu button */}
                <div className="absolute top-3 right-3">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="w-8 h-8 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-black/70 transition-all"
                    >
                        <MoreVertical size={14} />
                    </button>
                    {menuOpen && (
                        <div className="absolute top-10 right-0 bg-neutral-800 border border-white/10 rounded-2xl overflow-hidden shadow-xl z-10 w-36">
                            <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-all font-bold">
                                <Edit3 size={14} className="text-neutral-400" /> Edit Post
                            </button>
                            <button
                                className="w-full flex items-center gap-2 px-4 py-3 text-sm text-rose-400 hover:bg-rose-400/5 transition-all font-bold"
                                onClick={() => { setMenuOpen(false); /* trigger delete */ }}
                            >
                                <Trash2 size={14} /> Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <p className="text-white text-sm font-medium line-clamp-2 mb-3">{post.content || 'No caption'}</p>
                {post.type === 'PAID' && post.price && (
                    <div className="text-violet-400 font-black text-sm mb-3 flex items-center gap-1">
                        <DollarSign size={14} /> {post.price}
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1.5">
                            <Heart size={12} className="text-rose-400" />
                            {post._count?.likes || 0}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MessageCircle size={12} className="text-blue-400" />
                            {post._count?.comments || 0}
                        </span>
                    </div>
                    <div className="text-xs text-neutral-600 font-medium">
                        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '—'}
                    </div>
                </div>
            </div>
        </div>
    );
}