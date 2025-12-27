import { createTheme } from '@mui/material/styles';

// Shared theme used by both the app and Toolpad components.
// Uses MUI's CSS variables + color schemes so we can toggle light/dark via `useColorScheme()`.
export const appTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Iransans , Roboto',
  },
  cssVariables: {
    // Default selector used by MUI's color scheme system (kept explicit for clarity).
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  colorSchemes: {
    light: {
      palette: {
        mode: 'light',
        primary: { main: '#1976d2' },
        background: { default: '#f5f5f5' },
      },
    },
    dark: {
      palette: {
        mode: 'dark',
        primary: { main: '#90caf9' },
        background: { default: '#0b1220', paper: '#0f172a' },
      },
    },
  },
});


