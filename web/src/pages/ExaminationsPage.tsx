import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Award, CheckCircle, FileText, Plus, Save, Printer, Eye, Lock, Unlock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { ReportCardModal } from '../components/ReportCardModal';
import { Exam, ReportCard } from '../types';

export const ExaminationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examSubjects, setExamSubjects] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const [marksGrid, setMarksGrid] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams/');
      const list = res.data.results || res.data;
      setExams(list);
      if (list.length > 0 && !selectedExam) {
        setSelectedExam(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    if (selectedExam) {
      api.get(`/exams/subjects/?exam_id=${selectedExam.id}`).then((res) => {
        const subjects = res.data.results || res.data;
        setExamSubjects(subjects);
        if (subjects.length > 0) {
          setSelectedSubject(subjects[0]);
        } else {
          setSelectedSubject(null);
          setMarksGrid([]);
        }
      });
    }
  }, [selectedExam]);

  // Load students for marks entry
  useEffect(() => {
    if (selectedSubject && (role === 'TEACHER' || role === 'ADMIN')) {
      api.get(`/students/?class_id=${selectedSubject.class_room}`).then((stRes) => {
        const studentList = stRes.data.results || stRes.data;

        // Fetch existing grades
        api.get(`/grades/records/?exam_subject_id=${selectedSubject.id}`).then((grRes) => {
          const grades = grRes.data.results || grRes.data;
          const initialGrid = studentList.map((st: any) => {
            const existing = grades.find((g: any) => g.student === st.id);
            return {
              student_id: st.id,
              student_name: st.full_name,
              student_name_urdu: st.full_name_urdu,
              admission_number: st.admission_number,
              roll_number: st.current_enrollment?.roll_number,
              marks_obtained: existing ? existing.marks_obtained : '',
              is_absent: existing ? existing.is_absent : false,
              remarks: existing ? existing.remarks : '',
            };
          });
          setMarksGrid(initialGrid);
        });
      });
    }
  }, [selectedSubject, role]);

  const handleMarkChange = (studentId: string, value: string) => {
    setMarksGrid((prev) =>
      prev.map((item) => (item.student_id === studentId ? { ...item, marks_obtained: value } : item))
    );
  };

  const handleAbsentToggle = (studentId: string) => {
    setMarksGrid((prev) =>
      prev.map((item) =>
        item.student_id === studentId ? { ...item, is_absent: !item.is_absent } : item
      )
    );
  };

  const saveMarks = async () => {
    if (!selectedSubject) return;
    setIsSaving(true);
    try {
      const marksPayload = marksGrid.map((row) => ({
        student_id: row.student_id,
        marks_obtained: row.is_absent ? 0.0 : parseFloat(row.marks_obtained) || 0.0,
        is_absent: row.is_absent,
        remarks: row.remarks || '',
      }));

      await api.post('/grades/records/batch-entry/', {
        exam_subject_id: selectedSubject.id,
        marks: marksPayload,
      });

      alert('Marks saved successfully.');
    } catch (err) {
      alert('Error saving marks.');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (exam: Exam) => {
    try {
      if (exam.is_published) {
        await api.post(`/exams/${exam.id}/unpublish/`);
      } else {
        await api.post(`/exams/${exam.id}/publish/`);
      }
      fetchExams();
    } catch (err) {
      alert('Action failed.');
    }
  };

  const viewStudentReportCard = async (studentId: string, examId: string) => {
    try {
      const res = await api.get(`/grades/report-card/${studentId}/${examId}/`);
      setReportCard(res.data);
    } catch (err) {
      alert('Report card is not available for this exam yet.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            <span>{t('exams.title')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'امتحانی جائزے، نمبرات کا اندراج اور تصدیق شدہ رپورٹ کارڈ' 
              : 'Assessment management, grade book entry, and bilingual progress report cards.'}
          </p>
        </div>
      </div>

      {/* Exam Term Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {exams.map((ex) => (
          <button
            key={ex.id}
            onClick={() => setSelectedExam(ex)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedExam?.id === ex.id
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>{isUrdu ? ex.name_urdu || ex.name : ex.name}</span>
            <span className={`badge ${ex.is_published ? 'badge-present' : 'badge-gold'} text-[10px] px-1.5 py-0`}>
              {ex.is_published ? 'Published' : 'Draft'}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* ADMIN & TEACHER: SUBJECT GRADING MATRIX */}
      {/* ========================================================================= */}
      {(role === 'TEACHER' || role === 'ADMIN') && selectedExam && (
        <div className="space-y-4">
          
          {/* Controls */}
          <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Exam Subject
                </label>
                <select
                  value={selectedSubject?.id || ''}
                  onChange={(e) => {
                    const subj = examSubjects.find((s) => s.id === e.target.value);
                    setSelectedSubject(subj || null);
                  }}
                  className="input-field text-xs py-2 w-56"
                >
                  {examSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.class_name} - {s.subject_name} (Max: {s.total_marks})
                    </option>
                  ))}
                </select>
              </div>

              {selectedSubject && (
                <div className="text-xs text-slate-300 pt-5">
                  Total Marks: <strong className="text-amber-400 font-mono">{selectedSubject.total_marks}</strong> | 
                  Passing: <strong className="text-emerald-400 font-mono ms-1">{selectedSubject.passing_marks}</strong>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {role === 'ADMIN' && (
                <button
                  type="button"
                  onClick={() => togglePublish(selectedExam)}
                  className="btn btn-secondary text-xs py-2 px-3"
                >
                  {selectedExam.is_published ? (
                    <>
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unpublish Results</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Publish Results to Parents</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={saveMarks}
                disabled={isSaving || marksGrid.length === 0}
                className="btn btn-primary text-xs py-2 px-4"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? t('common.loading') : 'Save Marks'}</span>
              </button>
            </div>
          </div>

          {/* Marks Grid Table */}
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Admission No</th>
                    <th>Student Name</th>
                    <th>Absent</th>
                    <th className="w-36">Marks Obtained</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marksGrid.length > 0 ? (
                    marksGrid.map((row) => (
                      <tr key={row.student_id}>
                        <td className="font-mono text-xs text-slate-400">
                          {row.roll_number || '-'}
                        </td>
                        <td className="font-mono font-bold text-amber-400 text-xs">
                          {row.admission_number}
                        </td>
                        <td>
                          <div className="font-semibold text-white text-xs">{row.student_name}</div>
                          {row.student_name_urdu && (
                            <div className="text-[11px] text-emerald-400 font-serif">{row.student_name_urdu}</div>
                          )}
                        </td>
                        <td>
                          <input
                            type="checkbox"
                            checked={row.is_absent}
                            onChange={() => handleAbsentToggle(row.student_id)}
                            className="rounded border-slate-700 text-red-600 focus:ring-red-500"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={selectedSubject?.total_marks || 100}
                            disabled={row.is_absent}
                            value={row.is_absent ? '' : row.marks_obtained}
                            onChange={(e) => handleMarkChange(row.student_id, e.target.value)}
                            placeholder={row.is_absent ? 'ABSENT' : '0.00'}
                            className="input-field text-xs py-1.5 font-mono text-end font-bold"
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => viewStudentReportCard(row.student_id, selectedExam.id)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 text-xs flex items-center gap-1"
                            title="View Report Card"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Report Card</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                        {t('common.no_data')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STUDENT & PARENT VIEW: PROGRESS REPORT CARD */}
      {/* ========================================================================= */}
      {(role === 'STUDENT' || role === 'PARENT') && selectedExam && (
        <div className="glass-panel p-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">
            {isUrdu ? selectedExam.name_urdu || selectedExam.name : selectedExam.name}
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {selectedExam.is_published 
              ? 'Official progress results have been evaluated and published by Jamia Islamia.' 
              : 'Examination results are currently being compiled by teachers.'}
          </p>

          {selectedExam.is_published && (
            <button
              onClick={() => {
                const sId = role === 'PARENT' ? activeChild?.id : (user as any)?.student_profile?.id;
                if (sId) viewStudentReportCard(sId, selectedExam.id);
              }}
              className="btn btn-primary text-xs py-2.5 px-6 mx-auto"
            >
              <Printer className="w-4 h-4" />
              <span>{t('exams.report_card_title')}</span>
            </button>
          )}
        </div>
      )}

      {/* Report Card Modal */}
      {reportCard && (
        <ReportCardModal
          reportCard={reportCard}
          onClose={() => setReportCard(null)}
        />
      )}

    </div>
  );
};
