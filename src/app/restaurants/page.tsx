'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { MapPin, Clock, MoreHorizontal, Pencil, Trash2, Search, X } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import SortMenu from '@/components/ui/SortMenu';
import DiningDrawer from '@/components/dining/DiningDrawer';
import { DiningLog } from '@/types';
import { deleteStoragePhotos } from '@/lib/imageUtils';
import { fmtCountry } from '@/lib/formatUtils';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DiningMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">Delete this restaurant?</p>
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

export default function RestaurantsPage() {
  const { trips, standaloneRestaurants, updateTrip, updateStandaloneRestaurant, deleteStandaloneRestaurant } = useTrips();
  const allRestaurants = [
    ...trips.flatMap(trip =>
      trip.diningLogs.map(dining => ({ ...dining, tripTitle: trip.title, tripId: trip.id, isStandalone: false }))
    ),
    ...standaloneRestaurants.map(log => ({ ...log, tripTitle: '', tripId: '', isStandalone: true })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const base = query.trim()
    ? allRestaurants.filter(r => {
        const q = query.toLowerCase();
        return (
          r.restaurantName.toLowerCase().includes(q) ||
          r.cuisine.toLowerCase().includes(q) ||
          r.location.city.toLowerCase().includes(q) ||
          r.location.country.toLowerCase().includes(q)
        );
      })
    : allRestaurants;

  const filtered = [...base].sort((a, b) => {
    if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
    if (sortBy === 'date-asc')  return a.date.localeCompare(b.date);
    if (sortBy === 'rate-desc') return b.overallRating - a.overallRating;
    if (sortBy === 'rate-asc')  return a.overallRating - b.overallRating;
    return 0;
  });

  const [editTarget, setEditTarget]       = useState<{ log: DiningLog; tripId: string } | null>(null);
  const [selectedDining, setSelectedDining] = useState<DiningLog | null>(null);
  const [selectedMeta, setSelectedMeta]     = useState<{ tripId: string; isStandalone: boolean } | null>(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);

  function openDining(dining: typeof allRestaurants[number]) {
    setSelectedDining(dining);
    setSelectedMeta({ tripId: dining.tripId, isStandalone: dining.isStandalone });
    setDrawerOpen(true);
  }

  function handleUpdateLog(updated: DiningLog) {
    setSelectedDining(updated);
    if (!selectedMeta) return;
    if (selectedMeta.isStandalone) {
      updateStandaloneRestaurant(updated);
    } else {
      const trip = trips.find(t => t.id === selectedMeta.tripId);
      if (trip) updateTrip({ ...trip, diningLogs: trip.diningLogs.map(d => d.id === updated.id ? updated : d) });
    }
  }

  function handleDelete(dining: DiningLog, tripId: string, isStandalone: boolean) {
    deleteStoragePhotos([...dining.photos, ...dining.dishes.map(d => d.photo)]);
    if (isStandalone) {
      deleteStandaloneRestaurant(dining.id);
    } else {
      const trip = trips.find(t => t.id === tripId);
      if (!trip) return;
      updateTrip({ ...trip, diningLogs: trip.diningLogs.filter(d => d.id !== dining.id) });
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
            <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Our Dinings</h1>
            <p className="mt-2 text-[#8A8A8A] text-sm">
              {allRestaurants.length} restaurant{allRestaurants.length !== 1 ? 's' : ''} · across {new Set(allRestaurants.map(r => r.location.city)).size} cities
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
                placeholder="Search restaurants…"
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
                <p className="font-medium text-[#1A1A1A] text-sm">No restaurants match &ldquo;{query}&rdquo;</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Try a different restaurant name, cuisine, city, or country</p>
              </>
            ) : (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">No restaurants logged yet</p>
                <p className="text-xs text-[#8A8A8A] mt-1">Click + button to add your first dining log</p>
              </>
            )}
          </div>
        )}
        {filtered.map((dining, i) => (
          <motion.div
            key={dining.id}
            className="bento-card overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
            onClick={() => openDining(dining)}
          >
            <div className="relative h-32 md:h-50 overflow-hidden">
              {dining.photos[0] ? (
                <img
                  src={dining.photos[0]}
                  alt={dining.restaurantName}
                  className="w-full h-full object-cover"
                  style={dining.photoTransform ? {
                    transform: `translate(${dining.photoTransform.x}%, ${dining.photoTransform.y}%) scale(${dining.photoTransform.scale})`,
                    transformOrigin: 'center',
                  } : undefined}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/30 via-[#E8E4DC] to-[#4A5343]/20" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
              <div className="absolute bottom-2 left-2 md:left-4 text-white">
                <h2 className="serif font-semibold text-sm md:text-lg leading-tight">{dining.restaurantName}</h2>
                <p className="text-[10px] md:text-xs text-white/70 mt-0.5">{dining.cuisine}</p>
              </div>
              {dining.michelinStars && (
                <div className="absolute top-3 left-3">
                  <MichelinBadge stars={dining.michelinStars} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <DiningMenu
                  onEdit={() => setEditTarget({ log: dining, tripId: dining.tripId })}
                  onDelete={() => handleDelete(dining, dining.tripId, dining.isStandalone)}
                />
              </div>
            </div>

            <div className="px-2.5 pt-2 pb-1.5 md:p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 md:mb-2 gap-1 md:gap-0">
                <div className="order-first md:order-last">
                  <StarRating value={dining.overallRating} readonly size="sm" />
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-xs text-[#8A8A8A] order-last md:order-first">
                  <span className="flex items-center gap-1"><MapPin size={11} />{dining.location.city}, {fmtCountry(dining.location.country)}</span>
                  <span className="hidden md:flex items-center gap-1"><Clock size={11} />{dining.time}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">{formatDate(dining.date)}</span>
                <span className="text-xs text-[#8A8A8A]">{dining.currency} {dining.totalExpense.toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-[#C87A53] font-medium mt-1 md:mt-2 uppercase tracking-wider">{dining.tripTitle}</p>
            </div>
          </motion.div>
        ))}

      </div>

      <AddRestaurantModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initialDining={editTarget ?? undefined}
      />

      <DiningDrawer
        log={selectedDining}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdateLog={handleUpdateLog}
        onEdit={() => selectedDining && selectedMeta && setEditTarget({ log: selectedDining, tripId: selectedMeta.tripId })}
        onDelete={() => selectedDining && selectedMeta && handleDelete(selectedDining, selectedMeta.tripId, selectedMeta.isStandalone)}
      />
    </main>
  );
}
