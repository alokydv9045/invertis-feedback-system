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

  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [closingTime, setClosingTime] = useState('');
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

  const [currentSession, setCurrentSession] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/sync/session/current');
        setCurrentSession(res.data.name);
      } catch (e) {
        // silent
      }
    })();
  }, []);

  const handleCreateTlfq = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!courseId || !facultyId || !title || !closingTime) { setError('Please fill in all required fields.'); return; }
    const filteredQs = questions.filter(q => q.trim());
    if (filteredQs.length === 0) { setError('Evaluation protocol requires at least 1 question.'); return; }
    try {
      await api.post('/tlfq', { 
        course_id: courseId, 
        faculty_id: facultyId, 
        title, 
        semester: parseInt(semester),
        section,
        closing_time: closingTime,
        question_texts: filteredQs 
      });
      setTitle(''); setCourseId(''); setFacultyId(''); setSemester('1'); setSection('A'); setClosingTime(''); setQuestions([...DEFAULT_QUESTIONS]);
      setSuccess('TLFQ evaluation created and published successfully!');
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
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 max-w-5xl mx-auto w-full">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ClipboardList size={28} className="text-primary-600 dark:text-primary-400" />
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Evaluation Forge</h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Design and deploy high-fidelity academic feedback instruments.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm w-full sm:w-auto justify-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 truncate">Global Repository Sync: Active</span>
                  </div>
                  {currentSession && (
                   <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm w-full sm:w-auto justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Session</span>
                    <span className="text-sm font-black text-slate-800 dark:text-white">{currentSession}</span>
                   </div>
                  )}
              </div>
            </div>

            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40 rounded-[2rem] text-sm font-black flex items-center gap-4 shadow-sm uppercase tracking-widest">
                <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center shrink-0">
                   <Check size={20} />
                </div>
                {success}
              </motion.div>
            )}
            
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 border border-accent-100 dark:border-accent-900/40 rounded-[2rem] text-sm font-black text-center shadow-sm uppercase tracking-widest">
                {error}
              </motion.div>
            )}

            {loading ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-32 flex flex-col items-center gap-4 shadow-sm">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 animate-pulse">Synchronizing Data Pools...</span>
              </div>
            ) : (
              <form onSubmit={handleCreateTlfq} className="flex flex-col gap-5 bg-slate-800 border border-slate-700 rounded-2xl p-6">
                <div className="relative z-10">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                     <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                     Protocol Configuration
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.2em] ml-1">Target Course Module</label>
                      <select
                        value={courseId} onChange={e => setCourseId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-[var(--text-main)] font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer shadow-inner appearance-none"
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
                      <label className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-400 tracking-[0.2em] ml-1">Assigned Academic Staff</label>
                      <select
                        value={facultyId} onChange={e => setFacultyId(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm text-slate-700 dark:text-[var(--text-main)] font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all cursor-pointer shadow-inner appearance-none"
                      >
                        <option value="">Select Faculty...</option>
                        {(faculty || []).map(f => (
                          <option key={f.id} value={f.id}>{f.name} — {f.department_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Evaluation Title</label>
                  <input
                    type="text" value={title} onChange={e => setTitle(e.target.value)}
                    placeholder="E.g. Advanced Algorithms (CS401) Feedback"
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Semester</label>
                    <select
                      value={semester} onChange={e => setSemester(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Section</label>
                    <select
                      value={section} onChange={e => setSection(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      {['A', 'B', 'C', 'D'].map(sec => (
                        <option key={sec} value={sec}>Section {sec}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Closing Time</label>
                  <input
                    type="datetime-local" value={closingTime} onChange={e => setClosingTime(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Instruments/Questions Section */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-6 sm:p-10 shadow-sm flex flex-col gap-8">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                       <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                       Evaluation Instruments
                    </h2>
                    <button
                      type="button"
                      onClick={() => setQuestions([...questions, ''])}
                      className="flex items-center gap-2 text-[10px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 px-5 py-2.5 rounded-xl transition hover:scale-105 active:scale-95 cursor-pointer uppercase tracking-widest shadow-sm"
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
                        className="flex gap-3 sm:gap-4 items-center group flex-wrap sm:flex-nowrap"
                      >
                        <div className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/30 font-black rounded-2xl text-[10px] text-primary-600 dark:text-primary-400 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                          IN-{idx + 1}
                        </div>
                        <input
                          type="text" value={qText}
                          onChange={e => { const u = [...questions]; u[idx] = e.target.value; setQuestions(u); }}
                          placeholder="Compose evaluation instrument text..."
                          className="flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-700 dark:text-[var(--text-main)] font-bold placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-inner"
                        />
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                            className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-2xl transition-all cursor-pointer flex-shrink-0"
                            title="Decommission Instrument"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                     <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/50 rounded-lg flex items-center justify-center shrink-0">
                        <ClipboardList size={16} className="text-primary-600 dark:text-primary-400" />
                     </div>
                     <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-relaxed">
                        Evaluations use a standardized Likert scale (1-7). Questions should be objective and focused on instructional quality.
                     </p>
                  </div>
                </div>

                {/* Submit Section */}
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-black py-4 sm:py-5 px-8 sm:px-10 rounded-[2.5rem] text-sm transition-all shadow-2xl shadow-primary-500/30 cursor-pointer uppercase tracking-[0.2em]"
                  >
                    <Check size={20} /> Deploy Evaluation Cluster
                  </button>
                  <button
                    type="button" onClick={() => { setQuestions([...DEFAULT_QUESTIONS]); setTitle(''); }}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-black py-4 sm:py-5 px-8 sm:px-12 rounded-[2.5rem] text-sm border border-slate-200 dark:border-slate-800 transition cursor-pointer uppercase tracking-widest shadow-sm"
                  >
                    Clear Slate
                  </button>
                </div>
              </form>
            )}
          </motion.div>
                  <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 w-full">
            <p className="text-xs">© 2026 Invertis University, Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
