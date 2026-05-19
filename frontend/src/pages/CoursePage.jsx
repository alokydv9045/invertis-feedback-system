import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, ArrowLeft, ArrowRight, CheckCircle2, FileText, ChevronDown, ChevronUp } from 'lucide-react';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSectionId, setOpenSectionId] = useState(null);

  useEffect(() => {
    const fetchCourseEvaluations = async () => {
      try {
        const res = await api.get(`/tlfq/courses/${id}/evaluations`);
        setEvaluations(res.data || []);
        if (res.data && res.data.length > 0) {
          setOpenSectionId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'No evaluation questionnaire has been published for this course yet.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourseEvaluations();
  }, [id]);

  const toggleSection = (evalId) => {
    setOpenSectionId(openSectionId === evalId ? null : evalId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-[var(--text-main)] flex flex-col transition-colors duration-500">
      <Navbar />

      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 max-w-4xl mx-auto w-full"
          >
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden md:flex items-center gap-1.5 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition mb-6 cursor-pointer uppercase tracking-widest"
              >
                <ArrowLeft size={14} /> Back to Dashboard
              </button>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight flex items-center gap-2">
                Course Evaluations
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 mt-2 font-medium">
                Your feedback helps us understand and improve course teaching methods.
              </p>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-900/50 p-24 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 animate-pulse">Scanning Forms...</span>
              </div>
            ) : error || evaluations.length === 0 ? (
              <div className="bg-white dark:bg-slate-900/50 p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[400px] gap-6 shadow-sm">
                <div className="h-20 w-20 rounded-[2rem] bg-accent-50 dark:bg-accent-950/40 text-accent-500 flex items-center justify-center border border-accent-100 dark:border-accent-900/50 shadow-lg">
                  <FileText size={32} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 dark:text-[var(--text-main)] mb-2">Evaluations Missing</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed font-medium mx-auto">
                    {error || 'There are no active evaluation questionnaires published for this course yet.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 bg-primary-600 dark:bg-primary-500 text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest shadow-xl shadow-primary-500/20 hover:bg-primary-700 transition cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="font-black text-slate-900 dark:text-slate-700 dark:text-slate-300 text-xs uppercase tracking-[0.15em]">
                    Available Forms ({evaluations.length})
                  </h3>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest">Select form to begin</span>
                </div>

                {evaluations.map((ev, idx) => {
                  const isOpen = openSectionId === ev.id;
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-white dark:bg-slate-900/50 border rounded-[2rem] overflow-hidden transition-all duration-500 shadow-sm ${
                        isOpen
                          ? 'border-primary-600/40 dark:border-primary-500/40 ring-4 ring-primary-500/5 shadow-2xl'
                          : 'border-slate-200 dark:border-slate-800 hover:border-primary-400/50'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleSection(ev.id)}
                        className="w-full flex items-center justify-between p-8 text-left transition select-none cursor-pointer group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-6 mr-6">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-3 py-1 rounded-lg border border-primary-100 dark:border-primary-800/30">
                              Form Identifier #{idx + 1}
                            </span>
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-[var(--text-main)] mt-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {ev.title}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ev.completed ? (
                              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                                <CheckCircle2 size={14} /> Completed
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm animate-pulse">
                                Active Input
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 rotate-180' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                          <ChevronDown size={24} />
                        </div>
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-8 pb-8 pt-0 flex flex-col gap-6"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="h-12 w-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                  <BookOpen size={20} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">Course Module</p>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-[var(--text-main)]">
                                    {ev.course_name || 'Generic University Course'}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <div className="h-12 w-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                                  <Award size={20} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">Instructor Record</p>
                                  <h4 className="text-sm font-black text-slate-900 dark:text-[var(--text-main)]">
                                    {ev.faculty_name}
                                  </h4>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 bg-amber-50 dark:bg-amber-950/20 p-5 rounded-2xl text-[11px] font-bold text-amber-800 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40 leading-relaxed shadow-sm">
                              <CheckCircle2 className="shrink-0 text-amber-600 dark:text-amber-500" size={18} />
                              <span>
                                SYSTEM PROTOCOL: Response data is fully encrypted and decoupled from your identity profile. Subjective narratives are strictly anonymous and accessible only by departmental heads.
                              </span>
                            </div>

                            <div className="flex gap-4 pt-2">
                              <button
                                onClick={() => navigate(`/courses/${id}/tlfq/${ev.id}`)}
                                className="flex-1 flex items-center justify-center gap-3 bg-primary-600 dark:bg-primary-500 hover:bg-primary-700 dark:hover:bg-primary-600 text-white font-black py-4 px-10 rounded-2xl text-xs uppercase tracking-widest transition shadow-xl shadow-primary-500/20 cursor-pointer"
                              >
                                {ev.completed ? 'Review Response' : 'Launch Evaluation'}
                                <ArrowRight size={16} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
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
