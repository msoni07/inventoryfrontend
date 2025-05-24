import axios from 'axios';

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

export const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(`${API_URL}/auth/login`, credentials);
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
