import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpaceCraft.ai',
  description: 'AI-powered theme-based 3D interior design',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
