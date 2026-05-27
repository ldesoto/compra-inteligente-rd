import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../components/BottomTabBar';
import api from '../services/api';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { currentList, comparisonResult, offers, alerts, user, promotions, fetchLists, fetchDashboardData, fetchBudgetAnalysis, darkMode, language } = useAppStore();
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

  const globalBudget = budgetData?.monthlyBudget || 0;
  const globalSpent = budgetData?.totalEstimatedCost || 0;
  const remainingBudget = globalBudget > 0 ? (globalBudget - globalSpent) : 0;
  const isOverBudget = remainingBudget < 0;

  const forceScrape = async () => {
    setIsScraping(true);
    try {
      await api.get('/promotions/force');
      await fetchDashboardData(); // Refresca los datos en la app
    } catch (err) {
      console.warn('Error al forzar scraping', err);
    }
    setIsScraping(false);
  };

  const unreadAlerts = alerts.filter(a => !a.read).length;

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

  const theme = {
    bg: darkMode ? '#0F172A' : '#FAFAFA',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    textMuted: darkMode ? '#94A3B8' : '#64748B',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    border: darkMode ? '#334155' : '#E2E8F0',
    scanBg: darkMode ? '#064E3B' : '#F0FDF4',
    scanText: darkMode ? '#ECFDF5' : '#064E3B'
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Flipp Style Top Bar Header */}
        <View style={styles.topBar}>
          <View style={{ width: 30 }} />

          <Image
            source={require('../../assets/logoHome.png')}
            style={{ height: 150, width: 290, resizeMode: 'contain', marginVertical: -60 }}
          />

          <TouchableOpacity
            style={[styles.topBarRight, { width: 30, justifyContent: 'flex-end' }]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="user" size={24} color="#64748B" />
          </TouchableOpacity>
        </View>





        {/* Hero Card - Ahorro Total */}
        <View style={styles.heroWrapper}>
          <LinearGradient
            colors={['#047857', '#10B981']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Background Graphic 1: Big Arrow */}
            <View style={{ position: 'absolute', right: -30, top: -20, opacity: 0.15 }}>
              <Feather name="trending-up" size={180} color="#FFFFFF" style={{ transform: [{ rotate: '15deg' }] }} />
            </View>

            {/* Background Graphic 2: Floating sparkles */}
            <View style={{ position: 'absolute', right: 80, bottom: 20, opacity: 0.25 }}>
              <Ionicons name="sparkles" size={40} color="#FFFFFF" />
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>{t.budget}</Text>
              <Text style={styles.heroValue}>RD$ {remainingBudget.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>

              <View style={[styles.heroTrendBadge, isOverBudget && { backgroundColor: 'rgba(239,68,68,0.8)' }]}>
                {!isOverBudget && <Feather name="check-circle" size={14} color="#FFFFFF" />}
                {isOverBudget && <Feather name="alert-circle" size={14} color="#FFFFFF" />}
                <Text style={styles.heroTrendText}>
                  {isOverBudget
                    ? "Has excedido tu presupuesto"
                    : globalBudget > 0 ? "Dentro del presupuesto" : "Configura tu presupuesto"}
                </Text>
              </View>

              <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('BudgetDashboard')}>
                <Text style={styles.heroBtnText}>Ver detalles</Text>
                <Feather name="chevron-right" size={18} color="#047857" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('CreateList')}>
            <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.actionIconBox}>
              <Ionicons name="document-text" size={24} color="#0F172A" />
            </LinearGradient>
            <Text style={[styles.actionLabel, { color: theme.textMuted }]}>{t.newList}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Comparison')}>
            <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.actionIconBox}>
              <Ionicons name="swap-horizontal" size={24} color="#0F172A" />
            </LinearGradient>
            <Text style={[styles.actionLabel, { color: theme.textMuted }]}>{t.compare}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => Alert.alert('Próximamente', 'La sección de Ofertas estará disponible muy pronto.')}>
            <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.actionIconBox}>
              <Ionicons name="pricetag" size={24} color="#0F172A" />
            </LinearGradient>
            <Text style={[styles.actionLabel, { color: theme.textMuted }]}>{t.offers}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('InflationDashboard')}>
            <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.actionIconBox}>
              <Ionicons name="trending-up" size={24} color="#0F172A" />
            </LinearGradient>
            <Text style={[styles.actionLabel, { color: theme.textMuted }]}>{t.inflation}</Text>
          </TouchableOpacity>
        </View>

        {/* Banner: Escanear Factura (Cashback/Ahorro pasivo) */}
        <View style={styles.scanBannerWrapper}>
          <View style={[styles.scanBanner, { backgroundColor: '#F4FBF7' }]}>
            <View style={styles.scanIconCircle}>
              <Ionicons name="document-text-outline" size={24} color="#059669" />
              <View style={styles.scanCheckBadge}><Ionicons name="camera" size={10} color="#FFF" /></View>
            </View>
            <View style={styles.scanTextCol}>
              <Text style={styles.scanTitle}>Escanea tu factura</Text>
              <Text style={styles.scanSubtitle}>Sube tu factura y descubre cuánto podrías haber ahorrado.</Text>
            </View>
            <TouchableOpacity style={styles.scanBtn} onPress={() => navigation.navigate('Scanner')}>
              <Text style={styles.scanBtnText}>Escanear ahora</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanDecorativeCircle} onPress={() => navigation.navigate('Scanner')}>
              <Ionicons name="scan" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner: Premium */}
        <TouchableOpacity style={styles.premiumBannerWrapper} onPress={() => navigation.navigate('Premium')}>
          <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.premiumBanner}>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Pasa a <Text style={{ color: '#7C3AED' }}>Premium</Text></Text>
              <Text style={styles.premiumDesc}>Desbloquea alertas ilimitadas, historial completo, IA inteligente y mucho más.</Text>
              <View style={styles.premiumBtnRow}>
                <Text style={styles.premiumBtnText}>Ver planes</Text>
                <Feather name="chevron-right" size={16} color="#7C3AED" />
              </View>
            </View>
            <View style={styles.premiumIconCol}>
              <View style={styles.premiumIconCircle}>
                <MaterialCommunityIcons name="crown" size={42} color="#8B5CF6" />
                <Ionicons name="sparkles" size={16} color="#C4B5FD" style={styles.premiumSparkle1} />
                <Ionicons name="sparkles" size={12} color="#C4B5FD" style={styles.premiumSparkle2} />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Ofertas que te convienen */}
        {/* Ofertas que te convienen */}
        <View style={styles.sectionContainer}>
          {offers.length > 0 ? (
            <>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Folleto de Ofertas Semanales 📰</Text>
                  <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Toca un producto para recortarlo (Flipp Style)</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                  <Text style={styles.seeAllText}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dealsScroll}>
                {offers.map((deal: any, i: number) => {
                  let color = '#94A3B8';
                  if (deal.store?.toLowerCase().includes('jumbo')) color = '#00B2A9';
                  if (deal.store?.toLowerCase().includes('sirena')) color = '#EF4444';
                  if (deal.store?.toLowerCase().includes('bravo')) color = '#3B82F6';

                  const isClipped = clippedOffers.includes(i);

                  return (
                    <TouchableOpacity key={i} activeOpacity={0.8} onPress={() => toggleClip(i)} style={styles.dealCard}>
                      <View style={styles.dealDiscountPill}>
                        <Text style={styles.dealDiscountText}>-{deal.discount}%</Text>
                      </View>
                      <View style={[styles.dealImageBox, isClipped && styles.clippedCircleBorder]}>
                        {isClipped ? (
                          <View style={styles.clipCheckOverlay}>
                            <Feather name="check" size={24} color="#FFFFFF" />
                          </View>
                        ) : (
                          <Feather name="tag" size={40} color={color} opacity={0.5} />
                        )}
                      </View>
                      <Text style={styles.dealProduct} numberOfLines={1}>{deal.product}</Text>
                      <Text style={[styles.dealStore, { color }]}>{deal.store}</Text>

                      <View style={styles.dealPriceRow}>
                        <Text style={styles.dealPrice}>RD$ {deal.price.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                        <Text style={styles.dealOldPrice}>RD$ {deal.old.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      </View>

                      <View style={[styles.clipBadge, { backgroundColor: isClipped ? '#00B2A9' : '#F1F5F9' }]}>
                        <Text style={[styles.clipBadgeText, { color: isClipped ? '#FFFFFF' : '#64748B' }]}>
                          {isClipped ? '¡Recortado!' : 'Recortar'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            <View style={styles.emptyOffersContainer}>
              <View style={styles.emptyOffersIconBox}>
                <Ionicons name="pricetags-outline" size={32} color="#00B2A9" />
              </View>
              <Text style={styles.emptyOffersTitle}>Cazando ofertas...</Text>
              <Text style={styles.emptyOffersDesc}>
                Estamos escaneando los folletos de esta semana para traerte los mejores recortes. ¡Vuelve pronto!
              </Text>
              <TouchableOpacity style={styles.emptyOffersBtn} onPress={() => Alert.alert('Notificaciones', 'Te avisaremos cuando haya ofertas nuevas.')}>
                <Text style={styles.emptyOffersBtnText}>Avisarme cuando estén listas</Text>
              </TouchableOpacity>
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
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  scroll: { paddingBottom: 20 },

  greetingContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  greetingSubtext: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },

  // Flipp Style Header & Tabs
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBarLeftText: {
    fontSize: 13,
    color: '#00B2A9',
    fontWeight: '700',
  },
  flippLogo: {
    fontSize: 22,
    color: '#00B2A9',
    fontFamily: 'System',
    fontWeight: '800',
    letterSpacing: -1,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBarRightText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },


  heroWrapper: { paddingHorizontal: 20, marginTop: 16, marginBottom: 28 },
  heroCard: {
    borderRadius: 28, padding: 28,
    shadowColor: '#047857', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 8,
    flexDirection: 'row', overflow: 'hidden'
  },
  heroContent: { flex: 1, zIndex: 2 },
  heroLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '600', marginBottom: 6 },
  heroValue: { color: '#FFFFFF', fontSize: 40, fontWeight: '900', marginBottom: 16, letterSpacing: -1 },
  heroTrendBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 24, gap: 6
  },
  heroTrendText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  heroBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', alignSelf: 'flex-start',
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  heroBtnText: { color: '#047857', fontSize: 15, fontWeight: '800' },

  quickActionsRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 32
  },
  quickActionBtn: { alignItems: 'center', width: 75 },
  actionIconBox: {
    width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 10,
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)'
  },
  actionLabel: { fontSize: 13, color: '#334155', textAlign: 'center', fontWeight: '700', letterSpacing: -0.3 },

  scanBannerWrapper: { paddingHorizontal: 20, marginBottom: 20 },
  scanBanner: {
    backgroundColor: '#F4FBF7',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  scanCheckBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#047857',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4FBF7',
  },
  scanTextCol: { flex: 1, marginRight: 8 },
  scanTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  scanSubtitle: { fontSize: 11, color: '#047857', lineHeight: 14, paddingRight: 4 },
  scanBtn: {
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 8,
  },
  scanBtnText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  scanDecorativeCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  premiumBannerWrapper: { paddingHorizontal: 20, marginBottom: 32 },
  premiumBanner: {
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumContent: { flex: 1, marginRight: 16 },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  premiumDesc: { fontSize: 13, color: '#4C1D95', lineHeight: 18, marginBottom: 12, opacity: 0.8 },
  premiumBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  premiumBtnText: { color: '#7C3AED', fontSize: 14, fontWeight: '700' },
  premiumIconCol: { justifyContent: 'center', alignItems: 'center' },
  premiumIconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center', alignItems: 'center',
  },
  premiumSparkle1: { position: 'absolute', top: 10, right: 10 },
  premiumSparkle2: { position: 'absolute', bottom: 15, left: 10 },

  sectionContainer: { marginBottom: 32 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, marginBottom: 16
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  seeAllText: { fontSize: 14, color: '#00B2A9', fontWeight: '600' },
  editBtnText: { fontSize: 14, color: '#00B2A9', fontWeight: '600' },


  dealsScroll: { paddingHorizontal: 20, gap: 16 },
  dealCard: {
    width: 140, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 16,
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  dealDiscountPill: {
    position: 'absolute', top: 12, right: 12, backgroundColor: '#F59E0B',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, zIndex: 1
  },
  dealDiscountText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  dealImageBox: { height: 80, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  dealProduct: { fontSize: 13, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  dealStore: { fontSize: 11, fontWeight: '600', marginBottom: 8 },
  dealPriceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  dealPrice: { fontSize: 16, fontWeight: '800', color: '#00B2A9' },
  dealOldPrice: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },

  // Flipp Style Clip Effects
  clippedCircleBorder: {
    borderWidth: 2,
    borderColor: '#00B2A9',
    borderStyle: 'dashed',
    borderRadius: 40,
    width: 80,
    height: 80,
    alignSelf: 'center',
  },
  clipCheckOverlay: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00B2A9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00B2A9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  clipBadge: {
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  clipBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Empty State Offers
  emptyOffersContainer: {
    marginHorizontal: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  emptyOffersIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyOffersTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptyOffersDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  emptyOffersBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyOffersBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  }
});
