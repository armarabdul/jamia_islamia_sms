import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Lock, User as UserIcon, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login, language, changeLanguage } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 relative overflow-hidden">
      
      {/* Background Islamic Accents */}
      <div className="absolute -top-40 -start-40 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -end-40 w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        
        {/* Language switch */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => changeLanguage(language === 'en' ? 'ur' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'en' ? 'اردو' : 'English'}</span>
          </button>
        </div>

        {/* Card Container */}
        <div className="glass-panel-glow p-6 sm:p-8">
          
          {/* Institution Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-900 border border-amber-400/40 mx-auto flex items-center justify-center text-amber-300 text-3xl font-serif shadow-xl shadow-emerald-950 mb-3">
              ج
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isUrdu ? 'جامعہ اسلامیہ بھٹکل' : 'Jamia Islamia'}
            </h1>
            <p className="text-xs text-emerald-400 font-medium mt-0.5">
              {isUrdu ? 'نوایت کالونی، بھٹکل، کرناٹک' : 'Nawayath Colony, Bhatkal, Karnataka'}
            </p>
            <div className="mt-2 text-xs text-slate-400">
              {t('auth.login_subtitle')}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.username')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="input-field ps-9"
                  placeholder="e.g. admin, teacher_ahmed"
                />
                <UserIcon className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field ps-9"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-2.5 text-sm mt-2"
            >
              {isLoading ? t('common.loading') : t('auth.sign_in_button')}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{t('auth.demo_accounts')}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'JamiaAdmin2026!')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-start hover:border-emerald-500/30 transition-all"
              >
                <div className="font-semibold text-emerald-400">Administrator</div>
                <div className="text-[10px] text-slate-400">admin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('teacher_ahmed', 'JamiaPass2026!')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-start hover:border-emerald-500/30 transition-all"
              >
                <div className="font-semibold text-emerald-400">Teacher</div>
                <div className="text-[10px] text-slate-400">teacher_ahmed</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('parent_tariq', 'JamiaPass2026!')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-start hover:border-emerald-500/30 transition-all"
              >
                <div className="font-semibold text-amber-400">Parent</div>
                <div className="text-[10px] text-slate-400">parent_tariq</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('student_zaid', 'JamiaPass2026!')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-start hover:border-emerald-500/30 transition-all"
              >
                <div className="font-semibold text-amber-400">Student</div>
                <div className="text-[10px] text-slate-400">student_zaid</div>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
