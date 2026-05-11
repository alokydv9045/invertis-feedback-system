import { useAuth } from '@/context/AuthContext'
import { Card, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { User, Mail, BookOpen, Calendar, Shield } from 'lucide-react'

export default function StudentProfile() {
  const { profile } = useAuth()

  const fields = [
    { icon: User, label: 'Full Name', value: profile?.full_name },
    { icon: Mail, label: 'Email', value: profile?.email },
    { icon: Shield, label: 'Role', value: profile?.role?.charAt(0).toUpperCase() + profile?.role?.slice(1) },
    { icon: BookOpen, label: 'Department', value: profile?.department || 'Not assigned' },
    { icon: Calendar, label: 'Batch Year', value: profile?.batch_year || 'N/A' },
  ]

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

      <Card>
        <CardBody>
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-invertis-navy text-white flex items-center justify-center text-2xl font-bold">
              {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{profile?.full_name}</h2>
              <p className="text-sm text-gray-500 capitalize">{profile?.role} • Invertis University</p>
            </div>
          </div>

          {/* Fields */}
          <div className="space-y-5">
            {fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-900">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Change Password */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <Button variant="secondary" size="sm">Change Password</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
