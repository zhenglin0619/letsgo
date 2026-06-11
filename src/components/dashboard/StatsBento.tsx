'use client';
import { motion } from 'framer-motion';
import { Plane, BedDouble, Utensils, Earth, Wallet, ChevronDown } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { useState, useEffect, useRef } from 'react';

function nightsBetween(checkIn: string, checkOut: string) {
  return Math.max(0, Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000
  ));
}

// Approximate rates: 1 USD = X of each currency
const FX: Record<string, number> = {
  USD: 1, CNY: 6.78, HKD: 7.84, JPY: 161, EUR: 0.87, GBP: 0.75,
  SGD: 1.29, MYR: 4.06, AUD: 1.43, CAD: 1.40,
}
const ALL_CURRENCIES = Object.keys(FX);

function convertToTarget(amount: number, from: string, to: string) {
  const fromRate = FX[from] ?? 1;
  const toRate   = FX[to]   ?? 1;
  return (amount / fromRate) * toRate;
}

export default function StatsBento() {
  const { trips, standaloneRestaurants, standaloneHotels } = useTrips();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains('dark'));
    const observer = new MutationObserver(() => setDark(el.classList.contains('dark')));
    observer.observe(el, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const allDining = [
    ...trips.flatMap(t => t.diningLogs),
    ...standaloneRestaurants,
  ];

  const tripCount  = trips.length;
  const countries  = new Set([
    ...trips.flatMap(t => t.countries),
    ...allDining.map(d => d.location.country).filter(Boolean),
  ]).size;
  const cities     = new Set([
    ...trips.map(t => t.city).filter(Boolean),
    ...trips.flatMap(t => t.hotels.map(h => h.location.city)).filter(Boolean),
    ...allDining.map(d => d.location.city).filter(Boolean),
  ]).size;
  const hotelCount = trips.flatMap(t => t.hotels).length;
  const nightCount = trips.flatMap(t => t.hotels).reduce((s, h) => s + nightsBetween(h.checkIn, h.checkOut), 0);
  const restCount  = allDining.length;

  const [currency, setCurrency] = useState<string>('USD');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  const allHotels = [...trips.flatMap(t => t.hotels), ...standaloneHotels];
  const totalExpense =
    allDining.reduce((s, d) => s + convertToTarget(d.totalExpense ?? 0, d.currency ?? 'USD', currency), 0) +
    allHotels.reduce((s, h) => s + convertToTarget(h.pricePerNight ?? 0, h.currency ?? 'USD', currency), 0);
  const expenseDisplay = totalExpense >= 1_000_000
    ? `${(totalExpense / 1000).toFixed(0)}k`
    : Math.round(totalExpense).toLocaleString();

  const iconColor = dark ? '#D4895E' : '#404040';

  const stats = [
    { label: 'Trips',             value: tripCount,               icon: Plane,     },
    { label: 'Countries / Cities', value: `${countries} / ${cities}`, icon: Earth, },
    { label: 'Hotels / Nights',   value: `${hotelCount} / ${nightCount}`, icon: BedDouble, },
    { label: 'Restaurants',       value: restCount,               icon: Utensils,  },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          className="bento-card p-4 flex-1"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07, duration: 0.4 }}
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-[12px] text-[#8A8A8A] font-medium uppercase tracking-widest mb-1">{s.label}</p>
              <p className="serif text-3xl font-semibold text-[#1A1A1A]">{s.value}</p>
            </div>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${iconColor}18` }}>
              <s.icon size={20} style={{ color: iconColor }} />
            </div>
          </div>
        </motion.div>
      ))}
      <motion.div
        className="bento-card p-4 flex-1"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stats.length * 0.07, duration: 0.4 }}
      >
        <div className="flex items-center justify-between h-full">
          <div>
            <p className="text-[12px] text-[#8A8A8A] font-medium uppercase tracking-widest mb-1">Total Expense</p>
            <div className="flex items-center gap-2 flex-nowrap">
              <p className="serif text-3xl font-semibold text-[#1A1A1A]">{expenseDisplay}</p>
              <div ref={dropdownRef} className="relative translate-y-1">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-1 text-[12px] font-semibold px-2.5 py-1 rounded-lg border transition-all"
                  style={{
                    background: dropdownOpen ? `${iconColor}22` : `${iconColor}12`,
                    color: iconColor,
                    borderColor: `${iconColor}30`,
                  }}
                >
                  {currency}
                  <ChevronDown size={12} strokeWidth={2.5} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 bottom-full mb-1.5 z-50 rounded-xl overflow-hidden shadow-xl border border-[#E8E6E1] dark:border-[#2A2A2A] min-w-[72px]"
                    style={{ background: dark ? '#1C1C1C' : '#FFFFFF' }}>
                    {ALL_CURRENCIES.map((c: string) => (
                      <button
                        key={c}
                        onClick={() => { setCurrency(c); setDropdownOpen(false); }}
                        className="block w-full text-left text-[12px] font-semibold px-3 py-2 transition-colors"
                        style={{
                          color: c === currency ? iconColor : (dark ? '#EAE5DE' : '#404040'),
                          background: c === currency ? `${iconColor}18` : 'transparent',
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${iconColor}18` }}>
            <Wallet size={20} style={{ color: iconColor }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
