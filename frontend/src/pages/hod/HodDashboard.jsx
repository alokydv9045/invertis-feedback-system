import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { StatsCard } from '@/components/ui/StatsCard'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Users, FileText, MessageSquare, Star, Quote } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function HodDashboard() {
  const [stats, setStats] = useState({ trainers: 0, forms: 0, responses: 0 })
  const [topPerformers, setTopPerformers] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    try {
      // Stats
      const [trainerRes, formRes, reviewRes] = await Promise.all([
        supabase.from('trainers').select('id', { count: 'exact', head: true }),
        supabase.from('feedback_forms').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('reviews').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        trainers: trainerRes.count || 0,
        forms: formRes.count || 0,
        responses: reviewRes.count || 0,
      })

      // Top performers — avg rating per trainer
      const { data: answers } = await supabase
        .from('review_answers')
        .select('rating_value, reviews(feedback_forms(trainer_id, trainers(trainer_name), subject_name))')

      if (answers) {
        const trainerScores = {}
        answers.forEach(a => {
          const tid = a.reviews?.feedback_forms?.trainer_id
          const tname = a.reviews?.feedback_forms?.trainers?.trainer_name
          const subj = a.reviews?.feedback_forms?.subject_name
          if (!tid || !tname) return
          if (!trainerScores[tid]) trainerScores[tid] = { name: tname, subject: subj, total: 0, count: 0 }
          trainerScores[tid].total += a.rating_value
          trainerScores[tid].count++
        })
        const sorted = Object.values(trainerScores)
          .map(t => ({ ...t, rating: (t.total / t.count).toFixed(1), responses: Math.floor(t.count / 10) }))
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 5)
        setTopPerformers(sorted)
      }

      // Recent reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('written_feedback, created_at, feedback_forms(subject_code)')
        .order('created_at', { ascending: false })
        .limit(3)

      setRecentReviews((reviews || []).map(r => ({
        text: r.written_feedback,
        course: r.feedback_forms?.subject_code || 'N/A',
        time: getTimeAgo(r.created_at),
      })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  function getTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) return <LoadingSpinner size="lg" />

  const chartData = topPerformers.map(t => ({ name: t.name.split(' ').pop(), completed: parseInt(t.responses) }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Department Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time feedback analytics</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Total Trainers" value={stats.trainers} color="blue" />
        <StatsCard icon={FileText} label="Active Forms" value={stats.forms} trendLabel="Live" color="purple" />
        <StatsCard icon={MessageSquare} label="Total Responses" value={stats.responses.toLocaleString()} color="orange" />
        <StatsCard icon={Star} label="Top Rating" value={topPerformers[0]?.rating || '—'} trendLabel="Best" color="green" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-7">
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-gray-900">Top Performers</h3>
              </div>
              <div className="space-y-4">
                {topPerformers.map((t, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      idx === 0 ? 'bg-blue-500' : idx === 1 ? 'bg-emerald-500' : 'bg-purple-500'
                    }`}>{t.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.subject}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-xs text-gray-400">Responses</p>
                      <p className="text-sm font-bold text-gray-700">{t.responses}</p>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-50 rounded-lg text-amber-600 font-bold text-sm flex items-center gap-1">
                      {t.rating} <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="col-span-5">
          <Card>
            <CardBody>
              <h3 className="font-bold text-gray-900 mb-4">Response Distribution</h3>
              <div className="h-48 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                    <Bar dataKey="completed" fill="#1A56DB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {recentReviews.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Quote size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-900">Recent Anonymized Reviews</h3>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {recentReviews.map((r, i) => (
              <Card key={i} hover>
                <CardBody>
                  <Quote size={24} className="text-gray-200 mb-2" />
                  <p className="text-sm text-gray-600 italic leading-relaxed mb-4">"{r.text.slice(0, 150)}{r.text.length > 150 ? '...' : ''}"</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Code: {r.course}</span>
                    <span>{r.time}</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
