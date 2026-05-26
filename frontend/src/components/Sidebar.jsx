import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Trophy, BarChart3, Shield, Fingerprint,
  UsersRound, Layers, Crown, Award, Activity, TrendingUp, BookOpen,
  MessageSquare, Building2, GraduationCap, ClipboardList,
  ArrowUpCircle, Search, ChevronRight, X, Briefcase
} from 'lucide-react';
import { useSidebarItems } from '../context/SidebarContext';
import { useEffect } from 'react';

// ── Primary page nav per role ─────────────────────────────
const PAGE_NAV = {
  student: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  hod: [
    { to: '/hod',         icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/analytics',   icon: BarChart3,       label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  coordinator: [
    { to: '/coordinator', icon: LayoutDashboard,  label: 'Dashboard',  end: true },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  super_admin: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',        end: true },
    { to: '/superadmin',  icon: Shield,           label: 'User Management' },
    { to: '/reveal',      icon: Fingerprint,      label: 'Identity Reveal' },
    { to: '/coordinator', icon: ClipboardList,    label: 'Coordinator' },
    { to: '/analytics',   icon: BarChart3,        label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  supreme: [
    { to: '/supreme',     icon: Crown,            label: 'Supreme Panel',   end: true },
    { to: '/superadmin',  icon: Shield,           label: 'User Management' },
    { to: '/reveal',      icon: Fingerprint,      label: 'Identity Reveal' },
    { to: '/coordinator', icon: ClipboardList,    label: 'Coordinator' },
    { to: '/analytics',   icon: BarChart3,        label: 'Analytics' },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
};

// ── Sub-navigation items per route ───────────────────────
const SUB_NAV = {
  '/analytics': [
    { tab: 'faculty',      icon: UsersRound,     label: 'Faculty Rankings' },
    { tab: 'performance',  icon: Activity,       label: 'Attribute Analysis' },
    { tab: 'engagement',   icon: Building2,      label: 'Department Overview' },
    { tab: 'trends',       icon: TrendingUp,     label: 'Submission Trends' },
    { tab: 'courses',      icon: BookOpen,       label: 'Course Reports' },
    { tab: 'comments',     icon: MessageSquare,  label: 'Feedback Insights' },
  ],
  '/superadmin': [
    { tab: 'departments',  icon: Building2,      label: 'Departments' },
    { tab: 'hods',         icon: Briefcase,      label: 'HODs' },
    { tab: 'coordinators', icon: ClipboardList,  label: 'Coordinators' },
    { tab: 'promotion',    icon: ArrowUpCircle,  label: 'Acad. Promotion' },
    { tab: 'students',     icon: GraduationCap,  label: 'Student Lookup' },
  ],
  '/hod': [
    { tab: 'overview',     icon: LayoutDashboard, label: 'Overview' },
    { tab: 'faculty',      icon: UsersRound,      label: 'Faculty Rankings' },
    { tab: 'courses',      icon: BookOpen,        label: 'Course Reports' },
    { tab: 'comments',     icon: MessageSquare,   label: 'Feedback Insights' },
  ],
  '/coordinator': [
    { tab: 'sections',     icon: Layers,          label: 'Sections' },
    { tab: 'courses',      icon: BookOpen,        label: 'Courses' },
    { tab: 'faculty',      icon: UsersRound,      label: 'Faculty' },
    { tab: 'students',     icon: GraduationCap,   label: 'Students' },
  ],
};

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, setIsOpen } = useSidebarItems();

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
    setIsOpen(false); // Close mobile drawer
  };

  // Close sidebar on path changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname, setIsOpen]);

  const sidebarContent = (
    <div className="w-full h-full flex flex-col justify-between bg-white">
      {/* Scrollable Nav Area */}
      <div className="flex-1 flex flex-col min-h-0">
        
        {/* User Card - Refined ERP style */}
        <div className="bg-slate-50 p-4 shrink-0 border-b border-slate-200 relative">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FF5A36]/10 flex items-center justify-center text-[#FF5A36] font-semibold text-sm shrink-0 border border-[#FF5A36]/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-slate-800 text-xs font-semibold truncate leading-tight">{user?.name}</p>
              <p className="text-slate-500 text-[9px] uppercase tracking-wider font-semibold mt-1 truncate">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute right-3 top-4 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Primary Navigation */}
        <div className="flex flex-col py-2 shrink-0 bg-white">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink 
              key={to} 
              to={to} 
              end={end}
              onClick={() => setIsOpen(false)}
              className="block"
            >
              {({ isActive }) => (
                <div className={`group flex items-center gap-3 px-4 py-3 text-xs font-medium transition-all duration-200 cursor-pointer border-l-3 ${
                  isActive
                    ? 'bg-[#FF5A36]/10 text-[#FF5A36] font-semibold border-l-[#FF5A36]'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'
                }`}>
                  <Icon size={14} className={`shrink-0 ${isActive ? 'text-[#FF5A36]' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`} />
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </div>

        {/* Contextual Sub-Navigation */}
        {subItems.length > 0 && (
          <div className="flex flex-col shrink-0 border-t border-slate-200 mt-1 py-2 bg-white">
            <div className="px-4 py-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">On This Page</p>
            </div>
            {subItems.map(({ tab, icon: Icon, label }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => goTab(tab)}
                  className={`group flex items-center gap-3 px-4 py-2.5 text-[11px] font-medium transition-all duration-200 cursor-pointer border-l-3 text-left w-full ${
                    isActive
                      ? 'bg-[#FF5A36]/10 text-[#FF5A36] font-semibold border-l-[#FF5A36]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'
                  }`}
                >
                  <Icon size={12} className={`shrink-0 ${isActive ? 'text-[#FF5A36]' : 'text-slate-400 group-hover:text-slate-600 transition-colors'}`} />
                  <span className="truncate">{label}</span>
                  {isActive && <ChevronRight size={11} className="ml-auto shrink-0 opacity-80" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info Spacer */}
      <div className="p-4 border-t border-slate-200 text-[9px] text-slate-400 shrink-0 bg-white">
        <p className="font-semibold">University Portal</p>
        <p className="mt-0.5 font-sans text-slate-400">V2.0.0 · Local Dev</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col w-48 shrink-0 bg-white border-r border-slate-200 overflow-y-auto no-scrollbar min-h-[calc(100vh-67px)] relative z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar (Slide-in) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Side Drawer Card */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-white shadow-2xl h-full z-50 border-r border-slate-200 animate-fade-in animate-slide-up">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

