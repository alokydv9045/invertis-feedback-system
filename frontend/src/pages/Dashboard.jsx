import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, BookOpen, Building2, BarChart2,
  ArrowRight, CheckCircle2, Clock, ClipboardList, Shield, PlusCircle, Zap, User, Search, Settings
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const renderContent = () => {
    if (user?.role === 'admin') return <AdminDashboard />;
    if (user?.role === 'hod') return <HODOverview />;
    return <StudentDashboard />;
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/tlfq/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2233]">System Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Management overview for Invertis Feedback System</p>
        </div>
        <button onClick={() => navigate('/admin/courses')} className="bg-gradient-to-r from-[#f15a24] to-[#d94e1d] hover:shadow-lg hover:shadow-orange-500/30 text-white font-bold py-2.5 px-8 rounded transition-all active:scale-95 flex items-center gap-2 text-sm uppercase tracking-wider">
          <PlusCircle size={18} /> New Evaluation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats?.totalStudents, icon: Users, color: 'text-[#1a2233]', bg: 'bg-blue-50' },
          { label: 'Total Courses', value: stats?.totalCourses, icon: BookOpen, color: 'text-[#f15a24]', bg: 'bg-orange-50' },
          { label: 'Completion Rate', value: `${stats?.completionRate || 0}%`, icon: BarChart2, color: 'text-emerald-500' },
          { label: 'Active TLFQs', value: stats?.totalTlfqs, icon: ClipboardList, color: 'text-indigo-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6 flex items-center gap-4">
            <div className={`h-12 w-12 rounded-lg ${s.bg || 'bg-[#f5f7fa]'} flex items-center justify-center ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{s.label}</p>
              <p className="text-2xl font-bold text-[#1a2233] mt-1">{s.value ?? '—'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#e2e8f0] bg-[#f5f7fa]/50 flex justify-between items-center">
            <h3 className="font-bold text-[#1a2233]">System Management</h3>
            <Search size={16} className="text-gray-400" />
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Faculty Management', desc: 'Manage instructor records', path: '/admin/directory', icon: Users },
              { label: 'Evaluation Reports', desc: 'Detailed analytics per course', path: '/admin/analytics', icon: BarChart2 },
              { label: 'Department Setup', desc: 'Structure university hierarchy', path: '/admin/directory', icon: Building2 },
              { label: 'System Settings', desc: 'Configure global parameters', path: '/admin/settings', icon: Settings },
            ].map((action, i) => (
              <div 
                key={i} 
                onClick={() => navigate(action.path)}
                className="p-5 border border-[#e2e8f0] rounded-lg hover:border-[#2d3fe0] hover:bg-[#f5f7fa] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-[#f5f7fa] flex items-center justify-center text-gray-400 group-hover:text-[#f15a24] group-hover:bg-orange-50 transition-all">
                    <action.icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1a2233]">{action.label}</p>
                    <p className="text-[10px] text-gray-500 mt-1">{action.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
          <h3 className="font-bold text-[#1a2233] mb-6">Recent System Activity</h3>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#1a2233]">New Evaluation Created</p>
                  <p className="text-[10px] text-gray-500 mt-1">HOD CSE created evaluation for Semester 4.</p>
                  <p className="text-[9px] text-gray-400 mt-1 font-bold">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function HODOverview() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2233]">Department Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of department feedback metrics</p>
        </div>
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-12 text-center flex flex-col items-center">
        <div className="h-20 w-20 bg-orange-50 rounded-full flex items-center justify-center text-[#f15a24] mb-6 shadow-inner">
          <BarChart2 size={40} />
        </div>
        <h2 className="text-xl font-bold text-[#1a2233]">Department Analytics</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md">View detailed performance reports of faculty members and courses in your department.</p>
        <button onClick={() => navigate('/hod/analytics')} className="bg-gradient-to-r from-[#1a2233] to-[#242f45] hover:from-[#f15a24] hover:to-[#d94e1d] text-white font-bold py-3 px-10 rounded-lg transition-all shadow-md active:scale-95 mt-8 uppercase tracking-widest text-xs">
          Launch Analytics Hub
        </button>
      </div>
    </div>
  );
}

function StudentDashboard() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tlfq/courses').then(r => setCourses(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1a2233]">Student Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Access your evaluation portal and feedback history</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-bold text-[#1a2233]">Semester 4</p>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Active session</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Faculty Performance', desc: 'Evaluate teaching methodologies, communication, and overall engagement.', icon: Users },
          { label: 'Curriculum Feedback', desc: 'Provide insights on syllabus relevance, study materials, and practical application.', icon: ClipboardList },
          { label: 'Infrastructure', desc: 'Report issues or suggest improvements for campus facilities, labs, and library.', icon: Building2 },
        ].map((card, i) => (
          <div key={i} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-8 flex flex-col group hover:border-[#f15a24] transition-all cursor-pointer relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-[#f15a24]/10 transition-colors"></div>
            <div className="h-12 w-12 rounded bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#1a2233] group-hover:bg-[#f15a24] group-hover:text-white transition-all mb-6 relative z-10">
              <card.icon size={24} />
            </div>
            <h3 className="text-lg font-bold text-[#1a2233] mb-3">{card.label}</h3>
            <p className="text-xs text-gray-500 leading-relaxed font-medium">{card.desc}</p>
            <div className="mt-8 flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#f15a24]">
              Begin Evaluation <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-lg shadow-sm">
          <div className="p-6 border-b border-[#e2e8f0] flex justify-between items-center">
            <h3 className="font-bold text-[#1a2233]">Pending Evaluations</h3>
            <span className="text-[10px] font-black bg-[#f15a24] text-white px-2 py-1 rounded">Action Required</span>
          </div>
          <div className="p-0">
            {loading ? (
              <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading course data...</div>
            ) : courses.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">No active evaluations</div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="p-6 border-b border-[#e2e8f0] last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-black text-[#f15a24] uppercase tracking-widest mb-1">{course.code}</p>
                      <h4 className="text-sm font-bold text-[#1a2233]">{course.name}</h4>
                    </div>
                    <div className="flex flex-col gap-2 min-w-[200px]">
                      {(course.tlfqs || []).map(tlfq => (
                        <button
                          key={tlfq.id}
                          onClick={() => !tlfq.completed && navigate(`/courses/${course.id}/tlfq/${tlfq.id}`)}
                          className={`flex items-center justify-between px-4 py-2 rounded text-[11px] font-bold border transition-all ${
                            tlfq.completed
                              ? 'bg-gray-50 text-gray-400 border-gray-100'
                              : 'bg-white text-[#f15a24] border-[#f15a24]/20 hover:border-[#f15a24] hover:bg-[#f15a24] hover:text-white'
                          }`}
                        >
                          <span>{tlfq.faculty_name}</span>
                          {tlfq.completed ? <CheckCircle2 size={12} /> : <ArrowRight size={12} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[#1a2233]">Recent Activity</h3>
            <span className="text-[10px] font-bold text-gray-400 underline cursor-pointer">View All</span>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-[#e2e8f0]/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-white border border-[#e2e8f0] flex items-center justify-center">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1a2233]">Prof. A. Sharma</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Feedback Completed</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold text-gray-400">Oct 12, 2024</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
