import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-8 max-w-5xl mx-auto"
            >
              <div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#f15a24] mb-4 transition-colors uppercase tracking-widest group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DASHBOARD
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <BookOpen size={24} className="text-[#f15a24]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1a2233]">Course Evaluation Overview</h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-12">
                  Your feedback helps us understand and improve course teaching methods.
                </p>
              </div>

              {loading ? (
                <div className="bg-white p-20 rounded-3xl border border-[#e2e8f0] flex flex-col items-center justify-center shadow-sm gap-4">
                  <div className="h-10 w-10 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Records...</p>
                </div>
              ) : error || evaluations.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-[#e2e8f0] text-center flex flex-col items-center justify-center shadow-sm gap-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                  <div className="h-20 w-20 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                    <FileText size={32} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-black text-xl text-[#1a2233]">Evaluations Missing</h3>
                    <p className="text-xs text-gray-400 max-w-xs leading-relaxed font-bold uppercase tracking-widest">
                      {error || 'There are no active evaluation questionnaires published for this course yet.'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-[#1a2233] text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 transition hover:bg-[#242f45] active:scale-95 cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
                    <h3 className="font-black text-[#1a2233] text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[#f15a24]"></div>
                      Available Forms ({evaluations.length})
                    </h3>
                  </div>

                  <div className="flex flex-col gap-4">
                    {evaluations.map((ev, idx) => {
                      const isOpen = openSectionId === ev.id;
                      return (
                        <motion.div
                          key={ev.id}
                          className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 shadow-sm ${
                            isOpen
                              ? 'border-[#f15a24] ring-4 ring-[#f15a24]/5'
                              : 'border-[#e2e8f0] hover:border-[#1a2233]/20'
                          }`}
                        >
                          {/* Accordion Header */}
                          <button
                            onClick={() => toggleSection(ev.id)}
                            className="w-full flex items-center justify-between p-6 text-left transition select-none cursor-pointer group"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between flex-1 gap-6 mr-6">
                              <div className="flex gap-5">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs transition-colors ${isOpen ? 'bg-[#f15a24] text-white shadow-lg shadow-orange-500/20' : 'bg-gray-50 text-gray-300 group-hover:bg-[#1a2233] group-hover:text-white'}`}>
                                  {idx + 1}
                                </div>
                                <div>
                                  <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isOpen ? 'text-[#f15a24]' : 'text-gray-400'}`}>
                                    TLFQ QUESTIONNAIRE
                                  </span>
                                  <h2 className="text-base font-black text-[#1a2233] mt-1 line-clamp-1">
                                    {ev.title}
                                  </h2>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 flex-shrink-0">
                                {ev.completed ? (
                                  <span className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest shadow-sm">
                                    <CheckCircle2 size={12} /> COMPLETED
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-2 text-[10px] font-black text-[#f15a24] bg-orange-50 px-4 py-1.5 rounded-full border border-orange-100 uppercase tracking-widest shadow-sm">
                                    <div className="h-1.5 w-1.5 rounded-full bg-[#f15a24] animate-pulse"></div>
                                    PENDING
                                  </span>
                                )}
                              </div>
                            </div>

                            <span className={`transition-transform duration-300 ${isOpen ? 'text-[#f15a24]' : 'text-gray-300'}`}>
                              {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                            </span>
                          </button>

                          {/* Accordion Content */}
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              className="px-8 pb-8 pt-0 flex flex-col gap-6"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-2xl border border-gray-100 shadow-inner">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 bg-white text-[#f15a24] rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                    <BookOpen size={18} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">COURSE CONTEXT</p>
                                    <h4 className="text-sm font-black text-[#1a2233]">
                                      {ev.course_name || 'Invertis University Course'}
                                    </h4>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 bg-white text-[#1a2233] rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                    <Award size={18} />
                                  </div>
                                  <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FACULTY / INSTRUCTOR</p>
                                    <h4 className="text-sm font-black text-[#1a2233]">
                                      {ev.faculty_name}
                                    </h4>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start gap-4 bg-[#1a2233] p-5 rounded-2xl text-[11px] text-gray-400 font-medium leading-relaxed shadow-xl shadow-slate-900/10">
                                <CheckCircle2 className="flex-shrink-0 text-[#f15a24] mt-0.5" size={16} />
                                <span>
                                  Your response is fully secure, encrypted, and strictly anonymous. Please provide honest ratings for all instructional items to contribute to our academic improvement process.
                                </span>
                              </div>

                              <button
                                onClick={() => navigate(`/courses/${id}/tlfq/${ev.id}`)}
                                className="flex items-center justify-center gap-3 bg-[#f15a24] hover:bg-[#d94e1d] text-white font-black py-4 px-10 rounded-xl text-[11px] transition-all shadow-xl shadow-orange-500/20 active:scale-95 uppercase tracking-widest w-full sm:w-auto self-end"
                              >
                                {ev.completed ? 'Review Response' : 'Start Evaluation'}
                                <ArrowRight size={16} className="translate-x-0 group-hover:translate-x-1 transition-transform" />
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
