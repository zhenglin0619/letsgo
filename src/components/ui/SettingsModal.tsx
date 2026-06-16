'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, PlayCircle, Globe, Mail, Share, Shield, FileText, ChevronRight, Heart } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import WhatsNewModal from '@/components/ui/WhatsNewModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-8 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${on ? 'bg-[#C87A53]' : 'bg-[#D4CFC8]'}`}
      style={{ height: '18px' }}
    >
      <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-3.5' : 'translate-x-0'}`} />
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-1.5 pl-1">
      {children}
    </p>
  );
}

function iconBg(dark: boolean) {
  return dark ? 'bg-[#1A1A1A]' : 'bg-[#E8E4DC]';
}

function iconColor(dark: boolean) {
  return dark ? 'text-[#C87A53]' : 'text-[#8A8A8A]';
}

function SettingRow({ icon, label, children, dark }: { icon: React.ReactNode; label: string; children: React.ReactNode; dark: boolean }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-full ${iconBg(dark)} flex items-center justify-center shrink-0 transition-colors`}>
          {icon}
        </div>
        <span className="text-sm text-[#1A1A1A]">{label}</span>
      </div>
      {children}
    </div>
  );
}

function ActionRow({ icon, label, onClick, dark }: { icon: React.ReactNode; label: string; onClick?: () => void; dark: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4] hover:bg-[#F0ECE6] transition-colors group"
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-full ${iconBg(dark)} flex items-center justify-center shrink-0 transition-colors`}>
          {icon}
        </div>
        <span className="text-sm text-[#1A1A1A]">{label}</span>
      </div>
      <ChevronRight size={16} className="text-[#C0BAB2] group-hover:text-[#8A8A8A] transition-colors" />
    </button>
  );
}

type AppearanceMode = 'system' | 'light' | 'dark';

export default function SettingsModal({ open, onClose }: Props) {
  const { demoMode, toggleDemoMode } = useTrips();
  const [appearance, setAppearance] = useState<AppearanceMode>('light');
  const [language, setLanguage]     = useState('en');
  const [mounted, setMounted]       = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [whatsNewOpen, setWhatsNewOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (open) {
      setAppearance((localStorage.getItem('appearance') as AppearanceMode | null) ?? 'light');
      setLanguage(localStorage.getItem('language') ?? 'en');
    }
  }, [open]);

  function applyAppearance(mode: AppearanceMode) {
    localStorage.setItem('appearance', mode);
    const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    setAppearance(mode);
  }

  function handleLanguageChange(code: string) {
    setLanguage(code);
    localStorage.setItem('language', code);
  }

  async function handleShare() {
    const url = window.location.origin;
    if (navigator.share) {
      await navigator.share({ title: "Let's Go – Travel Journal", url });
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  }

  const isDark = appearance === 'dark';
  const ic = iconColor(isDark);

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full"
              style={{ maxWidth: 440 }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-[#E8E6E1]">
                <div className="flex items-center gap-2.5">
                  <Settings size={16} className="text-[#8A8A8A]" />
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="px-5 pt-5 pb-3 space-y-5">

                {/* General */}
                <div>
                  <SectionLabel>General</SectionLabel>
                  <div className="space-y-1.5">
                    <SettingRow dark={isDark} icon={<PlayCircle size={16} className={ic} />} label="Demo Mode">
                      <Toggle on={demoMode} onToggle={toggleDemoMode} />
                    </SettingRow>

                    <SettingRow dark={isDark} icon={<Monitor size={16} className={ic} />} label="Appearance">
                      <select
                        value={appearance}
                        onChange={e => applyAppearance(e.target.value as AppearanceMode)}
                        className="w-20 text-sm md:text-[12px] text-[#8A8A8A] bg-[#EDEAE5] border-none rounded-lg px-1 md:px-2.5 py-0.5 md:py-1 focus:outline-none focus:ring-1 focus:ring-[#C87A53] cursor-pointer"
                      >
                        <option value="system">System</option>
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                      </select>
                    </SettingRow>

                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${iconBg(isDark)} flex items-center justify-center shrink-0 transition-colors`}>
                          <Globe size={16} className={ic} />
                        </div>
                        <span className="text-sm text-[#1A1A1A]">Language</span>
                      </div>
                      <select
                        value={language}
                        onChange={e => handleLanguageChange(e.target.value)}
                        className="w-20 text-sm md:text-[12px] text-[#8A8A8A] bg-[#EDEAE5] border-none rounded-lg px-1 md:px-2.5 py-0.5 md:py-1 focus:outline-none focus:ring-1 focus:ring-[#C87A53] cursor-pointer"
                      >
                        {LANGUAGES.map(l => (
                          <option key={l.code} value={l.code}>{l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Help */}
                <div>
                  <SectionLabel>Help</SectionLabel>
                  <div className="space-y-1.5">
                    <ActionRow
                      dark={isDark}
                      icon={<Mail size={16} className={ic} />}
                      label="Contact Support"
                      onClick={() => window.open('mailto:zhenglin0619@gmail.com', '_blank')}
                    />
                  </div>
                </div>

                {/* About */}
                <div>
                  <SectionLabel>About</SectionLabel>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={handleShare}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4] hover:bg-[#F0ECE6] transition-colors group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full ${iconBg(isDark)} flex items-center justify-center shrink-0 transition-colors`}>
                          <Share size={16} className={ic} />
                        </div>
                        <span className="text-sm text-[#1A1A1A]">Share LET&rsquo;S GO</span>
                      </div>
                      {shareCopied ? (
                        <span className="text-[11px] font-medium text-[#C87A53]">Copied!</span>
                      ) : (
                        <ChevronRight size={16} className="text-[#C0BAB2] group-hover:text-[#8A8A8A] transition-colors" />
                      )}
                    </button>

                    <ActionRow
                      dark={isDark}
                      icon={<Shield size={16} className={ic} />}
                      label="Privacy Policy"
                      onClick={() => window.open('/privacy', '_blank')}
                    />

                    <ActionRow
                      dark={isDark}
                      icon={<FileText size={16} className={ic} />}
                      label="Terms of Service"
                      onClick={() => window.open('/terms', '_blank')}
                    />
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 pb-4 pt-2 flex flex-col items-center gap-0.5">
                <p className="text-[10px] text-[#4A4A4A] tracking-wide flex items-center gap-1">
                  by CX <Heart size={10} className="text-[#C87A53] fill-[#C87A53]" /> ZW
                </p>
                <button
                  type="button"
                  onClick={() => setWhatsNewOpen(true)}
                  className="text-[10px] text-[#4A4A4A] tracking-widest hover:text-[#C87A53] transition-colors"
                >
                  version 1.2.0
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {mounted ? createPortal(modal, document.body) : null}
      <WhatsNewModal open={whatsNewOpen} onClose={() => setWhatsNewOpen(false)} />
    </>
  );
}
