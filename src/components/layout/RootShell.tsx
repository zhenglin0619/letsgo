'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FAB from './FAB';
import AddTripModal from '@/components/upload/AddTripModal';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import AddHotelModal from '@/components/upload/AddHotelModal';
import AuthModal from '@/components/auth/AuthModal';
import { TripsProvider, useTrips } from '@/store/tripsContext';

function Shell({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useTrips();
  const [addTripOpen, setAddTripOpen]           = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen]         = useState(false);
  const pathname = usePathname();
  const hideFAB  = /^\/trips\/.+/.test(pathname);
  const mountedAtRef = useRef(Date.now());

  // A tab left open for hours can get frozen or discarded by the browser; on
  // resuming, the in-page auth bootstrap (and its own fallback timer) may
  // never get a chance to run, leaving the splash stuck indefinitely. If the
  // tab is still stuck here a while after mount AND the user comes back to
  // it, a hard reload is the only reliable way to recover.
  useEffect(() => {
    if (!authLoading) return;
    function recover() {
      if (document.visibilityState === 'visible' && Date.now() - mountedAtRef.current > 8000) {
        window.location.reload();
      }
    }
    document.addEventListener('visibilitychange', recover);
    window.addEventListener('focus', recover);
    window.addEventListener('pageshow', recover);
    return () => {
      document.removeEventListener('visibilitychange', recover);
      window.removeEventListener('focus', recover);
      window.removeEventListener('pageshow', recover);
    };
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--canvas)' }}>
        <div className="flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Logo" width={72} height={72} className="object-contain animate-pulse" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#C87A53]">Loading</span>
        </div>
      </div>
    );
  }

  if (!user) return <AuthModal />;

  function handleSelect(type: 'trip' | 'hotel' | 'restaurant') {
    if (type === 'trip') setAddTripOpen(true);
    else if (type === 'restaurant') setAddRestaurantOpen(true);
    else if (type === 'hotel') setAddHotelOpen(true);
  }

  return (
    <>
      <Navbar />
      {children}
      {!hideFAB && <FAB onSelect={handleSelect} />}
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <AddRestaurantModal open={addRestaurantOpen} onClose={() => setAddRestaurantOpen(false)} />
      <AddHotelModal open={addHotelOpen} onClose={() => setAddHotelOpen(false)} />
    </>
  );
}

function AppearanceSync() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function sync(e: MediaQueryListEvent) {
      if (localStorage.getItem('appearance') === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    }
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return null;
}

export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <TripsProvider>
      <AppearanceSync />
      <Shell>{children}</Shell>
    </TripsProvider>
  );
}
