'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import type { MapPin } from './WorldMapLeaflet';

const WorldMapLeaflet = dynamic(() => import('./WorldMapLeaflet'), {
  ssr: false,
  loading: () => <div className="shimmer w-full" style={{ height: 520 }} />,
});

export default function WorldMap() {
  const { trips, standaloneRestaurants, standaloneHotels } = useTrips();
  const { t } = useLanguage();

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
    ...standaloneHotels
      .filter(h => h.location.lat !== 0 || h.location.lng !== 0)
      .map(h => ({
        id: h.id,
        lat: h.location.lat,
        lng: h.location.lng,
        type: 'hotel' as const,
        label: h.hotelName,
      })),
  ], [trips, standaloneRestaurants, standaloneHotels]);

  return (
    <div className="bento-card overflow-hidden" style={{ isolation: 'isolate' }}>
      {/* Header — adapts to night mode */}
      <div className="world-map-header px-5 py-3 flex items-center justify-between border-b border-[#F0ECE6]">
        <h2 className="serif text-xl font-semibold text-[#1A1A1A]">{t('world_footprint')}</h2>
        <div className="flex items-center gap-4 text-xs text-[#8A8A8A]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C87A53] inline-block" />
            {t('world_map_dining')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4A5343] inline-block" />
            {t('world_map_hotel')}
          </span>
        </div>
      </div>

      {/* Map — always light so CARTO tiles look correct */}
      <div className="h-[250px] md:h-[520px]" style={{ background: '#fff' }}>
        <WorldMapLeaflet pins={pins} />
      </div>
    </div>
  );
}
