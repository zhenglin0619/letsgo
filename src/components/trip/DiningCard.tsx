'use client';
import { motion } from 'framer-motion';
import { DiningLog } from '@/types';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';
import { Clock, Utensils, ChevronRight } from 'lucide-react';

interface Props {
  log: DiningLog;
  index: number;
  onClick: () => void;
}

export default function DiningCard({ log, index, onClick }: Props) {
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      className="bento-card overflow-hidden text-left w-full group cursor-pointer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onClick={onClick}
    >
      {log.photos[0] && (
        <div className="h-36 overflow-hidden relative">
          <img src={log.photos[0]} alt={log.restaurantName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          {log.michelinStars && (
            <div className="absolute top-2 left-2">
              <MichelinBadge stars={log.michelinStars} />
            </div>
          )}
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="serif text-base font-semibold text-[#1A1A1A] leading-tight">{log.restaurantName}</h3>
          <ChevronRight size={16} className="text-[#C87A53] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
        <p className="text-xs text-[#8A8A8A] mb-2">{log.cuisine}</p>
        <StarRating value={log.overallRating} readonly size="sm" />
        <div className="flex gap-3 mt-2 text-xs text-[#8A8A8A]">
          <span className="flex items-center gap-1"><Clock size={10} />{fmtDate(log.date)} · {log.time}</span>
          <span className="flex items-center gap-1"><Utensils size={10} />{log.dishes.length} dishes</span>
        </div>
      </div>
    </motion.div>
  );
}
