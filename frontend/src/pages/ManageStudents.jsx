import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const inputCls = 'bg-[#f9f9f9] border border-[#e0e0e0] rounded-xl px-5 py-4 text-xs font-bold text-[#1A1A1A] placeholder-[#474747]/30 focus:outline-none focus:border-[#ff6b00] w-full transition-all shadow-sm';

export default function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('all');
  const [depts, setDepts] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentRes, deptRes] = await Promise.all([
        api.get('/users/students'),
        api.get('/tlfq/departments')
      ]);
      setStudents(studentRes.data);
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
    <div className="min-h-screen bg-white text-[#1A1A1A] flex flex-col font-sans transition-colors duration-300">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 transition-all duration-300">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 pb-10 max-w-7xl mx-auto w-full">
            
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white border border-[#e0e0e0] p-8 rounded-[24px] shadow-sm relative overflow-hidden">
              <div className="z-10 flex items-center gap-6">
                <div className="h-14 w-14 bg-[#ff6b00]/10 text-[#ff6b00] rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[32px]">group</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Student Directory</h1>
                  <p className="text-[#474747] text-[10px] mt-1 font-black uppercase tracking-[0.2em] opacity-60">
                    {user.role === 'admin' 
                      ? 'Global academic identities management' 
                      : `Departmental student roster protocol`}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 z-10">
                <button 
                  onClick={() => openModal()}
                  className="flex items-center gap-3 px-8 py-4 bg-[#ff6b00] hover:opacity-90 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-[#ff6b00]/20 active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined">person_add</span>
                  <span>Onboard Student</span>
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative group">
                <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-[#474747] opacity-30 group-focus-within:text-[#ff6b00] group-focus-within:opacity-100 transition-all text-[24px]">search</span>
                <input 
                  type="text"
                  placeholder="Query names, ID tags, or digital handles..."
                  className="w-full bg-white border border-[#e0e0e0] rounded-[16px] pl-20 pr-10 py-6 text-sm text-[#1A1A1A] font-bold focus:outline-none focus:border-[#ff6b00] transition-all placeholder-[#474747]/30 shadow-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {user.role === 'admin' && (
                <div className="lg:w-96 relative group">
                  <span className="material-symbols-outlined absolute left-8 top-1/2 -translate-y-1/2 text-[#474747] opacity-30 group-focus-within:text-[#ff6b00] group-focus-within:opacity-100 transition-all text-[22px]">filter_list</span>
                  <select 
                    className="w-full bg-white border border-[#e0e0e0] rounded-[16px] pl-20 pr-14 py-6 text-xs font-black text-[#1A1A1A] focus:outline-none focus:border-[#ff6b00] appearance-none cursor-pointer shadow-sm uppercase tracking-widest transition-all"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    <option value="all">Global Domain</option>
                    {depts.map(d => (
                      <option key={d._id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-8 top-1/2 -translate-y-1/2 text-[#474747] opacity-30 pointer-events-none transition-colors">expand_more</span>
                </div>
              )}
            </div>

            {/* Results Grid - Using List Cards */}
            <div className="flex flex-col gap-6">
              <AnimatePresence mode='popLayout'>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-32 bg-[#f9f9f9] border border-[#e0e0e0] rounded-[16px] animate-pulse shadow-sm" />
                  ))
                ) : filteredStudents.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-32 bg-white border border-[#e0e0e0] rounded-[24px] text-center shadow-sm">
                    <div className="h-28 w-28 bg-[#f9f9f9] rounded-2xl flex items-center justify-center mb-8 text-[#e0e0e0]">
                      <span className="material-symbols-outlined text-[56px]">group</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#1A1A1A] mb-3">No Records Identified</h3>
                    <p className="text-[#474747] font-black uppercase tracking-widest text-[10px] max-w-xs mx-auto opacity-40">Try broadening your search criteria or scope selection.</p>
                    <button onClick={() => {setSearch(''); setSelectedDept('all');}} className="mt-10 px-10 py-4 bg-[#f9f9f9] hover:bg-white text-[#474747] text-[10px] font-black rounded-xl uppercase tracking-[0.2em] transition-all border border-[#e0e0e0] cursor-pointer">Reset System View</button>
                  </motion.div>
                ) : filteredStudents.map((student, idx) => (
                  <motion.div
                    key={student.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group bg-white border border-[#e0e0e0] hover:border-[#ff6b00]/30 rounded-[16px] p-8 transition-all shadow-sm hover:shadow-xl flex flex-col lg:flex-row lg:items-center gap-10 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff6b00] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Identity block */}
                    <div className="flex items-center gap-8 lg:w-[35%] shrink-0">
                      <div className="h-20 w-20 rounded-2xl bg-[#ff6b00]/5 border border-[#ff6b00]/10 flex items-center justify-center text-[#ff6b00] group-hover:bg-[#ff6b00] group-hover:text-white transition-all duration-700 shadow-inner overflow-hidden">
                        <span className="material-symbols-outlined text-[40px] group-hover:scale-110 transition-transform">school</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-[#1A1A1A] text-2xl tracking-tight leading-tight group-hover:text-[#ff6b00] transition-colors truncate mb-1">
                          {student.name}
                        </h3>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-[#474747] uppercase tracking-[0.2em] opacity-40">ID: {student.college_id}</span>
                           <div className="h-1 w-1 rounded-full bg-[#e0e0e0]" />
                           <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Meta data block */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-[#f9f9f9] flex items-center justify-center text-[#474747] group-hover:text-[#ff6b00] transition-all border border-[#e0e0e0] shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">domain</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-black text-[#474747] uppercase tracking-widest mb-1 opacity-40">Unit</span>
                          <span className="font-black text-[#1A1A1A] text-xs truncate uppercase tracking-tighter">{student.department_name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-[#f9f9f9] flex items-center justify-center text-[#474747] group-hover:text-[#ff6b00] transition-all border border-[#e0e0e0] shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-black text-[#474747] uppercase tracking-widest mb-1 opacity-40">Correspondence</span>
                          <span className="font-bold text-[#474747] text-xs truncate">{student.email || 'N/A'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-xl bg-[#f9f9f9] flex items-center justify-center text-[#474747] group-hover:text-[#ff6b00] transition-all border border-[#e0e0e0] shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">tag</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-black text-[#474747] uppercase tracking-widest mb-1 opacity-40">Load Status</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#ff6b00]">{student.enrollment_count} Active Modules</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Block */}
                    <div className="flex items-center justify-end gap-4 lg:w-[15%] shrink-0">
                      <button 
                        onClick={() => openModal(student)}
                        className="h-14 w-14 flex items-center justify-center bg-white text-[#474747] hover:text-[#ff6b00] hover:bg-[#ff6b00]/5 rounded-xl transition-all border border-[#e0e0e0] cursor-pointer shadow-sm active:scale-90"
                        title="Edit Profile"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(student.id)}
                        className="h-14 w-14 flex items-center justify-center bg-white text-[#474747] hover:text-[#b3261e] hover:bg-[#b3261e]/5 rounded-xl transition-all border border-[#e0e0e0] cursor-pointer shadow-sm active:scale-90"
                        title="Purge Record"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Sophisticated Modal */}
            <AnimatePresence>
              {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowModal(false)}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-2xl bg-white border border-[#e0e0e0] rounded-[24px] shadow-2xl relative z-10 overflow-hidden"
                  >
                    <div className="p-10">
                      <div className="flex items-center justify-between mb-10">
                        <div>
                          <div className="flex items-center gap-3">
                             <div className="h-2 w-2 rounded-full bg-[#ff6b00]" />
                             <h2 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
                               {editingId ? 'Modify Record' : 'Student Intake'}
                             </h2>
                          </div>
                          <p className="text-[#474747] text-[10px] mt-3 uppercase tracking-[0.2em] font-black opacity-40">Security Protocol Mapping: Enabled</p>
                        </div>
                        <button 
                          onClick={() => setShowModal(false)}
                          className="h-12 w-12 flex items-center justify-center bg-[#f9f9f9] hover:bg-[#b3261e] text-[#474747] hover:text-white rounded-xl transition-all cursor-pointer border border-[#e0e0e0]"
                        >
                          <span className="material-symbols-outlined">close</span>
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#474747] uppercase tracking-widest ml-1 opacity-60">Legal Name</label>
                            <input 
                              type="text" required
                              className={inputCls}
                              value={formData.name}
                              onChange={e => setFormData({...formData, name: e.target.value})}
                              placeholder="e.g. Alok Yadav"
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#474747] uppercase tracking-widest ml-1 opacity-60">Academic ID Tag</label>
                            <input 
                              type="text" required
                              className={inputCls}
                              value={formData.college_id}
                              onChange={e => setFormData({...formData, college_id: e.target.value})}
                              placeholder="REF-XXXXXX"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-[#474747] uppercase tracking-widest ml-1 opacity-60">Institutional Handle</label>
                          <input 
                            type="email"
                            className={inputCls}
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            placeholder="user@university.edu"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-[#474747] uppercase tracking-widest ml-1 opacity-60">Faculty Affiliation</label>
                          <select 
                            disabled={user.role === 'hod'}
                            className={inputCls + ' cursor-pointer appearance-none'}
                            value={formData.department_id}
                            onChange={e => setFormData({...formData, department_id: e.target.value})}
                          >
                            <option value="">Choose Department…</option>
                            {depts.map(d => (
                              <option key={d._id} value={d._id}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        {!editingId && (
                          <div className="flex flex-col gap-3">
                            <label className="text-[10px] font-black text-[#474747] uppercase tracking-widest ml-1 opacity-60">Master Access Key</label>
                            <div className="relative">
                               <input 
                                 type="password" required
                                 className={inputCls + ' pr-14'}
                                 value={formData.password}
                                 onChange={e => setFormData({...formData, password: e.target.value})}
                                 placeholder="••••••••"
                               />
                               <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-[#474747] opacity-30">lock</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-6 mt-12 pt-4">
                          <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="flex-1 px-8 py-5 bg-white hover:bg-[#f9f9f9] text-[#474747] rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer border border-[#e0e0e0] shadow-sm"
                          >
                            Discard
                          </button>
                          <button 
                            type="submit"
                            disabled={modalLoading}
                            className="flex-[2] px-8 py-5 bg-[#ff6b00] hover:opacity-90 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[#ff6b00]/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            {modalLoading 
                              ? <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> 
                              : <span className="material-symbols-outlined">save</span>
                            }
                            <span>{editingId ? 'Push Updates' : 'Sync Profile'}</span>
                          </button>
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
