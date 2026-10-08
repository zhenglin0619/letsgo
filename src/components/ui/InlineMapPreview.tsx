'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { CARTO_TILE_URL } from '@/lib/mapTiles';

interface Props {
  lat: number;
  lng: number;
}

const PIN_HTML = `
  <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
    <div style="position:absolute;inset:0;border-radius:50%;background:#C87A53;opacity:0.2;
      animation:leaflet-pin-pulse 2.2s ease-in-out infinite;"></div>
    <div style="width:12px;height:12px;border-radius:50%;background:#C87A53;
      border:2.5px solid #fff;box-shadow:0 1px 6px rgba(0,0,0,0.28);
      position:relative;z-index:1;"></div>
  </div>`;

export default function InlineMapPreview({ lat, lng }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Bootstrap map once
  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const map = L.map(el, {
      center: [lat, lng],
      zoom: 15,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      dragging: true,
    });

    L.tileLayer(CARTO_TILE_URL, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({ className: '', iconSize: [20, 20], iconAnchor: [10, 10], html: PIN_HTML });
    markerRef.current = L.marker([lat, lng], { icon }).addTo(map);
    mapRef.current = map;

    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new position on prop change
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], 15, { animate: true, duration: 0.5 });
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="w-full rounded-xl overflow-hidden border border-[#E8E6E1]"
      style={{ height: 140 }}
    />
  );
}
