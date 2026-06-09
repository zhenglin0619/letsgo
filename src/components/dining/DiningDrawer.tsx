'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { DiningLog, Dish } from '@/types';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import DishRow from './DishRow';
import { X, MapPin, GripVertical, Trash2, Plus, Check, ImagePlus } from 'lucide-react';

const CATEGORIES: Dish['category'][] = ['Appetizer', 'Mains', 'Dessert', 'Drinks', 'Snack'];
const emptyDishForm = { name: '', category: 'Mains' as Dish['category'], rating: '', notes: '', photo: '' };

interface Props {
  log: DiningLog | null;
  open: boolean;
  onClose: () => void;
  onUpdateLog?: (updated: DiningLog) => void;
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
  const INPUT = 'text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors';

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...dish, photo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
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
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors group relative bg-[#F5F2EE]"
        >
          {dish.photo ? (
            <>
              <img src={dish.photo} alt={dish.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImagePlus size={14} className="text-white" />
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors">
              <ImagePlus size={16} />
              <span className="text-[9px] font-medium">Photo</span>
            </div>
          )}
        </button>

        {/* Fields */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              className={`${INPUT} flex-1 min-w-0`}
              value={dish.name}
              placeholder="Dish name"
              onChange={e => onChange({ ...dish, name: e.target.value })}
            />
            <select
              className={`${INPUT} w-19 flex-shrink-0 appearance-none`}
              value={dish.category}
              onChange={e => onChange({ ...dish, category: e.target.value as Dish['category'] })}
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="number" min="0" max="5" step="0.1"
              className={`${INPUT} w-10 flex-shrink-0 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`}
              value={dish.rating}
              placeholder="0–5"
              onChange={e => onChange({ ...dish, rating: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <textarea
            rows={3}
            className={`${INPUT} w-full resize-none`}
            value={dish.notes}
            placeholder="Notes (optional)"
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
export default function DiningDrawer({ log, open, onClose, onUpdateLog }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const addFileRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode]       = useState(false);
  const [localDishes, setLocalDishes] = useState<Dish[]>([]);
  const [addForm, setAddForm]         = useState(emptyDishForm);

  function handleAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAddForm(f => ({ ...f, photo: reader.result as string }));
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  useEffect(() => { if (!open) { setEditMode(false); setAddForm(emptyDishForm); } }, [open]);
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

  function handleDone() {
    if (log && onUpdateLog) onUpdateLog({ ...log, dishes: localDishes });
    setEditMode(false);
  }

  function handleCancel() {
    setEditMode(false);
    setAddForm(emptyDishForm);
  }

  function handleAddDish() {
    if (!addForm.name.trim()) return;
    const newDish: Dish = {
      id: `dish-${Date.now()}`,
      name: addForm.name.trim(),
      category: addForm.category,
      rating: parseFloat(addForm.rating) || 0,
      notes: addForm.notes.trim(),
      ...(addForm.photo ? { photo: addForm.photo } : {}),
    };
    setLocalDishes(prev => [...prev, newDish]);
    setAddForm(emptyDishForm);
  }

  if (!log) return null;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

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
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
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
              <div className="h-52 overflow-hidden">
                {log.photos[0] ? (
                  <img src={log.photos[0]} alt={log.restaurantName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/30 via-[#E8E4DC] to-[#4A5343]/20 flex items-end px-6 pb-4">
                    <div>
                      <p className="serif text-lg font-semibold text-[#1A1A1A]/60">{log.restaurantName}</p>
                      <p className="text-xs text-[#8A8A8A]">{log.cuisine}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="px-6 py-4 border-b border-[#F0ECE6]">
                <div className="mb-3">
                  <StarRating value={log.overallRating} readonly size="md" />
                  {log.location.address && (
                    <div className="flex items-center gap-1 text-xs text-[#8A8A8A] mt-1.5">
                      <MapPin size={11} />{log.location.address}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Date & Time</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-[#1A1A1A]">{fmtDate(log.date)}</p>
                      <span className="text-xs text-[#8A8A8A] capitalize whitespace-nowrap">{log.time}</span>
                    </div>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Total</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{log.currency} {log.totalExpense}</p>
                  </div>
                </div>
              </div>

              {/* Our Dishes header */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <h3 className="serif text-base font-semibold text-[#1A1A1A]">Our Dishes</h3>
                  {onUpdateLog && !editMode && (
                    <button
                      onClick={openEditMode}
                      className="text-xs font-medium text-[#C87A53] hover:text-[#A85F3A] transition-colors"
                    >
                      Edit Dishes
                    </button>
                  )}
                  {editMode && (
                    <div className="flex items-center gap-3">
                      <button onClick={handleCancel}
                        className="text-xs text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
                        Cancel
                      </button>
                      <button onClick={handleDone}
                        className="flex items-center gap-1 text-xs font-medium bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors">
                        <Check size={11} /> Done
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-[#8A8A8A] mt-0.5">
                  {displayDishes.length} {displayDishes.length === 1 ? 'dish' : 'dishes'}
                </p>
              </div>

              {/* Edit mode: draggable list + add form */}
              {editMode ? (
                <div className="px-5 pb-5 space-y-2">
                  <Reorder.Group axis="y" values={localDishes} onReorder={setLocalDishes} className="space-y-2">
                    {localDishes.map(dish => (
                      <DishEditRow
                        key={dish.id}
                        dish={dish}
                        onChange={updated => setLocalDishes(prev => prev.map(d => d.id === updated.id ? updated : d))}
                        onDelete={() => setLocalDishes(prev => prev.filter(d => d.id !== dish.id))}
                      />
                    ))}
                  </Reorder.Group>

                  {/* Add new dish */}
                  <div className="bg-[#F9F7F4] rounded-xl border border-dashed border-[#D4CFC8] p-3 mt-2">
                    <p className="text-[10px] font-medium text-[#8A8A8A] uppercase tracking-wider mb-2">Add a dish</p>
                    <div className="flex items-center gap-2">
                      {/* Photo */}
                      <input ref={addFileRef} type="file" accept="image/*" className="hidden" onChange={handleAddPhoto} />
                      <button
                        type="button"
                        onClick={() => addFileRef.current?.click()}
                        className="flex-shrink-0 w-28 h-28 rounded-lg overflow-hidden border border-[#E8E6E1] hover:border-[#C87A53] transition-colors group relative bg-white"
                      >
                        {addForm.photo ? (
                          <>
                            <img src={addForm.photo} alt="dish" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <ImagePlus size={14} className="text-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-[#C0BAB2] group-hover:text-[#C87A53] transition-colors">
                            <ImagePlus size={16} />
                            <span className="text-[9px] font-medium">Photo</span>
                          </div>
                        )}
                      </button>

                      {/* Fields */}
                      <div className="flex-1 min-w-0 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            className="flex-1 min-w-0 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2]"
                            placeholder="Dish name"
                            value={addForm.name}
                            onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                          />
                          <select
                            className="text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] appearance-none w-20 flex-shrink-0"
                            value={addForm.category}
                            onChange={e => setAddForm(f => ({ ...f, category: e.target.value as Dish['category'] }))}
                          >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            type="number" min="0" max="5" step="0.1" placeholder="0–5"
                            className="w-10 flex-shrink-0 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                            value={addForm.rating}
                            onChange={e => setAddForm(f => ({ ...f, rating: e.target.value }))}
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <textarea
                            rows={3}
                            className="flex-1 text-xs border border-[#E8E6E1] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#C87A53] bg-white text-[#1A1A1A] placeholder:text-[#C0BAB2] resize-none"
                            placeholder="Notes (optional)"
                            value={addForm.notes}
                            onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
                          />
                          <button
                            onClick={handleAddDish}
                            disabled={!addForm.name.trim()}
                            className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-[#C87A53] border border-[#C87A53] px-3 py-1.5 rounded-lg hover:bg-[#C87A53] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus size={12} /> Add
                          </button>
                        </div>
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
