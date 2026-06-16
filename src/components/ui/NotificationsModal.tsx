'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, Ban, Plane, Utensils, BedDouble } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import type { ElementType } from 'react';

const ITEM_ICONS: Record<string, ElementType> = {
  trip:       Plane,
  restaurant: Utensils,
  hotel:      BedDouble,
};

interface Props { open: boolean; onClose: () => void; }

export default function NotificationsModal({ open, onClose }: Props) {
  const { pendingItemInvites, acceptItemInvite, rejectItemInvite } = useTrips();
  const [acting, setActing] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function handleAccept(id: string) {
    setActing(id);
    await acceptItemInvite(id);
    setActing(null);
  }

  async function handleReject(id: string) {
    setActing(id);
    await rejectItemInvite(id);
    setActing(null);
  }

  const modal = (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div className="fixed inset-0 z-[10001] flex items-start md:items-center justify-center pt-40 md:pt-0 p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full overflow-y-auto"
              style={{ maxWidth: 440, maxHeight: '90vh' }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#8A8A8A]" />
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">Notifications</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6">
                {pendingItemInvites.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell size={28} className="text-[#C0BAB2] mx-auto mb-3" />
                    <p className="text-sm text-[#8A8A8A]">No pending invitations.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[10px] font-semibold text-[#C87A53] uppercase tracking-widest mb-3 pl-1">
                      Pending Invitations
                    </p>
                    {pendingItemInvites.map(inv => {
                      const Icon = ITEM_ICONS[inv.itemType] ?? Bell;
                      return (
                        <div key={inv.id} className="px-3 py-3 rounded-xl bg-[#FDF6F2] border border-[#F2D9CD]">
                          <div className="flex items-start gap-2.5 mb-2.5">
                            <div className="w-7 h-7 rounded-full bg-[#F2D9CD] flex items-center justify-center shrink-0 mt-0.5">
                              <Icon size={12} className="text-[#C87A53]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-[#1A1A1A] truncate">{inv.itemTitle}</p>
                              <p className="text-[11px] text-[#8A8A8A]">{inv.inviterEmail} invited you</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 pl-9">
                            <button
                              onClick={() => handleAccept(inv.id)}
                              disabled={acting === inv.id}
                              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#C87A53] hover:bg-[#B56B45] rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                            >
                              <Check size={10} />
                              {acting === inv.id ? '…' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleReject(inv.id)}
                              disabled={acting === inv.id}
                              className="flex items-center gap-1 text-[11px] font-medium text-[#8A8A8A] hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Ban size={10} />
                              Decline
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(modal, document.body) : null;
}
