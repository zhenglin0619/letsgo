'use client';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ImagePlus } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import type { TranslationKey } from '@/lib/i18n';
import { HotelLog } from '@/types';
import DatePickerInput from '@/components/ui/DatePickerInput';
import type { LocatedPlace } from '@/components/ui/AddressSearchBox';
import DraggableImage, { type DraggableImageHandle } from '@/components/ui/DraggableImage';
import { uploadPhoto, deleteStoragePhoto } from '@/lib/imageUtils';
import type { PhotoTransform } from '@/types';

const AddressSearchBox = dynamic(() => import('@/components/ui/AddressSearchBox'), {
  ssr: false,
  loading: () => <input className="w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 text-[#C0BAB2]" placeholder="…" disabled />,
});
const InlineMapPreview = dynamic(() => import('@/components/ui/InlineMapPreview'), { ssr: false });

interface Props {
  open: boolean;
  onClose: () => void;
  defaultTripId?: string;
  initialHotel?: { hotel: HotelLog; tripId: string };
}

const ROOM_TYPES = ['Villa', 'Suite', 'King', 'Queen', 'Twin', 'Studio'] as const;
const VIEW_TYPES = ['City View', 'Ocean View', 'Lake View', 'River View', 'Mountain View', 'Garden View', 'Park View', 'No View'] as const;
const ROOM_LABELS: Record<string, TranslationKey> = {
  'Villa': 'room_villa', 'Suite': 'room_suite', 'King': 'room_king',
  'Queen': 'room_queen', 'Twin': 'room_twin', 'Studio': 'room_studio',
};
const VIEW_LABELS: Record<string, TranslationKey> = {
  'City View': 'view_city', 'Ocean View': 'view_ocean', 'Lake View': 'view_lake',
  'River View': 'view_river', 'Mountain View': 'view_mountain', 'Garden View': 'view_garden',
  'Park View': 'view_park', 'No View': 'view_no_view',
};
const CURRENCIES = ['USD', 'CNY', 'HKD', 'JPY', 'EUR', 'GBP', 'SGD', 'MYR', 'AUD', 'CAD'];

const INPUT  = 'w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors';
const LABEL  = 'text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1 block pl-1';
const SELECT = 'w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] bg-white transition-colors appearance-none';

const emptyForm = {
  hotelName: '',
  checkIn: '',
  checkOut: '',
  roomType: '',
  viewType: '',
  rating: '',
  expense: '',
  currency: 'USD',
  address: '',
  tripId: '',
};
const DRAFT_KEY = 'foodprint-draft-hotel';

interface HotelDraft {
  form: typeof emptyForm;
  coverPreview: string;
  coverTransform?: PhotoTransform;
  geocoded: { lat: number; lng: number; city: string; country: string } | null;
}

