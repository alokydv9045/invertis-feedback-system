import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#ff6b00', '#1A1A1A', '#474747', '#ff8533', '#2d2d2d'];

export default function HODDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/responses/analytics')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'domain' },
    { id: 'faculty', label: 'Faculty Rankings', icon: 'award' },
    { id: 'courses', label: 'Course Reports', icon: 'menu_book' },
    { id: 'comments', label: 'Feedback Insights', icon: 'forum' },
  ];

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-7xl mx-auto w-full">

            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#ff6b00] text-[28px]">analytics</span>
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Department Portal</h1>
              </div>
              <p className="text-xs font-bold text-[#474747] uppercase tracking-[0.2em] opacity-60">
                Departmental Control Center • Real-time Feedback Stream
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-[#e0e0e0] flex-wrap overflow-x-auto no-scrollbar pt-4">
              {tabs.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-6 py-4 text-[11px] font-black border-b-2 transition -mb-px cursor-pointer uppercase tracking-widest ${
                    activeTab === id
                      ? 'border-[#ff6b00] text-[#ff6b00]'
                      : 'border-transparent text-[#474747] opacity-40 hover:opacity-100 hover:text-[#1A1A1A]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{icon}</span> {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map(n => <div key={n} className="h-44 bg-[#f9f9f9] animate-pulse rounded-[16px] border border-[#e0e0e0]" />)}
              </div>
            ) : !data ? (
              <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-20 text-center text-[#474747] font-bold shadow-sm">No analytics available for this department.</div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <div className="flex flex-col gap-8">
                    {(data.deptOverview || []).map(dept => (
                      <div key={dept.id} className="bg-white border border-[#e0e0e0] rounded-[16px] p-8 shadow-sm group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                           <span className="material-symbols-outlined text-[160px]">domain</span>
                        </div>
                        <div className="flex items-start justify-between mb-10 relative z-10">
                          <div>
                            <h3 className="text-2xl font-black text-[#1A1A1A] mb-3">{dept.name}</h3>
                            <span className="text-[10px] font-black text-[#ff6b00] bg-[#ff6b00]/5 px-4 py-1.5 rounded-lg border border-[#ff6b00]/10 uppercase tracking-widest">{dept.code}</span>
                          </div>
                          <div className="text-right">
                             <div className={`text-5xl font-black ${dept.avg_rating >= 5 ? 'text-[#ff6b00]' : dept.avg_rating >= 3.5 ? 'text-[#1A1A1A]' : 'text-[#b3261e]'}`}>
                                {dept.avg_rating.toFixed(1)}
                                <span className="text-[10px] text-[#474747] font-black uppercase ml-2 tracking-widest opacity-40">Avg Rating</span>
                             </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                          {[
                            { icon: 'menu_book', label: 'Course Modules', value: dept.course_count, color: 'text-[#ff6b00]' },
                            { icon: 'award', label: 'Faculty Records', value: dept.faculty_count, color: 'text-[#1A1A1A]' },
                            { icon: 'group', label: 'Enrolled Students', value: dept.student_count, color: 'text-[#ff6b00]' },
                          ].map(({ icon, label, value, color }) => (
                            <div key={label} className="bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl p-6 group-hover:border-[#ff6b00]/20 transition-all text-center">
                              <span className={`material-symbols-outlined ${color} mb-3 text-[24px]`}>{icon}</span>
                              <div className="text-2xl font-black text-[#1A1A1A]">{value}</div>
                              <div className="text-[10px] font-black text-[#474747] uppercase tracking-widest mt-2 opacity-50">{label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {(data.deptOverview || []).length === 0 && (
                      <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-20 text-center">
                        <span className="material-symbols-outlined text-[48px] text-[#e0e0e0] mb-6">domain_disabled</span>
                        <p className="text-[#474747] font-bold uppercase tracking-widest text-[10px] opacity-40">No active departmental records.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* FACULTY TAB */}
                {activeTab === 'faculty' && (
                  <div className="flex flex-col gap-8">
                    <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-8 shadow-sm">
                      <h3 className="text-[11px] font-black text-[#1A1A1A] mb-8 flex items-center gap-3 uppercase tracking-wider">
                        <span className="material-symbols-outlined text-[#ff6b00] text-[18px]">trending_up</span> Faculty Performance Ranking
                      </h3>
                      {(data.avgRatingPerFaculty || []).length === 0 ? (
                        <div className="p-12 text-center text-[#474747] font-bold uppercase text-[10px] tracking-widest opacity-40">No evaluation data recorded for faculty.</div>
                      ) : (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.avgRatingPerFaculty} layout="vertical" margin={{ left: 10, right: 30 }}>
                              <XAxis type="number" domain={[0, 7]} tick={{ fill: '#474747', fontSize: 10, fontWeight: '900' }} stroke="#e0e0e0" />
                              <YAxis type="category" dataKey="name" tick={{ fill: '#474747', fontSize: 10, fontWeight: '900' }} width={140} stroke="#e0e0e0" />
                              <Tooltip
                                cursor={{ fill: '#f5f5f5' }}
                                contentStyle={{ 
                                  backgroundColor: '#1A1A1A', 
                                  border: 'none', 
                                  borderRadius: 12, 
                                  color: '#fff',
                                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ color: '#ff6b00', fontWeight: '900', fontSize: '12px' }}
                                labelStyle={{ color: '#fff', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                                formatter={(v) => [`${v}/7`, 'Avg. Rating']}
                              />
                              <Bar dataKey="avg_rating" radius={[0, 8, 8, 0]} barSize={20}>
                                {(data.avgRatingPerFaculty || []).map((_, i) => (
                                  <Cell key={i} fill={i % 2 === 0 ? '#ff6b00' : '#1A1A1A'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(data.avgRatingPerFaculty || []).map((f, i) => (
                        <motion.div
                          key={f.id}
                          initial={{ opacity: 0, scale: 0.98 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          className="group bg-white border border-[#e0e0e0] hover:border-[#ff6b00]/30 rounded-[16px] p-7 transition-all shadow-sm hover:shadow-xl relative overflow-hidden"
                        >
                          <div className="flex items-center gap-6">
                            <div className={`h-14 w-14 rounded-xl flex items-center justify-center text-xl font-black text-white shadow-lg transform group-hover:scale-105 transition-transform duration-500 ${
                              i === 0 ? 'bg-[#ff6b00]' : 
                              i === 1 ? 'bg-[#1A1A1A]' : 
                              i === 2 ? 'bg-[#474747]' : 
                              'bg-[#f1f1f1] text-[#474747] border border-[#e0e0e0]'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-[#1A1A1A] text-lg truncate group-hover:text-[#ff6b00] transition-colors">{f.name}</h3>
                              <div className="text-[10px] text-[#474747] font-black truncate uppercase tracking-[0.1em] mt-1.5 opacity-50">{f.total_responses} Evaluation Samples</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#f5f5f5]">
                             <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#ff6b00] text-[18px]">star</span>
                                <span className={`text-2xl font-black ${f.avg_rating >= 5 ? 'text-[#ff6b00]' : f.avg_rating >= 3.5 ? 'text-[#1A1A1A]' : 'text-[#b3261e]'}`}>
                                  {f.avg_rating.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-[#474747] font-black uppercase tracking-widest opacity-40 ml-1">Rating</span>
                             </div>
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
                      <div key={c.course_id} className="bg-white border border-[#e0e0e0] rounded-[16px] p-8 shadow-sm group">
                        <div className="flex items-start justify-between mb-6">
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-[10px] font-black bg-[#ff6b00]/5 text-[#ff6b00] px-3 py-1 rounded-lg border border-[#ff6b00]/10 uppercase tracking-tighter">{c.course_code}</span>
                              <h4 className="text-base font-black text-[#1A1A1A] truncate group-hover:text-[#ff6b00] transition-colors">{c.course_name}</h4>
                            </div>
                            <p className="text-[10px] text-[#474747] font-black uppercase tracking-widest opacity-50">{c.department_name}</p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <span className={`text-3xl font-black ${c.rate >= 70 ? 'text-[#ff6b00]' : c.rate >= 40 ? 'text-[#1A1A1A]' : 'text-[#b3261e]'}`}>{c.rate}%</span>
                            <div className="text-[9px] font-black text-[#474747] uppercase tracking-widest mt-1 opacity-40">Submission Rate</div>
                          </div>
                        </div>
                        <div className="w-full bg-[#f1f1f1] rounded-full h-2.5 overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${c.rate}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className={`h-full rounded-full ${c.rate >= 70 ? 'bg-[#ff6b00]' : c.rate >= 40 ? 'bg-[#1A1A1A]' : 'bg-[#b3261e]'}`}
                          />
                        </div>
                        <div className="flex gap-6 mt-8 pt-5 border-t border-[#f5f5f5] text-[10px] font-black uppercase tracking-[0.1em] opacity-60">
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-[#e0e0e0]" />
                             <span>{c.enrolled} Enrolled</span>
                          </div>
                          <div className="flex items-center gap-2 text-[#ff6b00]">
                             <div className="h-2 w-2 rounded-full bg-[#ff6b00]" />
                             <span>{c.submitted} Received</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* COMMENTS TAB */}
                {activeTab === 'comments' && (
                  <div className="flex flex-col gap-6">
                    <div className="bg-[#ff6b00]/5 border border-[#ff6b00]/10 rounded-xl p-5 flex items-center gap-4 text-[10px] font-black text-[#ff6b00] uppercase tracking-widest">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                      All student feedback narratives are fully anonymous. Systems ensure zero identity traceability for subjective responses.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {(data.recentComments || []).length === 0 ? (
                        <div className="col-span-full bg-white border border-[#e0e0e0] rounded-[16px] p-20 text-center shadow-sm">
                           <span className="material-symbols-outlined text-[48px] text-[#e0e0e0] mb-6">forum</span>
                           <p className="text-[#474747] font-bold uppercase tracking-widest text-[10px] opacity-40">No feedback narratives received yet.</p>
                        </div>
                      ) : (
                        (data.recentComments || []).map((c, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="bg-white border border-[#e0e0e0] rounded-[16px] p-8 shadow-sm hover:shadow-xl transition-all"
                          >
                            <div className="flex items-center gap-3 mb-6">
                               <div className="h-1.5 w-1.5 rounded-full bg-[#ff6b00]" />
                               <span className="text-[10px] font-black text-[#474747] uppercase tracking-widest opacity-60">{c.faculty_name}</span>
                            </div>
                            <p className="text-sm text-[#1A1A1A] italic leading-relaxed font-medium">"{c.comment}"</p>
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#f5f5f5] text-[10px] font-black text-[#474747] opacity-40 uppercase tracking-widest">
                              <span className="truncate max-w-[150px]">{c.course_name}</span>
                              <span>{new Date(c.submitted_at).toLocaleDateString()}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
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
