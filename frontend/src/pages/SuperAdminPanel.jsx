import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Shield, Building2, Users, Plus, Trash2, Check, X, Eye, EyeOff, GraduationCap, Search, UserCheck, Hash, RefreshCcw, AlertTriangle, ArrowUpCircle, History } from 'lucide-react';

const TABS = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'hods', label: 'HODs', icon: Users },
  { id: 'coordinators', label: 'Coordinators', icon: Users },
  { id: 'promotion', label: 'Academic Promotion', icon: ArrowUpCircle },
  { id: 'students', label: 'Student Lookup', icon: GraduationCap },
];

function Input({ ...props }) {
  return <input {...props} className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-800 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full transition-all shadow-sm ${props.className || ''}`} />;
}

function Select({ children, ...props }) {
  return (
    <select {...props} className={`bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-800 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full cursor-pointer transition-all shadow-sm ${props.className || ''}`}>
      {children}
    </select>
  );
}

export default function SuperAdminPanel() {
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });
  const [promotionOverview, setPromotionOverview] = useState(null);
  const [promotionHistory, setPromotionHistory] = useState([]);
  const [promotionPreview, setPromotionPreview] = useState(null);
  const [promotionScope, setPromotionScope] = useState('all');
  const [promotionDepartment, setPromotionDepartment] = useState('');
  const [promotionSemesters, setPromotionSemesters] = useState([]);
  const [promotionStudentIds, setPromotionStudentIds] = useState('');
  const [activateNextSession, setActivateNextSession] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [executeLoading, setExecuteLoading] = useState(false);

  // Department form
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptMaxSemester, setDeptMaxSemester] = useState(8);

  // HOD form
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [hodPass, setHodPass] = useState('');
  const [hodDept, setHodDept] = useState('');
  const [showHodPass, setShowHodPass] = useState(false);

  // Coordinator form
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordPass, setCoordPass] = useState('');
  const [showCoordPass, setShowCoordPass] = useState(false);

  // Student search
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState(new Set());

  const loadAll = async (page = 1) => {
    try {
      const [rD, rS, rStud] = await Promise.all([
        api.get('/coordinator/departments'),
        api.get('/superadmin/staff'),
        api.get('/coordinator/students?page=' + page + '&limit=50'),
      ]);
      setDepartments(rD.data);
      setStaff(rS.data);
      setStudents(rStud.data.students || []);
      setPagination(rStud.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 1 });
    } catch { }
  };

  useEffect(() => { loadAll(); }, []);

  // Load current academic session for header display
  const [currentSession, setCurrentSession] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/sync/session/current');
        setCurrentSession(res.data.name);
      } catch (e) {
        // ignore quietly
      }
    })();
  }, []);

  useEffect(() => {
    if (tab !== 'promotion') return;
    (async () => {
      try {
        const [overviewRes, historyRes] = await Promise.all([
          api.get('/superadmin/promotion/overview'),
          api.get('/superadmin/promotion/history?page=1&limit=20'),
        ]);
        setPromotionOverview(overviewRes.data);
        setPromotionHistory(historyRes.data.logs || []);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to load promotion data.');
      }
    })();
  }, [tab]);

  const getPromotionPayload = () => {
    const payload = {};
    if (promotionScope === 'department' && promotionDepartment) {
      payload.department_id = promotionDepartment;
    }
    if (promotionScope === 'semester' && promotionSemesters.length > 0) {
      payload.semesters = promotionSemesters;
    }
    if (promotionScope === 'students') {
      const ids = promotionStudentIds
        .split(',')
        .map(v => v.trim())
        .filter(Boolean);
      if (ids.length > 0) payload.student_ids = ids;
    }
    return payload;
  };

  const runPromotionPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await api.post('/superadmin/promotion/preview', getPromotionPayload());
      setPromotionPreview(res.data);
      toast.success('Promotion preview generated.');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to generate preview.');
    } finally {
      setPreviewLoading(false);
    }
  };

  const executePromotion = async () => {
    setExecuteLoading(true);
    try {
      const payload = {
        ...getPromotionPayload(),
        confirm: true,
        activate_next_session: activateNextSession,
      };
      const res = await api.post('/superadmin/promotion/execute', payload);
      toast.success(res.data.message || 'Promotion completed.');
      await runPromotionPreview();
      const historyRes = await api.get('/superadmin/promotion/history?page=1&limit=20');
      setPromotionHistory(historyRes.data.logs || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Promotion failed.');
    } finally {
      setExecuteLoading(false);
    }
  };

  const createDept = async () => {
    try {
      await api.post('/coordinator/departments', { name: deptName, code: deptCode, max_semester: deptMaxSemester });
      setDeptName(''); setDeptCode(''); setDeptMaxSemester(8);
      loadAll(); toast.success('Department created.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed.'); }
  };

  const deleteDept = async (id) => {
    try { await api.delete(`/coordinator/departments/${id}`); loadAll(); }
    catch (e) { toast.error('Failed to delete.'); }
  };

  const createHod = async () => {
    try {
      await api.post('/superadmin/hods', { name: hodName, email: hodEmail, password: hodPass, department_id: hodDept });
      setHodName(''); setHodEmail(''); setHodPass(''); setHodDept('');
      loadAll(); toast.success('HOD created successfully.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed.'); }
  };

  const createCoord = async () => {
    try {
      await api.post('/superadmin/coordinators', { name: coordName, email: coordEmail, password: coordPass });
      setCoordName(''); setCoordEmail(''); setCoordPass('');
      loadAll(); toast.success('Coordinator created successfully.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed.'); }
  };

  const deleteUser = async (id) => {
    try { await api.delete(`/superadmin/users/${id}`); loadAll(); }
    catch { toast.error('Failed to delete.'); }
  };

  const toggleReveal = (id) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSemesterChange = async () => {
    if (!window.confirm("⚠️ ATTENTION: This will increment every student's semester by 1 and CLEAR ALL faculty assignments. This action CANNOT be undone. Proceed?")) return;
    
    try {
      toast.loading('Processing semester change...');
      const res = await api.post('/superadmin/semester-change');
      toast.dismiss();
      toast.success(res.data.message);
      loadAll();
    } catch (e) {
      toast.dismiss();
      toast.error(e.response?.data?.message || 'Semester change failed.');
    }
  };

  const hods = staff.filter(s => s.role === 'hod');
  const coords = staff.filter(s => s.role === 'coordinator');

  // Filter students — search by ANO ID (unique_feedback_id) OR real name
  const q = searchQuery.trim().toUpperCase();
  const filteredStudents = q
    ? students.filter(s =>
      (s.unique_feedback_id || '').toUpperCase().includes(q) ||
      s.name?.toUpperCase().includes(q) ||
      (s.student_id || '').toUpperCase().includes(q)
    )
    : students;

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-6xl">
            
            {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 w-full">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/20 flex-shrink-0">
                    <Shield size={24} className="text-white sm:w-7 sm:h-7" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">User Management</h1>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 sm:mt-1 font-medium">Create and manage departments, HODs, coordinators & student records</p>
                  </div>
                </div>

                <button 
                  onClick={handleSemesterChange}
                  className="flex items-center justify-center gap-3 px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-2xl text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95 group flex-shrink-0 w-full sm:w-auto cursor-pointer"
                >
                  <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                  Semester Change
                </button>
              </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 flex-nowrap overflow-x-auto no-scrollbar pb-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`flex items-center gap-2.5 px-5 py-3 sm:py-4 text-xs sm:text-sm font-black border-b-2 transition -mb-[5px] cursor-pointer uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${tab === id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-[var(--text-main)]'
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="flex flex-col gap-8">

                {/* DEPARTMENTS */}
                {tab === 'departments' && (
                  <div className="flex flex-col gap-8">
                    {/* Create Form - Full Width */}
                    <div className="card-main flex flex-col gap-6">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Plus size={18} className="text-primary-500" /> New Department
                      </h3>
                      <form onSubmit={(e) => { e.preventDefault(); createDept(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Name</label>
                          <Input type="text" placeholder="B.Tech Computer Science" value={deptName} onChange={e => setDeptName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Code</label>
                          <Input type="text" placeholder="BCS" value={deptCode} onChange={e => setDeptCode(e.target.value.toUpperCase())} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Course Duration (Semesters)</label>
                          <Select value={deptMaxSemester} onChange={e => setDeptMaxSemester(Number(e.target.value))}>
                            <option value={2}>2 Semesters (1 Year)</option>
                            <option value={4}>4 Semesters (2 Years)</option>
                            <option value={6}>6 Semesters (3 Years)</option>
                            <option value={8}>8 Semesters (4 Years)</option>
                            <option value={10}>10 Semesters (5 Years)</option>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">
                            + Create
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Departments List - Full Width Below */}
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider">
                          <Building2 size={18} className="text-primary-500" /> All Departments
                        </h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">
                          {departments.length} Total
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {departments.map(d => (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => deleteDept(d.id)}
                                className="p-3 bg-white dark:bg-slate-800 hover:bg-accent-600 text-accent-500 hover:text-white rounded-2xl transition-all cursor-pointer shadow-lg border border-slate-100 dark:border-slate-700 hover:border-accent-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <Building2 size={28} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {d.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                                    {d.code}
                                  </div>
                                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                                    {d.max_semester || 8} Sems
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* HODs */}
                {tab === 'hods' && (
                  <div className="flex flex-col gap-8">
                    {/* Create Form - Full Width */}
                    <div className="card-main flex flex-col gap-6">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Plus size={18} className="text-primary-500" /> New HOD
                      </h3>
                      <form onSubmit={(e) => { e.preventDefault(); createHod(); }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                          <Input type="text" placeholder="Dr. Rajesh Kumar" value={hodName} onChange={e => setHodName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email</label>
                          <Input type="email" placeholder="hod.bcs@invertis.edu.in" value={hodEmail} onChange={e => setHodEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Department</label>
                          <Select value={hodDept} onChange={e => setHodDept(e.target.value)}>
                            <option value="">Select Department…</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </Select>
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Password</label>
                          <div className="relative">
                            <Input type={showHodPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={hodPass} onChange={e => setHodPass(e.target.value)} />
                            <button type="button" onClick={() => setShowHodPass(!showHodPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">
                              {showHodPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-end">
                          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">
                            + Create HOD
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* HODs List - Full Width Below */}
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider">
                          <Users size={18} className="text-primary-500" /> All HODs
                        </h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">
                          {hods.length} Active
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {hods.map(h => {
                          const dept = departments.find(d => d.id === h.department_id);
                          return (
                            <motion.div
                              key={h.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                            >
                              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                                <button
                                  onClick={() => deleteUser(h.id)}
                                  className="p-3 bg-white dark:bg-slate-800 hover:bg-accent-600 text-accent-500 hover:text-white rounded-2xl transition-all cursor-pointer shadow-lg border border-slate-100 dark:border-slate-700 hover:border-accent-500"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                              <div className="flex items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                  <Users size={28} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                    {h.name}
                                  </h3>
                                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-1">{h.email}</div>
                                  <div className="text-[10px] text-primary-600 dark:text-primary-400 font-bold mt-1.5">{dept?.name || '—'}</div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* COORDINATORS */}
                {tab === 'coordinators' && (
                  <div className="flex flex-col gap-8">
                    {/* Create Form - Full Width */}
                    <div className="card-main flex flex-col gap-6">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider">
                        <Plus size={18} className="text-primary-500" /> New Coordinator
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">Coordinators have university-wide access to manage all departments and resources.</p>
                      <form onSubmit={(e) => { e.preventDefault(); createCoord(); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Full Name</label>
                          <Input type="text" placeholder="Academic Coordinator" value={coordName} onChange={e => setCoordName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Email</label>
                          <Input type="email" placeholder="coordinator@invertis.edu.in" value={coordEmail} onChange={e => setCoordEmail(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Password</label>
                          <div className="relative">
                            <Input type={showCoordPass ? 'text' : 'password'} placeholder="Min. 8 characters" value={coordPass} onChange={e => setCoordPass(e.target.value)} />
                            <button type="button" onClick={() => setShowCoordPass(!showCoordPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer transition-colors">
                              {showCoordPass ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-end md:col-span-3">
                          <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">
                            + Create Coordinator
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Coordinators List - Full Width Below */}
                    <div className="flex flex-col gap-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider">
                          <Users size={18} className="text-primary-500" /> All Coordinators
                        </h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">
                          {coords.length} Active
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {coords.map(c => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => deleteUser(c.id)}
                                className="p-3 bg-white dark:bg-slate-800 hover:bg-accent-600 text-accent-500 hover:text-white rounded-2xl transition-all cursor-pointer shadow-lg border border-slate-100 dark:border-slate-700 hover:border-accent-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <Users size={28} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                  {c.name}
                                </h3>
                                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-1">{c.email}</div>
                                <div className="text-[10px] text-primary-600 dark:text-primary-400 font-bold mt-1.5">University-wide Access</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ACADEMIC PROMOTION */}
                {tab === 'promotion' && (
                  <div className="flex flex-col gap-6">
                    <div className="card-main flex flex-col gap-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white">Academic Session Promotion</h3>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Preview and promote students in bulk with session rollover and audit logging.</p>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                          Active: <span className="text-primary-600 dark:text-primary-400">{promotionOverview?.active_session?.name || '—'}</span>
                          {' '}→ Next: <span className="text-primary-600 dark:text-primary-400">{promotionOverview?.next_session?.name || '—'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Promotion Scope</label>
                          <Select value={promotionScope} onChange={e => setPromotionScope(e.target.value)}>
                            <option value="all">All Departments</option>
                            <option value="department">Specific Department</option>
                            <option value="semester">Specific Semesters</option>
                            <option value="students">Selected Students (IDs)</option>
                          </Select>
                        </div>

                        {promotionScope === 'department' && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Department</label>
                            <Select value={promotionDepartment} onChange={e => setPromotionDepartment(e.target.value)}>
                              <option value="">Select Department…</option>
                              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </Select>
                          </div>
                        )}

                        {promotionScope === 'semester' && (
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Semesters</label>
                            <div className="flex flex-wrap gap-2">
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                                <button
                                  key={sem}
                                  type="button"
                                  onClick={() => setPromotionSemesters(prev => prev.includes(sem) ? prev.filter(v => v !== sem) : [...prev, sem])}
                                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${promotionSemesters.includes(sem)
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                                  }`}
                                >
                                  Sem {sem}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {promotionScope === 'students' && (
                          <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Student User IDs (comma separated)</label>
                            <Input
                              type="text"
                              placeholder="uuid-1, uuid-2, uuid-3"
                              value={promotionStudentIds}
                              onChange={e => setPromotionStudentIds(e.target.value)}
                            />
                          </div>
                        )}

                        <div className="flex items-end gap-2 md:justify-end">
                          <button
                            onClick={runPromotionPreview}
                            disabled={previewLoading}
                            className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 cursor-pointer"
                          >
                            {previewLoading ? 'Loading…' : 'Preview'}
                          </button>
                        </div>
                      </div>

                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activateNextSession}
                          onChange={e => setActivateNextSession(e.target.checked)}
                          className="h-4 w-4"
                        />
                        Mark next academic session as active after promotion
                      </label>
                    </div>

                    {promotionPreview && (
                      <div className="card-main flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">Promotion Preview</h4>
                          <button
                            onClick={executePromotion}
                            disabled={executeLoading || ((promotionPreview.summary?.to_promote || 0) + (promotionPreview.summary?.to_graduate || 0) === 0)}
                            className="px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white cursor-pointer"
                          >
                            {executeLoading ? 'Processing…' : 'Confirm Promotion'}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Scanned</div>
                            <div className="text-xl font-black text-[#1D3557] dark:text-white">{promotionPreview.summary?.students_scanned || 0}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">To Promote</div>
                            <div className="text-xl font-black text-[#1D3557] dark:text-white">{promotionPreview.summary?.to_promote || 0}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">To Graduate</div>
                            <div className="text-xl font-black text-[#1D3557] dark:text-white">{promotionPreview.summary?.to_graduate || 0}</div>
                          </div>
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Skipped</div>
                            <div className="text-xl font-black text-[#1D3557] dark:text-white">{promotionPreview.summary?.skipped || 0}</div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                          <h5 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-3">Semester Mapping</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {Object.entries(promotionPreview.transitions || {}).map(([k, v]) => (
                              <div key={k} className="flex justify-between items-center rounded-xl bg-slate-50 dark:bg-slate-900 px-3 py-2">
                                <span className="font-bold text-slate-700 dark:text-slate-300">{k.replace('->', ' -> ')}</span>
                                <span className="font-black text-primary-600 dark:text-primary-400">{v}</span>
                              </div>
                            ))}
                            {Object.keys(promotionPreview.transitions || {}).length === 0 && (
                              <div className="text-slate-500 dark:text-slate-400">No transitions available for the selected scope.</div>
                            )}
                          </div>
                        </div>

                        {Array.isArray(promotionPreview.blockers) && promotionPreview.blockers.length > 0 && (
                          <div className="rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/70 dark:bg-amber-950/20 p-4">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-sm mb-2">
                              <AlertTriangle size={16} /> Blockers Found
                            </div>
                            <p className="text-xs text-amber-700/90 dark:text-amber-300/90">Some students cannot be promoted due to missing next-semester section mapping with same section label.</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="card-main">
                      <div className="flex items-center gap-2 mb-4">
                        <History size={16} className="text-primary-500" />
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">Promotion History</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest">
                              <th className="py-2 pr-3">When</th>
                              <th className="py-2 pr-3">Admin</th>
                              <th className="py-2 pr-3">Scope</th>
                              <th className="py-2 pr-3">Session</th>
                              <th className="py-2 pr-3">Promoted</th>
                              <th className="py-2 pr-3">Graduated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {promotionHistory.map(log => (
                              <tr key={log.id} className="border-t border-slate-200 dark:border-slate-700">
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{new Date(log.promoted_at).toLocaleString()}</td>
                                <td className="py-3 pr-3 text-slate-700 dark:text-slate-300 font-semibold">{log.admin?.name || '—'}</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{log.scope}</td>
                                <td className="py-3 pr-3 text-slate-600 dark:text-slate-400">{log.from_session?.name} → {log.to_session?.name}</td>
                                <td className="py-3 pr-3 text-slate-700 dark:text-slate-300 font-bold">{log.promoted_count}</td>
                                <td className="py-3 pr-3 text-slate-700 dark:text-slate-300 font-bold">{log.graduated_count}</td>
                              </tr>
                            ))}
                            {promotionHistory.length === 0 && (
                              <tr>
                                <td className="py-4 text-slate-500 dark:text-slate-400" colSpan={6}>No promotion history yet.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* STUDENT LOOKUP */}
                {tab === 'students' && (
                  <div className="flex flex-col gap-6">
                    {/* Search bar */}
                    <div className="card-main border border-primary-500/20 bg-gradient-to-br from-primary-50/50 via-transparent to-transparent dark:from-primary-950/20 dark:via-transparent dark:to-transparent">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 bg-primary-100 dark:bg-primary-900/40 rounded-2xl flex items-center justify-center">
                          <Search size={24} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg text-slate-900 dark:text-white">Student Directory</h3>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">Find and manage student records</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                        Search by <span className="font-bold text-primary-600 dark:text-primary-400">Anonymous ID</span> (e.g. <span className="font-mono text-primary-500">ANO-A3F2B1</span>), name, or college ID to find and view student records.
                      </p>
                      <div className="relative">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          placeholder="Search by Anonymous ID, name, or college ID…"
                          className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-14 pr-5 py-4 text-sm text-slate-800 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                        />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">
                            <X size={18} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-6 mt-4 text-xs font-bold">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Hash size={14} /> Total: <span className="text-slate-900 dark:text-white">{students.length}</span>
                        </span>
                        {q && <span className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                          <UserCheck size={14} /> Found: <span className="text-slate-900 dark:text-white">{filteredStudents.length}</span>
                        </span>}
                      </div>
                    </div>

                    {/* Student grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredStudents.map(s => {
                        const isRevealed = revealedIds.has(s.id);
                        return (
                          <motion.div
                            key={s.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 flex flex-col gap-3 relative"
                          >
                            {/* Anonymous ID - always visible */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 flex flex-col gap-1.5">
                                <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Anonymous ID (Public)</span>
                                <span className="text-sm font-mono font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-3 py-2 rounded-xl border border-primary-100 dark:border-primary-800/40">
                                  {s.unique_feedback_id || 'ANO-?????'}
                                </span>
                              </div>
                              <span className={`text-[9px] font-bold px-2.5 py-1 rounded-lg uppercase whitespace-nowrap ${s.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'}`}>
                                {s.status}
                              </span>
                            </div>

                            {/* Real identity - hidden/revealed */}
                            <div className="flex items-start justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                              {isRevealed ? (
                                <div className="flex flex-col gap-2 flex-1 min-w-0">
                                  <span className="text-[9px] font-bold text-accent-600 dark:text-accent-400 uppercase tracking-widest">Real Identity (Revealed)</span>
                                  <div>
                                    <div className="text-base font-black text-slate-900 dark:text-white truncate">{s.name}</div>
                                    {s.student_id && <div className="text-[10px] font-mono text-accent-600 dark:text-accent-400 mt-1.5 font-bold">Roll: {s.student_id}</div>}
                                    {s.email && <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 truncate">{s.email}</div>}
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-1">
                                  <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Real Identity</span>
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 italic">Click 👁 to reveal</span>
                                </div>
                              )}
                              <button
                                onClick={() => toggleReveal(s.id)}
                                className={`p-2.5 rounded-xl transition-all cursor-pointer flex-shrink-0 ${isRevealed
                                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60'
                                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
                                }`}
                                title={isRevealed ? 'Hide Identity' : 'Reveal Identity'}
                              >
                                {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            {/* Section info */}
                            {(s.section_name || s.semester) && (
                              <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2 flex-wrap pt-1">
                                {s.section_name && <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{s.section_name}</span>}
                                {s.semester && <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">Sem {s.semester}</span>}
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                      {filteredStudents.length === 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full card-main flex flex-col items-center justify-center py-16 text-center">
                          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-600 dark:text-slate-400">
                            <GraduationCap size={32} />
                          </div>
                          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No Students Found</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm">
                            {q ? 'Try searching with a different ID, name, or college ID.' : 'Student records will appear here when available.'}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="card-main flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                          {pagination.total} total records
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            disabled={pagination.page <= 1}
                            onClick={() => loadAll(pagination.page - 1)}
                            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all"
                          >
                            Prev
                          </button>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400 min-w-fit">
                            {pagination.page} / {pagination.totalPages}
                          </span>
                          <button
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => loadAll(pagination.page + 1)}
                            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
