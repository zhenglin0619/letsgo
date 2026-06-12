'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ImagePlus } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { DiningLog } from '@/types';
import DatePickerInput from '@/components/ui/DatePickerInput';
import type { LocatedPlace } from '@/components/ui/AddressSearchBox';
import DraggableImage, { type DraggableImageHandle } from '@/components/ui/DraggableImage';
import { uploadPhoto, deleteStoragePhoto } from '@/lib/imageUtils';
import type { PhotoTransform } from '@/types';

const AddressSearchBox = dynamic(() => import('@/components/ui/AddressSearchBox'), {
  ssr: false,
  loading: () => <input className="w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 text-[#C0BAB2]" placeholder="Search address or place name…" disabled />,
});
const InlineMapPreview = dynamic(() => import('@/components/ui/InlineMapPreview'), { ssr: false });

interface Props {
  open: boolean;
  onClose: () => void;
  initialDining?: { log: DiningLog; tripId: string };
  defaultTripId?: string;
}

const MEAL_OPTIONS = ['Breakfast', 'Brunch', 'Lunch', 'Afternoon Tea', 'Dinner', 'Late Night'] as const;
const CURRENCIES = ['USD', 'CNY', 'HKD', 'JPY', 'EUR', 'GBP', 'SGD', 'MYR', 'AUD', 'CAD'];
const MICHELIN = [0, 1, 2, 3] as const;

const INPUT = 'w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors';
const LABEL = 'text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1 block pl-1';
const SELECT = 'w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] bg-white transition-colors appearance-none';

const emptyForm = {
  restaurantName: '',
  cuisine: '',
  meal: '' as typeof MEAL_OPTIONS[number] | '',
  date: '',
  rating: '',
  city: '',
  country: '',
  address: '',
  expense: '',
  currency: 'USD',
  michelinStars: 0 as 0 | 1 | 2 | 3,
  tripId: '',
};


