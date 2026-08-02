import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/api';
import { User } from '../../types';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

const loadUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};

const initialState: AuthState = {
  user: loadUserFromStorage(),
  loading: true,
  isAuthenticated: !!loadUserFromStorage(),
};

// Token refresh thunk - refreshes access token using refresh token
export const tokenRefresh = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/refresh');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh token');
    }
  }
);

export const fetchUser = createAsyncThunk<User | null, void, { rejectValue: string }>(
  'auth/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.data;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error: any) {
      localStorage.removeItem('user');
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
    } catch (error: any) {
      console.error('Logout error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to logout');
    } finally {
      localStorage.removeItem('user');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state) => {
      window.location.href = `${API_URL}/auth/google`;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setUserCredits: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.subscription.credits = action.payload;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUser
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      // tokenRefresh
      .addCase(tokenRefresh.rejected, (state) => {
        // Clear user data if refresh fails
        state.user = null;
        state.isAuthenticated = false;
        localStorage.removeItem('user');
      });
  },
});

export const { login, clearUser, setUser, setUserCredits } = authSlice.actions;
export default authSlice.reducer;
