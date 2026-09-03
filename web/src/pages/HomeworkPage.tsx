import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, CheckCircle, Clock, Upload, Award, Save, X, Calendar } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Assignment, Submission } from '../types';

export const HomeworkPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);

  // Student submission form state
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Teacher new homework form
  const [newHw, setNewHw] = useState({
    title: '',
    title_urdu: '',
    description: '',
    class_room: '',
    section: '',
    subject: '',
    due_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    max_marks: 10.0,
  });

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments/');
      setAssignments(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssignments();
    if (role === 'TEACHER' || role === 'ADMIN') {
      api.get('/academic/classes/').then((r) => setClasses(r.data.results || r.data));
      api.get('/academic/subjects/').then((r) => setSubjects(r.data.results || r.data));
    }
  }, [role, activeChild]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assignments/', newHw);
      setShowCreateModal(false);
      fetchAssignments();
      alert('Homework created successfully.');
    } catch (err) {
      alert('Failed to create assignment.');
    }
  };

  const handleStudentSubmit = async (assignmentId: string) => {
    if (!submissionText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/assignments/${assignmentId}/submit/`, {
        submission_text: submissionText,
      });
      alert('Homework submitted successfully.');
      setSubmissionText('');
      fetchAssignments();
    } catch (err) {
      alert('Error submitting homework.');
    } finally {
      setSubmitting(false);
    }
  };

  const viewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    try {
      const res = await api.get(`/assignments/${assignment.id}/submissions/`);
      setSubmissionsList(res.data);
      setShowSubmissionsModal(true);
    } catch (err) {
      console.error(err);
    }
  };

  const gradeSubmission = async (submissionId: string, marks: number, feedback: string) => {
    try {
      await api.patch(`/assignments/submissions/${submissionId}/grade/`, {
        marks_obtained: marks,
        feedback: feedback,
        status: 'GRADED',
      });
      if (selectedAssignment) viewSubmissions(selectedAssignment);
    } catch (err) {
      alert('Error saving grade.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <span>{t('homework.title')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'گھر کا کام تفویض کریں، اسائنمنٹس اپلوڈ کریں اور اساتذہ کے تاثرات حاصل کریں۔' 
              : 'Post classroom assignments, submit student homework, and evaluate with constructive teacher feedback.'}
          </p>
        </div>

        {(role === 'TEACHER' || role === 'ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary text-xs py-2.5 px-4"
          >
            <Plus className="w-4 h-4" />
            <span>{t('homework.create_homework')}</span>
          </button>
        )}
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {assignments.map((hw) => (
          <div key={hw.id} className="glass-panel p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-gold text-[10px]">
                  {isUrdu ? hw.subject_name_urdu || hw.subject_name : hw.subject_name}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-emerald-400" />
                  Due: {hw.due_date}
                </span>
              </div>

              <h2 className="text-sm font-bold text-white mt-2">
                {isUrdu ? hw.title_urdu || hw.title : hw.title}
              </h2>

              <p className="text-xs text-slate-300 mt-2 line-clamp-3">
                {hw.description}
              </p>

              <div className="text-[11px] text-slate-400 mt-3">
                Assigned by <strong className="text-slate-200">{hw.teacher_name}</strong> for {hw.class_name} - {hw.section_name}
              </div>
            </div>

            {/* Student Submission Card */}
            {role === 'STUDENT' && (
              <div className="pt-3 border-t border-white/10 space-y-2">
                {hw.my_submission ? (
                  <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-xs">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Status: {hw.my_submission.status}
                      </span>
                      {hw.my_submission.marks_obtained !== null && (
                        <span className="font-mono text-amber-300">
                          {hw.my_submission.marks_obtained} / {hw.max_marks} Marks
                        </span>
                      )}
                    </div>
                    {hw.my_submission.feedback && (
                      <div className="text-[11px] text-slate-300 mt-1">
                        <strong>Teacher Feedback:</strong> {hw.my_submission.feedback}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      placeholder="Type your answers or notes here..."
                      className="input-field text-xs"
                    />
                    <button
                      type="button"
                      disabled={submitting || !submissionText.trim()}
                      onClick={() => handleStudentSubmit(hw.id)}
                      className="btn btn-primary w-full text-xs py-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{t('homework.submit_homework')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Teacher Review Button */}
            {(role === 'TEACHER' || role === 'ADMIN') && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {hw.submission_count || 0} Submissions
                </span>
                <button
                  type="button"
                  onClick={() => viewSubmissions(hw)}
                  className="btn btn-secondary text-xs py-1.5 px-3"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>Review Submissions</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Homework Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-sm font-bold text-white">{t('homework.create_homework')}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={newHw.title}
                  onChange={(e) => setNewHw({ ...newHw, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g. Surah Al-Kahf Tafseer Notes"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Title (Urdu)</label>
                <input
                  type="text"
                  value={newHw.title_urdu}
                  onChange={(e) => setNewHw({ ...newHw, title_urdu: e.target.value })}
                  className="input-field"
                  placeholder="سورۃ الکہف خلاصہ و نکات"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Class</label>
                  <select
                    required
                    value={newHw.class_room}
                    onChange={(e) => {
                      const c = classes.find((cl) => cl.id === e.target.value);
                      setNewHw({
                        ...newHw,
                        class_room: e.target.value,
                        section: c?.sections?.[0]?.id || '',
                      });
                    }}
                    className="input-field"
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Subject</label>
                  <select
                    required
                    value={newHw.subject}
                    onChange={(e) => setNewHw({ ...newHw, subject: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Detailed Instructions</label>
                <textarea
                  rows={3}
                  required
                  value={newHw.description}
                  onChange={(e) => setNewHw({ ...newHw, description: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newHw.due_date}
                    onChange={(e) => setNewHw({ ...newHw, due_date: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={newHw.max_marks}
                    onChange={(e) => setNewHw({ ...newHw, max_marks: parseFloat(e.target.value) || 10 })}
                    className="input-field"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-full py-2 mt-2">
                Publish Homework
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Submissions Modal */}
      {showSubmissionsModal && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Submissions: {selectedAssignment.title}</h3>
                <span className="text-xs text-emerald-400">Max Marks: {selectedAssignment.max_marks}</span>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
              {submissionsList.length > 0 ? (
                submissionsList.map((sub) => (
                  <div key={sub.id} className="py-3 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-white">{sub.student_name}</strong>
                        <span className="text-[11px] text-slate-400 ms-2">({sub.admission_number})</span>
                      </div>
                      <span className={`badge ${sub.status === 'GRADED' ? 'badge-present' : 'badge-gold'}`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white/5 text-slate-300">
                      {sub.submission_text || 'No text submitted.'}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="number"
                        placeholder="Marks"
                        defaultValue={sub.marks_obtained !== null ? sub.marks_obtained : ''}
                        id={`mark-${sub.id}`}
                        className="input-field w-24 py-1 text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Teacher feedback..."
                        defaultValue={sub.feedback || ''}
                        id={`feed-${sub.id}`}
                        className="input-field flex-1 py-1 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const mVal = parseFloat((document.getElementById(`mark-${sub.id}`) as HTMLInputElement)?.value) || 0;
                          const fVal = (document.getElementById(`feed-${sub.id}`) as HTMLInputElement)?.value || '';
                          gradeSubmission(sub.id, mVal, fVal);
                        }}
                        className="btn btn-primary py-1 px-3 text-xs"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-500">No submissions received yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
