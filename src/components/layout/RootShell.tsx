'use client';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import FAB from './FAB';
import AddTripModal from '@/components/upload/AddTripModal';
import AddRestaurantModal from '@/components/upload/AddRestaurantModal';
import AddHotelModal from '@/components/upload/AddHotelModal';
import AuthModal from '@/components/auth/AuthModal';
import { TripsProvider, useTrips } from '@/store/tripsContext';
import { LanguageProvider, useLanguage } from '@/store/languageContext';
import { getAuthDebugLog } from '@/lib/authDebug';

function Shell({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useTrips();
  const [addTripOpen, setAddTripOpen]           = useState(false);
  const [addRestaurantOpen, setAddRestaurantOpen] = useState(false);
  const [addHotelOpen, setAddHotelOpen]         = useState(false);
  const [stuck, setStuck]                       = useState(false);
  const pathname = usePathname();
  const hideFAB  = /^\/trips\/.+/.test(pathname);
  const mountedAtRef = useRef(0);
  useEffect(() => { mountedAtRef.current = Date.now(); }, []);

  // A tab left open for hours can get frozen or discarded by the browser; on
  // resuming, the in-page auth bootstrap (and its own fallback timer) may
  // never get a chance to run, leaving the splash stuck indefinitely. If the
  // tab is still stuck here a while after mount AND the user comes back to
  // it, a hard reload is the only reliable way to recover.
  useEffect(() => {
    if (!authLoading) return;
    function recover() {
      if (document.visibilityState === 'visible' && Date.now() - mountedAtRef.current > 8000) {
        window.location.reload();
      }
    }
    document.addEventListener('visibilitychange', recover);
    window.addEventListener('focus', recover);
    window.addEventListener('pageshow', recover);
    return () => {
      document.removeEventListener('visibilitychange', recover);
      window.removeEventListener('focus', recover);
      window.removeEventListener('pageshow', recover);
    };
  }, [authLoading]);

  // Surface a manual way out (and what got logged) if the splash sits for
  // too long on its own — covers the case where the recovery listeners above
  // never fire because the tab stays visible/focused the whole time and the
  // bootstrap itself is what's hanging, not a freeze/resume gap.
  useEffect(() => {
    if (!authLoading) { setStuck(false); return; }
    const id = setTimeout(() => setStuck(true), 8000);
    return () => clearTimeout(id);
  }, [authLoading]);

  const { t } = useLanguage();

  if (authLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center"
        style={{ background: 'var(--canvas)' }}>
        <div className="flex flex-col items-center gap-3 max-w-sm px-6 text-center">
          <img src="/logo.png" alt="Logo" width={72} height={72} className="object-contain animate-pulse" />
          <span className="text-xs font-medium tracking-[0.2em] uppercase text-[#C87A53]">{t('loading')}</span>
          {stuck && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-xs text-[#8A8A8A]">{t('loading_stuck')}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-[#1A1A1A] text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
              >
                {t('loading_reload')}
              </button>
              <pre className="mt-2 text-left text-[9px] leading-tight text-[#C0BAB2] bg-[#F5F2EE] rounded-lg p-2 max-h-32 overflow-y-auto w-full whitespace-pre-wrap">
                {getAuthDebugLog().join('\n') || '(no debug log captured)'}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!user) return <AuthModal />;

  function handleSelect(type: 'trip' | 'hotel' | 'restaurant') {
    if (type === 'trip') setAddTripOpen(true);
    else if (type === 'restaurant') setAddRestaurantOpen(true);
    else if (type === 'hotel') setAddHotelOpen(true);
  }

  return (
    <>
      <Navbar />
      {children}
      {!hideFAB && <FAB onSelect={handleSelect} />}
      <AddTripModal open={addTripOpen} onClose={() => setAddTripOpen(false)} />
      <AddRestaurantModal open={addRestaurantOpen} onClose={() => setAddRestaurantOpen(false)} />
      <AddHotelModal open={addHotelOpen} onClose={() => setAddHotelOpen(false)} />
    </>
  );
}

function AppearanceSync() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    function sync(e: MediaQueryListEvent) {
      if (localStorage.getItem('appearance') === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    }
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return null;
}

export default function RootShell({ children }: { children: React.ReactNode }) {
  // Tells public/boot-watchdog.js (loaded beforeInteractive) that the app
  // bundle actually started executing, so it doesn't force-reload thinking
  // the JS never loaded. Set as early as possible, independent of auth state.
  useEffect(() => {
    (window as Window & { __appBooted?: boolean }).__appBooted = true;
  }, []);

  return (
    <LanguageProvider>
      <TripsProvider>
        <AppearanceSync />
        <Shell>{children}</Shell>
      </TripsProvider>
    </LanguageProvider>
  );
}
