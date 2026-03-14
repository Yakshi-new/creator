'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, KeyRound, Loader2 } from 'lucide-react';
import api from '@/lib/api';

export default function FanSettings() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    
    // Password change
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/auth/me');
                const data = res.data as any;
                setUser(data);
                setName(data.name || '');
                setEmail(data.email || '');
            } catch (err) {
                console.error('Error fetching user', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put('/auth/update', { name, email }); // Assume a generic user update exists or build later
            alert('Profile updated successfully!');
        } catch (err: any) {
            alert('Profile update is mocked here. Implement update route on back-end.');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("Passwords don't match");
            return;
        }
        try {
            // Reusing auth/reset-password or similar. We did this for creators.
            // This is just a simulated endpoint action since the user didn't ask to rewrite Auth just yet.
            alert('Password updated! (Simulated)');
            setCurrentPass('');
            setNewPass('');
            setConfirmPass('');
        } catch (err: any) {
            alert('Failed to update password');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <Loader2 className="animate-spin text-rose-500" size={48} />
            </div>
        );
    }

    return (
        <div className="p-10 text-white min-h-screen">
            <h1 className="text-4xl font-black mb-10 border-b border-white/5 pb-6">Account Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
                {/* Profile Information */}
                <div className="bg-neutral-900 border border-white/5 p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <User className="text-rose-500" size={24} />
                        </div>
                        <h2 className="text-xl font-black">Profile Details</h2>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 mb-2 block uppercase tracking-widest">Display Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-rose-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 mb-2 block uppercase tracking-widest">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-rose-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-rose-600 hover:bg-rose-700 text-white py-3 px-6 rounded-xl font-black transition-all shadow-lg shadow-rose-600/20 w-fit mt-4"
                        >
                            Save Changes
                        </button>
                    </form>
                </div>

                {/* Security Settings */}
                <div className="bg-neutral-900 border border-white/5 p-8 rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/5 rounded-2xl">
                            <Shield className="text-emerald-500" size={24} />
                        </div>
                        <h2 className="text-xl font-black">Security Settings</h2>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold text-neutral-500 mb-2 block uppercase tracking-widest">New Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="password"
                                    value={newPass}
                                    onChange={(e) => setNewPass(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-neutral-500 mb-2 block uppercase tracking-widest">Confirm Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
                                <input
                                    type="password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full bg-black border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white focus:border-emerald-500 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!newPass || !confirmPass}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-6 rounded-xl font-black transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 w-fit mt-4"
                        >
                            Update Password
                        </button>
                    </form>
                    
                    <div className="mt-12 pt-8 border-t border-white/5">
                        <h3 className="text-sm font-black text-rose-500 mb-2 uppercase tracking-widest">Danger Zone</h3>
                        <p className="text-xs text-neutral-400 font-bold mb-4 max-w-md">Once you delete your account, there is no going back. Please be certain.</p>
                        <button className="text-sm font-black text-white bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 py-2 px-6 rounded-xl transition-all">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}