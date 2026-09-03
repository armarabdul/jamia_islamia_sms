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
  User as UserProfileIcon
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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 start-0 z-50 w-64 flex flex-col border-e border-white/10 bg-slate-900/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-white/10 text-center">
          <div className="text-[11px] font-medium text-emerald-400">
            Jamia Islamia Bhatkal
          </div>
          <div className="text-[10px] text-slate-500">
            v1.0.0 Production Core
          </div>
        </div>
      </aside>
    </>
  );
};
