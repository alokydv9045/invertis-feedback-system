import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BarChart2, Trophy, Shield, Users, Layers, Building2, Crown, Fingerprint } from 'lucide-react';

const NAV_ITEM = ({ to, icon: Icon, label, end = false }) => (
  <NavLink to={to} end={end}>
    {({ isActive }) => (
      <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all duration-200 cursor-pointer ${
        isActive
          ? 'text-indigo-200 bg-indigo-500/12 border border-indigo-500/20 shadow-sm'
          : 'text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent'
      }`}>
        <Icon size={15} className={isActive ? 'text-indigo-400' : ''} />
        <span>{label}</span>
        {isActive && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400" />}
      </div>
    )}
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const sections = {
    student: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'My Courses', end: true },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    hod: [
      { to: '/hod', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/analytics', icon: BarChart2, label: 'Analytics' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    coordinator: [
      { to: '/coordinator', icon: Layers, label: 'Coordinator Panel', end: true },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    super_admin: [
      { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',         end: true },
      { to: '/superadmin', icon: Shield,          label: 'User Management' },
      { to: '/reveal',     icon: Fingerprint,     label: 'Identity Reveal' },
      { to: '/coordinator',icon: Users,           label: 'Coordinator Panel' },
      { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
      { to: '/leaderboard',icon: Trophy,          label: 'Leaderboard' },
    ],
    supreme: [
      { to: '/supreme',    icon: Crown,           label: 'Supreme Panel',     end: true },
      { to: '/superadmin', icon: Shield,          label: 'User Management' },
      { to: '/reveal',     icon: Fingerprint,     label: 'Identity Reveal' },
      { to: '/coordinator',icon: Users,           label: 'Coordinator Panel' },
      { to: '/analytics',  icon: BarChart2,       label: 'Analytics' },
      { to: '/leaderboard',icon: Trophy,          label: 'Leaderboard' },
    ],
  };

  const links = sections[role] || sections.student;

  return (
    <aside
      className="w-full md:w-52 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.06] p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible"
      style={{ background: 'rgba(8,12,20,0.5)' }}
    >
      {/* Role indicator */}
      <div className="hidden md:flex items-center gap-2 px-3 py-2 mb-2">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50 animate-pulse" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          {role?.replace('_', ' ')}
        </span>
      </div>

      {links.map(item => (
        <NAV_ITEM key={item.to} {...item} />
      ))}
    </aside>
  );
}
