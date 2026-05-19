import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Crown, Shield, Plus, Trash2, Check, X, Eye, EyeOff, Users } from 'lucide-react';

function Input({ ...props }) {
  return (
    <input
      {...props}
      className={`bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-sm text-[var(--text-main)] placeholder-slate-600
        focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50
        hover:border-white/20 transition-all duration-300 w-full ${props.className || ''}`}
    />
  );
}

export default function SupremePanel() {
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Super Admin form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadAdmins = async () => {
    try {
      const { data } = await api.get('/superadmin/staff');
      setSuperAdmins(data.filter(s => s.role === 'super_admin'));
    } catch {
      toast.error('Failed to load Super Admins.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  const createAdmin = async () => {
    if (!name || !email || !password) return toast.error('All fields are required.');
    if (password.length < 8) return toast.error('Password must be at least 8 characters.');
    setCreating(true);
    try {
      await api.post('/superadmin/superadmins', { name, email, password });
      setName(''); setEmail(''); setPassword('');
      loadAdmins();
      toast.success('Super Admin account created successfully.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create Super Admin.');
    } finally {
      setCreating(false);
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Super Admin?')) return;
    try {
      await api.delete(`/superadmin/users/${id}`);
      loadAdmins();
      toast.success('Super Admin deleted.');
    } catch {
      toast.error('Failed to delete.');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-4xl overflow-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500
              rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30">
              <Crown size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black gradient-text">Supreme Authority Panel</h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Only Supreme Accounts can access this panel.</p>
            </div>
          </div>

          {/* Alert Banner */}
          <div className="flex items-start gap-3 mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
            <Shield size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              <span className="font-bold">Supreme Authority</span> — This panel allows creation and deletion of Super Admin accounts.
              Super Admins have institution-wide access. Use with caution.
              Coordinator tasks (like adding students) cannot be performed here.
            </p>
          </div>


          {/* Create Super Admin Form */}
          <div className="card-main p-6 mb-6">
            <h2 className="text-sm font-bold text-[var(--text-main)] mb-1 flex items-center gap-2">
              <Plus size={15} className="text-accent-400" />
              Create New Super Admin Account
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Super Admins can manage HODs, Coordinators, view all analytics, and assign teaching staff.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Dr. Vikram Chandra"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@invertis.edu.in"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3.5 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
            <button
              id="create-superadmin-btn"
              onClick={createAdmin}
              disabled={creating}
              className="mt-4 btn-primary"
            >
              {creating
                ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Check size={16} />}
              {creating ? 'Creating…' : 'Create Super Admin'}
            </button>
          </div>

          {/* Super Admin List */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-slate-600 dark:text-slate-400" />
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">Existing Super Admins</h2>
              <span className="text-xs bg-white/10 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">{superAdmins.length}</span>
            </div>

            {loading ? (
              <div className="flex flex-col gap-3">
                {[1, 2].map(i => (
                  <div key={i} className="skeleton h-16 rounded-2xl" />
                ))}
              </div>
            ) : superAdmins.length === 0 ? (
              <div className="card p-8 text-center rounded-2xl">
                <Users size={32} className="text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm font-semibold">No Super Admins yet</p>
                <p className="text-slate-600 text-xs mt-1">Create the first Super Admin account above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {superAdmins.map(admin => (
                  <motion.div
                    key={admin.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-hover rounded-2xl p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-accent-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                        {admin.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[var(--text-main)]">{admin.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{admin.email}</div>
                        <span className="badge-role mt-1 inline-flex">Super Admin</span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAdmin(admin.id)}
                      className="p-2 text-slate-600 hover:text-accent-400 hover:bg-accent-950/30 rounded-xl cursor-pointer transition-all"
                      title="Delete Super Admin"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
