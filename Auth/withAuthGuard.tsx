'use client';

import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/redux/store';
import React from 'react';
import { getAuthCookie } from '@/utils/cookies';
import { fetchUserDetails } from '@/redux/slices/authSlice';
import { useAppDispatch } from '@/redux/store';

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
        const { isAuthenticated, isLoading: authSliceLoading, user } = useSelector((state: RootState) => state.auth);
        const isAuthCookiePresent = getAuthCookie();

        const dispatch = useAppDispatch();

        // Add a ref to track if the initial fetch has been attempted
        const initialFetchAttempted = useRef(false);

        useEffect(() => {
            // Only attempt to fetch user details if a token is present,
            // the initial fetch hasn't been attempted yet, and we are not already authenticated
            // (in case Redux state persisted or rehydrated before the effect runs).
            if (isAuthCookiePresent && !initialFetchAttempted.current && !isAuthenticated && !authSliceLoading) {
                initialFetchAttempted.current = true; // Mark that the initial fetch has been attempted
                dispatch(fetchUserDetails());
            }

            // Redirect if not authenticated AND auth state has been determined AND we are not currently loading.
            // The additional check for !isAuthCookiePresent handles cases where the cookie is removed.
            if (!authSliceLoading && !isAuthenticated && !isAuthCookiePresent) {
                console.log('Redirecting to login...');
                router.replace('/login'); // Use replace to avoid adding to history stack
            }
            // If isAuthenticated becomes true and user data is available, and we are not loading, it means auth is complete.
            // No explicit action needed here, rendering happens below.

        }, [isAuthenticated, authSliceLoading, isAuthCookiePresent, router, dispatch]); // Keep minimal necessary dependencies

        // If auth state is still being determined (initial check or API call) OR if auth cookie exists but isAuthenticated is false (rehydrating) AND we are loading
        if (authSliceLoading || (isAuthCookiePresent && !isAuthenticated)) {
            console.log('Showing loading spinner...');
            return <AuthLoading />;
        }

        // If authenticated, render the wrapped component
        if (isAuthenticated && user) {
            console.log('Rendering protected component...');
            return <WrappedComponent {...props} />;
        }

        // This case should ideally not be hit if the logic is correct, but as a fallback,
        // if not authenticated, not loading, and no redirect has happened, show loading or null.
        // Given the redirect logic, this might indicate an issue, but for robustness,
        // let's return loading as a safe default state if somehow auth check fails.
        console.log('Fallback: Showing loading spinner...');
        return <AuthLoading />;
    };

    AuthComponent.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

    return AuthComponent;
} 