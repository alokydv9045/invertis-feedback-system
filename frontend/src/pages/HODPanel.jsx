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
  { id: 'sections', label: 'Sections',   icon: Link2 },
  { id: 'create',   label: 'Create Form',icon: Plus },
  { id: 'forms',    label: 'My Forms',   icon: FileText },
];

export default function HODPanel() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [sections, setSections] = useState([]);
  const [forms, setForms] = useState([]);
  const [portal, setPortal] = useState(null);

  const [sectionId, setSectionId]   = useState('');
  const [sfList, setSfList]         = useState([]);
  const [selectedSf, setSelectedSf] = useState('');
  const [title, setTitle]           = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [closingTimeVal, setClosingTimeVal] = useState('');
  const [questions, setQuestions]   = useState([...STD_QUESTIONS]);
  const [creating, setCreating]     = useState(false);

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

  useEffect(() => {
    if (!sectionId) { setSfList([]); setSelectedSf(''); return; }
    api.get(`/hod/section-faculty?section_id=${sectionId}`)
      .then(r => setSfList(r.data))
      .catch(() => setSfList([]));
  }, [sectionId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const closingTime = closingDate && closingTimeVal ? `${closingDate}T${closingTimeVal}` : '';
    if (!sectionId || !selectedSf || !title || !closingTime) { toast.error('All fields are required.'); return; }
    const sf = sfList.find(s => s.id === selectedSf);
    if (!sf) return;
    setCreating(true);
    try {
      await api.post('/hod/tlfq', {
        section_id: sectionId,
        course_id: sf.course_id,
        faculty_id: sf.faculty_id,
        title,
        closing_time: closingTime,
        question_texts: questions.filter(q => q.trim()),
      });
      setSectionId(''); setSelectedSf(''); setTitle('');
      setClosingDate(''); setClosingTimeVal('');
      setQuestions([...STD_QUESTIONS]);
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

  const [deletePreview, setDeletePreview]   = useState(null);
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

  const statusColor = s =>
    s === 'open'    ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
    s === 'expired' ? 'text-slate-400 bg-slate-100 border-slate-200' :
                     'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-main)] flex flex-col">
      <Navbar />
      <div className="flex flex-row flex-1 min-h-0">
        <Sidebar />

        <main className="flex-1 overflow-auto min-w-0 overflow-x-hidden">
          <div className="max-w-4xl mx-auto w-full px-3 sm:px-5 md:px-8 py-4 sm:py-6">

            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center bg-emerald-50 border border-emerald-200/60 shrink-0">
                <LayoutDashboard size={16} className="text-emerald-500" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-black text-[#1D3557] leading-tight">HOD Panel</h1>
                <p className="text-[10px] sm:text-xs text-slate-500 truncate">Manage evaluation forms and departmental portal</p>
              </div>
            </div>

            <div className="flex gap-1 p-1 bg-white/80 backdrop-blur border border-slate-200 rounded-xl mb-4 overflow-x-auto no-scrollbar flex-nowrap shadow-sm">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  title={label}
                  className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 text-[11px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex-shrink-0 flex-1 sm:flex-none
                    ${tab === id
                      ? 'bg-blue-600 text-white shadow shadow-blue-500/30'
                      : 'text-slate-500 hover:text-[#1D3557] hover:bg-slate-100'}`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            <p className="sm:hidden text-xs font-bold text-slate-500 mb-3 tracking-wide uppercase">
              {TABS.find(t => t.id === tab)?.label}
            </p>

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >

                {tab === 'dashboard' && (
                  <div className="flex flex-col gap-3 sm:gap-5">
                    {stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                        {[
                          { label: 'Sections',   val: stats.sections,  icon: Link2,          color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100' },
                          { label: 'Faculty',    val: stats.faculty,   icon: Users,          color: 'text-violet-600', bg: 'bg-violet-50 border-violet-100' },
                          { label: 'Courses',    val: stats.courses,   icon: BookOpen,       color: 'text-sky-600',    bg: 'bg-sky-50 border-sky-100' },
                          { label: 'Students',   val: stats.students,  icon: GraduationCap,  color: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-100' },
                          { label: 'My Forms',   val: stats.myForms,   icon: FileText,       color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
                          { label: 'Open Forms', val: stats.openForms, icon: Clock,          color: 'text-rose-600',   bg: 'bg-rose-50 border-rose-100' },
                        ].map(({ label, val, icon: Icon, color, bg }) => (
                          <div key={label} className="bg-white/85 border border-slate-100 rounded-xl p-3 flex items-center gap-2.5 shadow-sm">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center border ${bg} shrink-0`}>
                              <Icon size={14} className={color} />
                            </div>
                            <div className="min-w-0">
                              <div className="text-lg sm:text-xl font-black text-[#1D3557]">{val ?? '—'}</div>
                              <div className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate">{label}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {portal && (
                      <div className="bg-white/85 border border-slate-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                        <div>
                          <h3 className="text-sm font-bold text-[#1D3557]">Department Portal</h3>
                          <p className="text-xs text-slate-500 mt-0.5">When closed, students cannot submit feedback forms.</p>
                        </div>
                        <button onClick={togglePortal}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer w-full sm:w-auto shrink-0
                            ${portal.portal_open
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-slate-700 hover:bg-slate-600 text-white shadow-md shadow-slate-700/20'}`}
                        >
                          {portal.portal_open ? <><ToggleRight size={18} /> Portal Open</> : <><ToggleLeft size={18} /> Portal Closed</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'sections' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Link2 size={15} className="text-blue-500 shrink-0" />
                      <h2 className="text-sm font-bold text-[#1D3557]">Department Sections</h2>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg font-bold ml-auto">{sections.length} total</span>
                    </div>

                    {sections.length === 0 ? (
                      <div className="bg-white/85 border border-slate-100 rounded-xl p-10 text-center text-slate-500 text-sm shadow-sm">
                        No sections found in your department.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        {sections.map(s => (
                          <div key={s.id} className="bg-white/85 border border-slate-100 rounded-xl p-3.5 flex items-center justify-between gap-2 shadow-sm">
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-[#1D3557] truncate">{s.name || `Sem ${s.semester} — ${s.label}`}</div>
                              <div className="text-xs text-slate-400 mt-0.5">Sem {s.semester} • Sec {s.label}</div>
                            </div>
                            <button onClick={() => previewDelete(s.id)}
                              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 transition-all cursor-pointer">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {deletePreview && (
                      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
                        onClick={e => e.target === e.currentTarget && setDeletePreview(null)}>
                        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                          <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <AlertTriangle size={15} className="text-white" />
                              <span className="text-white font-bold text-sm">Confirm Deletion</span>
                            </div>
                            <button onClick={() => setDeletePreview(null)} className="text-white/70 hover:text-white cursor-pointer"><X size={15} /></button>
                          </div>
                          <div className="p-4">
                            <p className="text-sm text-slate-700 mb-3">Delete <strong>{deletePreview.section_name}</strong>?</p>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              {[['TLFQs', deletePreview.affected.tlfqs], ['Enrollments', deletePreview.affected.enrollments],
                                ['Students', deletePreview.affected.students], ['Assignments', deletePreview.affected.assignments]
                              ].map(([label, count]) => (
                                <div key={label} className="bg-red-50 border border-red-100 rounded-xl p-2.5 text-center">
                                  <div className="text-base font-black text-red-600">{count}</div>
                                  <div className="text-[9px] font-bold text-red-400 uppercase tracking-wider">{label}</div>
                                </div>
                              ))}
                            </div>
                            <p className="text-xs text-slate-400 mb-3">This action is irreversible.</p>
                            <div className="flex gap-2">
                              <button onClick={() => setDeletePreview(null)}
                                className="flex-1 py-2 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
                              <button onClick={confirmDelete} disabled={deletingSection}
                                className="flex-1 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
                                {deletingSection ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {tab === 'create' && (
                  <form onSubmit={handleCreate} className="bg-white/85 border border-slate-100 rounded-xl shadow-sm p-4 sm:p-5 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Section</label>
                        <select value={sectionId} onChange={e => setSectionId(e.target.value)}
                          className="input-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                          <option value="">Select Section…</option>
                          {sections.map(s => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Faculty & Course</label>
                        <select value={selectedSf} onChange={e => setSelectedSf(e.target.value)} disabled={!sectionId}
                          className="input-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50">
                          <option value="">Select Faculty & Course…</option>
                          {sfList.map(sf => <option key={sf.id} value={sf.id}>{sf.faculty_name} — [{sf.course_code}] {sf.course_name}</option>)}
                        </select>
                      </div>

                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Form Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                          placeholder="e.g. Spring 2025 — DSA Feedback"
                          className="input-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Closing Date</label>
                        <input type="date" value={closingDate} onChange={e => setClosingDate(e.target.value)}
                          className="input-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Closing Time</label>
                        <input type="time" value={closingTimeVal} onChange={e => setClosingTimeVal(e.target.value)}
                          className="input-base rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Questions</label>
                        <button type="button" onClick={() => setQuestions([...questions, ''])}
                          className="text-[11px] font-bold text-blue-500 hover:text-blue-400 cursor-pointer flex items-center gap-1">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      {questions.map((q, i) => (
                        <div key={i} className="flex gap-2 items-center mb-2">
                          <span className="h-6 w-6 text-[10px] font-black text-blue-400 bg-blue-50 border border-blue-200 rounded-md flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <input type="text" value={q}
                            onChange={e => { const u = [...questions]; u[i] = e.target.value; setQuestions(u); }}
                            className="flex-1 input-base rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0" />
                          {questions.length > 1 && (
                            <button type="button" onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                              className="text-slate-300 hover:text-red-400 transition-colors cursor-pointer shrink-0">
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button type="submit" disabled={creating}
                      className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-75 w-full sm:w-auto sm:self-start">
                      {creating
                        ? <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <><Check size={15} /> Create Form</>}
                    </button>
                  </form>
                )}

                {tab === 'forms' && (
                  <div className="flex flex-col gap-2.5">
                    {forms.length === 0 ? (
                      <div className="bg-white/85 border border-slate-100 rounded-xl p-10 text-center text-slate-500 text-sm shadow-sm">
                        No forms yet. Use "Create Form" to get started.
                      </div>
                    ) : forms.map(f => (
                      <div key={f.id} className="bg-white/85 border border-slate-100 rounded-xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-sm">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${statusColor(f.status)}`}>{f.status}</span>
                            <span className="text-xs text-slate-400 font-mono">{f.responses} resp.</span>
                          </div>
                          <div className="text-sm font-bold text-[#1D3557]">{f.title}</div>
                          <div className="text-xs text-slate-500 mt-0.5">{f.section_name} • {f.faculty_name} • {f.course_code}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} /> {new Date(f.closing_time).toLocaleString()}
                          </div>
                        </div>
                        {!f.expired && (
                          <button onClick={() => toggleForm(f.id, f.is_active)}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer w-full
                              ${f.is_active
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 border border-red-200'
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}>
                            {f.is_active ? <><ToggleRight size={14} /> Close Form</> : <><ToggleLeft size={14} /> Open Form</>}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>

            <footer className="mt-6 pt-4 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-400">© 2026 Invertis University, Bareilly-243123, Uttar Pradesh.</p>
            </footer>

          </div>
        </main>
      </div>
    </div>
  );
}
