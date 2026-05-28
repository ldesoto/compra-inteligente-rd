import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { PremiumCard } from '../components/PremiumCard';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export default function BudgetDashboardScreen({ navigation }: any) {
  const { fetchBudgetAnalysis, currentList, darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        if (currentList) {
          const data = await fetchBudgetAnalysis(currentList.id);
          setBudgetData(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentList]);

  if (loading || !budgetData) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const globalBudget = budgetData.monthlyBudget || 0;
  const globalSpent = budgetData.totalEstimatedCost || 0;
  const globalPercent = globalBudget > 0 ? Math.min((globalSpent / globalBudget) * 100, 100) : 0;

  // Map categorySpending object to array for UI
  const categories = Object.keys(budgetData.categorySpending || {}).map(catName => {
    const spent = budgetData.categorySpending[catName];
    const budget = budgetData.categoryBudgets?.[catName] || 0; 
    return {
      name: catName,
      budget,
      spent,
      icon: 'basket-outline',
      color: (budget > 0 && spent > budget) ? colors.danger : colors.info,
      overBudget: budget > 0 && spent > budget
    };
  });
  
  if (categories.length === 0) {
    categories.push({ 
      name: 'Sin compras', 
      budget: 0, 
      spent: 0, 
      icon: 'basket-outline', 
      color: colors.info, 
      overBudget: false 
    });
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8}
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]} 
          onPress={() => navigation.goBack()}
        >
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Presupuesto Inteligente</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Global Budget Card */}
        <PremiumCard variant="surface" style={styles.globalCard}>
          <Text style={[styles.cardSubtitle, { color: colors.textLight }]}>GASTO ESTIMADO MENSUAL</Text>
          
          <View style={styles.amountContainer}>
            <Text style={[styles.spentAmount, { color: colors.textPrimary }]}>
              RD$ {globalSpent.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={[styles.totalAmount, { color: colors.textMuted }]}>
              {' '}/ RD$ {globalBudget.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>
          
          <View style={[styles.progressBarBg, { backgroundColor: colors.surfaceAlt }]}>
            <LinearGradient 
              colors={globalPercent >= 100 ? [colors.danger, '#EF4444'] : [colors.primary, '#34D399']} 
              start={{ x: 0, y: 0 }} 
              end={{ x: 1, y: 0 }} 
              style={[styles.progressBarFill, { width: `${globalPercent}%` }]} 
            />
          </View>
          
          <Text style={[styles.remainingText, { color: (globalBudget - globalSpent) >= 0 ? colors.primary : colors.danger }]}>
            {(globalBudget - globalSpent) >= 0 
              ? `Te quedan RD$ ${(globalBudget - globalSpent).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este mes`
              : `Excedido por RD$ ${Math.abs(globalBudget - globalSpent).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este mes`
            }
          </Text>
        </PremiumCard>

        {/* AI Alerts */}
        {budgetData.alerts && budgetData.alerts.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Alertas del Asistente IA</Text>
            {budgetData.alerts.map((alert: any, idx: number) => (
              <PremiumCard 
                key={idx} 
                variant="surface"
                style={[
                  styles.alertCard, 
                  { 
                    borderColor: colors.warning, 
                    borderWidth: 1.5,
                    backgroundColor: darkMode ? '#2E2219' : '#FFFDF5' 
                  }
                ]}
              >
                <View style={[styles.alertIconBox, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="warning" size={20} color={colors.warning} />
                </View>
                <View style={styles.alertTexts}>
                  <Text style={[styles.alertTitle, { color: darkMode ? '#FBBF24' : '#B45309' }]}>{alert.title}</Text>
                  <Text style={[styles.alertDesc, { color: colors.textSecondary }]}>{alert.message}</Text>
                </View>
              </PremiumCard>
            ))}
          </View>
        )}

        {/* Categories Breakdown */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Desglose por Categoría</Text>
          {categories.map((cat, idx) => {
            const percent = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0;
            return (
              <PremiumCard 
                key={idx} 
                variant="surface"
                style={styles.categoryRow}
              >
                <View style={[styles.catIconBox, { backgroundColor: colors.surfaceAlt }]}>
                  <Ionicons name={cat.icon as any} size={20} color={cat.color} />
                </View>
                <View style={styles.catInfo}>
                  <View style={styles.catHeader}>
                    <Text style={[styles.catName, { color: colors.textPrimary }]}>{cat.name}</Text>
                    <View style={styles.catAmountRow}>
                      <Text style={[styles.catSpent, { color: cat.overBudget ? colors.danger : colors.textPrimary }]}>
                        RD$ {cat.spent.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                      {cat.budget > 0 && (
                        <Text style={[styles.catTotal, { color: colors.textLight }]}>
                          {' '}/ {cat.budget.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                        </Text>
                      )}
                    </View>
                  </View>
                  {cat.budget > 0 && (
                    <View style={[styles.catProgressBg, { backgroundColor: colors.surfaceAlt }]}>
                      <View 
                        style={[
                          styles.catProgressFill, 
                          { 
                            width: `${percent}%`, 
                            backgroundColor: cat.overBudget ? colors.danger : cat.color 
                          }
                        ]} 
                      />
                    </View>
                  )}
                </View>
              </PremiumCard>
            );
          })}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 20, 
    paddingBottom: 16,
    gap: 12 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  content: { 
    paddingHorizontal: 20 
  },
  section: {
    marginBottom: 24,
  },
  cardSubtitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    letterSpacing: 1, 
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  amountContainer: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    marginBottom: 20 
  },
  spentAmount: { 
    fontSize: themeTypography.fontSizes.xxl, 
    fontWeight: '800' 
  },
  totalAmount: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '600' 
  },
  remainingText: { 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '700' 
  },
  globalCard: { 
    padding: themeLayout.spacing.lg, 
    marginBottom: 24,
    borderWidth: 1,
    ...themeShadows.soft,
  },
  progressBarBg: { 
    height: 12, 
    borderRadius: 6, 
    overflow: 'hidden', 
    marginBottom: 12 
  },
  progressBarFill: { 
    height: '100%', 
    borderRadius: 6 
  },
  sectionTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
    marginBottom: 16, 
    marginTop: 8 
  },
  alertCard: { 
    padding: themeLayout.spacing.md, 
    flexDirection: 'row', 
    marginBottom: 12, 
    borderWidth: 1,
  },
  alertIconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16 
  },
  alertTexts: { 
    flex: 1 
  },
  alertTitle: { 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  alertDesc: { 
    fontSize: 13, 
    lineHeight: 18,
    fontWeight: '500',
  },
  categoryRow: { 
    padding: themeLayout.spacing.md, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12, 
    borderWidth: 1,
    ...themeShadows.soft,
  },
  catIconBox: { 
    width: 46, 
    height: 46, 
    borderRadius: themeLayout.borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 16,
  },
  catInfo: { 
    flex: 1 
  },
  catHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 8 
  },
  catName: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '700', 
  },
  catAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catSpent: { 
    fontSize: 14, 
    fontWeight: '700' 
  },
  catTotal: { 
    fontSize: 12,
    fontWeight: '500' 
  },
  catProgressBg: { 
    height: 8, 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  catProgressFill: { 
    height: '100%', 
    borderRadius: 4 
  },
});
