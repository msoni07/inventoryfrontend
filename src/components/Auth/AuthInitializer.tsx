'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getAuthCookie } from '@/utils/cookies';
import { setLoginSuccess } from '@/redux/slices/authSlice';

const AuthInitializer = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const token = getAuthCookie();
        if (token) {
            // Assuming you have an endpoint to get user data from token
            // For now, we'll just set isAuthenticated to true if a token exists
            // In a real app, you'd likely dispatch an action to fetch user data based on the token
            dispatch(setLoginSuccess({ token: token, user: null })); // Dispatching with user: null for now
        }
    }, [dispatch]);

    return null; // This component doesn't render anything
};

export default AuthInitializer; 