'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import PostCard from '@/components/PostCard';

// ── Animated number counter ──────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) return;
            observer.disconnect();
            let start = 0;
            const step = Math.ceil(to / 60);
            const timer = setInterval(() => {
                start += step;
                if (start >= to) { setVal(to); clearInterval(timer); return; }
                setVal(start);
            }, 16);
        }, { threshold: 0.5 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [to]);

    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ── Feature card data ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: '💰',
        title: 'Maximum Earnings',
        desc: 'Keep up to 90% of everything you earn. Monthly subscriptions, tips, PPV — all yours.',
    },
    {
        icon: '🔒',
        title: 'Privacy First',
        desc: 'Your identity is yours. Geo-blocking, watermarking, and DMCA takedown — built in.',
    },
    {
        icon: '⚡',
        title: 'Instant Payouts',
        desc: 'Request your earnings anytime. Direct bank transfer with no delays.',
    },
    {
        icon: '📊',
        title: 'Deep Analytics',
        desc: 'Understand your fans. Track what content performs best and grow faster.',
    },
    {
        icon: '💬',
        title: 'Direct Messages',
        desc: 'Build real relationships. Sell PPV content inside your DMs.',
    },
    {
        icon: '🌍',
        title: 'Global Audience',
        desc: 'Reach fans from 150+ countries. Multi-currency support built in.',
    },
];

// ── How it works steps ────────────────────────────────────────────────────────
const STEPS = [
    { num: '01', title: 'Sign Up Free', desc: 'Create your account in under 2 minutes. No credit card required.' },
    { num: '02', title: 'Set Your Price', desc: 'Choose your subscription tiers, lock content, and set PPV pricing.' },
    { num: '03', title: 'Post & Earn', desc: 'Share your content, grow your fanbase, and watch your income rise.' },
];

