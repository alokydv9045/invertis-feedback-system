import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart2, PlusCircle, LayoutDashboard, 
  Settings, Building2, GraduationCap, Shield, Users 
} from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_LINKS = {
  admin: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Manage Students', icon: Users },
    { to: '/admin/courses', label: 'Create Evaluation', icon: PlusCircle },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/directory', label: 'Directory', icon: Settings },
  ],
  hod: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/hod/students', label: 'My Students', icon: Users },
    { to: '/hod/analytics', label: 'Dept. Analytics', icon: BarChart2 },
  ],
  student: [
    { to: '/dashboard', label: 'My Courses', icon: GraduationCap },
  ],
};

const ROLE_BADGES = {
  admin: { label: 'System Admin', icon: Shield, colors: 'bg-violet-50 text-violet-600 border-violet-100' },
  hod: { label: 'Head of Dept.', icon: Building2, colors: 'bg-blue-50 text-blue-600 border-blue-100' },
  student: { label: 'Student', icon: GraduationCap, colors: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/admin/students', label: 'Feedback', icon: 'forum' },
    { to: '/admin/analytics', label: 'NPS Analytics', icon: 'leaderboard' },
    { to: '/admin/directory', label: 'Control Tower', icon: 'terminal' },
    { to: '/admin/settings', label: 'Settings', icon: 'settings' },
  ];

  if (user?.role !== 'admin') {
    return null; 
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#e0e0e0] shadow-sm p-4 gap-2 z-[70] transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="mb-8 px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#ff6b00]">Feedback Admin</h1>
            <p className="text-[12px] font-medium text-[#474747]/70 uppercase tracking-widest">System Control v2.4</p>
          </div>
          <button onClick={onClose} className="md:hidden p-2 text-[#474747]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-2">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link to={link.to} key={link.to} onClick={onClose}>
                <div
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#ff6b00] text-white shadow-md scale-[0.98]'
                      : 'text-[#474747] hover:text-[#ff6b00] hover:bg-[#f5f5f5]'
                  }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{link.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 pt-8 border-t border-[#e0e0e0]">
          <button className="bg-[#ff6b00] text-white py-3 rounded-xl font-bold text-sm mb-4 hover:opacity-90 transition-opacity cursor-pointer shadow-lg shadow-[#ff6b00]/10 active:scale-95">
            Export Report
          </button>
          <button className="flex items-center gap-4 text-[#474747] hover:text-[#ff6b00] px-4 py-3 transition-all cursor-pointer">
            <span className="material-symbols-outlined">help</span>
            <span className="text-xs font-bold uppercase tracking-wider">Help Center</span>
          </button>
          <button 
            onClick={() => { logout(); onClose(); }}
            className="flex items-center gap-4 text-[#474747] hover:text-[#ff6b00] px-4 py-3 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
