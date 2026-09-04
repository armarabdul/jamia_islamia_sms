import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isBusy = isLoading || loading;
  const { theme } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          bg: theme.colors.bgSurfaceElevated,
          border: theme.colors.borderDefault,
          text: theme.colors.textPrimary,
        };
      case 'gold':
        return {
          bg: theme.colors.gold,
          border: 'transparent',
          text: '#ffffff',
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: theme.colors.primary,
          text: theme.colors.primary,
        };
      case 'danger':
        return {
          bg: theme.colors.error,
          border: 'transparent',
          text: '#ffffff',
        };
      default:
        return {
          bg: theme.colors.primary,
          border: 'transparent',
          text: '#ffffff',
        };
    }
  };

  const vStyle = getVariantStyles();

  const height = size === 'sm' ? 38 : size === 'lg' ? 52 : 46;
  const fontSize = size === 'sm' ? theme.typography.sm : size === 'lg' ? theme.typography.lg : theme.typography.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isBusy}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          height,
          backgroundColor: vStyle.bg,
          borderColor: vStyle.border,
          borderRadius: theme.radii.md,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {isBusy ? (
        <ActivityIndicator color={vStyle.text} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            {
              color: vStyle.text,
              fontSize,
            },
            textStyle,
          ]}
        >
          {icon ? `${icon}  ${title}` : title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
