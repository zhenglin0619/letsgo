'use client';
import { useState, useRef } from 'react';
import { Trip, HotelLog, DiningLog } from '@/types';
import { ImagePlus, Plus, Trash2, ChevronDown, ChevronUp, Save, X } from 'lucide-react';
import DatePickerInput from '@/components/ui/DatePickerInput';

const INPUT  = 'w-full text-sm border border-[#E8E6E1] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors bg-white';
const LABEL  = 'text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1';
const SELECT = `${INPUT} cursor-pointer`;

function blankHotel(): HotelLog {
  return {
    id: `hotel-${Date.now()}`,
    hotelName: '', checkIn: '', checkOut: '',
    rating: 4,
    location: { lat: 0, lng: 0, city: '', country: '' },
    photos: [], notes: '',
    pricePerNight: 0, currency: 'USD',
  };
}

function blankDining(): DiningLog {
  return {
    id: `dining-${Date.now()}`,
    restaurantName: '', cuisine: '',
    date: '', time: 'Dinner',
    totalExpense: 0, currency: 'USD',
    overallRating: 4,
    location: { lat: 0, lng: 0, city: '', country: '' },
    photos: [], dishes: [],
  };
}

// ── Hotel card ────────────────────────────────────────────────────────────────
function HotelCard({ hotel, onChange, onDelete }: {
  hotel: HotelLog;
  onChange: (h: HotelLog) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(!hotel.hotelName);

  const s = (f: keyof HotelLog, v: string | number) => onChange({ ...hotel, [f]: v });
  const loc = (f: string, v: string) => onChange({ ...hotel, location: { ...hotel.location, [f]: v } });

  return (
    <div className="border border-[#E8E6E1] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF8] cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}>
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">{hotel.hotelName || <span className="text-[#C0BAB2]">New Stay</span>}</p>
          {hotel.checkIn && <p className="text-xs text-[#8A8A8A] mt-0.5">{hotel.checkIn} – {hotel.checkOut}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={14} className="text-[#8A8A8A]" /> : <ChevronDown size={14} className="text-[#8A8A8A]" />}
        </div>
      </div>

      {open && (
        <div className="p-4 grid grid-cols-2 gap-3 bg-white">
          <div className="col-span-2">
            <label className={LABEL}>Hotel Name</label>
            <input value={hotel.hotelName} onChange={e => s('hotelName', e.target.value)}
              placeholder="e.g. Aman Tokyo" className={INPUT} />
          </div>
          <div>
            <DatePickerInput label="Check-in" value={hotel.checkIn} onChange={v => s('checkIn', v)} />
          </div>
          <div>
            <DatePickerInput label="Check-out" value={hotel.checkOut} onChange={v => s('checkOut', v)}
              min={hotel.checkIn} defaultMonth={hotel.checkIn} />
          </div>
          <div>
            <label className={LABEL}>City</label>
            <input value={hotel.location.city} onChange={e => loc('city', e.target.value)}
              placeholder="e.g. Tokyo" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Country</label>
            <input value={hotel.location.country} onChange={e => loc('country', e.target.value)}
              placeholder="e.g. Japan" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={hotel.rating}
              onChange={e => s('rating', parseFloat(e.target.value) || 0)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Price / Night</label>
            <input type="number" min="0" value={hotel.pricePerNight}
              onChange={e => s('pricePerNight', parseFloat(e.target.value) || 0)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Currency</label>
            <input value={hotel.currency} onChange={e => s('currency', e.target.value)}
              placeholder="USD" className={INPUT} />
          </div>
          <div className="col-span-2">
            <label className={LABEL}>Notes</label>
            <textarea value={hotel.notes} onChange={e => s('notes', e.target.value)}
              placeholder="Your thoughts about this stay…" rows={2}
              className={`${INPUT} resize-none`} />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Dining card ───────────────────────────────────────────────────────────────
function DiningCard({ dining, onChange, onDelete }: {
  dining: DiningLog;
  onChange: (d: DiningLog) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(!dining.restaurantName);

  const s = (f: keyof DiningLog, v: string | number | undefined) =>
    onChange({ ...dining, [f]: v });
  const loc = (f: string, v: string) =>
    onChange({ ...dining, location: { ...dining.location, [f]: v } });

  return (
    <div className="border border-[#E8E6E1] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAF8] cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}>
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            {dining.restaurantName || <span className="text-[#C0BAB2]">New Dining</span>}
          </p>
          {dining.date && (
            <p className="text-xs text-[#8A8A8A] mt-0.5">{dining.date} · {dining.cuisine || dining.time}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors">
            <Trash2 size={13} />
          </button>
          {open ? <ChevronUp size={14} className="text-[#8A8A8A]" /> : <ChevronDown size={14} className="text-[#8A8A8A]" />}
        </div>
      </div>

      {open && (
        <div className="p-4 grid grid-cols-2 gap-3 bg-white">
          <div className="col-span-2">
            <label className={LABEL}>Restaurant Name</label>
            <input value={dining.restaurantName} onChange={e => s('restaurantName', e.target.value)}
              placeholder="e.g. Sukiyabashi Jiro" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Cuisine</label>
            <input value={dining.cuisine} onChange={e => s('cuisine', e.target.value)}
              placeholder="e.g. Sushi / Omakase" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Meal</label>
            <select value={dining.time}
              onChange={e => s('time', e.target.value as DiningLog['time'])}
              className={SELECT}>
              {(['Breakfast', 'Lunch', 'Dinner', 'Late Night'] as const).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <DatePickerInput label="Date" value={dining.date} onChange={v => s('date', v)} />
          </div>
          <div>
            <label className={LABEL}>Rating (0–5)</label>
            <input type="number" min="0" max="5" step="0.1" value={dining.overallRating}
              onChange={e => s('overallRating', parseFloat(e.target.value) || 0)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>City</label>
            <input value={dining.location.city} onChange={e => loc('city', e.target.value)}
              placeholder="e.g. Tokyo" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Country</label>
            <input value={dining.location.country} onChange={e => loc('country', e.target.value)}
              placeholder="e.g. Japan" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Total Expense</label>
            <input type="number" min="0" value={dining.totalExpense}
              onChange={e => s('totalExpense', parseFloat(e.target.value) || 0)} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Currency</label>
            <input value={dining.currency} onChange={e => s('currency', e.target.value)}
              placeholder="USD" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Michelin Stars</label>
            <select
              value={dining.michelinStars ?? ''}
              onChange={e => onChange({
                ...dining,
                michelinStars: e.target.value ? (parseInt(e.target.value) as 1 | 2 | 3) : undefined,
              })}
              className={SELECT}>
              <option value="">None</option>
              <option value="1">★ 1 Star</option>
              <option value="2">★★ 2 Stars</option>
              <option value="3">★★★ 3 Stars</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main edit view ────────────────────────────────────────────────────────────
interface Props {
  trip: Trip;
  onSave: (updated: Trip) => void;
  onCancel: () => void;
}

export default function TripEditView({ trip, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<Trip>({
    ...trip,
    hotels:     [...trip.hotels],
    diningLogs: [...trip.diningLogs],
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Trip>(k: K, v: Trip[K]) =>
    setDraft(p => ({ ...p, [k]: v }));

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set('coverPhoto', reader.result as string);
    reader.readAsDataURL(file);
  }

  const updateHotel  = (i: number, h: HotelLog) =>
    setDraft(p => { const a = [...p.hotels]; a[i] = h; return { ...p, hotels: a }; });
  const deleteHotel  = (i: number) =>
    setDraft(p => ({ ...p, hotels: p.hotels.filter((_, j) => j !== i) }));
  const addHotel     = () =>
    setDraft(p => ({ ...p, hotels: [...p.hotels, blankHotel()] }));

  const updateDining = (i: number, d: DiningLog) =>
    setDraft(p => { const a = [...p.diningLogs]; a[i] = d; return { ...p, diningLogs: a }; });
  const deleteDining = (i: number) =>
    setDraft(p => ({ ...p, diningLogs: p.diningLogs.filter((_, j) => j !== i) }));
  const addDining    = () =>
    setDraft(p => ({ ...p, diningLogs: [...p.diningLogs, blankDining()] }));

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-20 pb-20">
      {/* ── Top bar ── */}
      <div className="sticky top-16 z-40 bg-[#FAFAF8]/90 backdrop-blur border-b border-[#E8E6E1]">
        <div className="max-w-7xl mx-auto px-8 py-3 flex items-center justify-between">
          <p className="serif text-base font-semibold text-[#1A1A1A]">Editing · {draft.title || 'Trip'}</p>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#E8E6E1] text-sm font-medium text-[#8A8A8A] hover:text-[#1A1A1A] hover:border-[#C0BAB2] transition-colors">
              <X size={13} /> Cancel
            </button>
            <button onClick={() => onSave(draft)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors">
              <Save size={13} /> Save Changes
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-8 space-y-10">
        {/* ── Cover + metadata ── */}
        <div className="grid grid-cols-5 gap-6 items-start">
          {/* Cover */}
          <div className="col-span-2">
            <label className={LABEL}>Cover Photo</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImage} />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors group relative block"
              style={{ aspectRatio: '16/9' }}>
              {draft.coverPhoto ? (
                <>
                  <img src={draft.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImagePlus size={22} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors p-6 min-h-[160px]">
                  <ImagePlus size={26} />
                  <span className="text-xs font-medium">Click to upload cover</span>
                </div>
              )}
            </button>
          </div>

          {/* Trip fields */}
          <div className="col-span-3 flex flex-col gap-3">
            <div>
              <label className={LABEL}>Trip Name</label>
              <input value={draft.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Tokyo, Japan (Summer 2025)" className={INPUT} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL}>Country</label>
                <input value={draft.countries[0] || ''} onChange={e => set('countries', [e.target.value])}
                  placeholder="e.g. Japan" className={INPUT} />
              </div>
              <div>
                <label className={LABEL}>City</label>
                <input value={draft.city || ''} onChange={e => set('city', e.target.value)}
                  placeholder="e.g. Tokyo" className={INPUT} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DatePickerInput label="Start Date" value={draft.startDate}
                onChange={v => set('startDate', v)} />
              <DatePickerInput label="End Date" value={draft.endDate}
                onChange={v => set('endDate', v)} min={draft.startDate} defaultMonth={draft.startDate} />
            </div>
          </div>
        </div>

        {/* ── Stays ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="serif text-xl font-semibold text-[#1A1A1A]">Stays</h3>
            <button onClick={addHotel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E6E1] text-xs font-medium text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors">
              <Plus size={12} /> Add Stay
            </button>
          </div>
          {draft.hotels.length === 0 ? (
            <p className="text-sm text-[#C0BAB2] py-5 text-center border border-dashed border-[#E8E6E1] rounded-xl">
              No stays yet — click Add Stay to log one
            </p>
          ) : (
            <div className="space-y-2">
              {draft.hotels.map((h, i) => (
                <HotelCard key={h.id} hotel={h}
                  onChange={u => updateHotel(i, u)} onDelete={() => deleteHotel(i)} />
              ))}
            </div>
          )}
        </section>

        {/* ── Dining ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="serif text-xl font-semibold text-[#1A1A1A]">Dining</h3>
            <button onClick={addDining}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E8E6E1] text-xs font-medium text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors">
              <Plus size={12} /> Add Dining
            </button>
          </div>
          {draft.diningLogs.length === 0 ? (
            <p className="text-sm text-[#C0BAB2] py-5 text-center border border-dashed border-[#E8E6E1] rounded-xl">
              No dining yet — click Add Dining to log a meal
            </p>
          ) : (
            <div className="space-y-2">
              {draft.diningLogs.map((d, i) => (
                <DiningCard key={d.id} dining={d}
                  onChange={u => updateDining(i, u)} onDelete={() => deleteDining(i)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
