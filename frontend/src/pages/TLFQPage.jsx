import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle2, Lock, BookOpen, User, Building2, HelpCircle } from 'lucide-react';

export default function TLFQPage() {
  const { id, tlfqId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.get(`/tlfq/courses/${id}/evaluation/${tlfqId}`)
      .then(r => { 
        setEvaluation(r.data); 
        setQuestions(r.data.questions || []); 
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load evaluation.'))
      .finally(() => setLoading(false));
  }, [id, tlfqId]);

  const handleRatingChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError(`Please answer all questions before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/responses/submit', {
        tlfqId: evaluation.id || evaluation._id,
        answers,
        comment
      });
      setSubmitted(true);
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
        <div className="flex flex-1">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Navbar />
            <main className="p-8 flex items-center justify-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-[#e2e8f0] rounded-3xl shadow-xl p-12 max-w-md w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
                <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-[#1a2233] mb-3">Feedback Submitted</h2>
                <p className="text-sm text-gray-400 mb-10 font-medium px-4 leading-relaxed uppercase tracking-widest text-[10px]">Your evaluation has been recorded anonymously. Thank you for your contribution to academic excellence.</p>
                <button onClick={() => navigate('/dashboard')} className="bg-[#1a2233] hover:bg-[#f15a24] text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95 w-full uppercase tracking-widest text-xs">
                  Back to Dashboard
                </button>
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <div className="max-w-6xl mx-auto flex flex-col gap-8">
              
              <div className="flex items-center justify-between">
                <div>
                  <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-[#f15a24] mb-3 transition-colors uppercase tracking-widest group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> BACK TO DASHBOARD
                  </button>
                  <h1 className="text-3xl font-black text-[#1a2233]">Faculty Feedback Form</h1>
                </div>
                <div className="bg-[#1a2233] text-white px-6 py-2.5 rounded-full flex items-center gap-3 text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[#1a2233]/10">
                  <div className="h-2 w-2 rounded-full bg-[#f15a24] animate-pulse"></div>
                  <Lock size={14} className="text-[#f15a24]" /> ANONYMOUS PORTAL
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-3xl shadow-sm overflow-hidden">
                <div className="p-8 bg-gray-50/50 border-b border-[#e2e8f0] flex items-center gap-6">
                  <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center text-[#f15a24] border border-[#e2e8f0] shadow-sm">
                    <HelpCircle size={28} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-[#1a2233]">Anonymous Faculty Feedback</h2>
                    <p className="text-[11px] text-gray-400 mt-1 font-bold uppercase tracking-widest">Your honest feedback is crucial for maintaining academic excellence. This form is strictly anonymous.</p>
                  </div>
                </div>

                <div className="p-10 border-b border-[#e2e8f0] bg-white grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-orange-50 flex items-center justify-center text-[#f15a24] border border-orange-100 flex-shrink-0">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">FACULTY NAME</p>
                      <p className="text-base font-black text-[#1a2233]">{evaluation?.faculty_name || 'Dr. Ananya Sharma'}</p>
                    </div>
                  </div>
                  <div className="flex gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-[#1a2233]/5 flex items-center justify-center text-[#1a2233] border border-[#1a2233]/10 flex-shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">COURSE NAME</p>
                      <p className="text-base font-black text-[#1a2233]">{evaluation?.course_name || 'Advanced Data Structures'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-white">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-1 w-12 bg-[#f15a24] rounded-full"></div>
                    <h3 className="text-xs font-black text-[#1a2233] uppercase tracking-[0.2em]">Instructional Quality</h3>
                  </div>
                  
                  {loading ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="h-10 w-10 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Loading Evaluation Items...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#e2e8f0]">
                            <th className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] w-2/3">Evaluation Items</th>
                            {[1, 2, 3, 4, 5].map(n => (
                              <th key={n} className="pb-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">{n}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {questions.map((q, idx) => (
                            <tr key={q.id || q._id} className="group hover:bg-orange-50/30 transition-colors">
                              <td className="py-8 pr-12">
                                <div className="flex gap-5">
                                  <span className="text-[10px] font-black text-[#f15a24] mt-1 bg-orange-50 h-6 w-6 rounded-lg flex items-center justify-center flex-shrink-0 border border-orange-100">{idx + 1}</span>
                                  <p className="text-sm font-bold text-[#1a2233] leading-relaxed group-hover:text-black transition-colors">{q.question_text}</p>
                                </div>
                              </td>
                              {[1, 2, 3, 4, 5].map(rating => (
                                <td key={rating} className="py-8 text-center">
                                  <label className="cursor-pointer relative flex items-center justify-center group/radio">
                                    <input 
                                      type="radio" 
                                      name={`q_${q.id || q._id}`}
                                      checked={answers[q.id || q._id] === rating}
                                      onChange={() => handleRatingChange(q.id || q._id, rating)}
                                      className="peer opacity-0 absolute w-6 h-6 cursor-pointer"
                                    />
                                    <div className={`h-6 w-6 rounded-lg border-2 border-gray-200 transition-all flex items-center justify-center peer-checked:border-[#f15a24] peer-checked:bg-[#f15a24] peer-checked:shadow-lg peer-checked:shadow-orange-500/20 group-hover/radio:border-orange-300`}>
                                      {answers[q.id || q._id] === rating && <div className="h-2 w-2 bg-white rounded-full"></div>}
                                    </div>
                                  </label>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-10 bg-gray-50/50 border-t border-[#e2e8f0]">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="h-1 w-12 bg-[#1a2233] rounded-full"></div>
                    <h3 className="text-xs font-black text-[#1a2233] uppercase tracking-[0.2em]">Qualitative Assessment</h3>
                  </div>
                  <div className="flex flex-col gap-4">
                    <label className="text-[11px] font-black uppercase tracking-widest text-[#1a2233]">What were the strengths of this course or instructor?</label>
                    <textarea 
                      rows={5}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your detailed feedback here... (Optional)"
                      className="w-full px-6 py-4 bg-white border border-[#e2e8f0] rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#f15a24]/5 focus:border-[#f15a24] transition-all resize-none text-sm font-medium shadow-inner"
                    />
                  </div>
                </div>

                <div className="p-10 border-t border-[#e2e8f0] bg-white flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest italic bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                    <CheckCircle2 size={16} className="text-[#f15a24]" /> Mandatory fields must be completed for submission.
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button onClick={() => navigate('/dashboard')} className="flex-1 md:flex-none px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-[#1a2233] transition-all border border-[#e2e8f0]">
                      Save Draft
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 md:flex-none bg-[#f15a24] hover:bg-[#d94e1d] text-white font-black py-3.5 px-10 rounded-xl transition-all shadow-xl shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px]"
                    >
                      {submitting ? 'Processing...' : 'Submit Feedback'} <Send size={14} className={submitting ? '' : 'translate-x-0.5'} />
                    </button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="p-6 bg-rose-50 text-rose-700 border border-rose-100 rounded-2xl text-sm font-black uppercase tracking-widest text-center shadow-lg shadow-rose-500/10">
                  {error}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
