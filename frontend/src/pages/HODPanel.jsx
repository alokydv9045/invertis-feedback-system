import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { StatsCard } from '../components/ui/StatsCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LayoutDashboard, Plus, ToggleLeft, ToggleRight, Clock, FileText, Check, X, Users, BookOpen, Layers, Activity } from 'lucide-react';

const STD_QUESTIONS = [
  'The instructor explains course material clearly and effectively.',
  'The instructor is responsive to questions during and outside of class.',
  'The assignments and projects contribute significantly to my learning.',
  'The course content is relevant and up-to-date.',
  'The instructor is well-prepared for every lecture.',
  'Overall, I would rate this instructor\'s effectiveness as high.',
];

const TABS = [
  { id: 'dashboard', label: 'Dashboard',   icon: LayoutDashboard },
  { id: 'create',    label: 'Create Form', icon: Plus },
  { id: 'forms',     label: 'My Forms',    icon: FileText },
];

export default function HODPanel() {
  const [tab,       setTab]       = useState('dashboard');
  const [stats,     setStats]     = useState(null);
  const [sections,  setSections]  = useState([]);
  const [forms,     setForms]     = useState([]);
  const [portal,    setPortal]    = useState(null);
  const [msg,       setMsg]       = useState(null);
  const [sectionId,    setSectionId]    = useState('');
  const [sfList,       setSfList]       = useState([]);
  const [selectedSf,   setSelectedSf]   = useState('');
  const [title,        setTitle]        = useState('');
  const [closingTime,  setClosingTime]  = useState('');
  const [questions,    setQuestions]    = useState([...STD_QUESTIONS]);
  const [creating,     setCreating]     = useState(false);

  const loadData = async () => {
    try {
      const [rStats, rSections, rForms, rPortal] = await Promise.all([
        api.get('/hod/stats'), api.get('/hod/sections'), api.get('/hod/tlfq'), api.get('/hod/portal'),
      ]);
      setStats(rStats.data); setSections(rSections.data); setForms(rForms.data); setPortal(rPortal.data);
    } catch {}
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(null), 4000); return () => clearTimeout(t); } }, [msg]);
  useEffect(() => {
    if (!sectionId) { setSfList([]); setSelectedSf(''); return; }
    api.get(`/hod/section-faculty?section_id=${sectionId}`).then(r => setSfList(r.data)).catch(() => setSfList([]));
  }, [sectionId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!sectionId || !selectedSf || !title || !closingTime) { setMsg({ type: 'error', text: 'All fields are required.' }); return; }
    const sf = sfList.find(s => s.id === selectedSf);
    if (!sf) return;
    setCreating(true);
    try {
      await api.post('/hod/tlfq', { section_id: sectionId, course_id: sf.course_id, faculty_id: sf.faculty_id, title, closing_time: closingTime, question_texts: questions.filter(q => q.trim()) });
      setSectionId(''); setSelectedSf(''); setTitle(''); setClosingTime(''); setQuestions([...STD_QUESTIONS]);
      setMsg({ type: 'success', text: 'Form created. Open it from "My Forms" to make it live.' }); setTab('forms'); loadData();
    } catch (err) { setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to create form.' }); }
    finally { setCreating(false); }
  };

  const toggleForm = async (id, current) => {
    try { await api.put(`/hod/tlfq/${id}/toggle`, { is_active: !current }); setMsg({ type: 'success', text: `Form ${!current ? 'opened' : 'closed'}.` }); loadData(); }
    catch { setMsg({ type: 'error', text: 'Failed.' }); }
  };

  const togglePortal = async () => {
    try { const res = await api.put('/hod/portal', { open: !portal.portal_open }); setPortal(prev => ({ ...prev, portal_open: res.data.portal_open })); setMsg({ type: 'success', text: res.data.message }); }
    catch { setMsg({ type: 'error', text: 'Failed.' }); }
  };

  const inputClass = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-invertis-blue/20 focus:border-invertis-blue transition-all text-gray-900";

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center">
          <LayoutDashboard size={20} className="text-invertis-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HOD Panel</h1>
          <p className="text-sm text-gray-500">Manage evaluation forms and departmental portal</p>
        </div>
      </div>

      {msg && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className={`mb-4 p-3 border text-sm font-semibold rounded-lg flex items-center justify-between ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
          {msg.text}
          <button onClick={() => setMsg(null)} className="cursor-pointer"><X size={14} /></button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-md transition-all cursor-pointer ${tab === id ? 'bg-white text-invertis-blue shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && (
            <div className="space-y-6">
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatsCard icon={Layers} label="Sections" value={stats.sections} color="blue" />
                  <StatsCard icon={Users} label="Faculty" value={stats.faculty} color="purple" />
                  <StatsCard icon={BookOpen} label="Courses" value={stats.courses} color="green" />
                  <StatsCard icon={Users} label="Students" value={stats.students} color="orange" />
                  <StatsCard icon={FileText} label="My Forms" value={stats.myForms} color="blue" />
                  <StatsCard icon={Activity} label="Open Forms" value={stats.openForms} color="red" />
                </div>
              )}

              {portal && (
                <Card>
                  <CardBody>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-gray-900">Department Portal</h3>
                        <p className="text-sm text-gray-500 mt-1">When closed, students cannot see or submit any feedback forms.</p>
                      </div>
                      <Button
                        variant={portal.portal_open ? 'success' : 'secondary'}
                        icon={portal.portal_open ? ToggleRight : ToggleLeft}
                        onClick={togglePortal}
                      >
                        {portal.portal_open ? 'Portal Open' : 'Portal Closed'}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              )}
            </div>
          )}

          {/* CREATE FORM TAB */}
          {tab === 'create' && (
            <Card>
              <CardBody>
                <form onSubmit={handleCreate} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section</label>
                      <select value={sectionId} onChange={e => setSectionId(e.target.value)} className={inputClass}>
                        <option value="">Select Section…</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name} (Sem {s.semester})</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Faculty & Course</label>
                      <select value={selectedSf} onChange={e => setSelectedSf(e.target.value)} disabled={!sectionId} className={`${inputClass} disabled:opacity-50`}>
                        <option value="">Select Faculty & Course…</option>
                        {sfList.map(sf => <option key={sf.id} value={sf.id}>{sf.faculty_name} — [{sf.course_code}] {sf.course_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Form Title</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Spring 2025 — DSA Feedback" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Closing Time</label>
                      <input type="datetime-local" value={closingTime} onChange={e => setClosingTime(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-semibold text-gray-700">Questions</label>
                      <button type="button" onClick={() => setQuestions([...questions, ''])}
                        className="text-xs font-semibold text-invertis-blue hover:text-blue-700 cursor-pointer flex items-center gap-1">
                        <Plus size={13} /> Add Question
                      </button>
                    </div>
                    {questions.map((q, i) => (
                      <div key={i} className="flex gap-2 items-center mb-2">
                        <span className="w-8 h-8 text-xs font-bold text-invertis-blue bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">Q{i + 1}</span>
                        <input type="text" value={q} onChange={e => { const u = [...questions]; u[i] = e.target.value; setQuestions(u); }} className={`flex-1 ${inputClass}`} />
                        {questions.length > 1 && (
                          <button type="button" onClick={() => setQuestions(questions.filter((_, j) => j !== i))}
                            className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"><X size={16} /></button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button type="submit" disabled={creating} icon={Check}>
                    {creating ? 'Creating...' : 'Create Form (Closed by default)'}
                  </Button>
                </form>
              </CardBody>
            </Card>
          )}

          {/* MY FORMS TAB */}
          {tab === 'forms' && (
            <div className="space-y-4">
              {forms.length === 0 ? (
                <Card><EmptyState icon={FileText} title="No forms created yet" message='Use "Create Form" to get started.' /></Card>
              ) : forms.map(f => (
                <Card key={f.id}>
                  <CardBody>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge status={f.status === 'open' ? 'active' : f.status === 'expired' ? 'closed' : 'pending'}>{f.status}</Badge>
                          <span className="text-xs text-gray-400">{f.responses} responses</span>
                        </div>
                        <div className="text-sm font-bold text-gray-900">{f.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{f.section_name} • {f.faculty_name} • {f.course_code}</div>
                        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                          <Clock size={11} /> Closes: {new Date(f.closing_time).toLocaleString()}
                        </div>
                      </div>
                      {!f.expired && (
                        <Button
                          variant={f.is_active ? 'danger' : 'success'}
                          size="sm"
                          icon={f.is_active ? ToggleRight : ToggleLeft}
                          onClick={() => toggleForm(f.id, f.is_active)}
                        >
                          {f.is_active ? 'Close Form' : 'Open Form'}
                        </Button>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
