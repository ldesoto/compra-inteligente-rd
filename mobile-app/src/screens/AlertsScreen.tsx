import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { PremiumCard } from '../components/PremiumCard';
import { AddToListModal } from '../components/AddToListModal';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export const AlertsScreen = ({ navigation }: any) => {
  const { fetchSmartOffers, darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

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
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => navigation.goBack()} 
            style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
          >
            <Feather name="chevron-left" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Ofertas Inteligentes</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.warning} />
          <Text style={{ marginTop: 12, color: colors.textMuted, fontWeight: '500' }}>
            Analizando historial de precios...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={[styles.title, { color: colors.textPrimary }]}>Ofertas Inteligentes</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Nuestro motor de IA analiza el historial de precios para detectar si un descuento es real o si es una oferta engañosa.
        </Text>

        {/* Real Offers */}
        {offersData?.realOffers?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>💎 Ofertas Reales Recomendadas</Text>
            {offersData.realOffers.map((offer: any, i: number) => (
              <PremiumCard 
                key={i} 
                variant="surface"
                style={styles.alertCard}
              >
                <View style={[styles.alertIconBg, { backgroundColor: colors.primaryLight }]}>
                  <Feather name="trending-down" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>{offer.productName}</Text>
                  <Text style={[styles.alertTime, { color: colors.textMuted }]}>
                    {offer.supermarket} · {offer.discountPercentage}% de descuento
                  </Text>
                </View>
                <View style={styles.alertRightRow}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.priceText, { color: colors.primary }]}>RD$ {offer.currentPrice}</Text>
                    <Text style={[styles.oldPriceText, { color: colors.textLight }]}>RD$ {offer.previousPrice}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.addBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        )}

        {/* Fake Offers */}
        {offersData?.fakeOffers?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🚨 Ofertas Engañosas Detectadas</Text>
            {offersData.fakeOffers.map((offer: any, i: number) => (
              <PremiumCard 
                key={i} 
                variant="surface"
                style={[
                  styles.alertCard, 
                  { 
                    borderColor: colors.danger, 
                    borderWidth: 1.5,
                    backgroundColor: darkMode ? '#2D191E' : '#FFF5F5' 
                  }
                ]}
              >
                <View style={[styles.alertIconBg, { backgroundColor: colors.dangerLight }]}>
                  <Feather name="alert-triangle" size={20} color={colors.danger} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.alertMessage, { color: darkMode ? '#FFA1A1' : '#991B1B' }]}>
                    {offer.productName}
                  </Text>
                  <Text style={[styles.alertTime, { color: colors.textMuted }]}>
                    {offer.supermarket} · Dice estar en oferta
                  </Text>
                </View>
                <View style={styles.alertRightRow}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.priceText, { color: colors.danger }]}>RD$ {offer.currentPrice}</Text>
                    <Text style={[styles.fakeDetailText, { color: colors.textMuted }]}>
                      Anterior: RD$ {offer.previousPrice}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.addBtn, { backgroundColor: colors.dangerLight }]}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        )}

        {/* Regular Promotions */}
        {offersData?.regularPromotions?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>🏷️ Promociones Regulares</Text>
            {offersData.regularPromotions.map((offer: any, i: number) => (
              <PremiumCard 
                key={i} 
                variant="surface"
                style={styles.alertCard}
              >
                <View style={[styles.alertIconBg, { backgroundColor: colors.warningLight }]}>
                  <Feather name="tag" size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.alertMessage, { color: colors.textPrimary }]}>{offer.productName}</Text>
                  <Text style={[styles.alertTime, { color: colors.textMuted }]}>
                    {offer.supermarket} · {offer.discountPercentage}% de desc.
                  </Text>
                </View>
                <View style={styles.alertRightRow}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.regularPriceText, { color: colors.textPrimary }]}>RD$ {offer.currentPrice}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.addBtn, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => openAddModal(offer)}
                  >
                    <Feather name="plus" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
          </View>
        )}

        {(!offersData?.realOffers?.length && !offersData?.fakeOffers?.length && !offersData?.regularPromotions?.length) && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="tag" size={36} color={colors.textLight} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin Ofertas Relevantes</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              En este momento no hemos detectado ofertas reales ni descuentos falsos en la base de datos.
            </Text>
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
  subtitle: {
    fontSize: themeTypography.fontSizes.sm, 
    lineHeight: 22, 
    marginBottom: 24,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
    marginBottom: 16, 
    letterSpacing: -0.3 
  },
  alertCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: themeLayout.spacing.md, 
    marginBottom: 12, 
    borderWidth: 1,
    ...themeShadows.soft,
  },
  alertIconBg: { 
    width: 46, 
    height: 46, 
    borderRadius: themeLayout.borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  alertMessage: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '600', 
    lineHeight: 20 
  },
  alertTime: { 
    fontSize: 12, 
    marginTop: 4, 
    fontWeight: '500' 
  },
  alertRightRow: {
    alignItems: 'center', 
    flexDirection: 'row', 
    gap: 12 
  },
  priceText: {
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
  },
  oldPriceText: {
    fontSize: 11, 
    textDecorationLine: 'line-through' 
  },
  regularPriceText: {
    fontSize: 14, 
    fontWeight: '800', 
  },
  fakeDetailText: {
    fontSize: 10, 
    marginTop: 4,
    fontWeight: '600',
  },
  addBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 60 
  },
  emptyIconBg: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: themeTypography.fontSizes.lg, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: themeTypography.fontSizes.sm, 
    textAlign: 'center', 
    lineHeight: 22, 
    paddingHorizontal: 40 
  },
});
