import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, CartesianGrid
} from 'recharts';
import { 
  Award, BarChart2, TrendingUp, BookOpen, MessageSquare, 
  Star, Filter, LayoutGrid, Users, CheckCircle, Activity 
} from 'lucide-react';

const COLORS = ['#0F2D52', '#1D4E89', '#3B6EA5', '#10B981', '#F59E0B', '#C62828'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty');
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [teacherTypeFilter, setTeacherTypeFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const url = selectedDeptId === 'all' ? '/responses/analytics' : `/responses/analytics?department_id=${selectedDeptId}`;
    api.get(url)
      .then(r => setData(r.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [selectedDeptId]);

  const filteredAvgRatingPerFaculty = teacherTypeFilter === 'all'
    ? (data?.avgRatingPerFaculty || [])
    : (data?.avgRatingPerFaculty || []).filter(f => f.teacher_type === teacherTypeFilter);

  const tabs = [
    { id: 'faculty', label: 'Faculty Rankings', icon: Award },
    { id: 'performance', label: 'Attribute Analysis', icon: Activity },
    { id: 'engagement', label: 'Department Overview', icon: Users },
    { id: 'trends', label: 'Submission Trends', icon: TrendingUp },
    { id: 'courses', label: 'Course Reports', icon: BookOpen },
    { id: 'comments', label: 'Feedback Insights', icon: MessageSquare },
  ];

  // Quick Stats
  const totalSubmissions = data?.avgRatingPerFaculty?.reduce((s, f) => s + f.total_responses, 0) || 0;
  const avgSystemRating = data?.avgRatingPerFaculty?.length > 0 
    ? (data.avgRatingPerFaculty.reduce((s, f) => s + f.avg_rating, 0) / data.avgRatingPerFaculty.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-primary-500/30">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-5 md:p-7 overflow-auto">

          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />

          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 relative z-10 max-w-7xl mx-auto w-full">

            {/* Header Area */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 card-main">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                    <BarChart2 size={20} className="text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-black text-[#1D3557]">
                  System Intelligence
                  </h1>
                </div>
                <p className="text-sm text-slate-600 font-medium ml-1">Advanced multi-dimensional feedback analytics.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                <div className="flex items-center gap-3 p-1.5 rounded-2xl border border-[#E6E9EE] w-full md:w-auto">
                  <div className="pl-3 text-slate-500"><Filter size={16} /></div>
                  <select
                    value={selectedDeptId}
                    onChange={e => setSelectedDeptId(e.target.value)}
                    className="bg-transparent pl-1 pr-10 py-2.5 text-sm font-bold text-[var(--text-main)] focus:outline-none cursor-pointer appearance-none w-full md:w-52"
                    style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2364748b%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
                  >
                    <option value="all" className="bg-white dark:bg-slate-900">All Departments</option>
                    {data?.deptOverview?.map(d => (
                      <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900">{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1 p-1.5 rounded-2xl border border-[#E6E9EE] flex-wrap w-full md:w-auto">
                  {[['all', 'All'], ['college_faculty', 'Faculty'], ['trainer', 'Trainer']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setTeacherTypeFilter(val)}
                      className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex-1 md:flex-initial text-center ${teacherTypeFilter === val
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                          : 'text-slate-600 hover:text-[var(--text-main)] hover:bg-black/5'
                        }`}> 
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Insight Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Responses', value: totalSubmissions, icon: MessageSquare, color: 'text-primary-400', bg: 'bg-primary-500/10' },
                { label: 'Avg Rating', value: avgSystemRating, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Active Courses', value: data?.submissionRates?.length || 0, icon: BookOpen, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Engagement', value: (data?.submissionRates?.length || 0) > 0 ? ((data.submissionRates || []).reduce((s, c) => s + (c.rate || 0), 0) / (data?.submissionRates?.length || 1)).toFixed(0) + '%' : '0%', icon: TrendingUp, color: 'text-primary-400', bg: 'bg-primary-500/10' },
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02, y: -5, borderColor: 'rgba(99, 102, 241, 0.4)' }}
                  transition={{ delay: i * 0.1, duration: 0.2 }}
                  key={stat.label} 
                  className="card-main p-6 flex items-center gap-4 shadow transition-colors cursor-default"
                >
                  <div className={`h-12 w-12 ${stat.bg} rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{stat.label}</div>
                    <div className="text-2xl font-black text-[#1D3557] truncate">{stat.value}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {loading ? (
              <div className="card-main p-16 flex justify-center">
                <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin shadow-primary-500/20" />
              </div>
            ) : !data ? (
              <div className="card-main p-16 text-center text-slate-600 font-medium">No analytics data available.</div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Tabs */}
                <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-1 rounded-2xl w-full sm:w-fit bg-transparent pb-2">
                  {tabs.map(({ id, label, icon: Icon }) => (
                    <motion.button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${activeTab === id
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                          : 'text-slate-600 hover:text-[var(--text-main)] hover:bg-black/5'
                        }`}
                    >
                      <Icon size={16} /> {label}
                    </motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* FACULTY TAB */}
                    {activeTab === 'faculty' && (
                      <div className="flex flex-col gap-6">
                        <div className="card-main p-8">
                          <h3 className="text-base font-black text-[#1D3557] mb-6 flex items-center gap-2">
                            <TrendingUp size={18} className="text-primary-400" /> Leaderboard Rankings (out of 7)
                          </h3>
                          {filteredAvgRatingPerFaculty.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                              <BarChart2 size={40} className="mb-3 text-slate-700" />
                              <p className="text-sm font-medium">No feedback data yet for this selection.</p>
                            </div>
                          ) : (
                            <div style={{ height: Math.max(300, filteredAvgRatingPerFaculty.length * 52) + 'px' }}>
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={filteredAvgRatingPerFaculty} layout="vertical" margin={{ left: 10, right: 30 }}>
                                  <XAxis type="number" domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                                  <YAxis type="category" dataKey="name" tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }} width={160} axisLine={false} tickLine={false} />
                                  <Tooltip
                                    cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 16, color: '#f8fafc', fontWeight: 600, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                                    formatter={v => [`${v}/7`, 'Avg. Rating']}
                                  />
                                  <Bar dataKey="avg_rating" radius={[0, 8, 8, 0]} barSize={28}>
                                    {filteredAvgRatingPerFaculty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* ATTRIBUTE ANALYSIS TAB */}
                    {activeTab === 'performance' && (
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-3 card-main p-8">
                          <h3 className="text-base font-black text-[#1D3557] mb-6 flex items-center gap-2">
                            <Activity size={18} className="text-primary-400" /> Attribute Breakdown
                          </h3>
                          <div style={{ height: '400px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data?.attributeAnalytics || []}>
                                <PolarGrid stroke="#334155" />
                                <PolarAngleAxis dataKey="attribute" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 10 }} />
                                <Radar
                                  name="Score"
                                  dataKey="score"
                                  stroke="#0F2D52"
                                  fill="#1D4E89"
                                  fillOpacity={0.5}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                        <div className="lg:col-span-2 flex flex-col gap-4">
                          {(data?.attributeAnalytics || []).map((attr, i) => (
                            <div key={i} className="card-main p-4 flex justify-between items-center">
                              <span className="text-sm font-bold text-[#1D3557]">{attr.full_text}</span>
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(attr.score / 7) * 100}%` }} />
                                </div>
                                <span className="text-sm font-black text-[#1D3557]">{attr.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* DEPARTMENT OVERVIEW TAB */}
                    {activeTab === 'engagement' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(data?.deptOverview || []).map((d, i) => (
                          <div key={d.id} className="card-main p-6 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                              <div className="h-12 w-12 bg-slate-950/50 rounded-2xl flex items-center justify-center border border-slate-800">
                                <LayoutGrid size={20} className={COLORS[i % COLORS.length]} />
                              </div>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${d.portal_open ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-accent-500/10 text-accent-400 border border-accent-500/20'}`}>
                                {d.portal_open ? 'Portal Open' : 'Portal Closed'}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-[#1D3557]">{d.name}</h4>
                              <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-widest">{d.code}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-2 p-4 rounded-2xl border border-[#E6E9EE] bg-white/5">
                              <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Avg Rating</p>
                                <p className="text-lg font-black text-[#1D3557] flex items-center gap-1.5">
                                  <Star size={14} className="text-amber-400 fill-amber-400" /> {d.avg_rating}
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black mb-1">Faculty</p>
                                <p className="text-lg font-black text-[#1D3557]">{d.faculty_count}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TRENDS TAB */}
                    {activeTab === 'trends' && (
                      <div className="card-main p-8">
                        <h3 className="text-base font-black text-[#1D3557] mb-6 flex items-center gap-2">
                          <Activity size={18} className="text-primary-400" /> Submission Volume Trends
                        </h3>
                        {data?.timelineData?.length === 0 ? (
                           <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400 text-center">
                            <Activity size={40} className="mb-3 text-slate-700" />
                            <p className="text-sm font-medium">Not enough historical data to show trends.</p>
                          </div>
                        ) : (
                          <div style={{ height: '350px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={data?.timelineData || []}>
                                <defs>
                                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1D4E89" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#1D4E89" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 12, fontSize: 12 }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#1D4E89" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                    )}

                    {/* COURSES TAB */}
                    {activeTab === 'courses' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {(data?.submissionRates || []).map(c => (
                          <div key={c.course_id} className="card-main p-6 flex flex-col justify-between hover:border-primary-500/30 transition-all group">
                            <div>
                              <div className="flex items-start justify-between mb-4">
                                <div className="pr-4">
                                  <span className="inline-block text-[10px] font-black bg-primary-500/10 text-primary-400 px-2 py-0.5 rounded-md border border-primary-500/20 mb-2 tracking-widest uppercase">{c.course_code}</span>
                                  <h4 className="text-base font-black text-[#1D3557] leading-tight group-hover:text-primary-300 transition-colors">{c.course_name}</h4>
                                </div>
                                <span className={`text-xl font-black ${c.rate >= 70 ? 'text-emerald-400' : c.rate >= 40 ? 'text-amber-400' : 'text-accent-400'}`}>{c.rate}%</span>
                              </div>
                              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-4 shadow-inner">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${c.rate}%` }}
                                  transition={{ duration: 1, ease: 'easeOut' }}
                                  className={`h-full rounded-full ${c.rate >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : c.rate >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-accent-500 to-accent-400'}`}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black text-slate-600 bg-white/5 p-3 rounded-2xl border border-[#E6E9EE]">
                              <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest mb-0.5">Enrolled</span>
                                <span className="text-[#1D3557]">{c.enrolled}</span>
                              </div>
                              <div className="w-px h-6 bg-slate-700" />
                              <div className="flex flex-col">
                                <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest mb-0.5">Responses</span>
                                <span className="text-[#1D3557]">{c.submitted}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* COMMENTS TAB */}
                    {activeTab === 'comments' && (
                      <div className="flex flex-col gap-4">
                        <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-4 flex items-center gap-3 text-sm text-primary-300 font-medium">
                          <MessageSquare size={18} className="text-primary-400 flex-shrink-0" />
                          Student feedback is rigorously anonymized. No identifying details are exposed here.
                        </div>
                        {data?.recentComments?.length === 0 ? (
                          <div className="card-main p-12 text-center text-slate-600 font-medium">No comments submitted yet for this selection.</div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(data?.recentComments || []).map((c, i) => (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={i} 
                                className="card-main p-6 flex flex-col relative overflow-hidden group"
                              >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                  <MessageSquare size={40} className="text-primary-500" />
                                </div>
                                <p className="text-base text-[#1D3557] italic leading-relaxed mb-6 flex-1 relative z-10">"{c.comment}"</p>
                                <div className="pt-4 border-t border-slate-800/60 flex flex-col gap-1.5 relative z-10">
                                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-bold">
                                    <span className="text-primary-400 font-black">{c.faculty_name}</span>
                                    <span className="text-slate-700">•</span>
                                    <span className="text-slate-500 dark:text-slate-400">{c.course_name}</span>
                                  </div>
                                  <div className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                    Submitted on {new Date(c.submitted_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
