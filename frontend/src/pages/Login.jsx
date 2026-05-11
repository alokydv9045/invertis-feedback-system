import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Building2, GraduationCap, Zap, User, Lock, ArrowRight } from 'lucide-react';

const QUICK_LOGINS = [
  { label: 'System Admin', email: 'admin@invertis.edu.in', pass: 'admin123', icon: Shield, color: 'text-rose-600', bg: 'bg-rose-50' },
  { label: 'HOD Login', email: 'hod.cse@invertis.edu.in', pass: 'hod123', icon: Building2, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Student Login', email: 'student1@invertis.edu.in', pass: 'student123', icon: GraduationCap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e, qEmail, qPass) => {
    if (e) e.preventDefault();
    const loginEmail = qEmail || email;
    const loginPass = qPass || password;
    setError('');
    
    setLoading(true);
    try {
      await login(loginEmail, loginPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#f15a24]/5 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#1a2233]/5 rounded-full blur-3xl"></div>

      {/* Logo Area */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 bg-gradient-to-br from-[#1a2233] to-[#242f45] rounded-lg flex items-center justify-center text-white font-black shadow-xl shadow-slate-900/20 border border-white/10 text-xl">I</div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-[#1a2233] leading-none tracking-tight"><span className="text-[#f15a24]">Invertis</span> University</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mt-1">Academic Portal</span>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] bg-white border border-[#e2e8f0] rounded-2xl shadow-2xl p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
        <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
        
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl mb-4 shadow-sm border border-orange-200/50">
            <GraduationCap size={28} className="text-[#f15a24]" />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Student Login</h1>
          <p className="text-[13px] text-gray-500 mt-1 font-medium italic">Access the Feedback System</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Student ID</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your ID"
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all pl-10 text-sm" required 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-gray-500">Password</label>
              <a href="#" className="text-[10px] font-bold text-[#2d3fe0] hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input 
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 bg-white border border-[#e2e8f0] rounded focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all pl-10 text-sm" required 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" className="rounded border-gray-300 text-[#2d3fe0] focus:ring-[#2d3fe0]" id="rem" />
            <label htmlFor="rem" className="text-xs text-gray-600 font-medium">Remember me</label>
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-[#f15a24] hover:bg-[#d94e1d] text-white font-bold py-3.5 rounded transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
          >
            {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={18} />
          </button>
        </form>

        {/* PROMINENT QUICK LOGIN SECTION */}
        <div className="mt-10">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-gray-400">
              <span className="bg-white px-4 italic">Quick Demo Access</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {QUICK_LOGINS.map(({ label, email: qEmail, pass, icon: Icon, color, bg }) => (
              <button
                key={qEmail}
                type="button"
                onClick={() => handleLogin(null, qEmail, pass)}
                className={`flex items-center justify-between p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-all group shadow-sm bg-gray-50/50 hover:bg-white`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded flex items-center justify-center bg-white border border-gray-100 ${color} group-hover:scale-110 transition-transform`}>
                    <Icon size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{label}</span>
                </div>
                <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f15a24] transition-all group-hover:translate-x-1" />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[#e2e8f0] text-center">
          <p className="text-[11px] text-gray-500 font-medium">By signing in, you agree to our <a href="#" className="text-[#f15a24] hover:underline">Terms of Service</a></p>
        </div>
      </motion.div>

      <div className="mt-10 text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-4">
        <span>© 2024 Invertis University</span>
        <span className="text-gray-200">|</span>
        <span>All Rights Reserved</span>
      </div>
    </div>
  );
}
