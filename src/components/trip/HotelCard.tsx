'use client';
import { motion } from 'framer-motion';
import { HotelLog } from '@/types';
import { Calendar, DollarSign, Star } from 'lucide-react';

interface Props { hotel: HotelLog; index: number }

export default function HotelCard({ hotel, index }: Props) {
  const nights = Math.round((new Date(hotel.checkOut).getTime() - new Date(hotel.checkIn).getTime()) / 86400000);
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <motion.div
      className="bento-card overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      {hotel.photos[0] && (
        <div className="h-40 overflow-hidden">
          <img src={hotel.photos[0]} alt={hotel.hotelName} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="serif text-base font-semibold text-[#1A1A1A]">{hotel.hotelName}</h3>
          <div className="flex items-center gap-0.5 text-[#C87A53] text-xs font-semibold">
            <Star size={11} fill="#C87A53" />{hotel.rating}
          </div>
        </div>
        <p className="text-xs text-[#8A8A8A] mb-3">{hotel.location.city}, {hotel.location.country}</p>
        <div className="flex gap-4 text-xs text-[#4A5343]">
          <span className="flex items-center gap-1">
            <Calendar size={11} />{fmtDate(hotel.checkIn)} – {fmtDate(hotel.checkOut)} · {nights}n
          </span>
          <span className="flex items-center gap-1">
            <DollarSign size={11} />{hotel.pricePerNight} {hotel.currency}/night
          </span>
        </div>
        {hotel.notes && (
          <p className="text-xs text-[#8A8A8A] mt-3 leading-relaxed line-clamp-2 italic">{hotel.notes}</p>
        )}
      </div>
    </motion.div>
  );
}
