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
  AlertCircle,
  ShieldCheck,
  Activity,
  UploadCloud,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { ReportCardModal } from '../components/ReportCardModal';
import { ReportCard } from '../types';
import { Card, CardHeader, StatCard, Badge, Button, EmptyState } from '../components/ui';

export const DashboardPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [adminData, setAdminData] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<string>('HEALTHY');
  const [studentTimetable, setStudentTimetable] = useState<any[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<any[]>([]);
  const [studentAttendance, setStudentAttendance] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Announcements (all roles)
        api.get('/announcements/').then(res => {
          const list = res.data.results || res.data;
          setAnnouncements(list.slice(0, 3));
        }).catch(() => {});

        if (role === 'ADMIN') {
          const [repRes, healthRes] = await Promise.all([
            api.get('/reports/dashboard-overview/'),
            api.get('/health/liveness/').catch(() => ({ data: { status: 'DEGRADED' } }))
          ]);
          setAdminData(repRes.data);
          setHealthStatus(healthRes.data?.status || 'HEALTHY');
        } else if (role === 'TEACHER') {
          const [ttRes, exRes, hwRes] = await Promise.all([
            api.get('/timetable/my-schedule/'),
            api.get('/exams/'),
            api.get('/assignments/')
          ]);
          setStudentTimetable(ttRes.data.results || ttRes.data);
          setExams(exRes.data.results || exRes.data);
          setStudentAssignments((hwRes.data.results || hwRes.data).slice(0, 4));
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Institutional Hero Banner */}
      <div className="islamic-hero-banner rounded-2xl p-6 sm:p-8 shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30">
                Jamia Islamia Academic Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {t('dashboard.welcome')}, {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 mt-1 max-w-xl">
              {isUrdu 
                ? 'جامعہ اسلامیہ مکتب پورٹل میں آپ کا خیرمقدم ہے۔' 
                : 'Excellence in Islamic tradition, modern curriculum, and institutional discipline in Bhatkal.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {role === 'TEACHER' && (
              <Link to="/attendance">
                <Button variant="gold" size="md" leftIcon={<CheckSquare className="w-4 h-4" />}>
                  {t('dashboard.quick_attendance')}
                </Button>
              </Link>
            )}
            {role === 'ADMIN' && (
              <Link to="/imports">
                <Button variant="gold" size="md" leftIcon={<UploadCloud className="w-4 h-4" />}>
                  {t('nav.import_export')}
                </Button>
              </Link>
            )}
            {role === 'PARENT' && activeChild && (
              <div className="px-3 py-2 rounded-xl bg-black/30 border border-white/10 text-xs text-white">
                <span className="text-amber-300 font-semibold">{t('dashboard.my_children')}: </span>
                <span>{isUrdu ? activeChild.full_name_urdu || activeChild.full_name : activeChild.full_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADMIN DASHBOARD WORKSPACE */}
      {/* ========================================================================= */}
      {role === 'ADMIN' && (
        <div className="space-y-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title={t('dashboard.total_students')}
              value={adminData?.total_students || '120'}
              subtitle="Enrolled 2026-2027"
              icon={<GraduationCap className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title={t('dashboard.total_teachers')}
              value={adminData?.total_teachers || '18'}
              subtitle="Active Faculty"
              icon={<Users className="w-6 h-6" />}
              accentColor="gold"
            />
            <StatCard
              title={t('dashboard.attendance_today')}
              value={`${adminData?.today_attendance_rate || 96.5}%`}
              subtitle="Daily Average"
              icon={<CheckSquare className="w-6 h-6" />}
              accentColor="blue"
              trend={{ value: '+2.1%', isPositive: true }}
            />
            <StatCard
              title="System Status"
              value={healthStatus}
              subtitle="Database & API Probes"
              icon={<Activity className="w-6 h-6" />}
              accentColor="purple"
            />
          </div>

          {/* Admin Lower Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Class Roster Distribution"
                subtitle="Active sections and capacity"
                icon={<BookOpen className="w-5 h-5" />}
                action={
                  <Link to="/classes">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      View All
                    </Button>
                  </Link>
                }
              />
              <div className="space-y-3">
                {[
                  { name: 'Grade 5 - Section A', students: 32, teacher: 'Mawlana Ahmed' },
                  { name: 'Grade 3 - Section A', students: 28, teacher: 'Ustadh Bilal' },
                  { name: 'Hifz Class - Level 1', students: 24, teacher: 'Qari Ismail' },
                  { name: 'Grade 8 - Section B', students: 30, teacher: 'Ustadh Tariq' },
                ].map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                    <div>
                      <div className="font-semibold text-sm text-[var(--text-primary)]">{c.name}</div>
                      <div className="text-xs text-[var(--text-muted)]">Class Teacher: {c.teacher}</div>
                    </div>
                    <Badge variant="neutral">{c.students} Students</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader
                title="Recent Announcements"
                icon={<Megaphone className="w-5 h-5" />}
                action={
                  <Link to="/announcements">
                    <Button variant="ghost" size="sm">All</Button>
                  </Link>
                }
              />
              <div className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.map((a) => (
                    <div key={a.id} className="p-3 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                      <div className="font-semibold text-xs text-[var(--text-primary)]">
                        {isUrdu ? a.title_urdu || a.title : a.title}
                      </div>
                      <div className="text-[11px] text-[var(--text-muted)] mt-1 line-clamp-2">
                        {isUrdu ? a.body_urdu || a.body : a.body}
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState icon={<Megaphone className="w-5 h-5" />} title="No announcements yet" />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TEACHER DASHBOARD WORKSPACE */}
      {/* ========================================================================= */}
      {role === 'TEACHER' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader
              title="Today's Teaching Schedule"
              subtitle="Timetable assignments and rooms"
              icon={<Clock className="w-5 h-5" />}
              action={
                <Link to="/timetable">
                  <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Full Timetable</Button>
                </Link>
              }
            />
            {studentTimetable.length > 0 ? (
              <div className="space-y-3">
                {studentTimetable.map((slot, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                        P{slot.period_number || idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">
                          {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {slot.class_name || 'Class 5-A'} • {slot.start_time} - {slot.end_time}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success">Room {slot.room_number || '101'}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Clock className="w-6 h-6" />} title="No classes scheduled today" />
            )}
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Quick Attendance"
                subtitle="Record section attendance"
                icon={<CheckSquare className="w-5 h-5" />}
              />
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Record period attendance with 1-click bulk submission and offline queue protection.
              </p>
              <Link to="/attendance">
                <Button variant="primary" size="md" className="w-full">
                  Open Attendance Sheet
                </Button>
              </Link>
            </Card>

            <Card>
              <CardHeader
                title="Active Assignments"
                icon={<FileText className="w-5 h-5" />}
                action={<Link to="/homework"><Button variant="ghost" size="sm">View</Button></Link>}
              />
              <div className="space-y-2.5">
                {studentAssignments.length > 0 ? (
                  studentAssignments.map(hw => (
                    <div key={hw.id} className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-xs">
                      <div className="font-semibold text-[var(--text-primary)]">{hw.title}</div>
                      <div className="text-[11px] text-[var(--text-muted)]">Due: {hw.due_date}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[var(--text-muted)] py-4 text-center">No active assignments</div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PARENT & STUDENT DASHBOARD WORKSPACE */}
      {/* ========================================================================= */}
      {(role === 'PARENT' || role === 'STUDENT') && (
        <div className="space-y-6">
          {/* Quick KPI stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <StatCard
              title={t('dashboard.attendance_today')}
              value={`${studentAttendance?.percentage || 98}%`}
              subtitle={`Present: ${studentAttendance?.present_days || 48} / ${studentAttendance?.total_days || 50} days`}
              icon={<CheckSquare className="w-6 h-6" />}
              accentColor="emerald"
            />
            <StatCard
              title={t('dashboard.active_assignments')}
              value={studentAssignments.length}
              subtitle="Pending Homework"
              icon={<FileText className="w-6 h-6" />}
              accentColor="gold"
            />
            <StatCard
              title={t('dashboard.upcoming_exams')}
              value={exams.length}
              subtitle="Term Evaluations"
              icon={<Award className="w-6 h-6" />}
              accentColor="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timetable / Schedule */}
            <Card className="lg:col-span-2">
              <CardHeader
                title="Class Schedule"
                subtitle="Today's timetable and subjects"
                icon={<Clock className="w-5 h-5" />}
                action={
                  <Link to="/timetable">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Full Timetable</Button>
                  </Link>
                }
              />
              {studentTimetable.length > 0 ? (
                <div className="space-y-3">
                  {studentTimetable.map((slot, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                          {slot.period_number || idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-sm text-[var(--text-primary)]">
                            {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            Teacher: {slot.teacher_name || 'Ustadh'} • {slot.start_time} - {slot.end_time}
                          </div>
                        </div>
                      </div>
                      <Badge variant="neutral">Room {slot.room_number || 'A-1'}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState icon={<Clock className="w-6 h-6" />} title="No classes scheduled for today" />
              )}
            </Card>

            {/* Published Examinations & Report Card Action */}
            <Card>
              <CardHeader
                title={t('dashboard.upcoming_exams')}
                icon={<Award className="w-5 h-5" />}
                action={<Link to="/examinations"><Button variant="ghost" size="sm">All</Button></Link>}
              />
              <div className="space-y-3">
                {exams.length > 0 ? (
                  exams.map((ex) => (
                    <div key={ex.id} className="p-3.5 rounded-xl bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-xs text-[var(--text-primary)]">{ex.name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">{ex.term || 'First Term'} • {ex.start_date}</div>
                        </div>
                        <Badge variant={ex.is_published ? 'success' : 'warning'}>
                          {ex.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </div>
                      {ex.is_published && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          leftIcon={<Award className="w-3.5 h-3.5" />}
                          onClick={() => {
                            const studentId = role === 'PARENT' ? activeChild?.id : (user as any)?.student_profile?.id;
                            if (studentId) viewReportCard(studentId, ex.id);
                          }}
                        >
                          View Report Card
                        </Button>
                      )}
                    </div>
                  ))
                ) : (
                  <EmptyState icon={<Award className="w-5 h-5" />} title="No exams scheduled" />
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      {selectedReportCard && (
        <ReportCardModal
          reportCard={selectedReportCard}
          isOpen={!!selectedReportCard}
          onClose={() => setSelectedReportCard(null)}
        />
      )}
    </div>
  );
};
