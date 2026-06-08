'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, BedDouble, Utensils } from 'lucide-react';

interface FABProps {
  onSelect: (type: 'trip' | 'hotel' | 'restaurant') => void;
}

const options = [
  { type: 'trip' as const, label: 'Trip', icon: Compass },
  { type: 'hotel' as const, label: 'Hotel', icon: BedDouble },
  { type: 'restaurant' as const, label: 'Restaurant', icon: Utensils },
];

export default function FAB({ onSelect }: FABProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Full-screen overlay — blocks all interaction when menu is open */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB + pill menu */}
      <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              className="flex flex-col items-end gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {options.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.type}
                    onClick={() => { onSelect(opt.type); setOpen(false); }}
                    className="flex items-center gap-3 bg-white text-[#1A1A1A] text-base font-medium px-5 py-3 rounded-full shadow-xl hover:bg-[#F5F2EE] transition-colors whitespace-nowrap"
                    initial={{ opacity: 0, y: 12, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.9 }}
                    transition={{ delay: (options.length - 1 - i) * 0.055, duration: 0.2 }}
                  >
                    <Icon size={17} className="text-[#C87A53]" />
                    {opt.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setOpen(v => !v)}
          className="w-14 h-14 rounded-full bg-[#C87A53] text-white flex items-center justify-center shadow-lg hover:bg-[#A85E3A] transition-colors"
          aria-label="Quick add"
        >
          <motion.div
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 220 }}
          >
            <Plus size={24} strokeWidth={2.5} />
          </motion.div>
        </button>
      </div>
    </>
  );
}
