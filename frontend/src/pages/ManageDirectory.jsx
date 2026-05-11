import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, Trash2, Settings, Building2, Download, Upload, RefreshCw } from 'lucide-react';

const inputCls = 'bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1a2233] font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] w-full transition-all shadow-sm';

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
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-6xl mx-auto">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Settings size={24} className="text-[#f15a24]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1a2233]">Directory Management</h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-12">Manage departments, courses, and faculty data records.</p>
              </div>

              {msg.text && (
                <div className={`p-4 rounded-xl text-sm font-bold border shadow-sm ${
                  msg.type === 'error'
                    ? 'bg-rose-50 text-rose-700 border-rose-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}>{msg.text}</div>
              )}

              {/* Tabs */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#e2e8f0] shadow-sm self-start">
                {TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer rounded-lg ${
                      activeTab === id
                        ? 'bg-[#1a2233] text-white shadow-md'
                        : 'text-gray-400 hover:text-[#1a2233] hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={14} className={activeTab === id ? 'text-[#f15a24]' : ''} /> {label}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
                  <div className="h-12 w-12 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Records...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {/* DEPARTMENTS */}
                  {activeTab === 'departments' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 h-fit shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#f15a24]"></div>
                        <h3 className="font-black text-[#1a2233] flex items-center gap-2 text-xs uppercase tracking-widest"><Plus size={16} className="text-[#f15a24]" /> Add Department</h3>
                        <form onSubmit={handleCreateDept} className="flex flex-col gap-4">
                          <input type="text" placeholder="E.g. Computer Science & Engineering" value={deptName} onChange={e => setDeptName(e.target.value)} className={inputCls} />
                          <input type="text" placeholder="Code (e.g. CSE)" value={deptCode} onChange={e => setDeptCode(e.target.value)} className={inputCls} />
                          <button type="submit" className="w-full bg-[#1a2233] hover:bg-[#242f45] text-white py-3.5 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-slate-900/10">Add Department</button>
                        </form>
                      </div>
                      <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
                          <h3 className="font-black text-[#1a2233] text-xs uppercase tracking-widest flex items-center gap-2"><Building2 size={16} className="text-[#f15a24]" /> All Departments</h3>
                          <span className="text-[10px] bg-[#f15a24] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm shadow-orange-500/20">{departments.length} Units</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black border-b border-[#e2e8f0]">
                            <tr><th className="px-6 py-4 text-left">Department Name</th><th className="px-6 py-4 text-left">Code</th><th className="px-6 py-4"></th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0]">
                            {departments.map(d => (
                              <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-[#1a2233]">{d.name}</td>
                                <td className="px-6 py-4"><span className="text-[10px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{d.code}</span></td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleDelete('departments', d.id)} className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* COURSES */}
                  {activeTab === 'courses' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 h-fit shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#f15a24]"></div>
                        <h3 className="font-black text-[#1a2233] flex items-center gap-2 text-xs uppercase tracking-widest"><Plus size={16} className="text-[#f15a24]" /> Add Course</h3>
                        <form onSubmit={handleCreateCourse} className="flex flex-col gap-4">
                          <input type="text" placeholder="Course Code (e.g. CS401)" value={courseCode} onChange={e => setCourseCode(e.target.value)} className={inputCls} />
                          <input type="text" placeholder="Course Name" value={courseName} onChange={e => setCourseName(e.target.value)} className={inputCls} />
                          <select value={courseDept} onChange={e => setCourseDept(e.target.value)} className={inputCls + ' cursor-pointer'}>
                            <option value="">Select Department…</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <button type="submit" className="w-full bg-[#1a2233] hover:bg-[#242f45] text-white py-3.5 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-slate-900/10">Add Course</button>
                        </form>
                      </div>
                      <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
                          <h3 className="font-black text-[#1a2233] text-xs uppercase tracking-widest flex items-center gap-2"><BookOpen size={16} className="text-[#f15a24]" /> All Courses</h3>
                          <span className="text-[10px] bg-[#f15a24] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm shadow-orange-500/20">{courses.length} Active</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black border-b border-[#e2e8f0]">
                            <tr><th className="px-6 py-4 text-left">Code</th><th className="px-6 py-4 text-left">Course Name</th><th className="px-6 py-4 text-left">Dept.</th><th className="px-6 py-4"></th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0]">
                            {courses.map(c => (
                              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-black text-[#f15a24]">{c.code}</td>
                                <td className="px-6 py-4 font-bold text-[#1a2233]">{c.name}</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{c.department_name}</td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleDelete('courses', c.id)} className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* FACULTY */}
                  {activeTab === 'faculty' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-8 flex flex-col gap-6 h-fit shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#f15a24]"></div>
                        <h3 className="font-black text-[#1a2233] flex items-center gap-2 text-xs uppercase tracking-widest"><Plus size={16} className="text-[#f15a24]" /> Add Faculty Record</h3>
                        <p className="text-[11px] text-gray-400 font-medium italic">Faculty are data records only — they do not have portal login access.</p>
                        <form onSubmit={handleCreateFaculty} className="flex flex-col gap-4">
                          <input type="text" placeholder="Full Name (e.g. Dr. Alan Turing)" value={facultyName} onChange={e => setFacultyName(e.target.value)} className={inputCls} />
                          <select value={facultyDept} onChange={e => setFacultyDept(e.target.value)} className={inputCls + ' cursor-pointer'}>
                            <option value="">Select Department…</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                          <button type="submit" className="w-full bg-[#1a2233] hover:bg-[#242f45] text-white py-3.5 font-black uppercase tracking-widest text-[10px] rounded-xl cursor-pointer transition-all active:scale-95 shadow-lg shadow-slate-900/10">Add Faculty</button>
                        </form>
                      </div>
                      <div className="lg:col-span-2 bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-[#e2e8f0] flex items-center justify-between bg-gray-50/50">
                          <h3 className="font-black text-[#1a2233] text-xs uppercase tracking-widest flex items-center gap-2"><Users size={16} className="text-[#f15a24]" /> Faculty Records</h3>
                          <span className="text-[10px] bg-[#f15a24] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm shadow-orange-500/20">{faculty.length} Faculty</span>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black border-b border-[#e2e8f0]">
                            <tr><th className="px-6 py-4 text-left">Faculty Name</th><th className="px-6 py-4 text-left">Department</th><th className="px-6 py-4"></th></tr>
                          </thead>
                          <tbody className="divide-y divide-[#e2e8f0]">
                            {faculty.map(f => (
                              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-bold text-[#1a2233]">{f.name}</td>
                                <td className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{f.department_name}</td>
                                <td className="px-6 py-4 text-right">
                                  <button onClick={() => handleDelete('faculty', f.id)} className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"><Trash2 size={16} /></button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* SYNC */}
                  {activeTab === 'sync' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 flex flex-col gap-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#1a2233]"></div>
                        <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-[#f15a24]">
                          <Download size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-[#1a2233] uppercase tracking-widest text-sm">Export System Data</h3>
                          <p className="text-xs text-gray-400 font-medium mt-1">Export all current records as a JSON backup file for external storage or migration.</p>
                        </div>
                        <button onClick={handleExportData} className="w-full bg-[#1a2233] hover:bg-[#242f45] text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer transition-all shadow-lg shadow-slate-900/10">
                          <Download size={16} /> Download Backup JSON
                        </button>
                      </div>
                      
                      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-10 flex flex-col gap-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#f15a24]"></div>
                        <div className="h-12 w-12 bg-[#1a2233]/5 rounded-xl flex items-center justify-center text-[#1a2233]">
                          <Upload size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-[#1a2233] uppercase tracking-widest text-sm">Import / Synchronize</h3>
                          <p className="text-xs text-gray-400 font-medium mt-1">Import records from a JSON file. Overwrite will erase current records.</p>
                        </div>
                        <input type="file" accept="application/json" onChange={e => setImportFile(e.target.files[0])} className="text-[10px] uppercase font-black tracking-widest bg-gray-50 border border-[#e2e8f0] rounded-xl p-4 text-gray-400 cursor-pointer focus:outline-none file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-[#1a2233] file:text-white file:cursor-pointer shadow-inner" />
                        <div className="grid grid-cols-2 gap-3">
                          {['merge', 'overwrite'].map(m => (
                            <button key={m} onClick={() => setSyncMode(m)} className={`py-3 px-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${syncMode === m ? 'bg-[#1a2233] border-[#1a2233] text-white shadow-md' : 'bg-white border-[#e2e8f0] text-gray-400 hover:text-[#1a2233]'}`}>
                              {m === 'merge' ? 'Merge (Safe)' : 'Overwrite'}
                            </button>
                          ))}
                        </div>
                        <button onClick={handleImportData} disabled={!importFile} className={`w-full font-black py-4 rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${importFile ? 'bg-[#f15a24] hover:bg-[#d94e1d] text-white shadow-lg shadow-orange-500/20' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
                          <RefreshCw size={16} className={importFile ? 'animate-spin-slow' : ''} /> {syncMode === 'merge' ? 'Merge & Sync' : 'Overwrite & Sync'}
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
    </div>
  );
}
