import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, User, FileText, Download, GraduationCap, Phone, MapPin } from 'lucide-react';
import api from '../services/api';
import { Student } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const StudentsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const isUrdu = i18n.language === 'ur';

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [enrollmentHistory, setEnrollmentHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (search) params.search = search;
      if (selectedClass) params.class_id = selectedClass;
      const res = await api.get('/students/', { params });
      setStudents(res.data.results || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    api.get('/academic/classes/').then((res) => {
      setClasses(res.data.results || res.data);
    });
    fetchStudents();
  }, [selectedClass]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const viewEnrollmentHistory = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const res = await api.get(`/students/${student.id}/enrollment_history/`);
      setEnrollmentHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <span>{t('nav.students')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu ? 'جامعہ اسلامیہ میں زیرِ تعلیم طلبہ کرام کا ریکارڈ' : 'Comprehensive directory and academic records for Jamia Islamia students.'}
          </p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex gap-2">
            <a
              href="/api/v1/imports/export-students/"
              className="btn btn-secondary text-xs py-2 px-3"
              download
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isUrdu ? 'نام یا داخلہ نمبر تلاش کریں...' : 'Search by name or admission no...'}
            className="input-field ps-9 text-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute start-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="input-field text-xs py-2"
          >
            <option value="">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {isUrdu ? cls.name_urdu || cls.name : cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Directory Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Admission No</th>
                <th>Student Name</th>
                <th>Class & Section</th>
                <th>Roll No</th>
                <th>Emergency Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    {t('common.loading')}
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st.id}>
                    <td className="font-mono font-bold text-amber-400 text-xs">
                      {st.admission_number}
                    </td>
                    <td>
                      <div className="font-semibold text-white text-xs">{st.full_name}</div>
                      {st.full_name_urdu && (
                        <div className="text-[11px] text-emerald-400 font-serif">{st.full_name_urdu}</div>
                      )}
                    </td>
                    <td className="text-xs">
                      {st.current_enrollment?.class_name} - {st.current_enrollment?.section_name}
                    </td>
                    <td className="text-xs font-mono">
                      {st.current_enrollment?.roll_number || '-'}
                    </td>
                    <td className="text-xs text-slate-400">
                      {st.emergency_contact_phone || '-'}
                    </td>
                    <td>
                      <span className="badge badge-present text-[10px]">
                        {st.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => viewEnrollmentHistory(st)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 text-xs flex items-center gap-1"
                        title="Enrollment History"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>History</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    {t('common.no_data')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment History Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h3 className="text-sm font-bold text-white">Enrollment History</h3>
                <div className="text-xs text-emerald-400">{selectedStudent.full_name} ({selectedStudent.admission_number})</div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-white/5 mt-4 max-h-64 overflow-y-auto">
              {enrollmentHistory.map((h) => (
                <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{h.class_name} - Section {h.section_name}</div>
                    <div className="text-[11px] text-slate-400">{h.academic_year_name}</div>
                  </div>
                  <span className={`badge ${h.is_active ? 'badge-present' : 'badge-gold'}`}>
                    {h.is_active ? 'Current Active' : 'Completed'}
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
