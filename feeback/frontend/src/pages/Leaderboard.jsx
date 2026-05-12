import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Trophy, Star, Medal, Users, ShieldAlert } from 'lucide-react';

const rankBg = ['bg-amber-400', 'bg-gray-400', 'bg-orange-600'];

export default function Leaderboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/leaderboard').then(r => setStudents(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <div className="inline-flex w-14 h-14 bg-amber-50 rounded-2xl items-center justify-center mb-3">
          <Trophy size={28} className="text-amber-500" />
        </div>
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
        <Card><div className="py-16 flex justify-center"><div className="h-10 w-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" /></div></Card>
      ) : students.length === 0 ? (
        <Card><EmptyState icon={Users} title="No data yet" message="Submit feedback to appear on the leaderboard!" /></Card>
      ) : (
        <div className="space-y-3">
          {/* Top 3 podium */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {students.slice(0, 3).map((s, idx) => (
              <Card key={s.unique_feedback_id} hover>
                <CardBody className="text-center py-6">
                  <div className={`w-10 h-10 rounded-full ${rankBg[idx]} text-white text-sm font-bold flex items-center justify-center mx-auto mb-2`}>#{s.rank}</div>
                  <p className="font-mono font-bold text-gray-900 text-sm">{s.unique_feedback_id}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="font-bold text-amber-500 text-lg">{s.points}</span>
                    <span className="text-xs text-gray-400">PTS</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

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
    </div>
  );
}
