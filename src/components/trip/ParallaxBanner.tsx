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
        <img src={trip.coverPhoto} alt={trip.title} className="w-full h-full object-cover" />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 px-8 pb-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-3">
            {trip.tags.map(t => (
              <span key={t} className="text-xs font-medium text-white bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">{t}</span>
            ))}
          </div>
          <h1 className="serif text-6xl font-semibold text-white mb-2 leading-tight drop-shadow-sm">
            {trip.title}
          </h1>
          <p className="text-white/75 text-lg italic serif mb-4">{trip.subtitle}</p>
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
