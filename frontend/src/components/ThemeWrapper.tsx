import { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add('light');
  }, []);

  return <>{children}</>;
}
