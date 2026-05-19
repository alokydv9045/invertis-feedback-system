import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Plus, Trash2, Check, X, Users, BookOpen, GraduationCap, Link2, Building2, ChevronDown, Key, Upload, FileText, Info } from 'lucide-react';

const TABS = [
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'sections', label: 'Sections', icon: Link2 },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'faculty', label: 'Faculty', icon: Users },
  { id: 'assignments', label: 'Assignments', icon: Link2 },
  { id: 'students', label: 'Students', icon: GraduationCap },
];


function Card({ children, className = '' }) {
  return <div className={`card-main ${className}`}>{children}</div>;
}

function Label({ children }) {
  return <label className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-widest">{children}</label>;
}

function Input({ ...props }) {
  return <input {...props} className={`input-base ${props.className || ''}`} />;
}

function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} className={`select-base ${props.className || ''}`}>
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant = 'primary', ...props }) {
  const cls = variant === 'primary'
    ? 'btn-primary'
    : variant === 'danger'
      ? 'bg-accent-600/20 hover:bg-accent-600 hover:text-white text-accent-400 border border-accent-500/30 px-5 py-2.5 rounded-xl text-sm font-bold transition-all'
      : 'bg-slate-500/10 hover:bg-slate-500/20 text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] border border-[var(--border-base)] px-5 py-2.5 rounded-xl text-sm font-bold transition-all';

  return (
    <button {...props} className={`flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 active:scale-95 ${cls} ${props.className || ''}`}>
      {children}
    </button>
  );
}

