import { createSlice } from '@reduxjs/toolkit';

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
export default authSlice.reducer;
