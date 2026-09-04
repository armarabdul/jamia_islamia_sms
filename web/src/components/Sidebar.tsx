import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CheckSquare, 
  Award, 
  Clock, 
  FileText, 
  Megaphone, 
  MessageSquare, 
  Calendar as CalendarIcon, 
  Library as LibraryIcon, 
  BarChart3, 
  UploadCloud, 
  ShieldCheck, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  // Role-based Nav link definitions
  const adminLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/students', label: t('nav.students'), icon: GraduationCap },
    { to: '/teachers', label: t('nav.teachers'), icon: Users },
    { to: '/classes', label: t('nav.classes'), icon: BookOpen },
    { to: '/attendance', label: t('nav.attendance'), icon: CheckSquare },
    { to: '/examinations', label: t('nav.examinations'), icon: Award },
    { to: '/timetable', label: t('nav.timetable'), icon: Clock },
    { to: '/homework', label: t('nav.homework'), icon: FileText },
    { to: '/announcements', label: t('nav.announcements'), icon: Megaphone },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
    { to: '/calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { to: '/library', label: t('nav.library'), icon: LibraryIcon },
    { to: '/reports', label: t('nav.reports'), icon: BarChart3 },
    { to: '/imports', label: t('nav.import_export'), icon: UploadCloud },
    { to: '/audit-logs', label: t('nav.audit_logs'), icon: ShieldCheck },
  ];

  const teacherLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/attendance', label: t('nav.attendance'), icon: CheckSquare },
    { to: '/examinations', label: t('nav.examinations'), icon: Award },
    { to: '/homework', label: t('nav.homework'), icon: FileText },
    { to: '/timetable', label: t('nav.timetable'), icon: Clock },
    { to: '/students', label: t('nav.students'), icon: GraduationCap },
    { to: '/announcements', label: t('nav.announcements'), icon: Megaphone },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
    { to: '/calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { to: '/library', label: t('nav.library'), icon: LibraryIcon },
  ];

  const studentLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/timetable', label: t('nav.timetable'), icon: Clock },
    { to: '/attendance', label: t('nav.attendance'), icon: CheckSquare },
    { to: '/homework', label: t('nav.homework'), icon: FileText },
    { to: '/examinations', label: t('nav.examinations'), icon: Award },
    { to: '/announcements', label: t('nav.announcements'), icon: Megaphone },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
    { to: '/calendar', label: t('nav.calendar'), icon: CalendarIcon },
    { to: '/library', label: t('nav.library'), icon: LibraryIcon },
  ];

  const parentLinks = [
    { to: '/', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/attendance', label: t('nav.attendance'), icon: CheckSquare },
    { to: '/examinations', label: t('nav.examinations'), icon: Award },
    { to: '/homework', label: t('nav.homework'), icon: FileText },
    { to: '/timetable', label: t('nav.timetable'), icon: Clock },
    { to: '/announcements', label: t('nav.announcements'), icon: Megaphone },
    { to: '/messages', label: t('nav.messages'), icon: MessageSquare },
    { to: '/calendar', label: t('nav.calendar'), icon: CalendarIcon },
  ];

  let links = studentLinks;
  if (role === 'ADMIN') links = adminLinks;
  else if (role === 'TEACHER') links = teacherLinks;
  else if (role === 'PARENT') links = parentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:static inset-y-0 start-0 z-40
        w-64 flex flex-col
        bg-[var(--bg-sidebar)] text-[var(--text-sidebar)]
        border-e border-[var(--border-subtle)]
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 lg:hidden">
          <div className="font-bold text-sm text-emerald-400">Jamia Islamia Menu</div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {role} Portal
          </div>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold
                  transition-all duration-150
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30' 
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4 rtl-mirror opacity-90" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Institutional Footer Stamp */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-300">Jamia Islamia</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Bhatkal, Karnataka • v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
};
