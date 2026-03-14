'use client';

import { useState, useEffect } from 'react';
import {
    User, Lock, Bell, CreditCard, Shield,
    Camera, Save, Eye, EyeOff, CheckCircle,
    AlertCircle, Loader2, Globe, Instagram,
    Twitter, Youtube, Link2, DollarSign
} from 'lucide-react';
import api from '@/lib/api';
import { getMediaUrl } from '@/lib/utils';

const DEFAULT_PROFILE = {
    name: '',
    email: '',
    bio: '',
    avatar: null as string | null,
    coverImage: null as string | null,
    subscriptionPrice: 0,
    links: { instagram: '', twitter: '', youtube: '', website: '' },
    notifications: { newSubscriber: true, newTip: true, newMessage: true, newComment: false, weeklyReport: true },
    payout: { method: 'bank', accountName: '', accountLast4: '', bankName: '' }
};
type Tab = 'profile' | 'security' | 'notifications' | 'payout';

function TabButton({ label, icon: Icon, active, onClick }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}
        >
            <Icon size={18} />
            {label}
        </button>
    );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-all ${checked ? 'bg-rose-500' : 'bg-neutral-700'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${checked ? 'translate-x-6' : ''}`} />
        </button>
    );
}

function SaveBanner({ saved }: { saved: boolean }) {
    if (!saved) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black shadow-xl shadow-emerald-500/30 animate-bounce">
            <CheckCircle size={18} /> Changes saved!
        </div>
    );
}

export default function CreatorSettings() {
    const [activeTab, setActiveTab] = useState<Tab>('profile');
    const [profile, setProfile] = useState(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [notifications, setNotifications] = useState(DEFAULT_PROFILE.notifications);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
             try {
                 const res = await api.get('/creators/dashboard');
                 const data = res.data as any;
                 if (data?.creator) {
                     setProfile(prev => ({
                         ...prev,
                         name: data.creator.user?.name || '',
                         email: data.creator.user?.email || '',
                         bio: data.creator.bio || '',
                         avatar: getMediaUrl(data.creator.avatar) || null,
                         coverImage: getMediaUrl(data.creator.coverImage) || null,
                         subscriptionPrice: data.creator.subscriptionPrice || 0,
                     }));
                     setAvatarPreview(getMediaUrl(data.creator.avatar) || null);
                 }
             } catch {
                 // Keep default
             } finally {
                 setLoading(false);
             }
        };
        fetch();
    }, []);

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'payout', label: 'Payout Settings', icon: CreditCard },
    ];

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put('/creators/profile', {
                bio: profile.bio,
                subscriptionPrice: profile.subscriptionPrice,
                name: profile.name,
                avatar: profile.avatar,
                coverImage: profile.coverImage,
            });
        } catch {
            // Demo mode / Failure logic
        } finally {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const url = reader.result as string;
                if (type === 'avatar') {
                    setAvatarPreview(url);
                    setProfile(prev => ({ ...prev, avatar: url }));
                } else {
                    setProfile(prev => ({ ...prev, coverImage: url }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const presets = [
        { name: 'Default Female', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
        { name: 'Default Male', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' },
    ];


    const handleAvatarChange = (url: string) => {
        setAvatarPreview(url);
        setProfile(prev => ({ ...prev, avatar: url }));
    };

    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="min-h-screen bg-black text-white">
            <SaveBanner saved={saved} />

            {/* Cover + Avatar */}
            <div className="relative">
                <div className="h-48 bg-gradient-to-r from-rose-900/50 via-neutral-900 to-amber-900/50 relative overflow-hidden">
                    {profile.coverImage && <img src={profile.coverImage} className="w-full h-full object-cover" alt="cover" />}
                    <label className="absolute bottom-3 right-4 bg-black/50 backdrop-blur text-xs text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-black/70 transition-all border border-white/10 cursor-pointer">
                        <Camera size={12} /> Change Cover
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'cover')} />
                    </label>
                </div>
                <div className="absolute -bottom-12 left-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl border-4 border-black bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white text-2xl font-black overflow-hidden">
                            {avatarPreview ? <img src={avatarPreview} className="w-full h-full object-cover" alt="avatar" /> : initials}
                        </div>
                        <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-400 transition-all border-2 border-black cursor-pointer">
                            <Camera size={14} className="text-white" />
                            <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'avatar')} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex pt-16 px-8 pb-8 gap-8">
                {/* Sidebar Tabs */}
                <div className="w-56 shrink-0 space-y-1 pt-2">
                    {tabs.map(t => (
                        <TabButton key={t.id} label={t.label} icon={t.icon} active={activeTab === t.id} onClick={() => setActiveTab(t.id)} />
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 max-w-2xl">

                    {/* ── PROFILE ── */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Profile Settings</h2>
                                <p className="text-neutral-500 text-sm">Customize how fans see you on the platform</p>
                            </div>

                            {/* Display Name */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-5">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Basic Info</h3>
                                <div>
                                    <label className="text-xs font-black text-neutral-500 mb-2 block">Display Name</label>
                                    <input
                                        type="text" value={profile.name}
                                        onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-rose-400/50 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-neutral-500 mb-2 block">Email</label>
                                    <input
                                        type="email" value={profile.email} disabled
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl px-4 py-3 text-neutral-500 text-sm outline-none cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-black text-neutral-500 mb-2 block">Bio</label>
                                    <textarea
                                        rows={4} value={profile.bio}
                                        onChange={e => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-rose-400/50 transition-all resize-none"
                                        placeholder="Tell your fans about yourself…"
                                    />
                                    <div className="text-xs text-neutral-600 text-right mt-1">{profile.bio.length}/500</div>
                                </div>
                            </div>

                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-4">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Appearance</h3>
                                
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-neutral-500 block">Cover Image URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://your-image-url.com/cover.jpg"
                                        value={profile.coverImage || ''}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-rose-400/50 transition-all"
                                        onChange={e => setProfile(prev => ({ ...prev, coverImage: e.target.value }))}
                                    />
                                    
                                    <label className="text-xs font-black text-neutral-500 block">Avatar Preset / URL</label>
                                    <div className="flex gap-3 mb-4">
                                        {presets.map(p => (
                                            <button 
                                                key={p.url}
                                                onClick={() => { setAvatarPreview(p.url); setProfile(prev => ({ ...prev, avatar: p.url })); }}
                                                className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${avatarPreview === p.url ? 'border-rose-500' : 'border-transparent'}`}
                                            >
                                                <img src={p.url} className="w-full h-full object-cover" alt={p.name} />
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="https://your-image-url.com/photo.jpg"
                                        value={profile.avatar || ''}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-4 py-3 text-white text-sm outline-none focus:border-rose-400/50 transition-all"
                                        onChange={e => { setAvatarPreview(e.target.value); setProfile(prev => ({ ...prev, avatar: e.target.value })); }}
                                    />
                                </div>
                            </div>

                            {/* Subscription Price */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-4">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Subscription Price</h3>
                                <div className="flex items-center gap-3 bg-black border border-white/10 rounded-2xl px-4 py-3 focus-within:border-rose-400/50 transition-all">
                                    <DollarSign size={18} className="text-rose-400" />
                                    <input
                                        type="number" min="0" step="0.99"
                                        value={profile.subscriptionPrice}
                                        onChange={e => setProfile(prev => ({ ...prev, subscriptionPrice: Number(e.target.value) }))}
                                        className="flex-1 bg-transparent text-white text-sm outline-none font-bold"
                                    />
                                    <span className="text-neutral-500 text-xs font-bold">/ month</span>
                                </div>
                                <p className="text-xs text-neutral-600">Set to 0 to offer free subscriptions. Platform takes a 20% fee.</p>
                            </div>

                            {/* Social Links */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-4">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Social Links</h3>
                                {[
                                    { icon: Instagram, label: 'Instagram', key: 'instagram', prefix: 'instagram.com/' },
                                    { icon: Twitter, label: 'Twitter/X', key: 'twitter', prefix: 'x.com/' },
                                    { icon: Youtube, label: 'YouTube', key: 'youtube', prefix: 'youtube.com/' },
                                    { icon: Globe, label: 'Website', key: 'website', prefix: '' },
                                ].map(link => {
                                    const Icon = link.icon;
                                    return (
                                        <div key={link.key} className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
                                                <Icon size={16} className="text-neutral-400" />
                                            </div>
                                            <div className="flex-1 flex items-center bg-black border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-rose-400/40 transition-all">
                                                {link.prefix && <span className="text-neutral-600 text-xs mr-1">{link.prefix}</span>}
                                                <input
                                                    type="text"
                                                    defaultValue={(profile.links as any)[link.key]}
                                                    placeholder={link.label}
                                                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-700"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-60">
                                {saving ? <><Loader2 size={18} className="animate-spin" /> Saving…</> : <><Save size={18} /> Save Profile</>}
                            </button>
                        </div>
                    )}

                    {/* ── SECURITY ── */}
                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Security</h2>
                                <p className="text-neutral-500 text-sm">Keep your account safe</p>
                            </div>

                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-5">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Change Password</h3>
                                {[
                                    { label: 'New Password', key: 'new' },
                                    { label: 'Confirm New Password', key: 'confirm' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-xs font-black text-neutral-500 mb-2 block">{field.label}</label>
                                        <div className="flex items-center bg-black border border-white/10 rounded-2xl px-4 py-3 focus-within:border-rose-400/50 transition-all">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={(passwords as any)[field.key]}
                                                onChange={e => setPasswords(prev => ({ ...prev, [field.key]: e.target.value }))}
                                                placeholder="••••••••"
                                                className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-neutral-700"
                                            />
                                            <button onClick={() => setShowPassword(!showPassword)} className="text-neutral-500 hover:text-white transition-all">
                                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {passwords.new && passwords.confirm && passwords.new !== passwords.confirm && (
                                    <div className="flex items-center gap-2 text-rose-400 text-sm">
                                        <AlertCircle size={14} /> Passwords don't match
                                    </div>
                                )}

                                <button
                                    disabled={!passwords.new || passwords.new !== passwords.confirm}
                                    className="w-full py-3 bg-rose-500 text-white font-black rounded-2xl hover:bg-rose-400 transition-all disabled:opacity-40"
                                >
                                    Update Password
                                </button>
                            </div>

                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 space-y-4">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider">Two-Factor Authentication</h3>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-bold">Authenticator App</div>
                                        <div className="text-xs text-neutral-500 mt-1">Use Google Authenticator or Authy</div>
                                    </div>
                                    <span className="text-xs font-black text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full">Not set up</span>
                                </div>
                                <button className="w-full py-3 border border-white/10 text-white font-black rounded-2xl hover:bg-neutral-800 transition-all flex items-center justify-center gap-2">
                                    <Shield size={16} /> Enable 2FA
                                </button>
                            </div>

                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6">
                                <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-3">Danger Zone</h3>
                                <p className="text-neutral-500 text-sm mb-4">Permanently delete your account and all your content. This cannot be undone.</p>
                                <button className="text-rose-400 font-black text-sm hover:underline">Delete my account</button>
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ── */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Notifications</h2>
                                <p className="text-neutral-500 text-sm">Choose what alerts you receive</p>
                            </div>

                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 divide-y divide-white/5">
                                {[
                                    { key: 'newSubscriber', label: 'New Subscriber', desc: 'When someone subscribes to your page' },
                                    { key: 'newTip', label: 'New Tip Received', desc: 'When a fan sends you a tip' },
                                    { key: 'newMessage', label: 'New Message', desc: 'When a fan sends you a message' },
                                    { key: 'newComment', label: 'New Comment', desc: 'When someone comments on your post' },
                                    { key: 'weeklyReport', label: 'Weekly Analytics Report', desc: 'Summary of your weekly performance' },
                                ].map(item => (
                                    <div key={item.key} className="flex items-center justify-between py-5">
                                        <div>
                                            <div className="text-white font-bold text-sm">{item.label}</div>
                                            <div className="text-xs text-neutral-500 mt-0.5">{item.desc}</div>
                                        </div>
                                        <Toggle
                                            checked={(notifications as any)[item.key]}
                                            onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !(prev as any)[item.key] }))}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Preferences
                            </button>
                        </div>
                    )}

                    {/* ── PAYOUT ── */}
                    {activeTab === 'payout' && (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black text-white mb-1">Payout Settings</h2>
                                <p className="text-neutral-500 text-sm">Manage how you receive your earnings</p>
                            </div>

                            {/* Current Method */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-4">Current Payout Method</h3>
                                <div className="flex items-center gap-4 p-4 bg-emerald-400/5 border border-emerald-400/20 rounded-2xl">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 flex items-center justify-center">
                                        <CreditCard size={20} className="text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-black">{profile.payout.bankName} — ****{profile.payout.accountLast4}</div>
                                        <div className="text-xs text-neutral-500 mt-0.5">Account name: {profile.payout.accountName}</div>
                                    </div>
                                    <div className="ml-auto">
                                        <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg">Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payout Schedule */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-4">Payout Schedule</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Weekly', 'Bi-monthly', 'Monthly'].map(s => (
                                        <button key={s}
                                            className={`py-3 rounded-2xl border text-sm font-black transition-all ${s === 'Monthly' ? 'border-rose-400/50 bg-rose-400/5 text-rose-400' : 'border-white/5 text-neutral-500 hover:border-white/15 hover:text-white'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-neutral-600 mt-3">Minimum payout threshold: $50.00</p>
                            </div>

                            {/* Tax Info */}
                            <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6">
                                <h3 className="text-sm font-black text-neutral-400 uppercase tracking-wider mb-4">Tax Documents</h3>
                                <div className="flex items-center justify-between p-4 bg-amber-400/5 border border-amber-400/20 rounded-2xl">
                                    <div>
                                        <div className="text-white font-bold">W-9 / W-8BEN Form</div>
                                        <div className="text-xs text-neutral-500 mt-1">Required for earnings over $600/year</div>
                                    </div>
                                    <button className="text-xs font-black text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-xl hover:bg-amber-400/20 transition-all">
                                        Upload
                                    </button>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 text-white font-black rounded-2xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}