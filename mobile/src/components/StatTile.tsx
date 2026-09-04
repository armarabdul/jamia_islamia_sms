import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { AppCard } from './AppCard';

interface StatTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconText: string;
  accentColor?: 'emerald' | 'gold' | 'blue' | 'purple';
}

export const StatTile: React.FC<StatTileProps> = ({
  title,
  value,
  subtitle,
  iconText,
  accentColor = 'emerald',
}) => {
  const { theme } = useTheme();

  const getAccentColors = () => {
    switch (accentColor) {
      case 'gold':
        return { bg: theme.colors.goldBg, text: theme.colors.gold };
      case 'blue':
        return { bg: theme.colors.infoBg, text: theme.colors.info };
      case 'purple':
        return { bg: 'rgba(168, 85, 247, 0.15)', text: '#a855f7' };
      default:
        return { bg: theme.colors.primaryBg, text: theme.colors.primary };
    }
  };

  const accent = getAccentColors();

  return (
    <AppCard style={styles.tile}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.colors.textMuted }]}>{title}</Text>
          <Text style={[styles.value, { color: theme.colors.textPrimary }]}>{value}</Text>
        </View>
        <View style={[styles.iconBox, { backgroundColor: accent.bg }]}>
          <Text style={styles.iconText}>{iconText}</Text>
        </View>
      </View>
      {subtitle && (
        <View style={[styles.footer, { borderTopColor: theme.colors.borderSubtle }]}>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 140,
    marginHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
  },
  footer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
  },
});
