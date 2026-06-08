'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { mockTrips } from '@/store/data';
import { ArrowRight } from 'lucide-react';

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
}

export default function RecentTrips() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="serif text-2xl font-semibold text-[#1A1A1A]">Recent Chronicles</h2>
        <Link href="/trips" className="flex items-center gap-1 text-sm text-[#C87A53] font-medium hover:opacity-75 transition-opacity">
          All trips <ArrowRight size={14} />
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
        {mockTrips.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 + 0.2, duration: 0.45 }}
            className="flex-shrink-0 w-64"
          >
            <Link href={`/trips/${trip.id}`}>
              <div className="bento-card overflow-hidden group">
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {trip.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-medium bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <h3 className="serif font-semibold text-lg leading-tight">{trip.title}</h3>
                    <p className="text-xs text-white/70 mt-0.5">{formatDateRange(trip.startDate, trip.endDate)}</p>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex gap-3 text-xs text-[#8A8A8A]">
                    <span>{trip.hotels.length} hotel{trip.hotels.length !== 1 ? 's' : ''}</span>
                    <span>·</span>
                    <span>{trip.diningLogs.length} restaurant{trip.diningLogs.length !== 1 ? 's' : ''}</span>
                  </div>
                  <ArrowRight size={14} className="text-[#C87A53] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
