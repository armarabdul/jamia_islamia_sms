import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon, Award, Star, Clock } from 'lucide-react';
import api from '../services/api';

export const CalendarPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/calendar/events/').then((res) => setEvents(res.data.results || res.data));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.calendar')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu 
            ? 'جامعہ اسلامیہ کی سالانہ تعلیمی تقویم، امتحانی تاریخیں اور تعطیلات' 
            : 'Academic milestones, term examinations, and institutional holidays.'}
        </p>
      </div>

      {/* Events Timeline List */}
      <div className="glass-panel p-6 space-y-4">
        <div className="divide-y divide-white/5">
          {events.map((ev) => (
            <div key={ev.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`badge ${ev.is_holiday ? 'badge-absent' : 'badge-gold'} text-[10px]`}>
                    {ev.event_type_display}
                  </span>
                  <h2 className="font-bold text-white text-sm">{ev.title}</h2>
                </div>
                {ev.title_urdu && (
                  <div className="text-xs text-emerald-400 font-serif">{ev.title_urdu}</div>
                )}
                {ev.description && (
                  <p className="text-slate-300 text-xs mt-1">{ev.description}</p>
                )}
              </div>

              <div className="text-end shrink-0 font-mono text-xs text-emerald-400 font-semibold">
                {ev.start_date} {ev.end_date !== ev.start_date ? `to ${ev.end_date}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
