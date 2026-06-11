'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Tab = 'signin' | 'signup';

export default function AuthModal() {
  const [tab, setTab]         = useState<Tab>('signin');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);

  async function handleGoogle() {
    setGoogleLoading(true);
    setError('');
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (e) { setError(e.message); setGoogleLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (tab === 'signin') {
      const { error: e } = await supabase.auth.signInWithPassword({ email, password });
      if (e) { setError(e.message); setLoading(false); }
    } else {
      const { error: e } = await supabase.auth.signUp({ email, password });
      if (e) { setError(e.message); setLoading(false); }
      else setSent(true);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #FBF9F6 0%, #F0ECE5 100%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', damping: 24, stiffness: 220 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}
      >
        {/* Logo area */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-[#F0ECE6]">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Logo" width={80} height={80} className="object-contain" />
          </div>
          <h1 className="font-black text-[#1A1A1A] tracking-[0.1em] uppercase"
            style={{ fontSize: '18px', WebkitTextStroke: '0.5px #1A1A1A' }}>
            Let&rsquo;s Go
          </h1>
          <p className="text-[10px] font-medium tracking-[0.22em] text-[#C87A53] uppercase mt-1">
            Travel Journal
          </p>
        </div>

        <div className="px-8 pb-8 pt-6">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3">
                  <Mail size={20} className="text-green-500" />
                </div>
                <h2 className="font-semibold text-[#1A1A1A] text-base mb-1">Check your email</h2>
                <p className="text-sm text-[#8A8A8A] leading-relaxed">
                  We sent a confirmation link to<br/>
                  <span className="text-[#1A1A1A] font-medium">{email}</span>
                </p>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Tabs */}
                <div className="flex rounded-xl bg-[#F5F2EE] p-1 mb-6">
                  {(['signin', 'signup'] as Tab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); setError(''); }}
                      className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
                        tab === t
                          ? 'bg-white text-[#1A1A1A] shadow-sm'
                          : 'text-[#8A8A8A] hover:text-[#1A1A1A]'
                      }`}
                    >
                      {t === 'signin' ? 'Sign in' : 'Create account'}
                    </button>
                  ))}
                </div>

                {/* Google OAuth */}
                <button
                  onClick={handleGoogle}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-2.5 border border-[#E8E6E1] rounded-xl py-3 text-sm font-medium text-[#1A1A1A] hover:bg-[#F9F7F4] transition-colors mb-4 disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 size={16} className="animate-spin text-[#8A8A8A]" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                      <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
                      <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
                      <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.31z"/>
                    </svg>
                  )}
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-[#E8E6E1]"/>
                  <span className="text-[11px] text-[#B0AAA2]">or</span>
                  <div className="flex-1 h-px bg-[#E8E6E1]"/>
                </div>

                {/* Email form */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AAA2]" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-4 py-3 text-sm border border-[#E8E6E1] rounded-xl focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B0AAA2]" />
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-4 py-3 text-sm border border-[#E8E6E1] rounded-xl focus:outline-none focus:border-[#C87A53] text-[#1A1A1A] placeholder:text-[#C0BAB2] transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="flex items-start gap-2 text-red-500 text-xs bg-red-50 rounded-xl px-3 py-2.5">
                      <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1A1A1A] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                  >
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {tab === 'signin' ? 'Sign in' : 'Create account'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
