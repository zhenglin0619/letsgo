'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, UserPlus, UserMinus, Users, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useTrips } from '@/store/tripsContext';

export type ItemType = 'trip' | 'restaurant' | 'hotel';

interface Profile { id: string; email: string; }

interface ItemCollaborator {
  rowId: string;
  userId: string;
  email: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  itemId: string;
  itemType: ItemType;
  itemTitle: string;
  ownerId: string;
}

export default function ItemCollaboratorModal({ open, onClose, itemId, itemType, itemTitle, ownerId }: Props) {
  const { user } = useTrips();
  const [ownerEmail, setOwnerEmail]   = useState('');
  const [accepted, setAccepted]       = useState<ItemCollaborator[]>([]);
  const [pending, setPending]         = useState<ItemCollaborator[]>([]);
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<Profile[]>([]);
  const [searching, setSearching]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [inviting, setInviting]       = useState<string | null>(null);
  const [acting, setActing]           = useState<string | null>(null);
  const [error, setError]             = useState('');
  const [mounted, setMounted]         = useState(false);

  const isOwner = user?.id === ownerId;

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open || !user) return;
    setQuery(''); setResults([]); setError('');
    fetchCollaborators();
  }, [open, itemId]);

  async function fetchCollaborators() {
    setLoading(true);

    const [{ data: rows }, { data: ownerProfile }] = await Promise.all([
      supabase.from('item_collaborators')
        .select('id, collaborator_id, inviter_id, status')
        .eq('item_id', itemId)
        .eq('item_type', itemType),
      supabase.from('profiles').select('email').eq('id', ownerId).single(),
    ]);

    setOwnerEmail((ownerProfile as { email: string } | null)?.email ?? '');

    if (!rows?.length) { setAccepted([]); setPending([]); setLoading(false); return; }

    const userIds = [...new Set([...rows.map(r => r.collaborator_id as string), ...rows.map(r => r.inviter_id as string)])];
    const { data: profiles } = await supabase.from('profiles').select('id, email').in('id', userIds);
    const emailMap = Object.fromEntries((profiles ?? []).map(p => [p.id as string, p.email as string]));

    setAccepted(
      rows.filter(r => r.status === 'accepted' && r.collaborator_id !== ownerId)
          .map(r => ({ rowId: r.id as string, userId: r.collaborator_id as string, email: emailMap[r.collaborator_id as string] ?? '' }))
    );
    setPending(
      rows.filter(r => r.status === 'pending')
          .map(r => ({ rowId: r.id as string, userId: r.collaborator_id as string, email: emailMap[r.collaborator_id as string] ?? '' }))
    );
    setLoading(false);
  }

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      const { data } = await supabase
        .from('profiles').select('id, email')
        .ilike('email', `%${query}%`)
        .neq('id', ownerId)
        .limit(8);
      setSearching(false);
      setResults((data ?? []) as Profile[]);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, ownerId]);

  async function handleInvite(profile: Profile) {
    setInviting(profile.id);
    setError('');
    const { error: err } = await supabase.from('item_collaborators').insert({
      item_id: itemId, item_type: itemType, item_name: itemTitle,
      inviter_id: user!.id, collaborator_id: profile.id, status: 'pending',
    });
    setInviting(null);
    if (err) { setError(err.code === '23505' ? 'Already invited' : err.message); return; }
    await fetchCollaborators();
    setQuery(''); setResults([]);
  }

  async function handleRemove(rowId: string, actId: string) {
    setActing(actId);
    await supabase.from('item_collaborators').delete().eq('id', rowId);
    setActing(null);
    setAccepted(prev => prev.filter(c => c.rowId !== rowId));
    setPending(prev => prev.filter(c => c.rowId !== rowId));
  }

  const existingIds = new Set([ownerId, ...accepted.map(c => c.userId), ...pending.map(c => c.userId)]);

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
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <div className="flex items-center gap-2 min-w-0">
                  <Users size={16} className="text-[#8A8A8A] shrink-0" />
                  <div className="min-w-0">
                    <h2 className="serif text-lg font-semibold text-[#1A1A1A]">Share</h2>
                    <p className="text-[11px] text-[#8A8A8A] truncate">{itemTitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors shrink-0 ml-2"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">

                {/* Search / invite */}
                <div>
                  <div className="flex items-center gap-2.5 border border-[#E8E6E1] rounded-xl px-4 py-3 focus-within:border-[#C87A53] transition-colors">
                    <Search size={14} className="text-[#C0BAB2] shrink-0" />
                    <input
                      type="email"
                      placeholder="Invite by email…"
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
                        const already = existingIds.has(profile.id);
                        return (
                          <div key={profile.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                                <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">{profile.email[0]}</span>
                              </div>
                              <span className="text-sm text-[#1A1A1A] truncate">{profile.email}</span>
                            </div>
                            {already ? (
                              <span className="text-[11px] text-[#C87A53] font-medium shrink-0 ml-2">Already added</span>
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

                {/* Has Access */}
                <div>
                  <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">Has Access</p>
                  {loading ? (
                    <p className="text-sm text-[#8A8A8A] text-center py-2">Loading…</p>
                  ) : (
                    <div className="space-y-1.5">
                      {/* Owner row — always shown first */}
                      {ownerEmail && (
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">{ownerEmail[0]}</span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">
                              {ownerEmail}{ownerId === user?.id ? ' (you)' : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <Crown size={11} className="text-[#C87A53]" />
                            <span className="text-[11px] font-medium text-[#C87A53]">Owner</span>
                          </div>
                        </div>
                      )}

                      {/* Accepted collaborators */}
                      {accepted.map(c => (
                        <div key={c.rowId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">{c.email[0]}</span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">{c.email}</span>
                          </div>
                          {isOwner && (
                            <button
                              onClick={() => handleRemove(c.rowId, c.userId)}
                              disabled={acting === c.userId}
                              className="flex items-center gap-1 text-[11px] font-medium text-[#8A8A8A] hover:text-red-400 transition-colors shrink-0 ml-2 disabled:opacity-50"
                            >
                              <UserMinus size={12} />
                              {acting === c.userId ? '…' : 'Remove'}
                            </button>
                          )}
                        </div>
                      ))}

                      {accepted.length === 0 && !loading && (
                        <p className="text-sm text-[#8A8A8A] text-center py-1">No collaborators yet.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Awaiting response */}
                {pending.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">Awaiting Response</p>
                    <div className="space-y-1.5">
                      {pending.map(c => (
                        <div key={c.rowId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-[#E8E4DC] flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase">{c.email[0]}</span>
                            </div>
                            <span className="text-sm text-[#1A1A1A] truncate">{c.email}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[11px] text-[#C0BAB2] italic">Pending</span>
                            {isOwner && (
                              <button
                                onClick={() => handleRemove(c.rowId, c.userId)}
                                disabled={acting === c.userId}
                                className="text-[11px] font-medium text-[#8A8A8A] hover:text-red-400 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
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
