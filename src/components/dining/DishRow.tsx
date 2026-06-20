'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dish } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { X, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/store/languageContext';
import type { TranslationKey } from '@/lib/i18n';

interface Props { dish: Dish; index: number }

const CATEGORY_LABELS: Record<string, TranslationKey> = {
  'Appetizer': 'dish_appetizer', 'Mains': 'dish_mains', 'Dessert': 'dish_dessert',
  'Drinks': 'dish_drinks', 'Snack': 'dish_snack',
};

export default function DishRow({ dish, index }: Props) {
  const [lightbox, setLightbox] = useState(false);
  const { t } = useLanguage();

  const categoryColors: Record<string, string> = {
    Appetizer: 'bg-blue-50 text-blue-700',
    Mains: 'bg-green-50 text-green-700',
    Dessert: 'bg-pink-50 text-pink-700',
    Drinks: 'bg-purple-50 text-purple-700',
    Snack: 'bg-yellow-50 text-yellow-700',
  };

  return (
    <>
      <motion.div
        className="flex gap-3 items-start py-4 px-5 border-b border-[#F0ECE6] last:border-0 group"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.06 }}
      >
        {/* Photo thumbnail */}
        <div className="flex-shrink-0 w-[80px] h-[80px] rounded-lg overflow-hidden bg-[#F0ECE6]">
          {dish.photo ? (
            <button onClick={() => setLightbox(true)} className="w-full h-full relative group/img block">
              <img
                src={dish.photo}
                alt={dish.name}
                className="w-full h-full object-cover dish-thumb"
                style={dish.photoTransform ? {
                  transform: `translate(${dish.photoTransform.x}%, ${dish.photoTransform.y}%) scale(${dish.photoTransform.scale})`,
                  transformOrigin: 'center',
                } : undefined}
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                <ZoomIn size={16} className="text-white" />
              </div>
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-2xl opacity-30">🍽️</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm text-[#1A1A1A] leading-tight">{dish.name}</h4>
            <span className={`tag-chip flex-shrink-0 text-[9px] ${categoryColors[dish.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {CATEGORY_LABELS[dish.category] ? t(CATEGORY_LABELS[dish.category]) : dish.category}
            </span>
          </div>
          <div className="mt-1.5">
            <StarRating value={dish.rating} readonly size="sm" />
          </div>
          {dish.notes && (
            <p className="mt-1.5 text-xs text-[#8A8A8A] leading-relaxed italic">&ldquo;{dish.notes}&rdquo;</p>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && dish.photo && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center drawer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.div
              className="relative max-w-3xl max-h-[90vh] rounded-xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <img src={dish.photo} alt={dish.name} className="max-h-[90vh] object-contain" />
              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                onClick={() => setLightbox(false)}
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
