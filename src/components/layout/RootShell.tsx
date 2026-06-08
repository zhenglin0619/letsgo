'use client';
import { useState } from 'react';
import Navbar from './Navbar';
import FAB from './FAB';
import QuickAddModal from '@/components/upload/QuickAddModal';
import AddTripModal from '@/components/upload/AddTripModal';
import { TripsProvider } from '@/store/tripsContext';

export default function RootShell({ children }: { children: React.ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [addTripOpen, setAddTripOpen] = useState(false);

  function handleSelect(type: 'trip' | 'hotel' | 'restaurant') {
    if (type === 'trip') setAddTripOpen(true);
    else setQuickAddOpen(true);
  }

  return (
    <TripsProvider>
      <Navbar />
      {children}
      <FAB onSelect={handleSelect} />
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </TripsProvider>
  );
}
