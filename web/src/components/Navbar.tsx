import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Bell, 
  LogOut, 
  User as UserIcon, 
  Users, 
  BookOpen, 
  ChevronDown, 
  Menu, 
  X,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, language, changeLanguage, activeChild, setActiveChild, parentChildren } = useAuth();
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Side: Brand Logo & Hamburger */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 lg:hidden"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center text-amber-300 font-bold shadow-lg shadow-emerald-900/40 border border-emerald-400/30">
              <span className="text-xl font-serif">ج</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  {isUrdu ? 'جامعہ اسلامیہ بھٹکل' : 'Jamia Islamia'}
                </h1>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-medium">
                  {user?.role || 'Guest'}
                </span>
              </div>
              <p className="text-xs text-emerald-400/80 hidden sm:block">
                {isUrdu ? 'نوایت کالونی، بھٹکل' : 'Nawayath Colony, Bhatkal'}
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium hover:bg-amber-500/20 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>
                  {activeChild 
                    ? (isUrdu ? activeChild.full_name_urdu || activeChild.full_name : activeChild.full_name) 
                    : t('nav.switch_child')}
                </span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {showChildMenu && (
                <div className="absolute end-0 mt-2 w-56 rounded-xl bg-slate-900 border border-white/10 shadow-2xl p-2 z-50 animate-fade-in">
                  <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
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
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <div>
                        <div>{isUrdu ? child.full_name_urdu || child.full_name : child.full_name}</div>
                        <div className="text-[10px] opacity-75">{child.current_enrollment?.class_name || ''}</div>
                      </div>
                      {activeChild?.id === child.id && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bilingual Language Switcher */}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
            title="Switch Language (Urdu / English)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isUrdu ? 'English' : 'اردو'}</span>
          </button>

          {/* Notification Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.some(n => !n.is_read) && (
                <span className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute end-0 mt-2 w-80 rounded-xl bg-slate-900/95 border border-white/10 shadow-2xl p-3 z-50 backdrop-blur-xl animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 text-xs font-semibold text-slate-300">
                  <span>{isUrdu ? 'اطلاعات و اعلانات' : 'Notifications'}</span>
                  <span className="text-[11px] text-emerald-400">Jamia Alerts</span>
                </div>
                <div className="divide-y divide-white/5 max-h-64 overflow-y-auto mt-2">
                  {unreadNotifs.length > 0 ? (
                    unreadNotifs.map((n) => (
                      <div key={n.id} className="py-2 px-1 text-xs">
                        <div className="font-semibold text-slate-200">
                          {isUrdu ? n.title_urdu || n.title : n.title}
                        </div>
                        <div className="text-slate-400 text-[11px] mt-0.5 line-clamp-2">
                          {isUrdu ? n.body_urdu || n.body : n.body}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {isUrdu ? 'کوئی نئی اطلاع نہیں ہے' : 'No new notifications'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Logout */}
          <div className="flex items-center gap-2 ps-2 border-s border-white/10">
            <div className="hidden md:flex flex-col text-end">
              <span className="text-xs font-semibold text-white">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </span>
              <span className="text-[10px] text-slate-400 capitalize">
                {user?.role?.toLowerCase() || ''}
              </span>
            </div>
            
            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title={t('nav.logout')}
            >
              <LogOut className="w-4 h-4 rtl-flip" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
