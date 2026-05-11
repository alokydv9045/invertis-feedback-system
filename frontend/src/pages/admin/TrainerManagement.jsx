import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

export default function TrainerManagement() {
  const [trainers, setTrainers] = useState([])
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ trainer_name: '', department: '' })

  useEffect(() => { loadTrainers() }, [])

  async function loadTrainers() {
    const { data } = await supabase.from('trainers').select('*').order('trainer_name')
    setTrainers(data || [])
    setLoading(false)
  }

  async function handleSave() {
    if (!form.trainer_name || !form.department) return
    const { error } = await supabase.from('trainers').insert(form)
    if (error) { alert(error.message); return }
    setShowModal(false)
    setForm({ trainer_name: '', department: '' })
    loadTrainers()
  }

  async function handleDelete(id) {
    if (!confirm('Delete this trainer?')) return
    await supabase.from('trainers').delete().eq('id', id)
    loadTrainers()
  }

  const filtered = trainers.filter(t =>
    t.trainer_name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Management</h1>
          <p className="text-sm text-gray-500 mt-1">{trainers.length} trainers registered</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Trainer</Button>
      </div>
      <div className="mb-4">
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search trainers..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
        </div>
      </div>
      <Card>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">#</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Trainer Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Department</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((t, i) => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-400">{i + 1}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold flex items-center justify-center">
                      {t.trainer_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{t.trainer_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{t.department}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400"><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Trainer">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trainer Name</label>
            <input type="text" value={form.trainer_name} onChange={e => setForm({ ...form, trainer_name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Kumar" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department</label>
            <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
              placeholder="e.g. Computer Science & Engineering" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Trainer</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
