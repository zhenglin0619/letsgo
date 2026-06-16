'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HotelLog } from '@/types';
import StarRating from '@/components/ui/StarRating';
import { X, MapPin, BedDouble, Eye, Pencil, Trash2, Check, MoreHorizontal, Users, LogOut } from 'lucide-react';
import { fmtCountry, parseLocalDate } from '@/lib/formatUtils';

interface Props {
  hotel: HotelLog | null;
  open: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onLeave?: () => void;
  isOwner?: boolean;
  onUpdateHotel?: (updated: HotelLog) => void;
}

function nights(checkIn: string, checkOut: string) {
  return Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000);
}

function formatDate(d: string) {
  return parseLocalDate(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function HotelDrawer({ hotel, open, onClose, onEdit, onDelete, onShare, onLeave, isOwner = true, onUpdateHotel }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingNote, setEditingNote] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [noteValue, setNoteValue] = useState('');
  const [savedToast, setSavedToast] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) { setConfirmDelete(false); setEditingNote(false); setSavedToast(false); setMenuOpen(false); }
  }, [open]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  useEffect(() => {
    if (!hotel) return;
    setNoteValue(hotel.notes ?? '');
    setEditingNote(false);
  }, [hotel?.id]);

  useEffect(() => {
    if (editingNote) setTimeout(() => textareaRef.current?.focus(), 50);
  }, [editingNote]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!hotel) return null;

  const n = nights(hotel.checkIn, hotel.checkOut);
  const perNight = Math.round(hotel.pricePerNight / (n || 1));

  function handleNoteSave() {
    if (!onUpdateHotel) return;
    onUpdateHotel({ ...hotel!, notes: noteValue.trim() });
    setEditingNote(false);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[10000] bg-black/40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[10001] bg-white shadow-2xl flex flex-col"
            style={{ width: 'min(520px, 95vw)' }}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-[#E8E6E1]">
              <div className="flex-1 min-w-0">
                <h2 className="serif text-xl font-semibold text-[#1A1A1A] truncate">{hotel.hotelName}</h2>
                <p className="text-xs text-[#8A8A8A] mt-0.5 flex items-center gap-1">
                  <MapPin size={10} />{hotel.location.city}, {fmtCountry(hotel.location.country)}
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors ml-3 flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Cover photo */}
              <div className="h-60 md:h-65 overflow-hidden relative">
                {hotel.photos[0] ? (
                  <img
                    src={hotel.photos[0]}
                    alt={hotel.hotelName}
                    className="w-full h-full object-cover"
                    style={hotel.photoTransform ? {
                      transform: `translate(${hotel.photoTransform.x}%, ${hotel.photoTransform.y}%) scale(${hotel.photoTransform.scale})`,
                      transformOrigin: 'center',
                    } : undefined}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#4A5343]/30 via-[#E8E4DC] to-[#C87A53]/20" />
                )}
                {(onEdit || onShare || onDelete || onLeave) && (
                  <div ref={menuRef} className="absolute top-3 right-3">
                    <button
                      onClick={() => setMenuOpen(v => !v)}
                      className="w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors flex items-center justify-center"
                    >
                      <MoreHorizontal size={14} className="text-white" />
                    </button>
                    {menuOpen && (
                      <div className="absolute top-9 right-0 bg-white rounded-xl shadow-xl border border-[#E8E6E1] py-1.5 w-40 z-30">
                        {!confirmDelete ? (
                          <>
                            {onEdit && (
                              <button
                                onClick={() => { onEdit(); onClose(); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
                              >
                                <Pencil size={13} className="text-[#8A8A8A]" /> Edit
                              </button>
                            )}
                            {onShare && (
                              <button
                                onClick={() => { onShare(); setMenuOpen(false); }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F2EE] transition-colors"
                              >
                                <Users size={13} className="text-[#8A8A8A]" /> Share
                              </button>
                            )}
                            {isOwner ? (
                              onDelete && (
                                <button
                                  onClick={() => setConfirmDelete(true)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 size={13} /> Delete
                                </button>
                              )
                            ) : (
                              onLeave && (
                                <button
                                  onClick={() => setConfirmDelete(true)}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                >
                                  <LogOut size={13} /> Leave
                                </button>
                              )
                            )}
                          </>
                        ) : (
                          <div className="px-4 py-2">
                            <p className="text-xs text-[#1A1A1A] font-medium mb-2">
                              {isOwner ? 'Delete this hotel?' : 'Leave this hotel?'}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => { isOwner ? onDelete!() : onLeave!(); onClose(); }}
                                className="flex-1 bg-red-500 text-white text-xs font-medium py-1.5 rounded-lg hover:bg-red-600 transition-colors"
                              >{isOwner ? 'Delete' : 'Leave'}</button>
                              <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 bg-[#F0ECE6] text-[#1A1A1A] text-xs font-medium py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors"
                              >Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-[#F0ECE6]">
                {hotel.rating > 0 && (
                  <div className="mb-3">
                    <StarRating value={hotel.rating} readonly size="md" />
                  </div>
                )}
                {hotel.location.address && (
                  <div className="flex items-center gap-1 text-xs text-[#8A8A8A] mb-3">
                    <MapPin size={11} />{hotel.location.address}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Check-in</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{formatDate(hotel.checkIn)}</p>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Check-out</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{formatDate(hotel.checkOut)}</p>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-xs font-medium text-[#1A1A1A]">{n} night{n !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="bg-[#FBFBFA] rounded-lg p-3">
                    <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Total Expense</p>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-0.5 md:gap-0">
                      <p className="text-xs font-medium text-[#1A1A1A]">{hotel.currency} {hotel.pricePerNight.toLocaleString()}</p>
                      <p className="text-xs text-[#8A8A8A]">{hotel.currency} {perNight.toLocaleString()} / night</p>
                    </div>
                  </div>
                  {hotel.roomType && (
                    <div className="bg-[#FBFBFA] rounded-lg p-3">
                      <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">Room Type</p>
                      <p className="text-xs font-medium text-[#1A1A1A] flex items-center gap-1">
                        <BedDouble size={11} className="text-[#8A8A8A]" />{hotel.roomType}
                      </p>
                    </div>
                  )}
                  {hotel.viewType && (
                    <div className="bg-[#FBFBFA] rounded-lg p-3">
                      <p className="text-[10px] text-[#8A8A8A] uppercase tracking-wider mb-1">View Type</p>
                      <p className="text-xs font-medium text-[#1A1A1A] flex items-center gap-1">
                        <Eye size={11} className="text-[#8A8A8A]" />{hotel.viewType}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div className="px-4 py-3 md:px-6 md:py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="serif text-base font-semibold text-[#1A1A1A]">Notes</h3>
                  {onUpdateHotel && !editingNote && (
                    <button
                      onClick={() => { setNoteValue(hotel.notes ?? ''); setEditingNote(true); }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-[#C87A53] hover:bg-[#F5F2EE] transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                  )}
                  {editingNote && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEditingNote(false)}
                        className="text-xs text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors"
                      >Cancel</button>
                      <button
                        onClick={handleNoteSave}
                        className="flex items-center gap-1 text-xs font-medium bg-[#1A1A1A] text-white px-3 py-1.5 rounded-full hover:bg-[#333] transition-colors"
                      >
                        <Check size={11} /> Done
                      </button>
                    </div>
                  )}
                </div>
                {editingNote ? (
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      rows={20}
                      maxLength={1000}
                      value={noteValue}
                      onChange={e => setNoteValue(e.target.value)}
                      placeholder="Add a note…"
                      className="w-full text-sm border border-[#E8E6E1] rounded-xl px-3 py-2.5 pb-6 focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] resize-none transition-colors"
                    />
                    <span className="absolute bottom-2 right-3 text-[10px] text-[#C0BAB2]">
                      {noteValue.length} / 1000
                    </span>
                  </div>
                ) : hotel.notes ? (
                  <p className="text-sm text-[#8A8A8A] leading-relaxed whitespace-pre-wrap">{hotel.notes}</p>
                ) : (
                  <p className="text-sm text-[#C0BAB2] italic">No notes yet.</p>
                )}
              </div>
            </div>

            {/* Changes Saved toast */}
            <AnimatePresence>
              {savedToast && (
                <motion.div
                  className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1A1A] text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 pointer-events-none"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Check size={12} className="text-[#C87A53]" />
                  Changes Saved
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
