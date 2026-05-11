import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import {
  LayoutDashboard, MessageSquareText, BarChart3, Users,
  ClipboardList, History, UserCircle, BookOpen,
  GraduationCap, Trophy, Download, HelpCircle, LogOut, Settings
} from 'lucide-react'

const studentNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/student/dashboard' },
  { label: 'Course Feedback', icon: MessageSquareText, path: '/student/feedback/new' },
  { label: 'Submission History', icon: History, path: '/student/history' },
  { label: 'My Profile', icon: UserCircle, path: '/student/profile' },
]

const hodNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/hod/dashboard' },
  { label: 'Feedback Forms', icon: ClipboardList, path: '/hod/forms' },
  { label: 'Analytics', icon: BarChart3, path: '/hod/analytics' },
  { label: 'Student Directory', icon: Users, path: '/hod/students' },
]

const adminNav = [
  { label: 'Home', icon: LayoutDashboard, path: '/admin/dashboard' },
  { label: 'Course Feedback', icon: MessageSquareText, path: '/admin/forms' },
  { label: 'Faculty Analytics', icon: BarChart3, path: '/admin/leaderboard' },
  { label: 'User Management', icon: Users, path: '/admin/users' },
  { label: 'Courses', icon: BookOpen, path: '/admin/courses' },
  { label: 'Trainers', icon: GraduationCap, path: '/admin/trainers' },
]

const roleNavMap = { student: studentNav, hod: hodNav, admin: adminNav }

export function Sidebar() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = roleNavMap[profile?.role] || studentNav

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Invertis University" className="w-10 h-10 rounded-lg object-contain" />
          <div>
            <h2 className="text-invertis-blue font-bold text-sm leading-tight">Invertis Feedback</h2>
            <p className="text-gray-400 text-xs">Centralized Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-invertis-blue text-white shadow-md shadow-invertis-blue/25'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 pt-3">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full transition-colors">
          <Download size={18} />
          <span>Export Data</span>
        </button>
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 w-full transition-colors">
          <HelpCircle size={18} />
          <span>Support</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
