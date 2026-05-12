import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Key } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import api from '../../services/api'

const roleBadgeColors = {
  student: 'bg-blue-50 text-blue-600',
  hod: 'bg-emerald-50 text-emerald-600',
  coordinator: 'bg-purple-50 text-purple-600',
  super_admin: 'bg-orange-50 text-orange-600',
  supreme: 'bg-red-50 text-red-600',
}

const roleLabels = {
  student: 'Student',
  hod: 'HOD',
  coordinator: 'Coordinator',
  super_admin: 'Super Admin',
  supreme: 'Supreme Authority',
}

export function Topbar() {
  const { user } = useAuth()
  const [showPwModal, setShowPwModal] = useState(false)
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm: '' })
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U'

  const badgeColor = roleBadgeColors[user?.role] || roleBadgeColors.student

  const handleChangePassword = async () => {
    setPwError('')
    setPwSuccess('')
    if (pwForm.new_password !== pwForm.confirm) {
      setPwError('New passwords do not match')
      return
    }
    if (pwForm.new_password.length < 8) {
      setPwError('Password must be at least 8 characters')
      return
    }
    setPwLoading(true)
    try {
      await api.put('/auth/change-password', {
        current_password: pwForm.current_password,
        new_password: pwForm.new_password,
      })
      setPwSuccess('Password changed successfully!')
      setPwForm({ current_password: '', new_password: '', confirm: '' })
      setTimeout(() => { setShowPwModal(false); setPwSuccess('') }, 1500)
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const canChangePassword = user?.role && ['supreme', 'super_admin', 'hod'].includes(user.role)

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-invertis-blue font-bold text-lg">IFS <span className="text-gray-400 font-normal text-sm">v2.0</span></span>
          </div>

          <div className="flex items-center gap-3">
            {canChangePassword && (
              <button
                onClick={() => setShowPwModal(true)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                title="Change Password"
              >
                <Key size={18} />
              </button>
            )}
            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name || 'User'}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {roleLabels[user?.role] || user?.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-full bg-invertis-navy text-white flex items-center justify-center text-sm font-bold">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <Modal isOpen={showPwModal} onClose={() => { setShowPwModal(false); setPwError(''); setPwSuccess('') }} title="Change Password">
        <div className="space-y-4">
          {pwError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{pwError}</div>}
          {pwSuccess && <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600">{pwSuccess}</div>}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
            <input
              type="password" value={pwForm.current_password}
              onChange={e => setPwForm({ ...pwForm, current_password: e.target.value })}
              placeholder="Enter current password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
            <input
              type="password" value={pwForm.new_password}
              onChange={e => setPwForm({ ...pwForm, new_password: e.target.value })}
              placeholder="Enter new password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
            <input
              type="password" value={pwForm.confirm}
              onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowPwModal(false)}>Cancel</Button>
            <Button onClick={handleChangePassword} disabled={pwLoading}>
              {pwLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
