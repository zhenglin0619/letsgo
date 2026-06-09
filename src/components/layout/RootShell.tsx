'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FAB from './FAB';
import AddTripModal from '@/components/upload/AddTripModal';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import { TripsProvider } from '@/store/tripsContext';

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [addTripOpen, setAddTripOpen] = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const pathname = usePathname();
  const hideFAB = /^\/trips\/.+/.test(pathname);

  function handleSelect(type: 'trip' | 'hotel' | 'restaurant') {
    if (type === 'trip') setAddTripOpen(true);
    else if (type === 'restaurant') setAddRestaurantOpen(true);
  }

  return (
    <TripsProvider>
      <Navbar />
      {children}
      {!hideFAB && <FAB onSelect={handleSelect} />}
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <AddRestaurantModal open={addRestaurantOpen} onClose={() => setAddRestaurantOpen(false)} />
    </TripsProvider>
  );
}
