import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RatingScale from '../components/RatingScale';
import api from '../services/api';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton } from '../components/ui/Skeleton';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, RefreshCw, Volume2, Mic, CheckCircle2, Lock, GraduationCap, BookOpen, Users } from 'lucide-react';

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

  useEffect(() => {
    try {
      const d = localStorage.getItem(`draft_${tlfqId}`);
      if (d) setAnswers(JSON.parse(d));
      const dc = localStorage.getItem(`draftComment_${tlfqId}`);
      if (dc) setComment(dc);
    } catch {}
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) setVoiceSupported(true);
  }, [tlfqId]);

  useEffect(() => {
    if (Object.keys(answers).length > 0) localStorage.setItem(`draft_${tlfqId}`, JSON.stringify(answers));
    if (comment) localStorage.setItem(`draftComment_${tlfqId}`, comment);
  }, [answers, comment, tlfqId]);

  useEffect(() => {
    api.get(`/student/tlfq/${tlfqId}`)
      .then(r => { setEvaluation(r.data); setQuestions(r.data.questions || []); })
      .catch(err => setError(err.response?.data?.message || 'Failed to load evaluation.'))
      .finally(() => setLoading(false));
  }, [id, tlfqId]);

  const handleRatingChange = (qId, val) => setAnswers(prev => ({ ...prev, [qId]: val }));
  const speakQuestion = (text) => { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(text), { lang: 'en-US' })); } };
  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR(); r.lang = 'en-US';
    r.onstart = () => setListening(true);
    r.onresult = e => setComment(p => p ? p + ' ' + e.results[0][0].transcript : e.results[0][0].transcript);
    r.onerror = () => setListening(false); r.onend = () => setListening(false); r.start();
  };
  const clearDraft = () => { localStorage.removeItem(`draft_${tlfqId}`); localStorage.removeItem(`draftComment_${tlfqId}`); setAnswers({}); setComment(''); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (Object.keys(answers).length < questions.length) { setError(`Please answer all ${questions.length} questions.`); return; }
    setSubmitting(true);
    try {
      await api.post('/student/submit', { tlfq_id: evaluation.id || evaluation._id, answers: Object.entries(answers).map(([question_id, rating]) => ({ question_id, rating })), comment });
      clearDraft(); setSubmitted(true);
    } catch (err) { setError(err.response?.data?.message || 'Failed to submit.'); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="max-w-lg w-full text-center">
          <CardBody className="py-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle2 size={40} className="text-emerald-500" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-gray-900 mb-3"
            >
              Submission Successful
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-sm text-gray-500 mb-6"
            >
              Your feedback has been recorded anonymously.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  <Lock size={12} className="text-emerald-500" /> Security Protocol Active
                </div>
                <p className="text-xs text-gray-500">Identity hashing completed. Response is immutable and decoupled from your profile.</p>
              </div>
              <Button onClick={() => navigate('/dashboard')} icon={GraduationCap} className="w-full justify-center">Back to My Courses</Button>
            </motion.div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-invertis-blue transition mb-3 cursor-pointer">
            <ArrowLeft size={14} /> Back to Course
          </button>
          <h1 className="text-2xl font-bold text-gray-900">TLFQ Sheet</h1>
        </div>
        <div className="flex gap-2">
          <Badge status="active"><Lock size={10} className="mr-1" />Anonymous</Badge>
          <Badge status="completed"><RefreshCw size={10} className="mr-1" />Auto-Save</Badge>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <Card>
            <CardBody>
              <Skeleton className="h-6 w-2/3 mb-3" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="py-4">
              <Skeleton className="h-2.5 w-full" rounded="rounded-full" />
            </CardBody>
          </Card>
          {[1, 2, 3].map(n => (
            <Card key={n}>
              <CardBody>
                <div className="flex gap-4 mb-6">
                  <Skeleton className="h-9 w-9 flex-shrink-0" rounded="rounded-xl" />
                  <Skeleton className="h-5 flex-1" />
                </div>
                <div className="flex gap-2.5 pl-0 md:pl-13">
                  {[1,2,3,4,5,6,7].map(b => <Skeleton key={b} className="h-12 w-12" rounded="rounded-2xl" />)}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : error && !evaluation ? (
        <div role="alert" className="p-6 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 text-center">{error}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <Card>
            <CardBody>
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{evaluation?.title}</h2>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={12} /> {evaluation?.faculty_name}</span>
                    <span className="flex items-center gap-1"><BookOpen size={12} /> {evaluation?.course_name}</span>
                  </div>
                </div>
                <button type="button" onClick={clearDraft} className="text-xs font-semibold text-gray-400 hover:text-red-500 flex items-center gap-1 cursor-pointer">
                  <RefreshCw size={12} /> Reset
                </button>
              </div>
            </CardBody>
          </Card>

          {error && <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">{error}</div>}

          {/* Progress */}
          <Card>
            <CardBody className="py-4">
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Completion</span>
                <span>{Object.keys(answers).length} / {questions.length} Questions</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(Object.keys(answers).length / Math.max(questions.length, 1)) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-invertis-blue to-invertis-light-blue transition-all duration-500" />
              </div>
            </CardBody>
          </Card>

          {/* Questions — staggered animation */}
          {questions.map((q, idx) => (
            <motion.div
              key={q.id || q._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, ease: 'easeOut' }}
            >
              <Card className="hover:border-invertis-blue/20 transition-all">
                <CardBody>
                  <div className="flex justify-between items-start gap-4 mb-6">
                    <div className="flex gap-4">
                      <span className="shrink-0 flex items-center justify-center w-9 h-9 bg-invertis-blue/10 text-invertis-blue font-bold rounded-xl text-sm">{idx + 1}</span>
                      <p className="text-base font-semibold text-gray-800 pt-1">{q.question_text}</p>
                    </div>
                    <button type="button" onClick={() => speakQuestion(q.question_text)} className="shrink-0 w-9 h-9 rounded-xl bg-gray-50 text-gray-400 hover:text-invertis-blue transition flex items-center justify-center cursor-pointer" title="Read aloud" aria-label={`Read question ${idx + 1} aloud`}>
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <div className="pl-0 md:pl-13">
                    <RatingScale value={answers[q.id || q._id]} onChange={val => handleRatingChange(q.id || q._id, val)} />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}

          {/* Comment */}
          <Card>
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Narrative Feedback</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Optional subjective input</p>
                </div>
                {voiceSupported && (
                  <button type="button" onClick={startVoiceInput}
                    className={`flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition border cursor-pointer ${listening ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                    aria-label={listening ? 'Listening for voice input' : 'Start voice input'}
                  >
                    <Mic size={14} /> {listening ? 'Listening...' : 'Voice'}
                  </button>
                )}
              </div>
              <textarea rows={4} value={comment} onChange={e => setComment(e.target.value)} placeholder="Share feedback about teaching style, content, or suggestions..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all" />
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-3 bg-gray-50 p-2 rounded-lg">
                <Lock size={12} className="text-emerald-500" /> Narrator anonymity is strictly protected.
              </div>
            </CardBody>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={submitting} icon={Send} className="flex-1 justify-center py-3">
              {submitting ? 'Submitting...' : 'Finalize Submission'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="py-3">Discard</Button>
          </div>
        </form>
      )}
    </div>
  );
}
