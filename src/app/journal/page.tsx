'use client';
import { motion } from 'framer-motion';
import { mockTrips } from '@/store/data';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';

export default function JournalPage() {
  const allDishes = mockTrips.flatMap(trip =>
    trip.diningLogs.flatMap(dining =>
      dining.dishes.map(dish => ({ ...dish, restaurantName: dining.restaurantName, tripTitle: trip.title, date: dining.date }))
    )
  ).sort((a, b) => b.rating - a.rating);

  const allDining = mockTrips.flatMap(trip =>
    trip.diningLogs.map(d => ({ ...d, tripTitle: trip.title }))
  ).sort((a, b) => b.overallRating - a.overallRating);

  return (
    <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <p className="tag-chip mb-3">Tasting Notes</p>
        <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Your Dish Journal</h1>
        <p className="mt-2 text-[#8A8A8A] text-sm">{allDishes.length} dishes rated · sorted by rating</p>
      </motion.div>

      {/* Best dishes leaderboard */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <h2 className="serif text-xl font-semibold text-[#1A1A1A] mb-4">Top Dishes</h2>
          <div className="bento-card divide-y divide-[#F0ECE6]">
            {allDishes.map((dish, i) => (
              <motion.div
                key={`${dish.id}-${i}`}
                className="flex items-start gap-4 p-4"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="serif text-2xl font-semibold text-[#E0DBD4] w-8 flex-shrink-0 text-right">#{i+1}</span>
                {dish.photo && (
                  <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={dish.photo} alt={dish.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm text-[#1A1A1A]">{dish.name}</h3>
                    <span className="tag-chip">{dish.category}</span>
                  </div>
                  <p className="text-xs text-[#8A8A8A] mt-0.5">{dish.restaurantName} · {dish.tripTitle}</p>
                  <div className="mt-1.5">
                    <StarRating value={dish.rating} readonly size="sm" />
                  </div>
                  {dish.notes && (
                    <p className="text-xs text-[#8A8A8A] mt-1.5 italic line-clamp-1">&ldquo;{dish.notes}&rdquo;</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="col-span-5">
          <h2 className="serif text-xl font-semibold text-[#1A1A1A] mb-4">Top Restaurants</h2>
          <div className="space-y-3">
            {allDining.map((dining, i) => (
              <motion.div
                key={dining.id}
                className="bento-card p-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-[#1A1A1A]">{dining.restaurantName}</h3>
                      {dining.michelinStars && <MichelinBadge stars={dining.michelinStars} />}
                    </div>
                    <p className="text-xs text-[#8A8A8A] mt-0.5">{dining.cuisine} · {dining.location.city}</p>
                    <p className="text-[10px] text-[#8A8A8A] mt-0.5">{dining.tripTitle}</p>
                  </div>
                  <span className="serif text-2xl font-semibold text-[#C87A53] flex-shrink-0">{dining.overallRating}</span>
                </div>
                <div className="mt-2">
                  <StarRating value={dining.overallRating} readonly size="sm" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
