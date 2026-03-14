'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes

export default function SessionManager() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const logout = () => {
        console.log('Logging out due to inactivity...');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        // Clear all session related data
        window.location.href = '/login';
    };

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        // Only set timer if user is logged in
        if (typeof window !== 'undefined' && localStorage.getItem('accessToken')) {
            timerRef.current = setTimeout(logout, INACTIVITY_LIMIT);
        }
    };

    useEffect(() => {
        // Events to track activity
        const events = [
            'mousedown', 'mousemove', 'keypress', 
            'scroll', 'touchstart', 'click'
        ];

        const handleActivity = () => resetTimer();

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, handleActivity);
        });

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, []);

    return null; // This is a logic-only component
}
