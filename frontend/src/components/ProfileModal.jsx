import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  X, Mail, Hash, Star, Calendar, BookMarked, IdCard, Sparkles,
  Shield, Users, Building2, Layers, UserCircle, Trophy, ClipboardCheck,
  BarChart3, BookOpen, ArrowRight, Activity, Zap, GraduationCap,
  FileText, Eye, Settings, Link2, Crown
} from 'lucide-react';
import { motion } from 'framer-motion';

// ── Role visual config ───────────────────────────────────
const ROLE_CONFIG = {
  supreme:     { label: 'Supreme Authority', color: '#F59E0B', gradient: 'from-amber-500 to-orange-600' },
  super_admin: { label: 'Super Admin',       color: '#60A5FA', gradient: 'from-blue-500 to-indigo-600' },
  coordinator: { label: 'Coordinator',       color: '#34D399', gradient: 'from-emerald-500 to-teal-600' },
  hod:         { label: 'Head of Department', color: '#A78BFA', gradient: 'from-violet-500 to-purple-600' },
  student:     { label: 'Student',           color: '#6EE7B7', gradient: 'from-green-400 to-emerald-600' },
};

// ── Profile detail row ───────────────────────────────────
function DetailRow({ icon: Icon, label, value, accent }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-100 last:border-b-0">
      <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: `${accent || '#9CA3AF'}12` }}>
        <Icon size={18} style={{ color: accent || '#9CA3AF' }} />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{label}</p>
        <p className="text-[14px] font-semibold text-gray-800 mt-1 break-all leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col items-center text-center gap-1.5"
    >
      <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div className="text-xl font-black text-gray-900 leading-none">{value ?? '—'}</div>
      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</div>
    </motion.div>
  );
}

// ── Activity Ring (SVG) ──────────────────────────────────
function ActivityRing({ completed, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-gray-900">{pct}%</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Complete</span>
        </div>
      </div>
      <div className="text-xs text-gray-500 font-medium">
        <span className="font-bold text-gray-800">{completed}</span> of <span className="font-bold text-gray-800">{total}</span> forms submitted
      </div>
    </motion.div>
  );
}

// ── Quick Action Button ──────────────────────────────────
function QuickAction({ icon: Icon, label, to, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
    >
      <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}12` }}>
        <Icon size={15} style={{ color }} />
      </div>
      <span className="text-sm font-semibold text-gray-700 flex-1 text-left">{label}</span>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

// ── Loading Skeleton ─────────────────────────────────────
function StatsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-24" />
        ))}
      </div>
      <div className="space-y-3">
        <div className="bg-gray-100 rounded-xl h-12" />
        <div className="bg-gray-100 rounded-xl h-12" />
      </div>
    </div>
  );
}

// ── Section Header ───────────────────────────────────────
function SectionHeader({ title }) {
  return (
    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
      <div className="h-px flex-1 bg-gray-200" />
      {title}
      <div className="h-px flex-1 bg-gray-200" />
    </h2>
  );
}

// ── Portal Status Indicator ──────────────────────────────
function PortalStatus({ isOpen, departmentName }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isOpen
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-red-50 border-red-200'
      }`}
    >
      <div className={`h-3 w-3 rounded-full shadow-sm ${isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}>
        {isOpen && <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-gray-700">Feedback Portal</p>
        <p className={`text-[10px] font-semibold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
          {isOpen ? 'Open — Students can submit feedback' : 'Closed — Submissions paused'}
        </p>
      </div>
    </motion.div>
  );
}

