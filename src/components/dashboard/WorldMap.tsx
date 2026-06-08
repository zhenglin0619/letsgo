'use client';
import dynamic from 'next/dynamic';
import { ShimmerBlock } from '@/components/ui/Shimmer';

const WorldMapLeaflet = dynamic(() => import('./WorldMapLeaflet'), {
  ssr: false,
  loading: () => <div className="shimmer w-full" style={{ height: 520 }} />,
});

export default function WorldMap() {
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
        <WorldMapLeaflet />
      </div>
    </div>
  );
}
