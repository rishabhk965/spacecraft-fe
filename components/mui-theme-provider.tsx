'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';

const muiTheme = createTheme({
  typography: {
    fontFamily: 'inherit',
  },
  palette: {
    primary: {
      main: '#0f172a',
    },
  },
  shape: {
    borderRadius: 18,
  },
});

export function MuiThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
}
