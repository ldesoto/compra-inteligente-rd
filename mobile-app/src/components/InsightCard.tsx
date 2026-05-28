import React from 'react';
import { View, StyleSheet, Text, ViewStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { PremiumCard } from './PremiumCard';
import { themeColors, themeLayout, themeTypography } from '../theme/DesignSystem';

interface InsightCardProps {
  title: string;
  description: string;
  badgeText?: string;
  iconName?: string;
  iconColor?: string;
  savingAmount?: string;
  style?: ViewStyle;
  isAiInsight?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  badgeText,
  iconName = 'bulb-outline',
  iconColor,
  savingAmount,
  style,
  isAiInsight = false,
}) => {
  const { darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

  const defaultIconColor = iconColor || (isAiInsight ? colors.premium : colors.primary);
  const iconBg = isAiInsight ? colors.premiumLight : colors.primaryLight;

  return (
    <PremiumCard
      variant="surface"
      style={[
        styles.card,
        isAiInsight && { borderColor: colors.premium, borderWidth: 1.5 },
        style
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          {isAiInsight ? (
            <Ionicons name="sparkles" size={18} color={defaultIconColor} />
          ) : (
            <Ionicons name={iconName as any} size={18} color={defaultIconColor} />
          )}
        </View>

        <View style={styles.titleCol}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {badgeText && (
            <View style={[styles.badge, { backgroundColor: isAiInsight ? colors.premiumLight : colors.primaryLight }]}>
              <Text style={[styles.badgeText, { color: defaultIconColor }]}>{badgeText}</Text>
            </View>
          )}
        </View>

        {savingAmount && (
          <View style={styles.savingBox}>
            <Text style={[styles.savingLabel, { color: colors.textMuted }]}>Ahorro</Text>
            <Text style={[styles.savingVal, { color: colors.primary }]}>{savingAmount}</Text>
          </View>
        )}
      </View>

      <Text style={[styles.desc, { color: colors.textSecondary }]}>{description}</Text>

      {isAiInsight && (
        <View style={styles.aiBadgeRow}>
          <Feather name="cpu" size={12} color={colors.premium} />
          <Text style={[styles.aiLabel, { color: colors.premium }]}>Análisis IA Comprix</Text>
        </View>
      )}
    </PremiumCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: themeLayout.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: themeLayout.spacing.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: themeLayout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: themeLayout.spacing.md,
  },
  titleCol: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: themeTypography.fontSizes.md,
    fontWeight: themeTypography.fontWeights.bold,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: themeLayout.borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: themeTypography.fontSizes.sm,
    lineHeight: themeTypography.lineHeights.sm,
  },
  savingBox: {
    alignItems: 'flex-end',
  },
  savingLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  savingVal: {
    fontSize: themeTypography.fontSizes.md,
    fontWeight: themeTypography.fontWeights.extraBold,
  },
  aiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: themeLayout.spacing.md,
  },
  aiLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
