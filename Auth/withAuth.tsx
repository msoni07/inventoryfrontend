'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import type { RootState } from '@/redux/store'; // Adjust path as needed
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

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, isLoading: authSliceLoading } = useSelector((state: RootState) => state.auth);
    
    // Consider a local loading state if needed, or rely on authSliceLoading
    // For now, authSliceLoading refers to API call loading.
    // A more robust solution might involve a separate "app loading" or "auth rehydration" flag.
    // We'll use authSliceLoading for now as per the prompt's guidance.

    useEffect(() => {
      // If not loading (initial check or API call finished) and not authenticated, redirect.
      if (!authSliceLoading && !isAuthenticated) {
        router.replace('/login'); // Use replace to avoid adding to history stack
      }
    }, [authSliceLoading, isAuthenticated, router]);

    // If auth state is still being determined (e.g. an initial check)
    // OR if an API call (like login) is in progress
    if (authSliceLoading) {
      return <AuthLoading />;
    }

    // If not authenticated and not loading, user will be redirected by the useEffect.
    // While redirecting, show loading.
    if (!isAuthenticated) {
      return <AuthLoading />; 
    }

    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set a display name for easier debugging in React DevTools
  AuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return AuthComponent;
}
