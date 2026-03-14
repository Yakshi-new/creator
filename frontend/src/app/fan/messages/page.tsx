'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Image as ImageIcon, CheckCircle2, Lock, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { useWallet } from '@/context/WalletContext';

export default function FanMessages() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [myId, setMyId] = useState<number>(-1);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchConvos = async () => {
            try {
                // We need to know who "I" am to align bubbles
                const profileRes = await api.get('/auth/me').catch(() => null) as any;
                if (profileRes?.data?.id) setMyId(profileRes.data.id);
                
                const res = await api.get('/messages/conversations');
                const data = res.data as any[];
                setConversations(data);
                if (data.length > 0) setActiveConvId(data[0].id);
            } catch (err) {
                console.error('Fetch convos error:', err);
            }
        };
        fetchConvos();
    }, []);

    useEffect(() => {
        if (!activeConvId) return;
        const fetchHistory = async () => {
            try {
                const res = await api.get(`/messages/${activeConvId}`);
                const data = res.data as any[];
                setMessages(data);
                scrollToBottom();
            } catch (err) {
                console.error('Fetch msgs error:', err);
            }
        };
        fetchHistory();
    }, [activeConvId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeConvId) return;
        
        const tempMsg = {
            id: Date.now(),
            content: newMessage,
            senderId: myId,
            receiverId: activeConvId,
            createdAt: new Date().toISOString(),
            isPaid: false,
            isUnlocked: true,
            media: []
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');
        scrollToBottom();

        try {
            await api.post('/messages', {
                receiverId: activeConvId,
                content: tempMsg.content
            });
            // Background sync
            const res = await api.get(`/messages/${activeConvId}`);
            const data = res.data as any[];
            setMessages(data);
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    const handleUnlock = async (msgId: number) => {
        setLoading(true);
        try {
            await api.post('/messages/unlock', { messageId: msgId });
            // Refresh
            const res = await api.get(`/messages/${activeConvId}`);
            const data = res.data as any[];
            setMessages(data);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to unlock message.');
        } finally {
            setLoading(false);
        }
    };

    const activeUser = conversations.find(c => c.id === activeConvId);

    return (
        <div className="flex h-[calc(100vh-80px)] xl:h-screen bg-black text-white">
            {/* Conversations List */}
            <div className="w-full md:w-80 lg:w-96 border-r border-white/5 flex flex-col h-full bg-neutral-900/10">
                <div className="p-6 border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-10">
                    <h2 className="text-xl font-black mb-1">Messages</h2>
                    <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Your Private Chats</p>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar pb-6 space-y-2 p-4">
                    {conversations.map(conv => {
                        const isOnline = Math.random() > 0.5; // Simulate online status
                        return (
                            <button
                                key={conv.id}
                                onClick={() => setActiveConvId(conv.id)}
                                className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all duration-300 ${
                                    activeConvId === conv.id 
                                        ? 'bg-rose-500 shadow-lg shadow-rose-500/20 text-white' 
                                        : 'hover:bg-neutral-900/80 bg-neutral-900/40 text-neutral-400 hover:text-white border border-transparent hover:border-white/5'
                                }`}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-2xl bg-neutral-800 flex items-center justify-center overflow-hidden uppercase font-black text-xl text-neutral-600 bg-gradient-to-tr from-neutral-800 to-neutral-700">
                                        {conv.name.charAt(0)}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className={`font-black truncate ${activeConvId === conv.id ? 'text-white' : 'text-neutral-200'}`}>
                                            {conv.name}
                                        </h3>
                                        {Math.random() > 0.7 && activeConvId !== conv.id && (
                                            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                                        )}
                                    </div>
                                    <p className={`text-xs font-bold truncate ${activeConvId === conv.id ? 'text-rose-100' : 'text-neutral-500'}`}>
                                        {isOnline ? 'Online now' : 'Last seen recently'}
                                    </p>
                                </div>
                            </button>
                        );
                    })}

                    {conversations.length === 0 && (
                        <div className="text-center py-20 px-6">
                            <p className="text-neutral-500 font-bold mb-2 text-sm">No messages yet</p>
                            <p className="text-neutral-600 text-xs">When you subscribe to creators, your conversations will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {activeUser ? (
                <div className="flex-1 flex flex-col h-full relative bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:100px] bg-opacity-5 relative z-0 before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/80 before:to-black/40 before:-z-10">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 bg-black/80 backdrop-blur-3xl sticky top-0 z-10 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-black uppercase shadow-lg">
                                {activeUser.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-black text-white">{activeUser.name}</h3>
                                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Now
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.map((msg: any) => {
                            const isMe = msg.senderId === myId;
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                                        <div className={`px-6 py-4 rounded-3xl ${
                                            isMe 
                                                ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-br-sm shadow-lg shadow-rose-500/20' 
                                                : 'bg-neutral-900 border border-white/5 text-neutral-200 rounded-bl-sm shadow-xl'
                                        }`}>
                                            {msg.isPaid && !msg.isUnlocked && !isMe ? (
                                                <div className="flex flex-col items-center justify-center gap-3 p-4">
                                                    <div className="w-14 h-14 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                                                        <Lock size={24} />
                                                    </div>
                                                    <p className="text-sm font-black text-white text-center">Locked Content</p>
                                                    <button 
                                                        onClick={() => handleUnlock(msg.id)}
                                                        disabled={loading}
                                                        className="px-6 py-2 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl text-xs font-black shadow-lg shadow-rose-500/20 hover:scale-105 transition-all text-white mt-2 disabled:opacity-50"
                                                    >
                                                        {loading ? 'Processing...' : `Unlock for $${msg.price}`}
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.media?.length > 0 && (
                                                        <div className="mb-3 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                                                            <img src={msg.media[0].url} alt="Media" className="max-w-full h-auto" />
                                                        </div>
                                                    )}
                                                    <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className={`flex items-center gap-2 mt-2 text-[10px] font-bold ${isMe ? 'text-rose-400' : 'text-neutral-500'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && <CheckCircle2 size={12} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 bg-gradient-to-t from-black via-black to-transparent pt-10">
                        <form onSubmit={sendMessage} className="flex gap-4 p-2 bg-neutral-900 border border-white/10 rounded-full focus-within:border-rose-500/50 focus-within:ring-4 focus-within:ring-rose-500/10 transition-all shadow-2xl">
                            <button type="button" className="w-12 h-12 flex items-center justify-center text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all shrink-0">
                                <ImageIcon size={20} />
                            </button>
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                className="flex-1 bg-transparent text-white outline-none placeholder:text-neutral-600 font-medium px-2"
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="w-12 h-12 flex items-center justify-center bg-white text-black rounded-full hover:bg-rose-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black shrink-0 shadow-lg"
                            >
                                <Send size={18} className="translate-x-[-1px] translate-y-[1px]" />
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="flex-1 bg-black flex flex-col items-center justify-center text-center p-10 border-l border-white/5">
                    <div className="w-24 h-24 rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                        <MessageSquare size={32} className="text-neutral-700" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Select a Conversation</h3>
                    <p className="text-neutral-500 max-w-sm font-medium">Choose a creator from the left to start viewing your private messages and exclusive content.</p>
                </div>
            )}
        </div>
    );
}

// Ensure lucide icon is available via import
import { MessageSquare } from 'lucide-react';