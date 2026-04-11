import { ReactNode } from 'react';
import MobileNav from '../../components/MobileNav';
import DesktopSidebar from '../../components/Sidebar';

export default function FanLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex h-screen bg-black">
            {/* Desktop Sidebar - hidden on mobile */}
            <div className="hidden md:block shrink-0">
                <DesktopSidebar role="FAN" />
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                {children}
            </main>

            {/* Mobile Bottom Nav - only on mobile */}
            <div className="md:hidden">
                <MobileNav role="FAN" />
            </div>
        </div>
    );
}