export default function AddHotelModal({ open, onClose, defaultTripId, initialHotel }: Props) {
  const { trips, updateTrip, addStandaloneHotel, updateStandaloneHotel, deleteStandaloneHotel, detachStandaloneHotel } = useTrips();
  const { t } = useLanguage();
  const isEdit = !!initialHotel;
  const [form, setForm] = useState(emptyForm);
  const [coverPreview, setCoverPreview] = useState('');
  const [coverTransform, setCoverTransform] = useState<PhotoTransform | undefined>(undefined);
  const [step, setStep] = useState<'form' | 'done' | 'draft-saved'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [geocoded, setGeocoded] = useState<{ lat: number; lng: number; city: string; country: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<DraggableImageHandle>(null);
  const coverFileRef = useRef<File | null>(null);
  const isSelectingRef = useRef(false);

  const initialHotelRef = useRef(initialHotel);
  initialHotelRef.current = initialHotel;
  const defaultTripIdRef = useRef(defaultTripId);
  defaultTripIdRef.current = defaultTripId;

  useEffect(() => {
    if (!open) { setForm(emptyForm); setCoverPreview(''); setCoverTransform(undefined); coverFileRef.current = null; setStep('form'); setSubmitting(false); setGeocoded(null); return; }
    const init = initialHotelRef.current;
    if (init) {
      const { hotel, tripId } = init;
      setForm({
        hotelName: hotel.hotelName,
        checkIn: hotel.checkIn,
        checkOut: hotel.checkOut,
        roomType: hotel.roomType ?? '',
        viewType: hotel.viewType ?? '',
        rating: hotel.rating ? String(hotel.rating) : '',
        expense: hotel.pricePerNight ? String(hotel.pricePerNight) : '',
        currency: hotel.currency,
        address: hotel.location.address ?? '',
        tripId,
      });
      setCoverPreview(hotel.photos[0] ?? '');
      setCoverTransform(hotel.photoTransform);
      setGeocoded({ lat: hotel.location.lat, lng: hotel.location.lng, city: hotel.location.city, country: hotel.location.country });
    } else {
      let loaded = false;
      const draftRaw = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null;
      if (draftRaw) {
        try {
          const draft: HotelDraft = JSON.parse(draftRaw);
          setForm({ ...emptyForm, ...draft.form, tripId: draft.form.tripId || defaultTripIdRef.current || '' });
          setCoverPreview(draft.coverPreview || '');
          setCoverTransform(draft.coverTransform);
          setGeocoded(draft.geocoded ?? null);
          loaded = true;
        } catch { /* ignore corrupt draft */ }
      }
      if (!loaded) {
        setForm({ ...emptyForm, tripId: defaultTripIdRef.current ?? '' });
        setCoverPreview('');
        setCoverTransform(undefined);
        setGeocoded(null);
      }
      coverFileRef.current = null;
    }
    setStep('form');
    setSavingDraft(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function set<K extends keyof typeof emptyForm>(field: K, value: string) {
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
    setTimeout(() => { isSelectingRef.current = false; }, 50);
  }

  const isValid = form.hotelName.trim() && form.checkIn && form.checkOut && form.address.trim();

  async function handleSaveDraft() {
    if (savingDraft || submitting) return;
    setSavingDraft(true);
    let photo = coverPreview;
    if (coverPreview.startsWith('data:') && coverFileRef.current) {
      photo = await uploadPhoto(coverFileRef.current);
      coverFileRef.current = null;
    }
    const transform = imgRef.current?.getTransform();
    const draft: HotelDraft = { form, coverPreview: photo, coverTransform: transform, geocoded };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setCoverPreview(photo);
    setCoverTransform(transform);
    setStep('draft-saved');
    setTimeout(() => {
      onClose();
      setStep('form');
      setSavingDraft(false);
    }, 1400);
  }

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);
    let photo: string | null = null;
    if (coverPreview) {
      photo = coverPreview.startsWith('data:') && coverFileRef.current
        ? await uploadPhoto(coverFileRef.current)
        : coverPreview;
    }
    const transform = imgRef.current?.getTransform();
    if (photo && initialHotel?.hotel.photos[0] && photo !== initialHotel.hotel.photos[0]) {
      deleteStoragePhoto(initialHotel.hotel.photos[0]);
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

    const hotel: HotelLog = {
      id: initialHotel?.hotel.id ?? `hotel-${Date.now()}`,
      ...(initialHotel?.hotel.ownerId ? { ownerId: initialHotel.hotel.ownerId } : {}),
      hotelName: form.hotelName.trim(),
      checkIn: form.checkIn,
      checkOut: form.checkOut,
      ...(form.roomType ? { roomType: form.roomType } : {}),
      ...(form.viewType ? { viewType: form.viewType } : {}),
      rating: parseFloat(form.rating) || 0,
      pricePerNight: parseFloat(form.expense) || 0,
      currency: form.currency,
      location,
      photos: photo ? [photo] : (initialHotel?.hotel.photos ?? []),
      photoTransform: transform,
      notes: initialHotel?.hotel.notes ?? '',
    };

    if (isEdit && initialHotel) {
      const oldTrip = trips.find(t => t.id === initialHotel.tripId);
      if (oldTrip) {
        if (trip && trip.id === oldTrip.id) {
          updateTrip({ ...oldTrip, hotels: oldTrip.hotels.map(h => h.id === hotel.id ? hotel : h) });
        } else {
          updateTrip({ ...oldTrip, hotels: oldTrip.hotels.filter(h => h.id !== hotel.id) });
          if (trip) updateTrip({ ...trip, hotels: [...trip.hotels, hotel] });
          else addStandaloneHotel(hotel);
        }
      } else {
        if (trip) {
          // Was standalone — remove from standaloneHotels before adding to the trip
          if (!initialHotel.tripId) detachStandaloneHotel(hotel.id);
          updateTrip({ ...trip, hotels: [...trip.hotels, hotel] });
        } else {
          updateStandaloneHotel(hotel);
        }
      }
    } else if (trip) {
      updateTrip({ ...trip, hotels: [...trip.hotels, hotel] });
    } else {
      addStandaloneHotel(hotel);
    }

    if (!isEdit) localStorage.removeItem(DRAFT_KEY);
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
              style={{ maxWidth: 720 }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#E8E6E1]">
                <h2 className="serif text-lg font-semibold text-[#1A1A1A]">{isEdit ? t('hotel_modal_edit') : t('hotel_modal_add')}</h2>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 md:p-5 max-h-[70vh] overflow-y-auto">
                {step === 'form' && (
                  <div className="space-y-3">

                    {/* Row 1: Name / Dates / Room+View (left) + Cover photo (right, 3 rows tall) */}
                    <div className="flex flex-col md:flex-row gap-3 md:gap-5">
                      <div className="flex-1 space-y-3 min-w-0 order-last md:order-none">
                        <div>
                          <label className={LABEL}>{t('hotel_modal_name')} <span className="normal-case font-normal text-[#C0BAB2]">{t('form_required')}</span></label>
                          <input type="text" placeholder={t('hotel_modal_name_ph')} value={form.hotelName}
                            onChange={e => set('hotelName', e.target.value)} className={INPUT} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <DatePickerInput label={<>{t('hotel_modal_checkin')} <span className="normal-case font-normal text-[#C0BAB2]">{t('form_required')}</span></>} value={form.checkIn} onChange={v => set('checkIn', v)} />
                          <DatePickerInput label={<>{t('hotel_modal_checkout')} <span className="normal-case font-normal text-[#C0BAB2]">{t('form_required')}</span></>} value={form.checkOut} onChange={v => set('checkOut', v)}
                            min={form.checkIn} defaultMonth={form.checkIn} />
                        </div>
                        <div className="grid grid-cols-3 md:grid-cols-2 gap-2 md:gap-3">
                          <div>
                            <label className={LABEL}>{t('hotel_modal_room_type')}</label>
                            <select value={form.roomType} onChange={e => set('roomType', e.target.value)} className={`${SELECT} ${form.roomType === '' ? 'text-[#C0BAB2]' : 'text-[#1A1A1A]'}`}>
                              <option value="">{t('form_select')}</option>
                              {ROOM_TYPES.map(r => <option key={r} value={r} className="text-[#1A1A1A]">{t(ROOM_LABELS[r])}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={LABEL}>{t('hotel_modal_view_type')}</label>
                            <select value={form.viewType} onChange={e => set('viewType', e.target.value)} className={`${SELECT} ${form.viewType === '' ? 'text-[#C0BAB2]' : 'text-[#1A1A1A]'}`}>
                              <option value="">{t('form_select')}</option>
                              {VIEW_TYPES.map(v => <option key={v} value={v} className="text-[#1A1A1A]">{t(VIEW_LABELS[v])}</option>)}
                            </select>
                          </div>
                          <div className="md:hidden">
                            <label className={LABEL}>{t('form_rating')} <span className="normal-case font-normal text-[#C0BAB2]">(0–5)</span></label>
                            <input type="text" inputMode="decimal" placeholder="e.g. 4.5"
                              value={form.rating}
                              onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) set('rating', v); }}
                              className={INPUT} />
                          </div>
                        </div>
                      </div>

                      {/* Cover photo */}
                      <div className="w-full md:flex-1 flex flex-col order-first md:order-none">
                        <label className={LABEL}>{t('form_cover_photo')}</label>
                        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handleImageChange} />
                        {coverPreview ? (
                          <div className="w-full aspect-[16/9] md:aspect-auto md:flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors relative">
                            <DraggableImage
                              ref={imgRef}
                              src={coverPreview}
                              alt="Cover"
                              onReplace={() => fileRef.current?.click()}
                              initialTransform={coverTransform}
                              onTransformChange={tx => setCoverTransform(tx)}
                            />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="w-full aspect-[2/1] md:aspect-auto md:flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors group relative"
                          >
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors p-4">
                              <ImagePlus size={22} strokeWidth={1.5} />
                              <span className="text-[11px] font-medium text-center leading-tight">{t('form_click_upload')}</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Row 2: Rating + Expense (left) | Add to Trip (right) */}
                    <div className="grid grid-cols-2 gap-3 md:gap-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="hidden md:block">
                          <label className={LABEL}>{t('form_rating')} <span className="normal-case font-normal text-[#C0BAB2]">(0–5)</span></label>
                          <input type="text" inputMode="decimal" placeholder="e.g. 4.5"
                            value={form.rating}
                            onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) set('rating', v); }}
                            className={INPUT} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                          <label className={LABEL}>{t('form_total_expense')}</label>
                          <div className="flex gap-1.5">
                            <input type="text" inputMode="decimal" placeholder="0" value={form.expense}
                              onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) set('expense', e.target.value); }}
                              className={`${INPUT} flex-1`} />
                            <select value={form.currency} onChange={e => set('currency', e.target.value)}
                              className="text-sm border border-[#E8E6E1] rounded-xl px-2 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] bg-white transition-colors w-14 appearance-none flex-shrink-0">
                              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className={LABEL}>{t('form_add_to_trip')}</label>
                        <select value={form.tripId} onChange={e => set('tripId', e.target.value)} className={`${SELECT} ${form.tripId === '' ? 'text-[#C0BAB2]' : 'text-[#1A1A1A]'}`}>
                          <option value="">{t('form_select_trip')}</option>
                          {trips.map(t => <option key={t.id} value={t.id} className="text-[#1A1A1A]">{t.title}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className={LABEL}>{t('form_address')} <span className="normal-case font-normal text-[#C0BAB2]">{t('form_required')}</span></label>
                      <AddressSearchBox
                        value={form.address}
                        onChange={v => { if (!isSelectingRef.current) setGeocoded(null); set('address', v); }}
                        onLocate={handleLocate}
                        onClear={() => setGeocoded(null)}
                      />
                    </div>

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
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-1">{isEdit ? t('form_changes_saved') : t('hotel_modal_created')}</h3>
                  </div>
                )}

                {step === 'draft-saved' && (
                  <div className="text-center py-10">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-1">{t('form_draft_saved')}</h3>
                  </div>
                )}
              </div>

              {step === 'form' && (
                <div className="px-4 pb-3 pt-0 md:px-5 md:pb-4 flex justify-end gap-3">
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={submitting || savingDraft}
                      className="text-sm font-medium px-6 py-2.5 rounded-full border border-[#E8E6E1] text-[#1A1A1A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {t('form_save_draft')}
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
                    className="bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isEdit ? t('form_save_changes') : t('hotel_modal_create')}
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
