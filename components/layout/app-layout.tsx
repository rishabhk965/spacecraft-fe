import { ReactNode } from 'react';
import { AppFooter } from './app-footer';
import { AppHeader } from './app-header';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <AppHeader />
      <main className="min-h-0 flex-1 transition-opacity duration-200">{children}</main>
      <AppFooter />
    </div>
  );
}
