import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, Trash2, Settings, Building2, Download, Upload, RefreshCw } from 'lucide-react';

const inputCls = 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm text-slate-800 dark:text-[var(--text-main)] placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 w-full transition-all shadow-sm';

export default function ManageDirectory() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Create state
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDept, setCourseDept] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [facultyDept, setFacultyDept] = useState('');
  const [syncMode, setSyncMode] = useState('merge');
  const [importFile, setImportFile] = useState(null);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 4000); };

  const loadData = async () => {
    try {
      setLoading(true);
      const [rD, rC, rF] = await Promise.all([
        api.get('/tlfq/departments'),
        api.get('/tlfq/courses'),
        api.get('/tlfq/faculty')
      ]);
      setDepartments(rD.data);
      setCourses(rC.data);
      setFaculty(rF.data);
    } catch { showMsg('Failed to load data.', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateDept = async (e) => {
    e.preventDefault();
    if (!deptName || !deptCode) return;
    try {
      await api.post('/tlfq/departments', { name: deptName, code: deptCode });
      setDeptName(''); setDeptCode('');
      showMsg('Department added successfully.'); loadData();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to add department.', 'error'); }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseName || !courseCode || !courseDept) return;
    try {
      await api.post('/tlfq/courses', { name: courseName, code: courseCode, department_id: courseDept });
      setCourseName(''); setCourseCode(''); setCourseDept('');
      showMsg('Course added successfully.'); loadData();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to add course.', 'error'); }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    if (!facultyName || !facultyDept) return;
    try {
      await api.post('/tlfq/faculty', { name: facultyName, department_id: facultyDept });
      setFacultyName(''); setFacultyDept('');
      showMsg('Faculty record added.'); loadData();
    } catch (err) { showMsg(err.response?.data?.message || 'Failed to add faculty.', 'error'); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await api.delete(`/tlfq/${type}/${id}`);
      showMsg(`${type} deleted.`); loadData();
    } catch { showMsg(`Failed to delete ${type}.`, 'error'); }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/sync/export');
      const a = document.createElement('a');
      a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`;
      a.download = `tlfq-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch { showMsg('Export failed.', 'error'); }
  };

  const handleImportData = async () => {
    if (!importFile) return;
    if (syncMode === 'overwrite' && !window.confirm('WARNING: This will erase all current data. Are you sure?')) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        await api.post('/sync/import', { data: JSON.parse(e.target.result), mode: syncMode });
        showMsg(`Data synchronized successfully (${syncMode} mode).`);
        setImportFile(null); loadData();
      } catch { showMsg('Import failed. Ensure valid JSON.', 'error'); }
    };
    reader.readAsText(importFile);
  };

  const TABS = [
    { id: 'departments', label: 'Departments', icon: Building2 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'faculty', label: 'Faculty', icon: Users },
    { id: 'sync', label: 'Data Sync', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] flex flex-col transition-colors duration-500">
      <Navbar />
      <div className="flex flex-col md:flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-auto">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-6xl w-full mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Settings size={24} className="text-primary-500" />
                <h1 className="text-2xl sm:text-3xl font-black">Directory Hub</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Manage the structural entities of the feedback system.</p>
            </div>

            {msg.text && (
              <div className={`p-5 rounded-2xl text-sm font-bold border shadow-sm ${
                msg.type === 'error'
                  ? 'bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-400 border-accent-100 dark:border-accent-900/50'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
              }`}>{msg.text}</div>
            )}

            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 flex-nowrap overflow-x-auto no-scrollbar pb-1">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-4 sm:px-6 py-4 text-xs sm:text-sm font-black border-b-2 transition -mb-px cursor-pointer uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${
                    activeTab === id
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-[var(--text-main)]'
                  }`}
                >
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="card-main p-24 flex flex-col items-center gap-4">
                <div className="h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400 animate-pulse">Syncing Directory...</span>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {/* DEPARTMENTS */}
                {activeTab === 'departments' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="card-main flex flex-col gap-6 h-fit">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider"><Plus size={18} className="text-primary-500" /> New Department</h3>
                      <form onSubmit={handleCreateDept} className="flex flex-col gap-4">
                        <input type="text" placeholder="Engineering Name" value={deptName} onChange={e => setDeptName(e.target.value)} className={inputCls} />
                        <input type="text" placeholder="Short Code (e.g. CSE)" value={deptCode} onChange={e => setDeptCode(e.target.value)} className={inputCls} />
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">Add Department</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider"><Building2 size={18} className="text-primary-500" /> Registered Entities</h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">{departments.length} Units</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {departments.map(d => (
                          <motion.div
                            key={d.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => handleDelete('departments', d.id)}
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
                                <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{d.name}</h3>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50 mt-1.5">
                                  {d.code}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* COURSES */}
                {activeTab === 'courses' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="card-main flex flex-col gap-6 h-fit">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider"><Plus size={18} className="text-primary-500" /> New Course</h3>
                      <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                        <input type="text" placeholder="CS-XXX" value={courseCode} onChange={e => setCourseCode(e.target.value)} className={inputCls} />
                        <input type="text" placeholder="Course Title" value={courseName} onChange={e => setCourseName(e.target.value)} className={inputCls} />
                        <select value={courseDept} onChange={e => setCourseDept(e.target.value)} className={inputCls + ' cursor-pointer'}>
                          <option value="">Department Context…</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">Add Course</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider"><BookOpen size={18} className="text-primary-500" /> Academic Catalog</h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">{courses.length} Courses</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {courses.map(c => (
                          <motion.div
                            key={c.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => handleDelete('courses', c.id)}
                                className="p-3 bg-white dark:bg-slate-800 hover:bg-accent-600 text-accent-500 hover:text-white rounded-2xl transition-all cursor-pointer shadow-lg border border-slate-100 dark:border-slate-700 hover:border-accent-500"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                            <div className="flex items-center gap-5">
                              <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-primary-500 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300">
                                <BookOpen size={28} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{c.name}</h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-[9px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2.5 py-1 rounded-lg border border-primary-100 dark:border-primary-800/30 uppercase tracking-tighter">{c.code}</span>
                                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold truncate uppercase tracking-widest">{c.department_name}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* FACULTY */}
                {activeTab === 'faculty' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="card-main flex flex-col gap-6 h-fit">
                      <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] flex items-center gap-2 text-sm uppercase tracking-wider"><Plus size={18} className="text-primary-500" /> New Faculty</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Adding a faculty record allows them to be assigned to feedback questionnaires. These are informational entities.</p>
                      <form onSubmit={handleCreateFaculty} className="flex flex-col gap-4">
                        <input type="text" placeholder="Full Professional Name" value={facultyName} onChange={e => setFacultyName(e.target.value)} className={inputCls} />
                        <select value={facultyDept} onChange={e => setFacultyDept(e.target.value)} className={inputCls + ' cursor-pointer'}>
                          <option value="">Assigned Unit…</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 cursor-pointer active:scale-95">Add Faculty</button>
                      </form>
                    </div>
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="flex items-center justify-between mb-2 px-2">
                        <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] text-sm flex items-center gap-2 uppercase tracking-wider"><Users size={18} className="text-primary-500" /> Faculty Directory</h3>
                        <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 border border-primary-100 dark:border-primary-800/40 px-3 py-1 rounded-full uppercase tracking-widest">{faculty.length} Records</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {faculty.map(f => (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="card-main group hover:border-primary-500/40 relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-all flex gap-2 translate-y-2 group-hover:translate-y-0">
                              <button
                                onClick={() => handleDelete('faculty', f.id)}
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
                                <h3 className="font-black text-slate-900 dark:text-white text-base truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{f.name}</h3>
                                <div className="text-[10px] text-slate-600 dark:text-slate-400 font-black uppercase tracking-[0.1em] mt-2">{f.department_name}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* SYNC */}
                {activeTab === 'sync' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="card-main flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600">
                          <Download size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] uppercase tracking-wider">Export Ledger</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Securely download the entire system state.</p>
                        </div>
                      </div>
                      <button onClick={handleExportData} className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-4.5 rounded-2xl text-xs flex items-center justify-center gap-3 cursor-pointer uppercase tracking-widest transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                        <Download size={18} /> Download Backup Manifest
                      </button>
                    </div>
                    <div className="card-main flex flex-col gap-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                          <Upload size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 dark:text-[var(--text-main)] uppercase tracking-wider">State Synchronizer</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Upload and reconcile directory records.</p>
                        </div>
                      </div>
                      <input type="file" accept="application/json" onChange={e => setImportFile(e.target.files[0])} className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-500 dark:text-slate-400 cursor-pointer focus:outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                        {['merge', 'overwrite'].map(m => (
                          <button key={m} onClick={() => setSyncMode(m)} className={`py-3.5 px-4 rounded-2xl border text-[10px] font-black transition-all cursor-pointer uppercase tracking-widest ${syncMode === m ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'}`}>
                            {m === 'merge' ? 'Merge (Add)' : 'Full Wipe & Set'}
                          </button>
                        ))}
                      </div>
                      <button onClick={handleImportData} disabled={!importFile} className={`w-full font-black py-4.5 rounded-2xl text-xs flex items-center justify-center gap-3 cursor-pointer uppercase tracking-widest transition-all ${importFile ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-not-allowed'}`}>
                        <RefreshCw size={16} className={importFile ? 'animate-spin-slow' : ''} /> Execute Synchronization
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
