import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import RootShell from '@/components/layout/RootShell';

export const metadata: Metadata = {
  title: "LET'S GO",
  description: 'A personal travel journal for your trips, restaurants and hotel stays.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#FBF9F6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full">
        <Script src="/theme-init.js" strategy="beforeInteractive" />
        <Script src="/boot-watchdog.js" strategy="beforeInteractive" />
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
