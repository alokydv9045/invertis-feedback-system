import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Search, UserPlus, Trash2 } from 'lucide-react'

const tabs = ['Students', 'HODs', 'Admins']
const roleMap = { Students: 'student', HODs: 'hod', Admins: 'admin' }

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState('Students')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => { loadUsers() }, [activeTab])

  async function loadUsers() {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*, courses(course_name)')
        .eq('role', roleMap[activeTab])
        .order('full_name')
      setUsers(data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system access, roles, and privileges.</p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowCreate(true)}>Create New User</Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-md text-sm font-semibold transition-all ${
                activeTab === tab ? 'bg-white text-invertis-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}>{tab}</button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 w-64" />
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        <Card>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">User Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Department / Course</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Batch</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-invertis-blue/10 text-invertis-blue text-xs font-bold flex items-center justify-center">
                        {u.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.department || u.courses?.course_name || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.batch_year || '—'}</td>
                  <td className="px-6 py-4"><Badge status="active">{u.role}</Badge></td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-6 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">Showing {filtered.length} {activeTab.toLowerCase()}</span>
          </div>
        </Card>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New User">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
            <input type="text" placeholder="Enter full name" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input type="email" placeholder="Enter email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
            <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20">
              <option>HOD</option><option>Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={() => setShowCreate(false)}>Create User</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
