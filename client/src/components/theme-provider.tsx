import { useEffect } from 'react';
import { useAppStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.profile.theme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'bull-run', 'crypto-winter');
    
    if (theme === 'dark' || theme === 'light') {
      root.classList.add(theme);
    } else {
      root.classList.add('dark');
      root.classList.add(theme);
    }
  }, [theme]);

  return <>{children}</>;
}
