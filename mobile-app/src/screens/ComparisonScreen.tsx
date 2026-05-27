import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Dimensions, Share, Linking, Platform, Alert, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Map of supermarket names to their approximate coordinates in Santo Domingo
const SUPERMARKET_LOCATIONS: Record<string, { lat: number; lng: number; address: string }> = {
  'jumbo':       { lat: 18.4861, lng: -69.9312, address: 'Jumbo, Av. 27 de Febrero, Santo Domingo' },
  'nacional':    { lat: 18.4721, lng: -69.9417, address: 'Supermercados Nacional, Santo Domingo' },
  'la sirena':   { lat: 18.4795, lng: -69.9009, address: 'La Sirena, Av. San Martín, Santo Domingo' },
  'plaza lama':  { lat: 18.4736, lng: -69.9512, address: 'Plaza Lama, Santo Domingo' },
};

const getStoreColor = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('jumbo'))    return '#FF8200';
  if (lower.includes('sirena'))   return '#EF4444';
  if (lower.includes('nacional')) return '#008B47';
  if (lower.includes('lama'))     return '#EAB308';
  return '#00B2A9';
};

export const ComparisonScreen = ({ navigation }: any) => {
  const { comparisonResult } = useAppStore();
  const [selectedStore, setSelectedStore] = React.useState<any>(null);

  if (!comparisonResult || !comparisonResult.comparison || comparisonResult.comparison.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.empty}>
          <View style={styles.emptyIconBg}>
            <Feather name="bar-chart-2" size={48} color="#00B2A9" />
          </View>
          <Text style={styles.emptyTitle}>Sin datos de comparación</Text>
          <Text style={styles.emptySubtitle}>Agrega productos a tu lista para comparar precios entre supermercados.</Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backHomeBtnText}>Ir a mi lista</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { maxSavings, savingsPercentage, comparison, splitStrategy } = comparisonResult;
  const recommendedStore = comparison[0];
  
  const bestSplitStrategy = splitStrategy || {
    total: recommendedStore.totalCost * 0.95,
    storeTotals: {
      [recommendedStore.supermarketName]: recommendedStore.totalCost * 0.7,
      'Alternativo': recommendedStore.totalCost * 0.25
    },
    stores: []
  };

  // ─── Share Handler ─────────────────────────────────────────────────────────
  const handleShare = async () => {
    const otherStores = comparison.slice(1).map((s: any, i: number) =>
      `  #${i + 2} ${s.supermarketName}: RD$ ${s.totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`
    ).join('\n');

    const message = 
      `🛒 Comprix\n\n` +
      `Encontré un ahorro de RD$ ${(comparisonResult.comparison[comparisonResult.comparison.length - 1].totalCost - recommendedStore.totalCost).toLocaleString('es-DO')}.\n\n` +
      `✅ Más barato: ${recommendedStore.supermarketName} (RD$ ${recommendedStore.totalCost.toLocaleString('es-DO')})\n` +
      `💰 Ahorro vs otras opciones: RD$ ${maxSavings.toLocaleString('es-DO', { minimumFractionDigits: 2 })}\n\n` +
      `Descarga Comprix y ahorra en tus compras del supermercado.`;

    try {
      await Share.share({ message, title: 'Mi Ahorro en Comprix' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo compartir.');
    }
  };

  // ─── Map Handler ───────────────────────────────────────────────────────────
  const handleOpenMap = () => {
    const storeName = recommendedStore.supermarketName.toLowerCase();
    const location = Object.entries(SUPERMARKET_LOCATIONS).find(([key]) => storeName.includes(key));
    
    let mapsUrl: string;
    if (location) {
      const { lat, lng, address } = location[1];
      if (Platform.OS === 'ios') {
        mapsUrl = `maps://?q=${encodeURIComponent(address)}&ll=${lat},${lng}`;
      } else {
        mapsUrl = `geo:${lat},${lng}?q=${encodeURIComponent(address)}`;
      }
    } else {
      // Fallback: search by name
      const query = encodeURIComponent(`${recommendedStore.supermarketName} Santo Domingo`);
      if (Platform.OS === 'ios') {
        mapsUrl = `maps://?q=${query}`;
      } else {
        mapsUrl = `geo:0,0?q=${query}`;
      }
    }

    Linking.canOpenURL(mapsUrl).then(supported => {
      if (supported) {
        Linking.openURL(mapsUrl);
      } else {
        // Fallback to Google Maps web
        const query = encodeURIComponent(`${recommendedStore.supermarketName} Santo Domingo`);
        Linking.openURL(`https://www.google.com/maps/search/${query}`);
      }
    });
  };

  const storeColor = getStoreColor(recommendedStore.supermarketName);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Feather name="x" size={20} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tu Ahorro</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Feather name="share-2" size={20} color="#00B2A9" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        
        {/* Winner Hero Card */}
        <View style={styles.winnerContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => setSelectedStore(recommendedStore)}>
            <LinearGradient 
              colors={['#0F172A', '#1E3A4A']} 
              style={styles.winnerCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
            {/* Shine overlay */}
            <View style={styles.shineCircle1} />
            <View style={styles.shineCircle2} />

            <View style={styles.winnerTopRow}>
              <View style={styles.winnerBadge}>
                <Feather name="star" size={12} color="#F59E0B" />
                <Text style={styles.winnerBadgeText}>RECOMENDADO</Text>
              </View>
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>#1</Text>
              </View>
            </View>
            
            <View style={styles.storeLogoRow}>
              <View style={[styles.storeLogoCircle, { backgroundColor: storeColor }]}>
                <Text style={styles.storeLogoLetter}>
                  {recommendedStore.supermarketName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.winnerName}>{recommendedStore.supermarketName}</Text>
            </View>

            <Text style={styles.winnerPriceLabel}>PRECIO TOTAL ESTIMADO</Text>
            <Text style={styles.winnerPrice}>
              <Text style={styles.winnerCurrency}>RD$ </Text>
              {recommendedStore.totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>

            <View style={styles.savingsBox}>
              <LinearGradient colors={['#00B2A9', '#009088']} style={styles.savingsIcon}>
                <Feather name="arrow-down" size={18} color="#FFFFFF" />
              </LinearGradient>
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.savingsLabel}>Te ahorras hasta</Text>
                <Text style={styles.savingsAmount}>
                  RD$ {maxSavings.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {savingsPercentage ? <Text style={styles.savingsPct}>  {savingsPercentage.toFixed(1)}%</Text> : null}
                </Text>
              </View>
            </View>
          </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Other Options */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Otras opciones</Text>
            <Text style={styles.sectionSubtitle}>Comparativa directa</Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.altScroll}
            nestedScrollEnabled={true}
          >
            {comparison.slice(1).map((store: any, i: number) => {
              const color = getStoreColor(store.supermarketName);
              const diff = store.totalCost - recommendedStore.totalCost;
              return (
                <TouchableOpacity key={i} style={styles.altCard} onPress={() => setSelectedStore(store)} activeOpacity={0.8}>
                  <View style={styles.altCardTop}>
                    <View style={[styles.altLogo, { backgroundColor: color }]}>
                      <Text style={styles.altLogoLetter}>{store.supermarketName.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.altRank}>#{i + 2}</Text>
                  </View>
                  <Text style={styles.altStoreName} numberOfLines={1}>{store.supermarketName}</Text>
                  <Text style={styles.altPrice}>
                    RD$ {store.totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={styles.altDiffPill}>
                    <Feather name="arrow-up" size={10} color="#EF4444" />
                    <Text style={styles.altDiffText}>+RD$ {diff.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  </View>
                  {store.missingItemsCount > 0 ? (
                    <View style={[styles.altStatusPill, { backgroundColor: '#FEF2F2' }]}>
                      <Feather name="alert-circle" size={10} color="#EF4444" />
                      <Text style={[styles.altStatusText, { color: '#EF4444' }]}>Faltan {store.missingItemsCount}</Text>
                    </View>
                  ) : (
                    <View style={[styles.altStatusPill, { backgroundColor: '#E6F8F7' }]}>
                      <Feather name="check" size={10} color="#00B2A9" />
                      <Text style={[styles.altStatusText, { color: '#00B2A9' }]}>Lista completa</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Max Savings Hack */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hack de Ahorro Máximo</Text>
            <Text style={styles.sectionSubtitle}>Comprando en varios lugares</Text>
          </View>

          <View style={styles.hackCard}>
            <View style={styles.hackHeader}>
              <View style={styles.hackIconBox}>
                <Feather name="zap" size={22} color="#F59E0B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.hackTitle}>Estrategia Dividida</Text>
                <Text style={styles.hackSubtitle}>La ruta más barata posible</Text>
              </View>
            </View>

            <View style={styles.hackTotalBox}>
              <Text style={styles.hackTotalLabel}>TOTAL OPTIMIZADO</Text>
              <Text style={styles.hackTotalValue}>
                RD$ {bestSplitStrategy.total.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>

            {bestSplitStrategy.stores ? bestSplitStrategy.stores.map((store: any, i: number, arr: any[]) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: '#00B2A9' }]} />
                  {i !== arr.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStore}>{store.name}</Text>
                  <Text style={styles.timelineAmount}>
                    RD$ {store.subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={styles.timelineItemList}>
                    {store.items?.map((item: any, idx: number) => (
                      <View key={idx} style={styles.timelineItemRow}>
                        <Text style={styles.timelineItemName}>• {item.name}</Text>
                        <Text style={styles.timelineItemPrice}>RD$ {item.totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )) : Object.entries(bestSplitStrategy.storeTotals).map(([name, amount], i, arr) => (
              <View key={i} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: '#00B2A9' }]} />
                  {i !== arr.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStore}>{name as string}</Text>
                  <Text style={styles.timelineAmount}>
                    RD$ {(amount as number).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 130 }} />
      </ScrollView>

      {/* Sticky Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.mapBtn} onPress={handleOpenMap} activeOpacity={0.85}>
          <LinearGradient colors={['#00B2A9', '#009088']} style={styles.mapBtnGradient}>
            <Ionicons name="map-outline" size={20} color="#FFFFFF" />
            <Text style={styles.mapBtnText}>Ver Ruta en Mapa</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Store Details Modal */}
      <Modal visible={!!selectedStore} animationType="slide" transparent={true} onRequestClose={() => setSelectedStore(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStore?.supermarketName}</Text>
              <TouchableOpacity onPress={() => setSelectedStore(null)} style={styles.modalCloseBtn}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.modalSummary}>
                <Text style={styles.modalSummaryLabel}>Costo Total</Text>
                <Text style={styles.modalSummaryValue}>RD$ {selectedStore?.totalCost?.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              </View>
              
              <Text style={styles.modalSectionTitle}>Disponibles ({selectedStore?.foundItems?.length || 0})</Text>
              {selectedStore?.foundItems?.map((item: any, idx: number) => (
                <View key={idx} style={styles.modalItemRow}>
                  <View style={styles.modalItemLeft}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemQty}>Cant: {item.quantity}</Text>
                  </View>
                  <Text style={styles.modalItemPrice}>RD$ {item.totalCost.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
                </View>
              ))}

              {selectedStore?.missingItems?.length > 0 && (
                <>
                  <Text style={[styles.modalSectionTitle, { color: '#EF4444', marginTop: 16 }]}>Faltan ({selectedStore.missingItems.length})</Text>
                  {selectedStore.missingItems.map((item: string, idx: number) => (
                    <View key={idx} style={styles.modalMissingRow}>
                      <Feather name="alert-circle" size={16} color="#EF4444" />
                      <Text style={styles.modalMissingName}>{item}</Text>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },

  // ─── Header ────────────────────────────────────────────────────────────────
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8FAFC', 
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },

  scroll: { paddingBottom: 40 },

  // ─── Winner Card ───────────────────────────────────────────────────────────
  winnerContainer: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 28 },
  winnerCard: { 
    borderRadius: 28, padding: 24, overflow: 'hidden',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 12 }, 
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
  },
  shineCircle1: { 
    position: 'absolute', top: -80, right: -80, width: 200, height: 200, 
    borderRadius: 100, backgroundColor: 'rgba(0,178,169,0.08)' 
  },
  shineCircle2: { 
    position: 'absolute', bottom: -60, left: -60, width: 160, height: 160, 
    borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.03)' 
  },
  winnerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  winnerBadge: { 
    flexDirection: 'row', alignItems: 'center', gap: 6, 
    backgroundColor: 'rgba(245,158,11,0.15)', paddingHorizontal: 10, paddingVertical: 5, 
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)' 
  },
  winnerBadgeText: { color: '#FCD34D', fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  rankBadge: { 
    width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.1)', 
    justifyContent: 'center', alignItems: 'center' 
  },
  rankBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  
  storeLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  storeLogoCircle: { 
    width: 40, height: 40, borderRadius: 20, 
    justifyContent: 'center', alignItems: 'center' 
  },
  storeLogoLetter: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  winnerName: { fontSize: 28, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  
  winnerPriceLabel: { 
    fontSize: 11, color: '#94A3B8', fontWeight: '700', 
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 
  },
  winnerPrice: { fontSize: 42, fontWeight: '900', color: '#00B2A9', letterSpacing: -1.5, marginBottom: 20 },
  winnerCurrency: { fontSize: 20, fontWeight: '700', color: '#00B2A9' },

  savingsBox: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 16 
  },
  savingsIcon: { 
    width: 40, height: 40, borderRadius: 14, 
    justifyContent: 'center', alignItems: 'center' 
  },
  savingsLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '600', marginBottom: 2 },
  savingsAmount: { fontSize: 18, color: '#FFFFFF', fontWeight: '900' },
  savingsPct: { fontSize: 14, color: '#00B2A9', fontWeight: '800' },

  // ─── Sections ──────────────────────────────────────────────────────────────
  sectionContainer: { marginBottom: 24 },
  sectionHeader: { paddingHorizontal: 20, marginBottom: 14 },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  sectionSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500', marginTop: 2 },

  // ─── Alternative Cards ─────────────────────────────────────────────────────
  altScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  altCard: { 
    width: width * 0.44, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, 
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 3,
  },
  altCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  altLogo: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  altLogoLetter: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  altRank: { fontSize: 13, fontWeight: '800', color: '#CBD5E1' },
  altStoreName: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 4 },
  altPrice: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  altDiffPill: { 
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FEF2F2', alignSelf: 'flex-start', 
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 6
  },
  altDiffText: { fontSize: 10, color: '#EF4444', fontWeight: '800' },
  altStatusPill: { 
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 
  },
  altStatusText: { fontSize: 10, fontWeight: '700' },

  // ─── Hack Card ─────────────────────────────────────────────────────────────
  hackCard: { 
    marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, 
    borderWidth: 1, borderColor: '#E6F8F7',
    shadowColor: '#00B2A9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4,
  },
  hackHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 },
  hackIconBox: { 
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FEF9E7', 
    justifyContent: 'center', alignItems: 'center' 
  },
  hackTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  hackSubtitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  hackTotalBox: { 
    backgroundColor: '#F0FDFC', borderRadius: 16, padding: 16, 
    marginBottom: 20, alignItems: 'center', borderWidth: 1, borderColor: '#BFF3F0' 
  },
  hackTotalLabel: { fontSize: 11, fontWeight: '800', color: '#00B2A9', letterSpacing: 1, marginBottom: 6 },
  hackTotalValue: { fontSize: 32, fontWeight: '900', color: '#00B2A9', letterSpacing: -1 },
  
  timelineItem: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, zIndex: 10 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#BFF3F0', marginTop: 2, marginBottom: 0 },
  timelineContent: { flex: 1, paddingBottom: 20, marginTop: -2 },
  timelineStore: { fontSize: 15, fontWeight: '800', color: '#1E293B', marginBottom: 2 },
  timelineAmount: { fontSize: 14, fontWeight: '800', color: '#00B2A9' },

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: { 
    position: 'absolute', bottom: 0, left: 0, right: 0, 
    padding: 20, paddingBottom: 34,
    backgroundColor: 'rgba(248,250,252,0.95)',
    borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  mapBtn: { 
    borderRadius: 20, overflow: 'hidden',
    shadowColor: '#00B2A9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8,
  },
  mapBtnGradient: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', 
    gap: 10, paddingVertical: 18 
  },
  mapBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },

  // ─── Empty State ───────────────────────────────────────────────────────────
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyIconBg: { 
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#E6F8F7', 
    justifyContent: 'center', alignItems: 'center', marginBottom: 20 
  },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  backHomeBtn: { backgroundColor: '#00B2A9', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 18 },
  backHomeBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  timelineItemList: { marginTop: 8, paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: '#E2E8F0' },
  timelineItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  timelineItemName: { fontSize: 13, color: '#64748B', flex: 1 },
  timelineItemPrice: { fontSize: 13, color: '#0F172A', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  modalCloseBtn: { padding: 4 },
  modalScroll: { paddingBottom: 40 },
  modalSummary: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 20, alignItems: 'center' },
  modalSummaryLabel: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 },
  modalSummaryValue: { fontSize: 28, fontWeight: '900', color: '#00B2A9' },
  modalSectionTitle: { fontSize: 16, fontWeight: '800', color: '#1E293B', marginBottom: 12 },
  modalItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemLeft: { flex: 1, paddingRight: 16 },
  modalItemName: { fontSize: 15, fontWeight: '600', color: '#334155', marginBottom: 2 },
  modalItemQty: { fontSize: 13, color: '#94A3B8' },
  modalItemPrice: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  modalMissingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalMissingName: { fontSize: 15, color: '#EF4444', fontWeight: '500' },
});
