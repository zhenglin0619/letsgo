'use client';
import { useState, use, useRef, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import ParallaxBanner from '@/components/trip/ParallaxBanner';
import TripMap from '@/components/trip/TripMap';
import HotelCard from '@/components/trip/HotelCard';
import DiningCard from '@/components/trip/DiningCard';
import DiningDrawer from '@/components/dining/DiningDrawer';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import AddTripModal from '@/components/upload/AddTripModal';
import AddHotelModal from '@/components/upload/AddHotelModal';
import HotelDrawer from '@/components/hotel/HotelDrawer';

import { DiningLog, HotelLog } from '@/types';
import { uploadPhoto, deleteStoragePhoto, deleteStoragePhotos } from '@/lib/imageUtils';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { BedDouble, Utensils, Images, MoreHorizontal, Pencil, Trash2, Plus, ChevronLeft, ChevronRight, Plane, Users, LogOut } from 'lucide-react';
import ItemCollaboratorModal from '@/components/ui/ItemCollaboratorModal';

// ── Edit / Delete menu ────────────────────────────────────────────────────────
function TripMenu({ onEdit, onDelete, onShare, onLeave, isOwner }: {
  onEdit: () => void; onDelete: () => void; onShare: () => void;
  onLeave: () => void; isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
                <Pencil size={13} className="text-[#8A8A8A]" /> {t('trip_edit')}
              </button>
              <button
                onClick={() => { onShare(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Users size={13} className="text-[#8A8A8A]" /> {t('trip_share')}
              </button>
              {isOwner ? (
                <button
                  onClick={() => setConfirming(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> {t('trip_delete')}
                </button>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> {t('trip_leave')}
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">
                {isOwner ? t('trip_confirm_delete') : t('trip_confirm_leave')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={isOwner ? onDelete : onLeave}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >{isOwner ? t('common_delete') : t('common_leave')}</button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >{t('common_cancel')}</button>
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
  const { trips, updateTrip, deleteTrip, leaveItemShare, user } = useTrips();
  const router = useRouter();
  const trip = trips.find(t => t.id === id);
  if (!trip) notFound();

  const { t } = useLanguage();
  const [editTripOpen, setEditTripOpen]   = useState(false);
  const [shareTripOpen, setShareTripOpen] = useState(false);
  const [tab, setTab] = useState<'highlights' | 'restaurants' | 'hotels'>('highlights');
  const [selectedDining, setSelectedDining] = useState<DiningLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [editingDining, setEditingDining] = useState<DiningLog | null>(null);
  const [editingHotel, setEditingHotel] = useState<HotelLog | null>(null);
  const [hotelDrawerHotel, setHotelDrawerHotel] = useState<HotelLog | null>(null);
  const [hotelDrawerOpen, setHotelDrawerOpen] = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen] = useState(false);
  const [addTripOpen, setAddTripOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<string[]>(trip?.photos ?? []);

  useEffect(() => {
    if (trip?.photos !== undefined) { setPhotos(trip.photos); return; }
    supabase.from('trips').select('photos').eq('id', id).single()
      .then(({ data }) => { if (data?.photos) setPhotos(data.photos as string[]); });
  }, [id, trip?.photos]);

  const MAX_PHOTOS = 20;

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    const remaining = MAX_PHOTOS - photos.length;
    if (!files.length || remaining <= 0) return;
    const toUpload = files.slice(0, remaining);
    let done = 0;
    const newPhotos: string[] = new Array(toUpload.length);
    toUpload.forEach((file, idx) => {
      uploadPhoto(file).then(url => {
        newPhotos[idx] = url;
        done++;
        if (done === toUpload.length) {
          updateTrip({ ...trip!, photos: [...photos, ...newPhotos] });
        }
      });
    });
  }

  function removePhoto(index: number) {
    deleteStoragePhoto(photos[index]);
    const updated = photos.filter((_, i) => i !== index);
    updateTrip({ ...trip!, photos: updated });
    if (lightboxIndex !== null) {
      if (updated.length === 0) setLightboxIndex(null);
      else setLightboxIndex(Math.min(lightboxIndex, updated.length - 1));
    }
  }

  function handleDelete() {
    deleteStoragePhotos([
      trip!.coverPhoto,
      ...photos,
      ...trip!.diningLogs.flatMap(d => [...d.photos, ...d.dishes.map(dish => dish.photo)]),
      ...trip!.hotels.flatMap(h => h.photos),
    ]);
    deleteTrip(trip!.id);
    router.push('/trips');
  }

  function openDining(log: DiningLog) {
    setSelectedDining(log);
    setDrawerOpen(true);
  }

  return (
    <>
      {/* Banner + menu button */}
      <div className="relative">
        <ParallaxBanner trip={trip!} />
        <Link href="/trips" className="absolute top-20 left-4 md:top-25 md:left-8 z-10 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/35 transition-colors flex items-center justify-center">
          <ChevronLeft size={16} className="text-white" />
        </Link>
        <div className="absolute top-20 right-4 md:top-25 md:right-8 z-10">
          <TripMenu
            isOwner={!trip!.ownerId || trip!.ownerId === user?.id}
            onEdit={() => setEditTripOpen(true)}
            onDelete={handleDelete}
            onShare={() => setShareTripOpen(true)}
            onLeave={async () => { await leaveItemShare(trip!.id, 'trip'); router.push('/trips'); }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto pl-0 pr-0 py-5 md:py-10">
        <div className="grid grid-cols-3 gap-6">
          {/* Left — map */}
          <div className="hidden md:block col-span-1 sticky top-24 self-start">
            <TripMap trip={trip!} />
          </div>

          {/* Right — tabs */}
          <div className="col-span-3 md:col-span-2">
            <div className="mx-4 md:mx-0 flex gap-0.5 md:gap-1 mb-5 bg-[#F0ECE6] p-0.5 md:p-1 rounded-xl md:w-fit">
              {([
                { key: 'highlights' as const,  label: t('detail_highlights'),  icon: <Images size={13} />,   count: photos.length },
                { key: 'restaurants' as const, label: t('detail_restaurants'), icon: <Utensils size={13} />, count: trip!.diningLogs.length },
                { key: 'hotels' as const,      label: t('detail_hotels'),      icon: <BedDouble size={13} />, count: trip!.hotels.length },
              ]).map(({ key, label, icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 md:flex-none flex items-center justify-center gap-1 md:gap-1.5 px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    tab === key ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                  }`}
                >
                  {icon}
                  {label}
                  <span className={`text-[10px] md:text-xs px-1 md:px-1.5 py-0.5 rounded-full ${tab === key ? 'bg-[#C87A53] text-white' : 'bg-[#E8E4DC] text-[#8A8A8A]'}`}>
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
                  accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />

                {photos.length === 0 ? (
                  <div className="mx-4 md:mx-0">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-[#D8D4CC] rounded-2xl py-20 flex flex-col items-center gap-3 text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors"
                    >
                      <Images size={32} strokeWidth={1.5} />
                      <p className="text-sm font-medium">{t('detail_upload_photos')}</p>
                      <p className="text-xs">{t('detail_upload_hint')}</p>
                    </button>
                  </div>
                ) : (
                  <div className="columns-3 gap-3 space-y-3 mx-4 md:mx-0">
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
                          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                    {photos.length < MAX_PHOTOS && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="break-inside-avoid w-full aspect-square rounded-xl border-2 border-dashed border-[#D8D4CC] flex flex-col items-center justify-center gap-2 text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors"
                      >
                        <Plus size={20} strokeWidth={1.5} />
                        <span className="text-xs font-medium">{t('detail_add_photos')}</span>
                        <span className="text-[10px] text-[#C0BAB2]">{photos.length}/{MAX_PHOTOS}</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {tab === 'restaurants' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mx-4 md:mx-0">
                {trip!.diningLogs.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    {t('detail_no_restaurants')}
                  </div>
                )}
                {trip!.diningLogs.slice().sort((a, b) => {
                    const mealRank: Record<string, number> = { 'Breakfast': 0, 'Brunch': 1, 'Lunch': 2, 'Afternoon Tea': 3, 'Dinner': 4, 'Late Night': 5 };
                    const dateDiff = b.date.localeCompare(a.date);
                    return dateDiff !== 0 ? dateDiff : (mealRank[b.time ?? ''] ?? 0) - (mealRank[a.time ?? ''] ?? 0);
                  }).map((log, i) => (
                  <DiningCard
                    key={log.id}
                    log={log}
                    index={i}
                    onClick={() => openDining(log)}
                    onEdit={() => setEditingDining(log)}
                    onDelete={() => {
                      deleteStoragePhotos([...log.photos, ...log.dishes.map(d => d.photo)]);
                      updateTrip({ ...trip!, diningLogs: trip!.diningLogs.filter(d => d.id !== log.id) });
                    }}
                  />
                ))}
              </div>
            )}

            {tab === 'hotels' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mx-4 md:mx-0">
                {trip!.hotels.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    {t('detail_no_hotels')}
                  </div>
                )}
                {trip!.hotels.slice().sort((a, b) => b.checkIn.localeCompare(a.checkIn)).map((hotel, i) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    index={i}
                    onClick={() => { setHotelDrawerHotel(hotel); setHotelDrawerOpen(true); }}
                    onEdit={() => setEditingHotel(hotel)}
                    onDelete={() => {
                      deleteStoragePhotos(hotel.photos);
                      updateTrip({ ...trip!, hotels: trip!.hotels.filter(h => h.id !== hotel.id) });
                    }}
                  />
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
        onUpdateLog={(updated) => {
          setSelectedDining(updated);
          updateTrip({ ...trip!, diningLogs: trip!.diningLogs.map(d => d.id === updated.id ? updated : d) });
        }}
        onEdit={() => selectedDining && setEditingDining(selectedDining)}
        onDelete={() => {
          if (!selectedDining) return;
          deleteStoragePhotos([...selectedDining.photos, ...selectedDining.dishes.map(d => d.photo)]);
          updateTrip({ ...trip!, diningLogs: trip!.diningLogs.filter(d => d.id !== selectedDining.id) });
        }}
      />

      <AddRestaurantModal
        open={addRestaurantOpen || !!editingDining}
        onClose={() => { setAddRestaurantOpen(false); setEditingDining(null); }}
        initialDining={editingDining ? { log: editingDining, tripId: trip!.id } : undefined}
        defaultTripId={trip!.id}
      />

      <HotelDrawer
        hotel={hotelDrawerHotel}
        open={hotelDrawerOpen}
        onClose={() => setHotelDrawerOpen(false)}
        onEdit={() => { if (hotelDrawerHotel) setEditingHotel(hotelDrawerHotel); setHotelDrawerOpen(false); }}
        onDelete={() => {
          if (!hotelDrawerHotel) return;
          deleteStoragePhotos(hotelDrawerHotel.photos);
          updateTrip({ ...trip!, hotels: trip!.hotels.filter(h => h.id !== hotelDrawerHotel.id) });
          setHotelDrawerOpen(false);
        }}
        onUpdateHotel={(updated) => {
          setHotelDrawerHotel(updated);
          updateTrip({ ...trip!, hotels: trip!.hotels.map(h => h.id === updated.id ? updated : h) });
        }}
      />
      <AddTripModal open={editTripOpen} onClose={() => setEditTripOpen(false)} initialTrip={trip!} />
      <ItemCollaboratorModal
        open={shareTripOpen}
        onClose={() => setShareTripOpen(false)}
        itemId={trip!.id}
        itemType="trip"
        itemTitle={trip!.title}
        ownerId={trip!.ownerId ?? ''}
      />
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <AddHotelModal
        open={addHotelOpen || !!editingHotel}
        onClose={() => { setAddHotelOpen(false); setEditingHotel(null); }}
        defaultTripId={trip!.id}
        initialHotel={editingHotel ? { hotel: editingHotel, tripId: trip!.id } : undefined}
      />

      {/* FAB — bottom-left */}
      <AnimatePresence>
        {fabOpen && (
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/25"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFabOpen(false)}
          />
        )}
      </AnimatePresence>
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              className="flex flex-col items-end gap-2.5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {([
                { type: 'trip' as const,       label: t('fab_trip'),        icon: Plane },
                { type: 'restaurant' as const, label: t('fab_restaurant'),  icon: Utensils },
                { type: 'hotel' as const,      label: t('fab_hotel'),       icon: BedDouble },
              ]).map((opt, i, arr) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.type}
                    onClick={() => {
                      if (opt.type === 'trip') setAddTripOpen(true);
                      else if (opt.type === 'restaurant') setAddRestaurantOpen(true);
                      else setAddHotelOpen(true);
                      setFabOpen(false);
                    }}
                    className="flex items-center gap-3 bg-white text-[#1A1A1A] text-base font-medium px-5 py-3 rounded-full shadow-xl hover:bg-[#F5F2EE] transition-colors whitespace-nowrap"
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ delay: (arr.length - 1 - i) * 0.055, duration: 0.2 }}
                  >
                    <Icon size={17} className="text-[#C87A53]" />
                    {opt.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setFabOpen(v => !v)}
          className="w-14 h-14 rounded-full bg-[#C87A53] text-white flex items-center justify-center shadow-lg hover:bg-[#A85E3A] transition-colors"
        >
          <motion.div
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[10002] bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          {lightboxIndex > 0 && (
            <button
              className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 md:bg-white/15 border border-white/30 hover:bg-black/70 md:hover:bg-white/30 transition-colors flex items-center justify-center text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {lightboxIndex < photos.length - 1 && (
            <button
              className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/50 md:bg-white/15 border border-white/30 hover:bg-black/70 md:hover:bg-white/30 transition-colors flex items-center justify-center text-white"
              onClick={e => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight size={20} />
            </button>
          )}
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img
              src={photos[lightboxIndex]}
              alt={`Photo ${lightboxIndex + 1}`}
              className="max-h-[88vh] max-w-[88vw] object-contain rounded-xl shadow-2xl"
            />
            <button
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-red-500/90 transition-colors flex items-center justify-center text-white"
              onClick={() => removePhoto(lightboxIndex)}
            >
              <Trash2 size={15} />
            </button>
          </div>
          <p className="absolute bottom-5 text-white/50 text-sm">{lightboxIndex + 1} / {photos.length}</p>
        </div>
      )}
    </>
  );
}
