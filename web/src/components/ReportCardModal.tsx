import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Printer, Award, CheckCircle2, AlertCircle } from 'lucide-react';
import { ReportCard } from '../types';

interface ReportCardModalProps {
  reportCard: ReportCard | null;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-2xl p-6 sm:p-8 my-8 text-slate-100 print:bg-white print:text-black print:p-0 print:border-none">
        
        {/* Close Button (Hidden on Print) */}
        <div className="flex justify-end gap-2 pb-4 print:hidden">
          <button
            onClick={handlePrint}
            className="btn btn-primary text-xs py-2 px-4"
          >
            <Printer className="w-4 h-4" />
            <span>{t('exams.print_report')}</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Official Report Card Printable Document */}
        <div className="border-2 border-emerald-800/40 rounded-xl p-6 bg-slate-950/60 print:bg-transparent print:border-emerald-800">
          
          {/* Header */}
          <div className="text-center pb-6 border-b border-emerald-800/40">
            <div className="flex justify-center mb-2">
              <div className="w-14 h-14 rounded-full bg-emerald-900/60 border-2 border-amber-400 flex items-center justify-center text-amber-300 text-2xl font-serif">
                ج
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white print:text-black">
              JAMIA ISLAMIA BHATKAL
            </h2>
            <h3 className="text-lg font-serif text-emerald-400 font-bold print:text-emerald-800">
              جامعہ اسلامیہ بھٹکل (کرناٹک)
            </h3>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-1">
              Nawayath Colony, Bhatkal, Karnataka, India - 581320
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-950 border border-emerald-700/50 text-xs font-semibold text-emerald-300 print:bg-emerald-100 print:text-emerald-900">
              {exam.name} ({exam.academic_year})
            </div>
          </div>

          {/* Student Credentials Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-emerald-800/40 text-xs">
            <div>
              <span className="text-slate-400 block">{t('auth.username')}:</span>
              <strong className="text-white print:text-black text-sm">{student.name}</strong>
              {student.name_urdu && <div className="text-emerald-400 font-serif">{student.name_urdu}</div>}
            </div>
            <div>
              <span className="text-slate-400 block">Admission No:</span>
              <strong className="text-amber-400 font-mono text-sm">{student.admission_number}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Class & Section:</span>
              <strong className="text-white print:text-black">{student.class_name} - {student.section_name}</strong>
            </div>
            <div>
              <span className="text-slate-400 block">Roll No:</span>
              <strong className="text-white print:text-black">{student.roll_number || 'N/A'}</strong>
            </div>
          </div>

          {/* Results Table */}
          <div className="py-4 overflow-x-auto">
            <table className="custom-table print:text-black">
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
                        <div className="text-xs text-emerald-400/90 font-serif print:text-emerald-800">
                          {res.subject_name_urdu}
                        </div>
                      )}
                    </td>
                    <td className="text-center font-mono">{res.total_marks}</td>
                    <td className="text-center font-mono text-slate-400">{res.passing_marks}</td>
                    <td className="text-center font-mono font-bold text-emerald-400 print:text-black">
                      {res.is_absent ? 'ABSENT' : res.marks_obtained}
                    </td>
                    <td className="text-center">
                      <span className="badge badge-gold font-mono">{res.grade}</span>
                    </td>
                    <td className="text-xs text-slate-400">{res.remarks || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Performance Summary Banner */}
          <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex flex-wrap items-center justify-between gap-4 print:border-black">
            <div>
              <div className="text-xs text-slate-400">Total Marks Obtained</div>
              <div className="text-lg font-bold text-white print:text-black font-mono">
                {summary.total_obtained} / {summary.total_maximum} ({summary.percentage}%)
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Final Grade:</span>
              <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-sm">
                {summary.overall_grade}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">Assessment:</span>
              <span className="text-xs font-semibold text-emerald-400 print:text-emerald-800">
                {isUrdu && summary.overall_remarks_urdu ? summary.overall_remarks_urdu : summary.overall_remarks}
              </span>
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-12 pt-6 flex justify-between text-xs text-slate-400 border-t border-white/10 print:border-black">
            <div className="text-center">
              <div className="w-32 border-b border-slate-600 mb-1" />
              <span>Class Teacher</span>
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-600 mb-1" />
              <span>Principal / Nazim-e-Talimat</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
