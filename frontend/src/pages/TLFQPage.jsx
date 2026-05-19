import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RatingScale from '../components/RatingScale';
import api from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowLeft, Send, RefreshCw, Volume2, Mic, CheckCircle2, Lock, GraduationCap, MessageSquare, BookOpen, Users } from 'lucide-react';

export default function TLFQPage() {
  const { id, tlfqId } = useParams();
  const navigate = useNavigate();

  const [evaluation, setEvaluation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

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
    api.get(`/student/tlfq/${tlfqId}`)
      .then(r => { setEvaluation(r.data); setQuestions(r.data.questions || []); })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load evaluation.'))
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
    if (Object.keys(answers).length < questions.length) {
      toast.error(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/student/submit', {
        tlfq_id: evaluation.id || evaluation._id,
        answers: Object.entries(answers).map(([question_id, rating]) => ({ question_id, rating })),
        comment
      });
      clearDraft();
      setSubmitted(true);
      toast.success('Feedback submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-[var(--text-main)] flex flex-col transition-colors duration-500">
        <Navbar />
        <div className="flex flex-col md:flex-row flex-1">
          <Sidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 max-w-lg w-full text-center flex flex-col items-center gap-8 shadow-2xl"
            >
              <div className="h-24 w-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] flex items-center justify-center border border-emerald-100 dark:border-emerald-900/40">
                <CheckCircle2 size={48} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-[var(--text-main)] tracking-tight">Submission Successful</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 mt-4 leading-relaxed font-medium">
                  Your feedback has been recorded anonymously. Your contribution is vital for our continuous academic improvement.
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 w-full text-left">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mb-2">
                  <Lock size={12} className="text-emerald-500" /> Security Protocol Active
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 dark:text-slate-600 font-bold leading-relaxed">Identity hashing completed. Response is now immutable and decoupled from your student profile.</p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 cursor-pointer flex items-center justify-center gap-3"
              >
                <GraduationCap size={18} /> Back to My Courses
              </button>
            </motion.div>
                    <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 w-full">
            <p className="text-xs">© 2026 Invertis University, Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.</p>
          </footer>
        </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-[var(--text-main)] flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 max-w-4xl mx-auto w-full">

            {/* Back + title */}
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <button
                  onClick={() => navigate(-1)}
                  className="hidden md:flex items-center gap-1.5 text-[10px] font-black text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition mb-4 cursor-pointer uppercase tracking-widest"
                >
                  <ArrowLeft size={14} /> Back to Course
                </button>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">TLFQ Sheet</h1>
              </div>
              <div className="flex gap-3">
                <span className="flex items-center gap-2 text-[10px] font-black bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                  <Lock size={12} /> Anonymous
                </span>
                <span className="flex items-center gap-2 text-[10px] font-black bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl uppercase tracking-widest shadow-sm">
                  <RefreshCw size={12} className="animate-spin-slow" /> Auto-Save
                </span>
              </div>
            </div>

            {loading ? (
              <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-24 flex flex-col items-center gap-4 shadow-sm">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 animate-pulse">Initializing Questionnaire...</span>
              </div>
            ) : !evaluation ? (
              <div className="bg-accent-50 dark:bg-accent-950/20 border border-accent-100 dark:border-accent-900/40 text-accent-600 dark:text-accent-400 p-8 rounded-[2rem] text-sm font-bold text-center shadow-sm">Failed to load questionnaire.</div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-10">
                {/* Evaluation header */}
                <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-primary-900/40 rounded-[2.5rem] p-8 flex justify-between items-center shadow-sm">
                  <div className="min-w-0">
                    <h2 className="text-xl font-black text-slate-900 dark:text-[var(--text-main)] truncate">{evaluation?.title}</h2>
                    <div className="flex items-center gap-4 mt-2">
                       <div className="flex items-center gap-1.5">
                          <Users size={12} className="text-slate-600 dark:text-slate-400" />
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{evaluation?.faculty_name}</span>
                       </div>
                       <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                       <div className="flex items-center gap-1.5">
                          <BookOpen size={12} className="text-slate-600 dark:text-slate-400" />
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">{evaluation?.course_name}</span>
                       </div>
                    </div>
                  </div>
                  <button
                    type="button" onClick={clearDraft}
                    className="text-[10px] font-black text-slate-600 dark:text-slate-400 hover:text-accent-500 flex items-center gap-2 px-4 py-2 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-xl transition cursor-pointer uppercase tracking-widest shrink-0"
                  >
                    <RefreshCw size={12} /> Reset Draft
                  </button>
                </div>


                {/* Progress */}
                <div className="flex flex-col gap-3">
                   <div className="flex items-center justify-between text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                     <span>Completion Status</span>
                     <span>{Object.keys(answers).length} / {questions.length} Questions</span>
                   </div>
                   <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 overflow-hidden shadow-inner">
                     <motion.div
                       initial={{ width: 0 }}
                       animate={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }}
                       className="bg-primary-600 h-full rounded-full transition-all duration-500 shadow-lg shadow-primary-500/40"
                     />
                   </div>
                </div>

                {/* Questions */}
                <div className="flex flex-col gap-6">
                  {questions.map((q, idx) => (
                    <motion.div
                      key={q.id || q._id}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col gap-8 shadow-sm hover:border-primary-500/30 transition-all group"
                    >
                      <div className="flex justify-between items-start gap-6">
                        <div className="flex gap-5">
                          <span className="shrink-0 flex items-center justify-center h-10 w-10 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-black rounded-2xl text-sm border border-primary-100 dark:border-primary-800/30 shadow-sm">
                            {idx + 1}
                          </span>
                          <p className="text-base md:text-lg font-black text-slate-800 dark:text-[var(--text-main)] leading-tight pt-1.5">{q.question_text}</p>
                        </div>
                        <button
                          type="button" onClick={() => speakQuestion(q.question_text)}
                          className="shrink-0 h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-slate-100 dark:border-slate-700 cursor-pointer flex items-center justify-center"
                          title="Narrate Question"
                        >
                          <Volume2 size={18} />
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
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-[var(--text-main)]">Narrative Feedback</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest">Optional subjective input</p>
                    </div>
                    {voiceSupported && (
                      <button
                        type="button" onClick={startVoiceInput}
                        className={`flex items-center gap-2 px-5 py-2.5 text-[10px] font-black rounded-xl transition border uppercase tracking-widest cursor-pointer shadow-sm ${
                          listening
                            ? 'bg-accent-50 border-accent-200 text-accent-600 animate-pulse'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Mic size={14} /> {listening ? 'Listening...' : 'Voice Dictation'}
                      </button>
                    )}
                  </div>
                  <div className="relative group">
                     <textarea
                       rows={5}
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                       placeholder="Share any specific feedback about teaching style, course content, or improvement suggestions..."
                       className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-sm text-slate-700 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all leading-relaxed font-medium shadow-inner"
                     />
                     <div className="absolute top-4 right-4 pointer-events-none opacity-10 group-focus-within:opacity-30 transition-opacity">
                        <MessageSquare size={40} className="text-slate-600 dark:text-slate-400" />
                     </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                     <Lock size={12} className="text-emerald-500" /> 
                     System strictly protects narrator anonymity.
                  </div>
                </div>

                {/* Submit */}
                <div className="flex gap-6 pt-4">
                  <button
                    type="submit" disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-black py-5 rounded-[2rem] text-sm transition-all shadow-2xl shadow-primary-500/30 cursor-pointer disabled:opacity-70 uppercase tracking-[0.2em]"
                  >
                    {submitting
                      ? <span className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      : <><Send size={18} /><span>Finalize Submission</span></>
                    }
                  </button>
                  <button
                    type="button" onClick={() => navigate(-1)}
                    className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 font-black py-5 px-12 rounded-[2rem] text-sm border border-slate-200 dark:border-slate-800 transition cursor-pointer uppercase tracking-widest shadow-sm"
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
