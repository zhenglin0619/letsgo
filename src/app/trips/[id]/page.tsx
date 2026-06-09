'use client';
import { useState, use, useRef, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useTrips } from '@/store/tripsContext';
import ParallaxBanner from '@/components/trip/ParallaxBanner';
import TripMap from '@/components/trip/TripMap';
import TripEditView from '@/components/trip/TripEditView';
import HotelCard from '@/components/trip/HotelCard';
import DiningCard from '@/components/trip/DiningCard';
import DiningDrawer from '@/components/dining/DiningDrawer';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import { Trip, DiningLog } from '@/types';
import { BedDouble, Utensils, Images, MoreHorizontal, Pencil, Trash2, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

// ── Edit / Delete menu ────────────────────────────────────────────────────────
function TripMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
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
        onClick={() => setOpen(v => !v)}
        className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/35 transition-colors flex items-center justify-center"
      >
        <MoreHorizontal size={16} className="text-white" />
      </button>

      {open && (
        <div className="absolute top-11 right-0 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 w-44 z-30">
          {!confirming ? (
            <>
              <button
                onClick={() => { onEdit(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Pencil size={13} className="text-[#8A8A8A]" /> Edit trip
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Delete trip
              </button>
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">Delete this trip?</p>
              <div className="flex gap-2">
                <button
                  onClick={onDelete}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >Delete</button>
                <button
                  onClick={() => setConfirming(false)}
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

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { trips, updateTrip, deleteTrip } = useTrips();
  const router = useRouter();
  const trip = trips.find(t => t.id === id);
  if (!trip) notFound();

  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<'highlights' | 'restaurants' | 'hotels'>('highlights');
  const [selectedDining, setSelectedDining] = useState<DiningLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingDining, setEditingDining] = useState<DiningLog | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const photos = trip!.photos ?? [];

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    let loaded = 0;
    const newPhotos: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        newPhotos.push(ev.target!.result as string);
        loaded++;
        if (loaded === files.length) {
          updateTrip({ ...trip!, photos: [...photos, ...newPhotos] });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    updateTrip({ ...trip!, photos: updated });
    if (lightboxIndex !== null) {
      if (updated.length === 0) setLightboxIndex(null);
      else setLightboxIndex(Math.min(lightboxIndex, updated.length - 1));
    }
  }

  function handleSave(updated: Trip) {
    updateTrip(updated);
    setIsEditing(false);
  }

  function handleDelete() {
    deleteTrip(trip!.id);
    router.push('/trips');
  }

  function openDining(log: DiningLog) {
    setSelectedDining(log);
    setDrawerOpen(true);
  }

  // ── Edit mode ──────────────────────────────────────────────────────────────
  if (isEditing) {
    return (
      <TripEditView
        trip={trip!}
        onSave={handleSave}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  // ── View mode ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Banner + menu button */}
      <div className="relative">
        <ParallaxBanner trip={trip!} />
        <div className="absolute top-20 right-8 z-10">
          <TripMenu
            onEdit={() => setIsEditing(true)}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto pl-0 pr-0 py-10">
        <div className="grid grid-cols-3 gap-6">
          {/* Left — map */}
          <div className="col-span-1 sticky top-24 self-start">
            <TripMap trip={trip!} />
          </div>

          {/* Right — tabs */}
          <div className="col-span-2">
            <div className="flex gap-1 mb-5 bg-[#F0ECE6] p-1 rounded-xl w-fit">
              {([
                { key: 'highlights',  label: 'Highlights',  icon: <Images size={13} />,   count: photos.length },
                { key: 'restaurants', label: 'Restaurants', icon: <Utensils size={13} />, count: trip!.diningLogs.length },
                { key: 'hotels',      label: 'Hotels',      icon: <BedDouble size={13} />, count: trip!.hotels.length },
              ] as const).map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === key ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                  }`}
                >
                  {icon}
                  {label}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-[#C87A53] text-white' : 'bg-[#E8E4DC] text-[#8A8A8A]'}`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {tab === 'highlights' && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {photos.length === 0 ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#D8D4CC] rounded-2xl py-20 flex flex-col items-center gap-3 text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors"
                  >
                    <Images size={32} strokeWidth={1.5} />
                    <p className="text-sm font-medium">Upload trip photos</p>
                    <p className="text-xs">Click to select · multiple files supported</p>
                  </button>
                ) : (
                  <div className="columns-3 gap-3 space-y-3">
                    {photos.map((src, i) => (
                      <div
                        key={i}
                        className="relative group break-inside-avoid rounded-xl overflow-hidden cursor-pointer"
                        onClick={() => setLightboxIndex(i)}
                      >
                        <img
                          src={src}
                          alt={`Photo ${i + 1}`}
                          className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors" />
                        <button
                          onClick={e => { e.stopPropagation(); removePhoto(i); }}
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="break-inside-avoid w-full aspect-square rounded-xl border-2 border-dashed border-[#D8D4CC] flex flex-col items-center justify-center gap-2 text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors"
                    >
                      <Plus size={20} strokeWidth={1.5} />
                      <span className="text-xs font-medium">Add photos</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'restaurants' && (
              <div className="grid grid-cols-2 gap-4">
                {trip!.diningLogs.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    No restaurants logged yet. Click the edit button to add meals.
                  </div>
                )}
                {trip!.diningLogs.map((log, i) => (
                  <DiningCard
                    key={log.id}
                    log={log}
                    index={i}
                    onClick={() => openDining(log)}
                    onEdit={() => setEditingDining(log)}
                    onDelete={() => updateTrip({ ...trip!, diningLogs: trip!.diningLogs.filter(d => d.id !== log.id) })}
                  />
                ))}
              </div>
            )}

            {tab === 'hotels' && (
              <div className="grid grid-cols-2 gap-4">
                {trip!.hotels.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    No hotels logged yet. Click the edit button to add stays.
                  </div>
                )}
                {trip!.hotels.map((hotel, i) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DiningDrawer
        log={selectedDining}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <AddRestaurantModal
        open={!!editingDining}
        onClose={() => setEditingDining(null)}
        initialDining={editingDining ? { log: editingDining, tripId: trip!.id } : undefined}
      />

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
            onClick={() => setLightboxIndex(null)}
          >
            <X size={18} />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              className="absolute right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 transition-colors flex items-center justify-center text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight size={20} />
            </button>
          )}
          <img
            src={photos[lightboxIndex]}
            alt={`Photo ${lightboxIndex + 1}`}
            className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <p className="absolute bottom-5 text-white/50 text-sm">{lightboxIndex + 1} / {photos.length}</p>
        </div>
      )}
    </>
  );
}
