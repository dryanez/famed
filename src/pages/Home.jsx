import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/api/entities';
import { createPageUrl } from '@/utils';
import PublicHero from '../components/hero/PublicHero';

export default function HomePage() {
    const navigate = useNavigate();
    const [authStatus, setAuthStatus] = useState('loading');

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Skip API call for local development - show hero page directly
                setAuthStatus('unauthenticated');
            } catch (error) {
                setAuthStatus('unauthenticated');
            }
        };

        checkAuth();
    }, [navigate]);

    // Show loading while checking authentication
    if (authStatus === 'loading') {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500"></div>
            </div>
        );
    }

    // Show hero page for non-authenticated users
    return <PublicHero />;
}