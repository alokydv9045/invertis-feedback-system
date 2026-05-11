import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function CourseManagement() {
  const [courses, setCourses] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ course_name: '', department: '' })

  useEffect(() => { loadCourses() }, [])

  async function loadCourses() {
    const { data } = await supabase.from('courses').select('*').order('course_name')
    setCourses(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.course_name || !form.department) return
    const { error } = await supabase.from('courses').insert(form)
    if (error) { alert(error.message); return }
    setShowModal(false)
    setForm({ course_name: '', department: '' })
    loadCourses()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this course?')) return
    await supabase.from('courses').delete().eq('id', id)
    loadCourses()
  }

  const filtered = courses.filter(c =>
    c.course_name.toLowerCase().includes(search.toLowerCase()) || c.department.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-sm text-gray-500 mt-1">{courses.length} courses registered</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Course</Button>
      </div>
      <div className="mb-4">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search courses..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
        </div>
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Course Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Department</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c, i) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{c.course_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.department}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Course">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course Name</label>
            <input type="text" value={form.course_name} onChange={e => setForm({ ...form, course_name: e.target.value })}
              placeholder="e.g. B.Tech CSE" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Computer Science" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Course</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
