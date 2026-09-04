import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ children, style, elevated = false }) => {
  const { theme, mode } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? theme.colors.bgSurfaceElevated : theme.colors.bgSurface,
          borderColor: theme.colors.borderSubtle,
          borderRadius: theme.radii.lg,
          shadowColor: theme.colors.shadowColor,
          shadowOpacity: mode === 'dark' ? 0.4 : 0.06,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    marginVertical: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
});