export default function AddRestaurantModal({ open, onClose, initialDining, defaultTripId }: Props) {
  const { trips, updateTrip, addStandaloneRestaurant, updateStandaloneRestaurant, deleteStandaloneRestaurant, detachStandaloneRestaurant } = useTrips();
  const isEdit = !!initialDining;
  const [form, setForm] = useState(emptyForm);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverTransform, setCoverTransform] = useState<PhotoTransform | undefined>(undefined);
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [geocoded, setGeocoded] = useState<{ lat: number; lng: number; city: string; country: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<DraggableImageHandle>(null);
  const coverFileRef = useRef<File | null>(null);
  const isSelectingRef = useRef(false);

  const initialDiningRef = useRef(initialDining);
  initialDiningRef.current = initialDining;
  const defaultTripIdRef = useRef(defaultTripId);
  defaultTripIdRef.current = defaultTripId;

  useEffect(() => {
    if (!open) { setForm(emptyForm); setCoverPreview(''); setCoverTransform(undefined); coverFileRef.current = null; setStep('form'); setGeocoded(null); return; }
    const init = initialDiningRef.current;
    if (init) {
      const { log, tripId } = init;
      setForm({
        restaurantName: log.restaurantName,
        cuisine: log.cuisine,
        meal: log.time,
        date: log.date,
        rating: log.overallRating ? String(log.overallRating) : '',
        city: log.location.city,
        country: log.location.country,
        address: log.location.address ?? '',
        expense: log.totalExpense ? String(log.totalExpense) : '',
        currency: log.currency,
        michelinStars: (log.michelinStars ?? 0) as 0 | 1 | 2 | 3,
        tripId,
      });
      setCoverPreview(log.photos[0] ?? '');
      setCoverTransform(log.photoTransform);
      setGeocoded({ lat: log.location.lat, lng: log.location.lng, city: log.location.city, country: log.location.country });
    } else {
      setForm({ ...emptyForm, tripId: defaultTripIdRef.current ?? '' });
      setCoverPreview('');
      setCoverTransform(undefined);
      coverFileRef.current = null;
      setGeocoded(null);
    }
    setStep('form');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof typeof emptyForm>(field: K, value: typeof emptyForm[K]) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    coverFileRef.current = file;
    setCoverTransform(undefined);
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleLocate(place: LocatedPlace) {
    isSelectingRef.current = true;
    setGeocoded({ lat: place.lat, lng: place.lng, city: place.city, country: place.country });
    set('address', place.address);
    if (!form.city  && place.city)    set('city',    place.city);
    if (!form.country && place.country) set('country', place.country);
    setTimeout(() => { isSelectingRef.current = false; }, 50);
  }

  const isValid = form.restaurantName.trim() && form.date;

  async function handleSubmit() {
    if (!isValid) return;
    let photo: string | null = null;
    if (coverPreview) {
      photo = coverPreview.startsWith('data:') && coverFileRef.current
        ? await uploadPhoto(coverFileRef.current)
        : coverPreview;
    }
    const transform = imgRef.current?.getTransform();
    if (photo && initialDining?.log.photos[0] && photo !== initialDining.log.photos[0]) {
      deleteStoragePhoto(initialDining.log.photos[0]);
    }
    const trip = trips.find(t => t.id === form.tripId);

    let resolvedGeocode = geocoded;
    if (!geocoded && form.address.trim()) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(form.address)}&format=json&limit=1&addressdetails=1`,
          { headers: { 'Accept-Language': 'en-US' } }
        );
        const results = await res.json();
        if (results[0]) {
          const r = results[0];
          resolvedGeocode = {
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            city: r.address?.city ?? r.address?.town ?? r.address?.village ?? r.address?.county ?? '',
            country: r.address?.country ?? '',
          };
        }
      } catch { /* proceed with no coordinates */ }
    }

    const location = resolvedGeocode
      ? { ...resolvedGeocode, address: form.address.trim() || undefined }
      : { lat: 0, lng: 0, city: '', country: '', address: form.address.trim() || undefined };

    const log: DiningLog = {
      id: initialDining?.log.id ?? `dining-${Date.now()}`,
      ...(initialDining?.log.ownerId ? { ownerId: initialDining.log.ownerId } : {}),
      restaurantName: form.restaurantName.trim(),
      cuisine: form.cuisine.trim(),
      date: form.date,
      time: (form.meal || 'Dinner') as DiningLog['time'],
      totalExpense: parseFloat(form.expense) || 0,
      currency: form.currency,
      overallRating: parseFloat(form.rating) || 0,
      location,
      photos: photo ? [photo] : (initialDining?.log.photos ?? []),
      photoTransform: transform,
      dishes: initialDining?.log.dishes ?? [],
      ...(form.michelinStars > 0 ? { michelinStars: form.michelinStars as 1 | 2 | 3 } : {}),
    };

    if (isEdit && initialDining) {
      const wasStandalone = !initialDining.tripId;
      const isNowStandalone = !form.tripId;
      const oldTrip = trips.find(t => t.id === initialDining.tripId);

      if (wasStandalone && isNowStandalone) {
        updateStandaloneRestaurant(log);
      } else if (wasStandalone && !isNowStandalone) {
        // Detach from local state only; syncTrip UPDATE will change trip_id in DB
        detachStandaloneRestaurant(initialDining.log.id);
        if (trip) updateTrip({ ...trip, diningLogs: [...trip.diningLogs, log] });
      } else if (!wasStandalone && isNowStandalone) {
        if (oldTrip) updateTrip({ ...oldTrip, diningLogs: oldTrip.diningLogs.filter(d => d.id !== log.id) });
        addStandaloneRestaurant(log);
      } else {
        if (oldTrip) {
          if (trip && trip.id === oldTrip.id) {
            updateTrip({ ...oldTrip, diningLogs: oldTrip.diningLogs.map(d => d.id === log.id ? log : d) });
          } else {
            updateTrip({ ...oldTrip, diningLogs: oldTrip.diningLogs.filter(d => d.id !== log.id) });
            if (trip) updateTrip({ ...trip, diningLogs: [...trip.diningLogs, log] });
          }
        }
      }
    } else {
      if (trip) {
        updateTrip({ ...trip, diningLogs: [...trip.diningLogs, log] });
      } else {
        addStandaloneRestaurant(log);
      }
    }
    setStep('done');
    setTimeout(() => { onClose(); setStep('form'); }, 1400);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full"
              style={{ maxWidth: 880 }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <h2 className="serif text-lg font-semibold text-[#1A1A1A]">{isEdit ? 'Edit Restaurant' : 'Add a Restaurant'}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 max-h-[70vh] overflow-y-auto">
                {step === 'form' && (
                  <div className="space-y-3">

                    {/* Row 1: Name / Cuisine / Meal / Date + Cover photo */}
                    <div className="flex gap-5">
                      <div className="flex-1 space-y-3 min-w-0">
                        <div>
                          <label className={LABEL}>Restaurant Name</label>
                          <input type="text" placeholder="e.g. Izumo Ikebukuro" value={form.restaurantName}
                            onChange={e => set('restaurantName', e.target.value)} className={INPUT} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={LABEL}>Cuisine</label>
                            <input type="text" placeholder="e.g. Japanese" value={form.cuisine}
                              onChange={e => set('cuisine', e.target.value)} className={INPUT} />
                          </div>
                          <div>
                            <label className={LABEL}>Meal Type</label>
                            <select value={form.meal} onChange={e => set('meal', e.target.value as typeof MEAL_OPTIONS[number] | '')} className={`${SELECT} ${form.meal === '' ? 'text-[#C0BAB2]' : 'text-[#1A1A1A]'}`}>
                              <option value="">Select…</option>
                              {MEAL_OPTIONS.map(m => <option key={m} value={m} className="text-[#1A1A1A]">{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <DatePickerInput label="Date" value={form.date} onChange={v => set('date', v)} />
                      </div>

                      {/* Cover photo — aligned with the top block only */}
                      <div className="flex-1 flex flex-col">
                        <label className={LABEL}>Cover Photo <span className="normal-case font-normal text-[#C0BAB2]">(optional)</span></label>
                        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handleImageChange} />
                        {coverPreview ? (
                          <div className="w-full flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors relative">
                            <DraggableImage
                              ref={imgRef}
                              src={coverPreview}
                              alt="Cover"
                              onReplace={() => fileRef.current?.click()}
                              initialTransform={coverTransform}
                              onTransformChange={t => setCoverTransform(t)}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors group relative"
                          >
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors p-4">
                              <ImagePlus size={22} strokeWidth={1.5} />
                              <span className="text-[11px] font-medium text-center leading-tight">Click to upload</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Rating | Expense | Michelin Stars | Add to Trip */}
                    <div className="grid grid-cols-8 gap-3 items-end">
                      <div className="col-span-2">
                        <label className={LABEL}>Rating <span className="normal-case font-normal text-[#C0BAB2]">(0–5)</span></label>
                        <input type="text" inputMode="decimal" placeholder="e.g. 4.5"
                          value={form.rating}
                          onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) set('rating', v); }}
                          className={INPUT} />
                      </div>
                      <div className="col-span-2">
                        <label className={LABEL}>Total Expense</label>
                        <div className="flex gap-1.5">
                          <input type="text" inputMode="decimal" placeholder="0" value={form.expense}
                            onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) set('expense', e.target.value); }} className={`${INPUT} flex-1`} />
                          <select value={form.currency} onChange={e => set('currency', e.target.value)}
                            className="text-sm border border-[#E8E6E1] rounded-xl px-2 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] bg-white transition-colors w-14 appearance-none flex-shrink-0">
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className={LABEL}>Michelin Stars</label>
                        <div className="flex gap-1.5">
                          {MICHELIN.map(n => (
                            <button
                              key={n}
                              onClick={() => set('michelinStars', n)}
                              className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                                form.michelinStars === n
                                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                  : 'border-[#E8E6E1] text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53]'
                              }`}
                            >
                              {n === 0 ? 'None' : '★'.repeat(n)}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className={LABEL}>Add to Trip <span className="normal-case font-normal text-[#C0BAB2]">(optional)</span></label>
                        <select value={form.tripId} onChange={e => set('tripId', e.target.value)} className={`${SELECT} ${form.tripId === '' ? 'text-[#C0BAB2]' : 'text-[#1A1A1A]'}`}>
                          <option value="">Select a trip…</option>
                          {trips.map(t => <option key={t.id} value={t.id} className="text-[#1A1A1A]">{t.title}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Row 3: Address */}
                    <div>
                      <label className={LABEL}>Address</label>
                      <AddressSearchBox
                        value={form.address}
                        onChange={v => { if (!isSelectingRef.current) setGeocoded(null); set('address', v); }}
                        onLocate={handleLocate}
                        onClear={() => setGeocoded(null)}
                      />
                    </div>

                    {/* Mini-map preview — shown after address is located */}
                    {geocoded && geocoded.lat !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 140 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <InlineMapPreview lat={geocoded.lat} lng={geocoded.lng} />
                      </motion.div>
                    )}

                  </div>
                )}

                {step === 'done' && (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-1">{isEdit ? 'Changes Saved' : 'Restaurant Added'}</h3>
                  </div>
                )}
              </div>

              {step === 'form' && (
                <div className="px-5 pb-4 pt-0 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isEdit ? 'Save Changes' : 'Add Restaurant'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