// ── Departments Tab ──────────────────────────────────────────────────────────
function DepartmentsTab({ departments, onRefresh }) {
  const [name, setName] = useState(''); const [code, setCode] = useState('');
  const [maxSemester, setMaxSemester] = useState(8);
  const create = async () => {
    try { await api.post('/coordinator/departments', { name, code, max_semester: maxSemester }); setName(''); setCode(''); setMaxSemester(8); onRefresh(); toast.success('Department created successfully.'); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to create department.'); }
  };
  const del = async (id) => {
    try { await api.delete(`/coordinator/departments/${id}`); onRefresh(); toast.success('Department deleted.'); }
    catch (e) { toast.error('Failed to delete department.'); }
  };
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Add Department</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="B.Tech Computer Science" /></div>
          <div className="flex flex-col gap-1"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="BCS" /></div>
          <div className="flex flex-col gap-1">
            <Label>Duration (Semesters)</Label>
            <Select value={maxSemester} onChange={e => setMaxSemester(Number(e.target.value))}>
              <option value={2}>2 Semesters</option>
              <option value={4}>4 Semesters</option>
              <option value={6}>6 Semesters</option>
              <option value={8}>8 Semesters</option>
              <option value={10}>10 Semesters</option>
            </Select>
          </div>
          <div className="flex items-end"><Btn onClick={create}><Plus size={16} /> Create</Btn></div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {departments.map(d => (
          <Card key={d.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">{d.name}</div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{d.code}</div>
                <div className="text-[10px] bg-slate-500/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded font-bold">{d.max_semester || 8} Sems</div>
              </div>
            </div>
            <Btn variant="danger" onClick={() => del(d.id)}><Trash2 size={14} /></Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Sections Tab ──────────────────────────────────────────────────────────────
function SectionsTab({ departments, sections, onRefresh }) {
  const [deptId, setDeptId] = useState(''); const [sem, setSem] = useState('3'); const [label, setLabel] = useState('A');
  const create = async () => {
    try { await api.post('/coordinator/sections', { department_id: deptId, semester: sem, label }); onRefresh(); toast.success('Section created.'); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to create section.'); }
  };
  const del = async (id) => {
    try { await api.delete(`/coordinator/sections/${id}`); onRefresh(); toast.success('Section deleted.'); }
    catch (e) { toast.error('Failed to delete section.'); }
  };
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Create Section</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1"><Label>Department</Label>
            <Select value={deptId} onChange={e => setDeptId(e.target.value)}>
              <option value="">Select…</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Semester</Label>
            <Select value={sem} onChange={e => setSem(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Section</Label>
            <Select value={label} onChange={e => setLabel(e.target.value)}>
              {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(l => <option key={l} value={l}>{l}</option>)}
            </Select>
          </div>
          <div className="flex items-end"><Btn onClick={create}><Plus size={16} /> Create</Btn></div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map(s => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">{s.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.department_name} • Semester {s.semester}</div>
            </div>
            <Btn variant="danger" onClick={() => del(s.id)}><Trash2 size={14} /></Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Courses Tab ──────────────────────────────────────────────────────────────
function CoursesTab({ departments, courses, onRefresh }) {
  const [name, setName] = useState(''); const [code, setCode] = useState(''); const [deptId, setDeptId] = useState('');
  const create = async () => {
    try { await api.post('/coordinator/courses', { name, code, department_id: deptId }); setName(''); setCode(''); onRefresh(); toast.success('Course created.'); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to create course.'); }
  };
  const del = async (id) => {
    try { await api.delete(`/coordinator/courses/${id}`); onRefresh(); toast.success('Course deleted.'); }
    catch (e) { toast.error('Failed to delete course.'); }
  };
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Add Course</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1 col-span-2 md:col-span-1"><Label>Course Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Data Structures" /></div>
          <div className="flex flex-col gap-1"><Label>Code</Label><Input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="BCS201" /></div>
          <div className="flex flex-col gap-1"><Label>Department</Label>
            <Select value={deptId} onChange={e => setDeptId(e.target.value)}>
              <option value="">Select…</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="flex items-end"><Btn onClick={create}><Plus size={16} /> Add</Btn></div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {courses.map(c => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">{c.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{c.code} • {c.department_name}</div>
            </div>
            <Btn variant="danger" onClick={() => del(c.id)}><Trash2 size={14} /></Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Faculty Tab ───────────────────────────────────────────────────────────────
function FacultyTab({ departments, faculty, onRefresh }) {
  const [name, setName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [teacherType, setTeacherType] = useState('college_faculty');

  const create = async () => {
    try {
      await api.post('/coordinator/faculty', { name, department_id: deptId, teacher_type: teacherType });
      setName('');
      onRefresh();
      toast.success('Faculty added successfully.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to add faculty.'); }
  };
  const del = async (id) => {
    try { await api.delete(`/coordinator/faculty/${id}`); onRefresh(); toast.success('Faculty member removed.'); }
    catch (e) { toast.error('Failed to remove faculty member.'); }
  };
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Add Faculty Member</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex flex-col gap-1 md:col-span-2"><Label>Faculty Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Alan Turing" /></div>
          <div className="flex flex-col gap-1"><Label>Department</Label>
            <Select value={deptId} onChange={e => setDeptId(e.target.value)}>
              <option value="">Select…</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Type</Label>
            <Select value={teacherType} onChange={e => setTeacherType(e.target.value)}>
              <option value="college_faculty">College Faculty</option>
              <option value="trainer">Trainer</option>
            </Select>
          </div>
        </div>
        <div className="mt-3"><Btn onClick={create}><Plus size={16} /> Add Faculty</Btn></div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {faculty.map(f => (
          <Card key={f.id} className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-[var(--text-main)]">{f.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.department_name}</div>
              <span className={`inline-flex mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${f.teacher_type === 'trainer'
                  ? 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25'
                  : 'text-violet-300 bg-violet-500/10 border-violet-500/25'
                }`}>
                {f.teacher_type === 'trainer' ? 'Trainer' : 'College Faculty'}
              </span>
            </div>
            <Btn variant="danger" onClick={() => del(f.id)}><Trash2 size={14} /></Btn>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Assignments Tab ──────────────────────────────────────────────────────────
function AssignmentsTab({ departments, sections, faculty, courses, onRefresh }) {
  const [sectionId, setSectionId] = useState(''); const [facultyId, setFacultyId] = useState(''); const [courseId, setCourseId] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const filteredSections = deptFilter ? sections.filter(s => s.department_id === deptFilter) : sections;
  const filteredFaculty = deptFilter ? faculty.filter(f => f.department_id === deptFilter) : faculty;
  const filteredCourses = deptFilter ? courses.filter(c => c.department_id === deptFilter) : courses;

  const assign = async () => {
    if (!sectionId || !facultyId || !courseId) { toast.error('All fields required.'); return; }
    try { await api.post('/coordinator/assignments', { section_id: sectionId, faculty_id: facultyId, course_id: courseId }); onRefresh(); toast.success('Faculty assigned successfully.'); }
    catch (e) { toast.error(e.response?.data?.message || 'Failed to assign faculty.'); }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Assign Faculty to Section</h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1"><Label>Filter by Department</Label>
            <Select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1"><Label>Section</Label>
              <Select value={sectionId} onChange={e => setSectionId(e.target.value)}>
                <option value="">Select Section…</option>
                {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1"><Label>Faculty</Label>
              <Select value={facultyId} onChange={e => setFacultyId(e.target.value)}>
                <option value="">Select Faculty…</option>
                {filteredFaculty.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </Select>
            </div>
            <div className="flex flex-col gap-1"><Label>Course</Label>
              <Select value={courseId} onChange={e => setCourseId(e.target.value)}>
                <option value="">Select Course…</option>
                {filteredCourses.map(c => <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}
              </Select>
            </div>
          </div>
          <div><Btn onClick={assign}><Link2 size={16} /> Assign</Btn></div>
        </div>
      </Card>
      <Card>
        <p className="text-xs text-slate-600 dark:text-slate-400">Assignments are shown per section. Manage existing assignments by deleting a section or recreating assignments.</p>
      </Card>
    </div>
  );
}

// ── Students Tab ──────────────────────────────────────────────────────────────
function StudentsTab({ departments, sections, students, onRefresh }) {
  const [name, setName] = useState(''); const [stdId, setStdId] = useState('');
  const [deptId, setDeptId] = useState(''); const [sectionId, setSectionId] = useState('');
  const [sem, setSem] = useState('3'); const [batch, setBatch] = useState('2025');
  const [resetId, setResetId] = useState(''); const [newPwd, setNewPwd] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);

  const filteredSections = deptId ? sections.filter(s => s.department_id === deptId) : [];
  const filteredStudents = filterDept ? students.filter(s => {
    const sec = sections.find(sec => sec.id === s.section_id);
    return sec?.department_id === filterDept;
  }) : students;

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
      if (lines.length < 2) { toast.error('CSV is empty or missing data.'); return; }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      // Expected headers: name, student_id, department_id, section_id, semester, batch
      const studentData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const obj = {};
        headers.forEach((header, i) => {
          obj[header] = values[i];
        });
        return obj;
      });

      setBulkLoading(true);
      try {
        const res = await api.post('/coordinator/students/bulk', { students: studentData });
        setImportResults(res.data.results);
        toast.success(res.data.message);
        onRefresh();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Bulk import failed.');
      } finally {
        setBulkLoading(false);
        e.target.value = ''; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  const create = async () => {
    try {
      await api.post('/coordinator/students', { name, student_id: stdId, department_id: deptId, section_id: sectionId, semester: sem, batch });
      setName(''); setStdId(''); setSectionId('');
      onRefresh(); toast.success(`Student ${stdId} pre-created successfully.`);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to create student.'); }
  };

  const resetPwd = async (id) => {
    if (!newPwd) { toast.error('Enter new password.'); return; }
    try {
      await api.put(`/coordinator/students/${id}/reset-password`, { new_password: newPwd });
      setResetId(''); setNewPwd('');
      toast.success('Password reset successfully.');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to reset password.'); }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-3">Pre-Create Student Account</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1"><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Rahul Sharma" /></div>
          <div className="flex flex-col gap-1"><Label>Student ID</Label><Input value={stdId} onChange={e => setStdId(e.target.value.toUpperCase())} placeholder="BCS2025_55" className="font-mono" /></div>
          <div className="flex flex-col gap-1"><Label>Department</Label>
            <Select value={deptId} onChange={e => { setDeptId(e.target.value); setSectionId(''); }}>
              <option value="">Select…</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Section</Label>
            <Select value={sectionId} onChange={e => setSectionId(e.target.value)}>
              <option value="">Select…</option>
              {filteredSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Semester</Label>
            <Select value={sem} onChange={e => setSem(e.target.value)}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
            </Select>
          </div>
          <div className="flex flex-col gap-1"><Label>Batch Year</Label><Input value={batch} onChange={e => setBatch(e.target.value)} placeholder="2025" /></div>
        </div>
        <div className="mt-3"><Btn onClick={create}><Plus size={16} /> Pre-Create Student</Btn></div>
      </Card>

      {/* Bulk Import Card */}
      <Card className="border border-primary-500/20 bg-primary-950/10">
        <div className="flex items-center gap-3 mb-4">
          <Upload size={18} className="text-primary-400" />
          <h3 className="text-sm font-bold text-[var(--text-main)]">Bulk Import via CSV</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
              Upload a <span className="text-primary-300 font-bold">CSV file</span> with the following headers:
              <br />
              <code className="bg-slate-900 px-2 py-1 rounded mt-2 inline-block text-primary-400 border border-primary-500/10 font-mono text-[9px]">
                name, student_id, department_id, section_id, semester, batch
              </code>
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-primary-500/20 active:scale-95">
                <FileText size={14} />
                {bulkLoading ? 'Processing...' : 'Select CSV File'}
                <input type="file" accept=".csv" onChange={handleBulkUpload} hidden disabled={bulkLoading} />
              </label>
            </div>
          </div>

          <div className="w-full md:w-64 bg-slate-950/50 rounded-2xl p-4 border border-white/5">
            <h4 className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-[0.2em] mb-3 flex items-center gap-2">
              <Info size={10} /> Data Hints
            </h4>
            <ul className="flex flex-col gap-2">
              <li className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <div className="h-1 w-1 rounded-full bg-primary-500 mt-1.5" />
                IDs are case-insensitive
              </li>
              <li className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                <div className="h-1 w-1 rounded-full bg-primary-500 mt-1.5" />
                Dupes will be skipped
              </li>
            </ul>
          </div>
        </div>

        {importResults && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Import Results</div>
              <button onClick={() => setImportResults(null)} className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-white">Clear</button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <div className="text-[10px] font-black text-emerald-500 uppercase">Success</div>
                <div className="text-xl font-black text-white">{importResults.success}</div>
              </div>
              <div className="bg-accent-500/10 border border-accent-500/20 p-3 rounded-xl">
                <div className="text-[10px] font-black text-accent-500 uppercase">Failed</div>
                <div className="text-xl font-black text-white">{importResults.failed}</div>
              </div>
            </div>
            {importResults.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto bg-slate-950 rounded-xl p-3 border border-white/5 no-scrollbar">
                {importResults.errors.map((err, i) => (
                  <div key={i} className="text-[10px] text-accent-400 font-mono py-1 border-b border-white/5 last:border-0">{err}</div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </Card>

      {/* Student list */}
      <div className="flex items-center gap-3 mb-1">
        <Label>Filter by Department</Label>
        <Select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="w-48">
          <option value="">All</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </Select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredStudents.map(s => (
          <Card key={s.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-bold text-[var(--text-main)]">{s.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{s.student_id}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.section_name} • Sem {s.semester}</div>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${s.status === 'active' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'}`}>
                {s.status}
              </span>
            </div>
            {resetId === s.id ? (
              <div className="flex gap-2">
                <Input value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="New password (min 8)" type="password" />
                <Btn onClick={() => resetPwd(s.id)}><Check size={14} /></Btn>
                <Btn variant="secondary" onClick={() => setResetId('')}><X size={14} /></Btn>
              </div>
            ) : (
              <button onClick={() => setResetId(s.id)} className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary-400 transition-colors cursor-pointer">
                <Key size={13} /> Reset Password
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Main CoordinatorPanel ────────────────────────────────────────────────────
export default function CoordinatorPanel() {
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);

  const loadAll = async () => {
    try {
      const [rD, rS, rC, rF, rSt] = await Promise.all([
        api.get('/coordinator/departments'),
        api.get('/coordinator/sections'),
        api.get('/coordinator/courses'),
        api.get('/coordinator/faculty'),
        api.get('/coordinator/students'),
      ]);
      setDepartments(rD.data);
      setSections(rS.data);
      setCourses(rC.data);
      setFaculty(rF.data);
      setStudents(rSt.data.students || []);
    } catch { }
  };

  useEffect(() => { loadAll(); }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <Navbar />
      <div className="admin-layout">
        <Sidebar />
        <main className="admin-content">
          <header className="mb-8">
            <h1 className="text-2xl font-black gradient-text mb-1">Coordinator Hub</h1>
            <p className="text-xs text-[var(--text-muted)] font-medium">Manage Invertis University feedback infrastructure</p>
          </header>

          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-2 border-b border-[var(--border-base)]">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${tab === t.id
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                      : 'text-slate-500 dark:text-slate-400 hover:text-primary-500 hover:bg-primary-500/5'
                    }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'departments' && <DepartmentsTab departments={departments} onRefresh={loadAll} />}
              {tab === 'sections' && <SectionsTab departments={departments} sections={sections} onRefresh={loadAll} />}
              {tab === 'courses' && <CoursesTab departments={departments} courses={courses} onRefresh={loadAll} />}
              {tab === 'faculty' && <FacultyTab departments={departments} faculty={faculty} onRefresh={loadAll} />}
              {tab === 'assignments' && <AssignmentsTab departments={departments} sections={sections} faculty={faculty} courses={courses} onRefresh={loadAll} />}
              {tab === 'students' && <StudentsTab departments={departments} sections={sections} students={students} onRefresh={loadAll} />}
            </motion.div>
          </AnimatePresence>
                  <footer className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 w-full">
            <p className="text-xs">© 2026 Invertis University, Invertis Village, Bareilly-Lucknow National Highway, NH-24, Bareilly-243123, Uttar Pradesh.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
