'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapPin, Plane, BedDouble, Utensils, LogOut, User, Bell, Settings, NotebookPen, Menu, X } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import NotificationsModal from '@/components/ui/NotificationsModal';
import FuturePlanModal from '@/components/ui/FuturePlanModal';
import SettingsModal from '@/components/ui/SettingsModal';

function LetsGoLogo({ textDown = false }: { textDown?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 select-none group">
      <img src="/logo.png" alt="Logo" width={40} height={40} className="object-contain" />
      <div className={`flex flex-col leading-none${textDown ? ' mt-2' : ''}`} style={{ transform: 'translateY(3px)' }}>
        <span
          className="Helvetica font-black text-[#1A1A1A] dark:text-[#EAE5DE] tracking-[0.12em] uppercase"
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

function LetsGoLogoTextOnly() {
  return (
    <Link href="/" className="flex flex-col leading-none select-none">
      <span
        className="Helvetica font-black text-[#1A1A1A] tracking-[0.12em] uppercase"
        style={{ fontSize: '17px', letterSpacing: '0.1em', WebkitTextStroke: '0.5px #1A1A1A' }}
      >
        Let&rsquo;s Go
      </span>
      <span className="text-[9.5px] font-medium tracking-[0.22em] text-[#C87A53] uppercase mt-1">
        Travel Journal
      </span>
    </Link>
  );
}

function UserMenu() {
  const { user, signOut, pendingItemInvites } = useTrips();
  const { t } = useLanguage();
  const [open, setOpen]                       = useState(false);
  const [notifOpen, setNotifOpen]             = useState(false);
  const [settingsOpen, setSettingsOpen]       = useState(false);
  const [futurePlanOpen, setFuturePlanOpen]   = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropPos, setDropPos] = useState({ top: 0, right: 0 });

  function handleOpen() {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    setOpen(o => !o);
  }

  const avatarUrl: string    = user?.user_metadata?.avatar_url ?? '';
  const displayName: string  = user?.user_metadata?.full_name ?? user?.email ?? '';

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) return null;

  const dropdown = (
    <div
      ref={dropdownRef}
      className="fixed w-52 bg-white rounded-2xl shadow-xl border border-[#E8E6E1] py-2 z-[99999]"
      style={{ top: dropPos.top, right: dropPos.right, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
    >
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
        onClick={() => { setOpen(false); setNotifOpen(true); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
      >
        <div className="relative">
          <Bell size={14} />
          {pendingItemInvites.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#C87A53]" />
          )}
        </div>
        {t('nav_notifications')}
        {pendingItemInvites.length > 0 && (
          <span className="ml-auto text-[10px] font-semibold text-white bg-[#C87A53] rounded-full px-1.5 py-0.5 leading-none">
            {pendingItemInvites.length}
          </span>
        )}
      </button>

      <button
        onClick={() => { setOpen(false); setFuturePlanOpen(true); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
      >
        <NotebookPen size={14} />
        {t('nav_future_plan')}
      </button>

      <button
        onClick={() => { setOpen(false); setSettingsOpen(true); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
      >
        <Settings size={14} />
        {t('nav_settings')}
      </button>

      <div className="mx-4 my-1 h-px bg-[#F0ECE6]" />
      <button
        onClick={() => { setOpen(false); signOut(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#8A8A8A] hover:text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors"
      >
        <LogOut size={14} />
        {t('nav_sign_out')}
      </button>
    </div>
  );

  return (
    <>
      <div className="md:pl-5 md:border-l border-[#E8E6E1]">
        <div className="relative inline-block">
          <button
            ref={btnRef}
            onClick={handleOpen}
            className="w-[34px] h-[34px] md:w-8 md:h-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-[#C87A53] transition-all mt-1.5"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full bg-[#F0ECE6] flex items-center justify-center">
                <User size={14} className="text-[#8A8A8A]" />
              </div>
            )}
          </button>
          {pendingItemInvites.length > 0 && (
            <span className="absolute top-0.5 -right-1.5 min-w-[16px] h-4 rounded-full bg-[#C87A53] text-white text-[9px] font-bold flex items-center justify-center px-0.5 leading-none pointer-events-none">
              {pendingItemInvites.length > 9 ? '9+' : pendingItemInvites.length}
            </span>
          )}
        </div>
      </div>
      {open && createPortal(dropdown, document.body)}
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
      <FuturePlanModal open={futurePlanOpen} onClose={() => setFuturePlanOpen(false)} />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default function Navbar() {
  const path = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { t } = useLanguage();

  const links = [
    { href: '/', label: t('nav_world'), icon: MapPin },
    { href: '/trips', label: t('nav_trips'), icon: Plane },
    { href: '/restaurants', label: t('nav_restaurants'), icon: Utensils },
    { href: '/hotels', label: t('nav_hotels'), icon: BedDouble },
  ];

  return (
    <>
      <header className="navbar-glass fixed top-0 inset-x-0 z-[9999] flex items-center justify-between pl-4 pr-6 md:pr-8 py-[9px]">
        {/* Left side: hamburger (mobile) + logo */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden flex items-center justify-center w-8 h-8 text-[#1A1A1A]"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <div className="hidden md:block"><LetsGoLogo /></div>
          <div className="md:hidden"><LetsGoLogoTextOnly /></div>
        </div>

        {/* Right side: desktop nav links + user menu */}
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
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
          <UserMenu />
        </div>
      </header>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[99998] bg-black/30"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-64 z-[99999] bg-[#FBF9F6] dark:bg-[#1C1C1C] shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E6E1] dark:border-[#2A2A2A]">
          <LetsGoLogo textDown />
          <button
            onClick={() => setDrawerOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-[#8A8A8A] dark:text-[#6A6A6A]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer nav links */}
        <nav className="flex flex-col px-4 py-4 gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = path === href || (href !== '/' && path.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setDrawerOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'text-[#C87A53] bg-[#F5EDE6] dark:bg-[#3A2518]' : 'text-[#4A4A4A] dark:text-[#EAE5DE] hover:bg-[#F0ECE6] dark:hover:bg-[#2A2A2A]'}`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
