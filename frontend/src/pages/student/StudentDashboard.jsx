import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import {
  ArrowRight, FileText, Code, CheckCircle2, Eye, Trophy,
  ClipboardList, Clock, CircleDot, Star
} from 'lucide-react'

const rankColors = ['bg-amber-400', 'bg-gray-400', 'bg-orange-600']

export default function StudentDashboard() {
  const { profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] || 'Student'

  const [assignedForms, setAssignedForms] = useState([])
  const [completedForms, setCompletedForms] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0 })

  useEffect(() => {
    loadDashboard()
  }, [profile])

  async function loadDashboard() {
    try {
      // 1. Fetch all active forms (matching student's course if available)
      let formQuery = supabase
        .from('feedback_forms')
        .select('*, courses(course_name), trainers(trainer_name)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (profile?.course_id) {
        formQuery = formQuery.eq('course_id', profile.course_id)
      }

      const { data: forms } = await formQuery

      // 2. Fetch student's completed reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('form_id, created_at, feedback_forms(subject_name, trainers(trainer_name))')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })

      const completedFormIds = new Set((reviews || []).map(r => r.form_id))
      const pending = (forms || []).filter(f => !completedFormIds.has(f.id))
      const completed = (reviews || []).map(r => ({
        id: r.form_id,
        subject_name: r.feedback_forms?.subject_name || 'Unknown',
        trainer_name: r.feedback_forms?.trainers?.trainer_name || 'Unknown',
        submitted_at: new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      }))

      setAssignedForms(pending.slice(0, 4))
      setCompletedForms(completed.slice(0, 5))
      setStats({ total: (pending.length + completed.length), completed: completed.length })

      // 3. Leaderboard — top 5 students by review count
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('student_id, profiles(full_name)')

      if (allReviews) {
        const counts = {}
        allReviews.forEach(r => {
          const sid = r.student_id
          if (!counts[sid]) counts[sid] = { name: r.profiles?.full_name || 'Unknown', points: 0 }
          counts[sid].points++
        })
        const sorted = Object.values(counts)
          .sort((a, b) => b.points - a.points)
          .slice(0, 5)
          .map((e, i) => ({ ...e, rank: i + 1 }))
        setLeaderboard(sorted)
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner size="lg" />

  const completionPct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-invertis-navy via-invertis-blue to-blue-500 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome, {firstName}!</h1>
          <p className="text-blue-100 text-sm mb-6">
            Your feedback drives academic excellence. You have <strong className="text-white">{assignedForms.length} pending form{assignedForms.length !== 1 ? 's' : ''}</strong> for this semester.
          </p>
          {assignedForms.length > 0 && (
            <Link
              to={`/student/feedback/${assignedForms[0].id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-invertis-blue rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              Start Feedback Session <ArrowRight size={16} />
            </Link>
          )}
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute right-24 -bottom-12 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Assigned Forms */}
        <div className="col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Assigned Forms</h2>
          </div>

          {assignedForms.length === 0 ? (
            <Card>
              <EmptyState icon={ClipboardList} title="All caught up!" message="You've completed all assigned feedback forms." />
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {assignedForms.map((form, idx) => (
                <Card key={form.id} hover>
                  <CardBody>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        idx % 3 === 0 ? 'bg-orange-50 text-orange-500' :
                        idx % 3 === 1 ? 'bg-blue-50 text-blue-500' :
                        'bg-purple-50 text-purple-500'
                      }`}>
                        {idx % 2 === 0 ? <Code size={18} /> : <FileText size={18} />}
                      </div>
                      {idx === 0 && <Badge status="high">PRIORITY</Badge>}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{form.subject_name}</h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5">
                      <CircleDot size={12} /> {form.trainers?.trainer_name || 'Trainer'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{form.courses?.course_name}</p>
                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
                      <span className="text-xs text-gray-400">{form.subject_code || ''}</span>
                      <Link
                        to={`/student/feedback/${form.id}`}
                        className="text-sm font-semibold text-invertis-blue flex items-center gap-1 hover:underline"
                      >
                        Submit <ArrowRight size={14} />
                      </Link>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}

          {/* Completed Forms */}
          {completedForms.length > 0 && (
            <>
              <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">Completed Forms</h2>
              <Card>
                <div className="divide-y divide-gray-50">
                  {completedForms.map((item) => (
                    <div key={item.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.subject_name}</p>
                          <p className="text-xs text-gray-400">{item.trainer_name} • Submitted {item.submitted_at}</p>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
                        <Eye size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="col-span-4 space-y-6">
          {/* Completion Status */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-6">
                <Clock size={18} className="text-invertis-blue" />
                <h3 className="font-bold text-gray-900">Completion Status</h3>
              </div>
              <div className="flex justify-center mb-6">
                <div className="relative w-36 h-36">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#1A56DB" strokeWidth="8"
                      strokeDasharray={`${completionPct * 2.64} ${100 * 2.64}`} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900">{completionPct}%</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Completed</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.completed}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-[10px] font-semibold text-invertis-orange uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{assignedForms.length}</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardBody>
              <div className="flex items-center gap-2 mb-5">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="font-bold text-gray-900">Top Contributors</h3>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No submissions yet</p>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center ${
                        rankColors[entry.rank - 1] || 'bg-gray-300'
                      }`}>{entry.rank}</span>
                      <div className="w-8 h-8 rounded-full bg-invertis-navy/10 text-invertis-navy flex items-center justify-center text-xs font-bold">
                        {entry.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="flex-1 text-sm font-medium text-gray-700 truncate">{entry.name}</span>
                      <span className="text-sm font-bold text-invertis-blue">{entry.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}
