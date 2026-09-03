import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpen, Users, Plus, Award } from 'lucide-react';
import api from '../services/api';
import { ClassRoom, Subject } from '../types';

export const ClassesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language === 'ur';

  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    api.get('/academic/classes/').then((res) => setClasses(res.data.results || res.data));
    api.get('/academic/subjects/').then((res) => setSubjects(res.data.results || res.data));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-emerald-400" />
          <span>{t('nav.classes')}</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {isUrdu 
            ? 'جامعہ اسلامیہ کے تعلیمی درجات، شعبہ جات اور نصابی مضامین' 
            : 'Academic grade levels, section capacities, class teachers, and subject curriculum.'}
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <div key={cls.id} className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">{cls.name}</h2>
                {cls.name_urdu && (
                  <div className="text-xs text-emerald-400 font-serif">{cls.name_urdu}</div>
                )}
              </div>
              <span className="badge badge-gold text-[10px]">Level {cls.numeric_level}</span>
            </div>

            <div className="pt-2 border-t border-white/5 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Sections ({cls.sections?.length || 0})
              </div>
              <div className="grid grid-cols-2 gap-2">
                {cls.sections?.map((sec) => (
                  <div key={sec.id} className="p-2.5 rounded-lg bg-white/5 text-xs">
                    <div className="font-bold text-emerald-400">Section {sec.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Capacity: {sec.capacity}</div>
                    {sec.teacher_name && (
                      <div className="text-[10px] text-slate-300 mt-0.5">In-charge: {sec.teacher_name}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Curriculum Subjects */}
      <div className="glass-panel p-6 space-y-4">
        <h2 className="text-sm font-bold text-white">Curriculum Subjects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {subjects.map((sub) => (
            <div key={sub.id} className="p-3 rounded-lg bg-slate-900/60 border border-white/5 text-xs">
              <div className="font-bold text-white">{sub.name}</div>
              {sub.name_urdu && (
                <div className="text-emerald-400 font-serif text-[11px]">{sub.name_urdu}</div>
              )}
              <div className="flex items-center justify-between text-slate-400 text-[10px] mt-2">
                <span className="font-mono">{sub.code}</span>
                <span>{sub.credit_hours} Periods/wk</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
