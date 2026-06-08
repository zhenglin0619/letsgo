'use client';
import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { mapPins } from '@/store/data';

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

export default function WorldMapLeaflet() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [22, 12],
      zoom: 2,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
    });

    // CartoDB Positron — clean, light, Apple Maps-like
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Custom zoom control, bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Markers
    mapPins.forEach(pin => {
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
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}
