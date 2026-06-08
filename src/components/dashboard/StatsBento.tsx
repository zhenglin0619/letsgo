'use client';
import { motion } from 'framer-motion';
import { Plane, Hotel, Utensils, Award, Globe } from 'lucide-react';
import { globalStats } from '@/store/data';

const stats = [
  { label: 'Trips', value: globalStats.trips, icon: Plane, color: '#C87A53' },
  { label: 'Hotels', value: globalStats.hotels, icon: Hotel, color: '#4A5343' },
  { label: 'Restaurants', value: globalStats.restaurants, icon: Utensils, color: '#C87A53' },
  { label: 'Michelin Stars', value: globalStats.michelinStarsVisited, icon: Award, color: '#B7960A' },
  { label: 'Countries', value: globalStats.countriesVisited, icon: Globe, color: '#4A5343' },
];

export default function StatsBento() {
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
              <p className="text-[10px] text-[#8A8A8A] font-medium uppercase tracking-widest mb-1">{s.label}</p>
              <p className="serif text-3xl font-semibold text-[#1A1A1A]">{s.value}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${s.color}18` }}>
              <s.icon size={18} style={{ color: s.color }} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
