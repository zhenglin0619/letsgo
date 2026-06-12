'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Trip, DiningLog, HotelLog, PhotoTransform } from '@/types';
import { mockTrips, mockStandaloneRestaurants, mockStandaloneHotels } from '@/store/data';
import { setDemoMode as setImageUtilsDemoMode } from '@/lib/imageUtils';

export interface Collaborator {
  userId: string;
  email: string;
}

export interface PendingInvite {
  ownerId: string;
  ownerEmail: string;
}

export interface SentInvite {
  inviteeId: string;
  inviteeEmail: string;
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
  pendingInvites: PendingInvite[];
  sentInvites: SentInvite[];
  sendInvite:         (email: string) => Promise<string | null>;
  acceptInvite:       (ownerId: string) => Promise<void>;
  rejectInvite:       (ownerId: string) => Promise<void>;
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
  cover_photo_transform?: PhotoTransform | null;
  start_date: string; end_date: string; countries: string[];
  city: string | null; photos?: string[];
}
interface RestaurantRow {
  id: string; user_id: string; trip_id: string | null;
  restaurant_name: string; cuisine: string; date: string;
  meal_type: string; total_expense: number; currency: string;
  overall_rating: number; location: DiningLog['location'];
  photos: string[]; photo_transform?: PhotoTransform | null;
  dishes: DiningLog['dishes']; michelin_stars: number;
}
interface HotelRow {
  id: string; user_id: string; trip_id: string | null;
  hotel_name: string; check_in: string; check_out: string;
  price_per_night: number; currency: string; rating: number;
  room_type: string | null; view_type: string | null;
  location: HotelLog['location']; photos: string[];
  photo_transform?: PhotoTransform | null; notes: string;
}

// ── DB ↔ domain converters ────────────────────────────────────────────────────
function tripToRow(t: Trip, userId: string): TripRow {
  return {
    id: t.id, user_id: t.ownerId ?? userId, title: t.title, cover_photo: t.coverPhoto,
    cover_photo_transform: t.coverPhotoTransform ?? null,
    start_date: t.startDate, end_date: t.endDate, countries: t.countries,
    city: t.city ?? null, photos: t.photos ?? [],
  };
}
function rowToTrip(r: TripRow, diningLogs: DiningLog[], hotels: HotelLog[]): Trip {
  return {
    id: r.id, ownerId: r.user_id, title: r.title, coverPhoto: r.cover_photo,
    ...(r.cover_photo_transform ? { coverPhotoTransform: r.cover_photo_transform } : {}),
    startDate: r.start_date, endDate: r.end_date, countries: r.countries,
    ...(r.city   ? { city:   r.city }   : {}),
    ...(r.photos?.length ? { photos: r.photos } : {}),
    diningLogs, hotels,
  };
}
function logToRow(d: DiningLog, userId: string, tripId: string | null): RestaurantRow {
  return {
    id: d.id, user_id: d.ownerId ?? userId, trip_id: tripId,
    restaurant_name: d.restaurantName, cuisine: d.cuisine,
    date: d.date, meal_type: d.time, total_expense: d.totalExpense,
    currency: d.currency, overall_rating: d.overallRating,
    location: d.location, photos: d.photos,
    photo_transform: d.photoTransform ?? null,
    dishes: d.dishes, michelin_stars: d.michelinStars ?? 0,
  };
}
function rowToLog(r: RestaurantRow): DiningLog {
  return {
    id: r.id, ownerId: r.user_id, restaurantName: r.restaurant_name, cuisine: r.cuisine,
    date: r.date, time: r.meal_type as DiningLog['time'],
    totalExpense: r.total_expense, currency: r.currency,
    overallRating: r.overall_rating, location: r.location,
    photos: r.photos,
    ...(r.photo_transform ? { photoTransform: r.photo_transform } : {}),
    dishes: r.dishes,
    ...(r.michelin_stars > 0 ? { michelinStars: r.michelin_stars as 1 | 2 | 3 } : {}),
  };
}
function hotelToRow(h: HotelLog, userId: string, tripId: string | null): HotelRow {
  return {
    id: h.id, user_id: h.ownerId ?? userId, trip_id: tripId,
    hotel_name: h.hotelName, check_in: h.checkIn, check_out: h.checkOut,
    price_per_night: h.pricePerNight, currency: h.currency, rating: h.rating,
    room_type: h.roomType ?? null, view_type: h.viewType ?? null,
    location: h.location, photos: h.photos,
    photo_transform: h.photoTransform ?? null,
    notes: h.notes,
  };
}
function rowToHotel(r: HotelRow): HotelLog {
  return {
    id: r.id, ownerId: r.user_id, hotelName: r.hotel_name, checkIn: r.check_in, checkOut: r.check_out,
    pricePerNight: r.price_per_night, currency: r.currency, rating: r.rating,
    location: r.location, photos: r.photos, notes: r.notes,
    ...(r.photo_transform ? { photoTransform: r.photo_transform } : {}),
    ...(r.room_type  ? { roomType:  r.room_type }  : {}),
    ...(r.view_type  ? { viewType:  r.view_type }  : {}),
  };
}

