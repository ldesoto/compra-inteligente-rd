import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../components/BottomTabBar';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';
import { InsightCard } from '../components/InsightCard';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';
import api from '../services/api';

export const HomeScreen = ({ navigation }: any) => {
  const { 
    currentList, 
    offers, 
    alerts, 
    fetchLists, 
    fetchDashboardData, 
    fetchBudgetAnalysis, 
    darkMode, 
    language, 
    lists, 
    isPremium 
  } = useAppStore();

  const [clippedOffers, setClippedOffers] = React.useState<number[]>([]);
  const [isScraping, setIsScraping] = React.useState(false);
  const [budgetData, setBudgetData] = React.useState<any>(null);

  React.useEffect(() => {
    fetchLists();
    fetchDashboardData();
  }, []);

  React.useEffect(() => {
    if (currentList) {
      fetchBudgetAnalysis(currentList.id).then(setBudgetData).catch(console.warn);
    }
  }, [currentList]);

  const colors = darkMode ? themeColors.dark : themeColors.light;

  const globalBudget = budgetData?.monthlyBudget || 0;
  const globalSpent = budgetData?.totalEstimatedCost || 0;
  const remainingBudget = globalBudget > 0 ? (globalBudget - globalSpent) : 0;
  const isOverBudget = remainingBudget < 0;

  const toggleClip = (id: number) => {
    if (clippedOffers.includes(id)) {
      setClippedOffers(clippedOffers.filter(x => x !== id));
    } else {
      setClippedOffers([...clippedOffers, id]);
    }
  };

  const t = {
    budget: language === 'Inglés' ? 'Available budget' : 'Presupuesto disponible',
    scanReceipt: language === 'Inglés' ? 'Scan Receipt' : 'Escanear Recibo',
    makeList: language === 'Inglés' ? 'Make a List' : 'Hacer Compra',
    myLists: language === 'Inglés' ? 'My Lists' : 'Mis Listas',
    offers: language === 'Inglés' ? 'Offers' : 'Ofertas',
    newList: language === 'Inglés' ? 'New List' : 'Nueva lista',
    compare: language === 'Inglés' ? 'Compare' : 'Comparar',
    inflation: language === 'Inglés' ? 'Inflation' : 'Inflación',
    scanTitle: language === 'Inglés' ? 'Scan your receipt' : 'Escanea tu factura',
    scanDesc: language === 'Inglés' ? 'Upload your receipt and discover how much you could have saved.' : 'Sube tu factura y descubre cuánto podrías haber ahorrado.',
    scanBtn: language === 'Inglés' ? 'Scan now' : 'Escanear ahora',
    tapProduct: language === 'Inglés' ? 'Tap a product to clip it (Flipp Style)' : 'Toca un producto para recortarlo (Flipp Style)',
    noOffers: language === 'Inglés' ? 'No featured offers at this moment.' : 'No hay ofertas destacadas en este momento.',
    seeAll: language === 'Inglés' ? 'See all' : 'Ver todo'
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top Bar Header */}
        <View style={[styles.topBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Image
            source={require('../../assets/logoHome.png')}
            style={styles.logo}
          />
        </View>

        {/* Hero Card - Presupuesto disponible */}
        <View style={styles.heroWrapper}>
          <PremiumCard gradient="savings" style={styles.heroCard}>
            {/* Visual graphics */}
            <View style={styles.heroGraphicWrapper}>
              <Feather name="trending-up" size={170} color="#FFFFFF" style={styles.heroGraphic} />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{t.budget}</Text>
              <Text style={styles.heroValue}>
                RD$ {remainingBudget.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>

              <View style={[styles.heroTrendBadge, isOverBudget && { backgroundColor: 'rgba(239, 68, 68, 0.85)' }]}>
                <Feather name={isOverBudget ? 'alert-circle' : 'check-circle'} size={14} color="#FFFFFF" />
                <Text style={styles.heroTrendText}>
                  {isOverBudget
                    ? "Has excedido tu presupuesto"
                    : globalBudget > 0 ? "Dentro del presupuesto" : "Configura tu presupuesto"}
                </Text>
              </View>

              <TouchableOpacity 
                activeOpacity={0.9} 
                style={styles.heroBtn} 
                onPress={() => navigation.navigate('BudgetDashboard')}
              >
                <Text style={styles.heroBtnText}>Ver detalles</Text>
                <Feather name="chevron-right" size={18} color="#047857" />
              </TouchableOpacity>
            </View>
          </PremiumCard>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          {/* Nueva Lista */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.quickActionBtn} 
            onPress={() => {
              if (lists.length >= 3 && !isPremium) {
                navigation.navigate('Premium');
              } else {
                navigation.navigate('CreateList');
              }
            }}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="document-text" size={24} color={colors.textPrimary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t.newList}</Text>
          </TouchableOpacity>

          {/* Comparar */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.quickActionBtn} 
            onPress={() => navigation.navigate('Comparison')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="swap-horizontal" size={24} color={colors.textPrimary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t.compare}</Text>
          </TouchableOpacity>

          {/* Ofertas */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.quickActionBtn} 
            onPress={() => navigation.navigate('Alerts')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="pricetag" size={24} color={colors.textPrimary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t.offers}</Text>
          </TouchableOpacity>

          {/* Inflación */}
          <TouchableOpacity 
            activeOpacity={0.8}
            style={styles.quickActionBtn} 
            onPress={() => navigation.navigate('InflationDashboard')}
          >
            <View style={[styles.actionIconBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="trending-up" size={24} color={colors.textPrimary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.textSecondary }]}>{t.inflation}</Text>
          </TouchableOpacity>
        </View>

        {/* Banner: Escanear Factura (OCR) */}
        <View style={styles.scanBannerWrapper}>
          <PremiumCard 
            gradient="softCard"
            style={styles.scanBanner}
          >
            <View style={[styles.scanIconCircle, { backgroundColor: colors.surface }]}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <View style={[styles.scanCheckBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                <Ionicons name="camera" size={10} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.scanTextCol}>
              <Text style={[styles.scanTitle, { color: colors.textPrimary }]}>Escanea tu factura</Text>
              <Text style={[styles.scanSubtitle, { color: colors.textSecondary }]}>
                Sube tu factura y descubre cuánto podrías haber ahorrado.
              </Text>
            </View>
            <TouchableOpacity 
              activeOpacity={0.85} 
              style={[styles.scanBtn, { backgroundColor: colors.primary }]} 
              onPress={() => navigation.navigate('Scanner')}
            >
              <Text style={styles.scanBtnText}>Escanear</Text>
            </TouchableOpacity>
          </PremiumCard>
        </View>

        {/* Banner: Premium */}
        {!isPremium && (
          <View style={styles.premiumBannerWrapper}>
            <PremiumCard 
              gradient="premium" 
              style={styles.premiumBanner} 
              onPress={() => navigation.navigate('Premium')}
            >
              <View style={styles.premiumContent}>
                <Text style={styles.premiumTitle}>Pasa a Premium ✨</Text>
                <Text style={styles.premiumDesc}>
                  Desbloquea alertas ilimitadas, historial completo de tendencias e inteligencia artificial de ahorro.
                </Text>
                <View style={styles.premiumBtnRow}>
                  <Text style={styles.premiumBtnText}>Ver planes</Text>
                  <Feather name="chevron-right" size={16} color="#FFFFFF" />
                </View>
              </View>
              <View style={styles.premiumIconCol}>
                <View style={styles.premiumIconCircle}>
                  <MaterialCommunityIcons name="crown" size={38} color="#FFFFFF" />
                </View>
              </View>
            </PremiumCard>
          </View>
        )}

        {/* Ofertas que te convienen */}
        <View style={styles.sectionContainer}>
          {offers.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Folleto de Ofertas Semanales 📰</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>Toca un producto para recortarlo (Flipp Style)</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsScroll}>
                {offers.map((deal: any, i: number) => {
                  let storeColor = colors.primary;
                  if (deal.store?.toLowerCase().includes('jumbo')) storeColor = '#00B2A9';
                  if (deal.store?.toLowerCase().includes('sirena')) storeColor = '#EF4444';
                  if (deal.store?.toLowerCase().includes('bravo')) storeColor = '#3B82F6';

                  const isClipped = clippedOffers.includes(i);

                  return (
                    <PremiumCard 
                      key={i} 
                      onPress={() => toggleClip(i)} 
                      style={styles.dealCard}
                      variant="surface"
                    >
                      <View style={[styles.dealDiscountPill, { backgroundColor: colors.warning }]}>
                        <Text style={styles.dealDiscountText}>-{deal.discount}%</Text>
                      </View>
                      
                      <View style={styles.dealImageBox}>
                        {isClipped ? (
                          <View style={[styles.clipCheckOverlay, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
                            <Feather name="check" size={24} color="#FFFFFF" />
                          </View>
                        ) : (
                          <Feather name="tag" size={40} color={storeColor} style={{ opacity: 0.4 }} />
                        )}
                      </View>

                      <Text style={[styles.dealProduct, { color: colors.textPrimary }]} numberOfLines={1}>
                        {deal.product}
                      </Text>
                      <Text style={[styles.dealStore, { color: storeColor }]}>
                        {deal.store}
                      </Text>

                      <View style={styles.dealPriceRow}>
                        <Text style={[styles.dealPrice, { color: colors.primary }]}>
                          RD$ {deal.price.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                        <Text style={[styles.dealOldPrice, { color: colors.textLight }]}>
                          RD$ {deal.old.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Text>
                      </View>

                      <View style={[styles.clipBadge, { backgroundColor: isClipped ? colors.primary : colors.surfaceAlt }]}>
                        <Text style={[styles.clipBadgeText, { color: isClipped ? '#FFFFFF' : colors.textMuted }]}>
                          {isClipped ? '¡Recortado!' : 'Recortar'}
                        </Text>
                      </View>
                    </PremiumCard>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            <View style={[styles.emptyOffersContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.emptyOffersIconBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="pricetags-outline" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.emptyOffersTitle, { color: colors.textPrimary }]}>Cazando ofertas...</Text>
              <Text style={[styles.emptyOffersDesc, { color: colors.textSecondary }]}>
                Estamos escaneando los folletos de esta semana para traerte los mejores recortes. ¡Vuelve pronto!
              </Text>
              <PremiumButton 
                title="Avisarme cuando estén listas" 
                onPress={() => Alert.alert('Notificaciones', 'Te avisaremos cuando haya ofertas nuevas.')}
                variant="primary"
                style={{ width: '100%', height: 48 }}
              />
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
  },
  scroll: { 
    paddingBottom: 20 
  },
  logo: { 
    height: 150, 
    width: 290, 
    resizeMode: 'contain', 
    marginVertical: -60 
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  heroWrapper: { 
    paddingHorizontal: 20, 
    marginTop: 20, 
    marginBottom: 28 
  },
  heroCard: {
    padding: themeLayout.spacing.xl,
    overflow: 'hidden',
  },
  heroGraphicWrapper: {
    position: 'absolute', 
    right: -25, 
    top: -15, 
    opacity: 0.16 
  },
  heroGraphic: {
    transform: [{ rotate: '15deg' }]
  },
  heroContent: { 
    zIndex: 2 
  },
  heroLabel: { 
    color: 'rgba(255, 255, 255, 0.95)', 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '600', 
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  heroValue: { 
    color: '#FFFFFF', 
    fontSize: themeTypography.fontSizes.huge, 
    fontWeight: '900', 
    marginBottom: 16, 
    letterSpacing: -1 
  },
  heroTrendBadge: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: themeLayout.borderRadius.md, 
    marginBottom: 24, 
    gap: 6
  },
  heroTrendText: { 
    color: '#FFFFFF', 
    fontSize: themeTypography.fontSizes.xs, 
    fontWeight: '700' 
  },
  heroBtn: {
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    alignSelf: 'flex-start',
    paddingHorizontal: 20, 
    paddingVertical: 12, 
    borderRadius: themeLayout.borderRadius.round, 
    gap: 4,
    ...themeShadows.soft,
  },
  heroBtnText: { 
    color: '#047857', 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '800' 
  },
  quickActionsRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginBottom: 32
  },
  quickActionBtn: { 
    alignItems: 'center', 
    width: 76 
  },
  actionIconBox: {
    width: 62, 
    height: 62, 
    borderRadius: themeLayout.borderRadius.xl, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 10,
    borderWidth: 1.5,
    ...themeShadows.soft,
  },
  actionLabel: { 
    fontSize: themeTypography.fontSizes.xs, 
    textAlign: 'center', 
    fontWeight: '700', 
    letterSpacing: -0.3 
  },
  scanBannerWrapper: { 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  scanBanner: {
    padding: themeLayout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...themeShadows.soft,
  },
  scanCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  scanTextCol: { 
    flex: 1, 
    marginRight: 8 
  },
  scanTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
    marginBottom: 2 
  },
  scanSubtitle: { 
    fontSize: themeTypography.fontSizes.xs, 
    lineHeight: 16, 
    paddingRight: 4 
  },
  scanBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: themeLayout.borderRadius.md,
  },
  scanBtnText: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: '800' 
  },
  premiumBannerWrapper: { 
    paddingHorizontal: 20, 
    marginBottom: 32 
  },
  premiumBanner: {
    padding: themeLayout.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumContent: { 
    flex: 1, 
    marginRight: 16 
  },
  premiumTitle: { 
    fontSize: themeTypography.fontSizes.lg, 
    fontWeight: '800', 
    color: '#FFFFFF', 
    marginBottom: 6 
  },
  premiumDesc: { 
    fontSize: themeTypography.fontSizes.sm, 
    color: 'rgba(255,255,255,0.85)', 
    lineHeight: 18, 
    marginBottom: 12 
  },
  premiumBtnRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  premiumBtnText: { 
    color: '#FFFFFF', 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '700' 
  },
  premiumIconCol: { 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  premiumIconCircle: {
    width: 68, 
    height: 68, 
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', 
    alignItems: 'center',
  },
  sectionContainer: { 
    marginBottom: 32 
  },
  sectionHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginBottom: 16
  },
  sectionTitle: { 
    fontSize: themeTypography.fontSizes.lg, 
    fontWeight: '800' 
  },
  seeAllText: { 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '700' 
  },
  dealsScroll: { 
    paddingHorizontal: 20, 
    gap: 16 
  },
  dealCard: {
    width: 150, 
    padding: themeLayout.spacing.md,
    borderWidth: 1, 
    ...themeShadows.soft,
  },
  dealDiscountPill: {
    position: 'absolute', 
    top: 10, 
    right: 10, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: themeLayout.borderRadius.sm, 
    zIndex: 2
  },
  dealDiscountText: { 
    color: '#FFFFFF', 
    fontSize: 10, 
    fontWeight: '800' 
  },
  dealImageBox: { 
    height: 80, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  dealProduct: { 
    fontSize: themeTypography.fontSizes.sm, 
    fontWeight: '700', 
    marginBottom: 4 
  },
  dealStore: { 
    fontSize: 11, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  dealPriceRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    gap: 6, 
    marginBottom: 8 
  },
  dealPrice: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800' 
  },
  dealOldPrice: { 
    fontSize: 10, 
    textDecorationLine: 'line-through' 
  },
  clipCheckOverlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  clipBadge: {
    paddingVertical: 6,
    borderRadius: themeLayout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  clipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyOffersContainer: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: themeLayout.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyOffersIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyOffersTitle: {
    fontSize: themeTypography.fontSizes.lg,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyOffersDesc: {
    fontSize: themeTypography.fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
});
