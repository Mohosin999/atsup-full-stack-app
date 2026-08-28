import { useEffect } from 'react';
import { useAppSelector } from '../hooks/redux';
import { useDispatch } from 'react-redux';
import { setTheme } from '../store/slices/themeSlice';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const theme = useAppSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setTheme(theme));
  }, [theme, dispatch]);

  return <>{children}</>;
}
