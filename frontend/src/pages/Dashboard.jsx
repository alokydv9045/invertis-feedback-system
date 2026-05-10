import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, Building2, BarChart2,
  ArrowRight, CheckCircle2, Clock, ClipboardList, Shield, PlusCircle
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{value ?? '—'}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/tlfq/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { icon: Users, label: 'Total Students', value: stats.totalStudents, color: 'bg-emerald-600' },
    { icon: GraduationCap, label: 'Total Faculty (Records)', value: stats.totalFaculty, color: 'bg-blue-600' },
    { icon: BookOpen, label: 'Courses', value: stats.totalCourses, color: 'bg-indigo-600' },
    { icon: Building2, label: 'Departments', value: stats.totalDepts, color: 'bg-violet-600' },
    { icon: ClipboardList, label: 'Active TLFQs', value: stats.totalTlfqs, color: 'bg-amber-600' },
    { icon: BarChart2, label: 'Completion Rate', value: `${stats.completionRate}%`, color: 'bg-rose-600' },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield size={20} className="text-primary dark:text-violet-400" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">System Control Tower</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">University-wide overview and management hub.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats ? cards.map((c, i) => <StatCard key={i} {...c} />) : (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800 animate-pulse rounded-2xl border border-slate-100 dark:border-slate-700" />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
        <h3 className="text-base font-black text-slate-900 dark:text-slate-200 mb-6 flex items-center gap-2">
          <PlusCircle size={18} className="text-primary dark:text-indigo-400" /> Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Create New TLFQ', desc: 'Design & assign questionnaire', path: '/admin/courses', icon: ClipboardList, color: 'text-indigo-400' },
            { label: 'Full Analytics', desc: 'University-wide reports', path: '/admin/analytics', icon: BarChart2, color: 'text-blue-400' },
            { label: 'Manage Directory', desc: 'Departments, courses, faculty', path: '/admin/directory', icon: Building2, color: 'text-violet-400' },
          ].map(({ label, desc, path, icon: Icon, color }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-700 hover:border-primary/30 dark:hover:border-slate-600 rounded-2xl transition-all text-left cursor-pointer group shadow-sm hover:shadow-md"
            >
              <Icon size={20} className={color.replace('text-indigo-400', 'text-primary dark:text-indigo-400').replace('text-blue-400', 'text-secondary dark:text-blue-400').replace('text-violet-400', 'text-tertiary dark:text-violet-400')} />
              <div className="flex-1">
                <div className="text-sm font-black text-slate-900 dark:text-slate-200 tracking-tight">{label}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5">{desc}</div>
              </div>
              <ArrowRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-primary dark:group-hover:text-slate-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HOD DASHBOARD ──────────────────────────────────────────────────────────────
function HODOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Building2 size={20} className="text-secondary dark:text-blue-400" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Department Overview</h1>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Welcome back, {user?.name}. View analytics for your department.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-secondary/10 dark:border-blue-900/40 rounded-[2.5rem] p-10 flex flex-col items-center text-center gap-6 shadow-xl shadow-slate-200 dark:shadow-none">
        <div className="h-20 w-20 bg-secondary/10 dark:bg-blue-900/40 rounded-3xl flex items-center justify-center">
          <BarChart2 size={32} className="text-secondary dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Department Analytics</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md leading-relaxed font-medium">
            View faculty performance, course ratings, anonymous student comments, and feedback completion rates for your department.
          </p>
        </div>
        <button
          onClick={() => navigate('/hod/analytics')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer shadow-lg shadow-blue-950/50"
        >
          View Analytics <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── STUDENT DASHBOARD ──────────────────────────────────────────────────────────
function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tlfq/courses')
      .then(r => setCourses(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pendingCount = courses.reduce((a, c) => a + (c.pending_count || 0), 0);
  const completedCount = courses.reduce((a, c) => a + (c.completed_count || 0), 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Good day, {user?.name} 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Your enrolled courses and pending feedback questionnaires.</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-800/50 text-amber-300 text-xs font-bold px-4 py-2 rounded-full">
          <Clock size={13} /> {pendingCount} Pending
        </div>
        <div className="flex items-center gap-2 bg-emerald-900/30 border border-emerald-800/50 text-emerald-300 text-xs font-bold px-4 py-2 rounded-full">
          <CheckCircle2 size={13} /> {completedCount} Completed
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(n => <div key={n} className="h-48 bg-slate-800 animate-pulse rounded-2xl border border-slate-700" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center shadow-sm">
          <GraduationCap size={40} className="text-slate-200 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-bold">No courses enrolled. Contact admin for enrollment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <motion.div
              key={course.id}
              whileHover={{ y: -6 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-primary/5 dark:bg-indigo-900/50 text-primary dark:text-indigo-300 border border-primary/10 dark:border-indigo-800/50 px-3 py-1 rounded-xl">
                    {course.code}
                  </span>
                  <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 mt-3 tracking-tight line-clamp-1">{course.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                  {course.pending_count > 0 && (
                    <span className="text-xs font-bold bg-amber-900/40 text-amber-300 border border-amber-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock size={11} /> {course.pending_count} pending
                    </span>
                  )}
                  {course.completed_count > 0 && (
                    <span className="text-xs font-bold bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 size={11} /> {course.completed_count} done
                    </span>
                  )}
                </div>
              </div>

              {/* TLFQs inside the course */}
              {(course.tlfqs || []).length > 0 && (
                <div className="flex flex-col gap-2">
                  {course.tlfqs.map(tlfq => (
                    <button
                      key={tlfq.id}
                      onClick={() => !tlfq.completed && navigate(`/courses/${course.id}/tlfq/${tlfq.id}`)}
                      disabled={tlfq.completed}
                      className={`flex items-center justify-between p-4 rounded-2xl text-left text-xs border transition-all duration-300 ${
                        tlfq.completed
                          ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-default'
                          : 'bg-white dark:bg-slate-900 border-primary/5 dark:border-indigo-800/40 hover:border-primary/40 hover:bg-primary/[0.02] dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs">{tlfq.faculty_name}</div>
                        <div className="text-slate-500 text-xs mt-0.5 line-clamp-1">{tlfq.title}</div>
                      </div>
                      {tlfq.completed
                        ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
                        : <ArrowRight size={14} className="text-indigo-400 flex-shrink-0" />
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

// ── MAIN DASHBOARD ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  const renderContent = () => {
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'hod') return <HODOverview />;
    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
