import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

export default function BudgetDashboardScreen({ navigation }: any) {
  const { fetchBudgetAnalysis, currentList } = useAppStore();
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
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  const globalBudget = budgetData.monthlyBudget || 0;
  const globalSpent = budgetData.totalEstimatedCost || 0;
  const globalPercent = globalBudget > 0 ? Math.min((globalSpent / globalBudget) * 100, 100) : 0;

  // Mapeamos el objeto categorySpending a un array para la UI
  const categories = Object.keys(budgetData.categorySpending || {}).map(catName => {
    const spent = budgetData.categorySpending[catName];
    // Para MVP, obtenemos el budget desde la DB si estuviera mapeado o usamos 0
    const budget = budgetData.categoryBudgets?.[catName] || 0; 
    return {
      name: catName,
      budget,
      spent,
      icon: 'basket',
      color: (budget > 0 && spent > budget) ? '#EF4444' : '#3B82F6',
      overBudget: budget > 0 && spent > budget
    };
  });
  
  if (categories.length === 0) {
    categories.push({ name: 'Sin compras', budget: 0, spent: 0, icon: 'basket', color: '#3B82F6', overBudget: false });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Presupuesto Inteligente</Text>
        <View style={styles.menuButton} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Global Budget Card */}
        <View style={styles.globalCard}>
          <Text style={styles.cardSubtitle}>GASTO MENSUAL</Text>
          <Text style={{ marginBottom: 20 }} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={styles.spentAmount}>RD$ {globalSpent.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.totalAmount}> / RD$ {globalBudget.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
          </Text>
          
          <View style={styles.progressBarBg}>
            <LinearGradient 
              colors={['#059669', '#10B981']} 
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
              style={[styles.progressBarFill, { width: `${globalPercent}%` }]} 
            />
          </View>
          <Text style={styles.remainingText}>Te quedan RD$ {(globalBudget - globalSpent).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} este mes</Text>
        </View>

        {/* AI Alerts */}
        {budgetData.alerts && budgetData.alerts.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Alertas del Asistente</Text>
            {budgetData.alerts.map((alert: any, idx: number) => (
              <View key={idx} style={styles.alertCard}>
                <View style={styles.alertIconBox}>
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                </View>
                <View style={styles.alertTexts}>
                  <Text style={styles.alertTitle}>{alert.title}</Text>
                  <Text style={styles.alertDesc}>{alert.message}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Categories Breakdown */}
        <Text style={styles.sectionTitle}>Desglose por Categoría</Text>
        {categories.map((cat, idx) => {
          const percent = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0;
          return (
            <View key={idx} style={styles.categoryRow}>
              <View style={[styles.catIconBox, { backgroundColor: `${cat.color}20` }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>
              <View style={styles.catInfo}>
                <View style={styles.catHeader}>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={[styles.catSpent, cat.overBudget && styles.textDanger]}>
                    RD$ {cat.spent.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <Text style={styles.catTotal}>/ {cat.budget.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </Text>
                </View>
                <View style={styles.catProgressBg}>
                  <View style={[styles.catProgressFill, { width: `${percent}%`, backgroundColor: cat.overBudget ? '#EF4444' : cat.color }]} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 24, paddingTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  menuButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  cardSubtitle: { color: '#64748B', fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 8 },
  amountRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 20 },
  spentAmount: { color: '#0F172A', fontSize: 36, fontWeight: '800' },
  totalAmount: { color: '#64748B', fontSize: 18, fontWeight: '600' },
  remainingText: { color: '#10B981', fontSize: 14, fontWeight: '500' },

  globalCard: { 
    marginHorizontal: 0, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4
  },
  progressBarBg: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', backgroundColor: '#16A34A', borderRadius: 6 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', paddingHorizontal: 0, marginBottom: 16, marginTop: 10 },
  
  alertCard: { 
    marginHorizontal: 0, backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, flexDirection: 'row', 
    marginBottom: 16, borderWidth: 1, borderColor: '#FEF3C7' 
  },
  alertIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  alertTexts: { flex: 1 },
  alertTitle: { fontSize: 15, fontWeight: '700', color: '#B45309', marginBottom: 4 },
  alertDesc: { fontSize: 13, color: '#92400E', lineHeight: 18 },

  categoryRow: { 
    marginHorizontal: 0, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', 
    marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' 
  },
  catIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: '#F8FAFC' },
  catInfo: { flex: 1 },
  catHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  catName: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  catSpent: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  catTotal: { color: '#64748B', fontWeight: '400' },
  catProgressBg: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  catProgressFill: { height: '100%', borderRadius: 3 },
  textDanger: { color: '#EF4444' }
});
