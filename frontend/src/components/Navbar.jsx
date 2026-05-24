import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Shield, Building2, GraduationCap, Users, Crown, KeyRound,
  X, Check, Eye, EyeOff, Megaphone, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const ROLE_CONFIG = {
  supreme:     { label: 'Supreme Authority', icon: Crown,         color: '#F59E0B' },
  super_admin: { label: 'Super Admin',        icon: Shield,        color: '#60A5FA' },
  coordinator: { label: 'Coordinator',        icon: Users,         color: '#34D399' },
  hod:         { label: 'Head of Dept',       icon: Building2,     color: '#A78BFA' },
  student:     { label: 'Student',            icon: GraduationCap, color: '#6EE7B7' },
};

const CAN_CHANGE_PASSWORD = ['supreme', 'super_admin', 'hod'];

function ChangePasswordModal({ onClose }) {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async () => {
    if (!current || !newPwd || !confirm) return setMsg({ type: 'error', text: 'All fields are required.' });
    if (newPwd.length < 8) return setMsg({ type: 'error', text: 'Min 8 characters required.' });
    if (newPwd !== confirm) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    setLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: current, new_password: newPwd });
      setMsg({ type: 'success', text: 'Password updated!' });
      setTimeout(onClose, 1500);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        className="w-full max-w-sm bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Modal header */}
        <div className="bg-[#1D3557] px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <KeyRound size={15} className="text-white" />
            <span className="text-white font-bold text-sm">Change Password</span>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white cursor-pointer transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="h-0.5 bg-[#FF2A00]" />

        <div className="p-5 flex flex-col gap-3.5">
          {[
            { label: 'Current Password', value: current, onChange: setCurrent, show: showCur, toggle: () => setShowCur(!showCur) },
            { label: 'New Password',     value: newPwd,  onChange: setNewPwd,  show: showNew, toggle: () => setShowNew(!showNew) },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{f.label}</label>
              <div className="relative">
                <input
                  type={f.show ? 'text' : 'password'}
                  value={f.value}
                  onChange={e => f.onChange(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1D3557] bg-gray-50 pr-8"
                />
                <button type="button" onClick={f.toggle} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer">
                  {f.show ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Confirm New Password</label>
            <input
              type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#1D3557] bg-gray-50"
            />
          </div>
          {msg && (
            <div className={`text-xs p-2.5 rounded border flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {msg.type === 'success' ? <Check size={12} /> : <X size={12} />} {msg.text}
            </div>
          )}
          <button onClick={submit} disabled={loading}
            className="w-full bg-[#1D3557] hover:bg-[#152840] text-white font-semibold py-2 rounded text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1">
            {loading ? <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={13} /> Update Password</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePwd, setShowChangePwd] = useState(false);
  const role = ROLE_CONFIG[user?.role] || ROLE_CONFIG.student;
  const RoleIcon = role.icon;

  return (
    <>


      {/* ── Row 2: White logo header ──────────────────────────── */}
      <div className="w-full bg-white px-4 py-2.5 flex items-center justify-between shadow-sm shrink-0 border-b border-gray-100">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
          <img
            src="/main logo.png" alt="Invertis"
            className="h-10 object-contain"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="hidden sm:block">
            <div className="text-[#1D3557] font-bold text-base leading-tight">INVERTIS UNIVERSITY</div>
            <div className="text-gray-400 text-[9px] font-medium tracking-widest uppercase">Bareilly, Uttar Pradesh</div>
          </div>
        </div>

        {/* Right: user info + actions */}
        {user && (
          <div className="flex items-center gap-2">
            {/* Avatar + info */}
            <div className="hidden md:flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#1D3557] flex items-center justify-center text-white font-bold text-sm shrink-0">
                {user.name?.charAt(0) || 'U'}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-[#1D3557] leading-none">{user.name}</div>
                <div className="flex items-center gap-1 justify-end mt-0.5">
                  <RoleIcon size={9} style={{ color: role.color }} />
                  <span className="text-[10px] text-gray-500">{role.label}</span>
                </div>
              </div>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

            {CAN_CHANGE_PASSWORD.includes(user?.role) && (
              <button
                id="change-password-btn"
                onClick={() => setShowChangePwd(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold text-[#1D3557] hover:bg-gray-100 border border-gray-200 transition-all cursor-pointer"
              >
                <KeyRound size={12} />
                <span className="hidden sm:inline">Password</span>
              </button>
            )}

            <button
              onClick={logout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-semibold text-white bg-[#FF2A00] hover:bg-[#CC2200] transition-all cursor-pointer"
            >
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Red divider ───────────────────────────────────────── */}
      <div className="w-full h-[3px] bg-[#FF2A00] shrink-0" />

      <AnimatePresence>
        {showChangePwd && <ChangePasswordModal onClose={() => setShowChangePwd(false)} />}
      </AnimatePresence>
    </>
  );
}
