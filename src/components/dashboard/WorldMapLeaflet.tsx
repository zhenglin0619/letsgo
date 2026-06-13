'use client';
import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  type: 'dining' | 'hotel';
  label: string;
}

interface Props {
  pins: MapPin[];
}

function makeIcon(type: string) {
  const color = type === 'dining' ? '#C87A53' : '#4A5343';
  return L.divIcon({
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
    html: `
      <div style="position:relative;width:20px;height:20px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.18;
          animation:leaflet-pin-pulse 2.2s ease-in-out infinite;
        "></div>
        <div style="
          width:11px;height:11px;border-radius:50%;
          background:${color};border:2.5px solid #fff;
          box-shadow:0 1px 5px rgba(0,0,0,0.22);
          position:relative;z-index:1;
        "></div>
      </div>`,
  });
}

export default function WorldMapLeaflet({ pins }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const meMakerRef = useRef<L.Marker | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    setDark(el.classList.contains('dark'));
    const observer = new MutationObserver(() => setDark(el.classList.contains('dark')));
    observer.observe(el, { attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);


  function handleLocate() {
    if (!navigator.geolocation || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const map = mapRef.current!;

        // Remove previous "me" marker
        meMakerRef.current?.remove();

        // Distinct pulsing blue "you are here" marker
        const meIcon = L.divIcon({
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          html: `
            <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
              <div style="
                position:absolute;inset:0;border-radius:50%;
                background:#3B82F6;opacity:0.22;
                animation:me-pulse 1.5s ease-in-out infinite;
              "></div>
              <div style="
                width:13px;height:13px;border-radius:50%;
                background:#3B82F6;border:2.5px solid #fff;
                box-shadow:0 1px 6px rgba(59,130,246,0.5);
                position:relative;z-index:1;
              "></div>
            </div>`,
        });

        const meMarker = L.marker([lat, lng], { icon: meIcon, zIndexOffset: 1000 });
        meMarker.bindPopup(
          `<div class="tt-popup"><div class="tt-popup-name">You are here</div></div>`,
          { closeButton: false, offset: [0, -5], className: 'tt-popup-wrapper' }
        );
        meMarker.on('mouseover', () => meMarker.openPopup());
        meMarker.on('mouseout', () => meMarker.closePopup());
        meMarker.addTo(map);
        meMakerRef.current = meMarker;

        map.flyTo([lat, lng], 16, { animate: true, duration: 1.4 });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // Initialize map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const isMobile = window.innerWidth < 768;
    const defaultZoom = isMobile ? 0.6 : 1.8;

    const map = L.map(container, {
      center: [22, 12],
      zoom: defaultZoom,
      zoomSnap: 0,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      touchZoom: false,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapRef.current = map;
    setMapReady(true);

    // ── Smooth zoom via lerp ──────────────────────────────────────────────────
    let targetZoom = map.getZoom();
    let rafId: number | null = null;

    const scheduleZoomFrame = () => {
      if (rafId !== null) return;
      const step = () => {
        const current = map.getZoom();
        const diff = targetZoom - current;
        if (Math.abs(diff) < 0.004) {
          map.setZoom(targetZoom, { animate: false });
          rafId = null;
          return;
        }
        // Lerp 12 % of remaining distance per frame → natural ease-out
        map.setZoom(current + diff * 0.12, { animate: false });
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    };

    // Ctrl + wheel (trackpad pinch on Chrome/Firefox, mouse wheel + ctrl)
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 :
                  e.deltaMode === 2 ? e.deltaY * 300 : e.deltaY;
      targetZoom = Math.max(1, Math.min(18, targetZoom - raw * 0.018));
      scheduleZoomFrame();
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('wheel', handleWheel);
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  // Sync markers whenever pins or map readiness changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(markersRef.current.keys());
    const incomingIds = new Set(pins.map(p => p.id));

    // Remove markers no longer in pins
    for (const id of currentIds) {
      if (!incomingIds.has(id)) {
        markersRef.current.get(id)?.remove();
        markersRef.current.delete(id);
      }
    }

    // Add new markers
    for (const pin of pins) {
      if (markersRef.current.has(pin.id)) continue;
      const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon(pin.type) });
      marker.bindPopup(
        `<div class="tt-popup">
          <div class="tt-popup-name">${pin.label}</div>
          <div class="tt-popup-type">${pin.type}</div>
        </div>`,
        { closeButton: false, offset: [0, -4], className: 'tt-popup-wrapper' }
      );
      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
      marker.addTo(map);
      markersRef.current.set(pin.id, marker);
    }
  }, [pins, mapReady]);

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
      <button
        onClick={handleLocate}
        title="Locate me"
        style={{
          position: 'absolute', top: 12, right: 12, zIndex: 1000,
          width: 32, height: 32, borderRadius: 8,
          background: dark ? '#2A2830' : '#fff',
          border: `1px solid ${dark ? '#3E3B47' : '#E8E6E1'}`,
          boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.35)' : '0 1px 6px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = dark ? '#333040' : '#F5F2EE')}
        onMouseLeave={e => (e.currentTarget.style.background = dark ? '#2A2830' : '#fff')}
      >
        {locating ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C87A53" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
            style={{ animation: 'spin 1s linear infinite' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark ? '#EAE5DE' : '#1A1A1A'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            <circle cx="12" cy="12" r="8" />
          </svg>
        )}
      </button>
      <button
        onClick={() => mapRef.current?.flyTo([22, 12], window.innerWidth < 768 ? 0.6 : 1.8, { animate: true, duration: 1.2 })}
        title="Reset view"
        style={{
          position: 'absolute', top: 52, right: 12, zIndex: 1000,
          width: 32, height: 32, borderRadius: 8,
          background: dark ? '#2A2830' : '#fff',
          border: `1px solid ${dark ? '#3E3B47' : '#E8E6E1'}`,
          boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.35)' : '0 1px 6px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = dark ? '#333040' : '#F5F2EE')}
        onMouseLeave={e => (e.currentTarget.style.background = dark ? '#2A2830' : '#fff')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark ? '#EAE5DE' : '#1A1A1A'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3l5 5M3 3v5M3 3h5" />
          <path d="M21 3l-5 5M21 3v5M21 3h-5" />
          <path d="M3 21l5-5M3 21v-5M3 21h5" />
          <path d="M21 21l-5-5M21 21v-5M21 21h-5" />
        </svg>
      </button>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes me-pulse { 0%,100% { transform: scale(1); opacity: 0.22; } 50% { transform: scale(2.2); opacity: 0; } }
      `}</style>
    </div>
  );
}
