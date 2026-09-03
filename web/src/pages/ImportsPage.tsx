import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UploadCloud, Download, CheckCircle, AlertTriangle, FileText, Check, ShieldCheck, XCircle } from 'lucide-react';
import api from '../services/api';

export const ImportsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [isDryRunning, setIsDryRunning] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitResult, setCommitResult] = useState<any | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setCommitResult(null);
    }
  };

  const handlePreviewDryRun = async () => {
    if (!file) return;
    setIsDryRunning(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/imports/preview-students/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviewData(res.data);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error validating CSV.');
    } finally {
      setIsDryRunning(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.has_errors) return;
    setIsCommitting(true);
    try {
      const res = await api.post('/imports/commit-students/', {
        rows: previewData.preview,
      });
      setCommitResult(res.data);
      setPreviewData(null);
      setFile(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error committing CSV.');
    } finally {
      setIsCommitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <UploadCloud className="w-6 h-6 text-emerald-400" />
            <span>{t('nav.import_export')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'محفوظ اور تصدیق شدہ CSV درآمد و برآمد بمعہ پیشگی معائنہ' 
              : 'Transaction-safe bulk data import and export pipeline with dry-run validation preview.'}
          </p>
        </div>

        <a
          href="/api/v1/imports/export-students/"
          download
          className="btn btn-secondary text-xs py-2.5 px-4"
        >
          <Download className="w-4 h-4" />
          <span>Export All Students CSV</span>
        </a>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel p-6 sm:p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <UploadCloud className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-base font-bold text-white">Upload Student Roster CSV</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
            Expected headers: <code className="text-amber-400">admission_number, first_name, last_name, gender, class_name, section_name, date_of_birth</code>
          </p>
        </div>

        <div className="flex justify-center">
          <label className="btn btn-secondary text-xs py-2.5 px-6 cursor-pointer">
            <FileText className="w-4 h-4" />
            <span>{file ? file.name : 'Select .CSV File'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {file && !previewData && (
          <button
            onClick={handlePreviewDryRun}
            disabled={isDryRunning}
            className="btn btn-primary text-xs py-2.5 px-6 mx-auto"
          >
            <span>{isDryRunning ? 'Validating CSV...' : 'Run Safe Dry-Run Preview'}</span>
          </button>
        )}
      </div>

      {/* Commit Result Banner */}
      {commitResult && (
        <div className="glass-panel p-6 border-emerald-500/50 bg-emerald-950/30 text-center space-y-2 animate-fade-in">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">{commitResult.message}</h3>
          <p className="text-xs text-slate-300 font-mono">
            {commitResult.imported_count} records inserted cleanly with zero errors.
          </p>
        </div>
      )}

      {/* Dry Run Preview Table */}
      {previewData && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Status Bar */}
          <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs">
              <div>
                Total Rows: <strong className="text-white font-mono">{previewData.total_rows}</strong>
              </div>
              <div className="text-emerald-400">
                Valid: <strong className="font-mono">{previewData.valid_count}</strong>
              </div>
              <div className="text-red-400">
                Errors: <strong className="font-mono">{previewData.invalid_count}</strong>
              </div>
            </div>

            <button
              onClick={handleCommit}
              disabled={isCommitting || previewData.has_errors}
              className={`btn text-xs py-2 px-6 ${
                previewData.has_errors
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isCommitting ? 'Importing...' : 'Commit Clean Records to DB'}</span>
            </button>
          </div>

          {previewData.has_errors && (
            <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Validation errors detected. Fix the highlighted errors in your CSV file before committing.</span>
            </div>
          )}

          {/* Preview Table */}
          <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Row</th>
                    <th>Validation</th>
                    <th>Admission No</th>
                    <th>Name</th>
                    <th>Class / Section</th>
                    <th>Gender</th>
                    <th>Errors</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row: any) => (
                    <tr key={row.row_number} className={!row.valid ? 'bg-red-950/20' : ''}>
                      <td className="font-mono text-xs text-slate-400">{row.row_number}</td>
                      <td>
                        {row.valid ? (
                          <span className="badge badge-present text-[10px]">
                            <Check className="w-3 h-3" /> Valid
                          </span>
                        ) : (
                          <span className="badge badge-absent text-[10px]">
                            <XCircle className="w-3 h-3" /> Error
                          </span>
                        )}
                      </td>
                      <td className="font-mono text-amber-400 text-xs font-bold">
                        {row.data.admission_number}
                      </td>
                      <td className="text-xs font-semibold text-white">
                        {row.data.first_name} {row.data.last_name}
                      </td>
                      <td className="text-xs">
                        {row.data.class_name} - {row.data.section_name}
                      </td>
                      <td className="text-xs">{row.data.gender}</td>
                      <td className="text-xs text-red-400">
                        {row.errors?.join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
