import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, CheckCircle2, ChevronLeft, Mail, Lock } from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
import api from '../services/api';

export default function StudentRegister() {
  const { login } = useAuth();
  const navigate   = useNavigate();
  const [step,       setStep]       = useState(1);
  const [studentId,  setStudentId]  = useState('');
  const [studentName,setStudentName]= useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleCheckId = async (e) => {
    e.preventDefault();
    setError('');
    if (!studentId.trim()) { setError('Please enter your Student ID.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/check-student', { student_id: studentId.trim().toUpperCase() });
      if (res.data.status === 'active') {
        setError('Your account is already activated. Use your email and password to login.');
        return;
      }
      setStudentName(res.data.name);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Student ID not found. Contact your coordinator.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !confirm) { setError('All fields are required.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/complete-registration', {
        student_id: studentId.trim().toUpperCase(), email, password
      });
      await login({ identifier: email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', boxShadow: '0 0 40px rgba(16,185,129,0.4)' }}>
              <GraduationCap size={30} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Student Portal</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5">Invertis Feedback System</p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-3 mb-5 card-main rounded-xl p-3">
          {[
            { n: 1, label: 'Verify ID' },
            { n: 2, label: 'Set Password' },
          ].map(({ n, label }, i) => (
            <div key={`step-wrap-${n}`} className="flex items-center gap-2 flex-1">
              {i > 0 && <div className={`flex-1 h-px transition-colors ${step > 1 ? 'bg-emerald-500/40' : 'bg-slate-300 dark:bg-white/8'}`} />}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                  step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30' : 'bg-slate-100 dark:bg-white/5 text-slate-500'
                }`}>
                  {step > n ? <CheckCircle2 size={14} /> : n}
                </div>
                <span className={`text-[11px] font-bold ${step === n ? 'text-[var(--text-main)]' : 'text-slate-500'}`}>{label}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="card-main rounded-2xl p-7">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4">
              <Alert variant="error" closeable onClose={() => setError('')}>{error}</Alert>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">Enter your Student ID</h2>
                <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5">Provided by your department coordinator. (e.g. BCS2025_01)</p>
                <form onSubmit={handleCheckId} className="flex flex-col gap-4">
                  <Input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value.toUpperCase())}
                    placeholder="BCS2025_01"
                    className="font-mono tracking-widest"
                  />
                  <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg">
                    <ArrowRight size={16} />
                    Continue
                  </Button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setStep(1); setError(''); }} className="text-slate-500 hover:text-[var(--text-main)] cursor-pointer transition-colors">
                    <ChevronLeft size={19} />
                  </button>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Hello, {studentName}!</h2>
                </div>
                <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5 ml-7">Set your email and password to activate your account.</p>
                <form onSubmit={handleRegister} className="flex flex-col gap-3.5">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@email.com"
                    leadingIcon={Mail}
                  />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    leadingIcon={Lock}
                  />
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter password"
                    leadingIcon={Lock}
                  />
                  <Button type="submit" disabled={loading} loading={loading} fullWidth size="lg" variant="success" className="mt-1">
                    <CheckCircle2 size={16} />
                    Activate & Login
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/6 text-center">
            <Link to="/login" className="text-[11px] text-slate-600 hover:text-slate-700 dark:text-slate-300 transition-colors">← Back to Staff Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
