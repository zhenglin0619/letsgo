'use client';
import { motion } from 'framer-motion';
import { Plane, BedDouble, Utensils, Earth } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { useState, useEffect } from 'react';

function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(0, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));
}

export default function StatsBento() {
  const { trips, standaloneRestaurants } = useTrips();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains('dark'));
    const observer = new MutationObserver(() => setDark(el.classList.contains('dark')));
    observer.observe(el, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const allDining = [
    ...trips.flatMap(t => t.diningLogs),
    ...standaloneRestaurants,
  ];

  const tripCount  = trips.length;
  const countries  = new Set([
    ...trips.flatMap(t => t.countries),
    ...allDining.map(d => d.location.country).filter(Boolean),
  ]).size;
  const cities     = new Set([
    ...trips.map(t => t.city).filter(Boolean),
    ...trips.flatMap(t => t.hotels.map(h => h.location.city)).filter(Boolean),
    ...allDining.map(d => d.location.city).filter(Boolean),
  ]).size;
  const hotelCount = trips.flatMap(t => t.hotels).length;
  const nightCount = trips.flatMap(t => t.hotels).reduce((s, h) => s + nightsBetween(h.checkIn, h.checkOut), 0);
  const restCount  = allDining.length;

  const iconColor = dark ? '#D4895E' : '#404040';

  const stats = [
    { label: 'Trips',             value: tripCount,                          icon: Plane,     },
    { label: 'Countries / Cities', value: `${countries} / ${cities}`,        icon: Earth,     },
    { label: 'Hotels / Nights',   value: `${hotelCount} / ${nightCount}`,    icon: BedDouble, },
    { label: 'Restaurants',       value: restCount,                           icon: Utensils,  },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bento-card p-4 flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-[12px] text-[#8A8A8A] font-medium uppercase tracking-widest mb-1">{s.label}</p>
              <p className="serif text-3xl font-semibold text-[#1A1A1A]">{s.value}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}18` }}>
              <s.icon size={20} style={{ color: iconColor }} />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        className="bento-card p-4 flex-1 flex items-center justify-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stats.length * 0.07, duration: 0.4 }}
      >
        <div className="flex items-center gap-2">
          <p className="text-[21px] font-semibold text-[#6B6B6B]">Future Plans</p>
          <svg width="33" height="16" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="5" y1="7" x2="24" y2="7" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="18,2 24,7 18,12" fill="none" stroke="#6B6B6B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
