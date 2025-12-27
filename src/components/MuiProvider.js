'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';
import { appTheme } from '@/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { usePathname } from 'next/navigation';

export default function MuiProvider({ children }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  return (
    <AppRouterCacheProvider options={{ key: 'muirtl', stylisPlugins: [prefixer, rtlPlugin] }}>
      {isDashboard ? (
        children
      ) : (
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      )}
    </AppRouterCacheProvider>
  );
}
