'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import { Trip } from '@/types';
import { deleteStoragePhotos } from '@/lib/imageUtils';
import { supabase } from '@/lib/supabase';
import { Calendar, MapPin, BedDouble, Utensils, ArrowRight, MoreHorizontal, Pencil, Trash2, Users, LogOut, Search, X } from 'lucide-react';
import AddTripModal from '@/components/upload/AddTripModal';
import SortMenu, { DATE_OPTIONS } from '@/components/ui/SortMenu';
import ItemCollaboratorModal from '@/components/ui/ItemCollaboratorModal';
import { fmtCountries, parseLocalDate } from '@/lib/formatUtils';

function formatRange(start: string, end: string, locale: string) {
  const s = parseLocalDate(start);
  const e = parseLocalDate(end);
  const sStr = s.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  if (locale === 'zh-CN') {
    const eStr = e.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    return `${sStr} – ${eStr} ${e.getFullYear()}年`;
  }
  const eStr = e.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${sStr} – ${eStr}`;
}

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
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(v => !v); }}
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
                <Pencil size={13} className="text-[#8A8A8A]" /> {t('trip_edit')}
              </button>
              <button
                onClick={e => { e.stopPropagation(); onShare(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Users size={13} className="text-[#8A8A8A]" /> {t('trip_share')}
              </button>
              {isOwner ? (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> {t('trip_delete')}
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true); }}
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
                  onClick={e => { e.stopPropagation(); isOwner ? onDelete() : onLeave(); setOpen(false); }}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >
                  {isOwner ? t('common_delete') : t('common_leave')}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false); }}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >
                  {t('common_cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TripsPage() {
  const { trips: rawTrips, deleteTrip, leaveItemShare, user } = useTrips();
  const { lang, t } = useLanguage();

  async function handleDeleteTrip(trip: Trip) {
    const { data } = await supabase.from('trips').select('photos').eq('id', trip.id).single();
    const highlights = (data?.photos as string[] | null) ?? [];
    deleteStoragePhotos([
      trip.coverPhoto,
      ...highlights,
      ...trip.diningLogs.flatMap(d => [...d.photos, ...d.dishes.map(dish => dish.photo)]),
      ...trip.hotels.flatMap(h => h.photos),
    ]);
    deleteTrip(trip.id);
  }
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [shareTrip, setShareTrip]     = useState<Trip | null>(null);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const avgTripRating = (t: Trip) => {
    const vals = [...t.hotels.map(h => h.rating), ...t.diningLogs.map(d => d.overallRating)].filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const base = query.trim()
    ? rawTrips.filter(t => {
        const q = query.toLowerCase();
        const cities = [...t.hotels.map(h => h.location.city), ...t.diningLogs.map(d => d.location.city)];
        return t.title.toLowerCase().includes(q) || t.countries.some(c => c.toLowerCase().includes(q)) || cities.some(c => c.toLowerCase().includes(q));
      })
    : rawTrips;

  const filtered = [...base].sort((a, b) => {
    if (sortBy === 'date-desc') return b.startDate.localeCompare(a.startDate);
    if (sortBy === 'date-asc')  return a.startDate.localeCompare(b.startDate);
    if (sortBy === 'rate-desc') return avgTripRating(b) - avgTripRating(a);
    if (sortBy === 'rate-asc')  return avgTripRating(a) - avgTripRating(b);
    return 0;
  });


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
            <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">{t('trips_title')}</h1>
            <p className="mt-2 text-[#8A8A8A] text-sm">
              {lang === 'zh'
                ? `共 ${rawTrips.length} 次旅行 · 跨越 ${[...new Set(rawTrips.flatMap(trip => trip.countries))].length} 个国家`
                : `${rawTrips.length} trip${rawTrips.length !== 1 ? 's' : ''} · across ${[...new Set(rawTrips.flatMap(trip => trip.countries))].length} countries`}
            </p>
          </div>
          <div className="flex items-center gap-2 justify-end md:mb-0.5">
            <SortMenu value={sortBy} onChange={setSortBy} options={DATE_OPTIONS} />
            <div className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('trips_search_placeholder')}
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {filtered.length === 0 && (
          <div className="col-span-1 md:col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            {query ? (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">{lang === 'zh' ? `没有与"${query}"匹配的旅行` : `No trips match “${query}”`}</p>
                <p className="text-xs text-[#8A8A8A] mt-1">{t('trips_no_match_hint')}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">{t('trips_empty')}</p>
                <p className="text-xs text-[#8A8A8A] mt-1">{t('trips_empty_hint')}</p>
              </>
            )}
          </div>
        )}
        {filtered.map((trip, i) => (
          <motion.div
            key={trip.id}
            className="relative"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
          >
            <Link href={`/trips/${trip.id}`} className="block group">
              <div className="bento-card overflow-hidden">
                {/* Cover */}
                <div className="relative aspect-video md:aspect-auto md:h-100 overflow-hidden">
                  {trip.coverPhoto
                    ? <img
                        src={trip.coverPhoto}
                        alt={trip.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={trip.coverPhotoTransform ? {
                          transform: `translate(${trip.coverPhotoTransform.x}%, ${trip.coverPhotoTransform.y}%) scale(${trip.coverPhotoTransform.scale})`,
                          transformOrigin: 'center',
                        } : undefined}
                      />
                    : <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/30 via-[#E8E4DC] to-[#4A5343]/20" />
                  }
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h2 className="serif font-semibold text-2xl md:text-2xl leading-tight">{trip.title}</h2>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-3 md:p-4">
                  <div className="flex items-center gap-2 md:gap-4 text-xs md:text-xs text-[#8A8A8A] mb-2 md:mb-3">
                    <span className="flex items-center gap-1"><Calendar size={12} />{formatRange(trip.startDate, trip.endDate, lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} />{fmtCountries(trip.countries)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2 md:gap-4 text-xs md:text-xs text-[#4A5343]">
                      <span className="flex items-center gap-1"><BedDouble size={12} />{lang === 'zh' ? `${trip.hotels.length} 家酒店` : `${trip.hotels.length} hotel${trip.hotels.length !== 1 ? 's' : ''}`}</span>
                      <span className="flex items-center gap-1"><Utensils size={12} />{lang === 'zh' ? `${trip.diningLogs.length} 家餐厅` : `${trip.diningLogs.length} restaurant${trip.diningLogs.length !== 1 ? 's' : ''}`}</span>
                    </div>
                    <ArrowRight size={14} className="text-[#C87A53] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Menu button — outside Link so it doesn't trigger navigation */}
            <div className="absolute top-3 right-3 z-20">
              <TripMenu
                isOwner={!trip.ownerId || trip.ownerId === user?.id}
                onEdit={() => setEditingTrip(trip)}
                onDelete={() => handleDeleteTrip(trip)}
                onShare={() => setShareTrip(trip)}
                onLeave={() => leaveItemShare(trip.id, 'trip')}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <AddTripModal
        open={!!editingTrip}
        onClose={() => setEditingTrip(null)}
        initialTrip={editingTrip ?? undefined}
      />
      {shareTrip && (
        <ItemCollaboratorModal
          open={!!shareTrip}
          onClose={() => setShareTrip(null)}
          itemId={shareTrip.id}
          itemType="trip"
          itemTitle={shareTrip.title}
          ownerId={shareTrip.ownerId ?? ''}
        />
      )}
    </main>
  );
}
