'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    Home,
    User,
    MessageSquare,
    Heart,
    Settings,
    TrendingUp,
    PlusCircle,
    LogOut,
    Wallet as WalletIcon,
    ShieldAlert,
    LayoutDashboard,
    Plus,
    FileText,
    CreditCard,
    Shield
} from 'lucide-react';
import { useWallet } from '@/context/WalletContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import api from '@/lib/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface SidebarProps {
    role: 'FAN' | 'CREATOR' | 'ADMIN';
}

export default function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { balance, addFunds } = useWallet();

    const fanLinks = [
        { label: 'Home Feed', href: '/fan/feed', icon: Home },
        { label: 'Discover', href: '/fan/discover', icon: TrendingUp },
        { label: 'Messages', href: '/fan/messages', icon: MessageSquare },
        { label: 'Subscriptions', href: '/fan/subscriptions', icon: Heart },
        { label: 'Wallet', href: '/fan/wallet', icon: WalletIcon },
        { label: 'Settings', href: '/fan/settings', icon: Settings },
    ];

    const creatorLinks = [
        { label: 'Dashboard', href: '/creator/dashboard', icon: LayoutDashboard },
        { label: 'My Posts', href: '/creator/posts', icon: Home },
        { label: 'Create Post', href: '/creator/create', icon: PlusCircle },
        { label: 'Messages', href: '/creator/messages', icon: MessageSquare },
        { label: 'Earnings', href: '/creator/earnings', icon: WalletIcon },
        { label: 'Explore Feed', href: '/creator/explore', icon: TrendingUp },
        { label: 'Profile Settings', href: '/creator/settings', icon: User },
    ];

    const adminLinks = [
        { label: 'Platform Stats', href: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Revenue & Fees', href: '/admin/revenue', icon: WalletIcon },
        { label: 'Withdrawals', href: '/admin/withdrawals', icon: CreditCard },
        { label: 'Creators', href: '/admin/creators', icon: User },
        { label: 'Fans', href: '/admin/fans', icon: Heart },
        { label: 'Manage Content', href: '/admin/content', icon: FileText },
        { label: 'KYC Checks', href: '/admin/kyc', icon: Shield },
        { label: 'Moderation', href: '/admin/moderation', icon: ShieldAlert },
    ];

    const links = role === 'CREATOR' ? creatorLinks : role === 'ADMIN' ? adminLinks : fanLinks;

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        router.push('/login');
    };

    const handleAddFunds = async () => {
        const amount = prompt('Enter amount to add:');
        if (amount && !isNaN(Number(amount))) {
            try {
                await addFunds(Number(amount));
                alert('Funds added successfully!');
            } catch (err) {
                alert('Failed to add funds.');
            }
        }
    };

    return (
        <div className="w-64 h-full border-r border-white/5 flex flex-col p-6 bg-black">
            <div className="text-xl font-black mb-10 bg-gradient-to-tr from-rose-500 to-amber-500 bg-clip-text text-transparent">
                CREATOR HUB
            </div>

            <div className="flex-1 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all",
                                isActive
                                    ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                                    : "text-neutral-500 hover:text-white hover:bg-neutral-900"
                            )}
                        >
                            <Icon size={20} />
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            <div className="mt-auto space-y-4">
                {/* My Balance — only visible for fan users */}
                {role === 'FAN' && (
                    <div className="bg-neutral-900/50 border border-white/5 rounded-3xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-black text-neutral-500 tracking-widest uppercase">My Balance</div>
                            <WalletIcon size={14} className="text-rose-500" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="text-xl font-black text-white">₹{balance.toFixed(2)}</div>
                            <button
                                onClick={handleAddFunds}
                                className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg transition-all"
                            >
                                <Plus size={16} className="text-white" />
                            </button>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold text-neutral-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                >
                    <LogOut size={20} />
                    Log Out
                </button>

                {role === 'FAN' && (
                    <button
                        onClick={async () => {
                            if (confirm('Are you ready to become a creator? You will be able to post content and earn money.')) {
                                try {
                                    await api.post('/creators/upgrade');
                                    alert('Success! You are now a creator.');
                                    // Logout and redirect to login to refresh token with new role
                                    localStorage.removeItem('accessToken');
                                    router.push('/login');
                                } catch (err: any) {
                                    const errorMessage = err.response?.data?.message || 'Upgrade failed. Please try again.';
                                    alert(errorMessage);
                                }
                            }
                        }}
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-black bg-gradient-to-tr from-rose-500 to-amber-500 text-white shadow-xl shadow-rose-500/20 hover:scale-[1.02] transition-all"
                    >
                        <TrendingUp size={18} />
                        BECOME A CREATOR
                    </button>
                )}
            </div>
        </div>
    );
}
