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
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-12 max-w-md w-full text-center">
                <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-[#1a2233] mb-2">Feedback Submitted</h2>
                <p className="text-sm text-gray-500 mb-8 font-medium">Your evaluation has been recorded anonymously. Thank you for your contribution.</p>
                <button onClick={() => navigate('/dashboard')} className="bg-[#2d3fe0] hover:bg-blue-700 text-white font-semibold py-3 rounded transition-all shadow-sm active:scale-95 w-full">
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
            <div className="max-w-5xl mx-auto flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#2d3fe0] mb-2 transition-colors">
                    <ArrowLeft size={14} /> BACK TO DASHBOARD
                  </button>
                  <h1 className="text-2xl font-bold text-[#1a2233]">Faculty Feedback Form</h1>
                </div>
                <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded flex items-center gap-2 text-amber-800 text-[11px] font-bold shadow-sm">
                  <Lock size={14} /> ANONYMOUS SUBMISSION
                </div>
              </div>

              <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-[#e2e8f0]">
                  <h2 className="text-lg font-bold text-[#1a2233]">Anonymous Faculty Feedback</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Your honest feedback is crucial for maintaining academic excellence. This form is strictly anonymous.</p>
                </div>

                <div className="p-8 border-b border-[#e2e8f0] bg-white">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Course Context</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded bg-[#f5f7fa] flex items-center justify-center text-[#2d3fe0] border border-[#e2e8f0]">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">FACULTY NAME</p>
                        <p className="text-sm font-bold text-[#1a2233]">{evaluation?.faculty_name || 'Dr. Ananya Sharma'}</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="h-10 w-10 rounded bg-[#f5f7fa] flex items-center justify-center text-[#2d3fe0] border border-[#e2e8f0]">
                        <BookOpen size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">COURSE NAME</p>
                        <p className="text-sm font-bold text-[#1a2233]">{evaluation?.course_name || 'Advanced Data Structures'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-white">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Instructional Quality</h3>
                  
                  {loading ? (
                    <div className="p-12 text-center animate-pulse text-gray-400 font-bold uppercase text-[10px]">Loading Evaluation Items...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#e2e8f0]">
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest w-2/3">Evaluation Items</th>
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">1</th>
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">2</th>
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">3</th>
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">4</th>
                            <th className="py-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">5</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e2e8f0]">
                          {questions.map((q, idx) => (
                            <tr key={q.id || q._id} className="group hover:bg-gray-50 transition-colors">
                              <td className="py-6 pr-8">
                                <div className="flex gap-4">
                                  <span className="text-[10px] font-bold text-gray-300 mt-1">{idx + 1}.</span>
                                  <p className="text-sm font-medium text-[#1a2233] leading-relaxed">{q.question_text}</p>
                                </div>
                              </td>
                              {[1, 2, 3, 4, 5].map(rating => (
                                <td key={rating} className="py-6 text-center">
                                  <input 
                                    type="radio" 
                                    name={`q_${q.id || q._id}`}
                                    checked={answers[q.id || q._id] === rating}
                                    onChange={() => handleRatingChange(q.id || q._id, rating)}
                                    className="w-4 h-4 text-[#2d3fe0] border-[#e2e8f0] focus:ring-[#2d3fe0] transition-all cursor-pointer"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-gray-50/50 border-t border-[#e2e8f0]">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Qualitative Assessment</h3>
                  <div className="flex flex-col gap-4">
                    <label className="text-xs font-bold text-[#1a2233]">What were the strengths of this course or instructor?</label>
                    <textarea 
                      rows={4}
                      value={comment}
                      onChange={e => setComment(e.target.value)}
                      placeholder="Share your detailed feedback here..."
                      className="w-full px-4 py-2 bg-white border border-[#e2e8f0] rounded focus:outline-none focus:ring-2 focus:ring-[#2d3fe0]/20 focus:border-[#2d3fe0] transition-all resize-none p-4 text-sm"
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-[#e2e8f0] bg-white flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 italic">
                    <HelpCircle size={14} /> All fields are mandatory for submission.
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => navigate('/dashboard')} className="px-6 py-2.5 rounded text-xs font-bold text-gray-500 hover:bg-gray-100 transition-all border border-[#e2e8f0]">
                      Save Draft
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="bg-[#2d3fe0] hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded transition-all shadow-sm active:scale-95 flex items-center gap-2"
                    >
                      {submitting ? 'Submitting...' : 'Submit Feedback'} <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
