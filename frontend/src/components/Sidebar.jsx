import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, BarChart2, PlusCircle, LayoutDashboard, Settings, Building2, GraduationCap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_LINKS = {
  admin: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Create Evaluation', icon: PlusCircle },
    { to: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/admin/directory', label: 'Directory', icon: Settings },
  ],
  hod: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/hod/analytics', label: 'Dept. Analytics', icon: BarChart2 },
  ],
  student: [
    { to: '/dashboard', label: 'My Courses', icon: GraduationCap },
  ],
};

const ROLE_BADGES = {
  admin: { label: 'System Admin', icon: Shield, colors: 'bg-primary/5 dark:bg-violet-900/40 text-primary dark:text-violet-300 border-primary/10 dark:border-violet-800' },
  hod: { label: 'Head of Dept.', icon: Building2, colors: 'bg-secondary/10 dark:bg-blue-900/40 text-secondary dark:text-blue-400 border-secondary/10 dark:border-blue-800' },
  student: { label: 'Student', icon: GraduationCap, colors: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800' },
};

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const links = ROLE_LINKS[user?.role] || ROLE_LINKS.student;
  const badge = ROLE_BADGES[user?.role];

  return (
    <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 p-6 flex flex-col gap-3 min-h-[calc(100vh-65px)] select-none shadow-[1px_0_10px_rgba(0,0,0,0.02)] z-10">
      {/* Role badge */}
      {badge && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest mb-4 shadow-sm ${badge.colors}`}>
          <badge.icon size={14} />
          {badge.label}
        </div>
      )}

      <div className="flex flex-col gap-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;
          return (
            <Link to={link.to} key={link.to}>
              <motion.div
                whileHover={{ x: 6 }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer text-sm font-black transition-all border ${isActive
                    ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 dark:shadow-indigo-950/40'
                    : 'text-slate-400 dark:text-slate-400 hover:text-primary dark:hover:text-slate-100 hover:bg-primary/[0.03] dark:hover:bg-slate-800 border-transparent'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-300 dark:text-slate-500'} />
                {link.label}
              </motion.div>
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-5 mt-auto">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-bold uppercase tracking-wider">
          Feedback is <span className="text-slate-900 dark:text-slate-300">ANONYMOUS</span>.
        </p>
      </div>
    </div>
  );
}
