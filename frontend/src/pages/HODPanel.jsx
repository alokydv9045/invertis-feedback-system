import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { LayoutDashboard, Plus, ToggleLeft, ToggleRight, Clock, FileText, BarChart2, Check, X, Users, BookOpen, GraduationCap, Link2, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

const STD_QUESTIONS = [
  'The instructor explains course material clearly and effectively.',
  'The instructor is responsive to questions during and outside of class.',
  'The assignments and projects contribute significantly to my learning.',
  'The course content is relevant and up-to-date.',
  'The instructor is well-prepared for every lecture.',
  'Overall, I would rate this instructor\'s effectiveness as high.',
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sections', label: 'Sections', icon: Link2 },
  { id: 'create', label: 'Create Form', icon: Plus },
  { id: 'forms', label: 'My Forms', icon: FileText },
];

export default function HODPanel() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [sections, setSections] = useState([]);
  const [forms, setForms] = useState([]);
  const [portal, setPortal] = useState(null);

  // Form creation state
  const [sectionId, setSectionId] = useState('');
  const [sfList, setSfList] = useState([]);
  const [selectedSf, setSelectedSf] = useState('');
  const [title, setTitle] = useState('');
  const [closingTime, setClosingTime] = useState('');
  const [questions, setQuestions] = useState([...STD_QUESTIONS]);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    try {
      const [rStats, rSections, rForms, rPortal] = await Promise.all([
        api.get('/hod/stats'),
        api.get('/hod/sections'),
        api.get('/hod/tlfq'),
        api.get('/hod/portal'),
      ]);
      setStats(rStats.data);
      setSections(rSections.data);
      setForms(rForms.data);
      setPortal(rPortal.data);
    } catch { }
  };

  useEffect(() => { loadData(); }, []);

  // Load section-faculty when section changes
  useEffect(() => {
    if (!sectionId) { setSfList([]); setSelectedSf(''); return; }
    api.get(`/hod/section-faculty?section_id=${sectionId}`)
      .then(r => setSfList(r.data))
      .catch(() => setSfList([]));
  }, [sectionId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sectionId || !selectedSf || !title || !closingTime) { toast.error('All fields are required.'); return; }
    const sf = sfList.find(s => s.id === selectedSf);
    if (!sf) return;
    setCreating(true);
    try {
      await api.post('/hod/tlfq', {
        section_id: sectionId,
        course_id: sf.course_id,
        faculty_id: sf.faculty_id,
        title, closing_time: closingTime,
        question_texts: questions.filter(q => q.trim())
      });
      setSectionId(''); setSelectedSf(''); setTitle(''); setClosingTime(''); setQuestions([...STD_QUESTIONS]);
      toast.success('Form created successfully!');
      setTab('forms');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create form.');
    } finally { setCreating(false); }
  };

  const toggleForm = async (id, current) => {
    try {
      await api.put(`/hod/tlfq/${id}/toggle`, { is_active: !current });
      toast.success(`Form ${!current ? 'opened' : 'closed'}.`);
      loadData();
    } catch { toast.error('Failed to toggle form status.'); }
  };

  const togglePortal = async () => {
    try {
      const res = await api.put('/hod/portal', { open: !portal.portal_open });
      setPortal(prev => ({ ...prev, portal_open: res.data.portal_open }));
      toast.success(res.data.message);
    } catch { toast.error('Failed to update portal status.'); }
  };

  // Section delete with confirmation
  const [deletePreview, setDeletePreview] = useState(null);
  const [deletingSection, setDeletingSection] = useState(false);

  const previewDelete = async (id) => {
    try {
      const res = await api.get(`/hod/sections/${id}/delete-preview`);
      setDeletePreview({ id, ...res.data });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load preview.');
    }
  };

  const confirmDelete = async () => {
    if (!deletePreview) return;
    setDeletingSection(true);
    try {
      await api.delete(`/hod/sections/${deletePreview.id}`);
      toast.success('Section deleted successfully.');
      setDeletePreview(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete section.');
    } finally { setDeletingSection(false); }
  };

  const statusColor = s => s === 'open' ? 'text-emerald-400 bg-emerald-900/30 border-emerald-800/40' : s === 'expired' ? 'text-slate-500 dark:text-slate-400 bg-slate-800/40 border-slate-700/40' : 'text-amber-400 bg-amber-900/30 border-amber-800/40';

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-5xl overflow-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="user-type-badge bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-900/30">
              <LayoutDashboard size={20} className="text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#1D3557]">HOD Panel</h1>
              <p className="text-xs sm:text-sm text-slate-600">Manage evaluation forms and departmental portal</p>
            </div>
          </div>


          {/* Tabs */}
          <div className="flex gap-1.5 p-1.5 card-main rounded-2xl mb-6 w-full sm:w-fit overflow-x-auto no-scrollbar flex-nowrap">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${tab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'}`}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

              {/* DASHBOARD TAB */}
              {tab === 'dashboard' && (
                <div className="flex flex-col gap-6">
                  {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      {[
                        { label: 'Sections', val: stats.sections, icon: Link2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-100/50 dark:border-blue-900/30' },
                        { label: 'Faculty', val: stats.faculty, icon: Users, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20 border-violet-100/50 dark:border-violet-900/30' },
                        { label: 'Courses', val: stats.courses, icon: BookOpen, color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-950/20 border-sky-100/50 dark:border-sky-900/30' },
                        { label: 'Students', val: stats.students, icon: GraduationCap, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30' },
                        { label: 'My Forms', val: stats.myForms, icon: FileText, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-100/50 dark:border-amber-900/30' },
                        { label: 'Open Forms', val: stats.openForms, icon: Clock, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30' },
                      ].map(({ label, val, icon: Icon, color, bg }) => (
                        <div key={label} className="card-main rounded-2xl p-5 flex items-center gap-4 transition-all">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${bg} flex-shrink-0`}>
                            <Icon size={18} className={color} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-2xl font-black text-[#1D3557] truncate">{val ?? '—'}</div>
                            <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider truncate mt-0.5">{label}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Portal control */}
                  {portal && (
                    <div className="card-main rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-[#1D3557]">Department Portal</h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1">
                          When closed, students cannot see or submit any feedback forms.
                        </p>
                      </div>
                      <button onClick={togglePortal}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer w-full sm:w-auto flex-shrink-0 ${portal.portal_open ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-700 hover:bg-slate-600 text-[var(--text-main)] shadow-lg shadow-slate-700/20'}`}>
                        {portal.portal_open ? <><ToggleRight size={20} /> Portal Open</> : <><ToggleLeft size={20} /> Portal Closed</>}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SECTIONS TAB */}
              {tab === 'sections' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Link2 size={18} className="text-blue-500" />
                    <h2 className="text-base font-bold text-[#1D3557]">Department Sections</h2>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-bold">{sections.length} total</span>
                  </div>
                  {sections.length === 0 ? (
                    <div className="card-main rounded-2xl p-12 text-center text-slate-500 text-sm">
                      No sections found in your department.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sections.map(s => (
                        <div key={s.id} className="card-main rounded-2xl p-5 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-[#1D3557]">{s.name || `Sem ${s.semester} — ${s.label}`}</div>
                            <div className="text-xs text-slate-500 mt-0.5">Semester {s.semester} • Section {s.label}</div>
                          </div>
                          <button onClick={() => previewDelete(s.id)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 border border-red-200 transition-all cursor-pointer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Delete confirmation modal */}
                  {deletePreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                      onClick={e => e.target === e.currentTarget && setDeletePreview(null)}>
                      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="bg-red-600 px-5 py-3.5 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={16} className="text-white" />
                            <span className="text-white font-bold text-sm">Confirm Deletion</span>
                          </div>
                          <button onClick={() => setDeletePreview(null)} className="text-white/60 hover:text-white cursor-pointer"><X size={15} /></button>
                        </div>
                        <div className="p-5">
                          <p className="text-sm text-slate-700 mb-4">
                            Are you sure you want to delete <strong>{deletePreview.section_name}</strong>?
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {[['TLFQs', deletePreview.affected.tlfqs], ['Enrollments', deletePreview.affected.enrollments],
                              ['Students', deletePreview.affected.students], ['Assignments', deletePreview.affected.assignments]
                            ].map(([label, count]) => (
                              <div key={label} className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                                <div className="text-lg font-black text-red-600">{count}</div>
                                <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider">{label}</div>
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mb-4">This action is irreversible. All related data will be removed or deactivated.</p>
                          <div className="flex gap-2">
                            <button onClick={() => setDeletePreview(null)}
                              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                            <button onClick={confirmDelete} disabled={deletingSection}
                              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                              {deletingSection ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* CREATE FORM TAB */}
              {tab === 'create' && (
                <form onSubmit={handleCreate} className="flex flex-col gap-5 card-main rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Section</label>
                      <select value={sectionId} onChange={e => setSectionId(e.target.value)}
                        className="input-base rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                        <option value="">Select Section…</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Faculty & Course</label>
                      <select value={selectedSf} onChange={e => setSelectedSf(e.target.value)} disabled={!sectionId}
                        className="input-base rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
                        <option value="">Select Faculty & Course…</option>
                        {sfList.map(sf => <option key={sf.id} value={sf.id}>{sf.faculty_name} — [{sf.course_code}] {sf.course_name}</option>)}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Form Title</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. Spring 2025 — DSA Feedback"
                        className="input-base rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Closing Time</label>
                      <input type="datetime-local" value={closingTime} onChange={e => setClosingTime(e.target.value)}
                        className="input-base rounded-xl px-4 py-2.5 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="border-t border-slate-800 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">Questions</label>
                      <button type="button" onClick={() => setQuestions([...questions, ''])}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer flex items-center gap-1">
                        <Plus size={13} /> Add Question
                      </button>
                    </div>
                    {questions.map((q, i) => (
                      <div key={i} className="flex gap-2 items-center mb-2">
                        <span className="h-7 w-7 text-xs font-black text-blue-300 bg-blue-900/30 border border-blue-800/40 rounded-lg flex items-center justify-center flex-shrink-0">Q{i + 1}</span>
                        <input type="text" value={q} onChange={e => { const u = [...questions]; u[i] = e.target.value; setQuestions(u); }}
                          className="flex-1 input-base rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        {questions.length > 1 && (
                          <button type="button" onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                            className="text-slate-600 hover:text-accent-400 transition-colors cursor-pointer"><X size={16} /></button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="submit" disabled={creating}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-75 w-fit">
                    {creating ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Create Form (Closed by default)</>}
                  </button>
                </form>
              )}

              {/* MY FORMS TAB */}
              {tab === 'forms' && (
                <div className="flex flex-col gap-4">
                  {forms.length === 0 ? (
                    <div className="card-main rounded-2xl p-12 text-center text-slate-600 text-sm">
                      No forms created yet. Use "Create Form" to get started.
                    </div>
                  ) : forms.map(f => (
                    <div key={f.id} className="card-main rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${statusColor(f.status)}`}>{f.status}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{f.responses} responses</span>
                        </div>
                        <div className="text-sm font-bold text-[#1D3557]">{f.title}</div>
                        <div className="text-xs text-slate-600 mt-1">{f.section_name} • {f.faculty_name} • {f.course_code}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> Closes: {new Date(f.closing_time).toLocaleString()}
                        </div>
                      </div>
                      {!f.expired && (
                        <button onClick={() => toggleForm(f.id, f.is_active)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer flex-shrink-0 ${f.is_active ? 'bg-accent-600/20 text-accent-400 hover:bg-accent-600/40 border border-accent-800/50' : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 border border-emerald-800/50'}`}>
                          {f.is_active ? <><ToggleRight size={16} /> Close Form</> : <><ToggleLeft size={16} /> Open Form</>}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
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
