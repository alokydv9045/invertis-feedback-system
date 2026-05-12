import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, ClipboardList, X } from 'lucide-react';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const DEFAULT_QUESTIONS = [
  'The instructor explains course material clearly and effectively.',
  'The instructor is responsive to questions during and outside of class.',
  'The assignments and projects contribute significantly to learning.',
  'The course stimulated my interest in the subject matter.',
  'Overall, I would rate this instructor\'s effectiveness as high.'
];

const inputCls = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all";

export default function AdminPanel() {
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [courseId, setCourseId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [title, setTitle] = useState('');
  const [semester, setSemester] = useState('1');
  const [section, setSection] = useState('A');
  const [closingTime, setClosingTime] = useState('');
  const [questions, setQuestions] = useState([...DEFAULT_QUESTIONS]);

  const loadData = async () => {
    try { setLoading(true);
      const [rC, rF, rD] = await Promise.all([api.get('/tlfq/courses'), api.get('/tlfq/faculty'), api.get('/tlfq/departments')]);
      setCourses(rC.data); setFaculty(rF.data); setDepartments(rD.data);
    } catch { setError('Failed to load data.'); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const handleCreateTlfq = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (!courseId || !facultyId || !title || !closingTime) { setError('Please fill all required fields.'); return; }
    const filteredQs = questions.filter(q => q.trim());
    if (filteredQs.length === 0) { setError('At least 1 question is required.'); return; }
    try {
      await api.post('/tlfq', { course_id: courseId, faculty_id: facultyId, title, semester: parseInt(semester), section, closing_time: closingTime, question_texts: filteredQs });
      setTitle(''); setCourseId(''); setFacultyId(''); setSemester('1'); setSection('A'); setClosingTime(''); setQuestions([...DEFAULT_QUESTIONS]);
      setSuccess('TLFQ evaluation created successfully!');
    } catch (err) { setError(err.response?.data?.message || 'Failed to create evaluation.'); }
  };

  const coursesByDept = (departments || []).reduce((acc, d) => { acc[d.id] = { name: d.name, courses: (courses || []).filter(c => c.department_id?.toString() === d.id?.toString()) }; return acc; }, {});

  return (
    <div className="animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center"><ClipboardList size={20} className="text-invertis-blue" /></div>
        <div><h1 className="text-2xl font-bold text-gray-900">Create Evaluation</h1><p className="text-sm text-gray-500">Design and deploy academic feedback forms.</p></div>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold rounded-lg flex items-center justify-between">{success}<button onClick={() => setSuccess('')} className="cursor-pointer"><X size={14} /></button></motion.div>}
      {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-semibold rounded-lg flex items-center justify-between">{error}<button onClick={() => setError('')} className="cursor-pointer"><X size={14} /></button></motion.div>}

      {loading ? (
        <div className="flex items-center justify-center py-20"><div className="h-10 w-10 border-4 border-invertis-blue border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <form onSubmit={handleCreateTlfq} className="space-y-5">
          <Card><CardBody>
            <h2 className="text-sm font-bold text-gray-900 mb-4">Form Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Course</label>
                <select value={courseId} onChange={e => setCourseId(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value="">Select course…</option>
                  {Object.values(coursesByDept).map(({ name, courses: dC }) => dC.length > 0 && (<optgroup key={name} label={name}>{dC.map(c => <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>)}</optgroup>))}
                </select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Faculty</label>
                <select value={facultyId} onChange={e => setFacultyId(e.target.value)} className={`${inputCls} cursor-pointer`}>
                  <option value="">Select faculty…</option>{(faculty || []).map(f => <option key={f.id} value={f.id}>{f.name} — {f.department_name}</option>)}
                </select></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Evaluation Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="E.g. CS401 Feedback" className={inputCls} /></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Semester</label>
                <select value={semester} onChange={e => setSemester(e.target.value)} className={`${inputCls} cursor-pointer`}>{[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}</select></div>
              <div><label className="block text-sm font-semibold text-gray-700 mb-1">Section</label>
                <select value={section} onChange={e => setSection(e.target.value)} className={`${inputCls} cursor-pointer`}>{['A','B','C','D'].map(s => <option key={s} value={s}>Section {s}</option>)}</select></div>
              <div className="md:col-span-2"><label className="block text-sm font-semibold text-gray-700 mb-1">Closing Time</label>
                <input type="datetime-local" value={closingTime} onChange={e => setClosingTime(e.target.value)} className={inputCls} /></div>
            </div>
          </CardBody></Card>

          <Card><CardBody>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-gray-900">Questions</h2>
              <button type="button" onClick={() => setQuestions([...questions, ''])} className="flex items-center gap-1 text-xs font-semibold text-invertis-blue hover:text-blue-700 cursor-pointer"><Plus size={14} /> Add Question</button>
            </div>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-7 text-center flex-shrink-0">Q{idx + 1}</span>
                  <input type="text" value={q} onChange={e => { const u = [...questions]; u[idx] = e.target.value; setQuestions(u); }} placeholder="Enter question…" className={`flex-1 ${inputCls}`} />
                  {questions.length > 1 && <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"><Trash2 size={16} /></button>}
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4">Uses Likert scale (1-7). Questions should be objective.</p>
          </CardBody></Card>

          <div className="flex gap-3">
            <Button type="submit" icon={Check} className="flex-1">Publish Evaluation</Button>
            <Button type="button" variant="secondary" onClick={() => { setQuestions([...DEFAULT_QUESTIONS]); setTitle(''); }}>Reset</Button>
          </div>
        </form>
      )}
    </div>
  );
}
