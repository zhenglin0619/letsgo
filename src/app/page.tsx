'use client';
import { motion } from 'framer-motion';
import WorldMap from '@/components/dashboard/WorldMap';
import StatsBento from '@/components/dashboard/StatsBento';

export default function DashboardPage() {
  return (
    <main className="pt-20 md:pt-24 px-4 md:px-8 max-w-7xl mx-auto md:h-screen md:overflow-hidden pb-8 md:pb-0">
      {/* Main bento grid */}
      <div className="flex flex-col gap-4 md:grid md:grid-cols-12 md:gap-4">
        <motion.div
          className="md:col-span-9"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <WorldMap />
        </motion.div>
        <div className="md:col-span-3">
          <StatsBento />
        </div>
      </div>
    </main>
  );
}
