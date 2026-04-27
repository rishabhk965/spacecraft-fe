import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import { AppLayout } from '@/components/layout/app-layout';
import { MuiThemeProvider } from '@/components/mui-theme-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpaceCraft.ai',
  description: 'AI-powered theme-based 3D interior design',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider>
          <MuiThemeProvider>
            <AppLayout>{children}</AppLayout>
          </MuiThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
