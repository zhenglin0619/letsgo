'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ImagePlus } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { Trip } from '@/types';
import DatePickerInput from '@/components/ui/DatePickerInput';
import GeoAutocomplete from '@/components/ui/GeoAutocomplete';
import DraggableImage, { type DraggableImageHandle } from '@/components/ui/DraggableImage';
import { uploadPhoto, deleteStoragePhoto } from '@/lib/imageUtils';
import type { PhotoTransform } from '@/types';

interface Props {
  open: boolean;
  onClose: () => void;
  initialTrip?: Trip;
}

const emptyForm = { title: '', country: '', city: '', startDate: '', endDate: '' };
const DRAFT_KEY = 'foodprint-draft-trip';

interface TripDraft {
  form: typeof emptyForm;
  coverPreview: string;
  coverTransform?: PhotoTransform;
  highlightPhotos: string[];
}

export default function AddTripModal({ open, onClose, initialTrip }: Props) {
  const { addTrip, updateTrip } = useTrips();
  const isEdit = !!initialTrip;
  const [form, setForm] = useState(emptyForm);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverTransform, setCoverTransform] = useState<PhotoTransform | undefined>(undefined);
  const [highlightPhotos, setHighlightPhotos] = useState<string[]>([]);
  const [step, setStep] = useState<'form' | 'done' | 'draft-saved'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const highlightFileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<DraggableImageHandle>(null);
  const coverFileRef = useRef<File | null>(null);

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
      setCoverTransform(initialTrip.coverPhotoTransform);
      setHighlightPhotos(initialTrip.photos ?? []);
    } else {
      let loaded = false;
      const draftRaw = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_KEY) : null;
      if (draftRaw) {
        try {
          const draft: TripDraft = JSON.parse(draftRaw);
          setForm({ ...emptyForm, ...draft.form });
          setCoverPreview(draft.coverPreview || '');
          setCoverTransform(draft.coverTransform);
          setHighlightPhotos(draft.highlightPhotos || []);
          loaded = true;
        } catch { /* ignore corrupt draft */ }
      }
      if (!loaded) {
        setForm(emptyForm);
        setCoverPreview('');
        setCoverTransform(undefined);
        setHighlightPhotos([]);
      }
      coverFileRef.current = null;
    }
    setStep('form');
    setSubmitting(false);
    setSavingDraft(false);
  }, [open, initialTrip]);

  function set(field: string, value: string) {
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

  const MAX_HIGHLIGHT = 20;

  function handleHighlightImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    files.slice(0, MAX_HIGHLIGHT).forEach(file => {
      uploadPhoto(file).then(url => {
        setHighlightPhotos(prev => {
          if (prev.length >= MAX_HIGHLIGHT) return prev;
          return [...prev, url];
        });
      });
    });
  }


  const isValid = form.title.trim() && form.country.trim() && form.city.trim() && form.startDate && form.endDate;

  async function handleSaveDraft() {
    if (savingDraft || submitting) return;
    setSavingDraft(true);
    let photoUrl = coverPreview;
    if (coverPreview.startsWith('data:') && coverFileRef.current) {
      photoUrl = await uploadPhoto(coverFileRef.current);
      coverFileRef.current = null;
    }
    const transform = imgRef.current?.getTransform();
    const draft: TripDraft = { form, coverPreview: photoUrl, coverTransform: transform, highlightPhotos };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    setCoverPreview(photoUrl);
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
    // Upload original file if the user just picked a new photo; keep URL for existing ones
    let photoUrl = coverPreview;
    if (coverPreview.startsWith('data:') && coverFileRef.current) {
      photoUrl = await uploadPhoto(coverFileRef.current);
    }
    const transform = imgRef.current?.getTransform();
    if (isEdit && photoUrl !== initialTrip!.coverPhoto) {
      deleteStoragePhoto(initialTrip!.coverPhoto);
    }
    if (isEdit) {
      updateTrip({
        ...initialTrip!,
        title:               form.title.trim(),
        countries:           [form.country.trim()],
        city:                form.city.trim(),
        startDate:           form.startDate,
        endDate:             form.endDate,
        coverPhoto:          photoUrl,
        coverPhotoTransform: transform,
        photos:              highlightPhotos,
      });
    } else {
      const id = `${form.city.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
      addTrip({
        id,
        title:               form.title.trim(),
        coverPhoto:          photoUrl,
        coverPhotoTransform: transform,
        startDate:           form.startDate,
        endDate:             form.endDate,
        countries:           [form.country.trim()],
        city:                form.city.trim(),
        photos:              highlightPhotos,
        hotels:              [],
        diningLogs:          [],
      });
    }
    if (!isEdit) localStorage.removeItem(DRAFT_KEY);
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
              style={{ maxWidth: 720 }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#E8E6E1]">
                <h2 className="serif text-lg font-semibold text-[#1A1A1A]">{isEdit ? 'Edit Trip' : 'Add a Trip'}</h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 md:p-6">
                {step === 'form' && (
                  <>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-5">
                      {/* Left: form fields */}
                      <div className="flex-1 space-y-3 md:space-y-5 min-w-0 order-last md:order-none">
                        <div>
                          <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                            Trip Name <span className="normal-case font-normal text-[#C0BAB2]">(required)</span>
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
                          <GeoAutocomplete
                            label={<>City <span className="normal-case font-normal text-[#C0BAB2]">(required)</span></>}
                            placeholder="e.g. Tokyo"
                            value={form.city}
                            onChange={v => set('city', v)}
                            types="place"
                            onSelectCountry={c => { if (!form.country) set('country', c); }}
                          />
                          <GeoAutocomplete
                            label={<>Country <span className="normal-case font-normal text-[#C0BAB2]">(required)</span></>}
                            placeholder="e.g. Japan"
                            value={form.country}
                            onChange={v => set('country', v)}
                            types="country"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <DatePickerInput
                            label={<>Start Date <span className="normal-case font-normal text-[#C0BAB2]">(required)</span></>}
                            value={form.startDate}
                            onChange={v => set('startDate', v)}
                            placement="above"
                          />
                          <DatePickerInput
                            label={<>End Date <span className="normal-case font-normal text-[#C0BAB2]">(required)</span></>}
                            value={form.endDate}
                            onChange={v => set('endDate', v)}
                            min={form.startDate}
                            defaultMonth={form.startDate}
                            placement="above"
                          />
                        </div>

                        {/* Highlight Photos — row 4 */}
                        <input
                          ref={highlightFileRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
                          multiple
                          className="hidden"
                          onChange={handleHighlightImages}
                        />
                        <div>
                          <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                            Highlight Photos
                          </label>
                          <button
                            type="button"
                            onClick={() => highlightPhotos.length < MAX_HIGHLIGHT && highlightFileRef.current?.click()}
                            disabled={highlightPhotos.length >= MAX_HIGHLIGHT}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-[#E8E6E1] hover:border-[#C87A53] transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
                          >
                            <ImagePlus size={15} className="text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors" />
                            <span className="text-sm text-[#8A8A8A]">
                              {highlightPhotos.length > 0 ? `${highlightPhotos.length}/${MAX_HIGHLIGHT} photos added` : 'Click to add photos (0/20)'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Right: cover photo upload */}
                      <div className="w-full md:w-72 md:flex-shrink-0 flex flex-col order-first md:order-none">
                        <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
                          Cover Photo
                        </label>
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        {coverPreview ? (
                          <div className="w-full aspect-video md:aspect-auto md:flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors relative">
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
                            className="w-full aspect-video md:aspect-auto md:flex-1 rounded-xl border-2 border-dashed border-[#E8E6E1] overflow-hidden hover:border-[#C87A53] transition-colors group relative"
                          >
                            <div className="flex flex-col items-center justify-center h-full gap-2 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors p-4">
                              <ImagePlus size={24} />
                              <span className="text-[11px] font-medium text-center leading-tight">Click to upload cover</span>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
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
                  </div>
                )}

                {step === 'draft-saved' && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', damping: 12 }}
                      className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={32} className="text-green-500" />
                    </motion.div>
                    <h3 className="serif text-xl font-semibold text-[#1A1A1A] mb-1">Draft Saved</h3>
                  </div>
                )}
              </div>

              {step === 'form' && (
                <div className="px-3 pb-3 pt-0 md:px-6 md:pb-6 flex justify-end gap-3">
                  {!isEdit && (
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={submitting || savingDraft}
                      className="text-sm font-medium px-6 py-2.5 rounded-full border border-[#E8E6E1] text-[#1A1A1A] hover:border-[#C87A53] hover:text-[#C87A53] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Draft
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!isValid || submitting}
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
