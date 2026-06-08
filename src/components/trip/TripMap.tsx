'use client';
import { Trip } from '@/types';

interface Props { trip: Trip }

export default function TripMap({ trip }: Props) {
  // Gather all locations
  const pins = [
    ...trip.hotels.map(h => ({ ...h.location, type: 'hotel', name: h.hotelName })),
    ...trip.diningLogs.map(d => ({ ...d.location, type: 'dining', name: d.restaurantName })),
  ];

  if (!pins.length) return (
    <div className="bento-card h-full flex items-center justify-center text-[#8A8A8A] text-sm">No locations yet</div>
  );

  const minLat = Math.min(...pins.map(p => p.lat)) - 0.5;
  const maxLat = Math.max(...pins.map(p => p.lat)) + 0.5;
  const minLng = Math.min(...pins.map(p => p.lng)) - 0.5;
  const maxLng = Math.max(...pins.map(p => p.lng)) + 0.5;

  function project(lat: number, lng: number) {
    const W = 300, H = 300;
    const x = ((lng - minLng) / (maxLng - minLng)) * (W - 40) + 20;
    const y = H - ((lat - minLat) / (maxLat - minLat)) * (H - 40) - 20;
    return { x, y };
  }

  return (
    <div className="bento-card overflow-hidden h-full" style={{ minHeight: 280 }}>
      <div className="p-3 border-b border-[#E8E6E1]">
        <p className="text-xs text-[#8A8A8A] font-medium uppercase tracking-wider">Trip Map</p>
        <p className="text-sm font-medium text-[#1A1A1A] mt-0.5">{pins[0]?.city}</p>
      </div>
      <div className="p-3 flex-1" style={{ background: '#F5F3EE' }}>
        <svg viewBox="0 0 300 300" className="w-full" style={{ height: 220 }}>
          {/* connecting path */}
          {pins.length > 1 && (
            <polyline
              points={pins.map(p => {
                const { x, y } = project(p.lat, p.lng);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#C87A53"
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity={0.5}
            />
          )}
          {pins.map((pin, i) => {
            const { x, y } = project(pin.lat, pin.lng);
            const color = pin.type === 'dining' ? '#C87A53' : '#4A5343';
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={10} fill={color} opacity={0.15} />
                <circle cx={x} cy={y} r={5} fill={color} />
                <circle cx={x} cy={y} r={2.5} fill="white" />
                {/* sequence number */}
                <text x={x + 8} y={y - 8} fontSize="9" fill={color} fontWeight="600">{i + 1}</text>
              </g>
            );
          })}
        </svg>
        {/* Legend */}
        <div className="flex gap-3 mt-1">
          <span className="flex items-center gap-1 text-[10px] text-[#8A8A8A]">
            <span className="w-2 h-2 rounded-full bg-[#C87A53] inline-block" />Dining
          </span>
          <span className="flex items-center gap-1 text-[10px] text-[#8A8A8A]">
            <span className="w-2 h-2 rounded-full bg-[#4A5343] inline-block" />Hotel
          </span>
        </div>
      </div>
    </div>
  );
}
