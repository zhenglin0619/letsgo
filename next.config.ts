import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['10.0.0.232'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    // Pages render an "authLoading" splash on the very first paint, then JS
    // takes over to resolve the real session. If the browser serves a stale,
    // disk-cached copy of the HTML after the tab has sat idle for hours, that
    // JS never runs and the splash is the last thing the user ever sees until
    // a manual reload forces a fresh fetch. Force no-store on documents so
    // every open always revalidates against the current deployment.
    const noStore = [{ key: 'Cache-Control', value: 'no-store' }];
    return [
      { source: '/',                headers: noStore },
      { source: '/trips',           headers: noStore },
      { source: '/trips/:path*',    headers: noStore },
      { source: '/restaurants',     headers: noStore },
      { source: '/hotels',          headers: noStore },
      { source: '/privacy',         headers: noStore },
      { source: '/terms',           headers: noStore },
    ];
  },
};

export default nextConfig;
