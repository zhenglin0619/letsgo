'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, NotebookPen, Plus, Pencil, Trash2, Check, Plane, Utensils, BedDouble } from 'lucide-react';
import { useTrips } from '@/store/tripsContext';
import { useLanguage } from '@/store/languageContext';
import { supabase } from '@/lib/supabase';

type PlanType = 'trip' | 'dining' | 'hotel';

interface Plan {
  id: string;
  user_id: string;
  title: string;
  notes: string;
  type: PlanType;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

const TYPE_DEFS: { value: PlanType; Icon: React.ElementType }[] = [
  { value: 'trip',   Icon: Plane      },
  { value: 'dining', Icon: Utensils   },
  { value: 'hotel',  Icon: BedDouble  },
];

function TypePicker({ value, onChange }: { value: PlanType; onChange: (v: PlanType) => void }) {
  const { t } = useLanguage();
  const TYPES = [
    { value: 'trip' as PlanType,   label: t('plan_type_trip'),   Icon: Plane     },
    { value: 'dining' as PlanType, label: t('plan_type_dining'), Icon: Utensils  },
    { value: 'hotel' as PlanType,  label: t('plan_type_hotel'),  Icon: BedDouble },
  ];
  return (
    <div className="flex gap-1.5">
      {TYPES.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
            value === v
              ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
              : 'bg-white text-[#8A8A8A] border-[#E8E6E1] hover:border-[#1A1A1A] hover:text-[#1A1A1A]'
          }`}
        >
          <Icon size={11} />
          {label}
        </button>
      ))}
    </div>
  );
}

function PlanTypeIcon({ type, nightMode }: { type: PlanType; nightMode: boolean }) {
  const match = TYPE_DEFS.find(t => t.value === type);
  if (!match) return null;
  const { Icon } = match;
  return (
    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${nightMode ? 'bg-[#1A1A1A]' : 'bg-[#E8E4DC]'}`}>
      <Icon size={12} className={nightMode ? 'text-[#C87A53]' : 'text-[#8A8A8A]'} />
    </div>
  );
}

