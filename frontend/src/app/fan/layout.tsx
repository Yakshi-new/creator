'use client';

import { ReactNode, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

export default function FanLayout({ children }: { children: ReactNode }) {

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

            {/* Left Sidebar */}
            <Sidebar role="FAN" />

            {/* Main Page Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

        </div>
    );
}