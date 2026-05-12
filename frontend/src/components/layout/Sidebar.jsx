import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Trophy, ClipboardList, BarChart3,
  Users, Shield, Crown, UserCog, Search as SearchIcon, LogOut
} from 'lucide-react'

const studentNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'My Courses', icon: BookOpen, path: '/courses' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
]

const hodNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'HOD Panel', icon: ClipboardList, path: '/hod' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
]

const coordinatorNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Coordinator Panel', icon: UserCog, path: '/coordinator' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
]

const superAdminNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Admin Panel', icon: Shield, path: '/superadmin' },
  { label: 'Coordinator', icon: UserCog, path: '/coordinator' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Identity Reveal', icon: SearchIcon, path: '/reveal' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
]

const supremeNav = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Supreme Panel', icon: Crown, path: '/supreme' },
  { label: 'Admin Panel', icon: Shield, path: '/superadmin' },
  { label: 'Coordinator', icon: UserCog, path: '/coordinator' },
  { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { label: 'Identity Reveal', icon: SearchIcon, path: '/reveal' },
  { label: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
]

const roleNavMap = {
  student: studentNav,
  hod: hodNav,
  coordinator: coordinatorNav,
  super_admin: superAdminNav,
  supreme: supremeNav,
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = roleNavMap[user?.role] || studentNav

  const handleLogout = () => {
    logout()
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
            end={item.path === '/dashboard'}
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
