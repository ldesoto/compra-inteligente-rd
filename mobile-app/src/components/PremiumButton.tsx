import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ViewStyle, StyleProp, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

interface PremiumButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'premium';
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: boolean;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  style,
  textStyle,
  disabled = false,
  loading = false,
  icon,
  iconRight = false,
}) => {
  const { darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

  const getButtonStyles = (): ViewStyle => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.primary,
          borderWidth: 1.5,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {};
    }
  };

  const getLabelColor = (): string => {
    if (disabled) return colors.textLight;
    switch (variant) {
      case 'secondary':
        return colors.textPrimary;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textMuted;
      default:
        return '#FFFFFF';
    }
  };

  const isGradient = variant === 'primary' || variant === 'premium';
  
  let gradientColors: [string, string, ...string[]] = ['#FFFFFF', '#FFFFFF'];
  if (variant === 'primary') {
    gradientColors = darkMode ? ['#059669', '#10B981'] : ['#10B981', '#059669'];
  } else if (variant === 'premium') {
    gradientColors = darkMode ? ['#8B5CF6', '#7C3AED'] : ['#7C3AED', '#6D28D9'];
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const buttonStyle = [
    styles.button,
    { borderRadius: themeLayout.borderRadius.xxl },
    getButtonStyles(),
    disabled && { opacity: 0.5, backgroundColor: variant === 'ghost' || variant === 'outline' ? 'transparent' : colors.surfaceAlt, borderColor: colors.border },
    !disabled && variant === 'primary' && (darkMode ? styles.shadowDark : styles.shadowPrimary),
    !disabled && variant === 'premium' && styles.shadowPremium,
    style,
  ];

  const labelStyle = [
    styles.label,
    {
      color: getLabelColor(),
      fontSize: themeTypography.fontSizes.md,
      fontWeight: themeTypography.fontWeights.bold,
    },
    textStyle,
  ];

  const renderContent = () => (
    <>
      {icon && !iconRight && icon}
      {loading ? (
        <ActivityIndicator color={getLabelColor()} size="small" style={styles.loader} />
      ) : (
        <Text style={labelStyle}>{title}</Text>
      )}
      {icon && iconRight && icon}
    </>
  );

  if (isGradient && !disabled) {
    return (
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={handlePress}
        style={buttonStyle}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={[buttonStyle, disabled && { borderWidth: 1 }]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  gradientContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  label: {
    textAlign: 'center',
  },
  loader: {
    marginHorizontal: 8,
  },
  shadowPrimary: {
    ...themeShadows.success,
  },
  shadowPremium: {
    ...themeShadows.premium,
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
});
