/// <reference types="@types/google.maps" />
'use client';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export interface LocatedPlace {
  lat: number;
  lng: number;
  city: string;
  country: string;
  address: string;
}

interface Prediction {
  placePrediction: google.maps.places.PlacePrediction;
  mainText: string;
  secondaryText: string;
}

interface DropdownRect {
  top: number;
  left: number;
  width: number;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onLocate: (place: LocatedPlace) => void;
  onClear?: () => void;
  placeholder?: string;
}

setOptions({ key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '', v: 'weekly' });

let placesLibPromise: Promise<google.maps.PlacesLibrary> | null = null;
function ensurePlaces(): Promise<google.maps.PlacesLibrary> {
  if (!placesLibPromise) placesLibPromise = importLibrary('places');
  return placesLibPromise;
}

export default function AddressSearchBox({ value, onChange, onLocate, onClear, placeholder }: Props) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [dropdownRect, setDropdownRect] = useState<DropdownRect | null>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensurePlaces().then(({ AutocompleteSessionToken }) => {
      sessionToken.current = new AutocompleteSessionToken();
    });
  }, []);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (inputWrapRef.current && !inputWrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, []);

  // Keep dropdown aligned when user scrolls the modal
  useEffect(() => {
    if (!open) return;
    function reposition() {
      if (!inputWrapRef.current) return;
      const r = inputWrapRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }
    reposition();
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  function openDropdown() {
    if (!inputWrapRef.current || predictions.length === 0) return;
    const r = inputWrapRef.current.getBoundingClientRect();
    setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
    setOpen(true);
  }

  function handleChange(v: string) {
    onChange(v);
    if (!v.trim()) { onClear?.(); setPredictions([]); setOpen(false); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const { AutocompleteSuggestion, AutocompleteSessionToken } = await ensurePlaces();
      if (!sessionToken.current) sessionToken.current = new AutocompleteSessionToken();
      try {
        const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: v,
          sessionToken: sessionToken.current,
          language: 'en',
        });
        const preds = suggestions
          .filter(s => s.placePrediction != null)
          .map(s => ({
            placePrediction: s.placePrediction!,
            mainText: s.placePrediction!.mainText?.toString() ?? '',
            secondaryText: s.placePrediction!.secondaryText?.toString() ?? '',
          }));
        setPredictions(preds);
        if (preds.length > 0) {
          const r = inputWrapRef.current?.getBoundingClientRect();
          if (r) setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
          setOpen(true);
        } else {
          setOpen(false);
        }
      } catch {
        setPredictions([]);
        setOpen(false);
      }
    }, 200);
  }

  async function handleSelect(p: Prediction) {
    const fullText = p.placePrediction.text?.toString() ?? `${p.mainText}, ${p.secondaryText}`;
    onChange(fullText);
    setPredictions([]);
    setOpen(false);
    try {
      const place = p.placePrediction.toPlace();
      await place.fetchFields({ fields: ['location', 'addressComponents', 'formattedAddress'] });
      const { AutocompleteSessionToken } = await ensurePlaces();
      sessionToken.current = new AutocompleteSessionToken();
      const lat = place.location?.lat() ?? 0;
      const lng = place.location?.lng() ?? 0;
      const comps = place.addressComponents ?? [];
      const get = (type: string) => comps.find(c => c.types?.includes(type))?.longText ?? '';
      onLocate({
        lat,
        lng,
        city: get('locality') || get('sublocality_level_1') || get('administrative_area_level_1'),
        country: get('country'),
        address: place.formattedAddress ?? fullText,
      });
    } catch {
      // fetchFields failed; caller gets no coordinates
    }
  }

  const dropdown = open && predictions.length > 0 && dropdownRect
    ? createPortal(
        <ul
          style={{ top: dropdownRect.top, left: dropdownRect.left, width: dropdownRect.width, maxHeight: '140px' }}
          className="fixed bg-white border border-[#E8E6E1] rounded-xl shadow-xl z-[99999] overflow-y-auto"
        >
          {predictions.map((p, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={e => { e.preventDefault(); handleSelect(p); }}
                className="w-full text-left px-3 py-2 hover:bg-[#F5F2EE] transition-colors"
              >
                <div className="text-xs text-[#1A1A1A] leading-tight">{p.mainText}</div>
                {p.secondaryText && <div className="text-[10px] text-[#8A8A8A] mt-0.5 leading-tight">{p.secondaryText}</div>}
              </button>
            </li>
          ))}
        </ul>,
        document.body
      )
    : null;

  return (
    <div ref={inputWrapRef} className="relative">
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C0BAB2] pointer-events-none z-10"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={e => handleChange(e.target.value)}
        onFocus={openDropdown}
        placeholder={placeholder ?? 'Search address or place name…'}
        className="w-full text-sm border border-[#E8E6E1] rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
      />
      {dropdown}
    </div>
  );
}
