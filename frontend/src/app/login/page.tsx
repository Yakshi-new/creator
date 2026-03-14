'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const [forgotStep, setForgotStep] = useState<'email' | 'reset'>('email');
    const [forgotEmail, setForgotEmail] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [forgotStatus, setForgotStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/auth/login', { email, password });
            const data = res.data as any;

            // Store access token
            localStorage.setItem('accessToken', data.accessToken);

            // Store the logged-in user info (important!)
            localStorage.setItem('user', JSON.stringify(data.user));

            const role = data.user.role;
            if (role === 'CREATOR') {
                router.push('/creator/dashboard');
            } else if (role === 'ADMIN') {
                router.push('/admin/dashboard');
            } else {
                router.push('/fan/feed');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setForgotStatus(null);
        try {
            if (forgotStep === 'email') {
                await api.post('/auth/forgot-password', { email: forgotEmail });
                setForgotStep('reset');
            } else {
                if (newPass !== confirmPass) {
                    setForgotStatus({ type: 'error', msg: "Passwords don't match." });
                    setLoading(false);
                    return;
                }
                await api.post('/auth/reset-password', { email: forgotEmail, newPassword: newPass });
                setForgotStatus({ type: 'success', msg: 'Password updated! You can now log in.' });
                setTimeout(() => {
                    setShowForgot(false);
                    setForgotStep('email');
                    setForgotStatus(null);
                    setNewPass('');
                    setConfirmPass('');
                }, 2000);
            }
        } catch (err: any) {
            setForgotStatus({ type: 'error', msg: err.response?.data?.message || 'Action failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Welcome Back</h1>
                    <p className="text-neutral-400">Log in to your account</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:border-rose-500 focus:outline-none transition-all"
                            placeholder="name@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:border-rose-500 focus:outline-none transition-all"
                            placeholder="••••••••"
                            required
                        />
                        <div className="flex justify-end mt-2">
                             <button 
                                 type="button"
                                 onClick={() => setShowForgot(true)}
                                 className="text-xs font-bold text-neutral-500 hover:text-rose-500 transition-all"
                             >
                                 Forgot Password?
                             </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-rose-500 font-bold hover:underline">
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgot && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
                    <div className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-3xl p-8 relative animate-in zoom-in-95 duration-200">
                        <button 
                            onClick={() => { setShowForgot(false); setForgotStatus(null); }}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                        >
                            ✕
                        </button>
                        <h2 className="text-xl font-black text-white mb-2">
                            {forgotStep === 'email' ? 'Reset Password' : 'Set New Password'}
                        </h2>
                        <p className="text-sm text-neutral-500 mb-6">
                            {forgotStep === 'email' 
                                ? "Enter your email to verify your account." 
                                : `Verification successful! Set a new password for ${forgotEmail}`}
                        </p>
                        
                        {forgotStatus && (
                            <div className={`mb-6 p-4 rounded-2xl text-xs font-bold ${forgotStatus.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                {forgotStatus.msg}
                            </div>
                        )}

                        <form onSubmit={handleForgot} className="space-y-4">
                            {forgotStep === 'email' ? (
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-rose-500 focus:outline-none transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            ) : (
                                <>
                                    <input
                                        type="password"
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-rose-500 focus:outline-none transition-all"
                                        placeholder="New Password"
                                        required
                                    />
                                    <input
                                        type="password"
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:border-rose-500 focus:outline-none transition-all"
                                        placeholder="Confirm New Password"
                                        required
                                    />
                                </>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-rose-500 text-white py-3.5 rounded-2xl font-black hover:bg-rose-400 transition-all disabled:opacity-50"
                            >
                                {loading 
                                    ? 'Processing...' 
                                    : (forgotStep === 'email' ? 'Verify Email' : 'Update Password')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
