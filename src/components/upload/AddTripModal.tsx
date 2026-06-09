'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ImagePlus } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { Trip } from '@/types';
import DatePickerInput from '@/components/ui/DatePickerInput';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTrip?: Trip;
}

const emptyForm = { title: '', country: '', city: '', startDate: '', endDate: '' };

export default function AddTripModal({ open, onClose, initialTrip }: Props) {
  const { addTrip, updateTrip } = useTrips();
  const isEdit = !!initialTrip;
  const [form, setForm] = useState(emptyForm);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [step, setStep] = useState<'form' | 'done'>('form');
  const fileRef = useRef<HTMLInputElement>(null);

  // Re-initialize form whenever the modal opens (or switches trip)
  useEffect(() => {
    if (!open) return;
    if (initialTrip) {
      setForm({
        title:     initialTrip.title,
        country:   initialTrip.countries[0] || '',
        city:      initialTrip.city || '',
        startDate: initialTrip.startDate,
        endDate:   initialTrip.endDate,
      });
      setCoverPreview(initialTrip.coverPhoto || '');
    } else {
      setForm(emptyForm);
      setCoverPreview('');
    }
    setStep('form');
  }, [open, initialTrip]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCoverPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  const isValid = form.title.trim() && form.country.trim() && form.city.trim() && form.startDate && form.endDate;

  function handleSubmit() {
    if (!isValid) return;
    if (isEdit) {
      updateTrip({
        ...initialTrip!,
        title:      form.title.trim(),
        countries:  [form.country.trim()],
        city:       form.city.trim(),
        startDate:  form.startDate,
        endDate:    form.endDate,
        coverPhoto: coverPreview,
      });
    } else {
      const id = `${form.city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      addTrip({
        id,
        title:      form.title.trim(),
        coverPhoto: coverPreview,
        startDate:  form.startDate,
        endDate:    form.endDate,
        countries:  [form.country.trim()],
        city:       form.city.trim(),
        hotels:     [],
        diningLogs: [],
      });
    }
    setStep('done');
    setTimeout(() => {
      onClose();
      setStep('form');
    }, 1400);
  }

  function handleClose() {
    onClose();
    setStep('form');
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                <h2 className="serif text-lg font-semibold text-[#1A1A1A]">{isEdit ? 'Edit Trip' : 'Add a Trip'}</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                {step === 'form' && (
                  <div className="flex gap-5">
                    {/* Left: form fields */}
                    <div className="flex-1 space-y-5 min-w-0">
                      <div>
                        <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                          Trip Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Tokyo, Japan (Summer 2025)"
                          value={form.title}
                          onChange={e => set('title', e.target.value)}
                          className="w-full text-sm border border-[#E8E6E1] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                            Country
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Japan"
                            value={form.country}
                            onChange={e => set('country', e.target.value)}
                            className="w-full text-sm border border-[#E8E6E1] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                            City
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Tokyo"
                            value={form.city}
                            onChange={e => set('city', e.target.value)}
                            className="w-full text-sm border border-[#E8E6E1] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <DatePickerInput
                          label="Start Date"
                          value={form.startDate}
                          onChange={v => set('startDate', v)}
                        />
                        <DatePickerInput
                          label="End Date"
                          value={form.endDate}
                          onChange={v => set('endDate', v)}
                          min={form.startDate}
                          defaultMonth={form.startDate}
                        />
                      </div>
                    </div>

                    {/* Right: cover photo upload */}
                    <div className="w-80 flex-shrink-0 flex flex-col">
                      <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                        Cover Photo <span className="normal-case text-[#C0BAB2]">(optional)</span>
                      </label>
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-full flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors group relative"
                      >
                        {coverPreview ? (
                          <>
                            <img
                              src={coverPreview}
                              alt="Cover"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImagePlus size={20} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors p-4">
                            <ImagePlus size={24} />
                            <span className="text-[11px] font-medium text-center leading-tight">Click to upload cover</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'done' && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-1">{isEdit ? 'Changes Saved' : 'Trip Created'}</h3>
                    {isEdit && <p className="text-sm text-[#8A8A8A]">Your trip has been updated</p>}
                  </div>
                )}
              </div>

              {step === 'form' && (
                <div className="px-6 pb-6 pt-0 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid}
                    className="bg-[#1A1A1A] text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isEdit ? 'Save Changes' : 'Create Trip'}
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
