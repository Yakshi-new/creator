'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

export default function RegisterPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // const initialRole = searchParams.get('role') === 'CREATOR' ? 'CREATOR' : 'FAN';
    const initialRole = 'FAN';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState(initialRole);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [ageVerification, setAgeVerification] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!ageVerification || !termsAccepted) {
            setError('Please verify your age and accept the terms.');
            setLoading(false);
            return;
        }

        try {
            // 1. Register
            await api.post('/auth/register', { email, password, name, role: 'FAN' });
            
            // 2. Auto-login
            const loginRes = await api.post('/auth/login', { email, password });
            const data = loginRes.data as any;
            
            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('user', JSON.stringify({ 
                name: data.user.name, 
                email: data.user.email, 
                role: data.user.role 
            }));
            window.dispatchEvent(new Event('storage'));

            setSuccess(true);
            setTimeout(() => {
                router.push('/fan/feed');
            }, 1000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center px-6">
                <div className="text-center">
                    <h1 className="text-4xl font-black text-rose-500 mb-4">Registration Successful!</h1>
                    <p className="text-neutral-400">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6 py-20">
            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
                    <p className="text-neutral-400">Join our community today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    {/* <div className="grid grid-cols-2 gap-4 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('FAN')}
                            className={`py-3 rounded-2xl font-bold text-sm transition-all ${role === 'FAN' ? 'bg-rose-600 text-white' : 'bg-black text-neutral-400 border border-white/5'}`}
                        >
                            JOIN AS FAN
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('CREATOR')}
                            className={`py-3 rounded-2xl font-bold text-sm transition-all ${role === 'CREATOR' ? 'bg-rose-600 text-white' : 'bg-black text-neutral-400 border border-white/5'}`}
                        >
                            BECOME CREATOR
                        </button>
                    </div> */}


                    <div>
                        <label className="block text-sm font-bold text-neutral-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-2xl px-6 py-4 focus:border-rose-500 focus:outline-none transition-all"
                            placeholder="John Doe"
                            required
                        />
                    </div>
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
                            placeholder="Min. 8 characters"
                            required
                        />
                    </div>

                    <div className="space-y-4 pt-2">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={ageVerification}
                                onChange={(e) => setAgeVerification(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-black text-rose-500 focus:ring-rose-500 transition-all cursor-pointer"
                            />
                            <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium">
                                I am 18 years of age or older.
                            </span>
                        </label>

                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                className="mt-1 w-5 h-5 rounded-lg border-white/10 bg-black text-rose-500 focus:ring-rose-500 transition-all cursor-pointer"
                            />
                            <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors font-medium leading-relaxed">
                                I have read and agree to the <Link href="/terms" className="text-rose-500 hover:underline">Terms of Service</Link>, <Link href="/privacy" className="text-rose-500 hover:underline">Privacy Policy</Link>, and <Link href="/content-policy" className="text-rose-500 hover:underline">Content Policy</Link>.
                            </span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Continue'}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm text-neutral-500">
                    Already have an account?{' '}
                    <Link href="/login" className="text-rose-500 font-bold hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}
