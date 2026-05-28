import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Filter, GraduationCap, Trash2, Edit, ChevronRight, Building2, Mail, Hash, Loader2, UserPlus, X, Save, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

export default function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [depts, setDepts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', college_id: '', department_id: '', password: 'student123' });

  const fetchData = async () => { setLoading(true); try { const [sr, dr] = await Promise.all([api.get('/users/students'), api.get('/tlfq/departments')]); setStudents(sr.data); setDepts(dr.data); } catch {} finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, []);

  const filtered = students.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = s.name.toLowerCase().includes(q) || s.college_id.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    const matchDept = selectedDept === 'all' || s.department_name === selectedDept;
    return matchSearch && matchDept;
  });

  const handleDelete = async (id) => { if (!window.confirm('Delete this student?')) return; try { await api.delete(`/users/${id}`); setStudents(students.filter(s => s.id !== id)); } catch (err) { alert(err.response?.data?.message || 'Failed.'); } };

  const openModal = (student = null) => {
    if (student) { setEditingId(student.id); const d = depts.find(d => d.name === student.department_name); setFormData({ name: student.name, email: student.email || '', college_id: student.college_id, department_id: d?._id || student.department_id || '', password: '' }); }
    else { setEditingId(null); setFormData({ name: '', email: '', college_id: '', department_id: user.role === 'hod' ? user.department_id : '', password: 'student123' }); }
    setShowModal(true);
  };

  const handleSubmit = async (e) => { e.preventDefault(); setModalLoading(true); try { if (editingId) await api.patch(`/users/${editingId}`, formData); else await api.post('/users', formData); fetchData(); setShowModal(false); } catch (err) { alert(err.response?.data?.message || 'Failed.'); } finally { setModalLoading(false); } };

  return (
    <div className="animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center"><GraduationCap size={20} className="text-invertis-blue" /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
            <p className="text-sm text-gray-500">{user.role === 'admin' ? 'Managing global student profiles.' : 'Departmental student roster.'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400"><span className="font-bold text-gray-700">{students.length}</span> students</span>
          <Button icon={UserPlus} onClick={() => openModal()}>Onboard Student</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search names, IDs, or emails..." className={`${inputCls} pl-12`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {user.role === 'admin' && (
          <div className="lg:w-64 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select className={`${inputCls} pl-11 cursor-pointer`} value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
              <option value="all">All Departments</option>
              {depts.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl" />) :
          filtered.length === 0 ? (
            <Card><EmptyState icon={Users} title="No students found" message="Try broadening your search." /></Card>
          ) : filtered.map((s, idx) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
              <Card hover><CardBody className="py-4">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex items-center gap-4 lg:w-[30%] shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-invertis-blue/10 flex items-center justify-center text-invertis-blue"><GraduationCap size={24} /></div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{s.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{s.college_id}</p>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                    <div className="flex items-center gap-2"><Building2 size={14} className="text-gray-400" /><span className="text-gray-600">{s.department_name}</span></div>
                    <div className="flex items-center gap-2"><Mail size={14} className="text-gray-400" /><span className="text-gray-500 truncate">{s.email || 'N/A'}</span></div>
                    <div className="flex items-center gap-2"><Hash size={14} className="text-gray-400" /><span className="text-invertis-blue font-semibold">{s.enrollment_count} modules</span></div>
                  </div>
                  <div className="flex items-center gap-2 lg:w-[10%] shrink-0 justify-end">
                    <button onClick={() => openModal(s)} className="p-2 text-gray-400 hover:text-invertis-blue hover:bg-blue-50 rounded-lg cursor-pointer"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              </CardBody></Card>
            </motion.div>
          ))}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Modify Student' : 'Onboard Student'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label><input type="text" required className={inputCls} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Alok Yadav" /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1">College ID</label><input type="text" required className={inputCls} value={formData.college_id} onChange={e => setFormData({ ...formData, college_id: e.target.value })} placeholder="BCS2025_01" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Email</label><input type="email" className={inputCls} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="user@invertis.edu.in" /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
            <select disabled={user.role === 'hod'} className={`${inputCls} cursor-pointer`} value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })}>
              <option value="">Select…</option>{depts.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          {!editingId && <div><label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative"><input type="password" required className={`${inputCls} pr-10`} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} /></div>
          </div>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={modalLoading} icon={modalLoading ? Loader2 : Save} className="flex-[2]">{editingId ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
