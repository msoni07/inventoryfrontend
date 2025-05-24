'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/redux/store';
import React from 'react';

// Optional: Define a simple loading component
const AuthLoading = () => (
    <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-700">Loading session...</p>
        </div>
    </div>
);

export default function withAuthGuard<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const AuthComponent = (props: P) => {
        const router = useRouter();
        const { isAuthenticated, isLoading: authSliceLoading } = useSelector((state: RootState) => state.auth);

        useEffect(() => {
            if (!authSliceLoading && !isAuthenticated) {
                router.replace('/login');
            }
        }, [authSliceLoading, isAuthenticated, router]);

        if (authSliceLoading) {
            return <AuthLoading />;
        }

        if (!isAuthenticated) {
            return <AuthLoading />;
        }

        return <WrappedComponent {...props} />;
    };

    AuthComponent.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthComponent;
} 