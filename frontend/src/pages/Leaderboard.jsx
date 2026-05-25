import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Trophy, Star, Users } from 'lucide-react';

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard')
      .then(res => setStudents(res.data))
      .catch(() => toast.error('Failed to load leaderboard.'))
      .finally(() => setLoading(false));
  }, []);

  // Stable anonymous ID generation based on unique feedback ID hash
  const getAnonymousId = (uniqueFeedbackId) => {
    if (!uniqueFeedbackId) return 'INV-1048';
    let hash = 0;
    for (let i = 0; i < uniqueFeedbackId.length; i++) {
      hash = uniqueFeedbackId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idNum = Math.abs(hash % 9000) + 1000; // Generate stable number between 1000 and 9999
    return `INV-${idNum}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col gap-6 max-w-3xl mx-auto"
          >
            {/* Professional ERP Header */}
            <div className="text-center mt-2 mb-4">
              <div className="inline-flex h-12 w-12 bg-orange-50 border border-orange-100 rounded-xl items-center justify-center shadow-sm mb-3">
                <Trophy size={20} className="text-[#FF5A36]" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                Top Contributors
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto font-normal">
                Earn points by submitting feedback and improving teaching-learning quality across the university.
              </p>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 flex justify-center shadow-sm">
                <div className="h-8 w-8 border-3 border-[#FF5A36] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : students.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center shadow-sm">
                <Users size={32} className="text-slate-400 mb-3" />
                <h3 className="text-base font-semibold text-slate-800">No records available yet</h3>
                <p className="text-slate-500 text-xs mt-1">Submit feedback to appear on the contributors board.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Table Header Row */}
                <div className="flex items-center px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200/60 rounded-xl mb-1">
                  <div className="w-12 text-center">Rank</div>
                  <div className="flex-1 pl-4">Contributor ID</div>
                  <div className="w-24 text-right">Score</div>
                </div>

                {/* Leaderboard Cards */}
                {students.map((s, idx) => (
                  <motion.div
                    key={s.unique_feedback_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`flex items-center p-3.5 rounded-xl border bg-white shadow-sm hover:shadow transition-all duration-200 ${
                      idx === 0 ? 'border-orange-200 bg-gradient-to-r from-orange-50/10 to-transparent' : 'border-slate-200/80'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div className="w-12 flex-shrink-0 flex items-center justify-center">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-lg font-semibold text-xs border ${
                        idx === 0 ? 'bg-orange-50 text-orange-600 border-orange-100 shadow-sm' :
                        idx === 1 ? 'bg-slate-100 text-slate-700 border-slate-200' :
                        idx === 2 ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-500 border-slate-100'
                      }`}>
                        #{s.rank}
                      </div>
                    </div>

                    {/* Anonymous Student ID */}
                    <div className="flex-1 min-w-0 pl-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm tracking-wide">
                          {getAnonymousId(s.unique_feedback_id)}
                        </span>
                        {idx === 0 && (
                          <span className="text-[9px] font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 uppercase tracking-wider">
                            1st Place
                          </span>
                        )}
                        {idx === 1 && (
                          <span className="text-[9px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 uppercase tracking-wider">
                            2nd Place
                          </span>
                        )}
                        {idx === 2 && (
                          <span className="text-[9px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 uppercase tracking-wider">
                            3rd Place
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-normal">
                        Verified Participant · Batch: {s.batch || '2022-26'}
                      </div>
                    </div>

                    {/* Score PTS */}
                    <div className="w-24 flex-shrink-0 flex items-center justify-end">
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                        <Star size={12} className="text-slate-400" />
                        <span className="font-bold text-slate-700 text-xs">{s.points}</span>
                        <span className="text-[9px] text-slate-400 font-semibold tracking-wider">PTS</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
          <footer className="mt-12 pt-4 border-t border-slate-200 text-center text-slate-400 w-full max-w-3xl mx-auto">
            <p className="text-[10px] leading-relaxed font-normal">
              © 2026 Invertis University, Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