// ── Supabase sync helpers ─────────────────────────────────────────────────────

async function loadCollaborators(userId: string): Promise<Collaborator[]> {
  const { data: rows } = await supabase
    .from('collaborators')
    .select('owner_id, collaborator_id')
    .eq('status', 'accepted')
    .or(`owner_id.eq.${userId},collaborator_id.eq.${userId}`);
  if (!rows || rows.length === 0) return [];
  const otherIds = [...new Set(rows.map(r =>
    r.owner_id === userId ? r.collaborator_id : r.owner_id
  ) as string[])];
  const { data: profiles } = await supabase
    .from('profiles').select('id, email').in('id', otherIds);
  return (profiles ?? []).map(p => ({ userId: p.id as string, email: p.email as string }));
}

async function loadPendingInvites(userId: string): Promise<PendingInvite[]> {
  const { data: rows } = await supabase
    .from('collaborators').select('owner_id')
    .eq('collaborator_id', userId).eq('status', 'pending');
  if (!rows || rows.length === 0) return [];
  const ownerIds = rows.map(r => r.owner_id as string);
  const { data: profiles } = await supabase
    .from('profiles').select('id, email').in('id', ownerIds);
  return (profiles ?? []).map(p => ({ ownerId: p.id as string, ownerEmail: p.email as string }));
}

async function loadSentInvites(userId: string): Promise<SentInvite[]> {
  const { data: rows } = await supabase
    .from('collaborators').select('collaborator_id')
    .eq('owner_id', userId).eq('status', 'pending');
  if (!rows || rows.length === 0) return [];
  const inviteeIds = rows.map(r => r.collaborator_id as string);
  const { data: profiles } = await supabase
    .from('profiles').select('id, email').in('id', inviteeIds);
  return (profiles ?? []).map(p => ({ inviteeId: p.id as string, inviteeEmail: p.email as string }));
}

