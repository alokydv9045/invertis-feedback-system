import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Trophy, Star, Medal, Users, ShieldAlert } from 'lucide-react';

const medals = ['🥇', '🥈', '🥉'];
const podiumColors = ['bg-yellow-100 border-yellow-300', 'bg-gray-100 border-gray-300', 'bg-orange-100 border-orange-300'];
const podiumHeights = ['h-36', 'h-28', 'h-24'];
const rankBg = ['bg-amber-400', 'bg-gray-400', 'bg-orange-600'];

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard').then(r => setStudents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Reorder top 3 for podium: [2nd, 1st, 3rd]
  const podiumOrder = [1, 0, 2];

  return (
    <div className="animate-fade-in max-w-4xl mx-auto relative">
      <div className="absolute -inset-6 overflow-hidden pointer-events-none select-none">
        <img src="/campus/academic-block-2.jpg" alt="" className="w-full h-full object-cover opacity-15" />
      </div>
      <div className="relative z-10">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="inline-flex w-14 h-14 bg-amber-50 rounded-2xl items-center justify-center mb-3"
        >
          <Trophy size={28} className="text-amber-500" />
        </motion.div>
        <h1 className="text-2xl font-bold text-gray-900">Top Contributors</h1>
        <p className="text-sm text-gray-500 mt-1">Earn points by submitting feedback.</p>
      </div>

      <Card className="mb-6">
        <CardBody className="py-3">
          <div className="flex items-start gap-3">
            <ShieldAlert size={16} className="text-invertis-blue mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500"><span className="font-semibold text-gray-700">Anonymous Leaderboard</span> — Only system-generated anonymous IDs are displayed. Real identities are visible only to Super Admin or Supreme Authority.</p>
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {/* Podium skeleton */}
          <div className="flex items-end justify-center gap-4 mb-6">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className={`w-20 ${['h-28', 'h-36', 'h-24'][i]} mb-2`} rounded="rounded-t-2xl" />
              </div>
            ))}
          </div>
          {/* List skeleton */}
          {[1, 2, 3, 4, 5].map(n => (
            <Card key={n}>
              <CardBody className="py-3">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10" rounded="rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" rounded="rounded-lg" />
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card><EmptyState icon={Users} title="No data yet" message="Submit feedback to appear on the leaderboard!" /></Card>
      ) : (
        <div className="space-y-3">
          {/* Enhanced Podium: 2nd - 1st - 3rd */}
          {students.length >= 3 && (
            <div className="flex items-end justify-center gap-4 mb-8">
              {podiumOrder.map((actualIdx, displayIdx) => {
                const student = students[actualIdx];
                if (!student) return null;

                return (
                  <motion.div
                    key={student.unique_feedback_id}
                    initial={{ scale: 0, y: 30 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: displayIdx * 0.15, type: 'spring', stiffness: 150, damping: 12 }}
                    className="flex flex-col items-center"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: displayIdx * 0.15 + 0.3 }}
                      className="text-2xl mb-2"
                    >
                      {medals[actualIdx]}
                    </motion.div>
                    <div className={`w-24 ${podiumHeights[actualIdx]} ${podiumColors[actualIdx]} rounded-t-2xl border-2 border-b-0 flex flex-col items-center justify-end pb-3 shadow-lg`}>
                      <span className="font-mono text-[10px] font-bold text-gray-700 truncate max-w-[85%]">{student.unique_feedback_id}</span>
                      <div className="flex items-center gap-0.5 mt-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold text-gray-900">{student.points}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          {students.map((s, idx) => (
            <motion.div key={s.unique_feedback_id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card className={idx < 3 ? 'border-amber-200' : ''}>
                <CardBody className="py-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-sm ${
                      idx < 3 ? `${rankBg[idx]} text-white` : 'bg-gray-100 text-gray-500'
                    }`}>#{s.rank}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-gray-900">{s.unique_feedback_id}</span>
                        {idx < 3 && <Medal size={14} className={idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-gray-400' : 'text-orange-600'} />}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">Anonymous · Batch: {s.batch || '2025'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      <Star size={14} className="text-amber-400 fill-amber-400" />
                      <span className="font-bold text-amber-500 text-sm">{s.points}</span>
                      <span className="text-xs text-gray-400">PTS</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      </div>{/* close z-10 */}
    </div>
  );
}
