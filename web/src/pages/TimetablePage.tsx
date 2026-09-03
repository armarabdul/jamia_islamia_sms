import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clock, Calendar, BookOpen, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { TimetableSlot } from '../types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'];

export const TimetablePage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, activeChild } = useAuth();
  const role = user?.role || 'STUDENT';
  const isUrdu = i18n.language === 'ur';

  const [schedule, setSchedule] = useState<TimetableSlot[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchedule = async () => {
    setIsLoading(true);
    try {
      if (role === 'STUDENT') {
        const res = await api.get('/timetable/my-schedule/');
        setSchedule(res.data.results || res.data);
      } else if (role === 'PARENT' && activeChild) {
        const res = await api.get(`/timetable/my-schedule/?student_id=${activeChild.id}`);
        setSchedule(res.data.results || res.data);
      } else if (role === 'TEACHER') {
        const res = await api.get('/timetable/my-schedule/');
        setSchedule(res.data.results || res.data);
      } else {
        const params: any = {};
        if (selectedSection) params.section_id = selectedSection;
        const res = await api.get('/timetable/entries/', { params });
        setSchedule(res.data.results || res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'ADMIN') {
      api.get('/academic/classes/').then((res) => {
        const cls = res.data.results || res.data;
        setClasses(cls);
        if (cls.length > 0 && cls[0].sections?.length > 0) {
          setSelectedClass(cls[0].id);
          setSelectedSection(cls[0].sections[0].id);
        }
      });
    }
    fetchSchedule();
  }, [role, activeChild, selectedSection]);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" />
            <span>{t('nav.timetable')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isUrdu 
              ? 'ہفتہ وار تدریسی اوقات نامہ و اسباق کی تقسیم' 
              : 'Weekly classroom timetable periods and teacher schedules.'}
          </p>
        </div>

        {role === 'ADMIN' && classes.length > 0 && (
          <div className="flex gap-2">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                const c = classes.find((cl) => cl.id === e.target.value);
                setSelectedSection(c?.sections?.[0]?.id || '');
              }}
              className="input-field text-xs py-2 w-36"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Schedule Table / Periods Grid */}
      <div className="glass-panel p-5">
        <div className="space-y-4">
          {DAYS.map((dayName, dayIdx) => {
            const daySlots = schedule.filter((s) => s.day_of_week === dayIdx);
            return (
              <div key={dayName} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{dayName}</span>
                </div>

                {daySlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40 hover:border-emerald-500/50 transition-all text-xs"
                      >
                        <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                          <span className="font-mono text-emerald-400 font-bold">Period {slot.period_number}</span>
                          <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                        </div>
                        <div className="font-bold text-white text-sm">
                          {isUrdu ? slot.subject_name_urdu || slot.subject_name : slot.subject_name}
                        </div>
                        <div className="text-[11px] text-slate-300 mt-1 flex items-center justify-between">
                          <span>{slot.teacher_name}</span>
                          <span className="text-slate-400 font-mono">{slot.room_number || 'Room 101'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-1">No scheduled periods for {dayName}.</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
