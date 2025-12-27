import './styles/globals.css';
import MuiProvider from '@/components/MuiProvider';
import AppFrame from '@/components/AppFrame';
import InitColorSchemeScript from '@mui/material/InitColorSchemeScript';

export const metadata = {
  title: 'News App',
  description: 'A MERN Next.js News App',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <InitColorSchemeScript attribute="data-mui-color-scheme" modeStorageKey="mui-mode" defaultMode="system" />
        <MuiProvider>
          <AppFrame>{children}</AppFrame>
        </MuiProvider>
      </body>
    </html>
  );
}
