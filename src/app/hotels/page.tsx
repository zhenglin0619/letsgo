'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { MapPin, Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import AddHotelModal from '@/components/upload/AddHotelModal';
import StarRating from '@/components/ui/StarRating';
import { HotelLog } from '@/types';

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

  const [editTarget, setEditTarget] = useState<{ hotel: HotelLog; tripId: string } | null>(null);

  function handleDelete(hotelId: string, tripId: string, isStandalone: boolean) {
    if (isStandalone) {
      deleteStandaloneHotel(hotelId);
    } else {
      const trip = trips.find(t => t.id === tripId);
      if (!trip) return;
      updateTrip({ ...trip, hotels: trip.hotels.filter(h => h.id !== hotelId) });
    }
  }

  return (
    <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Our Stays</h1>
        <p className="mt-2 text-[#8A8A8A] text-sm">
          {allHotels.length} hotel{allHotels.length !== 1 ? 's' : ''} · {allHotels.reduce((sum, h) => sum + nights(h.checkIn, h.checkOut), 0)} nights total
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {allHotels.map((hotel, i) => (
          <motion.div
            key={hotel.id}
            className="bento-card overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
          >
            <div className="relative h-45 overflow-hidden">
              {hotel.photos[0] ? (
                <img
                  src={hotel.photos[0]}
                  alt={hotel.hotelName}
                  className="w-full h-full object-cover"
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
                  onEdit={() => { const { tripTitle: _t, isStandalone: _s, ...h } = hotel; setEditTarget({ hotel: h, tripId: hotel.tripId }); }}
                  onDelete={() => handleDelete(hotel.id, hotel.tripId, hotel.isStandalone)}
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

        {allHotels.length === 0 && (
          <div className="col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            <p className="font-medium text-[#1A1A1A] text-sm">No hotels logged yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Add your first stays to get started</p>
          </div>
        )}
      </div>

      <AddHotelModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initialHotel={editTarget ?? undefined}
      />
    </main>
  );
}
