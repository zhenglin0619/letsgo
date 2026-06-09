'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Trip, DiningLog } from '@/types';
import { mockTrips } from './data';

const TRIPS_KEY      = 'tt-trips';
const STANDALONE_KEY = 'tt-standalone-restaurants';

interface TripsContextValue {
  trips: Trip[];
  standaloneRestaurants: DiningLog[];
  addTrip:    (t: Trip) => void;
  updateTrip: (t: Trip) => void;
  deleteTrip: (id: string) => void;
  addStandaloneRestaurant:    (log: DiningLog) => void;
  updateStandaloneRestaurant: (log: DiningLog) => void;
  deleteStandaloneRestaurant: (id: string) => void;
}

const TripsContext = createContext<TripsContextValue | null>(null);

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [standaloneRestaurants, setStandalone] = useState<DiningLog[]>([]);
  const initialized = useRef(false);

  // Save trips — skips initial mount
  useEffect(() => {
    if (!initialized.current) return;
    try { localStorage.setItem(TRIPS_KEY, JSON.stringify(trips)); } catch {}
  }, [trips]);

  // Save standalone restaurants — skips initial mount
  useEffect(() => {
    if (!initialized.current) return;
    try { localStorage.setItem(STANDALONE_KEY, JSON.stringify(standaloneRestaurants)); } catch {}
  }, [standaloneRestaurants]);

  // Load both from localStorage, then enable saving
  useEffect(() => {
    try {
      const rawTrips = localStorage.getItem(TRIPS_KEY);
      if (rawTrips) setTrips(JSON.parse(rawTrips) as Trip[]);
      const rawStandalone = localStorage.getItem(STANDALONE_KEY);
      if (rawStandalone) setStandalone(JSON.parse(rawStandalone) as DiningLog[]);
    } catch {}
    initialized.current = true;
  }, []);

  return (
    <TripsContext.Provider value={{
      trips,
      standaloneRestaurants,
      addTrip:    t  => setTrips(p => [t, ...p]),
      updateTrip: t  => setTrips(p => p.map(x => x.id === t.id ? t : x)),
      deleteTrip: id => setTrips(p => p.filter(x => x.id !== id)),
      addStandaloneRestaurant:    log => setStandalone(p => [log, ...p]),
      updateStandaloneRestaurant: log => setStandalone(p => p.map(x => x.id === log.id ? log : x)),
      deleteStandaloneRestaurant: id  => setStandalone(p => p.filter(x => x.id !== id)),
    }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTrips must be used within TripsProvider');
  return ctx;
}
