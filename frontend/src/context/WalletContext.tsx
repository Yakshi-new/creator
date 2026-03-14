'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

interface WalletContextType {
    balance: number;
    loading: boolean;
    fetchBalance: () => Promise<void>;
    addFunds: (amount: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchBalance = async () => {
        try {
            const { data } = await api.get('/wallet/balance') as { data: { balance: number } };
            setBalance(data.balance);
        } catch (err) {
            console.error('Fetch balance error:', err);
        } finally {
            setLoading(false);
        }
    };

    const addFunds = async (amount: number) => {
        try {
            const { data } = await api.post('/wallet/add', { amount }) as { data: { balance: number } };
            setBalance(data.balance);
        } catch (err) {
            console.error('Add funds error:', err);
            throw err;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) fetchBalance();
    }, []);

    return (
        <WalletContext.Provider value={{ balance, loading, fetchBalance, addFunds }}>
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}
