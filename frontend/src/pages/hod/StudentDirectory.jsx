import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Search, Users } from 'lucide-react'

export default function StudentDirectory() {
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadStudents() }, [])

  async function loadStudents() {
    const { data } = await supabase
      .from('profiles')
      .select('*, courses(course_name)')
      .eq('role', 'student')
      .order('full_name')
    setStudents(data || [])
    setLoading(false)
  }

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} students enrolled</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm w-72 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card><EmptyState icon={Users} title="No students found" message="No students match your search criteria" /></Card>
      ) : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-invertis-blue/10 text-invertis-blue text-xs font-bold flex items-center justify-center">
                        {s.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{s.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.courses?.course_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.batch_year || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing {filtered.length} of {students.length} students</span>
          </div>
        </Card>
      )}
    </div>
  )
}
