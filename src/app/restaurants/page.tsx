'use client';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { MapPin, Clock } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import MichelinBadge from '@/components/ui/MichelinBadge';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RestaurantsPage() {
  const { trips: mockTrips } = useTrips();
  const allRestaurants = mockTrips.flatMap(trip =>
    trip.diningLogs.map(dining => ({ ...dining, tripTitle: trip.title }))
  ).sort((a, b) => b.overallRating - a.overallRating);

  return (
    <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <p className="tag-chip mb-3">All Dining</p>
        <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Your Restaurants</h1>
        <p className="mt-2 text-[#8A8A8A] text-sm">
          {allRestaurants.length} restaurant{allRestaurants.length !== 1 ? 's' : ''} · sorted by rating
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {allRestaurants.map((dining, i) => (
          <motion.div
            key={dining.id}
            className="bento-card overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
          >
            {dining.photos[0] && (
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dining.photos[0]}
                  alt={dining.restaurantName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h2 className="serif font-semibold text-lg leading-tight">{dining.restaurantName}</h2>
                  <p className="text-xs text-white/70 mt-0.5">{dining.cuisine}</p>
                </div>
                <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-white text-sm font-semibold serif">{dining.overallRating}</span>
                </div>
              </div>
            )}
            <div className="p-4">
              {!dining.photos[0] && (
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="serif font-semibold text-lg text-[#1A1A1A]">{dining.restaurantName}</h2>
                    <p className="text-xs text-[#8A8A8A]">{dining.cuisine}</p>
                  </div>
                  <span className="serif text-2xl font-semibold text-[#C87A53]">{dining.overallRating}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-[#8A8A8A] mb-3">
                <span className="flex items-center gap-1"><MapPin size={11} />{dining.location.city}, {dining.location.country}</span>
                <span className="flex items-center gap-1"><Clock size={11} />{dining.time}</span>
              </div>
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <StarRating value={dining.overallRating} readonly size="sm" />
                {dining.michelinStars && <MichelinBadge stars={dining.michelinStars} />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#8A8A8A]">{formatDate(dining.date)}</span>
                <span className="text-xs text-[#8A8A8A]">{dining.currency} {dining.totalExpense.toLocaleString()}</span>
              </div>
              {dining.notes && (
                <p className="text-xs text-[#8A8A8A] italic line-clamp-2 mt-2">&ldquo;{dining.notes}&rdquo;</p>
              )}
              <p className="text-[10px] text-[#C87A53] font-medium mt-2 uppercase tracking-wider">{dining.tripTitle}</p>
            </div>
          </motion.div>
        ))}

        {allRestaurants.length === 0 && (
          <div className="col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            <p className="font-medium text-[#1A1A1A] text-sm">No restaurants logged yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Add dining logs to your trips to see them here</p>
          </div>
        )}
      </div>
    </main>
  );
}
