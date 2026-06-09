'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FAB from './FAB';
import AddTripModal from '@/components/upload/AddTripModal';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import AuthModal from '@/components/auth/AuthModal';
import { TripsProvider, useTrips } from '@/store/tripsContext';

function Shell({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useTrips();
  const [addTripOpen, setAddTripOpen]           = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const pathname = usePathname();
  const hideFAB  = /^\/trips\/.+/.test(pathname);

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#FBF9F6' }}>
        <div className="flex flex-col items-center gap-3">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none" className="animate-pulse">
            <defs>
              <radialGradient id="load-bg" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#2E2E2E"/>
                <stop offset="100%" stopColor="#111111"/>
              </radialGradient>
            </defs>
            <rect width="40" height="40" rx="11" fill="url(#load-bg)"/>
            <circle cx="20" cy="20" r="13" fill="none" stroke="#C87A53" strokeWidth="1.3" opacity="0.85"/>
            <line x1="7" y1="20" x2="33" y2="20" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>
            <path d="M9 14.5 Q20 12 31 14.5" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>
            <path d="M9 25.5 Q20 28 31 25.5" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>
            <path d="M20 7 Q24.5 13.5 24.5 20 Q24.5 26.5 20 33" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>
            <line x1="15" y1="25" x2="25" y2="15" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M25 15 L20.5 15 M25 15 L25 19.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="14.5" cy="25.5" r="2" fill="#C87A53"/>
            <circle cx="25.5" cy="14.5" r="1.9" fill="white"/>
            <circle cx="25.5" cy="14.5" r="0.85" fill="#C87A53"/>
          </svg>
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#C87A53]">Loading</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthModal />;

  function handleSelect(type: 'trip' | 'hotel' | 'restaurant') {
    if (type === 'trip') setAddTripOpen(true);
    else if (type === 'restaurant') setAddRestaurantOpen(true);
  }

  return (
    <>
      <Navbar />
      {children}
      {!hideFAB && <FAB onSelect={handleSelect} />}
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <AddRestaurantModal open={addRestaurantOpen} onClose={() => setAddRestaurantOpen(false)} />
    </>
  );
}

export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <TripsProvider>
      <Shell>{children}</Shell>
    </TripsProvider>
  );
}
