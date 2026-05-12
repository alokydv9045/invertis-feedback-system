import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Crown, Shield, Plus, Trash2, Check, X, Eye, EyeOff, Users } from 'lucide-react';

const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

export default function SupremePanel() {
  const [msg, setMsg] = useState(null);
  const [superAdmins, setSuperAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadAdmins = async () => { try { const { data } = await api.get('/superadmin/staff'); setSuperAdmins(data.filter(s => s.role === 'super_admin')); } catch { showMsgFn('error', 'Failed to load.'); } finally { setLoading(false); } };
  useEffect(() => { loadAdmins(); }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t); } }, [msg]);
  const showMsgFn = (type, text) => setMsg({ type, text });

  const createAdmin = async () => {
    if (!name || !email || !password) return showMsgFn('error', 'All fields are required.');
    if (password.length < 8) return showMsgFn('error', 'Password must be at least 8 characters.');
    setCreating(true);
    try { await api.post('/superadmin/superadmins', { name, email, password }); setName(''); setEmail(''); setPassword(''); loadAdmins(); showMsgFn('success', 'Super Admin created.'); }
    catch (e) { showMsgFn('error', e.response?.data?.message || 'Failed.'); }
    finally { setCreating(false); }
  };

  const deleteAdmin = async (id) => { if (!window.confirm('Delete this Super Admin?')) return; try { await api.delete(`/superadmin/users/${id}`); loadAdmins(); showMsgFn('success', 'Deleted.'); } catch { showMsgFn('error', 'Failed.'); } };

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><Crown size={20} className="text-amber-500" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Supreme Authority Panel</h1><p className="text-sm text-gray-500">Only Supreme Accounts can access this panel.</p></div>
      </div>

      <Card className="border-amber-200 bg-amber-50/30 mb-6"><CardBody className="py-3">
        <div className="flex items-start gap-3"><Shield size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-amber-700"><span className="font-semibold">Supreme Authority</span> — This panel allows creation and deletion of Super Admin accounts. Use with caution.</p>
        </div>
      </CardBody></Card>

      <AnimatePresence>{msg && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className={`mb-4 p-3 border text-sm font-semibold rounded-lg flex items-center justify-between ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
        {msg.text}<button onClick={() => setMsg(null)} className="cursor-pointer"><X size={14} /></button>
      </motion.div>)}</AnimatePresence>

      <Card className="mb-6"><CardBody>
        <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2"><Plus size={14} className="text-invertis-blue" /> Create New Super Admin Account</h2>
        <p className="text-xs text-gray-500 mb-4">Super Admins can manage HODs, Coordinators, and view all analytics.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Vikram Chandra" className={inputClass} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@invertis.edu.in" className={inputClass} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative"><input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 8 characters" className={inputClass} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
          </div>
        </div>
        <Button onClick={createAdmin} disabled={creating} icon={Check} className="mt-4">{creating ? 'Creating…' : 'Create Super Admin'}</Button>
      </CardBody></Card>

      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-gray-400" />
        <h2 className="text-sm font-bold text-gray-700">Existing Super Admins</h2>
        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{superAdmins.length}</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
      ) : superAdmins.length === 0 ? (
        <Card><EmptyState icon={Users} title="No Super Admins" message="Create the first Super Admin account above." /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {superAdmins.map(admin => (
            <Card key={admin.id} hover><CardBody className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-invertis-blue text-white flex items-center justify-center text-sm font-bold">{admin.name?.charAt(0).toUpperCase()}</div>
                <div><p className="text-sm font-bold text-gray-900">{admin.name}</p><p className="text-xs text-gray-500">{admin.email}</p><span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded mt-0.5 inline-block">Super Admin</span></div>
              </div>
              <button onClick={() => deleteAdmin(admin.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
            </CardBody></Card>
          ))}
        </div>
      )}
    </div>
  );
}
