import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Alert';
import { Shield, Building2, Users, Plus, Trash2, Check, X, Eye, EyeOff, GraduationCap, Search, UserCheck, Hash } from 'lucide-react';

const TABS_LIST = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'hods',        label: 'HODs',        icon: Users },
  { id: 'coordinators',label: 'Coordinators',icon: Users },
  { id: 'students',    label: 'Student Lookup', icon: GraduationCap },
];

export default function SuperAdminPanel() {
  const [tab, setTab] = useState('departments');
  const [msg, setMsg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [hodName, setHodName] = useState('');
  const [hodEmail, setHodEmail] = useState('');
  const [hodPass, setHodPass] = useState('');
  const [hodDept, setHodDept] = useState('');
  const [showHodPass, setShowHodPass] = useState(false);
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordPass, setCoordPass] = useState('');
  const [showCoordPass, setShowCoordPass] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedIds, setRevealedIds] = useState(new Set());

  const loadAll = async () => {
    try {
      const [rD, rS, rStud] = await Promise.all([api.get('/coordinator/departments'), api.get('/superadmin/staff'), api.get('/coordinator/students')]);
      setDepartments(rD.data); setStaff(rS.data); setStudents(rStud.data);
    } catch {}
  };

  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t); } }, [msg]);

  const showMsgFn = (type, text) => setMsg({ type, text });
  const createDept = async () => { try { await api.post('/coordinator/departments', { name: deptName, code: deptCode }); setDeptName(''); setDeptCode(''); loadAll(); showMsgFn('success', 'Department created.'); } catch (e) { showMsgFn('error', e.response?.data?.message || 'Failed.'); } };
  const deleteDept = async (id) => { try { await api.delete(`/coordinator/departments/${id}`); loadAll(); } catch { showMsgFn('error', 'Failed.'); } };
  const createHod = async () => { try { await api.post('/superadmin/hods', { name: hodName, email: hodEmail, password: hodPass, department_id: hodDept }); setHodName(''); setHodEmail(''); setHodPass(''); setHodDept(''); loadAll(); showMsgFn('success', 'HOD created.'); } catch (e) { showMsgFn('error', e.response?.data?.message || 'Failed.'); } };
  const createCoord = async () => { try { await api.post('/superadmin/coordinators', { name: coordName, email: coordEmail, password: coordPass }); setCoordName(''); setCoordEmail(''); setCoordPass(''); loadAll(); showMsgFn('success', 'Coordinator created.'); } catch (e) { showMsgFn('error', e.response?.data?.message || 'Failed.'); } };
  const deleteUser = async (id) => { try { await api.delete(`/superadmin/users/${id}`); loadAll(); } catch { showMsgFn('error', 'Failed.'); } };
  const toggleReveal = (id) => { setRevealedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const hods = staff.filter(s => s.role === 'hod');
  const coords = staff.filter(s => s.role === 'coordinator');
  const q = searchQuery.trim().toUpperCase();
  const filteredStudents = q ? students.filter(s => (s.unique_feedback_id || '').toUpperCase().includes(q) || s.name?.toUpperCase().includes(q) || (s.student_id || '').toUpperCase().includes(q)) : students;

  return (
    <div className="animate-fade-in max-w-5xl relative">
      <div className="absolute -inset-6 overflow-hidden pointer-events-none select-none">
        <img src="/campus/gate.jpg" alt="" className="w-full h-full object-cover opacity-15" />
      </div>
      <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center"><Shield size={20} className="text-invertis-orange" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1><p className="text-sm text-gray-500">Manage departments, HODs, coordinators & view student identities</p></div>
      </div>

      {msg && <Alert type={msg.type} onClose={() => setMsg(null)} className="mb-4">{msg.text}</Alert>}

      <Tabs tabs={TABS_LIST} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>

          {tab === 'departments' && (
            <div className="space-y-4">
              <Card><CardBody>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Create Department</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Name" value={deptName} onChange={e => setDeptName(e.target.value)} placeholder="B.Tech Computer Science" />
                  <Input label="Code" value={deptCode} onChange={e => setDeptCode(e.target.value.toUpperCase())} placeholder="BCS" />
                  <div className="flex items-end"><Button icon={Plus} onClick={createDept}>Create</Button></div>
                </div>
              </CardBody></Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map((d, idx) => (
                  <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card><CardBody className="py-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-gray-900">{d.name}</p><p className="text-xs text-gray-400 font-mono">{d.code}</p></div>
                      <button onClick={() => deleteDept(d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${d.name}`}><Trash2 size={16} /></button>
                    </CardBody></Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === 'hods' && (
            <div className="space-y-4">
              <Card><CardBody>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Create HOD Account</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input label="Full Name" value={hodName} onChange={e => setHodName(e.target.value)} placeholder="Dr. Rajesh Kumar" />
                  <Input label="Email" type="email" value={hodEmail} onChange={e => setHodEmail(e.target.value)} placeholder="hod@invertis.edu.in" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showHodPass ? 'text' : 'password'} value={hodPass} onChange={e => setHodPass(e.target.value)} placeholder="Min. 8 characters"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all" />
                      <button type="button" onClick={() => setShowHodPass(!showHodPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Toggle password visibility">{showHodPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                  <Select label="Department" value={hodDept} onChange={e => setHodDept(e.target.value)}>
                    <option value="">Select…</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </Select>
                </div>
                <Button icon={Check} onClick={createHod} className="mt-3">Create HOD</Button>
              </CardBody></Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {hods.map((h, idx) => { const dept = departments.find(d => d.id === h.department_id); return (
                  <motion.div key={h.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card><CardBody className="py-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-gray-900">{h.name}</p><p className="text-xs text-gray-500">{h.email}</p><p className="text-xs text-invertis-blue font-semibold mt-0.5">{dept?.name || '—'}</p></div>
                      <button onClick={() => deleteUser(h.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${h.name}`}><Trash2 size={16} /></button>
                    </CardBody></Card>
                  </motion.div>
                ); })}
              </div>
            </div>
          )}

          {tab === 'coordinators' && (
            <div className="space-y-4">
              <Card><CardBody>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Create Coordinator Account</h3>
                <p className="text-xs text-gray-400 mb-3">Coordinators have university-wide access.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input label="Full Name" value={coordName} onChange={e => setCoordName(e.target.value)} placeholder="Academic Coordinator" />
                  <Input label="Email" type="email" value={coordEmail} onChange={e => setCoordEmail(e.target.value)} placeholder="coordinator@invertis.edu.in" />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input type={showCoordPass ? 'text' : 'password'} value={coordPass} onChange={e => setCoordPass(e.target.value)} placeholder="Min. 8 characters"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all" />
                      <button type="button" onClick={() => setShowCoordPass(!showCoordPass)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer" aria-label="Toggle password visibility">{showCoordPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  </div>
                </div>
                <Button icon={Check} onClick={createCoord} className="mt-3">Create Coordinator</Button>
              </CardBody></Card>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {coords.map((c, idx) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                    <Card><CardBody className="py-3 flex items-center justify-between">
                      <div><p className="text-sm font-bold text-gray-900">{c.name}</p><p className="text-xs text-gray-500">{c.email}</p><p className="text-xs text-purple-500 font-semibold mt-0.5">University-wide access</p></div>
                      <button onClick={() => deleteUser(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
                    </CardBody></Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {tab === 'students' && (
            <div className="space-y-4">
              <Card className="border-emerald-200 bg-emerald-50/30"><CardBody>
                <div className="flex items-center gap-3 mb-3"><Search size={18} className="text-emerald-500" /><h3 className="text-lg font-bold text-gray-900">Student Identity Lookup</h3></div>
                <p className="text-xs text-gray-500 mb-4">Search by <span className="font-semibold text-invertis-blue">Anonymous ID</span> (e.g. <span className="font-mono text-emerald-600">ANO-A3F2B1</span>) to reveal real student identity.</p>
                <Input icon={Search} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search by Anonymous ID or real name..." />
                <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Hash size={12} /> Total: <span className="font-bold text-gray-700">{students.length}</span></span>
                  {q && <span className="flex items-center gap-1"><UserCheck size={12} /> Matches: <span className="font-bold text-emerald-600">{filteredStudents.length}</span></span>}
                </div>
              </CardBody></Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStudents.map((s, idx) => {
                  const isRevealed = revealedIds.has(s.id);
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
                      <Card className="hover:border-emerald-200 transition-colors">
                        <CardBody className="py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Anonymous ID</span>
                              <div className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-sm">{s.unique_feedback_id || 'ANO-?????'}</div>
                            </div>
                            <Badge status={s.status === 'active' ? 'active' : 'pending'}>{s.status}</Badge>
                          </div>
                          <div className="flex items-start justify-between gap-2 pt-2 border-t border-gray-100">
                            {isRevealed ? (
                              <div><span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">Real Identity</span>
                                <p className="text-sm font-bold text-gray-900">{s.name}</p>
                                <p className="text-xs font-mono text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-200 w-fit mt-1">Roll: {s.student_id || '—'}</p>
                                {s.email && <p className="text-xs text-gray-400 mt-0.5">{s.email}</p>}
                              </div>
                            ) : (
                              <div><span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Real Identity</span>
                                <p className="text-sm text-gray-400 italic">Hidden — Click 👁 to Reveal</p>
                              </div>
                            )}
                            <button onClick={() => toggleReveal(s.id)} title={isRevealed ? 'Hide' : 'Reveal'}
                              aria-label={isRevealed ? `Hide identity of ${s.unique_feedback_id}` : `Reveal identity of ${s.unique_feedback_id}`}
                              className={`p-2 rounded-lg transition-all cursor-pointer ${isRevealed ? 'bg-amber-50 text-amber-500 hover:bg-amber-100' : 'bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                              {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-2">{s.section_name || 'No section'}{s.semester && ` • Sem ${s.semester}`}</p>
                        </CardBody>
                      </Card>
                    </motion.div>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <div className="col-span-full"><Card><EmptyState icon={GraduationCap} title={q ? 'No matches' : 'No students'} message={q ? 'Try a different ID or name.' : 'No students found.'} /></Card></div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      </div>{/* close z-10 */}
    </div>
  );
}
