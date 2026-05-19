import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert, Search, Eye, User, Mail, Hash,
  GraduationCap, BookOpen, AlertTriangle, CheckCircle2,
  Fingerprint, Lock, Unlock, RefreshCw, X
} from 'lucide-react';

// ── Animated typing effect for the ANO input ─────────────────────────────
const PLACEHOLDER_CYCLE = ['ANO-A3F2B1', 'ANO-7C9D4E', 'ANO-B1F208', 'ANO-4E2A91'];

export default function IdentityRevealPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);   // revealed student data
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);  // confirmation step
  const [revealed, setRevealed] = useState(false);  // final reveal shown
  const [searchCount, setSearchCount] = useState(0);      // audit counter

  const handleSearch = async () => {
    const anon_id = query.trim().toUpperCase();
    if (!anon_id) { setError('Please enter an Anonymous ID.'); return; }
    if (!anon_id.startsWith('ANO-')) { setError('Invalid format. Anonymous IDs start with "ANO-".'); return; }

    setError('');
    setResult(null);
    setRevealed(false);
    setConfirmed(false);
    setLoading(true);
    try {
      const { data } = await api.get(`/superadmin/reveal?anon_id=${encodeURIComponent(anon_id)}`);
      setResult(data);
      // Show confirmation step before full reveal
    } catch (e) {
      setError(e.response?.data?.message || 'No student found with that Anonymous ID.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReveal = () => {
    setConfirmed(true);
    setRevealed(true);
    setSearchCount(c => c + 1);
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setError('');
    setConfirmed(false);
    setRevealed(false);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto flex flex-col gap-6 w-full"
          >

            {/* ── Header ───────────────────────────────────────────────── */}
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-accent-500 via-accent-600 to-primary-600
                  rounded-2xl flex items-center justify-center shadow-xl shadow-accent-500/30 flex-shrink-0">
                  <Fingerprint size={22} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-[var(--text-main)]">Student Identity Reveal</h1>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                    Reveal the real identity behind an anonymous student ID
                  </p>
                </div>
              </div>
              {searchCount > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex-shrink-0">
                  <Eye size={11} /> {searchCount} reveal{searchCount > 1 ? 's' : ''} this session
                </div>
              )}
            </div>

            {/* ── Warning Banner ───────────────────────────────────────── */}
            <div className="flex items-start gap-3 p-4 bg-accent-500/10 border border-accent-500/30 rounded-2xl">
              <ShieldAlert size={18} className="text-accent-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-accent-300 mb-0.5">Restricted — Authorized Personnel Only</p>
                <p className="text-xs text-accent-400/80 leading-relaxed">
                  This tool is only to be used in cases of <span className="font-bold">inappropriate behavior</span> or
                  disciplinary investigation. Revealing a student's identity without cause is a violation of their privacy rights.
                  All reveals are logged for accountability.
                </p>
              </div>
            </div>

            {/* ── Search Box ───────────────────────────────────────────── */}
            <div className="card-main p-6">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-3">
                Enter Anonymous Student ID
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => {
                      setQuery(e.target.value.toUpperCase());
                      setError('');
                      setResult(null);
                      setRevealed(false);
                      setConfirmed(false);
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="ANO-XXXXXX"
                    className="w-full bg-slate-100 dark:bg-slate-900/80 border border-slate-300 dark:border-white/10 rounded-xl pl-11 pr-4 py-3.5
                      text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 placeholder-slate-500 dark:placeholder-slate-600
                      focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50
                      tracking-widest transition-all"
                    spellCheck={false}
                  />
                  {query && (
                    <button onClick={handleReset} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] cursor-pointer transition-colors">
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm
                    bg-gradient-to-r from-accent-600 to-accent-600 text-white
                    hover:from-accent-500 hover:to-accent-500 shadow-lg shadow-accent-500/25
                    hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
                    disabled:opacity-40 disabled:pointer-events-none w-full sm:w-auto"
                >
                  {loading
                    ? <RefreshCw size={16} className="animate-spin" />
                    : <Search size={16} />
                  }
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-accent-400 bg-accent-950/50 border border-accent-900/60 rounded-xl p-3"
                  >
                    <AlertTriangle size={13} />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <p className="text-xs text-slate-600 mt-3">
                Anonymous IDs are in the format <span className="font-mono text-slate-600 dark:text-slate-400">ANO-XXXXXX</span> (e.g. <span className="font-mono text-emerald-600 dark:text-emerald-500/80">ANO-A3F2B1</span>).
                Copy the ID from the feedback response or leaderboard.
              </p>
            </div>

            {/* ── Result ───────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
              {result && !confirmed && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card-main p-6 border border-amber-500/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl
                      flex items-center justify-center flex-shrink-0">
                      <Lock size={20} className="text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-black text-amber-600 dark:text-amber-200">Student Record Found</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        A student record matching <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{query}</span> was located.
                        Do you confirm you have valid grounds to reveal this student's identity?
                      </p>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <button
                          onClick={handleConfirmReveal}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
                            bg-gradient-to-r from-amber-500 to-orange-500 text-white
                            hover:from-amber-400 hover:to-orange-400 shadow-lg shadow-amber-500/25
                            hover:-translate-y-0.5 transition-all cursor-pointer"
                        >
                          <Unlock size={15} /> Yes, Reveal Identity
                        </button>
                        <button
                          onClick={handleReset}
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
                            hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10
                            transition-all cursor-pointer"
                        >
                          <X size={15} /> Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {result && revealed && (
                <motion.div
                  key="reveal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="card-main overflow-hidden border border-emerald-500/30"
                >
                  {/* Top stripe */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-accent-500 via-accent-500 to-primary-500" />

                  <div className="p-6">
                    {/* Revealed badge */}
                    <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-widest">Identity Revealed</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 rounded-lg border border-slate-200 dark:border-white/10">
                        Session #{searchCount}
                      </span>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-4 mb-6 p-4 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/8">
                      <div className="h-14 w-14 bg-gradient-to-br from-primary-500 to-accent-600
                        rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-xl flex-shrink-0">
                        {result.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xl font-black text-slate-900 dark:text-white truncate">{result.name}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">{result.email || 'No email registered'}</div>
                      </div>
                    </div>

                    {/* Detail grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <div className="flex flex-col gap-1.5 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">
                          <Hash size={11} /> Anonymous ID (Public)
                        </div>
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-lg tracking-widest truncate">
                          {result.unique_feedback_id || query}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">This is what everyone else sees</div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-4 bg-accent-50 dark:bg-accent-950/30 border border-accent-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest">
                          <GraduationCap size={11} /> Roll Number (Confidential)
                        </div>
                        <div className="font-mono font-black text-accent-600 dark:text-accent-300 text-lg truncate">
                          {result.student_id || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Official university roll number</div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-4 hover:bg-black/5 dark:hover:bg-white/5 border border-slate-200 dark:border-white/8 rounded-2xl truncate">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          <Mail size={11} /> Email Address
                        </div>
                        <div className="text-sm font-semibold text-[var(--text-main)] truncate">
                          {result.email || 'Not registered yet'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-4 hover:bg-black/5 dark:hover:bg-white/5 border border-slate-200 dark:border-white/8 rounded-2xl truncate">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          <BookOpen size={11} /> Section & Semester
                        </div>
                        <div className="text-sm font-semibold text-[var(--text-main)] truncate">
                          {result.section_name || 'N/A'} {result.semester ? `· Sem ${result.semester}` : ''}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-4 hover:bg-black/5 dark:hover:bg-white/5 border border-slate-200 dark:border-white/8 rounded-2xl truncate">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          <User size={11} /> Account Status
                        </div>
                        <div className={`text-sm font-bold truncate ${result.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {result.status?.toUpperCase() || '—'}
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5 p-4 hover:bg-black/5 dark:hover:bg-white/5 border border-slate-200 dark:border-white/8 rounded-2xl truncate">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          <GraduationCap size={11} /> Batch / Points
                        </div>
                        <div className="text-sm font-semibold text-[var(--text-main)] truncate">
                          Batch {result.batch || '—'} · <span className="text-amber-600 dark:text-amber-400">{result.points ?? 0} pts</span>
                        </div>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-5">
                      <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm
                          hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-white/10
                          transition-all cursor-pointer"
                      >
                        <Search size={15} /> Search Another
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        </main>
      </div>
    </div>
  );
}
