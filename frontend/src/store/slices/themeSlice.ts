import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
}

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const applyThemeToDocument = (theme: ThemeMode) => {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(theme);
  root.style.colorScheme = theme;
};

const initialTheme = getInitialTheme();

const initialState: ThemeState = {
  theme: initialTheme,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
      applyThemeToDocument(action.payload);
    },
    toggleTheme: (state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = next;
      localStorage.setItem('theme', next);
      applyThemeToDocument(next);
    },
  },
});

if (typeof window !== 'undefined') {
  applyThemeToDocument(initialTheme);
}

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
