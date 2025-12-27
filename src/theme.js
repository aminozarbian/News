import { createTheme } from '@mui/material/styles';

// Shared theme used by both the app and Toolpad components.
export const appTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Iransans , Roboto',
  },
  cssVariables: {
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


