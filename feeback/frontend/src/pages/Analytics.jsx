import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, BarChart2, TrendingUp, BookOpen, MessageSquare, Star, Filter } from 'lucide-react';

const COLORS = ['#1E3A8A', '#F97316', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('faculty');
  const [selectedDeptId, setSelectedDeptId] = useState('all');
  const [teacherTypeFilter, setTeacherTypeFilter] = useState('all');

  useEffect(() => { api.get('/responses/analytics').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false)); }, []);

  const deptFiltered = selectedDeptId === 'all' ? (data?.avgRatingPerFaculty || []) : (data?.avgRatingPerFaculty || []).filter(f => f.department_id === selectedDeptId);
  const filteredFaculty = teacherTypeFilter === 'all' ? deptFiltered : deptFiltered.filter(f => f.teacher_type === teacherTypeFilter);
  const filteredSubmission = selectedDeptId === 'all' ? [] : (data?.submissionRates || []).filter(c => c.department_id === selectedDeptId);
  const filteredComments = selectedDeptId === 'all' ? (data?.recentComments || []) : (data?.recentComments || []).filter(c => c.department_id === selectedDeptId);

  const tabs = [
    { id: 'faculty', label: 'Faculty Rankings', icon: Award },
    { id: 'courses', label: 'Course Reports', icon: BookOpen },
    { id: 'comments', label: 'Feedback Insights', icon: MessageSquare },
  ];

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center">
                <BarChart2 size={20} className="text-invertis-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Targeted Analytics</h1>
                <p className="text-sm text-gray-500">Analyze performance and feedback by department.</p>
              </div>
            </div>
            {data?.deptOverview?.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                  <Filter size={14} className="text-gray-400 ml-2" />
                  <select value={selectedDeptId} onChange={e => setSelectedDeptId(e.target.value)}
                    className="bg-transparent pr-6 py-2 text-sm font-semibold text-gray-700 focus:outline-none cursor-pointer">
                    <option value="all">All Departments</option>
                    {data.deptOverview.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border border-gray-200">
                  {[['all','All'],['college_faculty','Faculty'],['trainer','Trainer']].map(([val, lbl]) => (
                    <button key={val} onClick={() => setTeacherTypeFilter(val)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${teacherTypeFilter === val ? 'bg-invertis-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {loading ? (
        <Card><div className="py-20 flex justify-center"><div className="h-10 w-10 border-3 border-invertis-blue border-t-transparent rounded-full animate-spin" /></div></Card>
      ) : !data ? (
        <Card><EmptyState icon={BarChart2} title="No data" message="No analytics data available." /></Card>
      ) : (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${activeTab === id ? 'bg-white text-invertis-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

              {activeTab === 'faculty' && (
                <div className="space-y-6">
                  <Card>
                    <CardBody>
                      <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-invertis-blue" /> Faculty Average Ratings (out of 7)
                      </h3>
                      {filteredFaculty.length === 0 ? (
                        <EmptyState icon={BarChart2} title="No data" message="No feedback data for this selection." />
                      ) : (
                        <div style={{ height: Math.max(200, filteredFaculty.length * 52) }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={filteredFaculty} layout="vertical" margin={{ left: 10, right: 30 }}>
                              <XAxis type="number" domain={[0, 7]} tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                              <YAxis type="category" dataKey="name" tick={{ fill: '#111827', fontSize: 12, fontWeight: 600 }} width={160} axisLine={false} tickLine={false} />
                              <Tooltip cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                                formatter={v => [`${v}/7`, 'Avg. Rating']} />
                              <Bar dataKey="avg_rating" radius={[0, 8, 8, 0]} barSize={28}>
                                {filteredFaculty.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredFaculty.map((f, i) => (
                      <Card key={f.id} hover>
                        <CardBody className="py-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-orange-600' : 'bg-gray-200 text-gray-600'}`}>#{i + 1}</div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900">{f.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${f.teacher_type === 'trainer' ? 'text-cyan-600 bg-cyan-50' : 'text-purple-600 bg-purple-50'}`}>
                                  {f.teacher_type === 'trainer' ? 'Trainer' : 'Faculty'}
                                </span>
                                <span className="text-xs text-gray-400">{f.total_responses} responses</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                              <Star size={14} className="text-amber-400 fill-amber-400" />
                              <span className={`text-lg font-bold ${f.avg_rating >= 5 ? 'text-emerald-500' : f.avg_rating >= 3.5 ? 'text-amber-500' : 'text-red-500'}`}>
                                {f.avg_rating.toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">/7</span>
                              </span>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'courses' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSubmission.length === 0 ? (
                    <div className="col-span-full"><Card><EmptyState icon={BookOpen} title="Select a department" message="Choose a department to view course reports." /></Card></div>
                  ) : filteredSubmission.map(c => (
                    <Card key={c.course_id}>
                      <CardBody>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-xs font-mono font-semibold text-invertis-blue bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{c.course_code}</span>
                            <h4 className="text-sm font-bold text-gray-900 mt-1">{c.course_name}</h4>
                          </div>
                          <span className={`text-xl font-bold ${c.rate >= 70 ? 'text-emerald-500' : c.rate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{c.rate}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${c.rate}%` }} transition={{ duration: 1 }}
                            className={`h-full rounded-full ${c.rate >= 70 ? 'bg-emerald-400' : c.rate >= 40 ? 'bg-amber-400' : 'bg-red-400'}`} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 bg-gray-50 p-2 rounded-lg">
                          <div><span className="text-xs text-gray-400">Enrolled</span><p className="font-semibold text-gray-700">{c.enrolled}</p></div>
                          <div className="w-px h-6 bg-gray-200" />
                          <div><span className="text-xs text-gray-400">Submitted</span><p className="font-semibold text-gray-700">{c.submitted}</p></div>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'comments' && (
                <div className="space-y-4">
                  <Card className="border-blue-200 bg-blue-50/30"><CardBody className="py-3">
                    <div className="flex items-center gap-3 text-sm text-invertis-blue">
                      <MessageSquare size={16} /> Student feedback is rigorously anonymized.
                    </div>
                  </CardBody></Card>
                  {filteredComments.length === 0 ? (
                    <Card><EmptyState icon={MessageSquare} title="No comments" message="No comments submitted for this department." /></Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredComments.map((c, i) => (
                        <Card key={i}><CardBody>
                          <p className="text-sm text-gray-700 italic leading-relaxed mb-4">"{c.comment}"</p>
                          <div className="pt-3 border-t border-gray-100">
                            <p className="text-sm font-semibold"><span className="text-invertis-blue">{c.faculty_name}</span> · {c.course_name}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(c.submitted_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                          </div>
                        </CardBody></Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
