'use client';
import { useState } from 'react';
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

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: '#FBF9F6' }}>
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

export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <TripsProvider>
      <Shell>{children}</Shell>
    </TripsProvider>
  );
}
