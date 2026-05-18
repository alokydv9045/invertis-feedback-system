import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Search, Filter, GraduationCap,
  Trash2, Edit, ChevronRight, UserCircle,
  Building2, Mail, Hash, Calendar, Loader2,
  UserPlus, X, Save, Lock, Info, ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input, Button } from '../components/ui';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [depts, setDepts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college_id: '',
    department_id: '',
    password: 'student123'
  });

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const [studentRes, deptRes] = await Promise.all([
        api.get(`/users/students?page=${page}&limit=50`),
        api.get('/tlfq/departments')
      ]);
      setStudents(studentRes.data.students || []);
      setPagination(studentRes.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
      setDepts(deptRes.data);
    } catch (err) {
      console.error('Directory sync failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.college_id.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'all' || s.department_name === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Wipe this student record and associated history?')) return;
    try {
      await api.delete(`/users/${id}`);
      setStudents(students.filter(s => s.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete student');
    }
  };

  const openModal = (student = null) => {
    if (student) {
      setEditingId(student.id);
      const deptObj = depts.find(d => d.name === student.department_name);
      setFormData({
        name: student.name,
        email: student.email || '',
        college_id: student.college_id,
        department_id: deptObj?._id || student.department_id || '',
        password: ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        college_id: '',
        department_id: user.role === 'hod' ? user.department_id : '',
        password: 'student123'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      if (editingId) {
        await api.patch(`/users/${editingId}`, formData);
      } else {
        await api.post('/users', formData);
      }
      fetchData();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'System update rejected');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-[var(--text-main)] flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-10">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-10 pb-10 max-w-7xl mx-auto w-full">

            {/* Header section with sophisticated design */}
            <div className="card-main relative overflow-hidden group flex flex-col md:flex-row md:items-end justify-between gap-8 p-10">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 blur-[120px] -mr-48 -mt-48 transition-opacity opacity-50 group-hover:opacity-100" />
              <div className="z-10 flex items-start gap-8">
                <button
                  onClick={() => window.history.back()}
                  className="mt-1 h-14 w-14 hidden md:flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-primary-600 text-slate-600 dark:text-slate-400 hover:text-white rounded-[1.5rem] transition-all cursor-pointer border border-slate-100 dark:border-slate-700 active:scale-90 shadow-sm"
                >
                  <ArrowLeft size={24} />
                </button>
                <div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary-500" />
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Student Directory</h1>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 text-sm mt-4 max-w-lg font-bold leading-relaxed uppercase tracking-widest opacity-80">
                    {user.role === 'admin'
                      ? 'Managing global academic identities across the TLFQ infrastructure.'
                      : `Reviewing departmental student roster and access protocol.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8 z-10">
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Active Profiles</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">{students.length}</span>
                    <span className="text-xs font-black text-slate-600 dark:text-slate-400">Synced</span>
                  </div>
                </div>
                <button
                  onClick={() => openModal()}
                  className="flex items-center gap-3 px-10 py-5 bg-primary-600 hover:bg-primary-700 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.15em] transition-all shadow-2xl shadow-primary-500/30 hover:scale-[1.03] active:scale-95 cursor-pointer"
                >
                  <UserPlus size={18} />
                  <span>Onboard Student</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 group-focus-within:text-primary-500 transition-all" size={24} />
                <input
                  type="text"
                  placeholder="Query names, ID tags, or digital handles..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] pl-20 pr-10 py-6 text-sm text-slate-800 dark:text-white font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder-slate-400 dark:placeholder-slate-700 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {user.role === 'admin' && (
                <div className="lg:w-96 relative group">
                  <Filter className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 group-focus-within:text-primary-500 transition-all" size={22} />
                  <select
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] pl-20 pr-14 py-6 text-sm font-black text-slate-700 dark:text-[var(--text-main)] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 appearance-none cursor-pointer shadow-sm uppercase tracking-widest transition-all"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="all">Global Domain</option>
                    {depts.map(d => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate-400 pointer-events-none group-focus-within:text-primary-500 transition-colors">
                    <ChevronRight className="rotate-90" size={20} />
                  </div>
                </div>
              )}
            </div>

            {/* Results Grid - Using List Cards */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode='popLayout'>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-32 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] animate-pulse shadow-sm" />
                  ))
                ) : filteredStudents.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-main flex flex-col items-center justify-center py-32 text-center">
                    <div className="h-28 w-28 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] flex items-center justify-center mb-8 text-[var(--text-main)] dark:text-slate-700">
                      <Users size={56} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3">No Records Identified</h3>
                    <p className="text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px] max-w-xs mx-auto">Try broadening your search criteria or scope selection.</p>
                    <button onClick={() => { setSearch(''); setSelectedDept('all'); }} className="mt-10 px-10 py-4 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black rounded-2xl uppercase tracking-[0.2em] transition-all border border-slate-100 dark:border-slate-700">Reset System View</button>
                  </motion.div>
                ) : filteredStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.04 }}
                    className="card-main group relative overflow-hidden flex flex-col lg:flex-row lg:items-center gap-10"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Identity block */}
                    <div className="flex items-center gap-8 lg:w-[35%] shrink-0">
                      <div className="h-20 w-20 rounded-[2rem] bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 group-hover:bg-primary-600 group-hover:text-white transition-all duration-700 shadow-inner overflow-hidden">
                        <GraduationCap size={40} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-2xl tracking-tight leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate mb-1">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">ID: {student.college_id}</span>
                          <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta data block */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-primary-500 transition-all border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                          <Building2 size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Unit</span>
                          <span className="font-black text-slate-700 dark:text-[var(--text-main)] text-xs truncate uppercase tracking-tighter">{student.department_name}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-primary-500 transition-all border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                          <Mail size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Correspondence</span>
                          <span className="font-bold text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 text-xs truncate">{student.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:text-primary-500 transition-all border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                          <Hash size={20} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Load Status</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-primary-600 dark:text-primary-400">{student.enrollment_count} Active Modules</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Block */}
                    <div className="flex items-center justify-end gap-4 lg:w-[15%] shrink-0">
                      <button
                        onClick={() => openModal(student)}
                        className="h-14 w-14 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-[1.5rem] transition-all border border-slate-100 dark:border-slate-700 cursor-pointer shadow-sm active:scale-90"
                        title="Edit Profile"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="h-14 w-14 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/40 rounded-[1.5rem] transition-all border border-slate-100 dark:border-slate-700 cursor-pointer shadow-sm active:scale-90"
                        title="Purge Record"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
                <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Showing {students.length} of {pagination.total} records
                </div>
                <div className="flex items-center gap-4">
                  <button
                    disabled={pagination.page <= 1 || loading}
                    onClick={() => fetchData(pagination.page - 1)}
                    className="px-6 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <div className="text-xs font-black text-slate-700 dark:text-slate-700 dark:text-slate-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <button
                    disabled={pagination.page >= pagination.totalPages || loading}
                    onClick={() => fetchData(pagination.page + 1)}
                    className="px-6 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Sophisticated Modal */}
            <AnimatePresence>
              {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
                    className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl"
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[4rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden"
                  >
                    <div className="p-12">
                      <div className="flex items-center justify-between mb-12">
                        <div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-primary-500" />
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {editingId ? 'Modify Record' : 'Student Intake'}
                            </h2>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 dark:text-slate-600 dark:text-slate-400 text-[10px] mt-3 uppercase tracking-[0.2em] font-black opacity-80">Security Protocol Mapping: Enabled</p>
                        </div>
                        <button
                          onClick={() => setShowModal(false)}
                          className="h-14 w-14 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-accent-600 text-slate-600 dark:text-slate-400 hover:text-white rounded-2xl transition-all cursor-pointer border border-slate-100 dark:border-slate-700"
                        >
                          <X size={26} />
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Alok Yadav"
                          />
                          <Input
                            type="text"
                            required
                            value={formData.college_id}
                            onChange={(e) => setFormData({ ...formData, college_id: e.target.value })}
                            placeholder="REF-XXXXXX"
                          />
                        </div>

                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="user@university.edu"
                        />

                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Faculty Affiliation</label>
                          <select
                            disabled={user.role === 'hod'}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-800 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full transition-all shadow-sm cursor-pointer appearance-none"
                            value={formData.department_id}
                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                          >
                            <option value="">Choose Department…</option>
                            {depts.map(d => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {!editingId && (
                          <Input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            trailingIcon={Lock}
                          />
                        )}

                        <div className="flex gap-6 mt-12 pt-4">
                          <Button
                            type="button"
                            onClick={() => setShowModal(false)}
                            variant="secondary"
                            className="flex-1"
                          >
                            Discard
                          </Button>
                          <Button
                            type="submit"
                            disabled={modalLoading}
                            loading={modalLoading}
                            className="flex-[2]"
                          >
                            <Save size={24} />
                            <span>{editingId ? 'Push Updates' : 'Sync Profile'}</span>
                          </Button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
