import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { StatsCard } from '../components/ui/StatsCard';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import {
  GraduationCap, Users, BookOpen, Building2, BarChart2,
  ArrowRight, CheckCircle2, Clock, ClipboardList, Shield,
  Layers, TrendingUp
} from 'lucide-react';

// ── SUPER ADMIN DASHBOARD ────────────────────────────────────────────────
function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/responses/analytics').then(r => {
      const d = r.data;
      setStats({
        depts: d.deptOverview?.length ?? 0,
        faculty: d.avgRatingPerFaculty?.length ?? 0,
      });
    }).catch(() => {});
  }, []);

  const actions = [
    { label: 'User Management',   desc: 'Create HODs & coordinators', path: '/superadmin',  icon: Shield,    color: 'blue' },
    { label: 'Coordinator Panel', desc: 'Sections, courses, faculty',  path: '/coordinator', icon: Layers,    color: 'purple' },
    { label: 'Analytics',         desc: 'University-wide insights',    path: '/analytics',   icon: BarChart2, color: 'green' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-invertis-orange uppercase tracking-wider">Super Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Control Tower</h1>
        <p className="text-sm text-gray-500 mt-1">University-wide system overview and management.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <StatsCard icon={Building2} label="Departments" value={stats.depts} color="purple" />
          <StatsCard icon={GraduationCap} label="Faculty Evaluated" value={stats.faculty} color="blue" />
        </div>
      )}

      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map(({ label, desc, path, icon: Icon, color }) => (
            <Card key={path} hover>
              <button onClick={() => navigate(path)} className="w-full text-left p-5 cursor-pointer">
                <div className={`w-10 h-10 rounded-xl bg-${color === 'blue' ? 'blue' : color === 'purple' ? 'purple' : 'emerald'}-50 flex items-center justify-center mb-4`}>
                  <Icon size={18} className={`text-${color === 'blue' ? 'blue' : color === 'purple' ? 'purple' : 'emerald'}-500`} />
                </div>
                <div className="text-sm font-bold text-gray-900">{label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                <ArrowRight size={14} className="text-gray-300 mt-3" />
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── HOD OVERVIEW ─────────────────────────────────────────────────────────
function HODOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    { label: 'Create Forms', desc: 'Design & assign evaluation forms', path: '/hod',       icon: ClipboardList, color: 'blue' },
    { label: 'Analytics',    desc: 'Department performance insights',  path: '/analytics', icon: BarChart2,     color: 'purple' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <span className="text-xs font-bold text-invertis-blue uppercase tracking-wider">Head of Department</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Welcome back, {user?.name?.split(' ')[1] || user?.name}</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your department's feedback cycle.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map(({ label, desc, path, icon: Icon }) => (
          <Card key={path} hover>
            <button onClick={() => navigate(path)} className="w-full text-left p-5 cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center mb-4">
                <Icon size={18} className="text-invertis-blue" />
              </div>
              <div className="text-sm font-bold text-gray-900">{label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
              <ArrowRight size={14} className="text-gray-300 mt-3" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── COORDINATOR REDIRECT ─────────────────────────────────────────────────
function CoordinatorRedirect() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/coordinator'); }, [navigate]);
  return null;
}

// ── STUDENT DASHBOARD ────────────────────────────────────────────────────
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
    <div className="space-y-6 animate-fade-in max-w-4xl">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Student Dashboard</span>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">Hey, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-gray-500 mt-1">Your section's feedback forms for this semester.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <StatsCard icon={Clock} label="Pending" value={pendingCount} color="orange" />
        <StatsCard icon={CheckCircle2} label="Completed" value={completedCount} color="green" />
        <StatsCard icon={TrendingUp} label="Progress" value={`${progress}%`} color="blue" />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <Card>
          <CardBody>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Completion</span>
              <span>{completedCount}/{total} forms</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-invertis-blue to-invertis-light-blue" />
            </div>
          </CardBody>
        </Card>
      )}

      {/* Courses */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2,3].map(n => <div key={n} className="h-44 bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <EmptyState icon={GraduationCap} title="No active feedback forms" message="Forms appear here when opened by your HOD." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map(course => (
            <Card key={course.id} hover>
              <CardBody>
                {/* Course header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0">
                    <Badge status="active">{course.code}</Badge>
                    <h2 className="text-sm font-bold text-gray-900 mt-2 line-clamp-1">{course.name}</h2>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {course.pending_count > 0 && (
                      <Badge status="pending"><Clock size={10} className="mr-1" />{course.pending_count}</Badge>
                    )}
                    {course.completed_count > 0 && (
                      <Badge status="completed"><CheckCircle2 size={10} className="mr-1" />{course.completed_count}</Badge>
                    )}
                  </div>
                </div>

                {/* TLFQs */}
                {(course.tlfqs || []).length > 0 && (
                  <div className="space-y-2">
                    {course.tlfqs.map(tlfq => (
                      <button key={tlfq.id}
                        onClick={() => !tlfq.completed && navigate(`/courses/${course.id}/tlfq/${tlfq.id}`)}
                        disabled={tlfq.completed}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs border transition-all ${
                          tlfq.completed
                            ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-default'
                            : 'bg-blue-50/50 border-blue-200 hover:border-invertis-blue hover:bg-blue-50 text-gray-700 cursor-pointer'
                        }`}>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{tlfq.faculty_name}</div>
                          <div className="text-gray-400 mt-0.5 line-clamp-1">{tlfq.title}</div>
                        </div>
                        {tlfq.completed
                          ? <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 ml-2" />
                          : <ArrowRight size={13} className="text-invertis-blue flex-shrink-0 ml-2" />
                        }
                      </button>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
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

  return content;
}
