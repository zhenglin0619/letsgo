'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MapPin, Plane, BedDouble, Utensils } from 'lucide-react';

function LetsGoLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 select-none group">
      {/* ── Icon mark ── */}
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Deep dark background gradient — lighter upper-left */}
          <radialGradient id="lg-bg" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#2E2E2E"/>
            <stop offset="100%" stopColor="#111111"/>
          </radialGradient>
          {/* Glow behind the globe ring */}
          <radialGradient id="lg-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C87A53" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#C87A53" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="40" height="40" rx="11" fill="url(#lg-bg)"/>

        {/* Soft globe glow */}
        <circle cx="20" cy="20" r="13" fill="url(#lg-glow)"/>

        {/* ── Globe wireframe ── */}
        {/* Outer ring */}
        <circle cx="20" cy="20" r="11.5" fill="none" stroke="#C87A53" strokeWidth="1.3" opacity="0.85"/>

        {/* Equator */}
        <line x1="8.5" y1="20" x2="31.5" y2="20" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>

        {/* Upper latitude arc (bows upward — facing viewer) */}
        <path d="M10.5 15 Q20 12.5 29.5 15" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>
        {/* Lower latitude arc */}
        <path d="M10.5 25 Q20 27.5 29.5 25" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>

        {/* Right meridian (near-side curve) */}
        <path d="M20 8.5 Q24 14 24 20 Q24 26 20 31.5" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>
        {/* Left meridian (far-side, fainter) */}
        <path d="M20 8.5 Q16 14 16 20 Q16 26 20 31.5" fill="none" stroke="#C87A53" strokeWidth="0.65" opacity="0.22"/>

        {/* ── Flight path arrow ── */}
        {/* Dashed trail segment before the solid line */}
        <line x1="11.5" y1="28.5" x2="14" y2="26" stroke="white" strokeWidth="1.2" strokeDasharray="1.5 2" strokeLinecap="round" opacity="0.35"/>
        {/* Main diagonal line */}
        <line x1="13.5" y1="26.5" x2="27" y2="13" stroke="white" strokeWidth="1.9" strokeLinecap="round"/>
        {/* Arrowhead (two lines forming a corner) */}
        <path d="M27 13 L21 13 M27 13 L27 19" stroke="white" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Origin: filled terracotta dot */}
        <circle cx="12.5" cy="27.5" r="2.4" fill="#C87A53"/>
        <circle cx="12.5" cy="27.5" r="1" fill="white" opacity="0.6"/>

        {/* Destination: white ring with hot center */}
        <circle cx="27.5" cy="12.5" r="2.2" fill="white"/>
        <circle cx="27.5" cy="12.5" r="1" fill="#C87A53"/>
      </svg>

      {/* ── Wordmark ── */}
      <div className="flex flex-col leading-none">
        {/* Main name — serif for elegance, italic for motion */}
        <span
          className="serif font-bold text-[#1A1A1A] tracking-[0.12em] uppercase"
          style={{ fontSize: '15px', letterSpacing: '0.12em' }}
        >
          Let&rsquo;s Go
        </span>
        {/* Thin rule + subtitle */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="block h-px w-4 bg-[#C87A53]" />
          <span className="text-[8.5px] font-medium tracking-[0.22em] text-[#C87A53] uppercase">
            Travel Journal
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const path = usePathname();

  const links = [
    { href: '/', label: 'World', icon: MapPin },
    { href: '/trips', label: 'Trips', icon: Plane },
    { href: '/restaurants', label: 'Restaurants', icon: Utensils },
    { href: '/hotels', label: 'Hotels', icon: BedDouble },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(251,251,250,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(180,175,168,0.6)' }}>
      <LetsGoLogo />
      <nav className="flex items-center gap-6">
        {links.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/' && path.startsWith(href));
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${active ? 'text-[#C87A53]' : 'text-[#8A8A8A] hover:text-[#1A1A1A]'}`}>
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
