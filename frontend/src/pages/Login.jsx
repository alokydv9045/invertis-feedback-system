import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  User as UserIcon, AlertCircle, ShieldCheck
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
    <div className="min-h-screen flex flex-col bg-[#F1FAEE]">
      {/* Header */}
      <div className="w-full bg-[#1D3557] px-6 py-4 flex items-center gap-4">
        <img src="/main logo.png" alt="Invertis University Logo" className="w-[116px] h-12 object-contain" />

      </div>
      <div className="w-full h-1 bg-[#E63946]" />

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 25% 25%, #1D3557 1px, transparent 1px), radial-gradient(circle at 75% 75%, #E63946 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-[#DEE2E6]">
            <div className="bg-[#E63946] px-6 py-4 text-center relative text-white">
              <h2 className="text-xl font-semibold">
                {step === 1 && 'Sign in to your account'}
                {step === 2 && 'Enter Password'}
                {step === 3 && 'Complete Registration'}
              </h2>
              {step > 1 && (
                <button onClick={resetToStep1} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white text-xs underline">
                  Back
                </button>
              )}
            </div>

            <div className="px-8 py-8 space-y-5">
              {error && <Alert variant="error" closeable onClose={() => setError('')}>{error}</Alert>}

              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-5">
                  <Input
                    type="text"
                    placeholder="Username or ID"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={loading}
                    hint={hint?.label}
                  />
                  <Button type="submit" disabled={loading} loading={loading} fullWidth>
                    Next
                  </Button>
                </form>
              )}

              {step === 2 && (
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded border border-gray-200 mb-4">
                    <p className="text-xs text-gray-500 uppercase font-bold">Signing in as</p>
                    <p className="text-sm font-medium text-[#1D3557] truncate">{identifier}</p>
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <Button type="submit" disabled={loading} loading={loading} fullWidth>
                    <UserIcon className="w-4 h-4" />
                    Sign In
                  </Button>
                </form>
              )}

              {step === 3 && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1.5 bg-green-50 p-3 rounded border border-green-200 mb-2">
                    <p className="text-xs text-green-700 uppercase font-bold">Welcome,</p>
                    <p className="text-sm font-medium text-green-900 truncate">{pendingStudent?.name} ({pendingStudent?.student_id})</p>
                  </div>
                  <Input
                    type="email"
                    placeholder="Your current email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Min 8 chars"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                  />
                  <Button type="submit" disabled={loading} loading={loading} fullWidth variant="danger">
                    Activate & Login
                  </Button>
                </form>
              )}

              {step === 1 && (
                <div className="pt-4 border-t border-[#DEE2E6] space-y-2">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#457B9D] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#6C757D]">Your feedback is anonymous to faculty. Responses cannot be traced back to individual students.</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#457B9D] mt-0.5 shrink-0" />
                    <p className="text-xs text-[#6C757D]">Admin audit access applies. Only authorized administrators can view detailed analytics.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="text-center mt-4">
            <p className="text-xs text-[#6C757D]">Faculty Feedback & Analytics Portal v2.0</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-black text-white text-center py-3 px-4">
        <p className="text-xs">
          © {new Date().getFullYear()} Invertis University, Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.
        </p>
      </div>
    </div>
  );
}
