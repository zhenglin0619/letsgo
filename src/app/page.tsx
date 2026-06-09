'use client';
import { motion } from 'framer-motion';
import WorldMap from '@/components/dashboard/WorldMap';
import StatsBento from '@/components/dashboard/StatsBento';

export default function DashboardPage() {
  return (
    <main className="pt-24 px-8 max-w-7xl mx-auto h-screen overflow-hidden">
      {/* Main bento grid */}
      <div className="grid grid-cols-12 gap-4">
        <motion.div
          className="col-span-9"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5 }}
        >
          <WorldMap />
        </motion.div>
        <div className="col-span-3">
          <StatsBento />
        </div>
      </div>

    </main>
  );
}
