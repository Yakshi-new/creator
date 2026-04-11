'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Scale, Info } from 'lucide-react';

export default function PolicyLayout({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white font-sans">
            <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/50 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-sm font-black text-neutral-400 hover:text-white transition-all group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        BACK TO HOME
                    </Link>
                    <div className="text-xl font-black bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">
                        CREATOR HUB
                    </div>
                    <div className="w-24"></div> {/* Spacer */}
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight mb-4">{title}</h1>
                    <div className="flex items-center gap-4 text-neutral-500 text-sm font-bold">
                        <span className="px-3 py-1 bg-white/5 rounded-full">Last Updated: March 2026</span>
                        <span className="flex items-center gap-1"><Shield size={14} className="text-emerald-500" /> Compliance Verified</span>
                    </div>
                </div>

                <div className="bg-neutral-900/50 border border-white/10 rounded-[2.5rem] p-10 md:p-16 prose prose-invert max-w-none">
                    {children}
                </div>

                <footer className="mt-20 pt-10 border-t border-white/10 text-center">
                    <p className="text-neutral-500 text-sm mb-4 font-medium">Questions about our policies? Contact us at legal@creatorhub.com</p>
                    <Link href="/register" className="inline-block px-8 py-4 bg-white text-black rounded-2xl font-black hover:bg-rose-500 hover:text-white transition-all shadow-xl shadow-rose-500/10">
                        GET STARTED NOW
                    </Link>
                </footer>
            </main>
        </div>
    );
}
