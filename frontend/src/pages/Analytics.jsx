import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Award, BarChart2, TrendingUp, BookOpen, Building2, MessageSquare, Star, Users, GraduationCap } from 'lucide-react';

const COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/responses/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'faculty', label: 'Faculty Rankings', icon: Award },
    { id: 'courses', label: 'Course Reports', icon: BookOpen },
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'comments', label: 'Feedback Insights', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#ff6b00]/10 text-[#ff6b00] rounded-lg">
                  <span className="material-symbols-outlined text-[24px]">leaderboard</span>
                </div>
                <h1 className="text-3xl font-black text-[#1A1A1A]">University Analytics</h1>
              </div>
              <p className="text-sm text-[#474747] font-medium ml-12">Full visibility into all feedback data across departments.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#e0e0e0] flex-wrap overflow-x-auto no-scrollbar">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-6 py-4 text-xs font-black border-b-2 transition -mb-px cursor-pointer uppercase tracking-widest ${
                    activeTab === id
                      ? 'border-[#ff6b00] text-[#ff6b00]'
                      : 'border-transparent text-[#474747] hover:text-[#1A1A1A]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-24 flex flex-col items-center gap-4 shadow-sm">
                <div className="h-12 w-12 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#474747] animate-pulse">Aggregating Data...</span>
              </div>
            ) : !data ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-20 text-center text-slate-500 dark:text-slate-400 font-bold shadow-sm">No analytics data available yet.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* FACULTY TAB */}
                {activeTab === 'faculty' && (
                  <div className="flex flex-col gap-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                      <h3 className="text-sm font-black text-slate-900 dark:text-slate-200 mb-8 flex items-center gap-3 uppercase tracking-wider">
                        <TrendingUp size={18} className="text-indigo-500" /> Faculty Average Ratings (out of 7)
                      </h3>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.avgRatingPerFaculty} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} stroke="#cbd5e1" />
                            <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} width={140} stroke="#cbd5e1" />
                            <Tooltip
                              contentStyle={{ 
                                backgroundColor: '#1e293b', 
                                border: 'none', 
                                borderRadius: 16, 
                                color: '#f1f5f9',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                              }}
                              itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                              formatter={v => [`${v}/7`, 'Avg. Rating']}
                            />
                            <Bar dataKey="avg_rating" radius={[0, 10, 10, 0]} barSize={24}>
                              {data.avgRatingPerFaculty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {data.avgRatingPerFaculty.map((f, i) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 rounded-[2.5rem] p-7 transition-all shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 relative overflow-hidden"
                        >
                          <div className="flex items-center gap-6">
                            <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl transform group-hover:scale-110 transition-transform duration-500 ${
                              i === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600' : 
                              i === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' : 
                              i === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-700' : 
                              'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-slate-900 dark:text-white text-lg truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{f.name}</h3>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black truncate uppercase tracking-[0.1em] mt-1.5">{f.department_name}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-1.5">
                                <Star size={18} className="text-amber-400 fill-amber-400" />
                                <span className={`text-2xl font-black ${f.avg_rating >= 5 ? 'text-emerald-500' : f.avg_rating >= 3.5 ? 'text-amber-500' : 'text-rose-500'}`}>
                                  {f.avg_rating.toFixed(1)}
                                </span>
                                <span className="text-xs text-slate-400 font-bold">/ 7.0</span>
                             </div>
                             <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{f.total_responses} Samples</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* COURSES TAB */}
                {activeTab === 'courses' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data.submissionRates || []).map(c => (
                      <div key={c.course_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm group">
                        <div className="flex items-start justify-between mb-6">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/30 uppercase tracking-tighter">{c.course_code}</span>
                              <h4 className="text-base font-black text-slate-900 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{c.course_name}</h4>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">{c.department_name}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className={`text-3xl font-black ${c.rate >= 70 ? 'text-emerald-500' : c.rate >= 40 ? 'text-amber-500' : 'text-rose-500'}`}>{c.rate}%</span>
                            <div className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Submission Rate</div>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.rate}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${c.rate >= 70 ? 'bg-emerald-500' : c.rate >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          />
                        </div>
                        <div className="flex gap-6 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50 text-[10px] font-black uppercase tracking-[0.1em]">
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                             <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                             <span>{c.enrolled} Enrolled</span>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                             <div className="h-2 w-2 rounded-full bg-indigo-500" />
                             <span>{c.submitted} Received</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* DEPARTMENTS TAB */}
                {activeTab === 'departments' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {(data.deptOverview || []).map(dept => (
                      <div key={dept.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                           <Building2 size={120} />
                        </div>
                        <div className="flex items-start justify-between mb-10 relative z-10">
                          <div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{dept.name}</h3>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 rounded-lg border border-indigo-100 dark:border-indigo-800/30 uppercase tracking-widest">{dept.code}</span>
                          </div>
                          <div className="text-right">
                             <div className={`text-4xl font-black ${dept.avg_rating >= 5 ? 'text-emerald-500' : dept.avg_rating >= 3.5 ? 'text-amber-500' : 'text-rose-500'}`}>
                                {dept.avg_rating.toFixed(1)}
                             </div>
                             <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Average Unit Rating</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-6 relative z-10">
                          {[
                            { label: 'Courses', value: dept.course_count, icon: BookOpen },
                            { label: 'Faculty', value: dept.faculty_count, icon: Users },
                            { label: 'Students', value: dept.student_count, icon: GraduationCap },
                          ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-5 group-hover:border-indigo-500/20 transition-all">
                              <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-2">
                                 <Icon size={14} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                              </div>
                              <div className="text-2xl font-black text-slate-900 dark:text-slate-200">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* COMMENTS TAB */}
                {activeTab === 'comments' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 rounded-2xl p-5 flex items-center gap-4 text-xs font-bold text-amber-700 dark:text-amber-400">
                      <div className="h-10 w-10 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center shrink-0">
                         <MessageSquare size={20} />
                      </div>
                      All student comments are strictly anonymous. System protocols ensure zero identity tracking for subjective responses.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(data.recentComments || []).map((c, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all"
                        >
                          <div className="flex items-center gap-2 mb-6">
                             <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                             <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{c.faculty_name}</span>
                          </div>
                          <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed font-medium">"{c.comment}"</p>
                          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                            <span className="truncate max-w-[150px]">{c.course_name}</span>
                            <span>{new Date(c.submitted_at).toLocaleDateString()}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {(data.recentComments || []).length === 0 && (
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-20 text-center shadow-sm">
                         <MessageSquare size={48} className="text-slate-200 dark:text-slate-700 mx-auto mb-6" />
                         <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No feedback narratives received yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
