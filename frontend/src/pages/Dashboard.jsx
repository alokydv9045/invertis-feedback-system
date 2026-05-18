import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  GraduationCap, Users, BookOpen, Building2, BarChart2,
  ArrowRight, CheckCircle2, Clock, ClipboardList, Shield,
  PlusCircle, Layers, TrendingUp, Activity, ArrowUpCircle
} from 'lucide-react';

const PageShell = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#F1FAEE] text-[#212529]">
    <Navbar />
    <div className="flex flex-col md:flex-row flex-1 min-h-0">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-5 md:p-7 overflow-auto">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {children}
        </motion.div>
      </main>
    </div>
  </div>
);

function StatCard({ icon: Icon, label, value, color, glow }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-lg shadow border border-[#DEE2E6] hover:shadow-md transition-shadow p-4 sm:p-5 flex items-center gap-4">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}
        style={{ boxShadow: `0 0 20px ${glow}` }}>
        <Icon size={19} className="text-white" />
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-black text-[#1D3557] tracking-tight">{value ?? '—'}</div>
        <div className="text-[11px] text-slate-500 font-medium mt-0.5">{label}</div>
      </div>
    </motion.div>
  );
}

// ── SUPER ADMIN DASHBOARD ───────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [promotionOverview, setPromotionOverview] = useState(null);

  useEffect(() => {
    api.get('/responses/analytics').then(r => {
      const d = r.data;
      setStats({
        depts: d.deptOverview?.length ?? 0,
        faculty: d.avgRatingPerFaculty?.length ?? 0,
      });
    }).catch(() => {});
    // also fetch promotion overview for Control Tower
    api.get('/superadmin/promotion/overview')
      .then(r => setPromotionOverview(r.data))
      .catch(() => {});
  }, []);

  const cards = [
    { icon: Building2,    label: 'Departments',        value: stats?.depts,   color: 'bg-primary-600', glow: 'rgba(29, 78, 137, 0.5)' },
    { icon: GraduationCap,label: 'Faculty Evaluated',  value: stats?.faculty, color: 'bg-accent-600',  glow: 'rgba(198, 40, 40, 0.5)' },
  ];

  const promotionCards = [
    { icon: ArrowUpCircle, label: 'Current Session', value: promotionOverview?.active_session?.name || '—', color: 'bg-emerald-600', glow: 'rgba(16, 185, 129, 0.45)' },
    { icon: Activity, label: 'Last Promotion', value: promotionOverview?.recent_logs?.[0] ? `${promotionOverview.recent_logs[0].promoted_count} promoted` : 'No history yet', color: 'bg-teal-600', glow: 'rgba(20, 184, 166, 0.45)' },
  ];

  const actions = [
    { label: 'User Management',    desc: 'Create HODs & coordinators', path: '/superadmin',  icon: Shield,       glow: '#0F2D52' },
    { label: 'Coordinator Panel',  desc: 'Sections, courses, faculty', path: '/coordinator', icon: Layers,       glow: '#1D4E89' },
    { label: 'Analytics',          desc: 'University-wide insights',   path: '/analytics',   icon: BarChart2,    glow: '#C62828' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-accent-400 shadow-sm shadow-accent-400/50" />
          <span className="text-[10px] font-bold text-accent-400 uppercase tracking-widest">Super Admin</span>
        </div>
        <h1 className="text-2xl font-black text-[#212529]">Control Tower</h1>
        <p className="text-sm text-slate-600 mt-1">University-wide system overview and management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c, i) => <StatCard key={`stat-${i}`} {...c} />)}
        {promotionCards.map((c, i) => <StatCard key={`promo-${i}`} {...c} />)}
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map(({ label, desc, path, icon: Icon, glow }) => (
            <motion.button key={path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => navigate(path)}
              className="bg-white rounded-lg shadow border border-[#DEE2E6] hover:shadow-md transition-shadow p-4 text-left flex flex-col gap-3 cursor-pointer group">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                style={{ background: `${glow}22`, border: `1px solid ${glow}44` }}>
                <Icon size={17} style={{ color: glow }} />
              </div>
              <div>
                <div className="text-sm font-bold text-[#1D3557] transition-colors">{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </div>
              <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-600 transition-colors mt-auto" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HOD OVERVIEW ────────────────────────────────────────────────────────────
function HODOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { label: 'Create Forms',  desc: 'Design & assign evaluation forms', path: '/hod',       icon: ClipboardList, glow: '#1D4E89' },
    { label: 'Analytics',     desc: 'Department performance insights',   path: '/analytics', icon: BarChart2,     glow: '#C62828' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-[#E63946] shadow-sm shadow-red-400/50" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Head of Department</span>
        </div>
        <h1 className="text-2xl font-black text-[#212529]">Welcome back, {user?.name?.split(' ')[1] || user?.name}</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your department's feedback cycle.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map(({ label, desc, path, icon: Icon, glow }) => (
          <motion.button key={path} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => navigate(path)}
            className="bg-white rounded-lg shadow border border-[#DEE2E6] hover:shadow-md transition-shadow p-5 text-left flex flex-col gap-4 cursor-pointer group">
            <div className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: `${glow}20`, border: `1px solid ${glow}40` }}>
              <Icon size={18} style={{ color: glow }} />
            </div>
              <div>
                <div className="text-sm font-bold text-[#1D3557]">{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{desc}</div>
              </div>
            <ArrowRight size={14} className="text-slate-600 group-hover:text-slate-700 transition-colors" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ── COORDINATOR REDIRECT ──────────────────────────────────────────────────
function CoordinatorRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/coordinator'); }, [navigate]);
  return null;
}

// ── STUDENT DASHBOARD ──────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/courses')
      .then(r => {
        if (r.data?.portal_closed) setCourses([]);
        else setCourses(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingCount   = courses.reduce((a, c) => a + (c.pending_count || 0), 0);
  const completedCount = courses.reduce((a, c) => a + (c.completed_count || 0), 0);
  const total          = pendingCount + completedCount;
  const progress       = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Student Dashboard</span>
        </div>
        <h1 className="text-2xl font-black text-[#212529]">Hey, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-slate-600 mt-1">Your section's feedback forms for this semester.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { icon: Clock,          label: 'Pending',   value: pendingCount,   color: 'text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20' },
          { icon: CheckCircle2,   label: 'Completed', value: completedCount, color: 'text-emerald-400',bg: 'bg-emerald-400/10 border-emerald-400/20' },
          { icon: TrendingUp,     label: 'Progress',  value: `${progress}%`, color: 'text-primary-400', bg: 'bg-primary-400/10 border-primary-400/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`card p-4 border ${bg} flex items-center sm:flex-col sm:items-start justify-between sm:justify-normal gap-2`}>
            <div className="flex items-center gap-2 sm:gap-1.5">
              <Icon size={16} className={color} />
              <div className="text-xs font-bold text-slate-600 sm:hidden">{label}</div>
            </div>
            <div className="text-right sm:text-left">
              <div className={`text-xl sm:text-2xl font-black ${color}`}>{value}</div>
              <div className="hidden sm:block text-[10px] text-slate-500 font-medium">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-bold">
            <span>Overall Feedback Completion</span>
            <span>{completedCount} of {total} forms completed</span>
          </div>
          <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300/50 dark:border-slate-700/50">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-primary-600 to-emerald-500 shadow-sm" />
          </div>
        </div>
      )}

      {/* Courses */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3].map(n => <div key={n} className="h-44 skeleton rounded-2xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="card border border-white/7 p-12 text-center flex flex-col items-center gap-3">
          <div className="h-14 w-14 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-center">
            <GraduationCap size={26} className="text-slate-600" />
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-bold">No active feedback forms for your section right now.</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs">Forms appear here when opened by your HOD.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <motion.div key={course.id} whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow p-4 sm:p-5 flex flex-col gap-4">
              {/* Course header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold bg-primary-500/15 text-primary-300 border border-primary-500/20 px-2 py-1 rounded-lg font-mono-styled">
                    {course.code}
                  </span>
                  <h2 className="text-sm font-bold text-[#1D3557] mt-2 line-clamp-1">{course.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  {course.pending_count > 0 && (
                    <span className="badge-pending flex items-center gap-1">
                      <Clock size={10} /> {course.pending_count}
                    </span>
                  )}
                  {course.completed_count > 0 && (
                    <span className="badge-active flex items-center gap-1">
                      <CheckCircle2 size={10} /> {course.completed_count}
                    </span>
                  )}
                </div>
              </div>

              {/* TLFQs */}
              {(course.tlfqs || []).length > 0 && (
                <div className="flex flex-col gap-2">
                  {course.tlfqs.map(tlfq => (
                    <button key={tlfq.id}
                      onClick={() => !tlfq.completed && navigate(`/courses/${course.id}/tlfq/${tlfq.id}`)}
                      disabled={tlfq.completed}
                      className={`flex items-center justify-between p-3 rounded-xl text-left text-xs border transition-all ${
                        tlfq.completed
                          ? 'bg-white/3 border-white/5 text-slate-500 dark:text-slate-400 cursor-default'
                          : 'bg-primary-500/5 border-primary-500/20 hover:border-primary-400/40 hover:bg-primary-500/10 text-[var(--text-main)] cursor-pointer'
                      }`}>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{tlfq.faculty_name}</div>
                        <div className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{tlfq.title}</div>
                      </div>
                      {tlfq.completed
                        ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 ml-2" />
                        : <ArrowRight size={13} className="text-primary-400 flex-shrink-0 ml-2" />
                      }
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
function SupremeRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/supreme'); }, [navigate]);
  return null;
}

export default function Dashboard() {
  const { user } = useAuth();

  const content = {
    supreme:     <SupremeRedirect />,
    super_admin: <AdminDashboard />,
    hod:         <HODOverview />,
    coordinator: <CoordinatorRedirect />,
  }[user?.role] ?? <StudentDashboard />;

  return <PageShell>{content}</PageShell>;
}
