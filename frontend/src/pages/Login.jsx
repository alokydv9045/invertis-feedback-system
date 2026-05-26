import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, AlertCircle, ShieldCheck, Lock, Mail, ArrowLeft
} from 'lucide-react';
import { Button, Input, Alert } from '../components/ui';
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

const slides = [
  '/ib2.jpg',
  'https://www.invertisuniversity.ac.in/images/home-university.webp'
  

];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Step 1: identifier, Step 2: password, Step 3: Registration
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

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const hint = roleHint(identifier);

  const handleNext = async (e) => {
    e.preventDefault();
    setError('');
    const id = identifier.trim();
    if (!id) { setError('Please enter your User Name / Student ID.'); return; }

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
        setError(err.response?.data?.message || 'User ID not found.');
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

  return (
    <div className="min-h-screen flex flex-col bg-[#F1FAEE] font-sans">
      {/* Header */}
      <div className="w-full bg-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b-[3px] border-[#FF2A00] shadow-sm z-20">
        <div className="flex items-center gap-3 sm:gap-4">
          <img src="/main logo.png" alt="Invertis University Logo" className="h-10 sm:h-12 object-contain" />
          <div className="h-8 w-[1px] bg-slate-200 hidden sm:block" />
          <div>
            <h1 className="text-xs sm:text-sm font-black text-[#1D3557] tracking-wider uppercase leading-tight">Invertis University</h1>
            <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 tracking-wider uppercase leading-none mt-0.5">Feedback Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 border border-slate-200 rounded-full px-3 py-1.5 bg-slate-50/50 shadow-sm">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">ERP Secure Access</span>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Slideshow background */}
        {slides.map((slide, index) => (
          <div
            key={slide}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ease-in-out"
            style={{
              backgroundImage: `url(${slide})`,
              opacity: index === currentSlide ? 1 : 0
            }}
          />
        ))}
        {/* Soft overlay */}
        <div className="absolute inset-0 bg-black/10" />

        <div className="w-full max-w-lg relative z-10 p-2 sm:p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl border-t-[5px] border-t-[#FF2A00] border-x border-b border-slate-100/50 overflow-hidden px-6 sm:px-8 py-8 space-y-6">
            
            {/* Title / Subtitle */}
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#1D3557] tracking-tight">
                {step === 1 && 'Authentication'}
                {step === 2 && 'Security Verification'}
                {step === 3 && 'Complete Registration'}
              </h2>
              <p className="text-[11px] text-slate-500 font-bold mt-1.5 tracking-wider uppercase">
                {step === 3 ? `Registration for ${pendingStudent?.name}` : 'Teaching-Learning Feedback System'}
              </p>
            </div>

            {error && <Alert variant="error" closeable onClose={() => setError('')}>{error}</Alert>}

            {/* Step 1: Username / ID */}
            {step === 1 && (
              <form onSubmit={handleNext} className="space-y-5">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                    Username or Student ID
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. admin@invertis.edu.in or BCS2025_01"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    leadingIcon={UserIcon}
                    className="!rounded-full !py-3.5 !border-slate-200 focus:!border-[#1D3557] focus:!ring-[#1D3557]/10"
                    hint={hint?.label}
                  />
                </div>
                <Button
                  type="submit"
                  variant="ghost"
                  disabled={loading}
                  loading={loading}
                  fullWidth
                  className="!rounded-full !py-3.5 bg-[#1D3557] hover:bg-[#152741] text-white font-bold"
                >
                  Proceed
                </Button>
              </form>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-4 text-left">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Signing in as</p>
                  <p className="text-sm font-bold text-[#1D3557] truncate">{identifier}</p>
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    leadingIcon={Lock}
                    className="!rounded-full !py-3.5 !border-slate-200 focus:!border-[#1D3557] focus:!ring-[#1D3557]/10"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetToStep1}
                    disabled={loading}
                    className="w-full sm:w-1/3 !rounded-full !py-3.5 !border-slate-300 !text-slate-700 hover:!bg-slate-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={loading}
                    loading={loading}
                    className="flex-1 !rounded-full !py-3.5 bg-[#1D3557] hover:bg-[#152741] text-white"
                  >
                    Sign In
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: Registration */}
            {step === 3 && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1.5 bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-2 text-left">
                  <p className="text-[10px] text-emerald-700 uppercase font-black tracking-wider">Welcome,</p>
                  <p className="text-sm font-bold text-emerald-900 truncate">{pendingStudent?.name} ({pendingStudent?.student_id})</p>
                </div>
                
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Your current email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    leadingIcon={Mail}
                    className="!rounded-full !py-3.5 !border-slate-200 focus:!border-[#1D3557] focus:!ring-[#1D3557]/10"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Min 8 chars"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    leadingIcon={Lock}
                    className="!rounded-full !py-3.5 !border-slate-200 focus:!border-[#1D3557] focus:!ring-[#1D3557]/10"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block pl-1">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    leadingIcon={Lock}
                    className="!rounded-full !py-3.5 !border-slate-200 focus:!border-[#1D3557] focus:!ring-[#1D3557]/10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={resetToStep1}
                    disabled={loading}
                    className="w-full sm:w-1/3 !rounded-full !py-3.5 !border-slate-300 !text-slate-700 hover:!bg-slate-50"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    disabled={loading}
                    loading={loading}
                    className="flex-1 !rounded-full !py-3.5 bg-[#1D3557] hover:bg-[#152741] text-white"
                  >
                    Activate & Login
                  </Button>
                </div>
              </form>
            )}

            {/* Bottom info messages */}
            <div className="pt-6 border-t border-slate-100 space-y-3.5 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#FF2A00] mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  Your responses are strictly anonymous to faculty members. Individual submissions cannot be traced back to you.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#FF2A00] mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  System audit controls apply. Global configuration is managed by authorized university officers.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom small text overlay */}
          <div className="text-center mt-6">
            <p className="text-[10px] font-black text-white/90 uppercase tracking-widest drop-shadow-md">
              INVERTIS TLFQ SYSTEM V2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

