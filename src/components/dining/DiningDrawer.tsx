'use client';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DiningLog } from '@/types';
import DishRow from './DishRow';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import { X, Clock, DollarSign, Heart, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface Props {
  log: DiningLog | null;
  open: boolean;
  onClose: () => void;
}

export default function DiningDrawer({ log, open, onClose }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Reset photo on new log
  useEffect(() => { setPhotoIdx(0); }, [log?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!log) return null;

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const vibeLabels = ['', 'Disappointing', 'Decent', 'Good', 'Great', 'Exceptional'];
  const vibeColors = ['', '#8A8A8A', '#4A5343', '#4A5343', '#C87A53', '#C87A53'];

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-50 drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer panel */}
          <motion.div
            ref={drawerRef}
            className="fixed right-0 top-0 bottom-0 z-50 bg-white shadow-2xl flex flex-col"
            style={{ width: 'min(520px, 95vw)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="serif text-xl font-semibold text-[#1A1A1A] truncate">{log.restaurantName}</h2>
                  {log.michelinStars && <MichelinBadge stars={log.michelinStars} />}
                </div>
                <p className="text-xs text-[#8A8A8A] mt-0.5">{log.cuisine} · {log.location.city}</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors ml-3 flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Photo carousel */}
              {log.photos.length > 0 && (
                <div className="relative h-52 bg-[#1A1A1A] overflow-hidden">
                  <motion.img
                    key={photoIdx}
                    src={log.photos[photoIdx]}
                    alt={log.restaurantName}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35 }}
                  />
                  {log.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setPhotoIdx(i => (i - 1 + log.photos.length) % log.photos.length)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                      ><ChevronLeft size={16} /></button>
                      <button
                        onClick={() => setPhotoIdx(i => (i + 1) % log.photos.length)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60"
                      ><ChevronRight size={16} /></button>
                      <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1">
                        {log.photos.map((_, i) => (
                          <button key={i} onClick={() => setPhotoIdx(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIdx ? 'bg-white' : 'bg-white/40'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Meta info */}
              <div className="px-6 py-4 border-b border-[#F0ECE6]">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Date & Time</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{fmtDate(log.date)}</p>
                    <p className="text-xs text-[#8A8A8A] capitalize">{log.time}</p>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Total</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{log.currency} {log.totalExpense}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Heart size={10} fill={vibeColors[log.vibeRating]} style={{ color: vibeColors[log.vibeRating] }} />
                      <p className="text-xs text-[#8A8A8A]">{vibeLabels[log.vibeRating]} vibe</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StarRating value={log.overallRating} readonly size="md" />
                  <div className="flex items-center gap-1 text-xs text-[#8A8A8A]">
                    <MapPin size={11} />{log.location.city}, {log.location.country}
                  </div>
                </div>

                {log.notes && (
                  <p className="mt-3 text-xs text-[#8A8A8A] leading-relaxed italic border-l-2 border-[#C87A53] pl-3">
                    {log.notes}
                  </p>
                )}
              </div>

              {/* Menu Chronicle */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="serif text-base font-semibold text-[#1A1A1A]">Menu Chronicle</h3>
                  <span className="text-xs text-[#8A8A8A]">{log.dishes.length} dishes</span>
                </div>
                <p className="text-xs text-[#8A8A8A]">Dish-by-dish impressions</p>
              </div>

              <div className="divide-y divide-[#F0ECE6]">
                {log.dishes.map((dish, i) => (
                  <DishRow key={dish.id} dish={dish} index={i} />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
