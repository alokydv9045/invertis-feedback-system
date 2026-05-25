import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, AlertCircle, ShieldCheck, Lock, Mail, CheckCircle
} from 'lucide-react';
import { Alert } from '../components/ui';
import api from '../services/api';

const roleHint = (id) => {
  if (!id) return null;
  if (id.includes('@')) {
    if (id.includes('admin')) return { label: 'Super Admin' };
    if (id.includes('coordinator')) return { label: 'Coordinator' };
    if (id.includes('hod')) return { label: 'Head of Department' };
    return { label: 'Staff Account' };
  }
  if (/^[A-Z]{2,4}\d{4}_\d+$/.test(id.toUpperCase())) {
    return { label: 'Student Account' };
  }
  return null;
};

const slideshowImages = [
  '/campus1.png',
  '/campus2.png',
  '/campus_csed.png',
  '/campus4.jpg',
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Slideshow state
  const [activeIndex, setActiveIndex] = useState(0);

  // Form states
  const [step, setStep] = useState(1);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // For pending students
  const [pendingStudent, setPendingStudent] = useState(null);
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const hint = roleHint(identifier);

  // Slideshow effect
  useEffect(() => {
    // Preload slideshow images
    slideshowImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    const id = identifier.trim();
    if (!id) { setError('Please enter your Username / Student ID.'); return; }

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
        if (err.message === 'Network Error' || !err.response) {
          setError('Cannot connect to server. Please verify the backend is running.');
        } else {
          setError(err.response?.data?.message || 'User ID not found.');
        }
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
      if (err.message === 'Network Error' || !err.response) {
        setError('Cannot connect to server. Please verify the backend is running.');
      } else {
        const msg = err.response?.data?.message;
        if (msg === 'ACCOUNT_PENDING') {
          setPendingStudent({ student_id: err.response.data.student_id, name: err.response.data.name });
          setStep(3);
          return;
        }
        setError(msg || 'Login failed. Please verify credentials.');
      }
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

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-hidden select-none font-sans bg-slate-50">
      {/* ── Background Slideshow Carousel ── */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {slideshowImages.map((src, idx) => (
          <div
            key={src}
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-[1200ms] ease-in-out transform ${
              idx === activeIndex
                ? 'opacity-100 scale-105 filter brightness-100'
                : 'opacity-0 scale-100'
            }`}
            style={{ backgroundImage: `url('${src}')` }}
          />
        ))}
        {/* Fully transparent — no overlay, background image shows completely */}
      </div>

      {/* ── Top Header ── */}
      <header className="w-full relative z-20 px-6 py-4 flex items-center justify-between border-b-[3px] border-[#FF5A36] bg-white/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img src="/main logo.png" alt="Invertis" className="h-9 object-contain" />
          <div className="text-left">
            {/* FIXED: Stronger color for header text */}
            <div className="text-[#1D3557] font-semibold text-sm tracking-wide leading-none">INVERTIS UNIVERSITY</div>
            <div className="text-slate-600 text-[8px] font-semibold tracking-widest uppercase mt-1">Feedback Portal</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1D3557]/8 border border-[#1D3557]/15 text-[#1D3557] text-[10px] font-semibold tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ERP Secure Access
        </div>
      </header>

      {/* ── Centered White Glassmorphic Login Card ── */}
      <main className="flex-1 flex items-center justify-center p-4 relative z-20 my-6">
        <div className="w-full max-w-sm">
          {/* Main Card — FIXED: Much more opaque, clearly readable */}
          <div
            className="w-full rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300"
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: '0 8px 40px 0 rgba(30,50,80,0.13), 0 1.5px 6px 0 rgba(30,50,80,0.07)',
            }}
          >
            {/* Orange accent strip */}
            <div className="w-full h-[3px] bg-[#FF5A36]" />

            {/* Card Header — FIXED: Strong, dark readable text */}
            <div className="px-6 pt-6 pb-3 text-center">
              <h2 className="text-xl font-semibold text-slate-900 tracking-wide">
                {step === 1 && 'Authentication'}
                {step === 2 && 'Enter Password'}
                {step === 3 && 'Activate Account'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 font-normal">
                {step === 1 && 'Teaching-Learning Feedback System'}
                {step === 2 && 'Please input your portal key'}
                {step === 3 && 'Complete student profile registration'}
              </p>
            </div>

            {/* Card Form Body */}
            <div className="px-6 pb-6 pt-3 space-y-4">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-4">
                  <div className="space-y-1">
                    {/* FIXED: Darker label text */}
                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest block ml-1">Username or Student ID</label>
                    <div className="relative flex items-center">
                      <UserIcon className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="e.g. admin@invertis.edu.in or BCS2025_01"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] hover:border-slate-400 transition-all duration-200 font-sans"
                      />
                    </div>
                    {hint?.label && (
                      <span className="text-[10px] font-semibold text-[#FF5A36] bg-[#FF5A36]/10 px-2.5 py-0.5 rounded-full inline-block mt-1.5 ml-1">
                        {hint.label}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-[#1D3557] hover:bg-[#152840] text-white font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mt-2"
                  >
                    {loading ? (
                      <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Proceed'
                    )}
                  </button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      {/* FIXED: Darker secondary text */}
                      <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">Signing in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate max-w-[240px] mt-0.5">{identifier}</p>
                    </div>
                    <span className="text-[9px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-wide">
                      {hint?.label || 'Account'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest block ml-1">Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] hover:border-slate-400 transition-all duration-200 font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetToStep1}
                      disabled={loading}
                      className="w-1/3 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 cursor-pointer text-center animate-fade-in"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-[#1D3557] hover:bg-[#152840] text-white font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                    <CheckCircle className="text-emerald-600 shrink-0" size={18} />
                    <div>
                      <p className="text-[9px] font-semibold text-emerald-700 uppercase tracking-widest">Verify Student Profile</p>
                      <p className="text-xs font-semibold text-emerald-900 mt-0.5">{pendingStudent?.name} ({pendingStudent?.student_id})</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest block ml-1">Current Email Address</label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        placeholder="yourname@domain.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] hover:border-slate-400 transition-all duration-200 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest block ml-1">Choose Password (min 8 chars)</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] hover:border-slate-400 transition-all duration-200 font-sans"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest block ml-1">Confirm Password</label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regConfirm}
                        onChange={(e) => setRegConfirm(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A36]/10 focus:border-[#FF5A36] hover:border-slate-400 transition-all duration-200 font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={resetToStep1}
                      disabled={loading}
                      className="w-1/3 py-3 border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 bg-[#1D3557] hover:bg-[#152840] text-white font-medium text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <div className="h-4.5 w-4.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Activate & Log In'
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 1 && (
                <div className="pt-4 border-t border-slate-200 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#FF5A36] mt-0.5 shrink-0" />
                    {/* FIXED: Darker helper text */}
                    <p className="text-[10px] text-slate-600 leading-normal">Your responses are strictly anonymous to faculty members. Individual submissions cannot be traced back to you.</p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#FF5A36] mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-600 leading-normal">System audit controls apply. Global configuration is managed by authorized university officers.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-5">
            {/* FIXED: Slightly more visible version tag */}
            <p className="text-[9px] text-slate-500 font-semibold tracking-wider uppercase">Invertis TLFQ System v2.0</p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full relative z-20 bg-white/95 backdrop-blur-sm py-4 text-center text-slate-600 border-t border-slate-200">
        <p className="text-[10px] px-4 leading-relaxed font-normal">
          © 2026 Invertis University. Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.
        </p>
      </footer>
    </div>
  );
}
