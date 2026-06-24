'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import { MapPin, Clock, MoreHorizontal, Pencil, Trash2, Users, LogOut, Search, X } from 'lucide-react';
import ItemCollaboratorModal from '@/components/ui/ItemCollaboratorModal';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import SortMenu from '@/components/ui/SortMenu';
import DiningDrawer from '@/components/dining/DiningDrawer';
import { DiningLog } from '@/types';
import { deleteStoragePhotos } from '@/lib/imageUtils';
import { fmtCountry, parseLocalDate } from '@/lib/formatUtils';
import type { TranslationKey } from '@/lib/i18n';

function formatDate(d: string, locale: string) {
  return parseLocalDate(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

const MEAL_LABELS: Record<string, TranslationKey> = {
  'Breakfast': 'meal_breakfast', 'Brunch': 'meal_brunch', 'Lunch': 'meal_lunch',
  'Afternoon Tea': 'meal_afternoon_tea', 'Dinner': 'meal_dinner', 'Late Night': 'meal_late_night',
};

function DiningMenu({ onEdit, onDelete, onShare, onLeave, isOwner }: {
  onEdit: () => void; onDelete: () => void; onShare: () => void;
  onLeave: () => void; isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) { setConfirming(false); return; }
    const close = (e: MouseEvent) => {
      if (
        dropRef.current && !dropRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  function handleOpen(e: React.MouseEvent) {
    e.stopPropagation();
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(v => !v);
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors flex items-center justify-center"
      >
        <MoreHorizontal size={14} className="text-white" />
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          className="fixed bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 w-40 z-[99999]"
          style={{ top: dropPos.top, right: dropPos.right }}
        >
          {!confirming ? (
            <>
              <button
                onClick={e => { e.stopPropagation(); onEdit(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Pencil size={13} className="text-[#8A8A8A]" /> {t('common_edit')}
              </button>
              <button
                onClick={e => { e.stopPropagation(); onShare(); setOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <Users size={13} className="text-[#8A8A8A]" /> {t('common_share')}
              </button>
              {isOwner ? (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} /> {t('common_delete')}
                </button>
              ) : (
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(true); }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={13} /> {t('common_leave')}
                </button>
              )}
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">
                {isOwner ? t('restaurant_confirm_delete') : t('restaurant_confirm_leave')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); isOwner ? onDelete() : onLeave(); setOpen(false); }}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >{isOwner ? t('common_delete') : t('common_leave')}</button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false); }}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >{t('common_cancel')}</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}

export default function RestaurantsPage() {
  const { trips, standaloneRestaurants, updateTrip, updateStandaloneRestaurant, deleteStandaloneRestaurant, leaveItemShare, user } = useTrips();
  const { lang, t } = useLanguage();
  const allRestaurants = [
    ...trips.flatMap(trip =>
      trip.diningLogs.map(dining => ({ ...dining, tripTitle: trip.title, tripId: trip.id, isStandalone: false }))
    ),
    ...standaloneRestaurants.map(log => ({ ...log, tripTitle: '', tripId: '', isStandalone: true })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  const TIME_ORDER: Record<string, number> = {
    Breakfast: 0, Brunch: 1, Lunch: 2, 'Afternoon Tea': 3, Dinner: 4, 'Late Night': 5,
  };

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

  const byTime = (a: typeof base[0], b: typeof base[0]) =>
    (TIME_ORDER[a.time ?? ''] ?? 0) - (TIME_ORDER[b.time ?? ''] ?? 0);

  const filtered = [...base].sort((a, b) => {
    if (sortBy === 'date-desc') { const c = b.date.localeCompare(a.date); return c !== 0 ? c : byTime(b, a); }
    if (sortBy === 'date-asc')  { const c = a.date.localeCompare(b.date); return c !== 0 ? c : byTime(a, b); }
    if (sortBy === 'rate-desc') return b.overallRating - a.overallRating;
    if (sortBy === 'rate-asc')  return a.overallRating - b.overallRating;
    return 0;
  });

  const [editTarget, setEditTarget]         = useState<{ log: DiningLog; tripId: string } | null>(null);
  const [selectedDining, setSelectedDining] = useState<DiningLog | null>(null);
  const [selectedMeta, setSelectedMeta]     = useState<{ tripId: string; isStandalone: boolean } | null>(null);
  const [drawerOpen, setDrawerOpen]         = useState(false);
  const [shareDining, setShareDining]       = useState<DiningLog | null>(null);

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
            <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">{t('restaurants_title')}</h1>
            <p className="mt-2 text-[#8A8A8A] text-sm">
              {lang === 'zh'
                ? `共 ${allRestaurants.length} 家餐厅 · 遍及 ${new Set(allRestaurants.map(r => r.location.city)).size} 个城市`
                : `${allRestaurants.length} restaurant${allRestaurants.length !== 1 ? 's' : ''} · across ${new Set(allRestaurants.map(r => r.location.city)).size} cities`}
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
                placeholder={t('restaurants_search_placeholder')}
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
          <div className="col-span-2 md:col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            {query ? (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">{lang === 'zh' ? `没有与"${query}"匹配的餐厅` : `No restaurants match "${query}"`}</p>
                <p className="text-xs text-[#8A8A8A] mt-1">{t('restaurants_no_match_hint')}</p>
              </>
            ) : (
              <>
                <p className="font-medium text-[#1A1A1A] text-sm">{t('restaurants_empty')}</p>
                <p className="text-xs text-[#8A8A8A] mt-1">{t('restaurants_empty_hint')}</p>
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
            <div className="relative h-50 md:h-50 overflow-hidden">
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
              <div className="absolute bottom-2 left-2.5 right-2.5 md:left-3 md:right-3 text-white">
                <h2 className="serif font-semibold text-[20px] md:text-[19px] leading-tight">{dining.restaurantName}</h2>
                <p className="text-[12px] md:text-xs text-white/70 mt-0.5">{dining.cuisine}</p>
              </div>
              {dining.michelinStars && (
                <div className="absolute top-3 left-3">
                  <MichelinBadge stars={dining.michelinStars} />
                </div>
              )}
              <div className="absolute top-3 right-3">
                <DiningMenu
                  isOwner={dining.isStandalone
                    ? (!dining.ownerId || dining.ownerId === user?.id)
                    : (!trips.find(t => t.id === dining.tripId)?.ownerId || trips.find(t => t.id === dining.tripId)?.ownerId === user?.id)
                  }
                  onEdit={() => setEditTarget({ log: dining, tripId: dining.tripId })}
                  onDelete={() => handleDelete(dining, dining.tripId, dining.isStandalone)}
                  onShare={() => setShareDining(dining)}
                  onLeave={() => leaveItemShare(
                    dining.isStandalone ? dining.id : dining.tripId,
                    dining.isStandalone ? 'restaurant' : 'trip'
                  )}
                />
              </div>
            </div>

            <div className={`px-2.5 pt-2 md:px-3 md:pt-2.5 ${dining.tripTitle ? 'pb-2 md:pb-2.5' : 'pb-2.5 md:pb-3'}`}>
              <div className="flex items-center justify-between mb-1 md:mb-1.5">
                <div className="flex items-center gap-2 md:gap-3 text-xs text-[#8A8A8A]">
                  <span className="flex items-center gap-1"><MapPin size={11} />{dining.location.city}, {fmtCountry(dining.location.country)}</span>
                  {dining.time && <span className="flex items-center gap-1"><Clock size={11} />{MEAL_LABELS[dining.time] ? t(MEAL_LABELS[dining.time]) : dining.time}</span>}
                </div>
                <StarRating value={dining.overallRating} readonly size="sm" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">{formatDate(dining.date, lang === 'zh' ? 'zh-CN' : 'en-US')}</span>
                <span className="text-xs text-[#8A8A8A]">{dining.currency} {dining.totalExpense.toLocaleString()}</span>
              </div>
              {dining.tripTitle && (
                <p className="text-[10px] text-[#C87A53] font-medium mt-1 md:mt-2 uppercase tracking-wider">{dining.tripTitle}</p>
              )}
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
        onShare={() => selectedDining && setShareDining(selectedDining)}
        onLeave={() => selectedDining && selectedMeta && leaveItemShare(
          selectedMeta.isStandalone ? selectedDining.id : selectedMeta.tripId,
          selectedMeta.isStandalone ? 'restaurant' : 'trip'
        )}
        isOwner={selectedDining && selectedMeta
          ? selectedMeta.isStandalone
            ? (!selectedDining.ownerId || selectedDining.ownerId === user?.id)
            : (!trips.find(t => t.id === selectedMeta.tripId)?.ownerId || trips.find(t => t.id === selectedMeta.tripId)?.ownerId === user?.id)
          : true
        }
      />
      {shareDining && (
        <ItemCollaboratorModal
          open={!!shareDining}
          onClose={() => setShareDining(null)}
          itemId={shareDining.id}
          itemType="restaurant"
          itemTitle={shareDining.restaurantName}
          ownerId={shareDining.ownerId ?? user?.id ?? ''}
        />
      )}
    </main>
  );
}
