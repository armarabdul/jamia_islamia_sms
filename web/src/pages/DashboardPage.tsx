import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Users, 
  GraduationCap, 
  CheckSquare, 
  Award, 
  FileText, 
  Clock, 
  Calendar, 
  Megaphone, 
  ArrowRight, 
  TrendingUp, 
  Sparkles,
  BookOpen,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ReportCardModal } from '../components/ReportCardModal';
import { ReportCard } from '../types';

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [adminData, setAdminData] = useState<any>(null);
  const [studentTimetable, setStudentTimetable] = useState<any[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (role === 'ADMIN') {
          const res = await api.get('/reports/dashboard-overview/');
          setAdminData(res.data);
        } else if (role === 'TEACHER') {
          const [annRes, exRes] = await Promise.all([
            api.get('/announcements/'),
            api.get('/exams/')
          ]);
          setExams(exRes.data.results || exRes.data);
        } else if (role === 'STUDENT') {
          const [ttRes, hwRes, exRes] = await Promise.all([
            api.get('/timetable/my-schedule/'),
            api.get('/assignments/'),
            api.get('/exams/')
          ]);
          setStudentTimetable(ttRes.data.results || ttRes.data);
          setStudentAssignments((hwRes.data.results || hwRes.data).slice(0, 4));
          setExams(exRes.data.results || exRes.data);

          const studentId = (user as any)?.student_profile?.id;
          if (studentId) {
            const attRes = await api.get(`/attendance/student-summary/${studentId}/`);
            setStudentAttendance(attRes.data);
          }
        } else if (role === 'PARENT' && activeChild) {
          const [attRes, hwRes, exRes, ttRes] = await Promise.all([
            api.get(`/attendance/student-summary/${activeChild.id}/`),
            api.get('/assignments/'),
            api.get('/exams/'),
            api.get(`/timetable/my-schedule/?student_id=${activeChild.id}`)
          ]);
          setStudentAttendance(attRes.data);
          setStudentAssignments((hwRes.data.results || hwRes.data).slice(0, 4));
          setExams(exRes.data.results || exRes.data);
          setStudentTimetable(ttRes.data.results || ttRes.data);
        }
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [role, activeChild]);

  const viewReportCard = async (studentId: string, examId: string) => {
    try {
      const res = await api.get(`/grades/report-card/${studentId}/${examId}/`);
      setSelectedReportCard(res.data);
    } catch (err) {
      alert('Report card is not ready or results are not published.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900/80 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                Jamia Islamia Academic Year 2026-2027
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('dashboard.welcome')}, {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-300/80 mt-1">
              {isUrdu 
                ? 'جامعہ اسلامیہ مکتب پورٹل میں آپ کا خیرمقدم ہے۔' 
                : 'Empowering Islamic education and academic excellence in Bhatkal.'}
            </p>
          </div>

          {/* Role specific quick action button */}
          {role === 'TEACHER' && (
            <Link to="/attendance" className="btn btn-primary text-xs py-2.5 px-4 shadow-lg shrink-0">
              <CheckSquare className="w-4 h-4" />
              <span>{t('dashboard.quick_attendance')}</span>
            </Link>
          )}

          {role === 'ADMIN' && (
            <Link to="/imports" className="btn btn-gold text-xs py-2.5 px-4 shadow-lg shrink-0">
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.import_export')}</span>
            </Link>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {role === 'ADMIN' && adminData && (
        <>
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-panel p-5 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">{t('dashboard.total_students')}</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{adminData.kpis.total_students}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Active Enrolled</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">{t('dashboard.total_teachers')}</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{adminData.kpis.total_teachers}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Academic Staff</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 border-amber-500/20 hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">{t('dashboard.attendance_today')}</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">{adminData.kpis.attendance_today_percentage}%</div>
                  <div className="text-[11px] text-slate-400 mt-1">{adminData.kpis.attendance_absent_count} Absences Today</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <CheckSquare className="w-6 h-6" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 border-emerald-500/20 hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-400">{t('dashboard.active_assignments')}</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{adminData.kpis.active_assignments_count}</div>
                  <div className="text-[11px] text-emerald-400 mt-1">Homework Active</div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
              </div>
            </div>

          </div>

          {/* Quick Admin Actions & Recent Notices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Assessment & Exam Schedule */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">{t('dashboard.upcoming_exams')}</h2>
                </div>
                <Link to="/examinations" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  <span>{t('common.view')}</span>
                  <ArrowRight className="w-3 h-3 rtl-flip" />
                </Link>
              </div>

              <div className="divide-y divide-white/5 mt-3">
                {adminData.upcoming_exams.map((ex: any) => (
                  <div key={ex.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {isUrdu ? ex.name_urdu || ex.name : ex.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ex.start_date} to {ex.end_date}
                      </div>
                    </div>
                    <span className={`badge ${ex.is_published ? 'badge-present' : 'badge-gold'}`}>
                      {ex.is_published ? 'Published' : 'Scheduled'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* School Announcements */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">{t('dashboard.recent_announcements')}</h2>
                </div>
                <Link to="/announcements" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  <span>{t('common.view')}</span>
                  <ArrowRight className="w-3 h-3 rtl-flip" />
                </Link>
              </div>

              <div className="divide-y divide-white/5 mt-3">
                {adminData.recent_announcements.map((ann: any) => (
                  <div key={ann.id} className="py-3">
                    <div className="text-xs font-semibold text-white">
                      {isUrdu ? ann.title_urdu || ann.title : ann.title}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Audience: {ann.audience} | {new Date(ann.published_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {role === 'TEACHER' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/attendance" className="glass-panel p-6 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckSquare className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">{t('dashboard.quick_attendance')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isUrdu ? 'درجہ و شعبہ منتخب کر کے روزانہ یا گھنٹی وار حاضری درج فرمائیں۔' : 'Mark daily and period-wise attendance for assigned sections.'}
            </p>
          </Link>

          <Link to="/homework" className="glass-panel p-6 hover:border-emerald-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">{t('homework.create_homework')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isUrdu ? 'نئے اسائنمنٹس پوسٹ کریں اور طلبہ کے جوابات چیک کر کے نمبرات دیں۔' : 'Create assignments and review student submissions with grades.'}
            </p>
          </Link>

          <Link to="/examinations" className="glass-panel p-6 hover:border-amber-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-white">{t('dashboard.quick_marks')}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {isUrdu ? 'امتحانات میں طلبہ کے حاصل کردہ نمبرات درج فرمائیں۔' : 'Enter assessment marks directly into the secure grade matrix.'}
            </p>
          </Link>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDENT & PARENT DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {(role === 'STUDENT' || role === 'PARENT') && (
        <div className="space-y-6">
          
          {/* Top Quick Status Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="glass-panel p-5 border-emerald-500/20">
              <div className="text-xs text-slate-400 font-semibold">{t('attendance.percentage')}</div>
              <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">
                {studentAttendance ? `${studentAttendance.attendance_percentage}%` : '100%'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {studentAttendance?.present_days || 0} Days Present / {studentAttendance?.total_days || 0} Total
              </div>
            </div>

            <div className="glass-panel p-5 border-amber-500/20">
              <div className="text-xs text-slate-400 font-semibold">{t('homework.title')}</div>
              <div className="text-3xl font-bold text-amber-400 font-mono mt-1">
                {studentAssignments.length}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Active Tasks</div>
            </div>

            <div className="glass-panel p-5 border-emerald-500/20">
              <div className="text-xs text-slate-400 font-semibold">{t('exams.title')}</div>
              <div className="text-3xl font-bold text-white font-mono mt-1">
                {exams.length}
              </div>
              <div className="text-[11px] text-emerald-400 mt-1">Assessment Terms</div>
            </div>

          </div>

          {/* Timetable & Active Homework */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Schedule */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">{t('nav.timetable')}</h2>
                </div>
                <Link to="/timetable" className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
                  <span>{t('common.view')}</span>
                  <ArrowRight className="w-3 h-3 rtl-flip" />
                </Link>
              </div>

              <div className="divide-y divide-white/5 mt-3">
                {studentTimetable.length > 0 ? (
                  studentTimetable.map((slot) => (
                    <div key={slot.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-white">
                          Period {slot.period_number}: {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{slot.teacher_name} - {slot.room_number || 'Room 101'}</div>
                      </div>
                      <div className="font-mono text-emerald-400 text-xs">
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">No timetable schedule loaded.</div>
                )}
              </div>
            </div>

            {/* Published Examinations & Report Card Trigger */}
            <div className="glass-panel p-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white">{t('exams.report_card_title')}</h2>
                </div>
              </div>

              <div className="divide-y divide-white/5 mt-3">
                {exams.map((ex) => (
                  <div key={ex.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">
                        {isUrdu ? ex.name_urdu || ex.name : ex.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ex.academic_year_name}
                      </div>
                    </div>

                    {ex.is_published ? (
                      <button
                        onClick={() => {
                          const sId = role === 'PARENT' ? activeChild?.id : (user as any)?.student_profile?.id;
                          if (sId) viewReportCard(sId, ex.id);
                        }}
                        className="btn btn-primary text-xs py-1.5 px-3"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{t('exams.report_card_title')}</span>
                      </button>
                    ) : (
                      <span className="badge badge-gold text-[10px]">Results Pending</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Report Card Modal */}
      {selectedReportCard && (
        <ReportCardModal
          reportCard={selectedReportCard}
          onClose={() => setSelectedReportCard(null)}
        />
      )}

    </div>
  );
};
