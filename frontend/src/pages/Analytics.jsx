import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Award, BarChart2, TrendingUp, BookOpen, Building2, MessageSquare, Star } from 'lucide-react';

const COLORS = ['#f15a24', '#1a2233', '#242f45', '#d94e1d', '#334155', '#94a3b8'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty');

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
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-6xl mx-auto">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <BarChart2 size={24} className="text-[#f15a24]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1a2233]">University Analytics</h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-12">Full visibility into all feedback data across departments.</p>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm self-start">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all cursor-pointer rounded-lg ${
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
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
                  <div className="h-12 w-12 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Compiling Analytics...</p>
                </div>
              ) : !data ? (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-20 text-center text-gray-400 font-black uppercase tracking-widest">No analytics data available.</div>
              ) : (
                <>
                  {/* FACULTY TAB */}
                  {activeTab === 'faculty' && (
                    <div className="flex flex-col gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                        <h3 className="text-sm font-black text-[#1a2233] mb-8 flex items-center gap-2 uppercase tracking-widest">
                          <TrendingUp size={16} className="text-[#f15a24]" /> Faculty Average Ratings (out of 7)
                        </h3>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.avgRatingPerFaculty} layout="vertical" margin={{ left: 20, right: 30 }}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                              <XAxis type="number" domain={[0, 7]} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                              <YAxis type="category" dataKey="name" tick={{ fill: '#1a2233', fontSize: 11, fontWeight: 700 }} width={160} />
                              <Tooltip
                                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                                formatter={v => [`${v}/7`, 'Avg. Rating']}
                              />
                              <Bar dataKey="avg_rating" radius={[0, 8, 8, 0]} barSize={24}>
                                {data.avgRatingPerFaculty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {data.avgRatingPerFaculty.map((f, i) => (
                          <div key={f.id} className="flex items-center gap-5 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:border-[#f15a24] transition-all group">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg ${i === 0 ? 'bg-[#f15a24]' : i === 1 ? 'bg-[#1a2233]' : i === 2 ? 'bg-[#242f45]' : 'bg-gray-200 text-gray-500'}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-black text-[#1a2233]">{f.name}</div>
                              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">{f.department_name} • {f.total_responses} responses</div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5">
                                <Star size={16} className="text-[#f15a24] fill-[#f15a24]" />
                                <span className={`text-xl font-black ${f.avg_rating >= 5 ? 'text-emerald-500' : f.avg_rating >= 3.5 ? 'text-[#f15a24]' : 'text-rose-500'}`}>
                                  {f.avg_rating.toFixed(1)}
                                </span>
                              </div>
                              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Rating / 7</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COURSES TAB */}
                  {activeTab === 'courses' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(data.submissionRates || []).map(c => (
                        <div key={c.course_id} className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm hover:border-[#f15a24] transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-12 -mt-12"></div>
                          <div className="flex items-center justify-between mb-6 relative z-10">
                            <div>
                              <span className="text-[10px] font-black bg-[#1a2233] text-white px-3 py-1 rounded-full uppercase tracking-widest">{c.course_code}</span>
                              <h4 className="text-sm font-black text-[#1a2233] mt-3">{c.course_name}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{c.department_name}</p>
                            </div>
                            <span className={`text-2xl font-black ${c.rate >= 70 ? 'text-emerald-500' : c.rate >= 40 ? 'text-[#f15a24]' : 'text-rose-500'}`}>{c.rate}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                            <div
                              className={`h-2 rounded-full shadow-sm transition-all duration-1000 ${c.rate >= 70 ? 'bg-emerald-500' : c.rate >= 40 ? 'bg-[#f15a24]' : 'bg-rose-500'}`}
                              style={{ width: `${c.rate}%` }}
                            />
                          </div>
                          <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                            <span>{c.enrolled} enrolled</span>
                            <span>{c.submitted} submitted</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* DEPARTMENTS TAB */}
                  {activeTab === 'departments' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {(data.deptOverview || []).map(dept => (
                        <div key={dept.id} className="bg-white border border-[#e2e8f0] rounded-2xl p-8 shadow-sm relative overflow-hidden group hover:border-[#f15a24] transition-all">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1a2233] group-hover:bg-[#f15a24] transition-colors"></div>
                          <div className="flex items-start justify-between mb-8">
                            <div>
                              <h3 className="text-lg font-black text-[#1a2233]">{dept.name}</h3>
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{dept.code}</span>
                            </div>
                            <div className="text-right">
                              <span className={`text-3xl font-black ${dept.avg_rating >= 5 ? 'text-emerald-500' : dept.avg_rating >= 3.5 ? 'text-[#f15a24]' : 'text-rose-500'}`}>
                                {dept.avg_rating.toFixed(1)}
                              </span>
                              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Average / 7</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            {[
                              { label: 'Courses', value: dept.course_count, icon: BookOpen },
                              { label: 'Faculty', value: dept.faculty_count, icon: User },
                              { label: 'Students', value: dept.student_count, icon: Users },
                            ].map(({ label, value, icon: Icon }) => (
                              <div key={label} className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                                <div className="text-lg font-black text-[#1a2233]">{value}</div>
                                <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{label}</div>
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
                      <div className="bg-[#1a2233] text-white rounded-2xl p-6 flex items-center gap-4 shadow-lg">
                        <div className="p-3 bg-white/10 rounded-xl">
                          <Shield size={24} className="text-[#f15a24]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest">Anonymity Guaranteed</h4>
                          <p className="text-xs text-gray-400 font-medium mt-1">All student comments are fully anonymous. No identity data is stored or displayed in the system.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(data.recentComments || []).map((c, i) => (
                          <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                            <p className="text-sm text-[#1a2233] font-medium leading-relaxed italic border-l-4 border-orange-200 pl-4">"{c.comment}"</p>
                            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-50">
                              <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-[#f15a24]">
                                <MessageSquare size={14} />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-[#1a2233] uppercase tracking-widest">{c.faculty_name}</p>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{c.course_name} • {new Date(c.submitted_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {(data.recentComments || []).length === 0 && (
                        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-20 text-center text-gray-400 font-black uppercase tracking-widest">No comments submitted yet.</div>
                      )}
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
