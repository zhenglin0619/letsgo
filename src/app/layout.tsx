import type { Metadata } from 'next';
import './globals.css';
import RootShell from '@/components/layout/RootShell';

export const metadata: Metadata = {
  title: "LET'S GO — Your Travel Chronicle",
  description: 'A premium journal for your dining and hotel footprint across the world.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full bg-[#FBFBFA]">
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
