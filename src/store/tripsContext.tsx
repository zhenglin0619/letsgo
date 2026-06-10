'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Trip, DiningLog, HotelLog } from '@/types';
import { mockTrips, mockStandaloneRestaurants, mockStandaloneHotels } from '@/store/data';

interface TripsContextValue {
  user: User | null;
  authLoading: boolean;
  demoMode: boolean;
  toggleDemoMode: () => void;
  trips: Trip[];
  standaloneRestaurants: DiningLog[];
  standaloneHotels: HotelLog[];
  addTrip:                    (t: Trip)        => void;
  updateTrip:                 (t: Trip)        => void;
  deleteTrip:                 (id: string)     => void;
  addStandaloneRestaurant:    (log: DiningLog) => void;
  updateStandaloneRestaurant: (log: DiningLog) => void;
  deleteStandaloneRestaurant: (id: string)     => void;
  addStandaloneHotel:         (h: HotelLog)    => void;
  updateStandaloneHotel:      (h: HotelLog)    => void;
  deleteStandaloneHotel:      (id: string)     => void;
  signOut: () => Promise<void>;
}

const TripsContext = createContext<TripsContextValue | null>(null);

// ── Supabase sync helpers (optimistic: state first, DB in background) ──────────
// Standalone restaurants and hotels are stored as a single sentinel row in the
// trips table (id = '__standalone__') to avoid needing a second table.
const STANDALONE_ID = '__standalone__';

async function loadUserData(userId: string) {
  const [tripsRes, standaloneRes] = await Promise.all([
    supabase.from('trips').select('id,data').eq('user_id', userId).neq('id', STANDALONE_ID),
    supabase.from('trips').select('data').eq('user_id', userId).eq('id', STANDALONE_ID).maybeSingle(),
  ]);
  const sd = standaloneRes.data?.data as { restaurants?: DiningLog[]; hotels?: HotelLog[] } | null;
  console.log('[supabase] loaded standalone row:', standaloneRes.data, 'error:', standaloneRes.error);
  return {
    trips:            (tripsRes.data ?? []).map(r => r.data as Trip),
    standalone:       sd?.restaurants ?? [],
    standaloneHotels: sd?.hotels ?? [],
  };
}

function syncTrip(userId: string, t: Trip) {
  supabase.from('trips')
    .upsert({ id: t.id, user_id: userId, data: t, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.warn('[supabase] trip sync:', error.message ?? error); });
}

function deleteTrip$(userId: string, id: string) {
  supabase.from('trips').delete().eq('id', id).eq('user_id', userId)
    .then(({ error }) => { if (error) console.warn('[supabase] trip delete:', error.message ?? error); });
}

function syncStandalone(userId: string, restaurants: DiningLog[], hotels: HotelLog[]) {
  console.log('[supabase] syncing standalone:', restaurants.length, 'restaurants,', hotels.length, 'hotels');
  supabase.from('trips')
    .upsert({ id: STANDALONE_ID, user_id: userId, data: { restaurants, hotels }, updated_at: new Date().toISOString() })
    .then(({ error }) => {
      if (error) console.error('[supabase] standalone sync FAILED:', error.code, error.message, error.details);
      else console.log('[supabase] standalone sync OK');
    });
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function TripsProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Real data from Supabase
  const [trips, setTrips]                       = useState<Trip[]>([]);
  const [standaloneRestaurants, setStandalone]  = useState<DiningLog[]>([]);
  const [standaloneHotels, setStandaloneHotels] = useState<HotelLog[]>([]);

  // Demo data (local-only copy of mock data — mutations work but never sync to DB)
  const [demoMode, setDemoMode]                         = useState(false);
  const [demoTrips, setDemoTrips]                       = useState<Trip[]>([...mockTrips]);
  const [demoStandalone, setDemoStandalone]             = useState<DiningLog[]>([...mockStandaloneRestaurants]);
  const [demoStandaloneHotels, setDemoStandaloneHotels] = useState<HotelLog[]>([...mockStandaloneHotels]);

  function toggleDemoMode() {
    setDemoMode(on => {
      if (!on) {
        setDemoTrips([...mockTrips]);
        setDemoStandalone([...mockStandaloneRestaurants]);
        setDemoStandaloneHotels([...mockStandaloneHotels]);
      }
      return !on;
    });
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const { trips: t, standalone: s, standaloneHotels: sh } = await loadUserData(u.id);
          setTrips(t);
          setStandalone(s);
          setStandaloneHotels(sh);
        } else {
          setTrips([]);
          setStandalone([]);
          setStandaloneHotels([]);
        }
        setAuthLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  const effectiveTrips            = demoMode ? demoTrips            : trips;
  const effectiveStandalone       = demoMode ? demoStandalone       : standaloneRestaurants;
  const effectiveStandaloneHotels = demoMode ? demoStandaloneHotels : standaloneHotels;

  return (
    <TripsContext.Provider value={{
      user,
      authLoading,
      demoMode,
      toggleDemoMode,
      trips:                effectiveTrips,
      standaloneRestaurants: effectiveStandalone,
      standaloneHotels:     effectiveStandaloneHotels,

      addTrip: (t) => {
        if (demoMode) { setDemoTrips(p => [t, ...p]); return; }
        setTrips(p => [t, ...p]);
        if (user) syncTrip(user.id, t);
      },
      updateTrip: (t) => {
        if (demoMode) { setDemoTrips(p => p.map(x => x.id === t.id ? t : x)); return; }
        setTrips(p => p.map(x => x.id === t.id ? t : x));
        if (user) syncTrip(user.id, t);
      },
      deleteTrip: (id) => {
        if (demoMode) { setDemoTrips(p => p.filter(x => x.id !== id)); return; }
        setTrips(p => p.filter(x => x.id !== id));
        if (user) deleteTrip$(user.id, id);
      },

      addStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => [log, ...p]); return; }
        const next = [log, ...standaloneRestaurants];
        setStandalone(next);
        if (user) syncStandalone(user.id, next, standaloneHotels);
      },
      updateStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => p.map(x => x.id === log.id ? log : x)); return; }
        const next = standaloneRestaurants.map(x => x.id === log.id ? log : x);
        setStandalone(next);
        if (user) syncStandalone(user.id, next, standaloneHotels);
      },
      deleteStandaloneRestaurant: (id) => {
        if (demoMode) { setDemoStandalone(p => p.filter(x => x.id !== id)); return; }
        const next = standaloneRestaurants.filter(x => x.id !== id);
        setStandalone(next);
        if (user) syncStandalone(user.id, next, standaloneHotels);
      },

      addStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => [h, ...p]); return; }
        const next = [h, ...standaloneHotels];
        setStandaloneHotels(next);
        if (user) syncStandalone(user.id, standaloneRestaurants, next);
      },
      updateStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.map(x => x.id === h.id ? h : x)); return; }
        const next = standaloneHotels.map(x => x.id === h.id ? h : x);
        setStandaloneHotels(next);
        if (user) syncStandalone(user.id, standaloneRestaurants, next);
      },
      deleteStandaloneHotel: (id) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.filter(x => x.id !== id)); return; }
        const next = standaloneHotels.filter(x => x.id !== id);
        setStandaloneHotels(next);
        if (user) syncStandalone(user.id, standaloneRestaurants, next);
      },

      signOut: async () => {
        setDemoMode(false);
        await supabase.auth.signOut();
      },
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
