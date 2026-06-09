'use client';
import { motion } from 'framer-motion';
import { useTrips } from '@/store/tripsContext';
import { MapPin, Calendar, Star } from 'lucide-react';

function nights(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function HotelsPage() {
  const { trips } = useTrips();
  const allHotels = trips.flatMap(trip =>
    trip.hotels.map(hotel => ({ ...hotel, tripTitle: trip.title, tripId: trip.id }))
  );

  return (
    <main className="pt-24 pb-24 px-8 max-w-7xl mx-auto">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <h1 className="serif text-4xl font-semibold text-[#1A1A1A]">Your Hotels</h1>
        <p className="mt-2 text-[#8A8A8A] text-sm">
          {allHotels.length} hotel{allHotels.length !== 1 ? 's' : ''} · {allHotels.reduce((sum, h) => sum + nights(h.checkIn, h.checkOut), 0)} nights total
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-6">
        {allHotels.map((hotel, i) => (
          <motion.div
            key={hotel.id}
            className="bento-card overflow-hidden"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45 }}
          >
            {hotel.photos[0] && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={hotel.photos[0]}
                  alt={hotel.hotelName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-4 text-white">
                  <h2 className="serif font-semibold text-lg leading-tight">{hotel.hotelName}</h2>
                  <p className="text-xs text-white/70 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />{hotel.location.city}, {hotel.location.country}
                  </p>
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  <Star size={11} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-white text-xs font-semibold">{hotel.rating}</span>
                </div>
              </div>
            )}
            <div className="p-4">
              {!hotel.photos[0] && (
                <div className="flex items-center justify-between mb-3">
                  <h2 className="serif font-semibold text-lg text-[#1A1A1A]">{hotel.hotelName}</h2>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-semibold text-[#1A1A1A]">{hotel.rating}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-[#8A8A8A] mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={11} />{formatDate(hotel.checkIn)} – {formatDate(hotel.checkOut)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#4A5343] font-medium">
                  {nights(hotel.checkIn, hotel.checkOut)} night{nights(hotel.checkIn, hotel.checkOut) !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-[#8A8A8A]">
                  {hotel.currency} {hotel.pricePerNight.toLocaleString()} / night
                </span>
              </div>
              {hotel.notes && (
                <p className="text-xs text-[#8A8A8A] italic line-clamp-2">&ldquo;{hotel.notes}&rdquo;</p>
              )}
              <p className="text-[10px] text-[#C87A53] font-medium mt-2 uppercase tracking-wider">{hotel.tripTitle}</p>
            </div>
          </motion.div>
        ))}

        {allHotels.length === 0 && (
          <div className="col-span-3 bento-card border-dashed min-h-64 flex flex-col items-center justify-center text-center p-8"
            style={{ borderColor: '#D4CFC6' }}>
            <p className="font-medium text-[#1A1A1A] text-sm">No hotels logged yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Add your first stays to get started</p>
          </div>
        )}
      </div>
    </main>
  );
}
