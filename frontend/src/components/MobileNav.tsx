'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home, Compass, Heart, MessageSquare, Wallet as WalletIcon
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';

interface MobileNavProps {
    role: 'FAN' | 'CREATOR';
}

const FAN_LINKS = [
    { href: '/fan/feed', icon: Home, label: 'Home' },
    { href: '/fan/discover', icon: Compass, label: 'Discover' },
    { href: '/fan/subscriptions', icon: Heart, label: 'Subs' },
    { href: '/fan/messages', icon: MessageSquare, label: 'Chat' },
    { href: '/fan/wallet', icon: WalletIcon, label: 'Wallet' },
];

const CREATOR_LINKS = [
    { href: '/creator/dashboard', icon: Home, label: 'Home' },
    { href: '/creator/posts', icon: Compass, label: 'Posts' },
    { href: '/creator/create', icon: Heart, label: 'Create' },
    { href: '/creator/messages', icon: MessageSquare, label: 'Chat' },
    { href: '/creator/earnings', icon: WalletIcon, label: 'Earn' },
];

export default function MobileNav({ role }: MobileNavProps) {
    const pathname = usePathname();
    const { balance } = useWallet();
    const links = role === 'FAN' ? FAN_LINKS : CREATOR_LINKS;

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
            <div className="flex items-center justify-around px-2 py-2">
                {links.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname === href || pathname.startsWith(href + '/');
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all min-w-[56px] ${
                                isActive ? 'text-rose-500' : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            <div className={`relative p-2 rounded-2xl transition-all ${isActive ? 'bg-rose-500/15' : ''}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {/* Balance indicator on wallet tab */}
                                {href.includes('wallet') && role === 'FAN' && (
                                    <span className="absolute -top-1 -right-1 text-[9px] bg-rose-500 text-white font-black px-1 rounded-full min-w-[18px] text-center">
                                        ₹
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-black tracking-wide ${isActive ? 'text-rose-500' : ''}`}>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
