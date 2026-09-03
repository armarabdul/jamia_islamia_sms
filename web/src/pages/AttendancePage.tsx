import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Check, X, Clock, ShieldCheck, Save, Users, Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const AttendancePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  // Student / Parent View Stats
  const [studentStats, setStudentStats] = useState<any>(null);
  const [studentHistory, setStudentHistory] = useState<any[]>([]);

  useEffect(() => {
    api.get('/academic/years/').then((res) => setAcademicYears(res.data.results || res.data));
    api.get('/academic/classes/').then((res) => {
      const cls = res.data.results || res.data;
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClass(cls[0].id);
        if (cls[0].sections && cls[0].sections.length > 0) {
          setSections(cls[0].sections);
          setSelectedSection(cls[0].sections[0].id);
        }
      }
    });
  }, []);

  // When class changes, update sections
  const handleClassChange = (cId: string) => {
    setSelectedClass(cId);
    const cls = classes.find((c) => c.id === cId);
    if (cls && cls.sections && cls.sections.length > 0) {
      setSections(cls.sections);
      setSelectedSection(cls.sections[0].id);
    } else {
      setSections([]);
      setSelectedSection('');
    }
  };

  // Fetch Section Students for Teacher/Admin marking
  useEffect(() => {
    if ((role === 'TEACHER' || role === 'ADMIN') && selectedSection) {
      api.get(`/students/?section_id=${selectedSection}`).then((res) => {
        const list = res.data.results || res.data;
        setStudents(list);

        // Fetch existing attendance for this section & date
        api.get(`/attendance/records/?section_id=${selectedSection}&date=${selectedDate}`).then((attRes) => {
          const records = attRes.data.results || attRes.data;
          const initialMap: Record<string, any> = {};
          list.forEach((st: any) => {
            const existing = records.find((r: any) => r.student === st.id);
            initialMap[st.id] = existing ? existing.status : 'PRESENT';
          });
          setAttendanceMap(initialMap);
        });
      });
    }
  }, [selectedSection, selectedDate, role]);

  // Fetch Parent / Student personal attendance
  useEffect(() => {
    const sId = role === 'PARENT' ? activeChild?.id : (user as any)?.student_profile?.id;
    if ((role === 'STUDENT' || role === 'PARENT') && sId) {
      api.get(`/attendance/student-summary/${sId}/`).then((res) => setStudentStats(res.data));
      api.get(`/attendance/records/?student_id=${sId}`).then((res) => setStudentHistory(res.data.results || res.data));
    }
  }, [role, activeChild, user]);

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, any> = {};
    students.forEach((st) => {
      updated[st.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const submitAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess('');
    try {
      const currentYear = academicYears.find((y) => y.is_current) || academicYears[0];
      const records = Object.entries(attendanceMap).map(([studentId, status]) => ({
        student_id: studentId,
        status,
        notes: status === 'ABSENT' ? 'Daily Absence' : '',
      }));

      const res = await api.post('/attendance/records/bulk-mark/', {
        academic_year_id: currentYear.id,
        class_room_id: selectedClass,
        section_id: selectedSection,
        date: selectedDate,
        period_number: 0,
        records,
      });

      setSaveSuccess(res.data.message || 'Attendance saved successfully.');
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      alert('Failed to save attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.attendance')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu 
            ? 'روزانہ و گھنٹی وار حاضری کا اندراج اور ریکارڈ' 
            : 'Track daily attendance registers, calculate percentages, and dispatch automatic absence alerts.'}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* TEACHER & ADMIN REGISTER VIEW */}
      {/* ========================================================================= */}
      {(role === 'TEACHER' || role === 'ADMIN') && (
        <>
          {/* Controls Bar */}
          <div className="glass-panel p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('attendance.select_class')}
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => handleClassChange(e.target.value)}
                  className="input-field text-xs py-2 w-36"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isUrdu ? c.name_urdu || c.name : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('attendance.select_section')}
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="input-field text-xs py-2 w-32"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      Section {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  {t('attendance.select_date')}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => markAll('PRESENT')}
                className="btn btn-secondary text-xs py-2 px-3"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('attendance.mark_all_present')}</span>
              </button>

              <button
                type="button"
                onClick={submitAttendance}
                disabled={isSaving || students.length === 0}
                className="btn btn-primary text-xs py-2 px-4"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? t('common.loading') : t('attendance.save_attendance')}</span>
              </button>
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{saveSuccess}</span>
            </div>
          )}

          {/* Student Roster Attendance Grid */}
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Admission No</th>
                    <th>Student Name</th>
                    <th className="text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length > 0 ? (
                    students.map((st) => {
                      const currentStatus = attendanceMap[st.id] || 'PRESENT';
                      return (
                        <tr key={st.id}>
                          <td className="font-mono text-xs text-slate-400">
                            {st.current_enrollment?.roll_number || '-'}
                          </td>
                          <td className="font-mono font-bold text-amber-400 text-xs">
                            {st.admission_number}
                          </td>
                          <td>
                            <div className="font-semibold text-white text-xs">{st.full_name}</div>
                            {st.full_name_urdu && (
                              <div className="text-[11px] text-emerald-400 font-serif">{st.full_name_urdu}</div>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'PRESENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                              >
                                {t('attendance.present')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'ABSENT')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-red-600 text-white shadow-md shadow-red-950'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                              >
                                {t('attendance.absent')}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleStatusChange(st.id, 'LATE')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  currentStatus === 'LATE'
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                              >
                                {t('attendance.late')}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-slate-500 text-xs">
                        {t('common.no_data')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* STUDENT & PARENT ATTENDANCE BREAKDOWN */}
      {/* ========================================================================= */}
      {(role === 'STUDENT' || role === 'PARENT') && (
        <div className="space-y-6">
          {studentStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-5 text-center">
                <div className="text-xs text-slate-400 font-semibold">{t('attendance.percentage')}</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                  {studentStats.attendance_percentage}%
                </div>
              </div>
              <div className="glass-panel p-5 text-center">
                <div className="text-xs text-slate-400 font-semibold">{t('attendance.total_days')}</div>
                <div className="text-3xl font-bold text-white font-mono mt-1">
                  {studentStats.total_days}
                </div>
              </div>
              <div className="glass-panel p-5 text-center">
                <div className="text-xs text-slate-400 font-semibold">{t('attendance.present')}</div>
                <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                  {studentStats.present_days}
                </div>
              </div>
              <div className="glass-panel p-5 text-center">
                <div className="text-xs text-slate-400 font-semibold">{t('attendance.absent_days')}</div>
                <div className="text-3xl font-bold text-red-400 font-mono mt-1">
                  {studentStats.absent_days}
                </div>
              </div>
            </div>
          )}

          {/* History List */}
          <div className="glass-panel overflow-hidden">
            <div className="p-4 border-b border-white/10 font-bold text-sm text-white">
              Recent Attendance History
            </div>
            <div className="divide-y divide-white/5">
              {studentHistory.map((rec) => (
                <div key={rec.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{rec.date}</div>
                    <div className="text-[11px] text-slate-400">{rec.notes || 'Full Day General'}</div>
                  </div>
                  <span
                    className={`badge ${
                      rec.status === 'PRESENT'
                        ? 'badge-present'
                        : rec.status === 'ABSENT'
                        ? 'badge-absent'
                        : 'badge-late'
                    }`}
                  >
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
