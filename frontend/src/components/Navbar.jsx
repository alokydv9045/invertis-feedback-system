import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Shield, Building2, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const ROLE_COLORS = {
  admin: 'bg-primary/5 dark:bg-violet-900/50 text-primary dark:text-violet-300 border-primary/10 dark:border-violet-800',
  hod:   'bg-secondary/10 dark:bg-blue-900/50 text-secondary dark:text-blue-300 border-secondary/10 dark:border-blue-800',
  student: 'bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800',
};
const ROLE_ICONS = { admin: Shield, hod: Building2, student: GraduationCap };

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const RoleIcon = ROLE_ICONS[user?.role] || GraduationCap;

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800 select-none backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-white font-black text-sm shadow-xl shadow-primary/20 dark:shadow-indigo-950">
          TL
        </div>
        <div>
          <h1 className="text-base font-black text-slate-900 dark:text-slate-100 leading-none tracking-tight">TLFQ Platform</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mt-1.5">Invertis University</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <div className="hidden md:flex items-center gap-2.5">
            <div className="text-right">
              <div className="text-xs font-black text-slate-900 dark:text-slate-200 tracking-tight">{user.name}</div>
              <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border mt-1 ${ROLE_COLORS[user.role]}`}>
                <RoleIcon size={10} />
                {user.role === 'hod' ? 'HOD' : user.role}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 hover:text-primary dark:hover:text-slate-200 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-2 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-900/40 border border-slate-100 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 px-4 py-2.5 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer shadow-sm"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </motion.nav>
  );
}
