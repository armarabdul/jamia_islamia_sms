import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import { User, Student } from '../types';

interface AuthContextType {
  user: User | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  language: string;
  changeLanguage: (lang: string) => void;
  activeChild: Student | null;
  setActiveChild: (student: Student | null) => void;
  parentChildren: Student[];
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChild, setActiveChild] = useState<Student | null>(null);
  const [parentChildren, setParentChildren] = useState<Student[]>([]);

  const language = i18n.language || 'en';

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    if (user) {
      api.patch('/auth/me/', { language_preference: lang }).catch(() => {});
    }
  };

  const loadProfile = async () => {
    try {
      const storedUser = localStorage.getItem('jamia_user');
      const token = localStorage.getItem('jamia_access_token');
      if (token && storedUser) {
        setUser(JSON.parse(storedUser));
        const res = await api.get('/auth/me/');
        setUser(res.data);
        localStorage.setItem('jamia_user', JSON.stringify(res.data));

        if (res.data.role === 'PARENT') {
          const childrenRes = await api.get('/parents/my-children/');
          const childrenList = childrenRes.data.results || childrenRes.data;
          setParentChildren(childrenList);
          if (childrenList.length > 0 && !activeChild) {
            setActiveChild(childrenList[0]);
          }
        }
      }
    } catch (err) {
      console.error('Session load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('jamia_access_token', access);
      localStorage.setItem('jamia_refresh_token', refresh);
      localStorage.setItem('jamia_user', JSON.stringify(userData));
      setUser(userData);

      if (userData.language_preference) {
        changeLanguage(userData.language_preference);
      }

      if (userData.role === 'PARENT') {
        const childrenRes = await api.get('/parents/my-children/');
        const childrenList = childrenRes.data.results || childrenRes.data;
        setParentChildren(childrenList);
        if (childrenList.length > 0) {
          setActiveChild(childrenList[0]);
        }
      }

      return true;
    } catch (err) {
      return false;
    }
  };

  const logout = () => {
    const refresh = localStorage.getItem('jamia_refresh_token');
    if (refresh) {
      api.post('/auth/logout/', { refresh }).catch(() => {});
    }
    localStorage.removeItem('jamia_access_token');
    localStorage.removeItem('jamia_refresh_token');
    localStorage.removeItem('jamia_user');
    setUser(null);
    setActiveChild(null);
    setParentChildren([]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        language,
        changeLanguage,
        activeChild,
        setActiveChild,
        parentChildren,
        refreshUserData: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
