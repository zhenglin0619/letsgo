'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, UserMinus, Users, Check, Ban } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTrips } from '@/store/tripsContext';

interface Profile { id: string; email: string; }

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CollaboratorModal({ open, onClose }: Props) {
  const { user, collaborators, pendingInvites, sentInvites, sendInvite, acceptInvite, rejectInvite, removeCollaborator } = useTrips();
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Profile[]>([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting] = useState<string | null>(null);
  const [acting, setActing]     = useState<string | null>(null);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (open) { setQuery(''); setResults([]); setError(''); }
  }, [open]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, email')
        .ilike('email', `%${query}%`)
        .neq('id', user?.id ?? '')
        .limit(8);
      setSearching(false);
      setResults((data ?? []) as Profile[]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, user?.id]);

  async function handleInvite(profile: Profile) {
    setInviting(profile.id);
    setError('');
    const err = await sendInvite(profile.email);
    setInviting(null);
    if (err) setError(err);
  }

  async function handleAccept(ownerId: string) {
    setActing(ownerId);
    await acceptInvite(ownerId);
    setActing(null);
  }

  async function handleReject(ownerId: string) {
    setActing(ownerId);
    await rejectInvite(ownerId);
    setActing(null);
  }

  const collabIds  = new Set(collaborators.map(c => c.userId));
  const sentIds    = new Set(sentInvites.map(s => s.inviteeId));

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full overflow-y-auto"
              style={{ maxWidth: 440, maxHeight: '90vh' }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-[#8A8A8A]" />
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">Collaborators</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Pending invites received */}
                {pendingInvites.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#C87A53] uppercase tracking-widest mb-2 pl-1">
                      Pending Invites
                    </p>
                    <div className="space-y-1.5">
                      {pendingInvites.map(inv => (
                        <div key={inv.ownerId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#FDF6F2] border border-[#F2D9CD]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#F2D9CD] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#C87A53] uppercase">
                                {inv.ownerEmail[0]}
                              </span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">{inv.ownerEmail}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            <button
                              onClick={() => handleAccept(inv.ownerId)}
                              disabled={acting === inv.ownerId}
                              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#C87A53] hover:bg-[#B56B45] rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50"
                            >
                              <Check size={10} />
                              {acting === inv.ownerId ? '…' : 'Accept'}
                            </button>
                            <button
                              onClick={() => handleReject(inv.ownerId)}
                              disabled={acting === inv.ownerId}
                              className="flex items-center gap-1 text-[11px] font-medium text-[#8A8A8A] hover:text-red-400 transition-colors disabled:opacity-50"
                            >
                              <Ban size={10} />
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search / invite */}
                <div>
                  <div className="flex items-center gap-2.5 border border-[#E8E6E1] rounded-xl px-4 py-3 focus-within:border-[#C87A53] transition-colors">
                    <Search size={14} className="text-[#C0BAB2] shrink-0" />
                    <input
                      type="email"
                      placeholder="Search by email to invite…"
                      value={query}
                      onChange={e => { setQuery(e.target.value); setError(''); }}
                      className="flex-1 text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#C0BAB2] min-w-0"
                      autoFocus
                    />
                    {searching && (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-[#C0BAB2] border-t-transparent animate-spin shrink-0" />
                    )}
                  </div>
                  {error && <p className="text-[11px] text-red-400 mt-1.5 pl-1">{error}</p>}
                </div>

                {/* Search results */}
                {results.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">Results</p>
                    <div className="space-y-1.5">
                      {results.map(profile => {
                        const isCollab  = collabIds.has(profile.id);
                        const isPending = sentIds.has(profile.id);
                        return (
                          <div key={profile.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">
                                  {profile.email[0]}
                                </span>
                              </div>
                              <span className="text-sm text-[#1A1A1A] truncate">{profile.email}</span>
                            </div>
                            {isCollab ? (
                              <span className="text-[11px] text-[#C87A53] font-medium shrink-0 ml-2">Collaborating</span>
                            ) : isPending ? (
                              <span className="text-[11px] text-[#8A8A8A] font-medium shrink-0 ml-2">Invite sent</span>
                            ) : (
                              <button
                                onClick={() => handleInvite(profile)}
                                disabled={inviting === profile.id}
                                className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50 shrink-0 ml-2"
                              >
                                <UserPlus size={10} />
                                {inviting === profile.id ? '…' : 'Invite'}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {query.length >= 2 && !searching && results.length === 0 && (
                  <p className="text-sm text-[#8A8A8A] text-center py-1">No account found with that email.</p>
                )}

                {/* Current collaborators */}
                <div>
                  <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">
                    Current Collaborators
                  </p>
                  {collaborators.length > 0 ? (
                    <div className="space-y-1.5">
                      {collaborators.map(c => (
                        <div key={c.userId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">
                                {c.email[0]}
                              </span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">{c.email}</span>
                          </div>
                          <button
                            onClick={() => removeCollaborator(c.userId)}
                            className="flex items-center gap-1 text-[11px] font-medium text-[#8A8A8A] hover:text-red-400 transition-colors shrink-0 ml-2"
                          >
                            <UserMinus size={12} />
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#8A8A8A] text-center py-2">No collaborators yet.</p>
                  )}
                </div>

                {/* Sent invites awaiting acceptance */}
                {sentInvites.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">
                      Awaiting Response
                    </p>
                    <div className="space-y-1.5">
                      {sentInvites.map(s => (
                        <div key={s.inviteeId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">
                                {s.inviteeEmail[0]}
                              </span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">{s.inviteeEmail}</span>
                          </div>
                          <span className="text-[11px] text-[#C0BAB2] italic shrink-0 ml-2">Pending</span>
                        </div>
                      ))}
                    </div>
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
