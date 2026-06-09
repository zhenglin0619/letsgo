'use client';
import { SearchBox } from '@mapbox/search-js-react';
import type { SearchBoxRetrieveResponse } from '@mapbox/search-js-core';

export interface LocatedPlace {
  lat: number;
  lng: number;
  city: string;
  country: string;
  address: string;
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  onLocate: (place: LocatedPlace) => void;
  onClear?: () => void;
  placeholder?: string;
}

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '';

// Theme CSS injected into the SearchBox shadow DOM
const THEME = {
  variables: {
    '--font':             'Inter, sans-serif',
    '--unit':             '14px',
    '--border-radius':    '12px',
    '--color-background': '#ffffff',
    '--color-text':       '#1A1A1A',
    '--color-placeholder':'#C0BAB2',
    '--color-primary':    '#C87A53',
    '--box-shadow':       'none',
    '--outline':          '0',
  },
  cssText: `
    .Input {
      border: 1px solid #E8E6E1 !important;
      padding-top: 8px !important;
      padding-bottom: 8px !important;
      padding-right: 12px !important;
      padding-left: 30px !important;
      font-size: 14px !important;
      transition: border-color 0.15s !important;
    }
    .Input--focused, .Input:focus-within {
      border-color: #C87A53 !important;
      box-shadow: none !important;
    }
    .SearchIcon { color: #C0BAB2 !important; }
    .Results {
      border-radius: 12px !important;
      border: 1px solid #E8E6E1 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important;
      margin-top: 4px !important;
      max-height: 220px !important;
      overflow-y: auto !important;
    }
    .Suggestion:hover { background: #F5F2EE !important; }
    .SuggestionName { color: #1A1A1A !important; font-size: 13px !important; }
    .SuggestionDesc { color: #8A8A8A !important; font-size: 11px !important; }
  `,
};

export default function AddressSearchBox({ value, onChange, onLocate, onClear, placeholder }: Props) {
  function handleRetrieve(res: SearchBoxRetrieveResponse) {
    const feature = res.features[0];
    if (!feature) return;
    const [lng, lat] = feature.geometry.coordinates as [number, number];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctx = (feature.properties as any).context ?? {};
    onLocate({
      lat,
      lng,
      city:    ctx.place?.name    ?? ctx.locality?.name ?? ctx.neighborhood?.name ?? '',
      country: ctx.country?.name  ?? '',
      address: (feature.properties as any).full_address
               ?? (feature.properties as any).name
               ?? value,
    });
  }

  return (
    <SearchBox
      accessToken={TOKEN}
      value={value}
      onChange={(v) => { onChange(v); if (!v.trim()) onClear?.(); }}
      onRetrieve={handleRetrieve}
      placeholder={placeholder ?? 'Search address or place name…'}
      // @ts-expect-error — theme prop is valid but types may lag
      theme={THEME}
    />
  );
}
