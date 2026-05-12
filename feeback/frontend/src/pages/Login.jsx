import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn, Lock, User, ChevronRight, Eye, EyeOff,
  GraduationCap, Building2, Shield, Users, ArrowRight, ChevronLeft
} from 'lucide-react';
import api from '../services/api';

const roleHint = (id) => {
  if (!id) return null;
  if (id.includes('@')) {
    if (id.includes('admin')) return { icon: Shield, label: 'Super Admin', color: 'text-rose-500' };
    if (id.includes('coordinator')) return { icon: Users, label: 'Coordinator', color: 'text-violet-500' };
    if (id.includes('hod')) return { icon: Building2, label: 'Head of Department', color: 'text-blue-500' };
    return { icon: User, label: 'Staff Account', color: 'text-indigo-500' };
  }
  if (/^[A-Z]{2,4}\d{4}_\d+$/.test(id.toUpperCase())) {
    return { icon: GraduationCap, label: 'Student Account', color: 'text-emerald-500' };
  }
  return null;
};

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [step,       setStep]       = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [password,   setPassword]   = useState('');
  const [showPass,   setShowPass]   = useState(false);
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);
  const [pendingStudent, setPendingStudent] = useState(null);
  const [regEmail,   setRegEmail]   = useState('');
  const [regPass,    setRegPass]    = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const hint = roleHint(identifier);

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    const id = identifier.trim();
    if (!id) { setError('Please enter your email or Student ID.'); return; }
    if (!id.includes('@')) {
      setLoading(true);
      try {
        const res = await api.post('/auth/check-student', { student_id: id.toUpperCase() });
        if (res.data.status === 'pending') {
          setPendingStudent({ student_id: id.toUpperCase(), name: res.data.name });
          setStep(3);
          return;
        }
        setStep(2);
      } catch (err) {
        setError(err.response?.data?.message || 'Student ID not found. Contact your coordinator.');
      } finally {
        setLoading(false);
      }
    } else {
      setStep(2);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      await login({ identifier: identifier.trim(), password });
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'ACCOUNT_PENDING') {
        setPendingStudent({ student_id: err.response.data.student_id, name: err.response.data.name });
        setStep(3);
        return;
      }
      setError(msg || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!regEmail || !regPass || !regConfirm) { setError('All fields are required.'); return; }
    if (regPass !== regConfirm) { setError('Passwords do not match.'); return; }
    if (regPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/complete-registration', {
        student_id: pendingStudent.student_id, email: regEmail, password: regPass
      });
      await login({ identifier: regEmail, password: regPass });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetToStep1 = () => {
    setStep(1); setError(''); setPassword(''); setPendingStudent(null);
    setRegEmail(''); setRegPass(''); setRegConfirm('');
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-invertis-navy via-invertis-blue to-blue-500 relative overflow-hidden items-center justify-center p-12">
        <div className="relative z-10 text-white">
          <img src="/logo.png" alt="Invertis University" className="w-20 h-20 rounded-2xl object-contain bg-white/20 backdrop-blur-sm p-2 mb-8" />
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Invertis<br />Feedback System
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed max-w-md">
            Empowering academic excellence through structured, anonymous, and actionable student feedback.
          </p>
          <div className="mt-12 space-y-3 text-blue-200 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" /> Anonymous & Secure Submissions
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400" /> Real-time Analytics Dashboard
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-400" /> 5-Tier Role-based Access
            </div>
          </div>
        </div>
        {/* Decorative */}
        <img src="/images.jpg" alt="" className="absolute right-0 bottom-0 w-48 h-48 object-cover rounded-full opacity-20 blur-sm" />
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute right-20 -bottom-32 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -left-10 bottom-20 w-32 h-32 bg-white/5 rounded-full" />
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="Invertis" className="w-10 h-10 rounded-lg object-contain" />
            <div>
              <h2 className="text-invertis-blue font-bold text-sm">Invertis Feedback System</h2>
              <p className="text-gray-400 text-xs">Teaching-Learning Feedback</p>
            </div>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].slice(0, pendingStudent || step === 3 ? 3 : 2).map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= s ? 'bg-invertis-blue' : 'bg-gray-200'}`} />
            ))}
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
                  Step {step} of {pendingStudent || step === 3 ? 3 : 2}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  {step === 1 && 'Sign In'}
                  {step === 2 && 'Enter Password'}
                  {step === 3 && `Welcome, ${pendingStudent?.name?.split(' ')[0]}!`}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {step === 1 && 'Enter your email or student ID to continue'}
                  {step === 2 && 'Enter your password to access your portal'}
                  {step === 3 && 'Set up your account to get started'}
                </p>
              </div>
              {step > 1 && (
                <button onClick={resetToStep1}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-invertis-blue transition-colors cursor-pointer">
                  <ChevronLeft size={14} /> Back
                </button>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">

            {/* STEP 1: Identifier */}
            {step === 1 && (
              <motion.form key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleNext} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email or Student ID</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text" value={identifier}
                      onChange={e => { setIdentifier(e.target.value); setError(''); }}
                      placeholder="email@invertis.edu.in  or  BCS2025_01"
                      autoFocus
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    {hint && <hint.icon className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${hint.color}`} size={16} />}
                  </div>
                  {hint && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-1.5 text-xs font-semibold mt-1.5 ${hint.color}`}>
                      <hint.icon size={12} /> {hint.label}
                    </motion.div>
                  )}
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-invertis-blue text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-invertis-blue/25 disabled:opacity-50 cursor-pointer">
                  {loading
                    ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><span>Continue</span><ChevronRight size={16} /></>
                  }
                </button>

                <p className="text-center text-xs text-gray-400">
                  Enter your university email or student roll number
                </p>
              </motion.form>
            )}

            {/* STEP 2: Password */}
            {step === 2 && (
              <motion.form key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleLogin} className="space-y-5">

                {/* Who is logging in */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200">
                  {hint && <hint.icon size={16} className={hint.color} />}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-900 truncate">{identifier}</div>
                    {hint && <div className={`text-xs font-medium ${hint.color}`}>{hint.label}</div>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type={showPass ? 'text' : 'password'} value={password}
                      onChange={e => { setPassword(e.target.value); setError(''); }}
                      placeholder="Enter your password" autoFocus
                      className={`${inputClass} pl-10 pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-invertis-blue text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-sm shadow-invertis-blue/25 disabled:opacity-50 cursor-pointer">
                  {loading
                    ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><LogIn size={16} /><span>Sign In</span></>
                  }
                </button>
              </motion.form>
            )}

            {/* STEP 3: Registration */}
            {step === 3 && (
              <motion.form key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                onSubmit={handleRegister} className="space-y-4">

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">
                  Your account is pending activation. Set your email and create a password to get started.
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Email Address</label>
                  <input type="email" value={regEmail} onChange={e => { setRegEmail(e.target.value); setError(''); }}
                    placeholder="yourname@email.com" autoFocus className={inputClass} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Create Password</label>
                  <div className="relative">
                    <input type={showRegPass ? 'text' : 'password'} value={regPass}
                      onChange={e => { setRegPass(e.target.value); setError(''); }}
                      placeholder="Min. 8 characters" className={`${inputClass} pr-11`} />
                    <button type="button" onClick={() => setShowRegPass(!showRegPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                      {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <input type="password" value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setError(''); }}
                    placeholder="Re-enter password" className={inputClass} />
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/25 disabled:opacity-50 cursor-pointer mt-1">
                  {loading
                    ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <><ArrowRight size={16} /><span>Activate Account & Login</span></>
                  }
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          <p className="text-center text-[10px] text-gray-400 mt-8">
            Invertis University, Bareilly &nbsp;·&nbsp; TLFQ v2.0 &nbsp;·&nbsp; © 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
