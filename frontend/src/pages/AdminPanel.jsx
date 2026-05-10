import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_QUESTIONS = [
  'The instructor explains course material clearly and effectively.',
  'The instructor is responsive to questions during and outside of class.',
  'The assignments and projects contribute significantly to learning.',
  'The course stimulated my interest in the subject matter.',
  'Overall, I would rate this instructor\'s effectiveness as high.'
];

export default function AdminPanel() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([...DEFAULT_QUESTIONS]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rC, rF, rD] = await Promise.all([
        api.get('/tlfq/courses'),
        api.get('/tlfq/faculty'),
        api.get('/tlfq/departments')
      ]);
      setCourses(rC.data);
      setFaculty(rF.data);
      setDepartments(rD.data);
    } catch (err) {
      setError('System failed to synchronize data repositories. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTlfq = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!courseId || !facultyId || !title) { setError('All configuration fields are mandatory for deployment.'); return; }
    const filteredQs = questions.filter(q => q.trim());
    if (filteredQs.length === 0) { setError('Evaluation protocol requires at least 1 question.'); return; }
    try {
      await api.post('/tlfq', { course_id: courseId, faculty_id: facultyId, title, question_texts: filteredQs });
      setTitle(''); setCourseId(''); setFacultyId(''); setQuestions([...DEFAULT_QUESTIONS]);
      setSuccess('TLFQ evaluation published successfully across all student portals.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Transaction failed: Evaluation could not be published.');
    }
  };

  // Group courses by department
  const coursesByDept = (departments || []).reduce((acc, d) => {
    acc[d.id] = { name: d.name, courses: (courses || []).filter(c => c.department_id?.toString() === d.id?.toString()) };
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 max-w-5xl mx-auto w-full">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-3 bg-[#ff6b00]/10 text-[#ff6b00] rounded-xl">
                  <span className="material-symbols-outlined text-[32px]">edit_note</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Evaluation Forge</h1>
                  <p className="text-sm text-[#474747] font-medium mt-1">Design and deploy high-fidelity academic feedback instruments.</p>
                </div>
              </div>
            </div>

            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[2rem] text-xs font-black flex items-center gap-4 shadow-sm uppercase tracking-widest">
                <div className="h-10 w-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                   <span className="material-symbols-outlined">check_circle</span>
                </div>
                {success}
              </motion.div>
            )}
            
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-rose-50 text-rose-600 border border-rose-100 rounded-[2rem] text-xs font-black text-center shadow-sm uppercase tracking-widest">
                {error}
              </motion.div>
            )}
 
            {loading ? (
              <div className="bg-white border border-[#e0e0e0] rounded-[24px] p-32 flex flex-col items-center gap-4 shadow-sm">
                <div className="h-12 w-12 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#474747] animate-pulse">Synchronizing Data Pools...</span>
              </div>
            ) : (
              <form onSubmit={handleCreateTlfq} className="flex flex-col gap-10">
                
                {/* Configuration Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm flex flex-col gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-[0.02] dark:opacity-[0.05] pointer-events-none">
                     <ClipboardList size={180} />
                  </div>
                  <div className="relative z-10">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                       Protocol Configuration
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Target Course Module</label>
                        <select
                          value={courseId} onChange={e => setCourseId(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-inner appearance-none"
                        >
                          <option value="">Select Course...</option>
                          {Object.values(coursesByDept).map(({ name, courses: dCourses }) => (
                            <optgroup key={name} label={`── ${name}`}>
                              {dCourses.map(c => (
                                <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Assigned Academic Staff</label>
                        <select
                          value={facultyId} onChange={e => setFacultyId(e.target.value)}
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-slate-200 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer shadow-inner appearance-none"
                        >
                          <option value="">Select Faculty...</option>
                          {(faculty || []).map(f => (
                            <option key={f.id} value={f.id}>{f.name} — {f.department_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-3 lg:col-span-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] ml-1">Deployment Identifier / Semester Mapping</label>
                        <input
                          type="text" value={title} onChange={e => setTitle(e.target.value)}
                          placeholder="E.g. [S25] Advanced Algorithms – Comprehensive Evaluation"
                          className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-700 dark:text-slate-200 font-bold placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instruments/Questions Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm flex flex-col gap-10">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                       Evaluation Instruments
                    </h2>
                    <button
                      type="button"
                      onClick={() => setQuestions([...questions, ''])}
                      className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 px-5 py-2.5 rounded-xl transition hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-widest shadow-sm"
                    >
                      <Plus size={14} /> Add Instrument
                    </button>
                  </div>

                  <div className="flex flex-col gap-5">
                    {questions.map((qText, idx) => (
                      <motion.div 
                        key={idx} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 items-center group"
                      >
                        <div className="h-14 w-14 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 font-black rounded-2xl text-[10px] text-indigo-600 dark:text-indigo-400 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          IN-{idx + 1}
                        </div>
                        <input
                          type="text" value={qText}
                          onChange={e => { const u = [...questions]; u[idx] = e.target.value; setQuestions(u); }}
                          placeholder="Compose evaluation instrument text..."
                          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-700 dark:text-slate-200 font-bold placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-inner"
                        />
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                            className="h-14 w-14 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-2xl transition-all cursor-pointer"
                            title="Decommission Instrument"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                     <div className="h-8 w-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center shrink-0">
                        <ClipboardList size={16} className="text-indigo-600 dark:text-indigo-400" />
                     </div>
                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-relaxed">
                        Evaluations use a standardized Likert scale (1-7). Questions should be objective and focused on instructional quality.
                     </p>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex gap-6">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-5 px-10 rounded-[2.5rem] text-sm transition-all shadow-2xl shadow-indigo-500/30 cursor-pointer uppercase tracking-[0.2em]"
                  >
                    <Check size={20} /> Deploy Evaluation Cluster
                  </button>
                  <button
                    type="button" onClick={() => { setQuestions([...DEFAULT_QUESTIONS]); setTitle(''); }}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 font-black py-5 px-12 rounded-[2.5rem] text-sm border border-slate-200 dark:border-slate-800 transition cursor-pointer uppercase tracking-widest shadow-sm"
                  >
                    Clear Slate
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
