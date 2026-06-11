'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { MapPin, Plane, BedDouble, Utensils, LogOut, User, Users } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import CollaboratorModal from '@/components/ui/CollaboratorModal';

function LetsGoLogo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none group">
      <img src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
      <div className="flex flex-col leading-none">
        <span
          className="Helvetica font-black text-[#1A1A1A] tracking-[0.12em] uppercase"
          style={{ fontSize: '17px', letterSpacing: '0.1em', WebkitTextStroke: '0.5px #1A1A1A' }}
        >
          Let&rsquo;s Go
        </span>
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
  const { user, signOut, demoMode, toggleDemoMode } = useTrips();
  const [open, setOpen]               = useState(false);
  const [nightMode, setNightMode]     = useState(false);
  const [collabOpen, setCollabOpen]   = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNightMode(localStorage.getItem('nightMode') === 'true');
  }, []);

  function toggleNightMode() {
    setNightMode(prev => {
      const next = !prev;
      localStorage.setItem('nightMode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }

  const avatarUrl: string    = user?.user_metadata?.avatar_url ?? '';
  const displayName: string  = user?.user_metadata?.full_name ?? user?.email ?? '';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  return (
    <>
      <div ref={ref} className="relative pl-5 border-l border-[#E8E6E1]">
        <button
          onClick={() => setOpen(o => !o)}
          className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#C87A53] transition-all mt-1.5"
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

            {/* User info */}
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

            {/* Collaborators button */}
            <button
              onClick={() => { setOpen(false); setCollabOpen(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
            >
              <Users size={14} />
              Collaborators
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleNightMode}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
            >
              <span>Dark Mode</span>
              <div className={`w-8 rounded-full transition-colors flex items-center px-0.5 ${nightMode ? 'bg-[#C87A53]' : 'bg-[#D4CFC8]'}`}
                style={{ height: '18px' }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${nightMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
            </button>

            {/* Demo Mode */}
            <button
              onClick={toggleDemoMode}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
            >
              <span>Demo Mode</span>
              <div className={`w-8 rounded-full transition-colors flex items-center px-0.5 ${demoMode ? 'bg-[#C87A53]' : 'bg-[#D4CFC8]'}`}
                style={{ height: '18px' }}>
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${demoMode ? 'translate-x-3.5' : 'translate-x-0'}`} />
              </div>
            </button>

            <div className="mx-4 my-1 h-px bg-[#F0ECE6]" />
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

      <CollaboratorModal open={collabOpen} onClose={() => setCollabOpen(false)} />
    </>
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
    <header className="navbar-glass fixed top-0 inset-x-0 z-[9999] flex items-center justify-between pl-2 pr-8 py-[9px]">
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
