'use client';
import { useState, useRef, useEffect } from 'react';

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

const COUNTRY_ALIASES: Record<string, string> = {
  "People's Republic of China": 'China',
  'Republic of China': 'Taiwan',
  'United States of America': 'United States',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'Democratic People\'s Republic of Korea': 'North Korea',
  'Republic of Korea': 'South Korea',
  'Russian Federation': 'Russia',
  'Islamic Republic of Iran': 'Iran',
  'Syrian Arab Republic': 'Syria',
  'Lao People\'s Democratic Republic': 'Laos',
  'Plurinational State of Bolivia': 'Bolivia',
  'Bolivarian Republic of Venezuela': 'Venezuela',
};

function normalizeCountry(name: string) {
  return COUNTRY_ALIASES[name] ?? name;
}

interface Suggestion {
  name: string;
  country: string;
}

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  types: 'country' | 'place';
  onSelectCountry?: (country: string) => void; // city search: also fills country
}

export default function GeoAutocomplete({ label, placeholder, value, onChange, types, onSelectCountry }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  function handleChange(v: string) {
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (!v.trim() || !TOKEN) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(v)}.json?types=${types}&language=en&limit=6&proximity=ip&access_token=${TOKEN}`
        );
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const items: Suggestion[] = (data.features ?? []).map((f: any) => ({
          name: normalizeCountry(f.text ?? ''),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          country: normalizeCountry(f.context?.find((c: any) => c.id?.startsWith('country'))?.text ?? (types === 'country' ? f.text : '')),
        })).filter((s: Suggestion) => s.name);
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
  }

  function handleSelect(s: Suggestion) {
    onChange(s.name);
    if (types === 'place' && s.country) onSelectCountry?.(s.country);
    setSuggestions([]);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <label className="text-[11px] font-medium text-[#8A8A8A] uppercase tracking-widest mb-1.5 block pl-1">
        {label}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        className="w-full text-sm border border-[#E8E6E1] rounded-xl px-4 py-3 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
      />
      {open && (
        <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E8E6E1] rounded-xl shadow-lg overflow-hidden z-[10300] max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(s); }}
                className="w-full text-left px-4 py-2.5 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
              >
                <span>{s.name}</span>
                {s.country && s.country !== s.name && (
                  <span className="text-[#8A8A8A] ml-1.5 text-xs">{s.country}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
