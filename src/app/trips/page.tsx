'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { mockTrips } from '@/store/data';
import { Calendar, MapPin, Hotel, Utensils, ArrowRight } from 'lucide-react';

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sStr = s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const eStr = e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${sStr} – ${eStr}`;
}

export default function TripsPage() {
  return (
    <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="tag-chip mb-3">All Journeys</p>
        <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Your Chronicles</h1>
        <p className="mt-2 text-[#8A8A8A] text-sm">{mockTrips.length} trips · across {[...new Set(mockTrips.flatMap(t => t.countries))].length} countries</p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {mockTrips.map((trip, i) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
          >
            <Link href={`/trips/${trip.id}`} className="block group">
              <div className="bento-card overflow-hidden">
                {/* Cover */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                  {/* Tags */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {trip.tags.map(t => (
                      <span key={t} className="text-[10px] font-medium text-white bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  {/* Title */}
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h2 className="serif font-semibold text-xl leading-tight">{trip.title}</h2>
                    <p className="text-xs text-white/70 italic mt-0.5">{trip.subtitle}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="p-4">
                  <div className="flex items-center gap-4 text-xs text-[#8A8A8A] mb-3">
                    <span className="flex items-center gap-1"><Calendar size={11} />{formatRange(trip.startDate, trip.endDate)}</span>
                    <span className="flex items-center gap-1"><MapPin size={11} />{trip.countries.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4 text-xs text-[#4A5343]">
                      <span className="flex items-center gap-1"><Hotel size={11} />{trip.hotels.length} hotel{trip.hotels.length !== 1 ? 's' : ''}</span>
                      <span className="flex items-center gap-1"><Utensils size={11} />{trip.diningLogs.length} dining</span>
                    </div>
                    <ArrowRight size={14} className="text-[#C87A53] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Add new trip card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mockTrips.length * 0.1, duration: 0.45 }}
        >
          <div className="bento-card border-dashed h-full min-h-64 flex flex-col items-center justify-center text-center p-8 cursor-pointer hover:border-[#C87A53] hover:bg-[#FDFCFA] transition-all"
            style={{ borderColor: '#D4CFC6' }}>
            <div className="w-12 h-12 rounded-full bg-[#F0ECE6] flex items-center justify-center mb-3">
              <span className="text-[#C87A53] text-xl font-light">+</span>
            </div>
            <p className="font-medium text-[#1A1A1A] text-sm">Start a new trip</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Use the + button to log your memories</p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
