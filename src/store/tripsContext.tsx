'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Trip, DiningLog } from '@/types';

interface TripsContextValue {
  user: User | null;
  authLoading: boolean;
  trips: Trip[];
  standaloneRestaurants: DiningLog[];
  addTrip:                    (t: Trip)        => void;
  updateTrip:                 (t: Trip)        => void;
  deleteTrip:                 (id: string)     => void;
  addStandaloneRestaurant:    (log: DiningLog) => void;
  updateStandaloneRestaurant: (log: DiningLog) => void;
  deleteStandaloneRestaurant: (id: string)     => void;
  signOut: () => Promise<void>;
}

const TripsContext = createContext<TripsContextValue | null>(null);

// ── Supabase sync helpers (optimistic: state first, DB in background) ──────────
async function loadUserData(userId: string) {
  const [tripsRes, restRes] = await Promise.all([
    supabase.from('trips').select('data').eq('user_id', userId),
    supabase.from('standalone_restaurants').select('data').eq('user_id', userId),
  ]);
  return {
    trips:      (tripsRes.data ?? []).map(r => r.data as Trip),
    standalone: (restRes.data  ?? []).map(r => r.data as DiningLog),
  };
}

function syncTrip(userId: string, t: Trip) {
  supabase.from('trips')
    .upsert({ id: t.id, user_id: userId, data: t, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.error('[supabase] trip sync', error); });
}

function deleteTrip$(userId: string, id: string) {
  supabase.from('trips').delete().eq('id', id).eq('user_id', userId)
    .then(({ error }) => { if (error) console.error('[supabase] trip delete', error); });
}

function syncRestaurant(userId: string, log: DiningLog) {
  supabase.from('standalone_restaurants')
    .upsert({ id: log.id, user_id: userId, data: log, updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.error('[supabase] restaurant sync', error); });
}

function deleteRestaurant$(userId: string, id: string) {
  supabase.from('standalone_restaurants').delete().eq('id', id).eq('user_id', userId)
    .then(({ error }) => { if (error) console.error('[supabase] restaurant delete', error); });
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function TripsProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [trips, setTrips]             = useState<Trip[]>([]);
  const [standaloneRestaurants, setStandalone] = useState<DiningLog[]>([]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          const { trips: t, standalone: s } = await loadUserData(u.id);
          setTrips(t);
          setStandalone(s);
        } else {
          setTrips([]);
          setStandalone([]);
        }
        setAuthLoading(false);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  return (
    <TripsContext.Provider value={{
      user,
      authLoading,
      trips,
      standaloneRestaurants,

      addTrip: (t) => {
        setTrips(p => [t, ...p]);
        if (user) syncTrip(user.id, t);
      },
      updateTrip: (t) => {
        setTrips(p => p.map(x => x.id === t.id ? t : x));
        if (user) syncTrip(user.id, t);
      },
      deleteTrip: (id) => {
        setTrips(p => p.filter(x => x.id !== id));
        if (user) deleteTrip$(user.id, id);
      },

      addStandaloneRestaurant: (log) => {
        setStandalone(p => [log, ...p]);
        if (user) syncRestaurant(user.id, log);
      },
      updateStandaloneRestaurant: (log) => {
        setStandalone(p => p.map(x => x.id === log.id ? log : x));
        if (user) syncRestaurant(user.id, log);
      },
      deleteStandaloneRestaurant: (id) => {
        setStandalone(p => p.filter(x => x.id !== id));
        if (user) deleteRestaurant$(user.id, id);
      },

      signOut: async () => {
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
