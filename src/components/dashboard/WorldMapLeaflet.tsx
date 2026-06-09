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
  const [mapReady, setMapReady] = useState(false);

  // Initialize map once
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [22, 12],
      zoom: 2,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      touchZoom: true,
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

    // Gesture events (Safari trackpad / Magic Mouse pinch)
    let gestureStartZoom = map.getZoom();
    const handleGestureStart = (e: Event) => {
      e.preventDefault();
      gestureStartZoom = targetZoom; // use target so start is consistent
    };
    const handleGestureChange = (e: Event) => {
      e.preventDefault();
      const scale = (e as unknown as { scale: number }).scale;
      if (scale > 0) {
        targetZoom = Math.max(1, Math.min(18, gestureStartZoom + Math.log2(scale)));
        scheduleZoomFrame();
      }
    };
    const handleGestureEnd = (e: Event) => { e.preventDefault(); };
    container.addEventListener('gesturestart', handleGestureStart, { passive: false });
    container.addEventListener('gesturechange', handleGestureChange, { passive: false });
    container.addEventListener('gestureend', handleGestureEnd, { passive: false });

    // Pointer-pair pinch (two-finger touch)
    const ptrs = new Map<number, { x: number; y: number }>();
    let pinchStartDist = 0;
    let pinchStartZoom = 2;

    const handlePtrDown = (e: PointerEvent) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) {
        const [a, b] = Array.from(ptrs.values());
        pinchStartDist = Math.hypot(b.x - a.x, b.y - a.y);
        pinchStartZoom = targetZoom;
      }
    };
    const handlePtrMove = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2 && pinchStartDist > 0) {
        const [a, b] = Array.from(ptrs.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        targetZoom = Math.max(1, Math.min(18, pinchStartZoom + Math.log2(dist / pinchStartDist)));
        scheduleZoomFrame();
      }
    };
    const handlePtrUp = (e: PointerEvent) => {
      ptrs.delete(e.pointerId);
      if (ptrs.size < 2) pinchStartDist = 0;
    };
    container.addEventListener('pointerdown', handlePtrDown);
    container.addEventListener('pointermove', handlePtrMove);
    container.addEventListener('pointerup', handlePtrUp);
    container.addEventListener('pointercancel', handlePtrUp);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('gesturestart', handleGestureStart);
      container.removeEventListener('gesturechange', handleGestureChange);
      container.removeEventListener('gestureend', handleGestureEnd);
      container.removeEventListener('pointerdown', handlePtrDown);
      container.removeEventListener('pointermove', handlePtrMove);
      container.removeEventListener('pointerup', handlePtrUp);
      container.removeEventListener('pointercancel', handlePtrUp);
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

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
