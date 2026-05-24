import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BarChart2, Trophy, Shield,
  Users, Layers, Building2, Crown, Fingerprint,
  Award, Activity, TrendingUp, BookOpen, MessageSquare,
  ArrowUpCircle, Search, ChevronRight
} from 'lucide-react';

// ── Primary page nav per role ─────────────────────────────
const PAGE_NAV = {
  student: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  hod: [
    { to: '/hod',         icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/analytics',   icon: BarChart2,       label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  coordinator: [
    { to: '/coordinator', icon: Layers,           label: 'Dashboard',  end: true },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  super_admin: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',        end: true },
    { to: '/superadmin',  icon: Shield,           label: 'User Management' },
    { to: '/reveal',      icon: Fingerprint,      label: 'Identity Reveal' },
    { to: '/coordinator', icon: Users,            label: 'Coordinator' },
    { to: '/analytics',   icon: BarChart2,        label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  supreme: [
    { to: '/supreme',     icon: Crown,            label: 'Supreme Panel',   end: true },
    { to: '/superadmin',  icon: Shield,           label: 'User Management' },
    { to: '/reveal',      icon: Fingerprint,      label: 'Identity Reveal' },
    { to: '/coordinator', icon: Users,            label: 'Coordinator' },
    { to: '/analytics',   icon: BarChart2,        label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
};

// ── Sub-navigation items per route ───────────────────────
const SUB_NAV = {
  '/analytics': [
    { tab: 'faculty',      icon: Award,          label: 'Faculty Rankings' },
    { tab: 'performance',  icon: Activity,       label: 'Attribute Analysis' },
    { tab: 'engagement',   icon: Users,          label: 'Department Overview' },
    { tab: 'trends',       icon: TrendingUp,     label: 'Submission Trends' },
    { tab: 'courses',      icon: BookOpen,       label: 'Course Reports' },
    { tab: 'comments',     icon: MessageSquare,  label: 'Feedback Insights' },
  ],
  '/superadmin': [
    { tab: 'departments',  icon: Building2,      label: 'Departments' },
    { tab: 'hods',         icon: Users,          label: 'HODs' },
    { tab: 'coordinators', icon: GraduationCap,  label: 'Coordinators' },
    { tab: 'promotion',    icon: ArrowUpCircle,  label: 'Acad. Promotion' },
    { tab: 'students',     icon: Search,         label: 'Student Lookup' },
  ],
  '/hod': [
    { tab: 'overview',     icon: LayoutDashboard, label: 'Overview' },
    { tab: 'faculty',      icon: Award,           label: 'Faculty Rankings' },
    { tab: 'courses',      icon: BookOpen,        label: 'Course Reports' },
    { tab: 'comments',     icon: MessageSquare,   label: 'Feedback Insights' },
  ],
  '/coordinator': [
    { tab: 'sections',     icon: Layers,          label: 'Sections' },
    { tab: 'courses',      icon: BookOpen,        label: 'Courses' },
    { tab: 'faculty',      icon: Users,           label: 'Faculty' },
    { tab: 'students',     icon: GraduationCap,   label: 'Students' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const role = user?.role;
  const links = PAGE_NAV[role] || PAGE_NAV.student;

  // Find the current route key for sub-nav
  const currentRouteKey = Object.keys(SUB_NAV).find(key =>
    location.pathname === key || location.pathname.startsWith(key + '/')
  );
  const subItems = currentRouteKey ? SUB_NAV[currentRouteKey] : [];

  // Read active tab from URL param
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || (subItems[0]?.tab ?? '');

  const goTab = (tab) => {
    navigate(currentRouteKey + '?tab=' + tab, { replace: true });
  };

  return (
    <aside className="w-full md:w-48 shrink-0 bg-white border-r border-gray-200 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto md:overflow-x-hidden no-scrollbar md:min-h-[calc(100vh-67px)]">

      {/* ── User card (desktop only) ──────────────────────── */}
      <div className="hidden md:block bg-[#1D3557] px-3 py-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-full bg-[#FF2A00] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate leading-tight">{user?.name}</p>
            <p className="text-white/50 text-[9px] uppercase tracking-widest mt-0.5 truncate">{role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* ── Primary navigation ───────────────────────────── */}
      <div className="flex flex-row md:flex-col shrink-0">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className="block shrink-0">
            {({ isActive }) => (
              <div className={`flex items-center gap-2 px-3.5 py-2.5 text-[12px] font-semibold transition-all cursor-pointer border-b border-gray-100 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1D3557] text-white'
                  : 'text-[#343A40] hover:bg-[#EEF2FF] hover:text-[#1D3557]'
              }`}>
                <Icon size={13} className="shrink-0" />
                <span>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>

      {/* ── Contextual sub-navigation ────────────────────── */}
      {subItems.length > 0 && (
        <div className="hidden md:flex flex-col shrink-0 border-t border-gray-200 mt-1">
          <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">On This Page</p>
          </div>
          {subItems.map(({ tab, icon: Icon, label }) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => goTab(tab)}
                className={`flex items-center gap-2 px-3.5 py-2 text-[11px] font-medium transition-all cursor-pointer border-b border-gray-50 text-left w-full ${
                  isActive
                    ? 'bg-[#FF2A00]/10 text-[#FF2A00] font-bold border-l-2 border-l-[#FF2A00]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#1D3557]'
                }`}
              >
                <Icon size={11} className="shrink-0" />
                <span className="truncate">{label}</span>
                {isActive && <ChevronRight size={10} className="ml-auto shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer spacer */}
      <div className="hidden md:block flex-1" />
    </aside>
  );
}
