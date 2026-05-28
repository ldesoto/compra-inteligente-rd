import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const navigation = useNavigation<any>();
  const { darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('pro');

  const benefits = [
    { icon: 'notifications-outline', title: 'Alertas Ilimitadas', desc: 'Recibe notificaciones en tiempo real al bajar los precios de tus productos favoritos.' },
    { icon: 'sparkles-outline', title: 'IA Predictiva Avanzada', desc: 'Recomendaciones hiper-personalizadas y análisis profundo de hábitos de consumo.' },
    { icon: 'trending-up-outline', title: 'Historial Completo', desc: 'Acceso ilimitado a tendencias e historial de precios de los últimos 12 meses.' },
    { icon: 'scan-outline', title: 'OCR Inteligente Ilimitado', desc: 'Escaneo de facturas ilimitado para seguimiento de precios automático.' },
    { icon: 'stats-chart-outline', title: 'Estrategia Multi-Tienda', desc: 'Compra inteligente dividiendo tu lista de forma automática para máximo ahorro.' },
    { icon: 'shield-checkmark-outline', title: 'Cero Publicidad', desc: 'Navega en una interfaz premium, fluida, enfocada únicamente en tu ahorro.' },
  ];

  const handleSubscribe = () => {
    // Procesa suscripción localmente
    useAppStore.setState({ isPremium: true, subscriptionStatus: 'active' });
    StatusBar.setBarStyle(darkMode ? 'light-content' : 'dark-content');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
            activeOpacity={0.8}
          >
            <Feather name="x" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Crown & Hero Glassmorphism Header */}
        <View style={styles.heroSection}>
          <PremiumCard gradient="premium" style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View style={styles.crownGlow}>
                <MaterialCommunityIcons name="crown" size={42} color="#FFFFFF" />
                <Ionicons name="sparkles" size={18} color="#FFE082" style={styles.sparkleIcon} />
              </View>
              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>Comprix Premium</Text>
                <Text style={styles.heroSubtitle}>Lleva tu ahorro inteligente al siguiente nivel</Text>
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Beneficios Exclusivos</Text>
          {benefits.map((item, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={[styles.benefitIconBox, { backgroundColor: darkMode ? '#2D1B4E' : '#F3E8FF' }]}>
                <Ionicons name={item.icon as any} size={22} color={colors.premium} />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={[styles.benefitTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.benefitDesc, { color: colors.textMuted }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans Section */}
        <View style={styles.plansContainer}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Selecciona tu plan de ahorro</Text>

          {/* Pro Plan (Yearly) */}
          <PremiumCard 
            gradient={selectedPlan === 'pro' ? 'premium' : undefined}
            onPress={() => setSelectedPlan('pro')}
            style={[
              styles.planCard,
              selectedPlan !== 'pro' && { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            {selectedPlan === 'pro' && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Más Ahorro</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.planName, 
                  { color: selectedPlan === 'pro' ? '#FFFFFF' : colors.textPrimary }
                ]}>Comprix Pro Anual</Text>
                <Text style={[
                  styles.planDesc, 
                  { color: selectedPlan === 'pro' ? '#E9D5FF' : colors.textMuted }
                ]}>Acceso total e inteligencia artificial avanzada.</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={[
                  styles.planPrice, 
                  { color: selectedPlan === 'pro' ? '#FFFFFF' : colors.textPrimary }
                ]}>RD$ 1,299<Text style={[
                  styles.planPeriod, 
                  { color: selectedPlan === 'pro' ? '#E9D5FF' : colors.textMuted }
                ]}>/año</Text></Text>
                <View style={[styles.discountBadge, { backgroundColor: selectedPlan === 'pro' ? '#FFFFFF' : '#10B981' }]}>
                  <Text style={[styles.discountText, { color: selectedPlan === 'pro' ? colors.premium : '#FFFFFF' }]}>Ahorra 28%</Text>
                </View>
              </View>
            </View>
          </PremiumCard>

          {/* Plus Plan (Monthly) */}
          <PremiumCard 
            gradient={selectedPlan === 'plus' ? 'premium' : undefined}
            onPress={() => setSelectedPlan('plus')}
            style={[
              styles.planCard,
              selectedPlan !== 'plus' && { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.planHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  styles.planName, 
                  { color: selectedPlan === 'plus' ? '#FFFFFF' : colors.textPrimary }
                ]}>Comprix Plus Mensual</Text>
                <Text style={[
                  styles.planDesc, 
                  { color: selectedPlan === 'plus' ? '#E9D5FF' : colors.textMuted }
                ]}>Todos los beneficios premium facturados mes a mes.</Text>
              </View>
              <View style={styles.planPriceCol}>
                <Text style={[
                  styles.planPrice, 
                  { color: selectedPlan === 'plus' ? '#FFFFFF' : colors.textPrimary }
                ]}>RD$ 149<Text style={[
                  styles.planPeriod, 
                  { color: selectedPlan === 'plus' ? '#E9D5FF' : colors.textMuted }
                ]}>/mes</Text></Text>
              </View>
            </View>
          </PremiumCard>
        </View>

        {/* Subscribe Footer */}
        <View style={styles.footer}>
          <Text style={[styles.trialText, { color: colors.textMuted }]}>Prueba gratis por 7 días. Cancela cuando quieras en un toque.</Text>
          <PremiumButton 
            title="Comenzar 7 días gratis" 
            onPress={handleSubscribe} 
            variant="premium"
            style={styles.subscribeBtn}
            icon={<Feather name="arrow-right" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
            iconRight
          />
          <PremiumButton 
            title="Continuar con la versión gratuita" 
            onPress={() => navigation.goBack()} 
            variant="ghost"
            style={styles.continueBtn}
            textStyle={{ color: colors.textMuted }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: themeLayout.spacing.lg,
    paddingTop: themeLayout.spacing.md,
    alignItems: 'flex-start',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    paddingHorizontal: themeLayout.spacing.lg,
    marginTop: themeLayout.spacing.sm,
    marginBottom: themeLayout.spacing.xl,
  },
  heroCard: {
    padding: themeLayout.spacing.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  crownGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    fontSize: themeTypography.fontSizes.xxl,
    fontWeight: themeTypography.fontWeights.extraBold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: themeTypography.fontSizes.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: themeTypography.fontWeights.medium,
  },
  sectionTitle: {
    fontSize: themeTypography.fontSizes.lg,
    fontWeight: themeTypography.fontWeights.extraBold,
    marginBottom: themeLayout.spacing.md,
    paddingHorizontal: themeLayout.spacing.lg,
    letterSpacing: -0.5,
  },
  benefitsContainer: {
    marginBottom: themeLayout.spacing.xl,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: themeLayout.spacing.lg,
    marginBottom: themeLayout.spacing.md,
    gap: 16,
  },
  benefitIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: themeTypography.fontSizes.md,
    fontWeight: themeTypography.fontWeights.bold,
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: themeTypography.fontSizes.sm,
    lineHeight: 20,
  },
  plansContainer: {
    paddingHorizontal: themeLayout.spacing.lg,
    marginBottom: themeLayout.spacing.xl,
    gap: 14,
  },
  planCard: {
    padding: themeLayout.spacing.lg,
    borderWidth: 1,
    borderRadius: 24,
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#FFE082',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    zIndex: 10,
  },
  popularBadgeText: {
    color: '#7C3AED',
    fontSize: 10,
    fontWeight: themeTypography.fontWeights.bold,
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  planName: {
    fontSize: themeTypography.fontSizes.md,
    fontWeight: themeTypography.fontWeights.bold,
    marginBottom: 4,
  },
  planDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: themeTypography.fontSizes.lg,
    fontWeight: themeTypography.fontWeights.extraBold,
  },
  planPeriod: {
    fontSize: themeTypography.fontSizes.xs,
    fontWeight: themeTypography.fontWeights.medium,
  },
  discountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: themeTypography.fontWeights.bold,
  },
  footer: {
    paddingHorizontal: themeLayout.spacing.lg,
    alignItems: 'center',
  },
  trialText: {
    fontSize: themeTypography.fontSizes.xs,
    marginBottom: themeLayout.spacing.md,
    fontWeight: themeTypography.fontWeights.medium,
    textAlign: 'center',
  },
  subscribeBtn: {
    width: '100%',
    marginBottom: themeLayout.spacing.xs,
  },
  continueBtn: {
    width: '100%',
  },
});
