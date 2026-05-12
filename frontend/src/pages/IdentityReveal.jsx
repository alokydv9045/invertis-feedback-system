import { useState } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, Search, Eye, User, Mail, Hash, GraduationCap, BookOpen, AlertTriangle, CheckCircle2, Fingerprint, Lock, Unlock, RefreshCw, X } from 'lucide-react';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

export default function IdentityRevealPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [searchCount, setSearchCount] = useState(0);

  const handleSearch = async () => {
    const anon_id = query.trim().toUpperCase();
    if (!anon_id) { setError('Please enter an Anonymous ID.'); return; }
    if (!anon_id.startsWith('ANO-')) { setError('Invalid format. IDs start with "ANO-".'); return; }
    setError(''); setResult(null); setRevealed(false); setConfirmed(false); setLoading(true);
    try { const { data } = await api.get(`/superadmin/reveal?anon_id=${encodeURIComponent(anon_id)}`); setResult(data); }
    catch (e) { setError(e.response?.data?.message || 'No student found.'); }
    finally { setLoading(false); }
  };

  const handleConfirmReveal = () => { setConfirmed(true); setRevealed(true); setSearchCount(c => c + 1); };
  const handleReset = () => { setQuery(''); setResult(null); setError(''); setConfirmed(false); setRevealed(false); };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><Fingerprint size={20} className="text-red-500" /></div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Student Identity Reveal</h1>
          <p className="text-sm text-gray-500">Reveal the real identity behind an anonymous student ID</p>
        </div>
        {searchCount > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
            <Eye size={12} /> {searchCount} reveal{searchCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <Card className="border-red-200 bg-red-50/30 mb-6"><CardBody className="py-3">
        <div className="flex items-start gap-3"><ShieldAlert size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div><p className="text-xs font-semibold text-red-700 mb-0.5">Restricted — Authorized Personnel Only</p>
            <p className="text-xs text-red-600/80">Only use for disciplinary investigation. All reveals are logged.</p>
          </div>
        </div>
      </CardBody></Card>

      <Card className="mb-6"><CardBody>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Anonymous Student ID</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={query} onChange={e => { setQuery(e.target.value.toUpperCase()); setError(''); setResult(null); setRevealed(false); setConfirmed(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="ANO-XXXXXX" spellCheck={false}
              className={`${inputClass} pl-11 font-mono font-bold text-emerald-600 tracking-wider`} />
            {query && <button onClick={handleReset} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"><X size={14} /></button>}
          </div>
          <Button onClick={handleSearch} disabled={loading || !query.trim()} icon={loading ? RefreshCw : Search}>
            {loading ? 'Searching…' : 'Search'}
          </Button>
        </div>
        <AnimatePresence>{error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertTriangle size={13} />{error}
          </motion.div>
        )}</AnimatePresence>
        <p className="text-xs text-gray-400 mt-3">Format: <span className="font-mono text-gray-500">ANO-XXXXXX</span> (e.g. <span className="font-mono text-emerald-500">ANO-A3F2B1</span>)</p>
      </CardBody></Card>

      <AnimatePresence mode="wait">
        {result && !confirmed && (
          <motion.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-amber-200"><CardBody>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0"><Lock size={18} className="text-amber-500" /></div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">Student Record Found</h3>
                  <p className="text-xs text-gray-500 mt-1">A record matching <span className="font-mono font-bold text-emerald-600">{query}</span> was located. Confirm to reveal identity.</p>
                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleConfirmReveal} icon={Unlock} className="bg-amber-500 hover:bg-amber-600">Yes, Reveal Identity</Button>
                    <Button variant="secondary" onClick={handleReset} icon={X}>Cancel</Button>
                  </div>
                </div>
              </div>
            </CardBody></Card>
          </motion.div>
        )}

        {result && revealed && (
          <motion.div key="reveal" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-emerald-200 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-invertis-blue via-invertis-orange to-invertis-blue" />
              <CardBody>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /><span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Identity Revealed</span></div>
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Session #{searchCount}</span>
                </div>

                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 rounded-xl bg-invertis-blue text-white flex items-center justify-center text-xl font-bold">{result.name?.charAt(0).toUpperCase()}</div>
                  <div><p className="text-lg font-bold text-gray-900">{result.name}</p><p className="text-xs text-gray-500">{result.email || 'No email registered'}</p></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1"><Hash size={11} /> Anonymous ID</div>
                    <div className="font-mono font-bold text-emerald-600 text-lg">{result.unique_feedback_id || query}</div>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1"><GraduationCap size={11} /> Roll Number</div>
                    <div className="font-mono font-bold text-red-600 text-lg">{result.student_id || '—'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><Mail size={11} /> Email</div>
                    <div className="text-sm font-semibold text-gray-700">{result.email || 'Not registered'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><BookOpen size={11} /> Section</div>
                    <div className="text-sm font-semibold text-gray-700">{result.section_name || 'N/A'} {result.semester ? `· Sem ${result.semester}` : ''}</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><User size={11} /> Status</div>
                    <div className={`text-sm font-bold ${result.status === 'active' ? 'text-emerald-500' : 'text-amber-500'}`}>{result.status?.toUpperCase() || '—'}</div>
                  </div>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1"><GraduationCap size={11} /> Batch / Points</div>
                    <div className="text-sm font-semibold text-gray-700">Batch {result.batch || '—'} · <span className="text-amber-500">{result.points ?? 0} pts</span></div>
                  </div>
                </div>

                <div className="mt-5"><Button variant="secondary" onClick={handleReset} icon={Search}>Search Another</Button></div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
