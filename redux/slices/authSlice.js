import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAuthCookie } from '@/utils/cookies';
import toast from 'react-hot-toast';
import { removeAuthCookie } from '@/utils/cookies';
import {api} from '../../services/authService';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginPending: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    setLoginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    setLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoginError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const { setLoginPending, setLoginSuccess, setLogout, setLoginError } = authSlice.actions;

// Define the async thunk for fetching user details
export const fetchUserDetails = createAsyncThunk(
  'auth/fetchUserDetails',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      const token = getAuthCookie();
      if (!token) {
        // No token found, user is not authenticated
        // No need to remove cookie if it wasn't there
        dispatch(authSlice.actions.setLogout()); // Clear any lingering state
        // Optionally show a message if desired, but typically no cookie means no prior successful login
        // toast.error('Authentication token not found.');
        return rejectWithValue('No authentication token found');
      }

      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      console.log('Response:', response);

      // Axios automatically parses JSON if the response is valid
      const data = response.data; // Data is directly in response.data

      // If response is OK, dispatch success
      console.log('User details fetched successfully:', data);
      dispatch(authSlice.actions.setLoginSuccess({ user: data, token: token }));

      return data; // Return user data

    } catch (error) {
      // Handle network or other errors
      console.error('Error fetching user details:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Network error';
      toast.error(`Failed to fetch user details: ${errorMessage}`);
      removeAuthCookie(); // Remove cookie on any fetch error
      dispatch(authSlice.actions.setLogout()); // Clear auth state on any error
      return rejectWithValue(errorMessage);
    }
  }
);

export default authSlice.reducer;
