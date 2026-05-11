import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Eye, Search, ClipboardList } from 'lucide-react'

export default function SubmissionHistory() {
  const { profile } = useAuth()
  const [search, setSearch] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadHistory() }, [profile])

  async function loadHistory() {
    try {
      const { data } = await supabase
        .from('reviews')
        .select('id, created_at, written_feedback, feedback_forms(subject_name, subject_code, trainers(trainer_name))')
        .eq('student_id', profile?.id)
        .order('created_at', { ascending: false })

      setHistory((data || []).map(r => ({
        id: r.id,
        subject: r.feedback_forms?.subject_name || 'Unknown',
        trainer: r.feedback_forms?.trainers?.trainer_name || 'Unknown',
        date: new Date(r.created_at).toLocaleDateString('en-IN'),
        time: new Date(r.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        status: 'Completed',
      })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = history.filter(h =>
    h.subject.toLowerCase().includes(search.toLowerCase()) || h.trainer.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Submission History</h1>
          <p className="text-sm text-gray-500 mt-1">Track all your past feedback submissions</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by subject or trainer..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 w-72" />
        </div>
      </div>
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No submissions found" message="Your feedback submissions will appear here" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Trainer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.subject}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.trainer}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.time}</td>
                  <td className="px-6 py-4"><Badge status="completed">{item.status}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
