'use client';

import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { setLoginPending, setLoginSuccess, setLoginError, setLogout } from '@/redux/slices/authSlice';
import { loginUser } from '@/services/authService';
import type { RootState, AppDispatch } from '@/redux/store'; // Assuming you have these types in your store setup
import { LogIn, Mail, KeyRound } from 'lucide-react';

// Validation Schema
const schema = yup.object().shape({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

// Form Values Interface
interface FormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { isLoading, isAuthenticated, error: authError } = useSelector((state: RootState) => state.auth);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    dispatch(setLoginPending());
    setApiError(null);
    try {
      const response = await loginUser(data);
      localStorage.setItem('token', response.token);
      // Optionally, store user data in localStorage if needed, but Redux state is primary
      // localStorage.setItem('user', JSON.stringify(response.user));
      dispatch(setLoginSuccess({ user: response.user, token: response.token }));
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.message || 'An unexpected error occurred.';
      dispatch(setLoginError(errorMessage));
      setApiError(errorMessage);
      // Clear token and user from localStorage if login fails and they were somehow set
      localStorage.removeItem('token');
      // localStorage.removeItem('user'); // if you were storing user
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
        <div className="text-center mb-8">
          <LogIn className="mx-auto text-blue-600 h-12 w-12 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back!</h1>
          <p className="text-gray-600 mt-2">Sign in to access your inventory dashboard.</p>
        </div>

        {apiError && (
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            <p>{apiError}</p>
          </div>
        )}
        {authError && !apiError && ( // Display Redux error if no specific API error is set (e.g., from previous attempts)
          <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
            <p>{authError}</p>
          </div>
        )}


        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`mt-1 block w-full pl-10 pr-3 py-2.5 border ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm placeholder-gray-400`}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                {...register('password')}
                className={`mt-1 block w-full pl-10 pr-3 py-2.5 border ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm sm:text-sm placeholder-gray-400`}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
