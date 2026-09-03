import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Users, CheckSquare, Award } from 'lucide-react';
import api from '../services/api';

export const ReportsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [analytics, setAnalytics] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    api.get('/reports/attendance-analytics/').then((res) => {
      setAnalytics(res.data.classes_attendance || []);
    });
    api.get('/reports/dashboard-overview/').then((res) => {
      setKpis(res.data.kpis);
    });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.reports')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu 
            ? 'جامعہ اسلامیہ کی مجموعی تعلیمی و تنظیمی کارکردگی کا تجزیاتی خلاصہ' 
            : 'Institutional attendance statistics, section trends, and performance metrics.'}
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5">
            <div className="text-xs text-slate-400 font-semibold">Total Students Enrolled</div>
            <div className="text-3xl font-bold text-white font-mono mt-1">{kpis.total_students}</div>
          </div>
          <div className="glass-panel p-5">
            <div className="text-xs text-slate-400 font-semibold">Active Teachers & Staff</div>
            <div className="text-3xl font-bold text-emerald-400 font-mono mt-1">{kpis.total_teachers}</div>
          </div>
          <div className="glass-panel p-5">
            <div className="text-xs text-slate-400 font-semibold">Today's Attendance Rate</div>
            <div className="text-3xl font-bold text-amber-400 font-mono mt-1">{kpis.attendance_today_percentage}%</div>
          </div>
        </div>
      )}

      {/* Class Attendance Breakdown */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Class-wise Attendance Analysis</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.map((cls) => (
            <div key={cls.class_id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{cls.class_name}</span>
                {cls.class_name_urdu && (
                  <span className="text-emerald-400 font-serif text-xs">{cls.class_name_urdu}</span>
                )}
              </div>

              <div className="space-y-2">
                {cls.sections?.map((sec: any) => (
                  <div key={sec.section_id} className="space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Section {sec.section_name}</span>
                      <span className="font-mono font-bold text-emerald-400">{sec.attendance_percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${sec.attendance_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
