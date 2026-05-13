import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Tabs } from '../components/ui/Tabs';
import { Alert } from '../components/ui/Alert';
import { Plus, Trash2, Check, X, Users, BookOpen, GraduationCap, Link2, Building2, Key } from 'lucide-react';

const TABS_LIST = [
  { id: 'departments', label: 'Departments',  icon: Building2 },
  { id: 'sections',    label: 'Sections',     icon: Link2 },
  { id: 'courses',     label: 'Courses',      icon: BookOpen },
  { id: 'faculty',     label: 'Faculty',      icon: Users },
  { id: 'assignments', label: 'Assignments',  icon: Link2 },
  { id: 'students',    label: 'Students',     icon: GraduationCap },
];

function DepartmentsTab({ departments, onRefresh, setMsg }) {
  const [name, setName] = useState(''); const [code, setCode] = useState('');
  const create = async () => { try { await api.post('/coordinator/departments', { name, code }); setName(''); setCode(''); onRefresh(); setMsg({ type: 'success', text: 'Department created.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  const del = async (id) => { try { await api.delete(`/coordinator/departments/${id}`); onRefresh(); } catch { setMsg({ type: 'error', text: 'Failed.' }); } };
  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Add Department</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="B.Tech Computer Science" />
        <Input label="Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="BCS" />
        <div className="flex items-end"><Button icon={Plus} onClick={create}>Create</Button></div>
      </div>
    </CardBody></Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {departments.map((d, idx) => (
        <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
          <Card><CardBody className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-bold text-gray-900">{d.name}</p><p className="text-xs text-gray-400 font-mono">{d.code}</p></div>
            <button onClick={() => del(d.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${d.name}`}><Trash2 size={16} /></button>
          </CardBody></Card>
        </motion.div>
      ))}
    </div>
  </div>);
}

function SectionsTab({ departments, sections, onRefresh, setMsg }) {
  const [deptId, setDeptId] = useState(''); const [sem, setSem] = useState('3'); const [label, setLabel] = useState('A');
  const create = async () => { try { await api.post('/coordinator/sections', { department_id: deptId, semester: sem, label }); onRefresh(); setMsg({ type: 'success', text: 'Section created.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  const del = async (id) => { try { await api.delete(`/coordinator/sections/${id}`); onRefresh(); } catch { setMsg({ type: 'error', text: 'Failed.' }); } };
  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Create Section</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 md:col-span-1">
          <Select label="Department" value={deptId} onChange={e => setDeptId(e.target.value)}>
            <option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
        <Select label="Semester" value={sem} onChange={e => setSem(e.target.value)}>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </Select>
        <Select label="Section" value={label} onChange={e => setLabel(e.target.value)}>
          {Array.from({length:26},(_,i)=>String.fromCharCode(65+i)).map(l => <option key={l} value={l}>{l}</option>)}
        </Select>
        <div className="flex items-end"><Button icon={Plus} onClick={create}>Create</Button></div>
      </div>
    </CardBody></Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {sections.map((s, idx) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
          <Card><CardBody className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-bold text-gray-900">{s.name}</p><p className="text-xs text-gray-500">{s.department_name} • Semester {s.semester}</p></div>
            <button onClick={() => del(s.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${s.name}`}><Trash2 size={16} /></button>
          </CardBody></Card>
        </motion.div>
      ))}
    </div>
  </div>);
}

function CoursesTab({ departments, courses, onRefresh, setMsg }) {
  const [name, setName] = useState(''); const [code, setCode] = useState(''); const [deptId, setDeptId] = useState('');
  const create = async () => { try { await api.post('/coordinator/courses', { name, code, department_id: deptId }); setName(''); setCode(''); onRefresh(); setMsg({ type: 'success', text: 'Course created.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  const del = async (id) => { try { await api.delete(`/coordinator/courses/${id}`); onRefresh(); } catch { setMsg({ type: 'error', text: 'Failed.' }); } };
  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Add Course</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="col-span-2 md:col-span-1"><Input label="Course Name" value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" /></div>
        <Input label="Code" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="BCS201" />
        <Select label="Department" value={deptId} onChange={e => setDeptId(e.target.value)}>
          <option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div className="flex items-end"><Button icon={Plus} onClick={create}>Add</Button></div>
      </div>
    </CardBody></Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {courses.map((c, idx) => (
        <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
          <Card><CardBody className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-bold text-gray-900">{c.name}</p><p className="text-xs text-gray-500 font-mono">{c.code} • {c.department_name}</p></div>
            <button onClick={() => del(c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${c.name}`}><Trash2 size={16} /></button>
          </CardBody></Card>
        </motion.div>
      ))}
    </div>
  </div>);
}

function FacultyTab({ departments, faculty, onRefresh, setMsg }) {
  const [name, setName] = useState(''); const [deptId, setDeptId] = useState(''); const [teacherType, setTeacherType] = useState('college_faculty');
  const create = async () => { try { await api.post('/coordinator/faculty', { name, department_id: deptId, teacher_type: teacherType }); setName(''); onRefresh(); setMsg({ type: 'success', text: 'Faculty added.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  const del = async (id) => { try { await api.delete(`/coordinator/faculty/${id}`); onRefresh(); } catch { setMsg({ type: 'error', text: 'Failed.' }); } };
  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Add Faculty Member</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2"><Input label="Faculty Name" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Alan Turing" /></div>
        <Select label="Department" value={deptId} onChange={e => setDeptId(e.target.value)}>
          <option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select label="Type" value={teacherType} onChange={e => setTeacherType(e.target.value)}>
          <option value="college_faculty">College Faculty</option><option value="trainer">Trainer</option>
        </Select>
      </div>
      <Button icon={Plus} onClick={create} className="mt-3">Add Faculty</Button>
    </CardBody></Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {faculty.map((f, idx) => (
        <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
          <Card><CardBody className="py-3 flex items-center justify-between">
            <div><p className="text-sm font-bold text-gray-900">{f.name}</p><p className="text-xs text-gray-500">{f.department_name}</p>
              <span className={`inline-flex mt-1 text-[10px] font-semibold px-2 py-0.5 rounded ${f.teacher_type === 'trainer' ? 'text-cyan-600 bg-cyan-50' : 'text-purple-600 bg-purple-50'}`}>
                {f.teacher_type === 'trainer' ? 'Trainer' : 'College Faculty'}
              </span>
            </div>
            <button onClick={() => del(f.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer" aria-label={`Delete ${f.name}`}><Trash2 size={16} /></button>
          </CardBody></Card>
        </motion.div>
      ))}
    </div>
  </div>);
}

function AssignmentsTab({ departments, sections, faculty, courses, onRefresh, setMsg }) {
  const [sectionId, setSectionId] = useState(''); const [facultyId, setFacultyId] = useState(''); const [courseId, setCourseId] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const fSections = deptFilter ? sections.filter(s => s.department_id === deptFilter) : sections;
  const fFaculty = deptFilter ? faculty.filter(f => f.department_id === deptFilter) : faculty;
  const fCourses = deptFilter ? courses.filter(c => c.department_id === deptFilter) : courses;
  const assign = async () => { if (!sectionId || !facultyId || !courseId) { setMsg({ type: 'error', text: 'All fields required.' }); return; }
    try { await api.post('/coordinator/assignments', { section_id: sectionId, faculty_id: facultyId, course_id: courseId }); onRefresh(); setMsg({ type: 'success', text: 'Faculty assigned.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Assign Faculty to Section</h3>
      <div className="space-y-3">
        <Select label="Filter by Department" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
          <option value="">All</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select label="Section" value={sectionId} onChange={e => setSectionId(e.target.value)}>
            <option value="">Select…</option>{fSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </Select>
          <Select label="Faculty" value={facultyId} onChange={e => setFacultyId(e.target.value)}>
            <option value="">Select…</option>{fFaculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </Select>
          <Select label="Course" value={courseId} onChange={e => setCourseId(e.target.value)}>
            <option value="">Select…</option>{fCourses.map(c => <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}
          </Select>
        </div>
        <Button icon={Link2} onClick={assign}>Assign</Button>
      </div>
    </CardBody></Card>
    <Card><CardBody className="py-3"><p className="text-xs text-gray-500">Assignments are shown per section. Manage by deleting a section or recreating assignments.</p></CardBody></Card>
  </div>);
}

function StudentsTab({ departments, sections, students, onRefresh, setMsg }) {
  const [name, setName] = useState(''); const [stdId, setStdId] = useState('');
  const [deptId, setDeptId] = useState(''); const [sectionId, setSectionId] = useState('');
  const [sem, setSem] = useState('3'); const [batch, setBatch] = useState('2025');
  const [resetId, setResetId] = useState(''); const [newPwd, setNewPwd] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const fSections = deptId ? sections.filter(s => s.department_id === deptId) : [];
  const fStudents = filterDept ? students.filter(s => { const sec = sections.find(x => x.id === s.section_id); return sec?.department_id === filterDept; }) : students;

  const create = async () => { try { await api.post('/coordinator/students', { name, student_id: stdId, department_id: deptId, section_id: sectionId, semester: sem, batch }); setName(''); setStdId(''); setSectionId(''); onRefresh(); setMsg({ type: 'success', text: `Student ${stdId} pre-created as PENDING.` }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };
  const resetPwd = async (id) => { if (!newPwd) { setMsg({ type: 'error', text: 'Enter new password.' }); return; }
    try { await api.put(`/coordinator/students/${id}/reset-password`, { new_password: newPwd }); setResetId(''); setNewPwd(''); setMsg({ type: 'success', text: 'Password reset.' }); } catch (e) { setMsg({ type: 'error', text: e.response?.data?.message || 'Failed.' }); } };

  return (<div className="space-y-4">
    <Card><CardBody><h3 className="text-sm font-bold text-gray-900 mb-3">Pre-Create Student Account</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" />
        <Input label="Student ID" value={stdId} onChange={e => setStdId(e.target.value.toUpperCase())} placeholder="BCS2025_55" className="font-mono" />
        <Select label="Department" value={deptId} onChange={e => { setDeptId(e.target.value); setSectionId(''); }}>
          <option value="">Select…</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
        <Select label="Section" value={sectionId} onChange={e => setSectionId(e.target.value)}>
          <option value="">Select…</option>{fSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </Select>
        <Select label="Semester" value={sem} onChange={e => setSem(e.target.value)}>
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
        </Select>
        <Input label="Batch" value={batch} onChange={e => setBatch(e.target.value)} placeholder="2025" />
      </div>
      <Button icon={Plus} onClick={create} className="mt-3">Pre-Create Student</Button>
    </CardBody></Card>

    <div className="flex items-center gap-3 mb-1">
      <Select label="Filter by Department" value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-48">
        <option value="">All</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
      </Select>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {fStudents.map((s, idx) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
          <Card><CardBody className="py-3 space-y-2">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-bold text-gray-900">{s.name}</p><p className="text-xs text-gray-500 font-mono">{s.student_id}</p><p className="text-xs text-gray-400">{s.section_name} • Sem {s.semester}</p></div>
              <Badge status={s.status === 'active' ? 'active' : 'pending'}>{s.status}</Badge>
            </div>
            {resetId === s.id ? (
              <div className="flex gap-2">
                <Input value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password (min 8)" type="password" />
                <Button size="sm" icon={Check} onClick={() => resetPwd(s.id)} />
                <Button size="sm" variant="secondary" icon={X} onClick={() => setResetId('')} />
              </div>
            ) : (
              <button onClick={() => setResetId(s.id)} className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-invertis-blue cursor-pointer"><Key size={13} /> Reset Password</button>
            )}
          </CardBody></Card>
        </motion.div>
      ))}
    </div>
  </div>);
}

export default function CoordinatorPanel() {
  const [tab, setTab] = useState('departments');
  const [msg, setMsg] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);

  const loadAll = async () => { try { const [rD,rS,rC,rF,rSt] = await Promise.all([api.get('/coordinator/departments'),api.get('/coordinator/sections'),api.get('/coordinator/courses'),api.get('/coordinator/faculty'),api.get('/coordinator/students')]); setDepartments(rD.data); setSections(rS.data); setCourses(rC.data); setFaculty(rF.data); setStudents(rSt.data); } catch {} };
  useEffect(() => { loadAll(); }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t); } }, [msg]);
  const setMsgHelper = ({ type, text }) => setMsg({ type, text });

  return (
    <div className="animate-fade-in max-w-6xl relative">
      <div className="absolute -inset-6 overflow-hidden pointer-events-none select-none">
        <img src="/campus/academic-block-2.jpg" alt="" className="w-full h-full object-cover opacity-15" />
      </div>
      <div className="relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Users size={20} className="text-purple-500" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Coordinator Panel</h1><p className="text-sm text-gray-500">Manage departments, sections, faculty and students</p></div>
      </div>

      {msg && <Alert type={msg.type} onClose={() => setMsg(null)} className="mb-4">{msg.text}</Alert>}

      <Tabs tabs={TABS_LIST} activeTab={tab} onTabChange={setTab} className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          {tab === 'departments' && <DepartmentsTab departments={departments} onRefresh={loadAll} setMsg={setMsgHelper} />}
          {tab === 'sections' && <SectionsTab departments={departments} sections={sections} onRefresh={loadAll} setMsg={setMsgHelper} />}
          {tab === 'courses' && <CoursesTab departments={departments} courses={courses} onRefresh={loadAll} setMsg={setMsgHelper} />}
          {tab === 'faculty' && <FacultyTab departments={departments} faculty={faculty} onRefresh={loadAll} setMsg={setMsgHelper} />}
          {tab === 'assignments' && <AssignmentsTab departments={departments} sections={sections} faculty={faculty} courses={courses} onRefresh={loadAll} setMsg={setMsgHelper} />}
          {tab === 'students' && <StudentsTab departments={departments} sections={sections} students={students} onRefresh={loadAll} setMsg={setMsgHelper} />}
        </motion.div>
      </AnimatePresence>
      </div>{/* close z-10 */}
    </div>
  );
}
