/// <reference types="@types/google.maps" />
'use client';
import { useState, useRef, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface Suggestion {
  name: string;
  secondaryText: string;
  prediction: google.maps.places.PlacePrediction;
}

interface Props {
  label: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  types: 'country' | 'place';
  onSelectCountry?: (country: string) => void;
}

let placesLibPromise: Promise<google.maps.PlacesLibrary> | null = null;
function ensurePlaces(): Promise<google.maps.PlacesLibrary> {
  if (!placesLibPromise) {
    setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' });
    placesLibPromise = importLibrary('places');
  }
  return placesLibPromise;
}

export default function GeoAutocomplete({ label, placeholder, value, onChange, types, onSelectCountry }: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    ensurePlaces().then(({ AutocompleteSessionToken }) => {
      sessionToken.current = new AutocompleteSessionToken();
    });
  }, []);

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
    if (!v.trim()) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(async () => {
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await ensurePlaces();
      if (!sessionToken.current) sessionToken.current = new AutocompleteSessionToken();
      try {
        const includedPrimaryTypes = types === 'country'
          ? ['country']
          : ['locality', 'sublocality_level_1', 'administrative_area_level_1'];
        const { suggestions: raw } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: v,
          sessionToken: sessionToken.current,
          language: 'en',
          includedPrimaryTypes,
        });
        const items: Suggestion[] = raw
          .filter(s => s.placePrediction != null)
          .map(s => ({
            name: s.placePrediction!.mainText?.toString() ?? '',
            secondaryText: s.placePrediction!.secondaryText?.toString() ?? '',
            prediction: s.placePrediction!,
          }))
          .filter(s => s.name);
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 250);
  }

  async function handleSelect(s: Suggestion) {
    onChange(s.name);
    setSuggestions([]);
    setOpen(false);

    const { AutocompleteSessionToken } = await ensurePlaces();

    if (types === 'place' && onSelectCountry) {
      try {
        const place = s.prediction.toPlace();
        await place.fetchFields({ fields: ['addressComponents'] });
        const comps = place.addressComponents ?? [];
        const country = comps.find(c => c.types?.includes('country'))?.longText ?? '';
        if (country) onSelectCountry(country);
      } catch {
        // fallback: last segment of secondary text is usually the country
        const parts = s.secondaryText.split(', ');
        if (parts.length > 0) onSelectCountry(parts[parts.length - 1]);
      }
    }

    sessionToken.current = new AutocompleteSessionToken();
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
                {s.secondaryText && s.secondaryText !== s.name && (
                  <span className="text-[#8A8A8A] ml-1.5 text-xs">{s.secondaryText}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
