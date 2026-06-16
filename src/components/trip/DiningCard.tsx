'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DiningLog } from '@/types';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import { MapPin, Clock, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { parseLocalDate } from '@/lib/formatUtils';

interface Props {
  log: DiningLog;
  index: number;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function CardMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) { setConfirming(false); return; }
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
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
                <Pencil size={13} className="text-[#8A8A8A]" /> Edit
              </button>
              <button
                onClick={e => { e.stopPropagation(); setConfirming(true); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> Delete
              </button>
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">Delete this restaurant?</p>
              <div className="flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); onDelete(); setOpen(false); }}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >Delete</button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false); }}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DiningCard({ log, index, onClick, onEdit, onDelete }: Props) {
  const fmtDate = (d: string) =>
    parseLocalDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <motion.div
      className="bento-card overflow-hidden cursor-pointer group"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
    >
      {/* Cover */}
      <div className="relative h-32 md:h-50 overflow-hidden">
        {log.photos[0] ? (
          <img
            src={log.photos[0]}
            alt={log.restaurantName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            style={log.photoTransform ? {
              transform: `translate(${log.photoTransform.x}%, ${log.photoTransform.y}%) scale(${log.photoTransform.scale})`,
              transformOrigin: 'center',
            } : undefined}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/30 via-[#E8E4DC] to-[#4A5343]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-2 left-2 md:bottom-3 md:left-4 text-white">
          <h3 className="serif font-semibold text-sm md:text-lg leading-tight">{log.restaurantName}</h3>
          <p className="text-[10px] md:text-xs text-white/70 mt-0.5">{log.cuisine}</p>
        </div>
        {log.michelinStars && (
          <div className="absolute top-3 left-3">
            <MichelinBadge stars={log.michelinStars} />
          </div>
        )}
        {onEdit && onDelete && (
          <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
            <CardMenu onEdit={onEdit} onDelete={onDelete} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-2.5 pt-2 pb-3 md:px-3 md:pt-2.5 md:pb-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-1 md:mb-1.5 gap-1 md:gap-0">
          <div className="order-first md:order-last">
            <StarRating value={log.overallRating} readonly size="sm" />
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs text-[#8A8A8A] order-last md:order-first">
            <span className="flex items-center gap-1">
              <MapPin size={11} />{[log.location.city, log.location.country].filter(Boolean).join(', ')}
            </span>
            <span className="hidden md:flex items-center gap-1"><Clock size={11} />{log.time}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#8A8A8A]">{fmtDate(log.date)}</span>
          <span className="text-xs text-[#8A8A8A]">{log.currency} {log.totalExpense.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
}
