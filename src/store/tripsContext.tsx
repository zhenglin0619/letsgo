'use client';
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { Trip } from '@/types';
import { mockTrips } from './data';

interface TripsContextValue {
  trips: Trip[];
  addTrip: (t: Trip) => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  return (
    <TripsContext.Provider value={{ trips, addTrip: t => setTrips(p => [t, ...p]) }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
