import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../components/BottomTabBar';

const { width } = Dimensions.get('window');

export const HomeScreen = ({ navigation }: any) => {
  const { currentList, comparisonResult, monthlySavings, offers, alerts, fetchLists, fetchDashboardData } = useAppStore();
  const [clippedOffers, setClippedOffers] = React.useState<number[]>([]);

  React.useEffect(() => {
    fetchLists();
    fetchDashboardData();
  }, []);

  const unreadAlerts = alerts.filter(a => !a.read).length;

  const toggleClip = (id: number) => {
    if (clippedOffers.includes(id)) {
      setClippedOffers(clippedOffers.filter(x => x !== id));
    } else {
      setClippedOffers([...clippedOffers, id]);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* Flipp Style Top Bar Header */}
        <View style={styles.topBar}>
          <View style={{ width: 30 }} />
          
          <Image 
            source={require('../../assets/comprix-logo.png')} 
            style={{ height: 95, width: 280, resizeMode: 'contain', marginVertical: -25 }} 
          />
          
          <TouchableOpacity 
            style={[styles.topBarRight, { width: 30, justifyContent: 'flex-end' }]} 
            onPress={() => navigation.navigate('Profile')}
          >
            <Feather name="settings" size={22} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Flipp Style Horizontal Sub-header Tabs */}
        <View style={styles.subHeaderWrapper}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.subHeaderTabs}
            nestedScrollEnabled={true}
          >
            <TouchableOpacity style={styles.subHeaderTab} onPress={() => navigation.navigate('Home')}>
              <Feather name="heart" size={16} color="#EF4444" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.subHeaderTab, styles.activeSubHeaderTab]}>
              <Text style={[styles.subHeaderTabText, styles.activeSubHeaderTabText]}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subHeaderTab} onPress={() => navigation.navigate('Alerts')}>
              <Text style={styles.subHeaderTabText}>Ofertas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subHeaderTab} onPress={() => navigation.navigate('BudgetDashboard')}>
              <Text style={styles.subHeaderTabText}>Ahorros</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subHeaderTab} onPress={() => navigation.navigate('InflationDashboard')}>
              <Text style={styles.subHeaderTabText}>Inflación</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.subHeaderTab} onPress={() => navigation.navigate('Search')}>
              <Text style={styles.subHeaderTabText}>Supermercados</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Hero Card - Ahorro Total */}
        <View style={styles.heroWrapper}>
          <LinearGradient 
            colors={['#00B2A9', '#009088']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Ahorro total este mes</Text>
              <Text style={styles.heroValue}>RD$ {monthlySavings.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              {monthlySavings > 0 ? (
                <View style={styles.heroTrend}>
                  <Feather name="arrow-up" size={14} color="#E6F8F7" />
                  <Text style={styles.heroTrendText}>Ahorro detectado este mes</Text>
                </View>
              ) : (
                <View style={styles.heroTrend}>
                  <Text style={styles.heroTrendText}>Sin ahorros registrados aún</Text>
                </View>
              )}
            </View>
            {/* Decoration Icon */}
            <View style={styles.heroIconDecoration}>
              <Ionicons name="bag-handle" size={80} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>
        </View>

        {/* Acciones Rápidas */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => {
            const name = `Compra ${new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}`;
            useAppStore.getState().createList(name);
            navigation.navigate('ListDetail');
          }}>
            <View style={[styles.actionIconBox, { backgroundColor: '#E6F8F7' }]}>
              <Feather name="clipboard" size={24} color="#00B2A9" />
            </View>
            <Text style={styles.actionLabel}>Nueva lista</Text>
          </TouchableOpacity>

          {/* FEATURE FLAG: OCR_SCANNER 
          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Scanner')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Feather name="camera" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionLabel}>Escanear{"\n"}factura</Text>
          </TouchableOpacity>
          */}

          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Search')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#F5F3FF' }]}>
              <Feather name="shuffle" size={24} color="#8B5CF6" />
            </View>
            <Text style={styles.actionLabel}>Comparar{"\n"}producto</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionBtn} onPress={() => navigation.navigate('Alerts')}>
            <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Feather name="tag" size={24} color="#F97316" />
            </View>
            <Text style={styles.actionLabel}>Ver ofertas</Text>
          </TouchableOpacity>
        </View>

        {/* Tus Favoritos Section (Flipp 2-column Grid) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Tus Favoritos</Text>
            <TouchableOpacity>
              <Text style={styles.editBtnText}>Editar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.favouritesGrid}>
            {/* Card 1: Jumbo */}
            <TouchableOpacity style={styles.favCard} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
              <View style={styles.favCardHeader}>
                <View style={[styles.favLogoCircle, { backgroundColor: '#FF8200' }]}>
                  <Text style={styles.favLogoText}>J</Text>
                </View>
                <Text style={styles.favStoreName}>Jumbo</Text>
              </View>
              <LinearGradient colors={['#FFFFFF', '#FFF7ED']} style={styles.favCardContent}>
                <Text style={styles.favCardTitle}>Hasta 40% Ahorro</Text>
                <Text style={styles.favCardSub}>En frutas y vegetales</Text>
                <Ionicons name="basket-outline" size={44} color="#FF8200" style={styles.favCardIcon} />
              </LinearGradient>
              <View style={styles.favCardFooter}>
                <Text style={[styles.favStatusText, { color: '#00B2A9' }]}>Precios actualizados</Text>
              </View>
            </TouchableOpacity>

            {/* Card 2: La Sirena */}
            <TouchableOpacity style={styles.favCard} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
              <View style={styles.favCardHeader}>
                <View style={[styles.favLogoCircle, { backgroundColor: '#EF4444' }]}>
                  <Text style={styles.favLogoText}>S</Text>
                </View>
                <Text style={styles.favStoreName}>La Sirena</Text>
              </View>
              <LinearGradient colors={['#FFFFFF', '#FEF2F2']} style={styles.favCardContent}>
                <Text style={styles.favCardTitle}>Feria de Limpieza</Text>
                <Text style={styles.favCardSub}>Detergentes y jabón</Text>
                <Ionicons name="sparkles-outline" size={44} color="#EF4444" style={styles.favCardIcon} />
              </LinearGradient>
              <View style={styles.favCardFooter}>
                <Text style={[styles.favStatusText, { color: '#EF4444' }]}>Termina hoy</Text>
              </View>
            </TouchableOpacity>

            {/* Card 3: Nacional */}
            <TouchableOpacity style={styles.favCard} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
              <View style={styles.favCardHeader}>
                <View style={[styles.favLogoCircle, { backgroundColor: '#008B47' }]}>
                  <Text style={styles.favLogoText}>N</Text>
                </View>
                <Text style={styles.favStoreName}>Nacional</Text>
              </View>
              <LinearGradient colors={['#FFFFFF', '#F0FDF4']} style={styles.favCardContent}>
                <Text style={styles.favCardTitle}>Especial de Carnes</Text>
                <Text style={styles.favCardSub}>Cortes selectos</Text>
                <Ionicons name="restaurant-outline" size={44} color="#008B47" style={styles.favCardIcon} />
              </LinearGradient>
              <View style={styles.favCardFooter}>
                <Text style={[styles.favStatusText, { color: '#00B2A9' }]}>Nuevo</Text>
              </View>
            </TouchableOpacity>

            {/* Card 4: Plaza Lama */}
            <TouchableOpacity style={styles.favCard} activeOpacity={0.9} onPress={() => navigation.navigate('Search')}>
              <View style={styles.favCardHeader}>
                <View style={[styles.favLogoCircle, { backgroundColor: '#EAB308' }]}>
                  <Text style={styles.favLogoText}>P</Text>
                </View>
                <Text style={styles.favStoreName}>Plaza Lama</Text>
              </View>
              <LinearGradient colors={['#FFFFFF', '#FEFCE8']} style={styles.favCardContent}>
                <Text style={styles.favCardTitle}>Súper Ofertas</Text>
                <Text style={styles.favCardSub}>Lácteos y despensa</Text>
                <Ionicons name="nutrition-outline" size={44} color="#EAB308" style={styles.favCardIcon} />
              </LinearGradient>
              <View style={styles.favCardFooter}>
                <Text style={[styles.favStatusText, { color: '#16A34A' }]}>Vista previa</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ofertas que te convienen */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Folleto de Ofertas Semanales 📰</Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Toca un producto para recortarlo (Flipp Style)</Text>
            </View>
            {offers.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Alerts')}>
                <Text style={styles.seeAllText}>Ver todas</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {offers.length > 0 ? (
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
          ) : (
            <View style={{ marginHorizontal: 24, padding: 20, backgroundColor: '#F8FAFC', borderRadius: 16, alignItems: 'center' }}>
              <Text style={{ color: '#64748B' }}>No hay ofertas destacadas en este momento.</Text>
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
  subHeaderWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  subHeaderTabs: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  subHeaderTab: {
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSubHeaderTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#00B2A9',
    paddingBottom: 2,
  },
  subHeaderTabText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  activeSubHeaderTabText: {
    color: '#00B2A9',
    fontWeight: '800',
  },

  heroWrapper: { paddingHorizontal: 20, marginTop: 16, marginBottom: 28 },
  heroCard: { 
    borderRadius: 24, padding: 24, 
    shadowColor: '#00B2A9', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
    flexDirection: 'row', overflow: 'hidden'
  },
  heroContent: { flex: 1, zIndex: 2 },
  heroLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '500', marginBottom: 8 },
  heroValue: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  heroTrend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroTrendText: { color: '#E6F8F7', fontSize: 13, fontWeight: '500' },
  heroIconDecoration: { position: 'absolute', right: -10, bottom: -10, zIndex: 1 },

  quickActionsRow: { 
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 32 
  },
  quickActionBtn: { alignItems: 'center', width: 70 },
  actionIconBox: { 
    width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 
  },
  actionLabel: { fontSize: 12, color: '#475569', textAlign: 'center', fontWeight: '500', lineHeight: 16 },

  sectionContainer: { marginBottom: 32 },
  sectionHeader: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingHorizontal: 20, marginBottom: 16 
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  seeAllText: { fontSize: 14, color: '#00B2A9', fontWeight: '600' },
  editBtnText: { fontSize: 14, color: '#00B2A9', fontWeight: '600' },

  // Favourites Grid (2-column layout like Flipp)
  favouritesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    gap: 16,
  },
  favCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  favCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  favLogoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  favLogoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  favStoreName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  favCardContent: {
    height: 110,
    padding: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  favCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    zIndex: 2,
  },
  favCardSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    maxWidth: '85%',
    zIndex: 2,
  },
  favCardIcon: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    opacity: 0.15,
  },
  favCardFooter: {
    padding: 10,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  favStatusText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },

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
  }
});
