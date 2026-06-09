'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

export interface TripPin {
  lat: number;
  lng: number;
  type: 'hotel' | 'dining';
  name: string;
  city: string;
  country: string;
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
        <div style="position:absolute;inset:0;border-radius:50%;background:${color};opacity:0.18;
          animation:leaflet-pin-pulse 2.2s ease-in-out infinite;"></div>
        <div style="width:11px;height:11px;border-radius:50%;background:${color};border:2.5px solid #fff;
          box-shadow:0 1px 5px rgba(0,0,0,0.22);position:relative;z-index:1;"></div>
      </div>`,
  });
}

export default function TripMapLeaflet({ pins }: { pins: TripPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      touchZoom: true,
      doubleClickZoom: false,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const markers: L.Marker[] = [];
    pins.forEach(pin => {
      const marker = L.marker([pin.lat, pin.lng], { icon: makeIcon(pin.type) });
      marker.bindPopup(
        `<div class="tt-popup">
          <div class="tt-popup-name">${pin.name}</div>
          <div class="tt-popup-type">${pin.type === 'dining' ? 'Dining' : 'Hotel'} · ${pin.city}</div>
        </div>`,
        { closeButton: false, offset: [0, -4], className: 'tt-popup-wrapper' }
      );
      marker.on('mouseover', () => marker.openPopup());
      marker.on('mouseout', () => marker.closePopup());
      marker.addTo(map);
      markers.push(marker);
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.4));
    } else {
      map.setView([22, 12], 2);
    }

    mapRef.current = map;

    // Pinch zoom: Chrome/Firefox (ctrlKey + wheel)
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return;
      e.preventDefault();
      const raw = e.deltaMode === 1 ? e.deltaY * 20 : e.deltaY;
      map.setZoom(map.getZoom() - raw * 0.05, { animate: false });
    };
    container.addEventListener('wheel', handleWheel, { passive: false });

    // Pinch zoom: Safari (gesturechange)
    let gestureStartZoom = map.getZoom();
    const handleGestureStart = (e: Event) => { e.preventDefault(); gestureStartZoom = map.getZoom(); };
    const handleGestureChange = (e: Event) => {
      e.preventDefault();
      const scale = (e as unknown as { scale: number }).scale;
      if (scale > 0) map.setZoom(gestureStartZoom + Math.log2(scale), { animate: false });
    };
    const handleGestureEnd = (e: Event) => { e.preventDefault(); };
    container.addEventListener('gesturestart', handleGestureStart, { passive: false });
    container.addEventListener('gesturechange', handleGestureChange, { passive: false });
    container.addEventListener('gestureend', handleGestureEnd, { passive: false });

    // Pinch zoom: pointer events
    const ptrs = new Map<number, { x: number; y: number }>();
    let pinchStartDist = 0, pinchStartZoom = 2;
    const handlePtrDown = (e: PointerEvent) => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2) {
        const [a, b] = Array.from(ptrs.values());
        pinchStartDist = Math.hypot(b.x - a.x, b.y - a.y);
        pinchStartZoom = map.getZoom();
      }
    };
    const handlePtrMove = (e: PointerEvent) => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 2 && pinchStartDist > 0) {
        const [a, b] = Array.from(ptrs.values());
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        map.setZoom(pinchStartZoom + Math.log2(dist / pinchStartDist), { animate: false });
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
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
