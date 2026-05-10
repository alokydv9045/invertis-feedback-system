import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Zap, Shield, Building2, GraduationCap, Eye, EyeOff, User, ShieldCheck } from 'lucide-react';

const QUICK_LOGINS = [
  { label: 'System Admin', email: 'admin@invertis.edu.in', pass: 'admin123', icon: Shield, color: 'text-rose-600' },
  { label: 'HOD – CSE', email: 'hod.cse@invertis.edu.in', pass: 'hod123', icon: Building2, color: 'text-blue-600' },
  { label: 'Student', email: 'student1@invertis.edu.in', pass: 'student123', icon: GraduationCap, color: 'text-emerald-600' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  const handleLogin = async (e, qEmail, qPass) => {
    if (e) e.preventDefault();
    const loginEmail = qEmail || email;
    const loginPass = qPass || password;
    setError('');
    if (!loginEmail || !loginPass) { setError('Email and password are required.'); return; }

    if (qEmail) setQuickLoading(qEmail);
    else setLoading(true);

    try {
      await login(loginEmail, loginPass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
      setQuickLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans antialiased">
      {/* Custom styles for the campus blur background */}
      <style>{`
        .bg-campus-blur {
          background-image: linear-gradient(rgba(15, 118, 110, 0.4), rgba(15, 118, 110, 0.4)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuD2INi0n_XlwTrm43drTlNMC0u6PhCF_WzfFRekcGwVTsHG6dvIOeVLXMhxSWUcxh_LoWgUI99pnNcHw2WVCsvWUUXizK4C1wd04Kc8MJ4xiXj0tj-dv3xmbJ9sJPX_Zkpzb-avOmF3CfbHhpCoCt6Ksh2jBqqxHwQbxseox_ED8Fa80ZpZ4Xwlxo7MiojR6U0-RJSAM84cYnnGTSEqxji4Gx5xjmTfBpJhAO2JdkQlW51sRVNTQiOGu56OcLfGzK7D85lKFqMMwAc);
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
      `}</style>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-4 relative z-10 bg-campus-blur">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#f0f2f5] rounded-lg shadow-2xl overflow-hidden w-full max-w-[420px]"
        >
          {/* Card Header */}
          <div className="bg-[#d32f2f] px-6 py-8 text-center text-white shadow-sm">
            <h1 className="text-3xl font-bold mb-1 tracking-tight">Student Login</h1>
            <h2 className="text-xs font-semibold tracking-widest opacity-90 uppercase">Invertis Student Feedback System</h2>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {error && (
              <div className="mb-6 p-3 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-md flex items-center gap-2">
                <Shield size={14} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="studentId">
                  Username/Student ID
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400 group-focus-within:text-[#0288d1] transition-colors" />
                  </div>
                  <input
                    id="studentId" type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="Enter Student ID" required
                    className="block w-full pl-11 pr-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0288d1] focus:border-[#0288d1] sm:text-sm bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-[#0288d1] transition-colors" />
                  </div>
                  <input
                    id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    className="block w-full pl-11 pr-11 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-[#0288d1] focus:border-[#0288d1] sm:text-sm bg-white transition-all outline-none"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                  </div>
                </div>
              </div>

              {/* Options Row */}
              <div className="flex items-center justify-between text-sm pt-1">
                <div className="flex items-center">
                  <input className="h-4 w-4 text-[#0288d1] focus:ring-[#0288d1] border-gray-300 rounded cursor-pointer" id="remember-me" type="checkbox" />
                  <label className="ml-2 block text-gray-600 cursor-pointer font-medium" htmlFor="remember-me">
                    Remember me
                  </label>
                </div>
                <a className="font-bold text-[#0288d1] hover:text-[#0277bd]" href="#">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button 
                  type="submit" disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-[#0288d1] hover:bg-[#0277bd] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0288d1] transition-all duration-200 uppercase tracking-wide disabled:opacity-70"
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 mr-2" />
                  )}
                  SECURE SIGN IN
                </button>
              </div>

              {/* Demo Logins Divider */}
              <div className="relative flex items-center py-2 mt-4">
                <div className="flex-grow border-t border-gray-300" />
                <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Demo Access</span>
                <div className="flex-grow border-t border-gray-300" />
              </div>

              {/* Quick Logins */}
              <div className="grid grid-cols-1 gap-2">
                {QUICK_LOGINS.map(({ label, email: qEmail, pass, icon: Icon, color }) => (
                  <button
                    key={qEmail}
                    type="button"
                    onClick={() => handleLogin(null, qEmail, pass)}
                    disabled={!!quickLoading}
                    className="flex items-center justify-between px-4 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <div className="text-left">
                        <div className="text-[11px] font-bold text-gray-700">{label}</div>
                      </div>
                    </div>
                    {quickLoading === qEmail ? (
                      <div className="h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3 text-gray-300 group-hover:text-yellow-500" />
                    )}
                  </button>
                ))}
              </div>

              {/* Registration Link */}
              <div className="text-center mt-6 text-xs text-gray-500">
                Don't have an account? <a className="font-bold text-[#0288d1] hover:underline" href="#">New Registration</a>
              </div>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white/95 backdrop-blur-sm border-t border-gray-200 py-4 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-gray-500 text-center sm:text-left">
            <p className="font-semibold text-gray-600">© 2024 Invertis University. All Rights Reserved.</p>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">Maintaining Academic Excellence since 1998</p>
          </div>
          <div>
            <button className="bg-[#00acc1] hover:bg-[#0097a7] text-white text-[11px] font-black uppercase tracking-widest py-2 px-6 rounded shadow-sm transition-all transform active:scale-95" type="button">
              Need Help?
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
