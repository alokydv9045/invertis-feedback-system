import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart2, PlusCircle, LayoutDashboard, Settings, Building2, GraduationCap, Shield, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_LINKS = {
  admin: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Faculty Feedback', icon: PlusCircle },
    { to: '/admin/analytics', label: 'Report/Analytics', icon: BarChart2 },
    { to: '/admin/directory', label: 'Infrastructure', icon: Building2 },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ],
  hod: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hod/analytics', label: 'Dept. Analytics', icon: BarChart2 },
  ],
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/evaluations', label: 'My Feedback', icon: GraduationCap },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = ROLE_LINKS[user?.role] || ROLE_LINKS.student;

  return (
    <div className="w-full md:w-64 bg-[#1a2233] text-gray-400 flex flex-col min-h-screen select-none overflow-y-auto">
      {/* Brand area */}
      <div className="p-8 flex flex-col gap-1 border-b border-white/5 bg-gradient-to-br from-[#1a2233] to-[#242f45] relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#f15a24]/10 rounded-full blur-2xl"></div>
        <h1 className="text-white font-black text-xl tracking-tight leading-none">
          <span className="text-[#f15a24]">Invertis</span> Feedback
        </h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mt-2">University Portal</p>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link to={link.to} key={link.to}>
              <div className={`relative flex items-center gap-3 px-6 py-3.5 text-[13px] font-medium transition-all hover:bg-white/5 hover:text-white group ${isActive ? 'bg-white/5 text-white' : ''
                }`}>
                {/* Active indicator (Orange) */}
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#f15a24]"
                  />
                )}
                <Icon size={18} className={`${isActive ? 'text-[#f15a24]' : 'text-gray-500 group-hover:text-[#f15a24]'} transition-colors`} />
                <span>{link.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer area */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-4">
        <div className="flex items-center gap-3 px-2">
          <div className="h-8 w-8 rounded bg-[#242f45] flex items-center justify-center text-white border border-white/10">
            <User size={16} />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 truncate">{user?.role}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-2 text-[12px] font-bold text-gray-500 hover:text-white hover:bg-white/5 rounded transition-all w-full text-left"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
