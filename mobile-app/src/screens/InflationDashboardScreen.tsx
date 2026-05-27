import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

export const InflationDashboardScreen = ({ navigation }: any) => {
  const { fetchInflationData } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [inflationData, setInflationData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchInflationData();
        setInflationData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !inflationData) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={{ marginTop: 12, color: '#64748B' }}>Calculando inflación personal...</Text>
      </SafeAreaView>
    );
  }

  if (inflationData.success === false) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#00B2A9" />
          </TouchableOpacity>
          <Text style={styles.title}>Tu Inflación</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Feather name="bar-chart-2" size={64} color="#CBD5E1" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#475569', textAlign: 'center' }}>{inflationData.message}</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: '#94A3B8', textAlign: 'center' }}>Escanea tus recibos para empezar a calcular tu inflación personal.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { personalInflationRate, totalInflationImpact, inflationItems, topCategories, monthlySpending } = inflationData || {};
  const isUp = (personalInflationRate || 0) > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title}>Inflación Personal</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Global Impact Card */}
        <View style={styles.globalCard}>
          <Text style={styles.cardSubtitle}>IMPACTO DE INFLACIÓN</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.spentAmount}>{personalInflationRate || 0}%</Text>
            <View style={[styles.trendBadge, { backgroundColor: isUp ? '#FEE2E2' : '#D1FAE5' }]}>
              <Feather name={isUp ? 'trending-up' : 'trending-down'} size={14} color={isUp ? '#DC2626' : '#059669'} />
            </View>
          </View>
          <Text style={{ fontSize: 14, color: '#475569', lineHeight: 20 }}>
            Estás pagando <Text style={{ fontWeight: '700', color: isUp ? '#DC2626' : '#059669' }}>RD$ {(totalInflationImpact || 0).toLocaleString('es-DO', { maximumFractionDigits: 2 })}</Text> más por los mismos productos comparado con el precio más bajo registrado.
          </Text>
        </View>

        {/* Evolución Mensual */}
        <Text style={styles.sectionTitle}>Evolución del Gasto (Mes a Mes)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {Object.entries(monthlySpending || {}).map(([month, amount]: any, idx: number) => (
            <View key={idx} style={styles.monthCard}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 4 }}>{month}</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A' }}>RD$ {amount.toLocaleString('es-DO', { maximumFractionDigits: 0 })}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Productos que más subieron */}
        <Text style={styles.sectionTitle}>Productos que más subieron</Text>
        {inflationItems && inflationItems.length > 0 ? (
          <View style={styles.listCard}>
            {inflationItems.map((item: any, idx: number) => (
              <View key={idx} style={styles.productRow}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrices}>De RD$ {item.firstPrice} a RD$ {item.lastPrice}</Text>
                </View>
                <View style={styles.increaseBadge}>
                  <Text style={styles.increaseText}>+{item.percentIncrease}%</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={{ color: '#64748B', marginBottom: 24 }}>No hay suficientes datos de productos recurrentes.</Text>
        )}

        {/* Categorías más caras */}
        <Text style={styles.sectionTitle}>Categorías que más absorben tu dinero</Text>
        <View style={styles.listCard}>
          {topCategories && topCategories.map((cat: any, idx: number) => (
            <View key={idx} style={[styles.productRow, idx === topCategories.length - 1 && { borderBottomWidth: 0 }]}>
              <Text style={styles.catName}>{idx + 1}. {cat.name}</Text>
              <Text style={styles.catAmount}>RD$ {cat.total.toLocaleString('es-DO', { maximumFractionDigits: 0 })}</Text>
            </View>
          ))}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5 },
  content: { padding: 20 },
  cardSubtitle: { color: '#64748B', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  
  globalCard: { 
    backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, marginBottom: 24,
    borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 16, elevation: 4
  },
  spentAmount: { color: '#0F172A', fontSize: 40, fontWeight: '900', marginRight: 12 },
  trendBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 16 },
  
  monthCard: { 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, marginRight: 12, minWidth: 120,
    borderWidth: 1, borderColor: '#F1F5F9'
  },
  
  listCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F1F5F9' },
  productRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  productInfo: { flex: 1, paddingRight: 12 },
  productName: { fontSize: 15, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  productPrices: { fontSize: 13, color: '#64748B' },
  increaseBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  increaseText: { color: '#DC2626', fontWeight: '800', fontSize: 13 },
  
  catName: { fontSize: 15, fontWeight: '600', color: '#334155' },
  catAmount: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
});
