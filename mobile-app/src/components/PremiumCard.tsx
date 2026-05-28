import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { themeColors, themeLayout, themeShadows } from '../theme/DesignSystem';

interface PremiumCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  gradient?: 'savings' | 'premium' | 'neutral' | 'softCard';
  variant?: 'surface' | 'surfaceAlt';
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  style,
  onPress,
  gradient,
  variant = 'surface',
}) => {
  const { darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

  // Determine standard card background and border colors
  const cardBg = variant === 'surface' ? colors.surface : colors.surfaceAlt;
  const cardBorder = colors.border;

  const cardStyles = [
    styles.card,
    {
      backgroundColor: cardBg,
      borderColor: cardBorder,
      borderRadius: themeLayout.borderRadius.xl,
    },
    !gradient && (darkMode ? styles.shadowDark : styles.shadowLight),
    style,
  ];

  if (gradient) {
    let gradColors: [string, string, ...string[]] = ['#FFFFFF', '#FFFFFF'];
    let start = { x: 0, y: 0 };
    let end = { x: 1, y: 1 };

    if (gradient === 'savings') {
      gradColors = darkMode ? ['#064E3B', '#059669'] : ['#047857', '#10B981'];
    } else if (gradient === 'premium') {
      gradColors = darkMode ? ['#8B5CF6', '#7C3AED'] : ['#7C3AED', '#6D28D9'];
      start = { x: 0, y: 0 };
      end = { x: 1, y: 0 };
    } else if (gradient === 'neutral') {
      gradColors = darkMode ? ['#334155', '#1E293B'] : ['#1E293B', '#0F172A'];
    } else if (gradient === 'softCard') {
      gradColors = darkMode ? ['#1E293B', '#0F172A'] : ['#F8FAFC', '#F1F5F9'];
      start = { x: 0, y: 0 };
      end = { x: 0, y: 1 };
    }

    if (onPress) {
      return (
        <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.touchable}>
          <LinearGradient
            colors={gradColors}
            start={start}
            end={end}
            style={[cardStyles, { borderWidth: 0 }]}
          >
            {children}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <LinearGradient
        colors={gradColors}
        start={start}
        end={end}
        style={[cardStyles, { borderWidth: 0 }]}
      >
        {children}
      </LinearGradient>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={[cardStyles, styles.touchable]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    padding: themeLayout.spacing.lg,
    borderWidth: 1,
    position: 'relative',
  },
  touchable: {
    width: '100%',
  },
  shadowLight: {
    ...themeShadows.soft,
  },
  shadowDark: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 2,
  },
});
