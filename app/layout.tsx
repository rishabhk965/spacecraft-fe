import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SpaceCraft.ai',
  description: 'AI-powered theme-based 3D interior design',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
