'use client';
import dynamic from 'next/dynamic';
import { Trip } from '@/types';
import type { TripPin } from './TripMapLeaflet';

const TripMapLeaflet = dynamic(() => import('./TripMapLeaflet'), { ssr: false });

export default function TripMap({ trip }: { trip: Trip }) {
  const pins: TripPin[] = [
    ...trip.hotels.map(h => ({
      lat:     h.location.lat,
      lng:     h.location.lng,
      type:    'hotel' as const,
      name:    h.hotelName,
      city:    h.location.city,
      country: h.location.country,
    })),
    ...trip.diningLogs.map(d => ({
      lat:     d.location.lat,
      lng:     d.location.lng,
      type:    'dining' as const,
      name:    d.restaurantName,
      city:    d.location.city,
      country: d.location.country,
    })),
  ];

  return (
    <div
      className="bento-card overflow-hidden"
      style={{ height: 'calc(100vh - 250px)', isolation: 'isolate' }}
    >
      <TripMapLeaflet pins={pins} />
    </div>
  );
}
