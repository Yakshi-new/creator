import Link from 'next/link';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-rose-500/30">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="text-2xl font-black bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">
                        CREATOR HUB
                    </div>
                    <div className="flex gap-4">
                        <Link href="/login" className="px-4 py-2 text-sm font-medium hover:text-rose-500 transition-colors">
                            Login
                        </Link>
                        <Link href="/register" className="px-6 py-2 text-sm font-bold bg-white text-black rounded-full hover:bg-rose-500 hover:text-white transition-all">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-8">
                        YOUR CONTENT. <br />
                        <span className="bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">YOUR FANS.</span> <br />
                        YOUR EMPIRE.
                    </h1>
                    <p className="max-w-2xl text-lg md:text-xl text-neutral-400 mb-12">
                        The ultimate platform for creators to monetize their passion. Complete privacy, secure payouts, and direct connection with your community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <Link href="/register?role=CREATOR" className="px-10 py-5 text-lg font-black bg-rose-600 rounded-2xl hover:bg-rose-700 hover:scale-105 transition-all shadow-xl shadow-rose-600/20">
                            STARE CREATING
                        </Link>
                        <Link href="/register?role=FAN" className="px-10 py-5 text-lg font-black border-2 border-white/20 rounded-2xl hover:border-white transition-all">
                            JOIN AS A FAN
                        </Link>
                    </div>
                </div>

                {/* Floating cards / visual fluff */}
                <div className="relative mt-20 max-w-5xl mx-auto h-[400px] overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-b from-neutral-900 to-black">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80')] opacity-20 bg-cover bg-center mix-blend-overlay"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10 text-left">
                        <div className="text-3xl font-black mb-2">PROFITABLE CONTENT</div>
                        <p className="text-neutral-400">Earn from subscriptions, tips, and pay-per-view posts with industry low commission.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-white/5 py-10 px-6 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500 gap-6">
                    <div>&copy; 2026 CREATOR HUB. All rights reserved.</div>
                    <div className="flex gap-8">
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/dmca" className="hover:text-white transition-colors">DMCA</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
