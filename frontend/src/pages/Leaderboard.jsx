import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trophy, Star, Medal, Users, ShieldAlert } from 'lucide-react';

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard')
      .then(res => setStudents(res.data))
      .catch(() => toast.error('Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6 max-w-4xl mx-auto">

            {/* Header */}
            <div className="text-center mb-2">
              <div className="inline-flex h-16 w-16 bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl items-center justify-center shadow-xl shadow-accent-600/30 mb-4">
                <Trophy size={32} className="text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">Top Contributors</h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
                Earn points by submitting feedback and improving teaching quality.
              </p>
            </div>

            {/* Anonymity notice */}
            <div className="flex items-start gap-3 p-3.5 bg-primary-500/10 border border-primary-500/25 rounded-2xl">
              <ShieldAlert size={16} className="text-primary-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-primary-300 leading-relaxed">
                <span className="font-bold">Anonymous Leaderboard</span> — Student identities are protected.
                Only their system-generated anonymous ID is displayed here.
                Real identities can only be viewed by Super Admin or Supreme Authority.
              </p>
            </div>

            {loading ? (
              <div className="card-main rounded-3xl p-12 flex justify-center">
                <div className="h-10 w-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="card-main rounded-3xl p-12 text-center flex flex-col items-center">
                <Users size={40} className="text-slate-600 mb-4" />
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No data available yet</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Submit feedback to appear on the leaderboard!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {students.map((s, idx) => (
                  <motion.div
                    key={s.unique_feedback_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all ${
                      idx === 0 ? 'bg-gradient-to-r from-accent-900/40 to-slate-900/80 border-accent-500/50 shadow-lg shadow-accent-900/30 scale-[1.02]' :
                      idx === 1 ? 'card-main border-primary-500/30' :
                      idx === 2 ? 'card-main border-accent-700/30' :
                      'card-main hover:border-white/15'
                    }`}
                  >
                    {/* Rank badge */}
                    <div className={`h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl font-black text-lg shadow-inner ${
                      idx === 0 ? 'bg-gradient-to-br from-accent-300 to-accent-600 text-white' :
                      idx === 1 ? 'bg-gradient-to-br from-primary-300 to-primary-600 text-white' :
                      idx === 2 ? 'bg-gradient-to-br from-accent-600 to-accent-800 text-white' :
                      'bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      #{s.rank}
                    </div>

                    {/* Anonymous ID */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-[var(--text-main)] text-lg tracking-wider">
                          {s.unique_feedback_id}
                        </span>
                        {idx === 0 && <Medal size={16} className="text-accent-400 flex-shrink-0" />}
                        {idx === 1 && <Medal size={16} className="text-primary-300 flex-shrink-0" />}
                        {idx === 2 && <Medal size={16} className="text-accent-600 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        Anonymous Participant · Batch: {s.batch || '2025'}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800">
                        <Star size={14} className="text-accent-400 fill-accent-400" />
                        <span className="font-black text-accent-400 text-sm">{s.points}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">PTS</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
