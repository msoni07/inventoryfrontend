import axios from 'axios';
import { getAuthCookie } from '@/utils/cookies';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface LoginCredentials {
  email: string;
  password: string;
}

// Define a type for the expected successful response data
interface LoginResponse {
  token: string;
  user: any; // Replace 'any' with a more specific user type if available
  // Add other expected properties from the backend response
}

// Define a type for the expected error response data
interface ErrorResponse {
  message: string;
  // Add other potential error properties
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = getAuthCookie();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Assuming the backend sends an error response with a 'message' property
      const errorData = error.response.data as ErrorResponse;
      throw new Error(errorData.message || 'Login failed');
    }
    throw new Error('An unexpected error occurred during login.');
  }
};

// Add a function to check auth status
export const checkAuthStatus = async () => {
  try {
    const token = getAuthCookie();
    if (!token) return false;
    
    const response = await api.get('/auth/verify'); // Assuming a backend endpoint to verify token
    return response.data.isValid;
  } catch (error) {
    return false;
  }
};
