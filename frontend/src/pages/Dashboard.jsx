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

function StatCard({ label, value, trend, icon, isHero }) {
  if (isHero) {
    return (
      <div className="md:col-span-8 bg-white border border-[#e0e0e0] rounded-[16px] p-8 text-[#1A1A1A] relative overflow-hidden flex flex-col justify-between h-[240px] shadow-sm">
        <div className="z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff6b00] font-black">Total Engine Throughput</span>
          <h2 className="text-5xl font-black mt-2 text-[#1A1A1A]">{value ?? '1,240'}</h2>
          <p className="text-sm text-[#474747] mt-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ff6b00] text-[18px]">trending_up</span>
            <span className="font-bold">{trend ?? '+12.4%'}</span> from last period
          </p>
        </div>
        <div className="z-10 flex gap-4 mt-8">
          <div className="bg-[#ff6b00]/5 backdrop-blur-md border border-[#ff6b00]/20 rounded-xl px-6 py-3">
            <p className="text-[10px] font-bold text-[#474747] uppercase tracking-wider">NPS Score</p>
            <p className="text-2xl font-black text-[#ff6b00]">74</p>
          </div>
          <div className="bg-black/5 backdrop-blur-md border border-black/5 rounded-xl px-6 py-3">
            <p className="text-[10px] font-bold text-[#474747] uppercase tracking-wider">Response Rate</p>
            <p className="text-2xl font-black text-[#1A1A1A]">82.4%</p>
          </div>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none">
          <span className="material-symbols-outlined text-[180px] leading-none text-[#1A1A1A]">monitoring</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-6 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${label === 'Active Surveys' ? 'bg-[#ff6b00]/10' : 'bg-[#f1f1f1]'}`}>
        <span className={`material-symbols-outlined text-[32px] ${label === 'Active Surveys' ? 'text-[#ff6b00]' : 'text-[#474747]'}`}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-[#474747] uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-[#1A1A1A]">{value ?? '—'}</p>
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

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <StatCard isHero value={stats?.totalTlfqs} />
        <div className="md:col-span-4 flex flex-col gap-6">
          <StatCard label="Active Surveys" value={stats?.totalTlfqs} icon="assignment" />
          <StatCard label="Departments" value={stats?.totalDepts} icon="domain" />
        </div>
      </div>

      {/* Quick Actions & Tasks Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white border border-[#e0e0e0] rounded-[16px] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center bg-[#f9f9f9]/50">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#ff6b00]">pending_actions</span>
              <h3 className="text-lg font-bold text-[#1A1A1A]">Pending Tasks</h3>
            </div>
            <span className="bg-[#ff6b00] text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">24 Active</span>
          </div>
          <div className="divide-y divide-[#e0e0e0]">
            {[
              { title: 'Review Q3 Employee Feedback', meta: 'Due in 2 hours • HR Department', color: 'bg-[#b3261e]' },
              { title: 'Update NPS Benchmarks', meta: 'Due tomorrow • Analytics Team', color: 'bg-[#ff6b00]' },
              { title: 'Client Directory Refresh', meta: 'Due Friday • IT Support', color: 'bg-[#d1d1d1]' },
            ].map((task, i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-[#f5f5f5]/50 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={`w-2.5 h-2.5 rounded-full ${task.color}`}></div>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A1A]">{task.title}</p>
                    <p className="text-[11px] text-[#474747] mt-1">{task.meta}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#474747] group-hover:text-[#ff6b00] transition-colors">chevron_right</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[#e0e0e0] rounded-[16px] shadow-sm p-6 space-y-6">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Quick Actions</h3>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => navigate('/admin/courses')}
              className="w-full bg-[#ff6b00] text-white py-4 px-6 rounded-[16px] flex items-center justify-between group hover:opacity-90 transition-all shadow-md shadow-[#ff6b00]/20 cursor-pointer"
            >
              <span className="font-bold text-sm">Create New Survey</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">add_circle</span>
            </button>
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="w-full bg-[#f9f9f9] text-[#1A1A1A] py-4 px-6 rounded-[16px] flex items-center justify-between group hover:bg-[#f5f5f5] transition-all border border-[#e0e0e0] cursor-pointer"
            >
              <span className="font-bold text-sm">Full Analytics</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">bar_chart_4_bars</span>
            </button>
            <button 
              onClick={() => navigate('/admin/directory')}
              className="w-full bg-transparent border border-[#e0e0e0] text-[#1A1A1A] py-4 px-6 rounded-[16px] flex items-center justify-between group hover:bg-white transition-all cursor-pointer"
            >
              <span className="font-bold text-sm">Manage Directory</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">person_search</span>
            </button>
          </div>
          <div className="mt-8 p-6 bg-[#ff6b00]/5 rounded-xl border border-[#ff6b00]/10">
            <p className="text-[10px] text-[#ff6b00] font-black uppercase tracking-widest mb-2">System Insight</p>
            <p className="text-xs text-[#474747] leading-relaxed">
              Response rate is up <span className="text-[#ff6b00] font-black">5%</span> since the new mobile optimization was deployed.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Graph Section */}
      <div className="bg-white border border-[#e0e0e0] rounded-[16px] shadow-sm p-8">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-lg font-bold text-[#1A1A1A]">Feedback Trends</h3>
            <p className="text-sm text-[#474747] mt-1">Real-time engagement across departments</p>
          </div>
          <div className="flex gap-1 bg-[#f5f5f5] rounded-full p-1 border border-[#e0e0e0]">
            <button className="px-6 py-1.5 bg-[#ff6b00] text-white font-bold rounded-full text-[10px] uppercase tracking-wider">Weekly</button>
            <button className="px-6 py-1.5 text-[#474747] hover:text-[#1A1A1A] rounded-full text-[10px] uppercase tracking-wider transition-colors">Monthly</button>
          </div>
        </div>
        <div className="h-64 w-full flex items-end gap-4 px-4">
          {[45, 65, 85, 55, 95, 70, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-[#f5f5f5]/50 rounded-t-lg relative group">
              <div 
                className="absolute bottom-0 w-full bg-[#ff6b00]/60 rounded-t-lg transition-all hover:bg-[#ff6b00]" 
                style={{ height: `${h}%` }}
              ></div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[10px] px-2 py-1 rounded shadow-xl z-10">
                {h * 10}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between px-4 mt-6 text-[10px] font-black text-[#474747] opacity-60 uppercase tracking-[0.2em]">
          <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
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
    <div className="flex flex-col gap-10">
      {/* Dashboard Greeting */}
      <div className="mb-2">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2 bg-[#ff6b00]/10 text-[#ff6b00] rounded-lg">
            <span className="material-symbols-outlined text-[24px]">domain</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Department Control Hub</h2>
        </div>
        <p className="text-gray-500 font-medium ml-12">Welcome back, {user?.name}. Managing {user?.department_name || 'your department'}.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-10 flex flex-col items-center text-center gap-6 shadow-sm">
        <div className="h-20 w-20 bg-[#ff6b00]/5 rounded-2xl flex items-center justify-center">
          <span className="material-symbols-outlined text-[32px] text-[#ff6b00]">leaderboard</span>
        </div>
        <div className="max-w-lg">
          <h3 className="text-xl font-bold text-gray-900">Performance Analytics</h3>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Review real-time feedback insights, faculty performance metrics, and anonymous student narratives for your department.
          </p>
        </div>
        <button
          onClick={() => navigate('/hod/analytics')}
          className="flex items-center gap-2 bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white px-8 py-3.5 rounded-lg font-bold text-sm transition-all cursor-pointer shadow-lg shadow-[#ff6b00]/20 active:scale-95"
        >
          Access Dept. Analytics <span className="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
      
      {/* Quick Links for HOD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/hod/students')}
          className="flex items-center justify-between p-6 bg-white hover:bg-gray-50 border border-gray-100 rounded-lg transition-all group cursor-pointer shadow-sm"
        >
          <div className="flex items-center text-left">
            <div className="p-3 bg-[#ff6b00]/10 rounded-lg mr-4 text-[#ff6b00]">
              <span className="material-symbols-outlined text-[24px]">group</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Student Directory</p>
              <p className="text-[11px] text-gray-500 font-medium">Manage departmental enrollments</p>
            </div>
          </div>
          <span className="material-symbols-outlined text-gray-400 group-hover:text-[#ff6b00] transition-colors">chevron_right</span>
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
    <div className="flex flex-col gap-10">
      <div className="mb-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Good day, {user?.name} 👋</h1>
        <p className="text-gray-500 font-medium mt-2">Your enrolled courses and pending feedback questionnaires.</p>
      </div>

      {/* Summary pills */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 text-amber-600 text-xs font-bold px-5 py-2.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[14px]">schedule</span> {pendingCount} Pending Evaluations
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-bold px-5 py-2.5 rounded-full shadow-sm">
          <span className="material-symbols-outlined text-[14px]">check_circle</span> {completedCount} Submissions Completed
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(n => <div key={n} className="h-48 bg-white animate-pulse rounded-lg border border-gray-100" />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-lg p-20 text-center shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-gray-200 mx-auto mb-4">school</span>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No courses identified in your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map(course => (
            <motion.div
              key={course.id}
              whileHover={{ y: -2 }}
              className="bg-white border border-gray-100 rounded-lg p-6 flex flex-col gap-6 shadow-sm group transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <span className="text-[10px] font-black bg-[#ff6b00]/10 text-[#ff6b00] border border-[#ff6b00]/20 px-3 py-1 rounded-md uppercase tracking-tighter">
                    {course.code}
                  </span>
                  <h2 className="text-lg font-bold text-gray-900 mt-3 truncate group-hover:text-[#ff6b00] transition-colors">{course.name}</h2>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-4 flex-shrink-0">
                  {course.pending_count > 0 && (
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-widest">
                      {course.pending_count} pending
                    </span>
                  )}
                  {course.completed_count > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase tracking-widest">
                      {course.completed_count} done
                    </span>
                  )}
                </div>
              </div>

              {/* TLFQs inside the course */}
              {(course.tlfqs || []).length > 0 && (
                <div className="flex flex-col gap-3">
                  {course.tlfqs.map(tlfq => (
                    <button
                      key={tlfq.id}
                      onClick={() => !tlfq.completed && navigate(`/courses/${course.id}/tlfq/${tlfq.id}`)}
                      disabled={tlfq.completed}
                      className={`flex items-center justify-between p-4 rounded-lg text-left transition-all border group/btn ${
                        tlfq.completed
                          ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-default opacity-60'
                          : 'bg-gray-50 border-gray-200 hover:border-[#ff6b00]/30 hover:bg-white text-gray-700 cursor-pointer shadow-sm active:scale-[0.99]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-gray-900 group-hover/btn:text-[#ff6b00] transition-colors">{tlfq.faculty_name}</div>
                        <div className="text-gray-500 text-[11px] mt-0.5 truncate font-medium uppercase tracking-wider">{tlfq.title}</div>
                      </div>
                      {tlfq.completed
                        ? <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                        : <span className="material-symbols-outlined text-[16px] text-gray-400 group-hover/btn:text-[#ff6b00] transition-all group-hover/btn:translate-x-1">arrow_forward</span>
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'hod') return <HODOverview />;
    return <StudentDashboard />;
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans selection:bg-[#ff6b00]/10 selection:text-[#ff6b00]">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex-1 flex flex-col ${isAdmin ? 'md:ml-64' : ''} min-w-0 transition-all duration-300`}>
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto w-full"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