async function loadUserData(userId: string) {
  const { data: sharedRows } = await supabase
    .from('collaborators')
    .select('owner_id, collaborator_id')
    .eq('status', 'accepted')
    .or(`owner_id.eq.${userId},collaborator_id.eq.${userId}`);
  const otherIds = (sharedRows ?? []).map(r =>
    r.owner_id === userId ? r.collaborator_id : r.owner_id
  ) as string[];
  const ownerIds = [userId, ...new Set(otherIds)];

  const [tripsRes, restRes, hotelRes] = await Promise.all([
    supabase.from('trips').select('id,user_id,title,cover_photo,cover_photo_transform,start_date,end_date,countries,city,photos').in('user_id', ownerIds),
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

// editorId = who is saving right now (may differ from ownerId when a collaborator edits)
// isNew    = true when creating a new trip (INSERT), false when updating (UPDATE)
async function syncTrip(ownerId: string, t: Trip, editorId: string = ownerId, isNew = false): Promise<void> {
  const now = new Date().toISOString();
  const tripRow = { ...tripToRow(t, ownerId), updated_at: now };

  // Use INSERT for new trips, UPDATE for existing — avoids upsert checking INSERT policy
  // on collaborative updates where auth.uid() !== user_id.
  const tripResult = isNew
    ? await supabase.from('trips').insert(tripRow)
    : await supabase.from('trips').update(tripRow).eq('id', t.id);
  if (tripResult.error) { console.warn('[supabase] trip sync:', tripResult.error.message); return; }

  const restIds  = t.diningLogs.map(d => d.id);
  const hotelIds = t.hotels.map(h => h.id);
  const sentinel = ['00000000-0000-0000-0000-000000000000'];

  // Separate new logs (no ownerId → INSERT) from existing (ownerId → UPDATE)
  const newLogs = t.diningLogs.filter(d => !d.ownerId);
  const existingLogs = t.diningLogs.filter(d => !!d.ownerId);
  if (newLogs.length > 0) {
    const { error } = await supabase.from('restaurants')
      .insert(newLogs.map(d => ({ ...logToRow(d, editorId, t.id), updated_at: now })));
    if (error) console.warn('[supabase] restaurant insert:', error.message);
  }
  for (const d of existingLogs) {
    const { error } = await supabase.from('restaurants')
      .update({ ...logToRow(d, ownerId, t.id), updated_at: now }).eq('id', d.id);
    if (error) console.warn('[supabase] restaurant update:', error.message);
  }
  await supabase.from('restaurants').delete()
    .eq('user_id', ownerId).eq('trip_id', t.id)
    .not('id', 'in', `(${[...restIds, ...sentinel].join(',')})`);
  if (editorId !== ownerId) {
    await supabase.from('restaurants').delete()
      .eq('user_id', editorId).eq('trip_id', t.id)
      .not('id', 'in', `(${[...restIds, ...sentinel].join(',')})`);
  }

  const newHotels = t.hotels.filter(h => !h.ownerId);
  const existingHotels = t.hotels.filter(h => !!h.ownerId);
  if (newHotels.length > 0) {
    const { error } = await supabase.from('hotels')
      .insert(newHotels.map(h => ({ ...hotelToRow(h, editorId, t.id), updated_at: now })));
    if (error) console.warn('[supabase] hotel insert:', error.message);
  }
  for (const h of existingHotels) {
    const { error } = await supabase.from('hotels')
      .update({ ...hotelToRow(h, ownerId, t.id), updated_at: now }).eq('id', h.id);
    if (error) console.warn('[supabase] hotel update:', error.message);
  }
  await supabase.from('hotels').delete()
    .eq('user_id', ownerId).eq('trip_id', t.id)
    .not('id', 'in', `(${[...hotelIds, ...sentinel].join(',')})`);
  if (editorId !== ownerId) {
    await supabase.from('hotels').delete()
      .eq('user_id', editorId).eq('trip_id', t.id)
      .not('id', 'in', `(${[...hotelIds, ...sentinel].join(',')})`);
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
  const [collaborators, setCollaborators]   = useState<Collaborator[]>([]);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [sentInvites, setSentInvites]       = useState<SentInvite[]>([]);

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
    async function applySession(session: import('@supabase/supabase-js').Session | null) {
      try {
        const u = session?.user ?? null;
        setUser(u);
        if (u) {
          await supabase.from('profiles')
            .upsert({ id: u.id, email: u.email }, { onConflict: 'id' });
          const [data, collabs, pending, sent] = await Promise.all([
            loadUserData(u.id),
            loadCollaborators(u.id),
            loadPendingInvites(u.id),
            loadSentInvites(u.id),
          ]);
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
          setCollaborators(collabs);
          setPendingInvites(pending);
          setSentInvites(sent);
        } else {
          setTrips([]);
          setStandalone([]);
          setStandaloneHotels([]);
          setCollaborators([]);
          setPendingInvites([]);
          setSentInvites([]);
        }
      } catch (err) {
        console.error('[auth] session error:', err);
      } finally {
        setAuthLoading(false);
      }
    }

    // Hard timeout: if Supabase never responds (e.g. mobile network can't reach it),
    // unblock the UI after 5s so the user at least sees the login screen.
    const timeout = setTimeout(() => setAuthLoading(false), 5000);

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        clearTimeout(timeout);
        applySession(session);
      })
      .catch(() => {
        clearTimeout(timeout);
        setAuthLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await applySession(session);
      }
    );
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Refresh collaboration data when user returns to the tab so the inviter
  // automatically sees new trips once their invite is accepted.
  useEffect(() => {
    if (!user) return;
    async function onFocus() {
      const [collabs, data, pending, sent] = await Promise.all([
        loadCollaborators(user!.id),
        loadUserData(user!.id),
        loadPendingInvites(user!.id),
        loadSentInvites(user!.id),
      ]);
      setCollaborators(collabs);
      setTrips(data.trips);
      setStandalone(data.standalone);
      setStandaloneHotels(data.standaloneHotels);
      setPendingInvites(pending);
      setSentInvites(sent);
    }
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [user?.id]);

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

      pendingInvites,
      sentInvites,

      sendInvite: async (email) => {
        if (!user) return 'Not signed in';
        if (email.toLowerCase() === user.email?.toLowerCase()) return 'Cannot invite yourself';

        const { data: profile, error } = await supabase
          .from('profiles').select('id, email').eq('email', email).single();
        if (error || !profile) return 'No account found with that email';

        if (collaborators.some(c => c.userId === profile.id)) return 'Already a collaborator';
        if (sentInvites.some(s => s.inviteeId === profile.id)) return 'Invite already sent';

        const { error: insErr } = await supabase.from('collaborators').insert({
          owner_id: user.id, collaborator_id: profile.id, status: 'pending',
        });
        if (insErr) { console.error('[sendInvite]', insErr); return insErr.message; }

        setSentInvites(prev => [...prev, { inviteeId: profile.id as string, inviteeEmail: profile.email as string }]);
        return null;
      },

      acceptInvite: async (ownerId) => {
        if (!user) return;
        const { data: updated, error } = await supabase.from('collaborators')
          .update({ status: 'accepted' })
          .eq('owner_id', ownerId)
          .eq('collaborator_id', user.id)
          .select();
        if (error) { console.error('[acceptInvite] error:', error); return; }
        if (!updated || updated.length === 0) { console.error('[acceptInvite] 0 rows updated — likely RLS blocking UPDATE'); return; }

        const invite = pendingInvites.find(p => p.ownerId === ownerId);
        setPendingInvites(prev => prev.filter(p => p.ownerId !== ownerId));
        if (invite) {
          setCollaborators(prev => [...prev, { userId: ownerId, email: invite.ownerEmail }]);
        }
        loadUserData(user.id).then(data => {
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
        });
      },

      rejectInvite: async (ownerId) => {
        if (!user) return;
        await supabase.from('collaborators')
          .delete()
          .eq('owner_id', ownerId)
          .eq('collaborator_id', user.id);
        setPendingInvites(prev => prev.filter(p => p.ownerId !== ownerId));
      },

      removeCollaborator: async (collaboratorUserId) => {
        if (!user) return;
        await supabase.from('collaborators').delete().or(
          `and(owner_id.eq.${user.id},collaborator_id.eq.${collaboratorUserId}),` +
          `and(owner_id.eq.${collaboratorUserId},collaborator_id.eq.${user.id})`
        );
        setCollaborators(prev => prev.filter(c => c.userId !== collaboratorUserId));
        setSentInvites(prev => prev.filter(s => s.inviteeId !== collaboratorUserId));
        loadUserData(user.id).then(data => {
          setTrips(data.trips);
          setStandalone(data.standalone);
          setStandaloneHotels(data.standaloneHotels);
        });
      },

      addTrip: (t) => {
        if (demoMode) { setDemoTrips(p => [t, ...p]); return; }
        setTrips(p => [t, ...p]);
        if (user) syncTrip(user.id, t, user.id, true).catch(e => console.warn('[supabase]', e));
      },
      updateTrip: (t) => {
        if (demoMode) { setDemoTrips(p => p.map(x => x.id === t.id ? t : x)); return; }
        setTrips(p => p.map(x => x.id === t.id ? t : x));
        if (user) syncTrip(t.ownerId ?? user.id, t, user.id, false).catch(e => console.warn('[supabase]', e));
      },
      deleteTrip: (id) => {
        if (demoMode) { setDemoTrips(p => p.filter(x => x.id !== id)); return; }
        const ownerId = trips.find(t => t.id === id)?.ownerId ?? user?.id ?? '';
        setTrips(p => p.filter(x => x.id !== id));
        if (user) deleteTrip$(ownerId, id);
      },

      addStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => [log, ...p]); return; }
        setStandalone(p => [log, ...p]);
        if (user) syncRestaurant(user.id, log, null);
      },
      updateStandaloneRestaurant: (log) => {
        if (demoMode) { setDemoStandalone(p => p.map(x => x.id === log.id ? log : x)); return; }
        setStandalone(p => p.map(x => x.id === log.id ? log : x));
        if (user) syncRestaurant(log.ownerId ?? user.id, log, null);
      },
      deleteStandaloneRestaurant: (id) => {
        if (demoMode) { setDemoStandalone(p => p.filter(x => x.id !== id)); return; }
        const ownerId = standaloneRestaurants.find(r => r.id === id)?.ownerId ?? user?.id ?? '';
        setStandalone(p => p.filter(x => x.id !== id));
        if (user) deleteRestaurant$(ownerId, id);
      },

      addStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => [h, ...p]); return; }
        setStandaloneHotels(p => [h, ...p]);
        if (user) syncHotel(user.id, h, null);
      },
      updateStandaloneHotel: (h) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.map(x => x.id === h.id ? h : x)); return; }
        setStandaloneHotels(p => p.map(x => x.id === h.id ? h : x));
        if (user) syncHotel(h.ownerId ?? user.id, h, null);
      },
      deleteStandaloneHotel: (id) => {
        if (demoMode) { setDemoStandaloneHotels(p => p.filter(x => x.id !== id)); return; }
        const ownerId = standaloneHotels.find(h => h.id === id)?.ownerId ?? user?.id ?? '';
        setStandaloneHotels(p => p.filter(x => x.id !== id));
        if (user) deleteHotel$(ownerId, id);
      },

      signOut: async () => {
        setDemoMode(false);
        setCollaborators([]);
        setPendingInvites([]);
        setSentInvites([]);
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
