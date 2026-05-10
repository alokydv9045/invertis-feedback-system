import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSectionId, setOpenSectionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8 max-w-4xl mx-auto w-full"
          >
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-[10px] font-black text-[#474747] opacity-50 hover:opacity-100 hover:text-[#ff6b00] transition mb-6 cursor-pointer uppercase tracking-[0.2em]"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span> Return to Hub
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-[#ff6b00] text-[32px]">assignment_turned_in</span>
                <h1 className="text-3xl font-black tracking-tight text-[#1A1A1A]">Course Evaluations</h1>
              </div>
              <p className="text-xs font-bold text-[#474747] uppercase tracking-[0.2em] opacity-60">
                Performance Audit • Continuous Improvement Stream
              </p>
            </div>

            {loading ? (
              <div className="bg-white p-24 rounded-[16px] border border-[#e0e0e0] flex flex-col items-center justify-center min-h-[400px] shadow-sm">
                <div className="h-10 w-10 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mb-6"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#474747] animate-pulse">Syncing Protocols...</span>
              </div>
            ) : error || evaluations.length === 0 ? (
              <div className="bg-white p-12 rounded-[16px] border border-[#e0e0e0] text-center flex flex-col items-center justify-center min-h-[400px] gap-8 shadow-sm">
                <div className="h-20 w-20 rounded-2xl bg-[#ff6b00]/5 text-[#ff6b00] flex items-center justify-center border border-[#ff6b00]/10 shadow-lg shadow-[#ff6b00]/5">
                  <span className="material-symbols-outlined text-[40px]">description</span>
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#1A1A1A] mb-3">Evaluations Missing</h3>
                  <p className="text-[11px] text-[#474747] font-bold uppercase tracking-widest max-w-xs leading-relaxed opacity-60 mx-auto">
                    {error || 'There are no active evaluation questionnaires published for this course yet.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-[#ff6b00] text-white font-black px-10 py-4 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-[#ff6b00]/20 hover:opacity-90 transition cursor-pointer"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-4">
                  <h3 className="font-black text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] opacity-40">
                    Available Evaluations ({evaluations.length})
                  </h3>
                  <span className="text-[10px] text-[#ff6b00] font-black uppercase tracking-widest">Select to Begin</span>
                </div>

                {evaluations.map((ev, idx) => {
                  const isOpen = openSectionId === ev.id;
                  return (
                    <motion.div
                      key={ev.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`bg-white border rounded-[16px] overflow-hidden transition-all duration-300 shadow-sm ${
                        isOpen
                          ? 'border-[#ff6b00]/40 shadow-xl shadow-[#ff6b00]/5'
                          : 'border-[#e0e0e0] hover:border-[#ff6b00]/30'
                      }`}
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleSection(ev.id)}
                        className="w-full flex items-center justify-between p-8 text-left transition select-none cursor-pointer group"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-6 mr-6">
                          <div>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff6b00] bg-[#ff6b00]/5 px-3 py-1 rounded-lg border border-[#ff6b00]/10">
                              System ID #{idx + 1}
                            </span>
                            <h2 className="text-xl md:text-2xl font-black text-[#1A1A1A] mt-3 group-hover:text-[#ff6b00] transition-colors">
                              {ev.title}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ev.completed ? (
                              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#1A1A1A] bg-[#f1f1f1] px-4 py-2 rounded-lg border border-[#e0e0e0]">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span> Submitted
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-white bg-[#ff6b00] px-4 py-2 rounded-lg shadow-md shadow-[#ff6b00]/20 animate-pulse">
                                <span className="material-symbols-outlined text-[16px]">edit_note</span> Active Input
                              </span>
                            )}
                          </div>
                        </div>

                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-[#ff6b00] text-white rotate-180' : 'bg-[#f1f1f1] text-[#474747]'}`}>
                          <span className="material-symbols-outlined">expand_more</span>
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-[#f5f5f5]">
                              <div className="flex items-center gap-4 bg-[#f9f9f9] p-5 rounded-xl border border-[#e0e0e0]">
                                <div className="h-10 w-10 bg-[#ff6b00] text-white rounded-lg flex items-center justify-center shadow-lg shadow-[#ff6b00]/10">
                                  <span className="material-symbols-outlined text-[20px]">menu_book</span>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-[#474747] uppercase tracking-widest opacity-40">Course Module</p>
                                  <h4 className="text-sm font-black text-[#1A1A1A]">
                                    {ev.course_name || 'Generic University Course'}
                                  </h4>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-[#f9f9f9] p-5 rounded-xl border border-[#e0e0e0]">
                                <div className="h-10 w-10 bg-[#1A1A1A] text-white rounded-lg flex items-center justify-center shadow-lg shadow-black/10">
                                  <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <div>
                                  <p className="text-[9px] font-black text-[#474747] uppercase tracking-widest opacity-40">Instructor Record</p>
                                  <h4 className="text-sm font-black text-[#1A1A1A]">
                                    {ev.faculty_name}
                                  </h4>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-4 bg-[#ff6b00]/5 p-5 rounded-xl text-[10px] font-black text-[#ff6b00] border border-[#ff6b00]/10 leading-relaxed uppercase tracking-widest">
                              <span className="material-symbols-outlined text-[18px]">security</span>
                              <span>
                                SYSTEM PROTOCOL: Response data is fully encrypted and decoupled from your identity profile. Subjective narratives are strictly anonymous.
                              </span>
                            </div>

                            <div className="flex gap-4 pt-4">
                              <button
                                onClick={() => navigate(`/courses/${id}/tlfq/${ev.id}`)}
                                className="flex-1 flex items-center justify-center gap-3 bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white font-black py-4 px-10 rounded-xl text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-[#ff6b00]/20 cursor-pointer"
                              >
                                {ev.completed ? 'Review Response' : 'Launch Evaluation'}
                                <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
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
        </main>
      </div>
    </div>
  );
}
