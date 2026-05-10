import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Zap, Shield, Building2, GraduationCap, Sun, Moon } from 'lucide-react';

const QUICK_LOGINS = [
  { label: 'System Admin', id: 'admin@invertis.edu.in', pass: 'admin123', icon: Shield, color: 'from-indigo-600 to-violet-700', badge: 'bg-violet-50 text-violet-600', role: 'admin' },
  { label: 'HOD (CSE)', id: 'hod.cse@invertis.edu.in', pass: 'staff123', icon: Building2, color: 'from-amber-500 to-orange-600', badge: 'bg-amber-50 text-amber-600', role: 'hod' },
  { label: 'Student (Demo)', id: '2024001', pass: 'student123', icon: GraduationCap, color: 'from-emerald-500 to-teal-600', badge: 'bg-emerald-50 text-emerald-600', role: 'student' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  const handleLogin = async (e, qId, qPass) => {
    if (e) e.preventDefault();
    const loginId = qId || identifier;
    const loginPass = qPass || password;
    setError('');
    if (!loginId || !loginPass) { setError('Identifier and password are required.'); return; }

    if (qId) setQuickLoading(qId);
    else setLoading(true);

    try {
      await login(loginId, loginPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
      setQuickLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-500 selection:bg-[#ff6b00]/10 selection:text-[#ff6b00]">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#ff6b00_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.03]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b00]/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/5 rounded-full blur-[120px] -ml-64 -mb-64" />


      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="h-16 w-16 bg-[#ff6b00] rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-[#ff6b00]/30 mb-6">
            <span className="material-symbols-outlined text-[40px]">hub</span>
          </div>
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">FeedbackHub</h1>
          <p className="text-xs text-[#474747] font-bold mt-2 uppercase tracking-[0.2em] opacity-70 text-center">System Control Tower • Invertis University</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e0e0e0] rounded-[24px] p-10 shadow-2xl shadow-black/5">
          <h2 className="text-sm font-black text-[#1A1A1A] mb-8 uppercase tracking-widest border-b border-[#f5f5f5] pb-4">Secure Terminal Access</h2>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 border border-red-100 text-[11px] font-bold rounded-xl flex items-center gap-3 uppercase tracking-wider"
            >
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-[#474747] tracking-[0.2em] ml-1">Domain Identity</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#474747] group-focus-within:text-[#ff6b00] transition-colors text-[20px]">alternate_email</span>
                <input
                  type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                  placeholder="admin@invertis.edu.in"
                  className="w-full bg-[#f9f9f9] text-[#1A1A1A] pl-12 pr-4 py-4 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#ff6b00] transition-all text-xs font-bold placeholder:text-[#474747]/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase text-[#474747] tracking-[0.2em] ml-1">Access Key</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#474747] group-focus-within:text-[#ff6b00] transition-colors text-[20px]">lock</span>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f9f9f9] text-[#1A1A1A] pl-12 pr-4 py-4 border border-[#e0e0e0] rounded-xl focus:outline-none focus:border-[#ff6b00] transition-all text-xs font-bold placeholder:text-[#474747]/30"
                />
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#ff6b00] hover:bg-[#ff6b00]/90 text-white py-5 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#ff6b00]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-75 mt-2"
            >
              {loading
                ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><span className="material-symbols-outlined text-[18px]">key</span><span>Initialize Sync</span></>
              }
            </button>
          </form>

          {/* Quick Login */}
          <div className="relative flex py-8 items-center">
            <div className="flex-grow border-t border-[#f5f5f5]" />
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-[0.3em] text-[#474747] opacity-40">
               Direct Overrides
            </span>
            <div className="flex-grow border-t border-[#f5f5f5]" />
          </div>

          <div className="flex flex-col gap-3">
            {QUICK_LOGINS.map(({ label, id: qId, pass, role }) => (
              <button
                key={qId}
                onClick={() => handleLogin(null, qId, pass)}
                disabled={!!quickLoading}
                className="w-full flex items-center justify-between p-4 bg-[#f9f9f9] hover:bg-white border border-transparent hover:border-[#ff6b00]/30 rounded-xl transition-all cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    role === 'admin' ? 'bg-[#ff6b00] text-white' : 'bg-[#1A1A1A] text-white opacity-40 group-hover:opacity-100'
                  }`}>
                    {quickLoading === qId
                      ? <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : <span className="material-symbols-outlined text-[18px]">{role === 'admin' ? 'shield' : role === 'hod' ? 'account_balance' : 'school'}</span>
                    }
                  </div>
                  <div className="text-left">
                    <div className="text-[11px] font-black text-[#1A1A1A] uppercase tracking-wider">{label}</div>
                    <div className="text-[10px] text-[#474747] font-medium opacity-50">{qId}</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[#474747] opacity-0 group-hover:opacity-100 transition-all text-[18px] translate-x-[-10px] group-hover:translate-x-0">arrow_right_alt</span>
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] font-bold text-[#474747] opacity-40 uppercase tracking-widest">
           &copy; 2026 Invertis Feedback Protocol • Security v2.4
        </p>
      </motion.div>
    </div>
  );
}
