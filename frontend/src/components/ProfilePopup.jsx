import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Shield, Building2, GraduationCap, Users, Crown,
  Mail, Hash, Fingerprint, Trophy, BookOpen, Calendar,
  KeyRound, Check, Eye, EyeOff, Camera, Layers, Zap,
  Link2, Activity, ChevronRight, BarChart2, ArrowRight
} from 'lucide-react';
import api from '../services/api';


const ROLE_CONFIG = {
  supreme:     { label: 'SUPREME AUTHORITY', icon: Crown,         gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600' },
  super_admin: { label: 'SUPER ADMIN',       icon: Shield,        gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  coordinator: { label: 'COORDINATOR',       icon: Users,         gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600' },
  hod:         { label: 'HEAD OF DEPARTMENT', icon: Building2,    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-600' },
  student:     { label: 'STUDENT',           icon: GraduationCap, gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
};

const STAT_ICONS = {
  sections: Layers, courses: BookOpen, faculty: Users, students: GraduationCap,
  assignments: Link2, systemStatus: Zap, myForms: BarChart2, openForms: Activity,
  formsSubmitted: Check, enrollments: Hash, points: Trophy,
};

function ChangePasswordSection() {
  const [current, setCurrent] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const submit = async () => {
    if (!current || !newPwd || !confirm) return setMsg({ type: 'error', text: 'All fields required.' });
    if (newPwd.length < 8) return setMsg({ type: 'error', text: 'Min 8 characters.' });
    if (newPwd !== confirm) return setMsg({ type: 'error', text: 'Passwords do not match.' });
    setLoading(true);
    try {
      await api.put('/auth/change-password', { current_password: current, new_password: newPwd });
      setMsg({ type: 'success', text: 'Password updated!' });
      setCurrent(''); setNewPwd(''); setConfirm('');
      setTimeout(() => { setExpanded(false); setMsg(null); }, 2000);
    } catch (e) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' });
    } finally { setLoading(false); }
  };

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-[#1D3557] bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer shadow-sm hover:shadow-md">
        <KeyRound size={15} /> Change Password
      </button>
    );
  }

  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Change Password</span>
        <button onClick={() => { setExpanded(false); setMsg(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={15} /></button>
      </div>
      {[
        { label: 'Current Password', value: current, onChange: setCurrent, show: showCur, toggle: () => setShowCur(!showCur) },
        { label: 'New Password', value: newPwd, onChange: setNewPwd, show: showNew, toggle: () => setShowNew(!showNew) },
      ].map(f => (
        <div key={f.label} className="mb-3">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{f.label}</label>
          <div className="relative">
            <input type={f.show ? 'text' : 'password'} value={f.value} onChange={e => f.onChange(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557]/10 bg-slate-50 pr-10" />
            <button type="button" onClick={f.toggle} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer">
              {f.show ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      ))}
      <div className="mb-3">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm New Password</label>
        <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#1D3557] focus:ring-1 focus:ring-[#1D3557]/10 bg-slate-50" />
      </div>
      {msg && (
        <div className={`text-xs p-2.5 rounded-xl border flex items-center gap-2 mb-3 ${msg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.type === 'success' ? <Check size={12} /> : <X size={12} />} {msg.text}
        </div>
      )}
      <button onClick={submit} disabled={loading}
        className="w-full bg-[#1D3557] hover:bg-[#152840] text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
        {loading ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={14} /> Update Password</>}
      </button>
    </div>
  );
}

export default function ProfilePopup() {
  const { user, setUser } = useAuth();
  const { profileOpen, closeProfile } = useSidebar();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profileOpen && user) {
      setLoading(true);
      api.get('/auth/profile-data')
        .then(r => setProfileData(r.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [profileOpen, user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      const res = await api.post('/auth/profile-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update user in context
      if (setUser) setUser(prev => ({ ...prev, profile_photo: res.data.profile_photo }));
      setProfileData(prev => prev ? { ...prev, user: { ...prev.user, profile_photo: res.data.profile_photo } } : prev);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally { setUploading(false); }
  };

  if (!profileOpen || !user) return null;

  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.student;
  const RoleIcon = roleConfig.icon;
  const pd = profileData;
  const profileUser = pd?.user || user;
  const photoUrl = profileUser.profile_photo || null;

  return (
    <AnimatePresence>
      <motion.div
        key="profile-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[90] flex items-center justify-center"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
        onClick={e => e.target === e.currentTarget && closeProfile()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 30 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="w-full max-w-2xl mx-4 bg-[#F8FAFC] rounded-3xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* ── Top bar ─────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <GraduationCap size={14} className="text-slate-500" />
              </div>
              <span className="text-sm font-bold text-[#1D3557]">My Profile</span>
            </div>
            <button
              onClick={closeProfile}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Scrollable content ──────────────────────────── */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 52px)' }}>

            {/* ── Banner + Avatar ────────────────────────────── */}
            <div className="relative">
              <div className="h-40 sm:h-48 w-full" style={{ background: roleConfig.gradient }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
                <div className="relative group">
                  <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                    {photoUrl ? (
                      <img src={photoUrl} alt={profileUser.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-white text-4xl sm:text-5xl font-black"
                        style={{ background: roleConfig.gradient }}>
                        {profileUser.name?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  {/* Camera overlay */}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-lg border-2 border-white flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                    style={{ background: roleConfig.gradient }}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera size={13} className="text-white" />
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </div>
              </div>
            </div>

            {/* ── Name + Role ──────────────────────────────── */}
            <div className="pt-16 sm:pt-18 pb-5 text-center px-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1D3557]">{profileUser.name}</h2>
              <div className="mt-2 flex items-center justify-center gap-3">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${roleConfig.bg} ${roleConfig.border} ${roleConfig.text}`}>
                  <RoleIcon size={11} /> {roleConfig.label}
                </span>
                {profileUser.student_id && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 uppercase tracking-wider">
                    ID: {profileUser.student_id}
                  </span>
                )}
              </div>
            </div>

            {/* ── Account Information ────────────────────── */}
            <div className="px-6 pb-5">
              <SectionHeader label="Account Information" />
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <InfoRow icon={Hash} label="Login ID" value={profileUser.student_id || profileUser.id?.slice(0, 8)} />
                <InfoRow icon={Mail} label="Email Address" value={profileUser.email || '—'} />
                <InfoRow icon={Building2} label="Department" value={profileUser.department_name || '—'} />
                <InfoRow icon={GraduationCap} label="Account Status" value={
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-bold capitalize">{profileUser.status || 'Active'}</span>
                  </span>
                } noBorder />
                {profileUser.role === 'student' && (
                  <>
                    <InfoRow icon={Calendar} label="Batch" value={profileUser.batch || '—'} />
                    <InfoRow icon={BookOpen} label="Semester" value={profileUser.semester || '—'} />
                    <InfoRow icon={Fingerprint} label="Anonymous ID" value={profileUser.unique_feedback_id || '—'} />
                    <InfoRow icon={Trophy} label="Points" value={profileUser.points ?? 0} noBorder />
                  </>
                )}
              </div>
            </div>

            {/* ── Management Overview (stats) ──────────── */}
            {pd && pd.stats && Object.keys(pd.stats).length > 0 && (
              <div className="px-6 pb-5">
                <SectionHeader label="Management Overview" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(pd.stats).map(([key, value]) => {
                    const Icon = STAT_ICONS[key] || Activity;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
                    const isStatus = key === 'systemStatus';
                    return (
                      <div key={key} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow">
                        <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-2 ${isStatus ? 'bg-emerald-50' : 'bg-slate-50'}`}>
                          <Icon size={15} className={isStatus ? 'text-emerald-500' : 'text-slate-500'} />
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-[#1D3557]">{isStatus ? '' : value}</div>
                        {isStatus && (
                          <div className="flex items-center gap-1">
                            <Zap size={12} className="text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-600">{value}</span>
                          </div>
                        )}
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Access & Permissions ──────────────────── */}
            {pd?.accessLevel && (
              <div className="px-6 pb-5">
                <SectionHeader label="Access & Permissions" />
                <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                  <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center border border-violet-200 shrink-0">
                    <Shield size={16} className="text-violet-500" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Access Level</div>
                    <div className="text-sm font-semibold text-[#1D3557]">{pd.accessLevel}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quick Actions ─────────────────────────── */}
            {pd?.quickActions?.length > 0 && (
              <div className="px-6 pb-5">
                <SectionHeader label="Quick Actions" />
                <div className="flex flex-col gap-2">
                  {pd.quickActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={() => { closeProfile(); navigate(action.to); }}
                      className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3 w-full text-left hover:border-[#1D3557]/20 hover:shadow-md transition-all cursor-pointer group shadow-sm"
                    >
                      <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-200 shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <Layers size={15} className="text-emerald-500" />
                      </div>
                      <span className="text-sm font-semibold text-[#1D3557] flex-1">{action.label}</span>
                      <ArrowRight size={14} className="text-slate-300 group-hover:text-[#1D3557] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Change Password ───────────────────────── */}
            <div className="px-6 pb-8">
              <SectionHeader label="Security" />
              <ChangePasswordSection />
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Helpers ──────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, noBorder }) {
  return (
    <div className={`flex items-center gap-3 px-5 py-3.5 ${noBorder ? '' : 'border-b border-slate-100'}`}>
      <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 border border-slate-200">
        <Icon size={14} className="text-slate-500" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-sm font-semibold text-[#1D3557] truncate">{value}</div>
      </div>
    </div>
  );
}
