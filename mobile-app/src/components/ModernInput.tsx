import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { themeColors, themeLayout, themeTypography } from '../theme/DesignSystem';

interface ModernInputProps extends TextInputProps {
  label?: string;
  iconName?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const ModernInput: React.FC<ModernInputProps> = ({
  label,
  iconName,
  error,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const { darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const getBorderColor = () => {
    if (error) return colors.danger;
    if (isFocused) return colors.borderActive;
    return colors.border;
  };

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: error ? colors.danger : colors.textSecondary }]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surfaceAlt,
            borderColor: getBorderColor(),
            borderRadius: themeLayout.borderRadius.lg,
          },
          isFocused && styles.focusedShadow,
        ]}
      >
        {iconName && (
          <Feather
            name={iconName as any}
            size={18}
            color={error ? colors.danger : isFocused ? colors.borderActive : colors.textLight}
            style={styles.icon}
          />
        )}
        
        <TextInput
          style={[
            styles.textInput,
            {
              color: colors.textPrimary,
              fontSize: themeTypography.fontSizes.md,
            },
          ]}
          placeholderTextColor={colors.textLight}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !isPasswordVisible}
          autoCapitalize="none"
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={18}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={[styles.errorText, { color: colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: themeLayout.spacing.md,
  },
  label: {
    fontSize: themeTypography.fontSizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: themeLayout.spacing.sm,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    height: 52,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: themeLayout.spacing.md,
  },
  icon: {
    marginRight: themeLayout.spacing.sm,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontWeight: '500',
  },
  passwordToggle: {
    padding: 8,
  },
  focusedShadow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  errorText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: themeLayout.spacing.xs,
  },
});
