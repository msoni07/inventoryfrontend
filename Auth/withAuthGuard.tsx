'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/redux/store';
import React from 'react';
import { getAuthCookie } from '@/utils/cookies';

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
        const isAuthCookiePresent = getAuthCookie();

        useEffect(() => {
            // Redirect if not authenticated AND auth state has been determined
            // Also redirect if there's no auth cookie but Redux state says isAuthenticated (shouldn't happen with correct flow)
            if (!authSliceLoading && !isAuthenticated && !isAuthCookiePresent) {
                router.replace('/login'); // Use replace to avoid adding to history stack
            }
        }, [authSliceLoading, isAuthenticated, isAuthCookiePresent, router]);

        // If auth state is still being determined (initial check or API call) OR if auth cookie exists but isAuthenticated is false (rehydrating)
        if (authSliceLoading || (isAuthCookiePresent && !isAuthenticated)) {
            return <AuthLoading />;
        }

        // If authenticated, render the wrapped component
        if (isAuthenticated) {
            return <WrappedComponent {...props} />;
        }

        // If not authenticated and not loading, this case might be hit briefly before useEffect redirects
        // We can also return loading here or null, depending on desired behavior before redirect
        return <AuthLoading />;
    };

    AuthComponent.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthComponent;
} 