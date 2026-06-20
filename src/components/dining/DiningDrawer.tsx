'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { DiningLog, Dish } from '@/types';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import DishRow from './DishRow';
import { X, MapPin, GripVertical, Trash2, Plus, Check, ImagePlus, Pencil, MoreHorizontal, Users, LogOut } from 'lucide-react';
import DraggableImage, { type DraggableImageHandle } from '@/components/ui/DraggableImage';
import { fileToDataUrl, uploadPhoto, uploadDataUrl, deleteStoragePhoto } from '@/lib/imageUtils';
import { parseLocalDate } from '@/lib/formatUtils';
import { useLanguage } from '@/store/languageContext';
import type { TranslationKey } from '@/lib/i18n';

const CATEGORIES: Dish['category'][] = ['Appetizer', 'Mains', 'Dessert', 'Drinks', 'Snack'];
const emptyDishForm = { name: '', category: '' as Dish['category'], rating: '', notes: '', photo: '' };

const MEAL_LABELS: Record<string, TranslationKey> = {
  'Breakfast': 'meal_breakfast', 'Brunch': 'meal_brunch', 'Lunch': 'meal_lunch',
  'Afternoon Tea': 'meal_afternoon_tea', 'Dinner': 'meal_dinner', 'Late Night': 'meal_late_night',
};
const CATEGORY_LABELS: Record<string, TranslationKey> = {
  'Appetizer': 'dish_appetizer', 'Mains': 'dish_mains', 'Dessert': 'dish_dessert',
  'Drinks': 'dish_drinks', 'Snack': 'dish_snack',
};

interface Props {
  log: DiningLog | null;
  open: boolean;
  onClose: () => void;
  onUpdateLog?: (updated: DiningLog) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onLeave?: () => void;
  isOwner?: boolean;
}

// ── Draggable edit row ────────────────────────────────────────────────────────
function DishEditRow({
  dish,
  onChange,
  onDelete,
}: {
  dish: Dish;
  onChange: (updated: Dish) => void;
  onDelete: () => void;
}) {
  const controls = useDragControls();
  const fileRef = useRef<HTMLInputElement>(null);
  const [ratingStr, setRatingStr] = useState(dish.rating === 0 ? '' : String(dish.rating));
  const { t } = useLanguage();
  const INPUT = 'text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors';

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (dish.photo) deleteStoragePhoto(dish.photo);
    uploadPhoto(file).then(url => onChange({ ...dish, photo: url, photoTransform: undefined }));
  }

  return (
    <Reorder.Item value={dish} dragListener={false} dragControls={controls}
      className="bg-white rounded-xl border border-[#E8E6E1] p-3 select-none">
      <div className="flex items-center gap-2">
        {/* Drag handle */}
        <div
          onPointerDown={e => controls.start(e)}
          className="cursor-grab active:cursor-grabbing text-[#C0BAB2] hover:text-[#8A8A8A] flex-shrink-0 touch-none"
        >
          <GripVertical size={18} />
        </div>

        {/* Photo */}
        <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handlePhoto} />
        {dish.photo ? (
          <div className="flex-shrink-0 w-[104px] h-[104px] md:w-28 md:h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors relative bg-[#F5F2EE]">
            <DraggableImage
              src={dish.photo}
              alt={dish.name}
              onReplace={() => fileRef.current?.click()}
              onTransformChange={tx => onChange({ ...dish, photoTransform: tx })}
              initialTransform={dish.photoTransform}
              size="sm"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 w-[104px] h-[104px] md:w-28 md:h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors group relative bg-[#F5F2EE]"
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors">
              <ImagePlus size={16} />
              <span className="text-[9px] font-medium">{t('drawer_photo')}</span>
            </div>
          </button>
        )}

        {/* Fields */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Row 1: name (mobile) / name + category + rating (desktop) */}
          <div className="flex items-center gap-2">
            <input
              className={`${INPUT} flex-1 min-w-0`}
              value={dish.name}
              placeholder={t('drawer_dish_name_ph')}
              onChange={e => onChange({ ...dish, name: e.target.value })}
            />
            <select
              className={`${INPUT} hidden md:block w-19 flex-shrink-0 appearance-none`}
              value={dish.category}
              onChange={e => onChange({ ...dish, category: e.target.value as Dish['category'] })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ? t(CATEGORY_LABELS[c]) : c}</option>)}
            </select>
            <input
              type="text" inputMode="decimal"
              className={`${INPUT} hidden md:block w-10 flex-shrink-0`}
              value={ratingStr}
              placeholder="0"
              onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) setRatingStr(v); }}
              onBlur={() => { const n = parseFloat(ratingStr) || 0; onChange({ ...dish, rating: n }); setRatingStr(n === 0 ? '' : String(n)); }}
            />
          </div>
          {/* Row 2 mobile only: category + rating */}
          <div className="flex md:hidden items-center gap-2">
            <select
              className={`${INPUT} flex-1 min-w-0 appearance-none`}
              value={dish.category}
              onChange={e => onChange({ ...dish, category: e.target.value as Dish['category'] })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ? t(CATEGORY_LABELS[c]) : c}</option>)}
            </select>
            <input
              type="text" inputMode="decimal"
              className={`${INPUT} flex-1 min-w-0`}
              value={ratingStr}
              placeholder="0"
              onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) setRatingStr(v); }}
              onBlur={() => { const n = parseFloat(ratingStr) || 0; onChange({ ...dish, rating: n }); setRatingStr(n === 0 ? '' : String(n)); }}
            />
          </div>
          <textarea
            rows={1}
            className={`${INPUT} w-full resize-none md:min-h-[4.5rem]`}
            value={dish.notes}
            placeholder={t('drawer_notes_ph')}
            onChange={e => onChange({ ...dish, notes: e.target.value })}
          />
        </div>

        {/* Trash — far right, vertically centered */}
        <button
          onClick={onDelete}
          className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#C0BAB2] hover:text-red-400 hover:bg-red-50 transition-colors self-center"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </Reorder.Item>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────
