import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart2, Star, Users, BookOpen, Building2,
  MessageSquare, TrendingUp, Award, ChevronDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts';

const COLORS = ['#f15a24', '#1a2233', '#242f45', '#d94e1d', '#334155', '#94a3b8'];

function RatingBadge({ value, max = 7 }) {
  const pct = (value / max) * 100;
  const color = pct >= 70 ? 'text-emerald-500' : pct >= 50 ? 'text-[#f15a24]' : 'text-rose-500';
  return <span className={`text-2xl font-black ${color}`}>{value.toFixed(1)}<span className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-1">/ {max}</span></span>;
}

export default function HODDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    api.get('/responses/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'faculty', label: 'Faculty Rankings', icon: Award },
    { id: 'courses', label: 'Course Reports', icon: BookOpen },
    { id: 'comments', label: 'Feedback Insights', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-6xl mx-auto">

              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <BarChart2 size={24} className="text-[#f15a24]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1a2233]">Department Analytics</h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-12">
                  Feedback insights for your department — all data is fully anonymous.
                </p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm self-start">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-lg ${
                      activeTab === id
                        ? 'bg-[#1a2233] text-white shadow-md'
                        : 'text-gray-400 hover:text-[#1a2233] hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={14} className={activeTab === id ? 'text-[#f15a24]' : ''} /> {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1, 2, 3, 4].map(n => <div key={n} className="h-48 bg-white animate-pulse rounded-3xl border border-[#e2e8f0] shadow-sm" />)}
                </div>
              ) : !data ? (
                <div className="bg-white border border-[#e2e8f0] rounded-3xl p-20 text-center text-gray-400 font-black uppercase tracking-widest">No analytics data available.</div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="flex flex-col gap-8">
                      {(data.deptOverview || []).map(dept => (
                        <div key={dept.id} className="bg-white border border-[#e2e8f0] rounded-3xl p-10 shadow-sm relative overflow-hidden group hover:border-[#f15a24] transition-all">
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                          <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                          <div className="flex items-start justify-between mb-10">
                            <div>
                              <h3 className="text-xl font-black text-[#1a2233]">{dept.name}</h3>
                              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 mt-2 inline-block">{dept.code}</span>
                            </div>
                            <div className="text-right">
                              <RatingBadge value={dept.avg_rating} />
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Dept. Average</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                            {[
                              { icon: BookOpen, label: 'Active Courses', value: dept.course_count, color: 'text-orange-500' },
                              { icon: Award, label: 'Faculty Members', value: dept.faculty_count, color: 'text-navy-500' },
                              { icon: Users, label: 'Enrolled Students', value: dept.student_count, color: 'text-emerald-500' },
                            ].map(({ icon: Icon, label, value, color }) => (
                              <div key={label} className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center group/card hover:bg-white hover:shadow-md transition-all">
                                <Icon size={20} className="text-[#1a2233] mx-auto mb-3 group-hover/card:text-[#f15a24] transition-colors" />
                                <div className="text-2xl font-black text-[#1a2233]">{value}</div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(data.deptOverview || []).length === 0 && (
                        <div className="bg-white border border-[#e2e8f0] rounded-3xl p-20 text-center text-gray-400 font-black uppercase tracking-widest">
                          No department data found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* FACULTY TAB */}
                  {activeTab === 'faculty' && (
                    <div className="flex flex-col gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-3xl p-10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                        <h3 className="text-xs font-black text-[#1a2233] mb-10 flex items-center gap-2 uppercase tracking-[0.2em]">
                          <TrendingUp size={16} className="text-[#f15a24]" /> Faculty Performance Matrix
                        </h3>
                        {(data.avgRatingPerFaculty || []).length === 0 ? (
                          <p className="text-gray-400 text-xs font-black uppercase tracking-widest text-center py-20">No faculty data available yet.</p>
                        ) : (
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={data.avgRatingPerFaculty} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                <XAxis type="number" domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                <YAxis type="category" dataKey="name" tick={{ fill: '#1a2233', fontSize: 11, fontWeight: 700 }} width={160} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                  cursor={{ fill: '#f8fafc' }}
                                  formatter={(v) => [`${v}/7`, 'Avg. Rating']}
                                />
                                <Bar dataKey="avg_rating" radius={[0, 8, 8, 0]} barSize={24}>
                                  {(data.avgRatingPerFaculty || []).map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.avgRatingPerFaculty || []).map((f, i) => (
                          <div key={f.id} className="flex items-center gap-6 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm group hover:border-[#f15a24] transition-all">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${i === 0 ? 'bg-[#f15a24]' : i === 1 ? 'bg-[#1a2233]' : i === 2 ? 'bg-[#242f45]' : 'bg-gray-200 text-gray-500'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-black text-[#1a2233] text-sm">{f.name}</div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{f.total_responses} responses • {f.department_name}</div>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-2">
                                <Star size={18} className="text-[#f15a24] fill-[#f15a24]" />
                                <RatingBadge value={f.avg_rating} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COURSES TAB */}
                  {activeTab === 'courses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {(data.submissionRates || []).map(c => (
                        <div key={c.course_id} className="bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm hover:border-[#f15a24] transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-12 -mt-12 group-hover:bg-[#1a2233] transition-colors"></div>
                          <div className="flex items-center justify-between mb-8 relative z-10">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black bg-[#1a2233] text-white px-3 py-1 rounded-full uppercase tracking-widest group-hover:bg-[#f15a24] transition-colors">{c.course_code}</span>
                              </div>
                              <h4 className="text-base font-black text-[#1a2233] mt-3">{c.course_name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{c.department_name}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Submission Rate</span>
                            <span className={`text-xl font-black ${c.rate >= 70 ? 'text-emerald-500' : c.rate >= 40 ? 'text-[#f15a24]' : 'text-rose-500'}`}>
                              {c.rate}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner mb-6">
                            <div
                              className={`h-2 rounded-full transition-all duration-1000 ${c.rate >= 70 ? 'bg-emerald-500' : c.rate >= 40 ? 'bg-[#f15a24]' : 'bg-rose-500'}`}
                              style={{ width: `${c.rate}%` }}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <div className="text-lg font-black text-[#1a2233]">{c.enrolled}</div>
                              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Enrolled</div>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                              <div className="text-lg font-black text-[#1a2233]">{c.submitted}</div>
                              <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Submitted</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COMMENTS TAB */}
                  {activeTab === 'comments' && (
                    <div className="flex flex-col gap-8">
                      <div className="bg-[#1a2233] text-white rounded-2xl p-8 flex items-center gap-6 shadow-xl shadow-slate-900/10">
                        <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#f15a24] border border-white/10">
                          <Shield size={32} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-[0.2em]">Full Anonymity Protocol</h4>
                          <p className="text-xs text-gray-400 font-medium mt-1 leading-relaxed">All student comments are strictly decoupled from identity data. No PII is stored or exposed within the department dashboards.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(data.recentComments || []).length === 0 ? (
                          <div className="bg-white border border-[#e2e8f0] rounded-3xl p-20 text-center text-gray-400 font-black uppercase tracking-widest col-span-2">No comments submitted yet.</div>
                        ) : (
                          (data.recentComments || []).map((c, i) => (
                            <div key={i} className="bg-white border border-[#e2e8f0] rounded-3xl p-8 shadow-sm hover:shadow-md transition-all group">
                              <div className="h-1 w-12 bg-orange-100 group-hover:bg-[#f15a24] transition-colors mb-6 rounded-full"></div>
                              <p className="text-sm text-[#1a2233] italic font-medium leading-relaxed mb-8">"{c.comment}"</p>
                              <div className="flex items-center gap-4 pt-6 border-t border-gray-50">
                                <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#f15a24]">
                                  <MessageSquare size={16} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-[#1a2233] uppercase tracking-widest">{c.faculty_name}</p>
                                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{c.course_name} • {new Date(c.submitted_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
