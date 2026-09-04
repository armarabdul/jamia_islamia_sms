import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface StatusPillProps {
  label: string;
  status?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PENDING' | 'SUCCESS' | 'INFO';
  style?: ViewStyle;
}

export const StatusPill: React.FC<StatusPillProps> = ({ label, status = 'INFO', style }) => {
  const { theme } = useTheme();

  const getColors = () => {
    switch (status) {
      case 'PRESENT':
      case 'SUCCESS':
        return { bg: theme.colors.successBg, text: theme.colors.success, border: theme.colors.success };
      case 'ABSENT':
        return { bg: theme.colors.errorBg, text: theme.colors.error, border: theme.colors.error };
      case 'LATE':
      case 'PENDING':
        return { bg: theme.colors.warningBg, text: theme.colors.warning, border: theme.colors.warning };
      case 'EXCUSED':
        return { bg: theme.colors.infoBg, text: theme.colors.info, border: theme.colors.info };
      default:
        return { bg: theme.colors.bgSurfaceElevated, text: theme.colors.textSecondary, border: theme.colors.borderSubtle };
    }
  };

  const c = getColors();

  return (
    <View style={[styles.pill, { backgroundColor: c.bg, borderColor: c.border }, style]}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
});
