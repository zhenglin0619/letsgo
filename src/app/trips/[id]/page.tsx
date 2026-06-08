'use client';
import { useState, use } from 'react';
import { notFound } from 'next/navigation';
import { useTrips } from '@/store/tripsContext';
import ParallaxBanner from '@/components/trip/ParallaxBanner';
import TripMap from '@/components/trip/TripMap';
import HotelCard from '@/components/trip/HotelCard';
import DiningCard from '@/components/trip/DiningCard';
import DiningDrawer from '@/components/dining/DiningDrawer';
import { DiningLog } from '@/types';
import { BedDouble, Utensils } from 'lucide-react';

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { trips } = useTrips();
  const trip = trips.find(t => t.id === id);
  if (!trip) notFound();

  const [tab, setTab] = useState<'stays' | 'eats'>('eats');
  const [selectedDining, setSelectedDining] = useState<DiningLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  function openDining(log: DiningLog) {
    setSelectedDining(log);
    setDrawerOpen(true);
  }

  return (
    <>
      <ParallaxBanner trip={trip} />

      <div className="max-w-7xl mx-auto px-8 py-10">
        <div className="grid grid-cols-3 gap-6">
          {/* Left 1/3 — mini map */}
          <div className="col-span-1">
            <TripMap trip={trip} />
          </div>

          {/* Right 2/3 — tabs */}
          <div className="col-span-2">
            {/* Tab selector */}
            <div className="flex gap-1 mb-5 bg-[#F0ECE6] p-1 rounded-xl w-fit">
              {(['eats', 'stays'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    tab === t
                      ? 'bg-white text-[#1A1A1A] shadow-sm'
                      : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                  }`}
                >
                  {t === 'eats' ? <Utensils size={13} /> : <BedDouble size={13} />}
                  {t === 'eats' ? 'Eats' : 'Stays'}
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-[#C87A53] text-white' : 'bg-[#E8E4DC] text-[#8A8A8A]'}`}>
                    {t === 'eats' ? trip.diningLogs.length : trip.hotels.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === 'eats' && (
              <div className="grid grid-cols-2 gap-4">
                {trip.diningLogs.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    No dining logged yet. Use the + button to add your first meal.
                  </div>
                )}
                {trip.diningLogs.map((log, i) => (
                  <DiningCard key={log.id} log={log} index={i} onClick={() => openDining(log)} />
                ))}
              </div>
            )}

            {tab === 'stays' && (
              <div className="grid grid-cols-2 gap-4">
                {trip.hotels.length === 0 && (
                  <div className="col-span-2 text-center py-16 text-[#8A8A8A] text-sm">
                    No hotels logged yet.
                  </div>
                )}
                {trip.hotels.map((hotel, i) => (
                  <HotelCard key={hotel.id} hotel={hotel} index={i} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DiningDrawer
        log={selectedDining}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
