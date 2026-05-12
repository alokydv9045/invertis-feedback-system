import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Lock, Mail, ArrowRight, CheckCircle2, ChevronLeft } from 'lucide-react';
import api from '../services/api';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

export default function StudentRegister() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckId = async (e) => {
    e.preventDefault(); setError('');
    if (!studentId.trim()) { setError('Please enter your Student ID.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/check-student', { student_id: studentId.trim().toUpperCase() });
      if (res.data.status === 'active') { setError('Account already activated. Login instead.'); return; }
      setStudentName(res.data.name); setStep(2);
    } catch (err) { setError(err.response?.data?.message || 'Student ID not found.'); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setError('');
    if (!email || !password || !confirm) { setError('All fields are required.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/complete-registration', { student_id: studentId.trim().toUpperCase(), email, password });
      await login({ identifier: email, password });
      navigate('/dashboard');
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-invertis-blue flex items-center justify-center mb-3">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Student Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Invertis Feedback System</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-5 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
          {[{ n: 1, label: 'Verify ID' }, { n: 2, label: 'Set Password' }].map(({ n, label }, i) => (
            <div key={n} className="flex items-center gap-2 flex-1">
              {i > 0 && <div className={`flex-1 h-px ${step > 1 ? 'bg-invertis-blue/30' : 'bg-gray-200'}`} />}
              <div className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                step > n ? 'bg-emerald-500 text-white' : step === n ? 'bg-invertis-blue/10 text-invertis-blue border border-invertis-blue/30' : 'bg-gray-100 text-gray-400'
              }`}>{step > n ? <CheckCircle2 size={14} /> : n}</div>
              <span className={`text-xs font-semibold ${step === n ? 'text-gray-700' : 'text-gray-400'}`}>{label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-7 shadow-sm">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-lg">{error}</motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <h2 className="text-base font-bold text-gray-900 mb-1">Enter your Student ID</h2>
                <p className="text-xs text-gray-500 mb-5">Provided by your coordinator (e.g. BCS2025_01)</p>
                <form onSubmit={handleCheckId} className="space-y-4">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value.toUpperCase())} placeholder="BCS2025_01" className={`${inputClass} font-mono tracking-wider`} /></div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-invertis-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50">
                    {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Continue</span><ArrowRight size={16} /></>}
                  </button>
                </form>
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <div className="flex items-center gap-2 mb-1">
                  <button onClick={() => { setStep(1); setError(''); }} className="text-gray-400 hover:text-invertis-blue cursor-pointer"><ChevronLeft size={19} /></button>
                  <h2 className="text-base font-bold text-gray-900">Hello, {studentName}!</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5 ml-7">Set your email and password to activate.</p>
                <form onSubmit={handleRegister} className="space-y-3">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="yourname@email.com" className={`${inputClass} pl-10`} /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Create Password</label>
                    <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className={`${inputClass} pl-10`} /></div>
                  </div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter password" className={`${inputClass} pl-10`} /></div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-all cursor-pointer disabled:opacity-50 mt-1">
                    {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 size={16} /><span>Activate & Login</span></>}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <Link to="/login" className="text-xs text-gray-400 hover:text-invertis-blue transition-colors">← Back to Staff Login</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
