import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, BarChart2, Trophy, Shield,
  Users, Layers, Building2, Crown, Fingerprint,
  Award, Activity, TrendingUp, BookOpen, MessageSquare,
  ArrowUpCircle, Search, ChevronRight, UserCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileModal from './ProfileModal';

// ── Primary page nav per role ─────────────────────────────
const PAGE_NAV = {
  student: [
    { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  ],
  hod: [
    { to: '/hod',         icon: LayoutDashboard, label: 'Dashboard',   end: true },
    { to: '/reveal',      icon: Fingerprint,      label: 'Identity Reveal' },
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

const ROLE_COLORS = {
  supreme:     '#F59E0B',
  super_admin: '#3B82F6',
  coordinator: '#10B981',
  hod:         '#8B5CF6',
  student:     '#10B981',
};

const MD_BREAKPOINT = 768;

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT);
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= MD_BREAKPOINT);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return isDesktop;
}

export default function Sidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const [showProfile, setShowProfile] = useState(false);

  // Desktop: open by default. Mobile: closed by default.
  const [isOpen, setIsOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= MD_BREAKPOINT);

  const role = user?.role;
  const links = PAGE_NAV[role] || PAGE_NAV.student;
  const roleColor = ROLE_COLORS[role] || ROLE_COLORS.student;

  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (!isDesktop) setIsOpen(false);
  }, [location.pathname, location.search, isDesktop]);

  // Listen for toggle event from Navbar hamburger button
  useEffect(() => {
    const handler = () => setIsOpen(prev => !prev);
    window.addEventListener('toggle-sidebar', handler);
    return () => window.removeEventListener('toggle-sidebar', handler);
  }, []);

  // When switching between desktop/mobile, reset to default state
  useEffect(() => {
    setIsOpen(isDesktop);
  }, [isDesktop]);

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
    if (!isDesktop) setIsOpen(false);
  };

  const handleNavClick = () => {
    if (!isDesktop) setIsOpen(false);
  };

  // ── Sidebar content (shared between desktop & mobile) ──
  const sidebarContent = (
    <>
      {/* ── User Card Header ─────────────────────────── */}
      <div className="bg-[#1D3557] px-4 py-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ background: roleColor }}
            >
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold truncate leading-tight">{user?.name}</p>
              <p className="text-white/50 text-[10px] uppercase tracking-widest mt-0.5 truncate">
                {role?.replace('_', ' ')}
              </p>
              {role === 'hod' && user?.department_name && (
                <p className="text-emerald-300/80 text-[10px] font-semibold mt-0.5 truncate">
                  📍 {user.department_name}
                </p>
              )}
            </div>
          </div>
          {/* Close button (mobile only) */}
          {!isDesktop && (
            <button
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="h-[2px] bg-[#FF2A00] rounded-full" />
      </div>

      {/* ── Navigation Links ─────────────────────────── */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        <div className="px-3 mb-1">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">Navigation</p>
        </div>

        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} className="block px-3 mb-0.5" onClick={handleNavClick}>
            {({ isActive }) => (
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1D3557] text-white shadow-md shadow-[#1D3557]/20'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-[#1D3557]'
              }`}>
                <Icon size={16} className="shrink-0" />
                <span>{label}</span>
                {isActive && <ChevronRight size={12} className="ml-auto opacity-60" />}
              </div>
            )}
          </NavLink>
        ))}

        {/* ── Profile Link ──────────────────────────── */}
        <div className="px-3 mb-0.5">
          <button
            id="sidebar-profile-btn"
            onClick={() => { setShowProfile(true); if (!isDesktop) setIsOpen(false); }}
            className="w-full text-left"
          >
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
              showProfile
                ? 'bg-[#1D3557] text-white shadow-md shadow-[#1D3557]/20'
                : 'text-gray-600 hover:bg-gray-100 hover:text-[#1D3557]'
            }`}>
              <UserCircle size={16} className="shrink-0" />
              <span>My Profile</span>
            </div>
          </button>
        </div>

        {/* ── Sub-navigation (contextual) ───────────── */}
        {subItems.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100 mx-3">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5">On This Page</p>
            {subItems.map(({ tab, icon: Icon, label }) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => goTab(tab)}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer text-left mb-0.5 ${
                    isActive
                      ? 'bg-[#FF2A00]/10 text-[#FF2A00] font-bold'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#1D3557]'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span className="truncate">{label}</span>
                  {isActive && <ChevronRight size={11} className="ml-auto shrink-0 opacity-60" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/80">
        <p className="text-[9px] text-gray-400 font-semibold tracking-wider text-center uppercase">
          Invertis University
        </p>
      </div>
    </>
  );

  return (
    <>
      {/* ════════════════════════════════════════════════════
          DESKTOP: Inline sidebar (part of flex layout)
         ════════════════════════════════════════════════════ */}
      {isDesktop && isOpen && (
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden min-h-[calc(100vh-52px)]" style={{ transition: 'width 0.25s ease' }}>
          {sidebarContent}
        </aside>
      )}

      {/* ════════════════════════════════════════════════════
          MOBILE: Overlay sidebar (fixed, with backdrop)
         ════════════════════════════════════════════════════ */}
      {!isDesktop && (
        <>
          {/* Backdrop */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[70] bg-black/30 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
              />
            )}
          </AnimatePresence>

          {/* Slide-out panel */}
          <AnimatePresence>
            {isOpen && (
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="fixed top-0 left-0 z-[80] h-full w-64 bg-white shadow-2xl flex flex-col overflow-hidden"
              >
                {sidebarContent}
              </motion.aside>
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── Profile Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      </AnimatePresence>
    </>
  );
}
