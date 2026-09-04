import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Bell, 
  LogOut, 
  Users, 
  ChevronDown, 
  Menu, 
  CheckCircle,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { t } = useTranslation();
  const { user, logout, language, changeLanguage, activeChild, setActiveChild, parentChildren } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [unreadNotifs, setUnreadNotifs] = useState<any[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showChildMenu, setShowChildMenu] = useState(false);

  const isUrdu = language === 'ur';

  useEffect(() => {
    if (user) {
      api.get('/notifications/')
        .then((res) => {
          const list = res.data.results || res.data;
          setUnreadNotifs(list.slice(0, 5));
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleLang = () => {
    const nextLang = language === 'en' ? 'ur' : 'en';
    changeLanguage(nextLang);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo & Hamburger */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] lg:hidden transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-amber-300 font-bold shadow-md shadow-emerald-900/20 border border-emerald-500/30">
              <span className="text-xl font-serif">ج</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-[var(--text-primary)] text-base sm:text-lg tracking-tight">
                  {isUrdu ? 'جامعہ اسلامیہ' : 'Jamia Islamia'}
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 font-semibold uppercase">
                  {user?.role || 'Guest'}
                </span>
              </div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium hidden sm:block">
                {isUrdu ? 'بھٹکل، کرناٹک' : 'Bhatkal, Karnataka'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Parent Portal: Multi-Child Switcher */}
          {user?.role === 'PARENT' && parentChildren.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setShowChildMenu(!showChildMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs font-semibold hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-all shadow-xs"
              >
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>
                  {activeChild 
                    ? (isUrdu ? activeChild.full_name_urdu || activeChild.full_name : activeChild.full_name) 
                    : t('nav.switch_child')}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showChildMenu && (
                <div className="absolute end-0 mt-2 w-60 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-2 z-50 animate-fade-in">
                  <div className="text-[11px] font-bold text-[var(--text-muted)] px-2 py-1 uppercase tracking-wider">
                    {t('nav.switch_child')}
                  </div>
                  {parentChildren.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        setActiveChild(child);
                        setShowChildMenu(false);
                      }}
                      className={`w-full text-start flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        activeChild?.id === child.id
                          ? 'bg-emerald-600 text-white font-semibold'
                          : 'text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                      }`}
                    >
                      <div>
                        <div className="font-semibold">{isUrdu ? child.full_name_urdu || child.full_name : child.full_name}</div>
                        <div className={`text-[10px] ${activeChild?.id === child.id ? 'text-emerald-100' : 'text-[var(--text-muted)]'}`}>
                          {child.current_enrollment?.class_name || ''} ({child.admission_number})
                        </div>
                      </div>
                      {activeChild?.id === child.id && <CheckCircle className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Theme Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] transition-colors shadow-xs"
            title={`Switch to ${resolvedTheme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {resolvedTheme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-active)] text-xs font-semibold transition-all shadow-xs"
            title="Switch Language (Urdu / English)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.some(n => !n.is_read) && (
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute end-0 mt-2 w-80 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl p-3 z-50 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)]">
                  <span>{isUrdu ? 'اطلاعات و اعلانات' : 'Notifications'}</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Jamia Alerts</span>
                </div>
                <div className="divide-y divide-[var(--border-subtle)] max-h-64 overflow-y-auto mt-2">
                  {unreadNotifs.length > 0 ? (
                    unreadNotifs.map((n) => (
                      <div key={n.id} className="py-2.5 px-1 text-xs">
                        <div className="font-semibold text-[var(--text-primary)]">
                          {isUrdu ? n.title_urdu || n.title : n.title}
                        </div>
                        <div className="text-[var(--text-muted)] text-[11px] mt-0.5 line-clamp-2">
                          {isUrdu ? n.body_urdu || n.body : n.body}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-[var(--text-muted)]">
                      {isUrdu ? 'کوئی نئی اطلاع نہیں ہے' : 'No new notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 ps-2 border-s border-[var(--border-subtle)]">
            <div className="hidden md:flex flex-col text-end">
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </span>
              <span className="text-[10px] text-[var(--text-muted)] capitalize">
                {user?.role?.toLowerCase() || ''}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4 rtl-mirror" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
