'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface Release {
  version: string;
  date: string;
  items: { tag: 'New' | 'Improved' | 'Bug'; text: string }[];
}

const RELEASES: Release[] = [
  {
    version: '1.2.2',
    date: 'June 20, 2025',
    items: [
      { tag: 'New', text: 'Upgrade Mobile UI: Improved layout more clearly on mobile devices' },
      { tag: 'Bug', text: 'Fixed bugs and Improved UI' },
    ],
  },
  {
    version: '1.2.1',
    date: 'June 15, 2025',
    items: [
      { tag: 'New', text: 'Save Draft: You can now save your progress as a draft and continue editing later' },
      { tag: 'Bug', text: 'Fixed always showing loading page on first load after session token expires' },
      { tag: 'Bug', text: 'Fixed bugs and Improved UI' },
    ],
  },
  {
    version: '1.2.0',
    date: 'June 15, 2025',
    items: [
      { tag: 'New', text: 'Item-Level Collaborations: You can share individual trips, restaurants, and hotels independently to different accounts now' },
      { tag: 'New', text: 'Appearance Setting: You can change the appearance to System, Light, and Dark mode options' },
      { tag: 'New', text: 'Notification Badge: You can see a number badge on your avatar for pending collaboration invitations' },
      { tag: 'New', text: 'New Collaboration Features: Owners and collaborators. All collaborators can edit, share, and leave, but cannot delete. Otherwise, the owners can do anything' },
      { tag: 'New', text: 'What\'s New: A dedicated modal to showcase the latest updates and features' },
      { tag: 'Bug', text: 'Prevent multiple-click add button to create duplicates' },
      { tag: 'Bug', text: 'Fixed bugs and Improved UI' },
    ],
  },
  {
    version: '1.1.2',
    date: 'June 14, 2025',
    items: [
      { tag: 'New', text: 'Web App Icon: Updated PWA icon and iOS Home Screen icon' },
      { tag: 'Bug', text: 'Fixed bugs and Improved UI' },
    ],
  },
  {
    version: '1.1.1',
    date: 'June 13, 2025',
    items: [
      { tag: 'New', text: 'Currency Auto-Update: You can now choose your preferred currency at any time, and it will be automatically updated' },
      { tag: 'Bug', text: 'Fixed time zone issue causing inconsistent dates' },
      { tag: 'Bug', text: 'Fixed bugs and Improved UI' },
    ],
  },
  {
    version: '1.1.0',
    date: 'June 13, 2025',
    items: [
      { tag: 'New', text: 'Official Public Release' },
      { tag: 'New', text: 'World Map: View your visited countries and cities with a heatmap on World homepage' },
      { tag: 'New', text: 'Stats Bento: View your dining and hotel summaries, including visit counts and total expenses' },
      { tag: 'New', text: 'Trip Collaboration: Invite others to view and contribute to your trips, dinings, and stays' },
      { tag: 'New', text: 'Future Plan: Add or edit your future plans to keep track of upcoming experiences' },
    ],
  },
];

const TAG_STYLES: Record<Release['items'][number]['tag'], string> = {
  New:      'bg-[#C87A53]/10 text-[#C87A53]',
  Improved: 'bg-[#4A5343]/10 text-[#4A5343]',
  Bug:      'bg-[#8A8A8A]/10 text-[#8A8A8A]',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function WhatsNewModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10002] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-[10003] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full flex flex-col"
              style={{ maxWidth: 460, maxHeight: '90vh' }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1] shrink-0">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-[#C87A53]" />
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">What&rsquo;s New</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
                {RELEASES.map((release, i) => (
                  <div key={release.version}>
                    <div className="flex items-center gap-5 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="serif font-semibold text-[#1A1A1A]">
                          <span className="text-base">Version </span><span className="text-xl">{release.version}</span>
                        </span>
                        {i === 0 && (
                          <span className="text-[10px] font-semibold bg-[#C87A53] text-white px-1.5 py-0.5 rounded-full uppercase tracking-wide self-end mb-0.5 ml-1">
                            Latest
                          </span>
                        )}
                        <span className="text-xs text-[#C0BAB2] self-end mb-0.5 ml-1">{release.date}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {release.items.map((item, j) => (
                        <div key={j} className="flex items-start gap-2.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 min-w-[35px] text-center ${TAG_STYLES[item.tag]}`}>
                            {item.tag}
                          </span>
                          <p className="text-sm text-[#4A4A4A] leading-snug">{item.text}</p>
                        </div>
                      ))}
                    </div>
                    {i < RELEASES.length - 1 && (
                      <div className="mt-6 border-b border-[#F0ECE6]" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(modal, document.body) : null;
}
