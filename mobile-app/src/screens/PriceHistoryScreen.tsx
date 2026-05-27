import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';
import { AddToListModal } from '../components/AddToListModal';

export const PriceHistoryScreen = ({ route, navigation }: any) => {
  const { productId, productName } = route.params || {};
  const { fetchProductHistory, compareSingleProduct, fetchSmartSubstitutes } = useAppStore();
  
  const [productData, setProductData] = useState<any>(null);
  const [intelligentData, setIntelligentData] = useState<any>(null);
  const [substitutesData, setSubstitutesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Add to List Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    if (productId) {
      Promise.all([
        fetchProductHistory(productId),
        compareSingleProduct(productId),
        fetchSmartSubstitutes(productId)
      ]).then(([historyData, smartData, subsData]) => {
        setProductData(historyData);
        setIntelligentData(smartData);
        setSubstitutesData(subsData);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [productId]);

  const openAddModal = (id: string, name: string) => {
    setSelectedProduct({
      canonicalProductId: id,
      name,
      quantity: 1
    });
    setShowAddModal(true);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#00B2A9" />
          </TouchableOpacity>
          <Text style={styles.title}>Historial de Precios</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00B2A9" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!productData) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#00B2A9" />
          </TouchableOpacity>
          <Text style={styles.title}>Historial de Precios</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Feather name="alert-circle" size={48} color="#D1D5DB" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>No se encontró información de precios.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const storesColors: Record<string, string> = {
    'jumbo': '#FF8200',
    'la sirena': '#EF4444',
    'nacional': '#008B47',
    'plaza lama': '#EAB308',
    'bravo': '#059669', // Just in case
  };

  const getStoreColor = (name: string) => {
    const key = name.toLowerCase();
    return storesColors[key] || '#3B82F6';
  };

  const sortedStores = Object.entries(productData.stores)
    .sort(([, a], [, b]) => (a as number) - (b as number));

  // Determine max price for chart bars
  let maxChartPrice = 1;
  productData.history?.forEach((h: any) => {
    Object.keys(h).forEach(k => {
      if (k !== 'date' && h[k] > maxChartPrice) maxChartPrice = h[k];
    });
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title}>Historial de Precios</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconRow}>
            <View style={styles.heroIconBg}>
              <Feather name="bar-chart-2" size={20} color="#00B2A9" />
            </View>
            <Text style={styles.heroLabel}>Tendencia General</Text>
          </View>
          <Text style={styles.heroText}>Controla cómo se ha movido el precio de este producto en los últimos meses.</Text>
        </View>

        {/* Product History Card */}
        <Text style={styles.sectionTitle}>Movimiento Actual</Text>
        <View style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={styles.productName}>{productData.name}</Text>
              <Text style={styles.productSub}>Actualizado hoy · {Object.keys(productData.stores).length} tiendas</Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => openAddModal(productId, productData.name)}
              >
                <Feather name="plus" size={20} color="#00B2A9" />
              </TouchableOpacity>
              <View style={[styles.trendContainer, { marginTop: 8 }]}>
                <View style={[styles.trendBg, {
                  backgroundColor: productData.trend === 'down' ? '#ECFDF5' : productData.trend === 'up' ? '#FEF2F2' : '#F3F4F6'
                }]}>
                  <Feather 
                    name={productData.trend === 'up' ? 'trending-up' : productData.trend === 'down' ? 'trending-down' : 'minus'} 
                    size={16} 
                    color={productData.trend === 'down' ? '#059669' : productData.trend === 'up' ? '#EF4444' : '#6B7280'} 
                  />
                </View>
                <Text style={[
                  styles.trendText,
                  { color: productData.trend === 'down' ? '#059669' : productData.trend === 'up' ? '#EF4444' : '#6B7280' }
                ]}>
                  {productData.trend === 'up' ? `+RD$${(productData.current - productData.previous).toFixed(2)}` :
                    productData.trend === 'down' ? `-RD$${(productData.previous - productData.current).toFixed(2)}` : 'Estable'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.storesList}>
            {sortedStores.map(([store, price], i) => (
              <View key={store} style={styles.storeRow}>
                <View style={[styles.storeRank, i === 0 && styles.storeRankBest]}>
                  <Text style={[styles.storeRankText, i === 0 && { color: '#fff' }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.storeName, i === 0 && styles.storeNameBest]}>{store}</Text>
                <Text style={[styles.storePrice, i === 0 && styles.storePriceBest]}>
                  RD$ {(price as number).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                </Text>
                {i === 0 && (
                  <View style={styles.cheapestTag}>
                    <Feather name="check-circle" size={12} color="#059669" />
                    <Text style={styles.cheapestTagText}>Más barato</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Intelligent Motor Analysis */}
        {intelligentData && intelligentData.comparisons && intelligentData.comparisons.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Análisis Inteligente (Motor AI)</Text>
            <View style={[styles.productCard, { borderColor: '#E0E7FF', backgroundColor: '#F8FAFC' }]}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '700' }}>AHORRO POTENCIAL</Text>
                  <Text style={{ fontSize: 24, color: '#059669', fontWeight: '900' }}>
                    RD$ {intelligentData.maxSavings.toLocaleString('es-DO')} 
                    <Text style={{ fontSize: 14, color: '#10B981' }}> ({intelligentData.savingsPercentage}%)</Text>
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 13, color: '#64748B', fontWeight: '700' }}>MEDIDA</Text>
                  <Text style={{ fontSize: 16, color: '#0F172A', fontWeight: '800' }}>{intelligentData.baseWeight} {intelligentData.baseUnit}</Text>
                </View>
              </View>

              <View style={styles.storesList}>
                {intelligentData.comparisons.map((comp: any, i: number) => (
                  <View key={comp.supermarketId} style={[styles.storeRow, { paddingVertical: 4 }]}>
                    <Text style={[styles.storeName, i === 0 && styles.storeNameBest, { flex: 0.8 }]}>{comp.supermarketName}</Text>
                    
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={[styles.storePrice, i === 0 && styles.storePriceBest]}>
                        RD$ {(comp.price).toLocaleString('es-DO')}
                      </Text>
                      {comp.unitPrice ? (
                        <Text style={{ fontSize: 11, color: '#94A3B8' }}>RD$ {comp.unitPrice.toFixed(2)} / {intelligentData.baseUnit}</Text>
                      ) : null}
                    </View>

                    <View style={{ width: 60, alignItems: 'flex-end' }}>
                      <View style={{ backgroundColor: comp.score >= 80 ? '#D1FAE5' : comp.score >= 50 ? '#FEF3C7' : '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: comp.score >= 80 ? '#059669' : comp.score >= 50 ? '#D97706' : '#DC2626' }}>
                          {comp.score} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Chart */}
        {productData.history && productData.history.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Tendencia de los últimos meses</Text>
            <View style={styles.chartCard}>
              <View style={styles.chartLegend}>
                {Object.keys(productData.stores).map((storeName) => (
                  <View key={storeName} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: getStoreColor(storeName) }]} />
                    <Text style={styles.legendText}>{storeName}</Text>
                  </View>
                ))}
              </View>
              {productData.history.map((month: any, i: number) => (
                <View key={i} style={styles.chartRow}>
                  <Text style={styles.chartMonth}>{month.date.substring(5, 7)}/{month.date.substring(2, 4)}</Text>
                  <View style={styles.chartBars}>
                    {Object.keys(month).filter(k => k !== 'date').map((storeKey) => {
                      const price = month[storeKey];
                      const widthPct = Math.max((price / maxChartPrice) * 100, 5);
                      return (
                        <View key={storeKey} style={[styles.chartBar, { width: `${widthPct}%`, backgroundColor: getStoreColor(storeKey), marginBottom: 2 }]}>
                          <Text style={styles.chartBarLabel}>RD$ {price.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Substitutes Engine */}
        {substitutesData && substitutesData.success && (
          <>
            {substitutesData.equivalents?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Sustitutos Equivalentes (Calidad Similar)</Text>
                <View style={styles.productCard}>
                  {substitutesData.equivalents.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomWidth: i === substitutesData.equivalents.length - 1 ? 0 : 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1E293B' }}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: '#64748B' }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#0F172A' }}>RD$ {sub.avgPrice}</Text>
                        <View style={{ backgroundColor: sub.score >= 100 ? '#D1FAE5' : '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: sub.score >= 100 ? '#059669' : '#D97706' }}>Score: {sub.score}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}
                      >
                        <Feather name="plus" size={18} color="#0F172A" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {substitutesData.cheaperBrands?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Alternativas Más Baratas</Text>
                <View style={[styles.productCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}>
                  {substitutesData.cheaperBrands.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomColor: '#DCFCE7', borderBottomWidth: i === substitutesData.cheaperBrands.length - 1 ? 0 : 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534' }}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: '#15803D' }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#14532D' }}>RD$ {sub.avgPrice}</Text>
                        <Text style={{ fontSize: 11, color: '#16A34A', marginTop: 2 }}>Unidad: RD$ {sub.unitPrice}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}
                      >
                        <Feather name="plus" size={18} color="#166534" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            {substitutesData.premiumBrands?.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Marcas Premium</Text>
                <View style={[styles.productCard, { borderColor: '#E9D5FF', backgroundColor: '#FAF5FF' }]}>
                  {substitutesData.premiumBrands.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomColor: '#F3E8FF', borderBottomWidth: i === substitutesData.premiumBrands.length - 1 ? 0 : 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#6B21A8' }}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: '#7E22CE' }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: '#581C87' }}>RD$ {sub.avgPrice}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', alignSelf: 'center' }}
                      >
                        <Feather name="plus" size={18} color="#6B21A8" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddToListModal 
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        productToAdd={selectedProduct}
      />
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5 },
  
  heroCard: { backgroundColor: '#EEF2FF', borderRadius: 24, padding: 24, marginBottom: 32, borderWidth: 1, borderColor: '#C7D2FE' },
  heroIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  heroIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  heroLabel: { fontSize: 15, fontWeight: '800', color: '#4F46E5', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroText: { color: '#4B5563', fontSize: 15, lineHeight: 22, fontWeight: '500' },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 16, letterSpacing: -0.3 },
  
  productCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  productHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  productName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  productSub: { fontSize: 13, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  trendContainer: { alignItems: 'center', gap: 4 },
  trendBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  trendText: { fontSize: 12, fontWeight: '800' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },

  
  storesList: { gap: 10 },
  storeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  storeRank: { width: 26, height: 26, borderRadius: 8, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  storeRankBest: { backgroundColor: '#059669' },
  storeRankText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  storeName: { flex: 1, fontSize: 14, color: '#6B7280', fontWeight: '600' },
  storeNameBest: { color: '#1F2937' },
  storePrice: { fontSize: 15, fontWeight: '700', color: '#6B7280' },
  storePriceBest: { color: '#059669', fontSize: 16 },
  cheapestTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cheapestTagText: { fontSize: 11, color: '#059669', fontWeight: '800' },
  
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  chartLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  chartMonth: { fontSize: 13, color: '#6B7280', fontWeight: '700', width: 30 },
  chartBars: { flex: 1, height: 32, backgroundColor: '#F3F4F6', borderRadius: 8, overflow: 'hidden' },
  chartBar: { height: '100%', borderRadius: 8, justifyContent: 'center', paddingLeft: 10 },
  chartBarLabel: { fontSize: 11, color: '#fff', fontWeight: '800' },
});
