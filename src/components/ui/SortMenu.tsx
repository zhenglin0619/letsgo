'use client';
import { useState, useRef, useEffect } from 'react';
import { ArrowUpDown, Check } from 'lucide-react';

export const DATE_OPTIONS = [
  { value: 'date-desc', label: 'Newest Date' },
  { value: 'date-asc',  label: 'Oldest Date' },
];

const ALL_OPTIONS = [
  ...DATE_OPTIONS,
  { value: 'rate-desc', label: 'Rating Descending' },
  { value: 'rate-asc',  label: 'Rating Ascending' },
];

interface Props {
  value: string;
  onChange: (v: string) => void;
  options?: { value: string; label: string }[];
}

export default function SortMenu({ value, onChange, options = ALL_OPTIONS }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 py-2 px-3.5 text-sm rounded-xl border transition-colors whitespace-nowrap
          ${open
            ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
            : 'bg-white border-[#E8E6E1] text-[#8A8A8A] hover:border-[#C87A53] hover:text-[#C87A53]'
          }`}
      >
        <ArrowUpDown size={13} />
        <span>Sort by</span>
      </button>

      {open && (
        <div
          className="absolute top-11 right-0 bg-white rounded-2xl border border-[#E8E6E1] py-1.5 w-48 z-30"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
        >
          <p className="px-4 pt-1.5 pb-2 text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest">Sort by</p>
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors
                ${value === opt.value
                  ? 'text-[#C87A53] bg-[#FDF6F2]'
                  : 'text-[#1A1A1A] hover:bg-[#F5F2EE]'
                }`}
            >
              {opt.label}
              {value === opt.value && <Check size={12} className="text-[#C87A53] flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
