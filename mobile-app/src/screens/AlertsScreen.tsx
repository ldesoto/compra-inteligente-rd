import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

// Interactive toggle component for alert configuration
const AlertConfigToggle = ({ icon, label, defaultActive }: { icon: any; label: string; defaultActive: boolean }) => {
  const [active, setActive] = useState(defaultActive);

  return (
    <TouchableOpacity style={styles.configRow} onPress={() => setActive(!active)} activeOpacity={0.7}>
      <View style={styles.configIconBg}>
        <Feather name={icon} size={18} color="#4B5563" />
      </View>
      <Text style={styles.configLabel}>{label}</Text>
      <View style={[styles.toggle, active && styles.toggleActive]}>
        <View style={[styles.toggleThumb, active && styles.toggleThumbActive]} />
      </View>
    </TouchableOpacity>
  );
};
import { AddToListModal } from '../components/AddToListModal';

export const AlertsScreen = ({ navigation }: any) => {
  const { fetchSmartOffers } = useAppStore();

  const [loading, setLoading] = useState(true);
  const [offersData, setOffersData] = useState<any>(null);

  // State for the Add to List Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  React.useEffect(() => {
    fetchSmartOffers().then(data => {
      setOffersData(data);
      setLoading(false);
    });
  }, []);

  const openAddModal = (offer: any) => {
    setSelectedProduct({
      canonicalProductId: offer.id,
      name: offer.productName,
      quantity: 1
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#00B2A9" />
          </TouchableOpacity>
          <Text style={styles.title}>Ofertas Inteligentes</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={{ marginTop: 12, color: '#6B7280' }}>Analizando historial de precios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title}>Ofertas Inteligentes</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <Text style={{ fontSize: 15, color: '#4B5563', lineHeight: 22, marginBottom: 24 }}>
          Nuestro motor de IA analiza el historial de precios para detectar si un descuento es real o si es una oferta engañosa.
        </Text>

        {/* Real Offers */}
        {offersData?.realOffers?.length > 0 && (
          <>
            {offersData.realOffers.map((offer: any, i: number) => (
              <View key={i} style={styles.alertCard}>
                <View style={[styles.alertIconBg, { backgroundColor: '#ECFDF5' }]}>
                  <Feather name="trending-down" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.alertMessage}>{offer.productName}</Text>
                  <Text style={styles.alertTime}>{offer.supermarket} · {offer.discountPercentage}% de descuento</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#059669' }}>RD$ {offer.currentPrice}</Text>
                    <Text style={{ fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' }}>RD$ {offer.previousPrice}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color="#00B2A9" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Fake Offers */}
        {offersData?.fakeOffers?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>🚨 Ofertas Engañosas Detectadas</Text>
            {offersData.fakeOffers.map((offer: any, i: number) => (
              <View key={i} style={[styles.alertCard, { borderColor: '#FECACA', backgroundColor: '#FEF2F2' }]}>
                <View style={[styles.alertIconBg, { backgroundColor: '#FEE2E2' }]}>
                  <Feather name="alert-triangle" size={20} color="#DC2626" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.alertMessage, { color: '#991B1B' }]}>{offer.productName}</Text>
                  <Text style={styles.alertTime}>{offer.supermarket} · Dice estar en oferta</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#DC2626' }}>RD$ {offer.currentPrice}</Text>
                    <Text style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>Precio anterior: RD$ {offer.previousPrice}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color="#00B2A9" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {/* Regular Promotions */}
        {offersData?.regularPromotions?.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>🏷️ Promociones Regulares</Text>
            {offersData.regularPromotions.map((offer: any, i: number) => (
              <View key={i} style={styles.alertCard}>
                <View style={[styles.alertIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Feather name="tag" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.alertMessage}>{offer.productName}</Text>
                  <Text style={styles.alertTime}>{offer.supermarket} · {offer.discountPercentage}% de desc.</Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: '#1F2937' }}>RD$ {offer.currentPrice}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color="#00B2A9" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        {(!offersData?.realOffers?.length && !offersData?.fakeOffers?.length && !offersData?.regularPromotions?.length) && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="tag" size={36} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Sin Ofertas Relevantes</Text>
            <Text style={styles.emptyText}>En este momento no hemos detectado ofertas reales ni descuentos falsos en la base de datos.</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <AddToListModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        productToAdd={selectedProduct}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5 },
  countBadge: { backgroundColor: '#EF4444', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  countBadgeText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 16, letterSpacing: -0.3 },

  alertCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  alertCardRead: { opacity: 0.6 },
  alertIconBg: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  alertMessage: { fontSize: 15, fontWeight: '600', color: '#1F2937', lineHeight: 20 },
  alertTime: { fontSize: 13, color: '#9CA3AF', marginTop: 4, fontWeight: '500' },
  dismissBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 40 },

  configRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 10, gap: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  configIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  configLabel: { flex: 1, fontSize: 14, color: '#1F2937', fontWeight: '600' },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#E5E7EB', padding: 3 },
  toggleActive: { backgroundColor: '#059669' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  toggleThumbActive: { transform: [{ translateX: 18 }] },
});
