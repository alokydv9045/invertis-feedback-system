import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Check, Trash2, ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';

const DEFAULT_QUESTIONS = [
  'The instructor explains course material clearly and effectively.',
  'The instructor is responsive to questions during and outside of class.',
  'The assignments and projects contribute significantly to learning.',
  'The course stimulated my interest in the subject matter.',
  'Overall, I would rate this instructor\'s effectiveness as high.'
];

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
  const [questions, setQuestions] = useState([...DEFAULT_QUESTIONS]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rC, rF, rD] = await Promise.all([
        api.get('/tlfq/courses'),
        api.get('/tlfq/faculty'),
        api.get('/tlfq/departments')
      ]);
      setCourses(rC.data);
      setFaculty(rF.data);
      setDepartments(rD.data);
    } catch (err) {
      setError('Failed to load data. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateTlfq = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!courseId || !facultyId || !title) { setError('Please fill in all required fields.'); return; }
    const filteredQs = questions.filter(q => q.trim());
    if (filteredQs.length === 0) { setError('Add at least 1 question.'); return; }
    try {
      await api.post('/tlfq', { course_id: courseId, faculty_id: facultyId, title, question_texts: filteredQs });
      setTitle(''); setCourseId(''); setFacultyId(''); setQuestions([...DEFAULT_QUESTIONS]);
      setSuccess('TLFQ evaluation created and published successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create TLFQ.');
    }
  };

  // Group courses by department
  const coursesByDept = (departments || []).reduce((acc, d) => {
    acc[d.id] = { name: d.name, courses: (courses || []).filter(c => c.department_id?.toString() === d.id?.toString()) };
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col font-sans">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="p-8">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-8 max-w-5xl mx-auto">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <ClipboardList size={24} className="text-[#f15a24]" />
                  </div>
                  <h1 className="text-2xl font-black text-[#1a2233]">Faculty Evaluation Setup</h1>
                </div>
                <p className="text-sm text-gray-500 font-medium ml-12">Design and publish a questionnaire mapped to a specific course and faculty record.</p>
              </div>

              {success && (
                <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm">
                  <Check size={18} /> {success}
                </div>
              )}
              {error && (
                <div className="p-4 bg-rose-50 text-rose-700 border border-rose-100 rounded-xl text-sm font-bold shadow-sm">{error}</div>
              )}

              {loading ? (
                <div className="bg-white border border-[#e2e8f0] rounded-2xl p-20 flex flex-col items-center justify-center gap-4 shadow-sm">
                  <div className="h-12 w-12 border-4 border-[#f15a24] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Records...</p>
                </div>
              ) : (
                <form onSubmit={handleCreateTlfq} className="flex flex-col gap-6 bg-white border border-[#e2e8f0] rounded-2xl p-10 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#1a2233] via-[#f15a24] to-[#1a2233]"></div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Select Course</label>
                      <select
                        value={courseId} onChange={e => setCourseId(e.target.value)}
                        className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1a2233] font-bold focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all cursor-pointer shadow-sm"
                      >
                        <option value="">Choose Course…</option>
                        {Object.values(coursesByDept).map(({ name, courses: dCourses }) => (
                          <optgroup key={name} label={`── ${name}`}>
                            {dCourses.map(c => (
                              <option key={c.id} value={c.id}>[{c.code}] {c.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Assigned Faculty</label>
                      <select
                        value={facultyId} onChange={e => setFacultyId(e.target.value)}
                        className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1a2233] font-bold focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all cursor-pointer shadow-sm"
                      >
                        <option value="">Choose Faculty…</option>
                        {(faculty || []).map(f => (
                          <option key={f.id} value={f.id}>{f.name} — {f.department_name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Evaluation Title / Semester</label>
                    <input
                      type="text" value={title} onChange={e => setTitle(e.target.value)}
                      placeholder="E.g. Spring 2025 – Advanced Algorithms (CS401)"
                      className="bg-gray-50 border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1a2233] font-bold placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all shadow-sm"
                    />
                  </div>

                  {/* Questions */}
                  <div className="flex flex-col gap-4 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Evaluation Questions</label>
                      <button
                        type="button"
                        onClick={() => setQuestions([...questions, ''])}
                        className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-[#f15a24] hover:bg-orange-50 px-4 py-2 rounded-xl transition cursor-pointer border border-transparent hover:border-orange-100"
                      >
                        <Plus size={14} /> Add Question
                      </button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {questions.map((qText, idx) => (
                        <div key={idx} className="flex gap-3 items-center group">
                          <span className="h-10 w-10 flex items-center justify-center bg-orange-50 border border-orange-100 font-black rounded-xl text-xs text-[#f15a24] flex-shrink-0 shadow-sm">
                            {idx + 1}
                          </span>
                          <input
                            type="text" value={qText}
                            onChange={e => { const u = [...questions]; u[idx] = e.target.value; setQuestions(u); }}
                            placeholder="Type question text…"
                            className="flex-1 bg-white border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1a2233] font-medium placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#f15a24]/20 focus:border-[#f15a24] transition-all"
                          />
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQuestions(questions.filter((_, i) => i !== idx))}
                              className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100">
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#1a2233] to-[#242f45] hover:from-[#f15a24] hover:to-[#d94e1d] text-white font-black py-4 px-10 rounded-xl text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-900/20 active:scale-95 w-full md:w-auto"
                    >
                      <Check size={18} /> Publish Evaluation
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
