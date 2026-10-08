const cartoApiKey = process.env.NEXT_PUBLIC_CARTO_API_KEY?.trim();

export const CARTO_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' +
  (cartoApiKey ? `?key=${encodeURIComponent(cartoApiKey)}` : '');
