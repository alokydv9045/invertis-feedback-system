import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { Plus, FileText, XCircle } from 'lucide-react'

export default function FormManagement() {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [trainers, setTrainers] = useState([])
  const [courses, setCourses] = useState([])
  const [newForm, setNewForm] = useState({ course_id: '', trainer_id: '', subject_name: '', subject_code: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const [formRes, trainerRes, courseRes] = await Promise.all([
      supabase.from('feedback_forms').select('*, courses(course_name), trainers(trainer_name)').order('created_at', { ascending: false }),
      supabase.from('trainers').select('*').order('trainer_name'),
      supabase.from('courses').select('*').order('course_name'),
    ])
    setForms(formRes.data || [])
    setTrainers(trainerRes.data || [])
    setCourses(courseRes.data || [])
    setLoading(false)
  }

  async function handleCloseForm(id) {
    await supabase.from('feedback_forms').update({ status: 'closed' }).eq('id', id)
    loadData()
  }

  async function handlePublish() {
    if (!newForm.course_id || !newForm.trainer_id || !newForm.subject_name) return
    // Get any user id for published_by (we'll use a simple approach)
    const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'admin').limit(1).single()
    const publisherId = admin?.id
    if (!publisherId) { alert('No admin found to publish'); return }

    const { error } = await supabase.from('feedback_forms').insert({
      ...newForm, status: 'active', published_by: publisherId,
    })
    if (error) { alert(error.message); return }
    setShowCreate(false)
    setNewForm({ course_id: '', trainer_id: '', subject_name: '', subject_code: '' })
    loadData()
  }

  if (loading) return <LoadingSpinner size="lg" />

  const activeForms = forms.filter(f => f.status === 'active')
  const closedForms = forms.filter(f => f.status === 'closed')

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Management</h1>
          <p className="text-sm text-gray-500 mt-1">{activeForms.length} active, {closedForms.length} closed</p>
        </div>
        <Button icon={Plus} onClick={() => setShowCreate(true)}>Publish New Form</Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Active Forms</h3>
          {activeForms.length === 0 ? (
            <Card><EmptyState icon={FileText} title="No active forms" message="Publish a new feedback form to get started" /></Card>
          ) : (
            <div className="space-y-4">
              {activeForms.map(form => (
                <Card key={form.id} hover>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900">{form.subject_name}</h3>
                        <p className="text-sm text-gray-500">{form.trainers?.trainer_name} • {form.courses?.course_name}</p>
                        <p className="text-xs text-gray-400 mt-1">{form.subject_code || ''} • Created {new Date(form.created_at).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge status="active">Active</Badge>
                        <button onClick={() => handleCloseForm(form.id)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <XCircle size={18} />
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recently Closed</h3>
          <div className="space-y-3">
            {closedForms.slice(0, 5).map(form => (
              <Card key={form.id}>
                <CardBody className="py-3">
                  <p className="text-sm font-semibold text-gray-700">{form.subject_name}</p>
                  <p className="text-xs text-gray-400">{form.trainers?.trainer_name}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Publish Feedback Form">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Course</label>
            <select value={newForm.course_id} onChange={e => setNewForm({ ...newForm, course_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20">
              <option value="">Select Course</option>
              {courses.map(c => <option key={c.id} value={c.id}>{c.course_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Trainer</label>
            <select value={newForm.trainer_id} onChange={e => setNewForm({ ...newForm, trainer_id: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20">
              <option value="">Select Trainer</option>
              {trainers.map(t => <option key={t.id} value={t.id}>{t.trainer_name} ({t.department})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject Name</label>
            <input type="text" value={newForm.subject_name} onChange={e => setNewForm({ ...newForm, subject_name: e.target.value })}
              placeholder="e.g. Data Structures" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject Code</label>
            <input type="text" value={newForm.subject_code} onChange={e => setNewForm({ ...newForm, subject_code: e.target.value })}
              placeholder="e.g. CS301" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handlePublish}>Publish Form</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
