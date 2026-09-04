import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer } from 'lucide-react';
import { ReportCard } from '../types';
import { Button, Badge } from './ui';

interface ReportCardModalProps {
  reportCard: ReportCard | null;
  isOpen?: boolean;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ reportCard, onClose }) => {
  const { t, i18n } = useTranslation();
  if (!reportCard) return null;

  const isUrdu = i18n.language === 'ur';

  const handlePrint = () => {
    window.print();
  };

  const { student, exam, results, summary } = reportCard;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl p-6 sm:p-8 my-8 text-[var(--text-primary)] print:bg-white print:text-black print:p-0 print:border-none">
        
        {/* Actions Bar (Hidden on Print) */}
        <div className="flex justify-end gap-2 pb-4 print:hidden">
          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            {t('exams.print_report')}
          </Button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[var(--bg-surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Report Card Printable Document */}
        <div className="border-2 border-emerald-700/30 rounded-2xl p-6 bg-[var(--bg-surface-hover)]/40 print:bg-transparent print:border-emerald-800">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-emerald-700/30">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-emerald-800 border-2 border-amber-400 flex items-center justify-center text-amber-300 text-2xl font-serif shadow-md">
                ج
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] print:text-black">
              JAMIA ISLAMIA BHATKAL
            </h2>
            <h3 className="text-lg font-serif text-emerald-600 dark:text-emerald-400 font-bold print:text-emerald-800">
              جامعہ اسلامیہ بھٹکل (کرناٹک)
            </h3>
            <p className="text-xs text-[var(--text-muted)] print:text-slate-600 mt-1">
              Jamia Islamia, Bhatkal, Karnataka, India - 581320
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700/50 text-xs font-bold text-emerald-800 dark:text-emerald-300 print:bg-emerald-100 print:text-emerald-900">
              {exam.name} ({exam.academic_year})
            </div>
          </div>

          {/* Student Credentials Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-emerald-700/30 text-xs">
            <div>
              <span className="text-[var(--text-muted)] block">{t('auth.username')}:</span>
              <strong className="text-[var(--text-primary)] print:text-black text-sm">{student.name}</strong>
              {student.name_urdu && <div className="text-emerald-600 dark:text-emerald-400 font-serif">{student.name_urdu}</div>}
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Admission No:</span>
              <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{student.admission_number}</strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Class & Section:</span>
              <strong className="text-[var(--text-primary)] print:text-black">{student.class_name} - {student.section_name}</strong>
            </div>
            <div>
              <span className="text-[var(--text-muted)] block">Roll No:</span>
              <strong className="text-[var(--text-primary)] print:text-black">{student.roll_number || 'N/A'}</strong>
            </div>
          </div>

          {/* Results Table */}
          <div className="py-4 table-wrapper print:border-none">
            <table className="jamia-table print:text-black">
              <thead>
                <tr>
                  <th>{t('exams.subject')}</th>
                  <th className="text-center">{t('exams.total_marks')}</th>
                  <th className="text-center">Pass</th>
                  <th className="text-center">{t('exams.marks_obtained')}</th>
                  <th className="text-center">{t('exams.grade')}</th>
                  <th>{t('exams.remarks')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((res) => (
                  <tr key={res.subject_id}>
                    <td>
                      <div className="font-semibold">{res.subject_name}</div>
                      {res.subject_name_urdu && (
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-serif print:text-emerald-800">
                          {res.subject_name_urdu}
                        </div>
                      )}
                    </td>
                    <td className="text-center font-mono">{res.total_marks}</td>
                    <td className="text-center font-mono text-[var(--text-muted)]">{res.passing_marks}</td>
                    <td className="text-center font-mono font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                      {res.is_absent ? 'ABSENT' : res.marks_obtained}
                    </td>
                    <td className="text-center">
                      <Badge variant="warning">{res.grade}</Badge>
                    </td>
                    <td className="text-xs text-[var(--text-muted)]">{res.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 flex flex-wrap items-center justify-between gap-4 print:border-black">
            <div>
              <div className="text-xs text-[var(--text-muted)]">Total Marks Obtained</div>
              <div className="text-lg font-bold text-[var(--text-primary)] print:text-black font-mono">
                {summary.total_obtained} / {summary.total_maximum} ({summary.percentage}%)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-muted)]">Final Grade:</span>
              <span className="px-3 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 font-bold text-sm">
                {summary.overall_grade}
              </span>
            </div>

            <div>
              <span className="text-xs text-[var(--text-muted)] block">Assessment:</span>
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 print:text-emerald-800">
                {isUrdu && summary.overall_remarks_urdu ? summary.overall_remarks_urdu : summary.overall_remarks}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 flex justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-subtle)] print:border-black">
            <div className="text-center">
              <div className="w-32 border-b border-[var(--border-strong)] mb-1 mx-auto" />
              <span>Class Teacher</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-[var(--border-strong)] mb-1 mx-auto" />
              <span>Principal / Nazim-e-Talimat</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
