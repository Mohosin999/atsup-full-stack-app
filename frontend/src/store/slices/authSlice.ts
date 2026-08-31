import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { setTokens, clearTokens, getRefreshToken } from '../../api/api';
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
      const refreshToken = getRefreshToken();
      if (!refreshToken) return rejectWithValue('No refresh token');
      const res = await api.post('/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });
      const { accessToken, refreshToken: newRefreshToken } = res.data?.data || {};
      if (accessToken && newRefreshToken) {
        setTokens(accessToken, newRefreshToken);
        console.log("[authSlice] tokenRefresh success");
      } else if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        console.log("[authSlice] tokenRefresh success (access only)");
      }
    } catch (error: any) {
      console.error("[authSlice] tokenRefresh failed:", error.response?.data || error.message);
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
      const refreshToken = getRefreshToken();
      await api.post('/auth/logout', {}, {
        headers: refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {},
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to logout');
    } finally {
      localStorage.removeItem('user');
      clearTokens();
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
      clearTokens();
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
    // FIXME: not yet used in this app
    setUserAiScanState: (
      state,
      action: PayloadAction<{ credits: number; lastAiScanResetDate: string }>,
    ) => {
      if (state.user) {
        state.user.subscription.credits = action.payload.credits;
        state.user.subscription.lastAiScanResetDate =
          action.payload.lastAiScanResetDate;
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
      // logoutUser — optimistic: clear instantly on pending, keep cleared on fulfilled/rejected
      .addCase(logoutUser.pending, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
      })
      // tokenRefresh
      .addCase(tokenRefresh.rejected, (state) => {
        // Silent background refresh failed - keep the user logged in.
        // Logout only happens when an actual request 401s and its
        // refresh retry also fails (handled by the api interceptor).
      });
  },
});

export const { login, clearUser, setUser, setUserCredits, setUserAiScanState } = authSlice.actions;
export default authSlice.reducer;
