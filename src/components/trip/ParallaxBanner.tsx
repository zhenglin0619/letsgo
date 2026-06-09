'use client';
import { useEffect, useRef } from 'react';
import { Trip } from '@/types';
import { Calendar, Globe } from 'lucide-react';

interface Props { trip: Trip }

export default function ParallaxBanner({ trip }: Props) {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!imgRef.current) return;
      const scrolled = window.scrollY;
      imgRef.current.style.transform = `translateY(${scrolled * 0.35}px)`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fmt = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative h-[70vh] overflow-hidden">
      {/* Parallax image layer */}
      <div ref={imgRef} className="absolute inset-0 scale-110" style={{ willChange: 'transform' }}>
        {trip.coverPhoto
          ? <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-br from-[#C87A53]/40 via-[#D4CFC6] to-[#4A5343]/30" />
        }
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="serif text-6xl font-semibold text-white mb-2 leading-tight drop-shadow-sm">
            {trip.title}
          </h1>
          <div className="flex items-center gap-5 text-white/70 text-sm">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {fmt(trip.startDate)} — {fmt(trip.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              {trip.countries.join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
