import { useAuth } from '../context/AuthContext';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, BarChart2, Trophy, Shield, Users, Layers, Building2, Crown, Fingerprint } from 'lucide-react';

const NAV_ITEM = ({ to, icon: Icon, label, end = false }) => (
  <NavLink to={to} end={end} className="flex-shrink-0">
    {({ isActive }) => (
      <div className={`flex items-center gap-3 px-4 py-3 rounded text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap ${
        isActive
          ? 'bg-[#E63946] text-white shadow-md'
          : 'text-white/70 hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
      }`}>
        <Icon size={18} className={isActive ? 'text-white' : ''} />
        <span>{label}</span>
      </div>
    )}
  </NavLink>
);

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const sections = {
    student: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    hod: [
      { to: '/hod', icon: LayoutDashboard, label: 'Dashboard', end: true },
      { to: '/analytics', icon: BarChart2, label: 'Analytics' },
      { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
    ],
    coordinator: [
      { to: '/coordinator', icon: Layers, label: 'Dashboard', end: true },
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
    <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#152740] p-4 flex flex-row md:flex-col gap-2 overflow-x-auto no-scrollbar md:overflow-visible bg-[#1D3557] md:min-h-[calc(100vh-64px)]">
      {/* Role indicator */}
      <div className="hidden md:flex items-center gap-3 px-2 py-3 mb-2 border-b border-white/10">
        <div className="h-10 w-10 rounded-full bg-[#E63946] flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white">{user?.name}</span>
          <span className="text-[10px] text-white/50 uppercase tracking-widest">{role?.replace('_', ' ')}</span>
        </div>
      </div>

      {links.map(item => (
        <NAV_ITEM key={item.to} {...item} />
      ))}
    </aside>
  );
}
