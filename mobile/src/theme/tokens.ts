export interface ColorTokens {
  bgApp: string;
  bgSurface: string;
  bgSurfaceElevated: string;
  bgSurfaceHover: string;
  
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryBg: string;
  
  gold: string;
  goldLight: string;
  goldDark: string;
  goldBg: string;
  
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  borderSubtle: string;
  borderDefault: string;
  borderStrong: string;
  borderAccent: string;
  
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  info: string;
  infoBg: string;
  
  shadowColor: string;
}

export interface ThemeTokens {
  colors: ColorTokens;
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  radii: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    title: number;
  };
}

export const lightColors: ColorTokens = {
  bgApp: '#f8fafc',
  bgSurface: '#ffffff',
  bgSurfaceElevated: '#f1f5f9',
  bgSurfaceHover: '#e2e8f0',
  
  primary: '#059669',
  primaryLight: '#10b981',
  primaryDark: '#047857',
  primaryBg: '#ecfdf5',
  
  gold: '#d97706',
  goldLight: '#f59e0b',
  goldDark: '#b45309',
  goldBg: '#fffbeb',
  
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textInverse: '#ffffff',
  
  borderSubtle: '#e2e8f0',
  borderDefault: '#cbd5e1',
  borderStrong: '#94a3b8',
  borderAccent: 'rgba(5, 150, 105, 0.3)',
  
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  error: '#ef4444',
  errorBg: '#fef2f2',
  info: '#3b82f6',
  infoBg: '#eff6ff',
  
  shadowColor: '#000000',
};

export const darkColors: ColorTokens = {
  bgApp: '#090d16',
  bgSurface: '#0f172a',
  bgSurfaceElevated: '#162032',
  bgSurfaceHover: '#1e293b',
  
  primary: '#10b981',
  primaryLight: '#34d399',
  primaryDark: '#059669',
  primaryBg: 'rgba(16, 185, 129, 0.15)',
  
  gold: '#f59e0b',
  goldLight: '#fbbf24',
  goldDark: '#d97706',
  goldBg: 'rgba(245, 158, 11, 0.15)',
  
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#94a3b8',
  textInverse: '#0f172a',
  
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  borderDefault: 'rgba(255, 255, 255, 0.14)',
  borderStrong: 'rgba(255, 255, 255, 0.22)',
  borderAccent: 'rgba(16, 185, 129, 0.35)',
  
  success: '#34d399',
  successBg: 'rgba(16, 185, 129, 0.15)',
  warning: '#fbbf24',
  warningBg: 'rgba(245, 158, 11, 0.15)',
  error: '#f87171',
  errorBg: 'rgba(239, 68, 68, 0.15)',
  info: '#60a5fa',
  infoBg: 'rgba(59, 130, 246, 0.15)',
  
  shadowColor: '#000000',
};

const commonSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const commonRadii = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const commonTypography = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  title: 28,
};

export const lightTheme: ThemeTokens = {
  colors: lightColors,
  spacing: commonSpacing,
  radii: commonRadii,
  typography: commonTypography,
};

export const darkTheme: ThemeTokens = {
  colors: darkColors,
  spacing: commonSpacing,
  radii: commonRadii,
  typography: commonTypography,
};
