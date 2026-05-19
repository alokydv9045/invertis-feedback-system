import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Building2, GraduationCap, Users, Crown, KeyRound, X, Check, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ROLE_CONFIG = {
  supreme:     { label: 'Supreme',      icon: Crown,        color: 'text-accent-300',   bg: 'bg-accent-500/15 border-accent-500/30' },
  super_admin: { label: 'Super Admin',  icon: Shield,       color: 'text-accent-300',   bg: 'bg-accent-500/15 border-accent-500/30' },
  coordinator: { label: 'Coordinator',  icon: Users,        color: 'text-primary-300',  bg: 'bg-primary-500/15 border-primary-500/30' },
  hod:         { label: 'Head of Dept', icon: Building2,    color: 'text-primary-300',  bg: 'bg-primary-500/15 border-primary-500/30' },
  student:     { label: 'Student',      icon: GraduationCap,color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/25' },
};

// Roles allowed to change their own password via Navbar
const CAN_CHANGE_PASSWORD = ['supreme', 'super_admin', 'hod'];

function ChangePasswordModal({ onClose }) {
  const [current,  setCurrent]  = useState('');
  const [newPwd,   setNewPwd]   = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showCur,  setShowCur]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [msg,      setMsg]      = useState(null);

  const submit = async () => {
    if (!current || !newPwd || !confirm) return setMsg({ type: 'error', text: 'All fields are required.' });
    if (newPwd.length < 8)              return setMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
    if (newPwd !== confirm)             return setMsg({ type: 'error', text: 'New passwords do not match.' });
    setLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: current, new_password: newPwd });
      setMsg({ type: 'success', text: 'Password changed successfully!' });
      setTimeout(onClose, 1500);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed to change password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md card-main p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex items-center justify-center">
              <KeyRound size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-[var(--text-main)]">Change Password</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Update your account password</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] hover:bg-white/10 rounded-xl transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Current Password</label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                value={current}
                onChange={e => setCurrent(e.target.value)}
                placeholder="Your current password"
                className="w-full bg-[var(--bg-input)] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 pr-10"
              />
              <button type="button" onClick={() => setShowCur(!showCur)} className="absolute right-3 top-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                {showCur ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={e => setNewPwd(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-[var(--bg-input)] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 cursor-pointer">
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              className="w-full bg-[var(--bg-input)] border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {msg && (
            <div className={`text-xs font-semibold p-3 rounded-xl border flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                : 'bg-accent-950/60 text-accent-400 border-accent-900/60'
            }`}>
              {msg.type === 'success' ? <Check size={13} /> : <X size={13} />}
              {msg.text}
            </div>
          )}

          <button
            id="change-password-submit"
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full justify-center mt-1"
          >
            {loading
              ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Check size={16} />}
            {loading ? 'Saving…' : 'Update Password'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;
  const RoleIcon = role.icon;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-[#1D3557] border-b-4 border-[#E63946] select-none"
        
      >
        {/* Brand */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.location.href = '/'}>
          <img src="/main logo.png" alt="Invertis University Logo" className="w-[116px] h-12 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-white tracking-wide leading-tight">INVERTIS</h1>
            <p className="text-[10px] text-[#A8DADC] tracking-widest uppercase leading-tight">University Bareilly</p>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {user && (
            <div className="hidden md:flex items-center gap-3 mr-1">
              <div className="text-right">
                <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                {user.student_id && <div className="text-[10px] text-slate-300 mt-0.5 font-mono-styled">{user.student_id}</div>}
              </div>
              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border ${role.bg} ${role.color}`}>
                <RoleIcon size={10} />
                {role.label}
              </div>
            </div>
          )}

          {/* Change password button — only for allowed roles */}
          {CAN_CHANGE_PASSWORD.includes(user?.role) && (
            <button
              id="change-password-btn"
              onClick={() => setShowChangePwd(true)}
              title="Change Password"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:text-primary-400 hover:bg-primary-500/10 border border-white/8 hover:border-primary-500/25 transition-all duration-200 cursor-pointer"
            >
              <KeyRound size={14} />
              <span className="hidden sm:inline">Password</span>
            </button>
          )}

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-bold text-slate-300 hover:text-accent-400 hover:bg-accent-500/10 border border-white/8 hover:border-accent-500/25 transition-all duration-200 cursor-pointer"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </motion.nav>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
      </AnimatePresence>
    </>
  );
}