export default function FuturePlanModal({ open, onClose }: Props) {
  const { user } = useTrips();
  const { t } = useLanguage();
  const [plans, setPlans]           = useState<Plan[]>([]);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editTitle, setEditTitle]   = useState('');
  const [editNotes, setEditNotes]   = useState('');
  const [editType, setEditType]     = useState<PlanType>('trip');
  const [adding, setAdding]         = useState(false);
  const [newTitle, setNewTitle]     = useState('');
  const [newNotes, setNewNotes]     = useState('');
  const [newType, setNewType]       = useState<PlanType>('trip');
  const [mounted, setMounted]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [nightMode, setNightMode]   = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setNightMode(document.documentElement.classList.contains('dark'));
  }, [open]);

  useEffect(() => {
    if (!open || !user) return;
    setAdding(false);
    setEditingId(null);
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from('future_plans')
        .select('id, user_id, title, notes, type')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      setPlans((data ?? []) as Plan[]);
      setLoading(false);
    })();
  }, [open, user]);

  async function addPlan() {
    if (!newTitle.trim() || !user) return;
    const row = { id: Date.now().toString(), user_id: user.id, title: newTitle.trim(), notes: newNotes.trim(), type: newType };
    const { data } = await supabase.from('future_plans').insert(row).select('id, user_id, title, notes, type').single();
    if (data) setPlans(prev => [...prev, data as Plan]);
    setNewTitle('');
    setNewNotes('');
    setNewType('trip');
    setAdding(false);
  }

  function startEdit(plan: Plan) {
    setEditingId(plan.id);
    setEditTitle(plan.title);
    setEditNotes(plan.notes);
    setEditType(plan.type ?? 'trip');
  }

  async function commitEdit() {
    if (!editTitle.trim() || !editingId) return;
    const updates = { title: editTitle.trim(), notes: editNotes.trim(), type: editType };
    await supabase.from('future_plans').update(updates).eq('id', editingId);
    setPlans(prev => prev.map(p => p.id === editingId ? { ...p, ...updates } : p));
    setEditingId(null);
  }

  async function deletePlan(id: string) {
    await supabase.from('future_plans').delete().eq('id', id);
    setPlans(prev => prev.filter(p => p.id !== id));
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
              className="bg-white rounded-2xl shadow-2xl pointer-events-auto w-full flex flex-col"
              style={{ maxWidth: 440, maxHeight: '80vh' }}
              initial={{ scale: 0.94, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 12 }}
              transition={{ type: 'spring', damping: 25, stiffness: 240 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E6E1]">
                <div className="flex items-center gap-2">
                  <NotebookPen size={16} className="text-[#8A8A8A]" />
                  <h2 className="serif text-lg font-semibold text-[#1A1A1A]">{t('plan_title')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#F0ECE6] flex items-center justify-center hover:bg-[#E8E4DC] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 overflow-y-auto flex-1">

                {/* Plan list */}
                <div>
                  <p className="text-[10px] font-semibold text-[#C0BAB2] uppercase tracking-widest mb-2 pl-1">
                    {t('plan_my_plans')}
                  </p>

                  {loading ? (
                    <div className="flex justify-center py-4">
                      <div className="w-4 h-4 rounded-full border-2 border-[#C0BAB2] border-t-transparent animate-spin" />
                    </div>
                  ) : plans.length === 0 && !adding ? (
                    <p className="text-sm text-[#8A8A8A] text-center py-2">{t('plan_empty')}</p>
                  ) : (
                    <div className="space-y-1.5">
                      {plans.map(plan => (
                        <div key={plan.id} className="px-3 py-2.5 rounded-xl bg-[#F9F7F4]">
                          {editingId === plan.id ? (
                            <div className="space-y-2">
                              <TypePicker value={editType} onChange={setEditType} />
                              <input
                                autoFocus
                                value={editTitle}
                                onChange={e => setEditTitle(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null); }}
                                className="w-full text-sm text-[#1A1A1A] bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 outline-none focus:border-[#C87A53] transition-colors"
                                placeholder={t('plan_title_ph')}
                              />
                              <input
                                value={editNotes}
                                onChange={e => setEditNotes(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                                className="w-full text-sm text-[#8A8A8A] bg-white border border-[#E8E6E1] rounded-lg px-3 py-1.5 outline-none focus:border-[#C87A53] transition-colors"
                                placeholder={t('plan_notes_ph')}
                              />
                              <div className="flex gap-2 justify-end pt-0.5">
                                <button onClick={() => setEditingId(null)} className="text-[11px] text-[#8A8A8A] hover:text-[#1A1A1A] px-3 py-1.5 rounded-lg hover:bg-[#E8E4DC] transition-colors">{t('common_cancel')}</button>
                                <button onClick={commitEdit} className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg px-2.5 py-1.5 transition-colors">
                                  <Check size={10} />{t('common_save')}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <PlanTypeIcon type={plan.type ?? 'trip'} nightMode={nightMode} />
                                <div className="min-w-0">
                                  <p className="text-sm text-[#1A1A1A] font-medium truncate">{plan.title}</p>
                                  {plan.notes && <p className="text-[11px] text-[#8A8A8A] mt-0.5 leading-relaxed">{plan.notes}</p>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => startEdit(plan)} className="text-[#8A8A8A] hover:text-[#1A1A1A] transition-colors">
                                  <Pencil size={12} />
                                </button>
                                <button onClick={() => deletePlan(plan.id)} className="text-[#8A8A8A] hover:text-red-400 transition-colors ml-1">
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add form */}
                {adding ? (
                  <div className="space-y-2">
                    <TypePicker value={newType} onChange={setNewType} />
                    <div className="flex items-center gap-2.5 border border-[#E8E6E1] rounded-xl px-4 py-3 focus-within:border-[#C87A53] transition-colors">
                      <input
                        autoFocus
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addPlan(); if (e.key === 'Escape') { setAdding(false); setNewTitle(''); setNewNotes(''); } }}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#C0BAB2] min-w-0"
                        placeholder={t('plan_title_input')}
                      />
                    </div>
                    <div className="flex items-center gap-2.5 border border-[#E8E6E1] rounded-xl px-4 py-3 focus-within:border-[#C87A53] transition-colors">
                      <input
                        value={newNotes}
                        onChange={e => setNewNotes(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Escape') { setAdding(false); setNewTitle(''); setNewNotes(''); } }}
                        className="flex-1 text-sm bg-transparent focus:outline-none text-[#1A1A1A] placeholder:text-[#C0BAB2] min-w-0"
                        placeholder={t('plan_notes_input')}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setAdding(false); setNewTitle(''); setNewNotes(''); setNewType('trip'); }} className="text-[11px] text-[#8A8A8A] hover:text-[#1A1A1A] px-3 py-1.5 rounded-lg hover:bg-[#F0ECE6] transition-colors">{t('common_cancel')}</button>
                      <button onClick={addPlan} className="flex items-center gap-1 text-[11px] font-semibold text-white bg-[#1A1A1A] hover:bg-[#333] rounded-lg px-2.5 py-1.5 transition-colors">
                        <Plus size={10} />{t('common_add')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAdding(true)}
                    className="w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#8A8A8A] hover:text-[#1A1A1A] border border-dashed border-[#D4CFC8] hover:border-[#1A1A1A] rounded-xl py-2.5 transition-colors"
                  >
                    <Plus size={12} />
                    {t('plan_add')}
                  </button>
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