export default function LandingPage() {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const fetchFeed = async () => {
            try {
                const r = await api.get<any[]>('/posts/feed/public');
                setPosts(r.data);
            } catch (err) {
                console.error('Failed to fetch public feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeed();
    }, []);

    return (
        <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-rose-500/30 overflow-x-hidden">

            {/* ── NAVBAR ─────────────────────────────────────────────────── */}
            <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 border-b border-white/10 backdrop-blur-2xl shadow-xl shadow-black/50' : 'bg-transparent'}`}>
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center font-black text-sm shadow-lg shadow-rose-500/40">C</div>
                        <span className="text-xl font-black tracking-tight">
                            Creator<span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Hub</span>
                        </span>
                    </div>

                    {/* Nav links (desktop) */}
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
                        <a href="#feed" className="hover:text-white transition-colors">Explore</a>
                    </div>

                    {/* Auth buttons */}
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="px-4 py-2 text-sm font-medium text-neutral-300 hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link href="/register" className="px-5 py-2 text-sm font-bold bg-gradient-to-r from-rose-600 to-rose-500 rounded-full hover:from-rose-500 hover:to-amber-500 transition-all shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50 hover:scale-105">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── HERO ───────────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Animated gradient orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[120px] animate-pulse [animation-delay:1s]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-900/20 rounded-full blur-[100px]" />
                </div>

                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNNjAgMEgwdjYwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiIHN0cm9rZS13aWR0aD0iLjUiLz48L2c+PC9zdmc+')] opacity-40" />

                <div className="relative z-10 max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold uppercase tracking-widest mb-8 shadow-lg shadow-rose-500/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        The #1 Creator Monetization Platform
                    </div>

                    <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
                        <span className="block text-white">Your Content.</span>
                        <span className="block bg-gradient-to-r from-rose-400 via-rose-500 to-amber-500 bg-clip-text text-transparent py-2">Your Fans.</span>
                        <span className="block text-white">Your Empire.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed">
                        Join <strong className="text-white">10,000+ creators</strong> who are already building a sustainable income. Set your price, share your passion, and earn on your terms.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register?role=CREATOR"
                            className="group px-10 py-4 text-base font-black bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl hover:from-rose-500 hover:to-amber-500 transition-all shadow-xl shadow-rose-600/30 hover:shadow-rose-500/50 hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                            Start Creating Free
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                        <Link
                            href="/register?role=FAN"
                            className="px-10 py-4 text-base font-black border border-white/15 rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all backdrop-blur-sm"
                        >
                            Join as a Fan
                        </Link>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-neutral-500">
                        <span className="flex items-center gap-1.5">✅ Free to sign up</span>
                        <span className="flex items-center gap-1.5">✅ No hidden fees</span>
                        <span className="flex items-center gap-1.5">✅ Instant payouts</span>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600 text-xs animate-bounce">
                    <span>Scroll</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
            </section>

            {/* ── STATS BAR ──────────────────────────────────────────────── */}
            <section className="border-y border-white/5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950">
                <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Active Creators', value: 10000, suffix: '+' },
                        { label: 'Paid Out', value: 5, suffix: 'Cr+' },
                        { label: 'Happy Fans', value: 250000, suffix: '+' },
                        { label: 'Commission Rate', value: 10, suffix: '%' },
                    ].map(s => (
                        <div key={s.label} className="flex flex-col items-center gap-1">
                            <div className="text-4xl font-black bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
                                <Counter to={s.value} suffix={s.suffix} />
                            </div>
                            <div className="text-sm text-neutral-500">{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── FEATURES ───────────────────────────────────────────────── */}
            <section id="features" className="py-28 px-6 relative overflow-hidden">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-900/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block text-xs font-bold uppercase tracking-widest text-rose-500 border border-rose-500/30 rounded-full px-4 py-1 bg-rose-500/5 mb-4">
                            Why CreatorHub?
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
                            Everything you need to
                            <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent"> succeed</span>
                        </h2>
                        <p className="text-neutral-500 max-w-xl mx-auto text-lg">
                            Built for serious creators who want real tools, real privacy, and real earnings.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <div
                                key={f.title}
                                className="group relative p-6 rounded-2xl border border-white/5 bg-white/[0.03] hover:bg-white/[0.06] hover:border-rose-500/20 transition-all duration-300 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-rose-600/0 to-amber-500/0 group-hover:from-rose-600/5 group-hover:to-amber-500/5 transition-all duration-300 rounded-2xl" />
                                <div className="relative">
                                    <div className="text-3xl mb-4">{f.icon}</div>
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-rose-400 transition-colors">{f.title}</h3>
                                    <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
            <section id="how-it-works" className="py-28 px-6 bg-neutral-950/60">
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <div className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 border border-amber-500/30 rounded-full px-4 py-1 bg-amber-500/5 mb-4">
                        Simple as 1-2-3
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight">
                        Start earning in <span className="bg-gradient-to-r from-amber-400 to-rose-500 bg-clip-text text-transparent">minutes</span>
                    </h2>
                </div>

                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connector line */}
                    <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

                    {STEPS.map((step, i) => (
                        <div key={step.num} className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-rose-500/20 transition-all group">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600/20 to-amber-500/10 border border-rose-500/20 flex items-center justify-center text-2xl font-black text-rose-400 mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-rose-500/10">
                                {step.num}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── COMPARISON SECTION ─────────────────────────────────────── */}
            <section className="py-28 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-black tracking-tight mb-4">
                            How we compare to the
                            <span className="bg-gradient-to-r from-rose-400 to-amber-500 bg-clip-text text-transparent"> competition</span>
                        </h2>
                        <p className="text-neutral-500">We built the platform creators actually deserve.</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/[0.04]">
                                    <th className="py-4 px-6 text-left font-semibold text-neutral-400">Feature</th>
                                    <th className="py-4 px-4 text-center font-black text-rose-400">CreatorHub</th>
                                    <th className="py-4 px-4 text-center text-neutral-600">Others</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    ['Platform Commission', '10%', '20–30%'],
                                    ['Instant Payouts', '✅', '❌'],
                                    ['Privacy & Geo-blocking', '✅', '⚠️ Limited'],
                                    ['DMCA Protection', '✅', '⚠️ Slow'],
                                    ['DM Content Sales', '✅', '✅'],
                                    ['Analytics Dashboard', '✅', '⚠️ Basic'],
                                ].map(([feat, us, them], idx) => (
                                    <tr key={feat} className={`border-b border-white/5 ${idx % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                                        <td className="py-4 px-6 text-neutral-300">{feat}</td>
                                        <td className="py-4 px-4 text-center font-semibold text-rose-400">{us}</td>
                                        <td className="py-4 px-4 text-center text-neutral-600">{them}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* ── BIG CTA ────────────────────────────────────────────────── */}
            <section className="py-28 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-950/40 via-black to-amber-950/20 pointer-events-none" />
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-rose-600/15 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative max-w-3xl mx-auto text-center">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                        Ready to turn your<br />
                        <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-amber-400 bg-clip-text text-transparent">passion into profit?</span>
                    </h2>
                    <p className="text-neutral-400 text-lg mb-10">
                        Join thousands of creators who chose independence. Start free, no credit card needed.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/register?role=CREATOR"
                            className="group px-12 py-5 text-lg font-black bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl hover:from-rose-500 hover:to-amber-500 transition-all shadow-2xl shadow-rose-600/30 hover:shadow-rose-500/50 hover:scale-105 inline-flex items-center justify-center gap-2"
                        >
                            Start for Free
                            <span className="group-hover:translate-x-1 transition-transform">🚀</span>
                        </Link>
                        <Link
                            href="/login"
                            className="px-12 py-5 text-lg font-bold border border-white/15 rounded-2xl hover:border-white/40 hover:bg-white/5 transition-all"
                        >
                            Already a member?
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── PUBLIC FEED ────────────────────────────────────────────── */}
            <section id="feed" className="py-20 px-6 bg-neutral-950/50">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-rose-400 mb-2">Live Feed</div>
                            <h2 className="text-3xl font-black tracking-tight">Discover Creators</h2>
                        </div>
                        <Link href="/register" className="text-sm font-semibold text-rose-400 hover:text-rose-300 border border-rose-500/30 hover:border-rose-400/50 px-4 py-2 rounded-full transition-all bg-rose-500/5">
                            See all →
                        </Link>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-24 gap-3">
                            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-neutral-500 text-sm">Loading feed…</span>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="space-y-6">
                            {posts.map((post: any) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col items-center gap-4">
                            <div className="text-5xl">🎭</div>
                            <p className="text-neutral-500 text-base">No public posts yet. Be the first creator to share!</p>
                            <Link href="/register?role=CREATOR" className="mt-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-sm font-bold transition-colors">
                                Start posting
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="border-t border-white/5 bg-neutral-950">
                <div className="max-w-7xl mx-auto px-6 py-14">
                    <div className="flex flex-col md:flex-row justify-between gap-10 mb-10">
                        {/* Brand */}
                        <div className="flex flex-col gap-3 max-w-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center font-black text-sm">C</div>
                                <span className="text-xl font-black">
                                    Creator<span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Hub</span>
                                </span>
                            </div>
                            <p className="text-sm text-neutral-500 leading-relaxed">The next-generation creator monetization platform. Built for independence, privacy, and profit.</p>
                            <div className="flex gap-3 mt-1">
                                {['𝕏', 'IG', 'TG'].map(s => (
                                    <div key={s} className="w-8 h-8 rounded-full border border-white/10 hover:border-rose-500/40 flex items-center justify-center text-xs text-neutral-500 hover:text-white cursor-pointer transition-all">{s}</div>
                                ))}
                            </div>
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm">
                            <div className="flex flex-col gap-3">
                                <div className="font-semibold text-neutral-300 mb-1">Platform</div>
                                <Link href="/register?role=CREATOR" className="text-neutral-500 hover:text-white transition-colors">For Creators</Link>
                                <Link href="/register?role=FAN" className="text-neutral-500 hover:text-white transition-colors">For Fans</Link>
                                <Link href="/login" className="text-neutral-500 hover:text-white transition-colors">Log In</Link>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="font-semibold text-neutral-300 mb-1">Legal</div>
                                <Link href="/terms" className="text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
                                <Link href="/privacy" className="text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
                                <Link href="/content-policy" className="text-neutral-500 hover:text-white transition-colors">Content Policy</Link>
                                <Link href="/refund-policy" className="text-neutral-500 hover:text-white transition-colors">Refund Policy</Link>
                                <Link href="/creator-agreement" className="text-neutral-500 hover:text-white transition-colors">Creator Agreement</Link>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
                        <span>© 2026 CreatorHub. All rights reserved.</span>
                        <span>Made with ❤️ for creators worldwide.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
