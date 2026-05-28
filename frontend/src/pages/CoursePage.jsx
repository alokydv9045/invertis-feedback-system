import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Award, ArrowLeft, ArrowRight, CheckCircle2, FileText, ChevronDown } from 'lucide-react';

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSectionId, setOpenSectionId] = useState(null);

  useEffect(() => {
    api.get(`/tlfq/courses/${id}/evaluations`)
      .then(r => { setEvaluations(r.data || []); if (r.data?.length > 0) setOpenSectionId(r.data[0].id); })
      .catch(err => setError(err.response?.data?.message || 'No evaluation questionnaire published yet.'))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-invertis-blue transition mb-4 cursor-pointer">
        <ArrowLeft size={14} /> Back to Dashboard
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Evaluations</h1>
      <p className="text-sm text-gray-500 mb-6">Your feedback helps improve course teaching methods.</p>

      {loading ? (
        <Card><div className="py-20 flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-invertis-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Loading forms...</span>
        </div></Card>
      ) : error || evaluations.length === 0 ? (
        <Card>
          <EmptyState icon={FileText} title="No Evaluations" message={error || 'No active forms for this course yet.'} />
          <div className="pb-6 text-center"><Button variant="secondary" onClick={() => navigate('/dashboard')}>Return to Dashboard</Button></div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider pb-3 border-b border-gray-100">Available Forms ({evaluations.length})</h3>
          {evaluations.map((ev) => {
            const isOpen = openSectionId === ev.id;
            return (
              <Card key={ev.id} className={isOpen ? 'ring-2 ring-invertis-blue/20' : ''}>
                <button onClick={() => setOpenSectionId(isOpen ? null : ev.id)} className="w-full flex items-center justify-between p-6 text-left cursor-pointer group">
                  <div className="flex-1 mr-4">
                    <Badge status={ev.completed ? 'completed' : 'active'}>{ev.completed ? 'Completed' : 'Active'}</Badge>
                    <h2 className="text-lg font-bold text-gray-900 mt-2 group-hover:text-invertis-blue transition-colors">{ev.title}</h2>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isOpen ? 'bg-invertis-blue text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-invertis-blue/10 flex items-center justify-center"><BookOpen size={18} className="text-invertis-blue" /></div>
                          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Course</p><p className="text-sm font-semibold text-gray-900">{ev.course_name || 'Course'}</p></div>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center"><Award size={18} className="text-purple-500" /></div>
                          <div><p className="text-[10px] font-bold text-gray-400 uppercase">Instructor</p><p className="text-sm font-semibold text-gray-900">{ev.faculty_name}</p></div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 bg-amber-50 p-4 rounded-xl text-xs text-amber-700 border border-amber-100">
                        <CheckCircle2 className="shrink-0 text-amber-500 mt-0.5" size={16} />
                        <span>Your response is encrypted and anonymous.</span>
                      </div>
                      <Button onClick={() => navigate(`/courses/${id}/tlfq/${ev.id}`)} icon={ArrowRight} iconPosition="right" className="w-full justify-center">
                        {ev.completed ? 'Review Response' : 'Launch Evaluation'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
