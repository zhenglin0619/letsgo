'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HotelLog } from '@/types';
import { MapPin, Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { fmtCountry, parseLocalDate } from '@/lib/formatUtils';
import StarRating from '@/components/ui/StarRating';
import { useLanguage } from '@/store/languageContext';

interface Props {
  hotel: HotelLog;
  index: number;
  onClick?: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function nights(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

function formatDate(d: string, locale: string) {
  return parseLocalDate(d).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

function HotelMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

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
                <Pencil size={13} className="text-[#8A8A8A]" /> {t('common_edit')}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setConfirming(true); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={13} /> {t('common_delete')}
              </button>
            </>
          ) : (
            <div className="px-4 py-2">
              <p className="text-xs text-[#1A1A1A] font-medium mb-2">{t('hotel_confirm_delete')}</p>
              <div className="flex gap-2">
                <button
                  onClick={e => { e.stopPropagation(); onDelete(); setOpen(false); }}
                  className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                >{t('common_delete')}</button>
                <button
                  onClick={e => { e.stopPropagation(); setConfirming(false); }}
                  className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                >{t('common_cancel')}</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HotelCard({ hotel, index, onClick, onEdit, onDelete }: Props) {
  const { lang, t } = useLanguage();
  const n = nights(hotel.checkIn, hotel.checkOut);

  return (
    <motion.div
      className="bento-card overflow-hidden cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <div className="relative h-55 md:h-60 overflow-hidden">
        {hotel.photos[0] ? (
          <img
            src={hotel.photos[0]}
            alt={hotel.hotelName}
            className="w-full h-full object-cover"
            style={hotel.photoTransform ? {
              transform: `translate(${hotel.photoTransform.x}%, ${hotel.photoTransform.y}%) scale(${hotel.photoTransform.scale})`,
              transformOrigin: 'center',
            } : undefined}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#4A5343]/30 via-[#E8E4DC] to-[#C87A53]/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-2.5 left-2.5 right-2.5 md:bottom-3 md:left-3 md:right-3 text-white">
          <h2 className="serif font-semibold text-[20px] md:text-[19px] leading-tight">{hotel.hotelName}</h2>
        </div>
        <div className="absolute top-3 right-3">
          <HotelMenu onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="px-2.5 pt-2 pb-2 md:px-3 md:pt-2.5 md:pb-3">
        <div className="flex items-center justify-between mb-1 md:mb-1.5">
          <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
            <MapPin size={11} />{hotel.location.city}, {fmtCountry(hotel.location.country)}
          </span>
          {hotel.rating > 0 && <StarRating value={hotel.rating} readonly size="sm" />}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-xs text-[#8A8A8A]">
            <Calendar size={11} />{formatDate(hotel.checkIn, lang === 'zh' ? 'zh-CN' : 'en-US')} – {formatDate(hotel.checkOut, lang === 'zh' ? 'zh-CN' : 'en-US')}<span className="hidden md:inline"> · {n} {n !== 1 ? t('hotel_nights_plural') : t('hotel_nights')}</span>
          </span>
          <span className="text-xs text-[#8A8A8A]">
            {hotel.currency} {Math.round(hotel.pricePerNight / (n || 1)).toLocaleString()} {t('hotel_per_night')}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