export default function DiningDrawer({ log, open, onClose, onUpdateLog, onEdit, onDelete, onShare, onLeave, isOwner = true }: Props) {
  const { lang, t } = useLanguage();
  const drawerRef = useRef<HTMLDivElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const addImgRef = useRef<DraggableImageHandle>(null);
  const addPhotoFileRef = useRef<File | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode]           = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [savedToast, setSavedToast]       = useState(false);
  const [localDishes, setLocalDishes] = useState<Dish[]>([]);
  const [addForm, setAddForm]         = useState(emptyDishForm);

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    addPhotoFileRef.current = file;
    fileToDataUrl(file).then(url => setAddForm(f => ({ ...f, photo: url })));
  }

  useEffect(() => { if (!open) { setEditMode(false); setAddForm(emptyDishForm); addPhotoFileRef.current = null; setConfirmDelete(false); setSavedToast(false); setMenuOpen(false); } }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);
  useEffect(() => { setEditMode(false); setAddForm(emptyDishForm); }, [log?.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  function openEditMode() {
    setLocalDishes(log ? [...log.dishes] : []);
    setAddForm(emptyDishForm);
    setEditMode(true);
  }

  async function handleDone() {
    const uploadedDishes = await Promise.all(
      localDishes.map(async dish => {
        if (dish.photo?.startsWith('data:')) {
          const url = await uploadDataUrl(dish.photo);
          return { ...dish, photo: url };
        }
        return dish;
      })
    );
    if (log && onUpdateLog) onUpdateLog({ ...log, dishes: uploadedDishes });
    setEditMode(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  function handleCancel() {
    setEditMode(false);
    setAddForm(emptyDishForm);
  }

  async function handleAddDish() {
    if (!addForm.name.trim()) return;
    let photo: string | undefined;
    if (addForm.photo) {
      photo = addPhotoFileRef.current
        ? await uploadPhoto(addPhotoFileRef.current)
        : await uploadDataUrl(addForm.photo); // fallback for any existing data URL
    }
    const photoTransform = photo ? addImgRef.current?.getTransform() : undefined;
    const newDish: Dish = {
      id: `dish-${Date.now()}`,
      name: addForm.name.trim(),
      category: addForm.category,
      rating: parseFloat(addForm.rating) || 0,
      notes: addForm.notes.trim(),
      ...(photo ? { photo } : {}),
      ...(photoTransform ? { photoTransform } : {}),
    };
    setLocalDishes(prev => [...prev, newDish]);
    setAddForm(emptyDishForm);
    addPhotoFileRef.current = null;
  }

  if (!log) return null;

  const fmtDate = (d: string) => parseLocalDate(d).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const displayDishes = editMode ? localDishes : log.dishes;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            ref={drawerRef}
            className="fixed right-0 top-0 bottom-0 z-[10001] bg-white shadow-2xl flex flex-col"
            style={{ width: 'min(520px, 95vw)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#E8E6E1]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="serif text-xl font-semibold text-[#1A1A1A] truncate">{log.restaurantName}</h2>
                  {log.michelinStars && <MichelinBadge stars={log.michelinStars} />}
                </div>
                <p className="text-xs text-[#8A8A8A] mt-0.5">{log.cuisine}</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors ml-3 flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Cover photo */}
              <div className="h-60 md:h-60 overflow-hidden relative">
                {log.photos[0] ? (
                  <img
                    src={log.photos[0]}
                    alt={log.restaurantName}
                    className="w-full h-full object-cover"
                    style={log.photoTransform ? {
                      transform: `translate(${log.photoTransform.x}%, ${log.photoTransform.y}%) scale(${log.photoTransform.scale})`,
                      transformOrigin: 'center',
                    } : undefined}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/30 via-[#E8E4DC] to-[#4A5343]/20 flex items-end px-6 pb-4">
                    <div>
                      <p className="serif text-lg font-semibold text-[#1A1A1A]/60">{log.restaurantName}</p>
                      <p className="text-xs text-[#8A8A8A]">{log.cuisine}</p>
                    </div>
                  </div>
                )}
                {/* ⋯ menu */}
                {(onEdit || onShare || onDelete || onLeave) && (
                  <div ref={menuRef} className="absolute top-3 right-3">
                    <button
                      onClick={() => setMenuOpen(v => !v)}
                      className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors flex items-center justify-center"
                    >
                      <MoreHorizontal size={14} className="text-white" />
                    </button>
                    {menuOpen && (
                      <div className="absolute top-9 right-0 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 w-40 z-30">
                        {!confirmDelete ? (
                          <>
                            {onEdit && (
                              <button
                                onClick={() => { onEdit(); onClose(); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
                              >
                                <Pencil size={13} className="text-[#8A8A8A]" /> {t('common_edit')}
                              </button>
                            )}
                            {onShare && (
                              <button
                                onClick={() => { onShare(); setMenuOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
                              >
                                <Users size={13} className="text-[#8A8A8A]" /> {t('common_share')}
                              </button>
                            )}
                            {isOwner ? (
                              onDelete && (
                                <button
                                  onClick={() => setConfirmDelete(true)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={13} /> {t('common_delete')}
                                </button>
                              )
                            ) : (
                              onLeave && (
                                <button
                                  onClick={() => setConfirmDelete(true)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <LogOut size={13} /> {t('common_leave')}
                                </button>
                              )
                            )}
                          </>
                        ) : (
                          <div className="px-4 py-2">
                            <p className="text-xs text-[#1A1A1A] font-medium mb-2">
                              {isOwner ? t('restaurant_confirm_delete') : t('restaurant_confirm_leave')}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { isOwner ? onDelete!() : onLeave!(); onClose(); }}
                                className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                              >{isOwner ? t('common_delete') : t('common_leave')}</button>
                              <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                              >{t('common_cancel')}</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-[#F0ECE6]">
                <div className="mb-3">
                  <StarRating value={log.overallRating} readonly size="md" />
                  {log.location.address && (
                    <div className="flex items-center gap-1 text-xs text-[#8A8A8A] mt-1.5">
                      <MapPin size={11} />{log.location.address}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-[5fr_4fr] md:grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">{t('drawer_date_time')}</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#1A1A1A]">{fmtDate(log.date)}</p>
                      <span className="text-xs text-[#8A8A8A] capitalize whitespace-nowrap">{log.time ? (MEAL_LABELS[log.time] ? t(MEAL_LABELS[log.time]) : log.time) : null}</span>
                    </div>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">{t('form_total_expense')}</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{log.currency} {log.totalExpense}</p>
                  </div>
                </div>
              </div>

              {/* Our Dishes header */}
              <div className="px-4 pt-3 pb-2 md:px-6 md:pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="serif text-base font-semibold text-[#1A1A1A]">{t('drawer_our_dishes')}</h3>
                  {onUpdateLog && !editMode && (
                    <button
                      onClick={openEditMode}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-[#C87A53] hover:bg-[#F5F2EE] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  {editMode && (
                    <div className="flex items-center gap-3">
                      <button onClick={handleCancel}
                        className="text-xs text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
                        {t('common_cancel')}
                      </button>
                      <button onClick={handleDone}
                        className="flex items-center gap-1 text-xs font-medium bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors">
                        <Check size={11} /> {t('common_done')}
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#8A8A8A] mt-0.5">
                  {displayDishes.length} {displayDishes.length === 1 ? t('drawer_dish') : t('drawer_dishes')}
                </p>
              </div>

              {/* Edit mode: draggable list + add form */}
              {editMode ? (
                <div className="px-3 pb-3 md:px-5 md:pb-5 space-y-2">
                  <Reorder.Group axis="y" values={localDishes} onReorder={setLocalDishes} className="space-y-2">
                    {localDishes.map(dish => (
                      <DishEditRow
                        key={dish.id}
                        dish={dish}
                        onChange={updated => setLocalDishes(prev => prev.map(d => d.id === updated.id ? updated : d))}
                        onDelete={() => { if (dish.photo) deleteStoragePhoto(dish.photo); setLocalDishes(prev => prev.filter(d => d.id !== dish.id)); }}
                      />
                    ))}
                  </Reorder.Group>

                  {/* Add new dish */}
                  <div className="bg-[#F9F7F4] rounded-xl border border-dashed border-[#D4CFC8] px-2 pt-2 pb-1 md:p-3 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-medium text-[#8A8A8A] uppercase tracking-wider">{t('drawer_add_dish')}</p>
                      <button
                        onClick={handleAddDish}
                        disabled={!addForm.name.trim()}
                        className="flex items-center gap-0.5 text-[10px] font-medium text-[#C87A53] border border-[#C87A53] px-2 py-1 rounded-lg hover:bg-[#C87A53] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Plus size={10} /> {t('common_add')}
                      </button>
                    </div>
                    <div className="flex items-start md:items-center gap-1.5 md:gap-2">
                      {/* Photo */}
                      <input ref={addFileRef} type="file" accept=".jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif" className="hidden" onChange={handleAddPhoto} />
                      {addForm.photo ? (
                        <div className="flex-shrink-0 w-[104px] h-[104px] md:w-28 md:h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors relative bg-white">
                          <DraggableImage ref={addImgRef} src={addForm.photo} alt="dish" onReplace={() => addFileRef.current?.click()} size="sm" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addFileRef.current?.click()}
                          className="flex-shrink-0 w-[104px] h-[104px] md:w-28 md:h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors group relative bg-white"
                        >
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors">
                            <ImagePlus size={16} />
                            <span className="text-[9px] font-medium">{t('drawer_photo')}</span>
                          </div>
                        </button>
                      )}

                      {/* Fields */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            className="basis-full md:flex-1 md:basis-auto md:min-w-0 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2]"
                            placeholder={t('drawer_dish_name_ph')}
                            value={addForm.name}
                            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                          />
                          <select
                            className="flex-1 min-w-0 md:flex-none md:w-20 md:flex-shrink-0 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white appearance-none"
                            style={{ color: addForm.category ? '#1A1A1A' : '#C0BAB2' }}
                            value={addForm.category}
                            onChange={e => setAddForm(f => ({ ...f, category: e.target.value as Dish['category'] }))}
                          >
                            <option value="" disabled>{t('form_select')}</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c] ? t(CATEGORY_LABELS[c]) : c}</option>)}
                          </select>
                          <input
                            type="text" inputMode="decimal" placeholder="0–5"
                            className="flex-1 min-w-0 md:flex-none md:w-10 md:flex-shrink-0 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2]"
                            value={addForm.rating}
                            onChange={e => { const v = e.target.value; if (/^([0-4](\.\d?)?|5(\.0?)?)?$/.test(v)) setAddForm(f => ({ ...f, rating: v })); }}
                          />
                        </div>
                        <textarea
                          rows={1}
                          className="w-full text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2] resize-none md:min-h-[4.5rem]"
                          placeholder={t('drawer_notes_ph')}
                          value={addForm.notes}
                          onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#F0ECE6]">
                  {log.dishes.map((dish, i) => (
                    <DishRow key={dish.id} dish={dish} index={i} />
                  ))}
                </div>
              )}
            </div>

            {/* Changes Saved toast */}
            <AnimatePresence>
              {savedToast && (
                <motion.div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={12} className="text-[#C87A53]" />
                  {t('form_changes_saved')}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
