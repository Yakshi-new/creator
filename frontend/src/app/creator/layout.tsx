'use client';

import { ReactNode, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import MobileNav from '../../components/MobileNav';

export default function CreatorLayout({ children }: { children: ReactNode }) {

    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    return (
        <div className="flex h-screen bg-black">
            {/* Desktop Sidebar */}
            <div className="hidden md:block shrink-0">
                <Sidebar role="CREATOR" />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden">
                <MobileNav role="CREATOR" />
            </div>
        </div>
    );
}