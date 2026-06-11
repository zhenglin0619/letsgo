'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Trip, DiningLog, HotelLog } from '@/types';
import { mockTrips, mockStandaloneRestaurants, mockStandaloneHotels } from '@/store/data';
import { setDemoMode as setImageUtilsDemoMode } from '@/lib/imageUtils';

export interface Collaborator {
  userId: string;
  email: string;
}

interface TripsContextValue {
  user: User | null;
  authLoading: boolean;
  demoMode: boolean;
  toggleDemoMode: () => void;
  trips: Trip[];
  standaloneRestaurants: DiningLog[];
  standaloneHotels: HotelLog[];
  collaborators: Collaborator[];
  addCollaborator:    (email: string) => Promise<string | null>; // returns error string or null
  removeCollaborator: (collaboratorUserId: string) => Promise<void>;
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

// ── DB row shapes ──────────────────────────────────────────────────────────────
interface TripRow {
  id: string; user_id: string; title: string; cover_photo: string;
  start_date: string; end_date: string; countries: string[];
  city: string | null; photos?: string[];
}
interface RestaurantRow {
  id: string; user_id: string; trip_id: string | null;
  restaurant_name: string; cuisine: string; date: string;
  meal_type: string; total_expense: number; currency: string;
  overall_rating: number; location: DiningLog['location'];
  photos: string[]; dishes: DiningLog['dishes']; michelin_stars: number;
}
interface HotelRow {
  id: string; user_id: string; trip_id: string | null;
  hotel_name: string; check_in: string; check_out: string;
  price_per_night: number; currency: string; rating: number;
  room_type: string | null; view_type: string | null;
  location: HotelLog['location']; photos: string[]; notes: string;
}

// ── DB ↔ domain converters ────────────────────────────────────────────────────
function tripToRow(t: Trip, userId: string): TripRow {
  return {
    id: t.id, user_id: userId, title: t.title, cover_photo: t.coverPhoto,
    start_date: t.startDate, end_date: t.endDate, countries: t.countries,
    city: t.city ?? null, photos: t.photos ?? [],
  };
}
function rowToTrip(r: TripRow, diningLogs: DiningLog[], hotels: HotelLog[]): Trip {
  return {
    id: r.id, title: r.title, coverPhoto: r.cover_photo,
    startDate: r.start_date, endDate: r.end_date, countries: r.countries,
    ...(r.city   ? { city:   r.city }   : {}),
    ...(r.photos?.length ? { photos: r.photos } : {}),
    diningLogs, hotels,
  };
}
function logToRow(d: DiningLog, userId: string, tripId: string | null): RestaurantRow {
  return {
    id: d.id, user_id: userId, trip_id: tripId,
    restaurant_name: d.restaurantName, cuisine: d.cuisine,
    date: d.date, meal_type: d.time, total_expense: d.totalExpense,
    currency: d.currency, overall_rating: d.overallRating,
    location: d.location, photos: d.photos, dishes: d.dishes,
    michelin_stars: d.michelinStars ?? 0,
  };
}
function rowToLog(r: RestaurantRow): DiningLog {
  return {
    id: r.id, restaurantName: r.restaurant_name, cuisine: r.cuisine,
    date: r.date, time: r.meal_type as DiningLog['time'],
    totalExpense: r.total_expense, currency: r.currency,
    overallRating: r.overall_rating, location: r.location,
    photos: r.photos, dishes: r.dishes,
    ...(r.michelin_stars > 0 ? { michelinStars: r.michelin_stars as 1 | 2 | 3 } : {}),
  };
}
function hotelToRow(h: HotelLog, userId: string, tripId: string | null): HotelRow {
  return {
    id: h.id, user_id: userId, trip_id: tripId,
    hotel_name: h.hotelName, check_in: h.checkIn, check_out: h.checkOut,
    price_per_night: h.pricePerNight, currency: h.currency, rating: h.rating,
    room_type: h.roomType ?? null, view_type: h.viewType ?? null,
    location: h.location, photos: h.photos, notes: h.notes,
  };
}
function rowToHotel(r: HotelRow): HotelLog {
  return {
    id: r.id, hotelName: r.hotel_name, checkIn: r.check_in, checkOut: r.check_out,
    pricePerNight: r.price_per_night, currency: r.currency, rating: r.rating,
    location: r.location, photos: r.photos, notes: r.notes,
    ...(r.room_type  ? { roomType:  r.room_type }  : {}),
    ...(r.view_type  ? { viewType:  r.view_type }  : {}),
  };
}

// ── Supabase sync helpers ─────────────────────────────────────────────────────

async function loadCollaborators(userId: string): Promise<Collaborator[]> {
  const { data: rows } = await supabase
    .from('collaborators')
    .select('collaborator_id')
    .eq('owner_id', userId);
  if (!rows || rows.length === 0) return [];
  const ids = rows.map(r => r.collaborator_id as string);
  const { data: profiles } = await supabase
    .from('profiles').select('id, email').in('id', ids);
  return (profiles ?? []).map(p => ({ userId: p.id as string, email: p.email as string }));
}

async function loadUserData(userId: string) {
  // Include data from collaborators (users who added current user)
  const { data: sharedRows } = await supabase
    .from('collaborators').select('owner_id').eq('collaborator_id', userId);
  const ownerIds = [userId, ...(sharedRows?.map(r => r.owner_id as string) ?? [])];

  const [tripsRes, restRes, hotelRes] = await Promise.all([
    supabase.from('trips').select('id,user_id,title,cover_photo,start_date,end_date,countries,city').in('user_id', ownerIds),
    supabase.from('restaurants').select('*').in('user_id', ownerIds),
    supabase.from('hotels').select('*').in('user_id', ownerIds),
  ]);
  const tripRows  = (tripsRes.data  ?? []) as TripRow[];
  const restRows  = (restRes.data   ?? []) as RestaurantRow[];
  const hotelRows = (hotelRes.data  ?? []) as HotelRow[];

  const trips = tripRows.map(t =>
    rowToTrip(
      t,
      restRows.filter(r => r.trip_id === t.id).map(rowToLog),
      hotelRows.filter(h => h.trip_id === t.id).map(rowToHotel),
    )
  );
  return {
    trips,
    standalone:       restRows.filter(r => r.trip_id === null).map(rowToLog),
    standaloneHotels: hotelRows.filter(h => h.trip_id === null).map(rowToHotel),
  };
}

async function syncTrip(userId: string, t: Trip): Promise<void> {
  const now = new Date().toISOString();

  const { error: te } = await supabase.from('trips')
    .upsert({ ...tripToRow(t, userId), updated_at: now });
  if (te) { console.warn('[supabase] trip sync:', te.message); return; }

  if (t.diningLogs.length > 0) {
    const { error: re } = await supabase.from('restaurants')
      .upsert(t.diningLogs.map(d => ({ ...logToRow(d, userId, t.id), updated_at: now })));
    if (re) console.warn('[supabase] restaurant sync:', re.message);
    const ids = t.diningLogs.map(d => d.id);
    await supabase.from('restaurants').delete()
      .eq('user_id', userId).eq('trip_id', t.id)
      .not('id', 'in', `(${ids.join(',')})`);
  } else {
    await supabase.from('restaurants').delete().eq('user_id', userId).eq('trip_id', t.id);
  }

  if (t.hotels.length > 0) {
    const { error: he } = await supabase.from('hotels')
      .upsert(t.hotels.map(h => ({ ...hotelToRow(h, userId, t.id), updated_at: now })));
    if (he) console.warn('[supabase] hotel sync:', he.message);
    const ids = t.hotels.map(h => h.id);
    await supabase.from('hotels').delete()
      .eq('user_id', userId).eq('trip_id', t.id)
      .not('id', 'in', `(${ids.join(',')})`);
  } else {
    await supabase.from('hotels').delete().eq('user_id', userId).eq('trip_id', t.id);
  }
}

function deleteTrip$(userId: string, id: string) {
  supabase.from('trips').delete().eq('id', id).eq('user_id', userId)
    .then(({ error }) => { if (error) console.warn('[supabase] trip delete:', error.message); });
}

function syncRestaurant(userId: string, log: DiningLog, tripId: string | null) {
  supabase.from('restaurants')
    .upsert({ ...logToRow(log, userId, tripId), updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.warn('[supabase] restaurant sync:', error.message); });
}

function deleteRestaurant$(userId: string, id: string) {
  supabase.from('restaurants').delete()
    .eq('id', id).eq('user_id', userId).is('trip_id', null)
    .then(({ error }) => { if (error) console.warn('[supabase] restaurant delete:', error.message); });
}

function syncHotel(userId: string, hotel: HotelLog, tripId: string | null) {
  supabase.from('hotels')
    .upsert({ ...hotelToRow(hotel, userId, tripId), updated_at: new Date().toISOString() })
    .then(({ error }) => { if (error) console.warn('[supabase] hotel sync:', error.message); });
}

function deleteHotel$(userId: string, id: string) {
  supabase.from('hotels').delete()
    .eq('id', id).eq('user_id', userId).is('trip_id', null)
    .then(({ error }) => { if (error) console.warn('[supabase] hotel delete:', error.message); });
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function TripsProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [trips, setTrips]                       = useState<Trip[]>([]);
  const [standaloneRestaurants, setStandalone]  = useState<DiningLog[]>([]);
  const [standaloneHotels, setStandaloneHotels] = useState<HotelLog[]>([]);
  const [collaborators, setCollaborators]       = useState<Collaborator[]>([]);

  const [demoMode, setDemoMode]                         = useState(false);
  useEffect(() => { setImageUtilsDemoMode(demoMode); }, [demoMode]);
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
          // Upsert profile so others can find this user by email
          await supabase.from('profiles')
            .upsert({ id: u.id, email: u.email }, { onConflict: 'id' });

          const [data, collabs] = await Promise.all([
            loadUserData(u.id),
            loadCollaborators(u.id),
          ]);
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
          setCollaborators(collabs);
        } else {
          setTrips([]);
          setStandalone([]);
          setStandaloneHotels([]);
          setCollaborators([]);
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
      collaborators,

      addCollaborator: async (email) => {
        if (!user) return 'Not signed in';
        if (email.toLowerCase() === user.email?.toLowerCase()) return 'Cannot add yourself';

        const { data: profile, error } = await supabase
          .from('profiles').select('id, email').eq('email', email).single();
        if (error || !profile) return 'No account found with that email';

        const alreadyAdded = collaborators.some(c => c.userId === profile.id);
        if (alreadyAdded) return 'Already a collaborator';

        // Bidirectional: both see each other's data
        const { error: insErr } = await supabase.from('collaborators').insert([
          { owner_id: user.id,   collaborator_id: profile.id },
          { owner_id: profile.id, collaborator_id: user.id  },
        ]);
        if (insErr) return 'Failed to add collaborator';

        setCollaborators(prev => [...prev, { userId: profile.id as string, email: profile.email as string }]);
        // Reload data to include collaborator's records
        loadUserData(user.id).then(data => {
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
        });
        return null;
      },

      removeCollaborator: async (collaboratorUserId) => {
        if (!user) return;
        await supabase.from('collaborators').delete().or(
          `and(owner_id.eq.${user.id},collaborator_id.eq.${collaboratorUserId}),` +
          `and(owner_id.eq.${collaboratorUserId},collaborator_id.eq.${user.id})`
        );
        setCollaborators(prev => prev.filter(c => c.userId !== collaboratorUserId));
        // Reload to remove their records from view
        loadUserData(user.id).then(data => {
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
        });
      },

      addTrip: (t) => {
        if (demoMode) { setDemoTrips(p => [t, ...p]); return; }
        setTrips(p => [t, ...p]);
        if (user) syncTrip(user.id, t).catch(e => console.warn('[supabase]', e));
      },
      updateTrip: (t) => {
        if (demoMode) { setDemoTrips(p => p.map(x => x.id === t.id ? t : x)); return; }
        setTrips(p => p.map(x => x.id === t.id ? t : x));
        if (user) syncTrip(user.id, t).catch(e => console.warn('[supabase]', e));
      },
      deleteTrip: (id) => {
        if (demoMode) { setDemoTrips(p => p.filter(x => x.id !== id)); return; }
        setTrips(p => p.filter(x => x.id !== id));
        if (user) deleteTrip$(user.id, id);
      },

      addStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => [log, ...p]); return; }
        setStandalone(p => [log, ...p]);
        if (user) syncRestaurant(user.id, log, null);
      },
      updateStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => p.map(x => x.id === log.id ? log : x)); return; }
        setStandalone(p => p.map(x => x.id === log.id ? log : x));
        if (user) syncRestaurant(user.id, log, null);
      },
      deleteStandaloneRestaurant: (id) => {
        if (demoMode) { setDemoStandalone(p => p.filter(x => x.id !== id)); return; }
        setStandalone(p => p.filter(x => x.id !== id));
        if (user) deleteRestaurant$(user.id, id);
      },

      addStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => [h, ...p]); return; }
        setStandaloneHotels(p => [h, ...p]);
        if (user) syncHotel(user.id, h, null);
      },
      updateStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.map(x => x.id === h.id ? h : x)); return; }
        setStandaloneHotels(p => p.map(x => x.id === h.id ? h : x));
        if (user) syncHotel(user.id, h, null);
      },
      deleteStandaloneHotel: (id) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.filter(x => x.id !== id)); return; }
        setStandaloneHotels(p => p.filter(x => x.id !== id));
        if (user) deleteHotel$(user.id, id);
      },

      signOut: async () => {
        setDemoMode(false);
        setCollaborators([]);
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
