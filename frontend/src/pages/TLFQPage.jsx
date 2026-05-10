import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RatingScale from '../components/RatingScale';
import api from '../services/api';
import { motion } from 'framer-motion';

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
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load draft
  useEffect(() => {
    const draftKey = `draft_${tlfqId}`;
    const draftCommentKey = `draftComment_${tlfqId}`;
    try {
      const d = localStorage.getItem(draftKey);
      if (d) setAnswers(JSON.parse(d));
      const dc = localStorage.getItem(draftCommentKey);
      if (dc) setComment(dc);
    } catch {}
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) setVoiceSupported(true);
  }, [tlfqId]);

  // Auto-save draft
  useEffect(() => {
    if (Object.keys(answers).length > 0) localStorage.setItem(`draft_${tlfqId}`, JSON.stringify(answers));
    if (comment) localStorage.setItem(`draftComment_${tlfqId}`, comment);
  }, [answers, comment, tlfqId]);

  useEffect(() => {
    api.get(`/tlfq/courses/${id}/evaluation/${tlfqId}`)
      .then(r => { setEvaluation(r.data); setQuestions(r.data.questions || []); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load evaluation.'))
      .finally(() => setLoading(false));
  }, [id, tlfqId]);

  const handleRatingChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(text), { lang: 'en-US' }));
    }
  };

  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.lang = 'en-US';
    r.onstart = () => setListening(true);
    r.onresult = e => setComment(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    r.start();
  };

  const clearDraft = () => {
    localStorage.removeItem(`draft_${tlfqId}`);
    localStorage.removeItem(`draftComment_${tlfqId}`);
    setAnswers({});
    setComment('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (Object.keys(answers).length < questions.length) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/responses/submit', {
        tlfqId: evaluation.id || evaluation._id,
        answers,
        comment
      });
      clearDraft();
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
          <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-[#e0e0e0] rounded-[24px] p-12 max-w-lg w-full text-center flex flex-col items-center gap-8 shadow-2xl shadow-black/5"
            >
              <div className="h-24 w-24 bg-[#ff6b00]/5 rounded-[24px] flex items-center justify-center border border-[#ff6b00]/10">
                <span className="material-symbols-outlined text-[56px] text-[#ff6b00]">check_circle</span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Submission Successful</h2>
                <p className="text-[11px] text-[#474747] font-bold uppercase tracking-widest mt-4 leading-relaxed opacity-60">
                  Your feedback has been recorded anonymously. Your contribution is vital for our continuous academic improvement.
                </p>
              </div>
              <div className="bg-[#f9f9f9] border border-[#e0e0e0] rounded-2xl p-6 w-full text-left">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-[#474747] opacity-40 mb-3">
                  <span className="material-symbols-outlined text-[14px] text-[#ff6b00]">verified_user</span> Security Protocol Active
                </div>
                <p className="text-[10px] text-[#1A1A1A] font-bold leading-relaxed uppercase tracking-widest">Identity hashing completed. Response is now immutable and decoupled from your student profile.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#ff6b00] hover:opacity-90 text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#ff6b00]/20 cursor-pointer flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-[20px]">school</span> Back to My Courses
              </button>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 max-w-4xl mx-auto w-full">

            {/* Back + title */}
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="flex items-center gap-2 text-[10px] font-black text-[#474747] opacity-50 hover:opacity-100 hover:text-[#ff6b00] transition mb-4 cursor-pointer uppercase tracking-[0.2em]"
                >
                  <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Course
                </button>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[#1A1A1A]">TLFQ Sheet</h1>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center gap-2 text-[9px] font-black bg-[#ff6b00]/5 border border-[#ff6b00]/10 text-[#ff6b00] px-4 py-2 rounded-lg uppercase tracking-widest shadow-sm">
                  <span className="material-symbols-outlined text-[14px]">lock</span> Anonymous
                </span>
                <span className="flex items-center gap-2 text-[9px] font-black bg-[#1A1A1A]/5 border border-[#1A1A1A]/10 text-[#1A1A1A] px-4 py-2 rounded-lg uppercase tracking-widest shadow-sm">
                  <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span> Auto-Save
                </span>
              </div>
            </div>

            {loading ? (
              <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-24 flex flex-col items-center gap-4 shadow-sm">
                <div className="h-10 w-10 border-4 border-[#ff6b00] border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#474747] opacity-40 animate-pulse">Initializing Questionnaire...</span>
              </div>
            ) : error && !evaluation ? (
              <div className="bg-red-50 border border-red-100 text-red-600 p-8 rounded-xl text-[10px] font-black uppercase tracking-widest text-center shadow-sm">{error}</div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                {/* Evaluation header */}
                <div className="bg-white border border-[#e0e0e0] rounded-[16px] p-8 flex justify-between items-center shadow-sm">
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-[#1A1A1A] truncate">{evaluation?.title}</h2>
                    <div className="flex items-center gap-4 mt-3">
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#474747]">person</span>
                          <span className="text-[10px] text-[#474747] font-black uppercase tracking-widest opacity-60">{evaluation?.faculty_name}</span>
                       </div>
                       <div className="h-1 w-1 rounded-full bg-[#e0e0e0]" />
                       <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px] text-[#474747]">menu_book</span>
                          <span className="text-[10px] text-[#474747] font-black uppercase tracking-widest opacity-60">{evaluation?.course_name}</span>
                       </div>
                    </div>
                  </div>
                  <button
                    type="button" onClick={clearDraft}
                    className="text-[9px] font-black text-[#474747] hover:text-[#b3261e] flex items-center gap-2 px-4 py-2 hover:bg-[#b3261e]/5 rounded-lg transition cursor-pointer uppercase tracking-widest shrink-0 opacity-40 hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-[16px]">restart_alt</span> Reset
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-center">{error}</div>
                )}

                {/* Progress */}
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between text-[10px] font-black text-[#474747] uppercase tracking-widest opacity-40">
                     <span>Completion Status</span>
                     <span>{Object.keys(answers).length} / {questions.length} Recorded</span>
                   </div>
                   <div className="w-full bg-[#f1f1f1] rounded-full h-2.5 overflow-hidden shadow-inner border border-[#e0e0e0]">
                     <motion.div
                       initial={{ width: 0 }}
                       animate={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }}
                       className="bg-[#ff6b00] h-full rounded-full transition-all duration-500 shadow-lg shadow-[#ff6b00]/20"
                     />
                   </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-6">
                  {questions.map((q, idx) => (
                    <motion.div
                      key={q.id || q._id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white border border-[#e0e0e0] rounded-[24px] p-8 flex flex-col gap-8 shadow-sm hover:border-[#ff6b00]/20 transition-all group"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex gap-5">
                          <span className="shrink-0 flex items-center justify-center h-10 w-10 bg-[#ff6b00]/5 text-[#ff6b00] font-black rounded-xl text-sm border border-[#ff6b00]/10 shadow-sm">
                            {idx + 1}
                          </span>
                          <p className="text-base md:text-lg font-black text-[#1A1A1A] leading-tight pt-1.5">{q.question_text}</p>
                        </div>
                        <button
                          type="button" onClick={() => speakQuestion(q.question_text)}
                          className="shrink-0 h-10 w-10 rounded-xl bg-[#f9f9f9] text-[#474747] hover:text-[#ff6b00] transition-all border border-[#e0e0e0] cursor-pointer flex items-center justify-center"
                          title="Narrate Question"
                        >
                          <span className="material-symbols-outlined text-[20px]">volume_up</span>
                        </button>
                      </div>
                      <div className="pl-0 md:pl-14">
                        <RatingScale
                          value={answers[q.id || q._id]}
                          onChange={val => handleRatingChange(q.id || q._id, val)}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Comment box */}
                <div className="bg-white border border-[#e0e0e0] rounded-[24px] p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-[#1A1A1A]">Narrative Feedback</h3>
                      <p className="text-[10px] text-[#474747] mt-1 font-black uppercase tracking-widest opacity-40">Optional Subjective Input</p>
                    </div>
                    {voiceSupported && (
                      <button
                        type="button" onClick={startVoiceInput}
                        className={`flex items-center gap-2 px-5 py-2.5 text-[9px] font-black rounded-xl transition border uppercase tracking-widest cursor-pointer shadow-sm ${
                          listening
                            ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                            : 'bg-[#f9f9f9] border-[#e0e0e0] text-[#474747] hover:bg-white hover:border-[#ff6b00]/30'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{listening ? 'settings_voice' : 'mic'}</span> {listening ? 'Listening...' : 'Voice Dictation'}
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                     <textarea
                       rows={5}
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                       placeholder="Share any specific feedback about teaching style, course content, or improvement suggestions..."
                       className="w-full bg-[#f9f9f9] border border-[#e0e0e0] rounded-2xl p-6 text-sm text-[#1A1A1A] placeholder-[#474747]/30 focus:outline-none focus:border-[#ff6b00] transition-all leading-relaxed font-medium shadow-inner"
                     />
                     <div className="absolute top-4 right-4 pointer-events-none opacity-[0.03] group-focus-within:opacity-[0.08] transition-opacity">
                        <span className="material-symbols-outlined text-[60px]">forum</span>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black text-[#474747] opacity-40 uppercase tracking-widest bg-[#f9f9f9] p-3 rounded-lg border border-[#e0e0e0]">
                     <span className="material-symbols-outlined text-[14px] text-[#ff6b00]">lock</span> 
                     System strictly protects narrator anonymity.
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-6 pt-4">
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-3 bg-[#ff6b00] hover:opacity-90 text-white font-black py-5 rounded-xl text-sm transition-all shadow-2xl shadow-[#ff6b00]/30 cursor-pointer disabled:opacity-70 uppercase tracking-[0.2em]"
                  >
                    {submitting
                      ? <span className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      : <><span className="material-symbols-outlined text-[20px]">send</span><span>Finalize Submission</span></>
                    }
                  </button>
                  <button
                    type="button" onClick={() => navigate(-1)}
                    className="bg-white hover:bg-[#f9f9f9] text-[#474747] font-black py-5 px-12 rounded-xl text-sm border border-[#e0e0e0] transition cursor-pointer uppercase tracking-widest shadow-sm"
                  >
                    Discard
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
