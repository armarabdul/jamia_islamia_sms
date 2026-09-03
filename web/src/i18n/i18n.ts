import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';

const savedLanguage = localStorage.getItem('jamia_language') || 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

// Update document direction on initial load
const updateLayoutDirection = (lang: string) => {
  const isRtl = lang === 'ur';
  document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
};

updateLayoutDirection(savedLanguage);

i18n.on('languageChanged', (lang) => {
  localStorage.setItem('jamia_language', lang);
  updateLayoutDirection(lang);
});

export default i18n;
