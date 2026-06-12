'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { MapPin, Calendar, MoreHorizontal, Pencil, Trash2, Search, X } from 'lucide-react';
import AddHotelModal from '@/components/upload/AddHotelModal';
import SortMenu from '@/components/ui/SortMenu';
import HotelDrawer from '@/components/hotel/HotelDrawer';
import StarRating from '@/components/ui/StarRating';
import { HotelLog } from '@/types';
import { deleteStoragePhotos } from '@/lib/imageUtils';

function nights(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function HotelMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setConfirming(false); return; }
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors flex items-center justify-center"
      >
        <MoreHorizontal size={14} className="text-white" />
      </button>

      {open && (
        <div className="absolute top-9 right-0 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 w-40 z-30">
          {!confirming ? (
            <>
              <button
                onClick={e => { e.stopPropagation(); onEdit(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Pencil size={13} className="text-[#8A8A8A]" /> Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); setConfirming(true); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">Delete this hotel?</p>
              <div className="flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); onDelete(); setOpen(false); }}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >Delete</button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false); }}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  const { trips, standaloneHotels, updateTrip, updateStandaloneHotel, deleteStandaloneHotel } = useTrips();
  const allHotels = [
    ...trips.flatMap(trip => trip.hotels.map(hotel => ({ ...hotel, tripTitle: trip.title, tripId: trip.id, isStandalone: false }))),
    ...standaloneHotels.map(hotel => ({ ...hotel, tripTitle: '', tripId: '', isStandalone: true })),
  ].sort((a, b) => b.checkIn.localeCompare(a.checkIn));

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const base = query.trim()
    ? allHotels.filter(h => {
        const q = query.toLowerCase();
        return (
          h.hotelName.toLowerCase().includes(q) ||
          h.location.city.toLowerCase().includes(q) ||
          h.location.country.toLowerCase().includes(q)
        );
      })
    : allHotels;

  const filtered = [...base].sort((a, b) => {
    if (sortBy === 'date-desc') return b.checkIn.localeCompare(a.checkIn);
    if (sortBy === 'date-asc')  return a.checkIn.localeCompare(b.checkIn);
    if (sortBy === 'rate-desc') return b.rating - a.rating;
    if (sortBy === 'rate-asc')  return a.rating - b.rating;
    return 0;
  });

  const [editTarget, setEditTarget] = useState<{ hotel: HotelLog; tripId: string } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<{ hotel: HotelLog; tripId: string; isStandalone: boolean } | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleDelete(hotel: HotelLog, tripId: string, isStandalone: boolean) {
    deleteStoragePhotos(hotel.photos);
    if (isStandalone) {
      deleteStandaloneHotel(hotel.id);
    } else {
      const trip = trips.find(t => t.id === tripId);
      if (!trip) return;
      updateTrip({ ...trip, hotels: trip.hotels.filter(h => h.id !== hotel.id) });
    }
  }

  return (
    <main className="pt-20 md:pt-24 pb-24 px-4 md:px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-4">
          <div>
            <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Our Stays</h1>
            <p className="mt-2 text-[#8A8A8A] text-sm">
              {allHotels.length} hotel{allHotels.length !== 1 ? 's' : ''} · {allHotels.reduce((sum, h) => sum + nights(h.checkIn, h.checkOut), 0)} nights total
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end md:mb-0.5">
            <SortMenu value={sortBy} onChange={setSortBy} />
            <div className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search hotels…"
                className="pl-8 pr-8 py-2 text-sm bg-white border border-[#E8E6E1] rounded-xl focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors w-full md:w-56"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#C0BAB2] hover:text-[#8A8A8A] transition-colors">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {filtered.length === 0 && (
          <div className="col-span-2 md:col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            {query ? (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">No hotels match &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Try a different hotel name, city, or country</p>
              </>
            ) : (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">No hotels logged yet</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Click + button to add your first stay</p>
              </>
            )}
          </div>
        )}
        {filtered.map((hotel, i) => (
          <motion.div
            key={hotel.id}
            className="bento-card overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
            onClick={() => { setSelectedHotel({ hotel, tripId: hotel.tripId, isStandalone: hotel.isStandalone }); setDrawerOpen(true); }}
          >
            <div className="relative h-45 overflow-hidden">
              {hotel.photos[0] ? (
                <img
                  src={hotel.photos[0]}
                  alt={hotel.hotelName}
                  className="w-full h-full object-cover"
                  style={hotel.photoTransform ? {
                    transform: `translate(${hotel.photoTransform.x}%, ${hotel.photoTransform.y}%) scale(${hotel.photoTransform.scale})`,
                    transformOrigin: 'center',
                  } : undefined}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#4A5343]/30 via-[#E8E4DC] to-[#C87A53]/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <h2 className="serif font-semibold text-lg leading-tight">{hotel.hotelName}</h2>
              </div>
              <div className="absolute top-3 right-3">
                <HotelMenu
                  onEdit={() => { setEditTarget({ hotel, tripId: hotel.tripId }); }}
                  onDelete={() => handleDelete(hotel, hotel.tripId, hotel.isStandalone)}
                />
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                  <MapPin size={11} />{hotel.location.city}, {hotel.location.country}
                </span>
                {hotel.rating > 0 && (
                  <StarRating value={hotel.rating} readonly size="sm" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                  <Calendar size={11} />{formatDate(hotel.checkIn)} – {formatDate(hotel.checkOut)} · {nights(hotel.checkIn, hotel.checkOut)} night{nights(hotel.checkIn, hotel.checkOut) !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[#8A8A8A]">
                  {hotel.currency} {Math.round(hotel.pricePerNight / (nights(hotel.checkIn, hotel.checkOut) || 1)).toLocaleString()} / night
                </span>
              </div>
              <p className="text-[10px] text-[#C87A53] font-medium mt-2 uppercase tracking-wider">{hotel.tripTitle}</p>
            </div>
          </motion.div>
        ))}

      </div>

      <HotelDrawer
        hotel={selectedHotel?.hotel ?? null}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onEdit={() => {
          if (!selectedHotel) return;
          setEditTarget({ hotel: selectedHotel.hotel, tripId: selectedHotel.tripId });
          setDrawerOpen(false);
        }}
        onDelete={() => {
          if (!selectedHotel) return;
          handleDelete(selectedHotel.hotel, selectedHotel.tripId, selectedHotel.isStandalone);
          setDrawerOpen(false);
        }}
        onUpdateHotel={(updated) => {
          if (!selectedHotel) return;
          setSelectedHotel(s => s ? { ...s, hotel: updated } : s);
          if (selectedHotel.isStandalone) {
            updateStandaloneHotel(updated);
          } else {
            const trip = trips.find(t => t.id === selectedHotel.tripId);
            if (trip) updateTrip({ ...trip, hotels: trip.hotels.map(h => h.id === updated.id ? updated : h) });
          }
        }}
      />

      <AddHotelModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initialHotel={editTarget ?? undefined}
      />
    </main>
  );
}
