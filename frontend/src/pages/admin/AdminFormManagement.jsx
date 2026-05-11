import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Search, MoreVertical } from 'lucide-react'

export default function AdminFormManagement() {
  const [forms, setForms] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadForms() }, [])

  async function loadForms() {
    const { data } = await supabase
      .from('feedback_forms')
      .select('*, courses(course_name, department), trainers(trainer_name)')
      .order('created_at', { ascending: false })
    setForms(data || [])
    setLoading(false)
  }

  const filtered = forms.filter(f =>
    f.subject_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.trainers?.trainer_name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Global Form Control</h1>
          <p className="text-sm text-gray-500 mt-1">{forms.length} feedback forms across all departments</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search forms..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
        </div>
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trainer</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Dept</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{f.subject_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{f.subject_code || '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.trainers?.trainer_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.courses?.course_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{f.courses?.department}</td>
                <td className="px-6 py-4"><Badge status={f.status}>{f.status}</Badge></td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
