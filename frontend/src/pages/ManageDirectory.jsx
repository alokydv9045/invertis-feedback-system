import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { BookOpen, Users, Plus, Trash2, Settings, Building2, Download, Upload, RefreshCw, X } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";
const Label = ({ children }) => <label className="block text-sm font-semibold text-gray-700 mb-1">{children}</label>;

const TABS = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'sync', label: 'Data Sync', icon: Download },
];

export default function ManageDirectory() {
  const [activeTab, setActiveTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [deptName, setDeptName] = useState(''); const [deptCode, setDeptCode] = useState('');
  const [courseName, setCourseName] = useState(''); const [courseCode, setCourseCode] = useState(''); const [courseDept, setCourseDept] = useState('');
  const [facultyName, setFacultyName] = useState(''); const [facultyDept, setFacultyDept] = useState('');
  const [syncMode, setSyncMode] = useState('merge'); const [importFile, setImportFile] = useState(null);

  const showMsg = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text: '', type: '' }), 4000); };
  const loadData = async () => { try { setLoading(true); const [rD, rC, rF] = await Promise.all([api.get('/tlfq/departments'), api.get('/tlfq/courses'), api.get('/tlfq/faculty')]); setDepartments(rD.data); setCourses(rC.data); setFaculty(rF.data); } catch { showMsg('Failed to load.', 'error'); } finally { setLoading(false); } };
  useEffect(() => { loadData(); }, []);

  const handleCreateDept = async (e) => { e.preventDefault(); if (!deptName || !deptCode) return; try { await api.post('/tlfq/departments', { name: deptName, code: deptCode }); setDeptName(''); setDeptCode(''); showMsg('Department added.'); loadData(); } catch (err) { showMsg(err.response?.data?.message || 'Failed.', 'error'); } };
  const handleCreateCourse = async (e) => { e.preventDefault(); if (!courseName || !courseCode || !courseDept) return; try { await api.post('/tlfq/courses', { name: courseName, code: courseCode, department_id: courseDept }); setCourseName(''); setCourseCode(''); setCourseDept(''); showMsg('Course added.'); loadData(); } catch (err) { showMsg(err.response?.data?.message || 'Failed.', 'error'); } };
  const handleCreateFaculty = async (e) => { e.preventDefault(); if (!facultyName || !facultyDept) return; try { await api.post('/tlfq/faculty', { name: facultyName, department_id: facultyDept }); setFacultyName(''); setFacultyDept(''); showMsg('Faculty added.'); loadData(); } catch (err) { showMsg(err.response?.data?.message || 'Failed.', 'error'); } };
  const handleDelete = async (type, id) => { if (!window.confirm(`Delete this ${type}?`)) return; try { await api.delete(`/tlfq/${type}/${id}`); showMsg(`${type} deleted.`); loadData(); } catch { showMsg(`Failed to delete.`, 'error'); } };

  const handleExportData = async () => { try { const res = await api.get('/sync/export'); const a = document.createElement('a'); a.href = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(res.data, null, 2))}`; a.download = `tlfq-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); } catch { showMsg('Export failed.', 'error'); } };
  const handleImportData = async () => { if (!importFile) return; if (syncMode === 'overwrite' && !window.confirm('This will erase current data. Continue?')) return; const reader = new FileReader(); reader.onload = async (e) => { try { await api.post('/sync/import', { data: JSON.parse(e.target.result), mode: syncMode }); showMsg(`Synced (${syncMode}).`); setImportFile(null); loadData(); } catch { showMsg('Import failed.', 'error'); } }; reader.readAsText(importFile); };

  return (
    <div className="animate-fade-in max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center"><Settings size={20} className="text-invertis-blue" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Directory Hub</h1><p className="text-sm text-gray-500">Manage departments, courses and faculty records.</p></div>
      </div>

      {msg.text && <div className={`mb-4 p-3 border text-sm font-semibold rounded-lg flex items-center justify-between ${msg.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>{msg.text}<button onClick={() => setMsg({ text: '', type: '' })} className="cursor-pointer"><X size={14} /></button></div>}

      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${activeTab === id ? 'bg-white text-invertis-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex items-center justify-center py-20"><div className="h-10 w-10 border-4 border-invertis-blue border-t-transparent rounded-full animate-spin" /></div> : (
        <>
          {activeTab === 'departments' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Plus size={14} className="text-invertis-blue" /> New Department</h3>
              <form onSubmit={handleCreateDept} className="space-y-3"><div><Label>Name</Label><input value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="Computer Science" className={inputCls} /></div>
              <div><Label>Code</Label><input value={deptCode} onChange={e => setDeptCode(e.target.value)} placeholder="CSE" className={inputCls} /></div>
              <button type="submit" className="w-full bg-invertis-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm cursor-pointer transition-all">Add Department</button></form>
            </CardBody></Card>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {departments.map(d => (<Card key={d.id} hover><CardBody className="py-3 flex items-center justify-between">
                <div><p className="text-sm font-bold text-gray-900">{d.name}</p><p className="text-xs text-gray-400 font-mono">{d.code}</p></div>
                <button onClick={() => handleDelete('departments', d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
              </CardBody></Card>))}
            </div>
          </div>)}

          {activeTab === 'courses' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Plus size={14} className="text-invertis-blue" /> New Course</h3>
              <form onSubmit={handleCreateCourse} className="space-y-3"><div><Label>Code</Label><input value={courseCode} onChange={e => setCourseCode(e.target.value)} placeholder="CS201" className={inputCls} /></div>
              <div><Label>Title</Label><input value={courseName} onChange={e => setCourseName(e.target.value)} placeholder="Data Structures" className={inputCls} /></div>
              <div><Label>Department</Label><select value={courseDept} onChange={e => setCourseDept(e.target.value)} className={`${inputCls} cursor-pointer`}><option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <button type="submit" className="w-full bg-invertis-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm cursor-pointer transition-all">Add Course</button></form>
            </CardBody></Card>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {courses.map(c => (<Card key={c.id} hover><CardBody className="py-3 flex items-center justify-between">
                <div><p className="text-sm font-bold text-gray-900">{c.name}</p><div className="flex gap-2 mt-1"><span className="text-[10px] font-semibold text-invertis-blue bg-blue-50 px-2 py-0.5 rounded">{c.code}</span><span className="text-xs text-gray-400">{c.department_name}</span></div></div>
                <button onClick={() => handleDelete('courses', c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
              </CardBody></Card>))}
            </div>
          </div>)}

          {activeTab === 'faculty' && (<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2"><Plus size={14} className="text-invertis-blue" /> New Faculty</h3>
              <p className="text-xs text-gray-500 mb-3">Add faculty for feedback questionnaires.</p>
              <form onSubmit={handleCreateFaculty} className="space-y-3"><div><Label>Full Name</Label><input value={facultyName} onChange={e => setFacultyName(e.target.value)} placeholder="Dr. Turing" className={inputCls} /></div>
              <div><Label>Department</Label><select value={facultyDept} onChange={e => setFacultyDept(e.target.value)} className={`${inputCls} cursor-pointer`}><option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
              <button type="submit" className="w-full bg-invertis-blue hover:bg-blue-800 text-white font-semibold py-3 rounded-lg text-sm cursor-pointer transition-all">Add Faculty</button></form>
            </CardBody></Card>
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {faculty.map(f => (<Card key={f.id} hover><CardBody className="py-3 flex items-center justify-between">
                <div><p className="text-sm font-bold text-gray-900">{f.name}</p><p className="text-xs text-gray-400">{f.department_name}</p></div>
                <button onClick={() => handleDelete('faculty', f.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
              </CardBody></Card>))}
            </div>
          </div>)}

          {activeTab === 'sync' && (<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card><CardBody>
              <div className="flex items-center gap-3 mb-4"><Download size={20} className="text-invertis-blue" /><div><h3 className="text-sm font-bold text-gray-900">Export Data</h3><p className="text-xs text-gray-500">Download system backup.</p></div></div>
              <Button icon={Download} onClick={handleExportData} className="w-full">Download Backup</Button>
            </CardBody></Card>
            <Card><CardBody>
              <div className="flex items-center gap-3 mb-4"><Upload size={20} className="text-emerald-500" /><div><h3 className="text-sm font-bold text-gray-900">Import Data</h3><p className="text-xs text-gray-500">Upload and synchronize records.</p></div></div>
              <input type="file" accept="application/json" onChange={e => setImportFile(e.target.files[0])} className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500 cursor-pointer w-full mb-3" />
              <div className="grid grid-cols-2 gap-2 mb-3">{['merge', 'overwrite'].map(m => (<button key={m} onClick={() => setSyncMode(m)} className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${syncMode === m ? 'bg-invertis-blue border-invertis-blue text-white' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>{m === 'merge' ? 'Merge' : 'Overwrite'}</button>))}</div>
              <Button icon={RefreshCw} onClick={handleImportData} disabled={!importFile} variant={importFile ? 'primary' : 'secondary'} className="w-full">Sync</Button>
            </CardBody></Card>
          </div>)}
        </>
      )}
    </div>
  );
}
