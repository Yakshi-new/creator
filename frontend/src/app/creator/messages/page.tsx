'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send, Search, Lock, DollarSign, Smile,
    Image as ImageIcon, MoreVertical, Circle,
    CheckCheck, Phone, Video, X
} from 'lucide-react';
import api from '@/lib/api';



const DUMMY_ID = 1; // Fallback for UI logic

function Avatar({ name, size = 40, online = false }: { name: string; size?: number; online?: boolean }) {
    const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
    return (
        <div className="relative" style={{ width: size, height: size, minWidth: size }}>
            <div
                style={{ width: size, height: size }}
                className="rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-xs"
            >
                {initials}
            </div>
            {online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black" />
            )}
        </div>
    );
}

export default function CreatorMessagesPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [activeConvId, setActiveConvId] = useState<number | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [search, setSearch] = useState('');
    const [paidPrice, setPaidPrice] = useState('');
    const [showPaidModal, setShowPaidModal] = useState(false);
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetch = async () => {
             try {
                 const res = await api.get('/messages/conversations');
                 const data = res.data as any[];
                 setConversations(data);
                 if (data.length > 0) setActiveConvId(data[0].id);
             } catch {
                 setConversations([]);
             } finally {
                 setLoading(false);
             }
        };
        fetch();
    }, []);

    const activeConv = conversations.find(c => c.id === activeConvId);

    const [myId, setMyId] = useState<number>(DUMMY_ID);

    useEffect(() => {
        const fetch = async () => {
             try {
                 const resBoard = await api.get('/creators/dashboard');
                 const data = resBoard.data as any;
                 if (data?.creator) {
                     setMyId(data.creator.userId);
                 }
                 const res = await api.get('/messages/conversations');
                 const convs = res.data as any[];
                 setConversations(convs);
                 if (convs.length > 0) setActiveConvId(convs[0].id);
             } catch {
                 setConversations([]);
             } finally {
                 setLoading(false);
             }
        };
        fetch();
    }, []);

    useEffect(() => {
        if (!activeConvId) return;
        const fetchHistory = async () => {
            try {
                const resHist = await api.get(`/messages/${activeConvId}`);
                setMessages(resHist.data as any[]);
            } catch {
                setMessages([]);
            }
        };
        fetchHistory();
    }, [activeConvId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredConvs = conversations.filter(c =>
        !search || c.fan.name.toLowerCase().includes(search.toLowerCase())
    );

    const sendMessage = async (isPaid = false) => {
        if (!input.trim() && !isPaid) return;
        const content = input.trim();
        const newMsg = {
            id: Date.now(),
            senderId: myId,
            content: isPaid ? '' : content,
            createdAt: 'just now',
            isPaid,
            price: isPaid ? Number(paidPrice) : undefined,
            isUnlocked: false,
        };

        setSending(true);
        try {
            const { data } = await api.post('/messages', {
                receiverId: activeConv?.fan.id,
                content: isPaid ? null : content,
                isPaid,
                price: isPaid ? Number(paidPrice) : undefined,
            });
            setMessages(prev => [...prev, data]);
        } catch {
            // Failure logic
        } finally {
             setSending(false);
        }

        setInput('');
        setPaidPrice('');
        setShowPaidModal(false);
    };

    return (
        <div className="flex h-screen bg-black text-white">
            {/* Left: Conversation List */}
            <div className="w-80 border-r border-white/5 flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/5">
                    <h1 className="text-xl font-black text-white mb-4">Messages</h1>
                    <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-2xl px-3 py-2.5">
                        <Search size={14} className="text-neutral-500" />
                        <input
                            type="text"
                            placeholder="Search fans…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-white outline-none placeholder:text-neutral-600 w-full"
                        />
                    </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredConvs.map(conv => (
                        <button
                            key={conv.id}
                            onClick={() => setActiveConvId(conv.id)}
                            className={`w-full flex items-center gap-3 px-4 py-4 hover:bg-neutral-900 transition-all border-b border-white/5 text-left ${activeConvId === conv.id ? 'bg-neutral-900 border-l-2 border-l-rose-500' : ''}`}
                        >
                            <Avatar name={conv.fan.name} size={44} online={conv.id === 1 || conv.id === 3} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black text-white">{conv.fan.name}</span>
                                    <span className="text-xs text-neutral-600">{conv.lastAt}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-neutral-500 truncate">{conv.lastMessage}</span>
                                    {conv.unread > 0 && (
                                        <span className="w-5 h-5 bg-rose-500 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0 ml-2">{conv.unread}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Chat Area */}
            {activeConv ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <Avatar name={activeConv.fan.name} size={40} online={activeConvId === 1 || activeConvId === 3} />
                            <div>
                                <div className="font-black text-white">{activeConv.fan.name}</div>
                                <div className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                                    <Circle size={6} fill="currentColor" /> Active subscriber
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2.5 rounded-2xl hover:bg-neutral-900 transition-all text-neutral-500 hover:text-white">
                                <Phone size={18} />
                            </button>
                            <button className="p-2.5 rounded-2xl hover:bg-neutral-900 transition-all text-neutral-500 hover:text-white">
                                <Video size={18} />
                            </button>
                            <button className="p-2.5 rounded-2xl hover:bg-neutral-900 transition-all text-neutral-500 hover:text-white">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                        {messages.map((msg) => {
                            const isMe = msg.senderId === myId;
                            return (
                                <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && <Avatar name={activeConv.fan.name} size={30} />}
                                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                                        {msg.isPaid ? (
                                            <div className="bg-gradient-to-br from-violet-500/20 to-violet-800/20 border border-violet-400/30 rounded-2xl p-4 flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                                                    <Lock size={18} className="text-violet-400" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white">Locked Message</div>
                                                    <div className="text-xs text-violet-400 font-bold">${msg.price} to unlock</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={`px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed ${isMe ? 'bg-gradient-to-br from-rose-500 to-amber-500 text-white rounded-tr-sm' : 'bg-neutral-800 text-white rounded-tl-sm'}`}>
                                                {msg.content}
                                            </div>
                                        )}
                                        <div className={`flex items-center gap-1 text-xs text-neutral-600 ${isMe ? 'flex-row-reverse' : ''}`}>
                                            <span>{msg.createdAt}</span>
                                            {isMe && <CheckCheck size={12} className="text-rose-400" />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input Area */}
                    <div className="px-6 py-4 border-t border-white/5">
                        {/* Paid message modal */}
                        {showPaidModal && (
                            <div className="mb-4 p-4 bg-violet-500/10 border border-violet-500/30 rounded-2xl">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm font-black text-violet-400">Locked / Paid Message</span>
                                    <button onClick={() => setShowPaidModal(false)}><X size={14} className="text-neutral-500" /></button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign size={16} className="text-violet-400" />
                                    <input
                                        type="number" min="0.99" step="0.01" placeholder="Set price to unlock (e.g. 5.00)"
                                        value={paidPrice}
                                        onChange={e => setPaidPrice(e.target.value)}
                                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-600"
                                    />
                                    <button
                                        onClick={() => sendMessage(true)}
                                        disabled={!paidPrice || Number(paidPrice) <= 0}
                                        className="bg-violet-500 hover:bg-violet-400 text-white px-4 py-2 rounded-xl text-sm font-black transition-all disabled:opacity-50"
                                    >
                                        Lock & Send
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 bg-neutral-900 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-rose-400/40 transition-all">
                            <button className="text-neutral-500 hover:text-white transition-all"><Smile size={18} /></button>
                            <button className="text-neutral-500 hover:text-white transition-all"><ImageIcon size={18} /></button>
                            <button
                                onClick={() => setShowPaidModal(!showPaidModal)}
                                className={`text-neutral-500 hover:text-violet-400 transition-all ${showPaidModal ? 'text-violet-400' : ''}`}
                            >
                                <Lock size={18} />
                            </button>
                            <input
                                type="text"
                                placeholder="Send a message to your fan…"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(false)}
                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-600"
                            />
                            <button
                                onClick={() => sendMessage(false)}
                                disabled={!input.trim() || sending}
                                className="w-9 h-9 bg-gradient-to-r from-rose-500 to-amber-500 rounded-xl flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-40"
                            >
                                <Send size={15} />
                            </button>
                        </div>

                        <div className="flex justify-between mt-2">
                            <span className="text-xs text-neutral-600">Press Enter to send · Use 🔒 to send a locked paid message</span>
                            <span className="text-xs text-violet-400 font-bold cursor-pointer hover:underline" onClick={() => setShowPaidModal(true)}>+ Paid message</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-neutral-900 flex items-center justify-center">
                        <Send size={36} className="text-neutral-700" />
                    </div>
                    <h3 className="text-xl font-black text-neutral-400">Select a conversation</h3>
                </div>
            )}
        </div>
    );
}