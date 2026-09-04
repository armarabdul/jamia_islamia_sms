import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

interface AppHeaderProps {
  userRole?: string;
  isUrdu: boolean;
  onToggleLanguage: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  userRole,
  isUrdu,
  onToggleLanguage,
  onOpenSettings,
  onLogout,
}) => {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.bgSurface,
          borderBottomColor: theme.colors.borderSubtle,
        },
      ]}
    >
      {/* Brand Identity */}
      <View style={styles.brandRow}>
        <View style={[styles.logoBadge, { backgroundColor: theme.colors.primaryDark }]}>
          <Text style={styles.logoText}>ج</Text>
        </View>
        <View style={{ marginLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
              {isUrdu ? 'جامعہ اسلامیہ' : 'Jamia Islamia'}
            </Text>
            {userRole && (
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: theme.colors.primaryBg, borderColor: theme.colors.borderAccent },
                ]}
              >
                <Text style={[styles.roleText, { color: theme.colors.primary }]}>
                  {userRole}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: theme.colors.primary }]}>
            {isUrdu ? 'بھٹکل، کرناٹک' : 'Bhatkal, Karnataka'}
          </Text>
        </View>
      </View>

      {/* Right Controls */}
      <View style={styles.controlsRow}>
        {/* Theme Toggle Button */}
        <TouchableOpacity
          onPress={toggleTheme}
          style={[styles.iconBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
          accessibilityLabel="Toggle Theme"
        >
          <Text style={styles.btnIcon}>{mode === 'light' ? '🌙' : '☀️'}</Text>
        </TouchableOpacity>

        {/* Language Toggle */}
        <TouchableOpacity
          onPress={onToggleLanguage}
          style={[styles.langBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
        >
          <Text style={[styles.langText, { color: theme.colors.textPrimary }]}>
            {isUrdu ? 'English' : 'اردو'}
          </Text>
        </TouchableOpacity>

        {/* Settings Button */}
        <TouchableOpacity
          onPress={onOpenSettings}
          style={[styles.iconBtn, { backgroundColor: theme.colors.bgSurfaceElevated, borderColor: theme.colors.borderSubtle }]}
          accessibilityLabel="Settings"
        >
          <Text style={styles.btnIcon}>⚙️</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        {onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            style={[styles.iconBtn, { backgroundColor: theme.colors.errorBg, borderColor: theme.colors.error }]}
            accessibilityLabel="Sign Out"
          >
            <Text style={{ fontSize: 13, color: theme.colors.error }}>🚪</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  logoText: {
    color: '#fbbf24',
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
    borderWidth: 1,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnIcon: {
    fontSize: 14,
  },
  langBtn: {
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
