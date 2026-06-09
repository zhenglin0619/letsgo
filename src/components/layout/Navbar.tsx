'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, BedDouble, Utensils, LogOut, User } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';

function LetsGoLogo() {
  return (
    <Link href="/" className="flex items-center gap-3 select-none group">
      {/* ── Icon mark ── */}
      <svg width="46" height="46" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <circle cx="20" cy="20" r="14.5" fill="url(#lg-glow)"/>

        {/* ── Globe wireframe ── */}
        {/* Outer ring */}
        <circle cx="20" cy="20" r="13" fill="none" stroke="#C87A53" strokeWidth="1.3" opacity="0.85"/>

        {/* Equator */}
        <line x1="7" y1="20" x2="33" y2="20" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>

        {/* Upper latitude arc */}
        <path d="M9 14.5 Q20 12 31 14.5" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>
        {/* Lower latitude arc */}
        <path d="M9 25.5 Q20 28 31 25.5" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.5"/>

        {/* Right meridian (near-side curve) */}
        <path d="M20 7 Q24.5 13.5 24.5 20 Q24.5 26.5 20 33" fill="none" stroke="#C87A53" strokeWidth="0.75" opacity="0.45"/>
        {/* Left meridian (far-side, fainter) */}
        <path d="M20 7 Q15.5 13.5 15.5 20 Q15.5 26.5 20 33" fill="none" stroke="#C87A53" strokeWidth="0.65" opacity="0.22"/>

        {/* ── Flight path arrow ── */}
        {/* Main diagonal line */}
        <line x1="15" y1="25" x2="25" y2="15" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        {/* Arrowhead */}
        <path d="M25 15 L20.5 15 M25 15 L25 19.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>

        {/* Origin: filled terracotta dot */}
        <circle cx="14.5" cy="25.5" r="2" fill="#C87A53"/>
        <circle cx="14.5" cy="25.5" r="0.85" fill="white" opacity="0.6"/>

        {/* Destination: white ring with hot center */}
        <circle cx="25.5" cy="14.5" r="1.9" fill="white"/>
        <circle cx="25.5" cy="14.5" r="0.85" fill="#C87A53"/>
      </svg>

      {/* ── Wordmark ── */}
      <div className="flex flex-col leading-none">
        {/* Main name — serif for elegance, italic for motion */}
        <span
          className="Helvetica font-black text-[#1A1A1A] tracking-[0.12em] uppercase"
          style={{ fontSize: '17px', letterSpacing: '0.1em', WebkitTextStroke: '0.5px #1A1A1A' }}
        >
          Let&rsquo;s Go
        </span>
        {/* Thin rule + subtitle */}
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[9.5px] font-medium tracking-[0.22em] text-[#C87A53] uppercase">
            Travel Journal
          </span>
        </div>
      </div>
    </Link>
  );
}

function UserMenu() {
  const { user, signOut } = useTrips();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const avatarUrl: string = user?.user_metadata?.avatar_url ?? '';
  const displayName: string = user?.user_metadata?.full_name ?? user?.email ?? '';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <div ref={ref} className="relative pl-5 border-l border-[#E8E6E1]">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#C87A53] transition-all"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-full h-full bg-[#F0ECE6] flex items-center justify-center">
            <User size={14} className="text-[#8A8A8A]" />
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] py-2 z-[99999]"
          style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
          <div className="px-4 py-2.5 border-b border-[#F0ECE6]">
            {avatarUrl && (
              <img src={avatarUrl} alt={displayName} referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover mb-2" />
            )}
            {displayName && (
              <p className="text-sm font-semibold text-[#1A1A1A] truncate">{displayName}</p>
            )}
            <p className="text-xs text-[#8A8A8A] truncate">{user.email}</p>
          </div>
          <button
            onClick={() => { setOpen(false); signOut(); }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      )}
    </div>
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
    <header className="fixed top-0 inset-x-0 z-[9999] flex items-center justify-between pl-4 pr-8 py-[13px]"
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
        <UserMenu />
      </nav>
    </header>
  );
}
