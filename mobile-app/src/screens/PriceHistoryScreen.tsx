import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';
import { AddToListModal } from '../components/AddToListModal';
import { PremiumCard } from '../components/PremiumCard';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export const PriceHistoryScreen = ({ route, navigation }: any) => {
  const { productId, productName } = route.params || {};
  const { fetchProductHistory, compareSingleProduct, fetchSmartSubstitutes, darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;
  
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
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.goBack()} 
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Historial de Precios</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 12, color: colors.textMuted, fontWeight: '500' }}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!productData) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.goBack()} 
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Historial de Precios</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Feather name="alert-circle" size={48} color={colors.textLight} />
          <Text style={{ marginTop: 12, color: colors.textMuted }}>No se encontró información de precios.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const storesColors: Record<string, string> = {
    'jumbo': '#FF8200',
    'la sirena': '#EF4444',
    'nacional': '#008B47',
    'plaza lama': '#EAB308',
    'bravo': colors.primary,
  };

  const getStoreColor = (name: string) => {
    const key = name.toLowerCase();
    return storesColors[key] || colors.info;
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.goBack()} 
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Historial de Precios</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero Banner Card */}
        <PremiumCard gradient="softCard" style={styles.heroCard}>
          <View style={styles.heroIconRow}>
            <View style={[styles.heroIconBg, { backgroundColor: colors.surface }]}>
              <Feather name="bar-chart-2" size={20} color={colors.primary} />
            </View>
            <Text style={[styles.heroLabel, { color: colors.primary }]}>Tendencia General</Text>
          </View>
          <Text style={[styles.heroText, { color: colors.textSecondary }]}>
            Controla cómo se ha movido el precio de este producto en los últimos meses y toma la mejor decisión de compra.
          </Text>
        </PremiumCard>

        {/* Product Card */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Movimiento Actual</Text>
        <PremiumCard variant="surface" style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text style={[styles.productName, { color: colors.textPrimary }]}>{productData.name}</Text>
              <Text style={[styles.productSub, { color: colors.textMuted }]}>
                Actualizado hoy · {Object.keys(productData.stores).length} tiendas
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.addBtn, { backgroundColor: colors.primaryLight }]}
                onPress={() => openAddModal(productId, productData.name)}
              >
                <Feather name="plus" size={20} color={colors.primary} />
              </TouchableOpacity>
              <View style={[styles.trendContainer, { marginTop: 8 }]}>
                <View style={[
                  styles.trendBg, 
                  {
                    backgroundColor: productData.trend === 'down' ? colors.primaryLight : productData.trend === 'up' ? colors.dangerLight : colors.surfaceAlt
                  }
                ]}>
                  <Feather 
                    name={productData.trend === 'up' ? 'trending-up' : productData.trend === 'down' ? 'trending-down' : 'minus'} 
                    size={16} 
                    color={productData.trend === 'down' ? colors.primary : productData.trend === 'up' ? colors.danger : colors.textMuted} 
                  />
                </View>
                <Text style={[
                  styles.trendText,
                  { color: productData.trend === 'down' ? colors.primary : productData.trend === 'up' ? colors.danger : colors.textMuted }
                ]}>
                  {productData.trend === 'up' ? `+RD$${(productData.current - productData.previous).toFixed(2)}` :
                    productData.trend === 'down' ? `-RD$${(productData.previous - productData.current).toFixed(2)}` : 'Estable'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.storesList}>
            {sortedStores.map(([store, price], i) => (
              <View key={store} style={[styles.storeRow, { borderBottomWidth: i === sortedStores.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
                <View style={[styles.storeRank, i === 0 && { backgroundColor: colors.primary }]}>
                  <Text style={[styles.storeRankText, i === 0 && { color: '#FFFFFF' }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.storeName, i === 0 ? { color: colors.textPrimary } : { color: colors.textSecondary }]}>
                  {store}
                </Text>
                <Text style={[styles.storePrice, i === 0 ? { color: colors.primary, fontSize: 16 } : { color: colors.textSecondary }]}>
                  RD$ {(price as number).toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                </Text>
                {i === 0 && (
                  <View style={[styles.cheapestTag, { backgroundColor: colors.primaryLight }]}>
                    <Feather name="check-circle" size={12} color={colors.primary} />
                    <Text style={[styles.cheapestTagText, { color: colors.primary }]}>Más barato</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </PremiumCard>

        {/* Intelligent Motor Analysis */}
        {intelligentData && intelligentData.comparisons && intelligentData.comparisons.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Análisis Inteligente (Motor AI)</Text>
            <PremiumCard 
              variant="surface" 
              style={[styles.productCard, { borderColor: colors.premium, borderWidth: 1.5 }]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textLight, fontWeight: '700', textTransform: 'uppercase' }}>
                    AHORRO POTENCIAL
                  </Text>
                  <Text style={{ fontSize: 24, color: colors.primary, fontWeight: '900' }}>
                    RD$ {intelligentData.maxSavings.toLocaleString('es-DO')} 
                    <Text style={{ fontSize: 14, color: colors.primary }}> ({intelligentData.savingsPercentage}%)</Text>
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: colors.textLight, fontWeight: '700', textTransform: 'uppercase' }}>
                    MEDIDA
                  </Text>
                  <Text style={{ fontSize: 16, color: colors.textPrimary, fontWeight: '800' }}>
                    {intelligentData.baseWeight} {intelligentData.baseUnit}
                  </Text>
                </View>
              </View>

              <View style={styles.storesList}>
                {intelligentData.comparisons.map((comp: any, i: number) => (
                  <View key={comp.supermarketId ? `${comp.supermarketId}-${i}` : `comp-${i}`} style={[styles.storeRow, { paddingVertical: 4 }]}>
                    <Text style={[styles.storeName, i === 0 ? { color: colors.textPrimary } : { color: colors.textSecondary }, { flex: 0.8 }]}>
                      {comp.supermarketName}
                    </Text>
                    
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <Text style={[styles.storePrice, i === 0 ? { color: colors.primary, fontSize: 16 } : { color: colors.textSecondary }]}>
                        RD$ {(comp.price).toLocaleString('es-DO')}
                      </Text>
                      {comp.unitPrice ? (
                        <Text style={{ fontSize: 11, color: colors.textLight }}>
                          RD$ {comp.unitPrice.toFixed(2)} / {intelligentData.baseUnit}
                        </Text>
                      ) : null}
                    </View>

                    <View style={{ width: 60, alignItems: 'flex-end' }}>
                      <View style={{ 
                        backgroundColor: comp.score >= 80 ? colors.primaryLight : comp.score >= 50 ? colors.warningLight : colors.dangerLight, 
                        paddingHorizontal: 6, 
                        paddingVertical: 2, 
                        borderRadius: 6 
                      }}>
                        <Text style={{ 
                          fontSize: 11, 
                          fontWeight: '800', 
                          color: comp.score >= 80 ? colors.primary : comp.score >= 50 ? colors.warning : colors.danger 
                        }}>
                          {comp.score} pts
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </PremiumCard>
          </View>
        )}

        {/* Chart */}
        {productData.history && productData.history.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tendencia de los últimos meses</Text>
            <PremiumCard variant="surface" style={styles.chartCard}>
              <View style={styles.chartLegend}>
                {Object.keys(productData.stores).map((storeName) => (
                  <View key={storeName} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: getStoreColor(storeName) }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{storeName}</Text>
                  </View>
                ))}
              </View>
              {productData.history.map((month: any, i: number) => (
                <View key={i} style={styles.chartRow}>
                  <Text style={[styles.chartMonth, { color: colors.textMuted }]}>
                    {month.date.substring(5, 7)}/{month.date.substring(2, 4)}
                  </Text>
                  <View style={[styles.chartBars, { backgroundColor: colors.surfaceAlt }]}>
                    {Object.keys(month).filter(k => k !== 'date').map((storeKey) => {
                      const price = month[storeKey];
                      const widthPct = Math.max((price / maxChartPrice) * 100, 5);
                      return (
                        <View key={storeKey} style={[styles.chartBar, { width: `${widthPct}%`, backgroundColor: getStoreColor(storeKey), marginBottom: 2 }]}>
                          <Text style={styles.chartBarLabel}>RD$ {price.toLocaleString('es-DO')}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              ))}
            </PremiumCard>
          </View>
        )}

        {/* Substitutes Engine */}
        {substitutesData && substitutesData.success && (
          <View style={styles.section}>
            {substitutesData.equivalents?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Sustitutos Equivalentes (Calidad Similar)
                </Text>
                <PremiumCard variant="surface" style={styles.productCard}>
                  {substitutesData.equivalents.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomWidth: i === substitutesData.equivalents.length - 1 ? 0 : 1, borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subTitle, { color: colors.textPrimary }]}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: colors.textMuted }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: colors.textPrimary }}>RD$ {sub.avgPrice}</Text>
                        <View style={{ backgroundColor: sub.score >= 100 ? colors.primaryLight : colors.warningLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                          <Text style={{ fontSize: 10, fontWeight: '800', color: sub.score >= 100 ? colors.primary : colors.warning }}>Score: {sub.score}</Text>
                        </View>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={[styles.addBtn, { backgroundColor: colors.surfaceAlt }]}
                      >
                        <Feather name="plus" size={18} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </PremiumCard>
              </View>
            )}

            {substitutesData.cheaperBrands?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Alternativas Más Baratas</Text>
                <PremiumCard 
                  variant="surface"
                  style={[
                    styles.productCard, 
                    { 
                      borderColor: colors.primary, 
                      borderWidth: 1.5,
                      backgroundColor: darkMode ? '#1F2E27' : '#F0FDF4' 
                    }
                  ]}
                >
                  {substitutesData.cheaperBrands.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomColor: darkMode ? '#2E4238' : '#DCFCE7', borderBottomWidth: i === substitutesData.cheaperBrands.length - 1 ? 0 : 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subTitle, { color: darkMode ? '#A7F3D0' : '#166534' }]}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: darkMode ? '#34D399' : '#15803D' }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: darkMode ? '#A7F3D0' : '#14532D' }}>RD$ {sub.avgPrice}</Text>
                        <Text style={{ fontSize: 11, color: colors.primary, marginTop: 2 }}>Unidad: RD$ {sub.unitPrice}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={[styles.addBtn, { backgroundColor: colors.primaryLight }]}
                      >
                        <Feather name="plus" size={18} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </PremiumCard>
              </View>
            )}

            {substitutesData.premiumBrands?.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Marcas Premium</Text>
                <PremiumCard 
                  variant="surface"
                  style={[
                    styles.productCard, 
                    { 
                      borderColor: colors.premium, 
                      borderWidth: 1.5,
                      backgroundColor: darkMode ? '#2A1F3E' : '#FAF5FF' 
                    }
                  ]}
                >
                  {substitutesData.premiumBrands.map((sub: any, i: number) => (
                    <View key={i} style={[styles.storeRow, { paddingVertical: 8, borderBottomColor: darkMode ? '#3E2E5B' : '#F3E8FF', borderBottomWidth: i === substitutesData.premiumBrands.length - 1 ? 0 : 1 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.subTitle, { color: darkMode ? '#DDD6FE' : '#6B21A8' }]}>{sub.name}</Text>
                        <Text style={{ fontSize: 12, color: darkMode ? '#A78BFA' : '#7E22CE' }}>{sub.brand}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end', marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '800', color: darkMode ? '#DDD6FE' : '#581C87' }}>RD$ {sub.avgPrice}</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => openAddModal(sub.id, sub.name)}
                        style={[styles.addBtn, { backgroundColor: colors.premiumLight }]}
                      >
                        <Feather name="plus" size={18} color={colors.premium} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </PremiumCard>
              </View>
            )}
          </View>
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
  safe: { 
    flex: 1, 
  },
  scroll: { 
    padding: 20, 
    paddingTop: 10 
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
  heroCard: { 
    padding: themeLayout.spacing.lg, 
    marginBottom: 32,
    borderWidth: 1,
  },
  heroIconRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 12 
  },
  heroIconBg: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    ...themeShadows.soft,
  },
  heroLabel: { 
    fontSize: 14, 
    fontWeight: '800', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5 
  },
  heroText: { 
    fontSize: themeTypography.fontSizes.sm, 
    lineHeight: 22, 
    fontWeight: '500' 
  },
  sectionTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
    marginBottom: 16, 
    letterSpacing: -0.3 
  },
  productCard: { 
    padding: themeLayout.spacing.lg, 
    marginBottom: 16, 
    borderWidth: 1, 
  },
  productHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  productName: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '700', 
  },
  productSub: { 
    fontSize: 13, 
    marginTop: 4, 
    fontWeight: '500' 
  },
  trendContainer: { 
    alignItems: 'center', 
    gap: 4 
  },
  trendBg: { 
    width: 36, 
    height: 36, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  trendText: { 
    fontSize: 12, 
    fontWeight: '800' 
  },
  addBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center',
    alignSelf: 'center',
  },
  storesList: { 
    gap: 10 
  },
  storeRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 10,
    gap: 10 
  },
  storeRank: { 
    width: 26, 
    height: 26, 
    borderRadius: 8, 
    backgroundColor: '#F3F4F6', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  storeRankText: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#6B7280' 
  },
  storeName: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '600' 
  },
  storePrice: { 
    fontSize: 15, 
    fontWeight: '700', 
  },
  cheapestTag: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  cheapestTagText: { 
    fontSize: 11, 
    fontWeight: '800' 
  },
  chartCard: { 
    padding: themeLayout.spacing.lg, 
    borderWidth: 1, 
    marginBottom: 14, 
    ...themeShadows.soft,
  },
  chartLegend: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 16, 
    marginBottom: 20 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6 
  },
  legendDot: { 
    width: 10, 
    height: 10, 
    borderRadius: 5 
  },
  legendText: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  chartRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 10, 
    gap: 12 
  },
  chartMonth: { 
    fontSize: 13, 
    fontWeight: '700', 
    width: 30 
  },
  chartBars: { 
    flex: 1, 
    height: 32, 
    borderRadius: 8, 
    overflow: 'hidden' 
  },
  chartBar: { 
    height: '100%', 
    borderRadius: 8, 
    justifyContent: 'center', 
    paddingLeft: 10 
  },
  chartBarLabel: { 
    fontSize: 11, 
    color: '#FFFFFF', 
    fontWeight: '800' 
  },
  section: {
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 14, 
    fontWeight: '700',
  },
});
