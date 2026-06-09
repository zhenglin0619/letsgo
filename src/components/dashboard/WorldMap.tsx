'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useTrips } from '@/store/tripsContext';
import type { MapPin } from './WorldMapLeaflet';

const WorldMapLeaflet = dynamic(() => import('./WorldMapLeaflet'), {
  ssr: false,
  loading: () => <div className="shimmer w-full" style={{ height: 520 }} />,
});

export default function WorldMap() {
  const { trips, standaloneRestaurants } = useTrips();

  const pins = useMemo<MapPin[]>(() => [
    ...trips.flatMap(trip => [
      ...trip.diningLogs
        .filter(d => d.location.lat !== 0 || d.location.lng !== 0)
        .map(d => ({
          id: d.id,
          lat: d.location.lat,
          lng: d.location.lng,
          type: 'dining' as const,
          label: d.restaurantName,
        })),
      ...trip.hotels
        .filter(h => h.location.lat !== 0 || h.location.lng !== 0)
        .map(h => ({
          id: h.id,
          lat: h.location.lat,
          lng: h.location.lng,
          type: 'hotel' as const,
          label: h.hotelName,
        })),
    ]),
    ...standaloneRestaurants
      .filter(d => d.location.lat !== 0 || d.location.lng !== 0)
      .map(d => ({
        id: d.id,
        lat: d.location.lat,
        lng: d.location.lng,
        type: 'dining' as const,
        label: d.restaurantName,
      })),
  ], [trips, standaloneRestaurants]);

  return (
    <div className="bento-card overflow-hidden" style={{ background: '#fff', isolation: 'isolate' }}>
      {/* Header */}
      <div className="px-5 py-3 flex items-center justify-between border-b border-[#F0ECE6]">
        <h2 className="serif text-xl font-semibold text-[#1A1A1A]">World Footprint</h2>
        <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87A53] inline-block" />
            Dining
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A5343] inline-block" />
            Hotel
          </span>
        </div>
      </div>

      {/* Map */}
      <div style={{ height: 520 }}>
        <WorldMapLeaflet pins={pins} />
      </div>
    </div>
  );
}