export default function ProfileModal({ onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = user?.role;
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/auth/profile-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  const goTo = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[200] bg-white overflow-y-auto"
    >
      {/* ── Top bar with close ─────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCircle size={18} className="text-[#1D3557]" />
          <span className="text-sm font-bold text-[#1D3557]">My Profile</span>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className="h-9 w-9 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-gray-500 transition-all cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Hero header with gradient ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
      >
        <div className={`bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-white/3 rounded-full -translate-y-1/2 -translate-x-1/2" />

          <div className="relative max-w-2xl mx-auto px-6 py-12 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/40 flex items-center justify-center text-white font-bold text-4xl shadow-2xl">
              {user?.name?.charAt(0) || 'U'}
            </div>

            {/* Name */}
            <h1 className="text-white font-bold text-2xl md:text-3xl mt-5 leading-tight">{user?.name}</h1>

            {/* Role badge */}
            <span className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-bold text-white uppercase tracking-wider">
              <Sparkles size={12} />
              {config.label}
            </span>

            {/* Login ID pill */}
            {user?.student_id && (
              <span className="mt-3 px-3 py-1 rounded-full bg-white/10 text-[11px] text-white/80 font-medium tracking-wide">
                ID: {user.student_id}
              </span>
            )}
          </div>
        </div>

        {/* ── Accent bar ───────────────────────────────────── */}
        <div className="h-[3px] bg-[#FF2A00]" />
      </motion.div>

      {/* ── Details section ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className="max-w-2xl mx-auto px-6 py-8"
      >
        {/* ── Account Information ──────────────────────────── */}
        <div className="mb-8">
          <SectionHeader title="Account Information" />
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
            <DetailRow icon={IdCard} label="Login ID" value={user?.student_id} accent={config.color} />
            <DetailRow icon={Mail} label="Email Address" value={user?.email} accent="#6B7280" />
            <div className="flex items-start gap-4 py-3">
              <div className="mt-0.5 shrink-0 h-10 w-10 rounded-xl flex items-center justify-center bg-gray-50">
                <UserCircle size={18} className="text-gray-400" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Account Status</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${user?.status === 'active' ? 'bg-green-500' : 'bg-orange-400'}`} />
                  <span className="text-[14px] font-semibold text-gray-800 capitalize">{user?.status || 'Active'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            STUDENT: Activity Ring + Stats + Courses
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {role === 'student' && (
          <>
            {/* Academic Details */}
            <div className="mb-8">
              <SectionHeader title="Academic Details" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
                <DetailRow icon={Hash} label="Anonymous Feedback ID" value={user?.unique_feedback_id} accent="#EF4444" />
                <DetailRow icon={Building2} label="Department" value={user?.department_name} accent="#8B5CF6" />
                <DetailRow icon={Layers} label="Section" value={user?.section_name} accent="#3B82F6" />
                <DetailRow icon={BookMarked} label="Current Semester" value={user?.semester ? `Semester ${user.semester}` : null} accent="#10B981" />
                <DetailRow icon={Calendar} label="Batch" value={user?.batch} accent="#F59E0B" />
              </div>
            </div>

            {/* Activity & Stats */}
            <div className="mb-8">
              <SectionHeader title="Feedback Activity" />
              {loading ? <StatsSkeleton /> : stats ? (
                <>
                  {/* Activity Ring */}
                  <div className="flex justify-center mb-6">
                    <ActivityRing
                      completed={stats.completedForms || 0}
                      total={stats.availableForms || 0}
                      color={config.color}
                    />
                  </div>

                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <StatCard icon={ClipboardCheck} label="Submitted" value={stats.totalSubmissions} color="#10B981" delay={0.1} />
                    <StatCard icon={Trophy} label="Rank" value={`#${stats.leaderboardRank}`} color="#F59E0B" delay={0.15} />
                    <StatCard icon={Star} label="Points" value={stats.points} color="#EF4444" delay={0.2} />
                    <StatCard icon={BookOpen} label="Courses" value={stats.enrolledCourses?.length || 0} color="#3B82F6" delay={0.25} />
                  </div>

                  {/* Enrolled Courses List */}
                  {stats.enrolledCourses?.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                      <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Enrolled Courses</p>
                      </div>
                      {stats.enrolledCourses.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50 last:border-b-0">
                          <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center">
                            <BookOpen size={13} className="text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 font-mono">{c.code}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Unable to load stats</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-2">
                <QuickAction icon={Trophy} label="View Leaderboard" color="#F59E0B" onClick={() => goTo('/leaderboard')} />
                <QuickAction icon={ClipboardCheck} label="Submit Feedback" color="#10B981" onClick={() => goTo('/dashboard')} />
              </div>
            </div>
          </>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            HOD: Department Stats + Portal Status
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {role === 'hod' && (
          <>
            <div className="mb-8">
              <SectionHeader title="Department Overview" />
              {loading ? <StatsSkeleton /> : stats ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <StatCard icon={Layers} label="Sections" value={stats.sections} color="#8B5CF6" delay={0.1} />
                    <StatCard icon={Users} label="Faculty" value={stats.faculty} color="#3B82F6" delay={0.15} />
                    <StatCard icon={GraduationCap} label="Students" value={stats.students} color="#10B981" delay={0.2} />
                    <StatCard icon={FileText} label="Total Forms" value={stats.totalForms} color="#F59E0B" delay={0.25} />
                    <StatCard icon={Activity} label="Open Forms" value={stats.openForms} color="#EF4444" delay={0.3} />
                    <StatCard icon={Building2} label="Department" value={stats.departmentName?.split(' ').pop() || '—'} color="#6366F1" delay={0.35} />
                  </div>

                  <PortalStatus isOpen={stats.portalOpen} departmentName={stats.departmentName} />
                </>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Unable to load stats</p>
              )}
            </div>

            <div className="mb-8">
              <SectionHeader title="Department Details" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
                <DetailRow icon={Building2} label="Department" value={user?.department_name} accent="#8B5CF6" />
                <DetailRow icon={Shield} label="Access Level" value="Department-wide Management & Analytics" accent={config.color} />
              </div>
            </div>

            <div className="mb-8">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-2">
                <QuickAction icon={FileText} label="Manage Evaluation Forms" color="#8B5CF6" onClick={() => goTo('/hod')} />
                <QuickAction icon={BarChart3} label="View Analytics" color="#3B82F6" onClick={() => goTo('/analytics')} />
                <QuickAction icon={Trophy} label="View Leaderboard" color="#F59E0B" onClick={() => goTo('/leaderboard')} />
              </div>
            </div>
          </>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            SUPER ADMIN / SUPREME: System Overview
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {(role === 'super_admin' || role === 'supreme') && (
          <>
            <div className="mb-8">
              <SectionHeader title="System Overview" />
              {loading ? <StatsSkeleton /> : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard icon={Building2} label="Departments" value={stats.departments} color="#8B5CF6" delay={0.1} />
                  <StatCard icon={GraduationCap} label="Students" value={stats.students} color="#10B981" delay={0.15} />
                  <StatCard icon={Users} label="Staff" value={stats.staff} color="#3B82F6" delay={0.2} />
                  <StatCard icon={FileText} label="Total Forms" value={stats.totalForms} color="#F59E0B" delay={0.25} />
                  <StatCard icon={ClipboardCheck} label="Responses" value={stats.totalResponses} color="#EF4444" delay={0.3} />
                  <StatCard icon={Zap} label="Active" value="System Online" color="#10B981" delay={0.35} />
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Unable to load stats</p>
              )}
            </div>

            <div className="mb-8">
              <SectionHeader title="Access & Permissions" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
                <DetailRow
                  icon={Shield}
                  label="Access Level"
                  value={role === 'supreme' ? 'Global — All Panels, Identity Reveal & System Control' : 'University-wide — All Departments & Analytics'}
                  accent={config.color}
                />
              </div>
            </div>

            <div className="mb-8">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-2">
                {role === 'supreme' && (
                  <QuickAction icon={Crown} label="Supreme Panel" color="#F59E0B" onClick={() => goTo('/supreme')} />
                )}
                <QuickAction icon={Settings} label="Manage Staff & Departments" color="#8B5CF6" onClick={() => goTo('/superadmin')} />
                <QuickAction icon={BarChart3} label="View Analytics" color="#3B82F6" onClick={() => goTo('/analytics')} />
                <QuickAction icon={Eye} label="Identity Reveal" color="#EF4444" onClick={() => goTo('/reveal')} />
                <QuickAction icon={Trophy} label="View Leaderboard" color="#F59E0B" onClick={() => goTo('/leaderboard')} />
              </div>
            </div>
          </>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            COORDINATOR: Management Overview
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {role === 'coordinator' && (
          <>
            <div className="mb-8">
              <SectionHeader title="Management Overview" />
              {loading ? <StatsSkeleton /> : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <StatCard icon={Layers} label="Sections" value={stats.sections} color="#10B981" delay={0.1} />
                  <StatCard icon={BookOpen} label="Courses" value={stats.courses} color="#3B82F6" delay={0.15} />
                  <StatCard icon={Users} label="Faculty" value={stats.faculty} color="#8B5CF6" delay={0.2} />
                  <StatCard icon={GraduationCap} label="Students" value={stats.students} color="#F59E0B" delay={0.25} />
                  <StatCard icon={Link2} label="Assignments" value={stats.assignments} color="#EF4444" delay={0.3} />
                  <StatCard icon={Zap} label="Active" value="System Online" color="#10B981" delay={0.35} />
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">Unable to load stats</p>
              )}
            </div>

            <div className="mb-8">
              <SectionHeader title="Access & Permissions" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-2">
                <DetailRow icon={Users} label="Access Level" value="University-wide — Sections, Faculty & Student Management" accent={config.color} />
              </div>
            </div>

            <div className="mb-8">
              <SectionHeader title="Quick Actions" />
              <div className="flex flex-col gap-2">
                <QuickAction icon={Layers} label="Manage Sections & Faculty" color="#10B981" onClick={() => goTo('/coordinator')} />
                <QuickAction icon={GraduationCap} label="Manage Students" color="#3B82F6" onClick={() => goTo('/coordinator?tab=students')} />
                <QuickAction icon={Trophy} label="View Leaderboard" color="#F59E0B" onClick={() => goTo('/leaderboard')} />
              </div>
            </div>
          </>
        )}

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="text-center pt-4 pb-2">
          <p className="text-[10px] text-gray-300 font-semibold tracking-widest uppercase">
            Invertis University • Feedback System
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
