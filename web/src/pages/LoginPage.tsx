import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Globe, 
  Lock, 
  User as UserIcon, 
  ShieldAlert, 
  Sparkles, 
  Sun, 
  Moon,
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Card, Button } from '../components/ui';

export const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login, language, changeLanguage } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('JamiaAdmin2026!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isUrdu = language === 'ur';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);
    setIsLoading(false);

    if (success) {
      navigate('/');
    } else {
      setError(t('auth.invalid_credentials'));
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-[var(--bg-app)] relative overflow-hidden transition-colors">
      {/* Background Islamic Geometric Accents */}
      <div className="absolute -top-40 -start-40 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Top Header Utilities */}
      <div className="w-full max-w-md flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-amber-300 font-bold shadow-xs">
            <span className="text-base font-serif">ج</span>
          </div>
          <span className="font-bold text-sm text-[var(--text-primary)]">Jamia Islamia</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] shadow-xs transition-all"
            title="Toggle theme"
          >
            {resolvedTheme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] shadow-xs transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-lg border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 animate-fade-in">
        {/* Institution Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-300 text-3xl font-serif shadow-lg shadow-emerald-900/20 mb-3">
            ج
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {isUrdu ? 'جامعہ اسلامیہ' : 'Jamia Islamia'}
          </h1>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
            {isUrdu ? 'بھٹکل، کرناٹک' : 'Bhatkal, Karnataka'}
          </p>
          <div className="mt-2 text-xs text-[var(--text-muted)]">
            {t('auth.login_subtitle')}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="form-label">
              {t('auth.username')}
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input ps-9"
                placeholder="e.g. admin, teacher_ahmed"
              />
              <UserIcon className="w-4 h-4 text-[var(--text-muted)] absolute start-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="form-label">
              {t('auth.password')}
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input ps-9"
              />
              <Lock className="w-4 h-4 text-[var(--text-muted)] absolute start-3 top-3.5" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
          >
            {t('auth.sign_in_button')}
          </Button>
        </form>

        {/* Quick Demo Credentials */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <div className="text-[11px] font-bold text-[var(--text-muted)] mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{t('auth.demo_accounts')}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('admin', 'JamiaAdmin2026!')}
              className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-start transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">admin</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('teacher_ahmed', 'JamiaPass2026!')}
              className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] hover:border-emerald-500/40 text-start transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-3 h-3" />
                <span>Teacher</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">teacher_ahmed</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('parent_tariq', 'JamiaPass2026!')}
              className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] hover:border-amber-500/40 text-start transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <Users className="w-3 h-3" />
                <span>Parent</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">parent_tariq</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('student_zaid', 'JamiaPass2026!')}
              className="p-2.5 rounded-xl bg-[var(--bg-surface-hover)] hover:bg-[var(--bg-surface-active)] border border-[var(--border-subtle)] hover:border-amber-500/40 text-start transition-all"
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <GraduationCap className="w-3 h-3" />
                <span>Student</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">student_zaid</div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};
