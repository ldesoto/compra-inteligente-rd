import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function PremiumScreen() {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('pro');

  const benefits = [
    { icon: 'notifications', title: 'Alertas Ilimitadas', desc: 'Recibe notificaciones en tiempo real de bajadas de precio.' },
    { icon: 'bulb', title: 'IA Avanzada', desc: 'Recomendaciones inteligentes de ahorro según tus hábitos.' },
    { icon: 'time', title: 'Historial Completo', desc: 'Accede a toda la historia de tendencias de precio.' },
    { icon: 'document-text', title: 'OCR Premium', desc: 'Escaneo de facturas sin límites para ahorro pasivo.' },
    { icon: 'stats-chart', title: 'Comparativa Pro', desc: 'Análisis multi-supermercado automatizado.' },
    { icon: 'shield-checkmark', title: 'Sin Anuncios', desc: 'Experiencia inmersiva, limpia y rápida.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Feather name="x" size={24} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.crownContainer}>
            <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.crownGlow}>
              <MaterialCommunityIcons name="crown" size={48} color="#7C3AED" />
              <Ionicons name="sparkles" size={20} color="#C4B5FD" style={{ position: 'absolute', top: -5, right: -5 }} />
            </LinearGradient>
          </View>
          <Text style={styles.mainTitle}>Comprix <Text style={styles.purpleText}>Premium</Text></Text>
          <Text style={styles.subtitle}>Ahorra más. Compra mejor. Vive inteligente.</Text>
        </View>

        {/* Benefits Carousel/List */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Desbloquea el poder de Comprix</Text>
          {benefits.map((item, index) => (
            <View key={index} style={styles.benefitRow}>
              <View style={styles.benefitIconBox}>
                <Ionicons name={item.icon as any} size={20} color="#7C3AED" />
              </View>
              <View style={styles.benefitTextCol}>
                <Text style={styles.benefitTitle}>{item.title}</Text>
                <Text style={styles.benefitDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Plans Section */}
        <View style={styles.plansContainer}>
          {/* Pro Plan (Yearly) */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.planCard, selectedPlan === 'pro' && styles.planCardActive]}
            onPress={() => setSelectedPlan('pro')}
          >
            {selectedPlan === 'pro' && <View style={styles.planActiveBorder} />}
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>Más Popular</Text>
            </View>
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Comprix Pro</Text>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPrice}>RD$ 1,299<Text style={styles.planPeriod}>/año</Text></Text>
                <Text style={styles.planDiscount}>Ahorra 28%</Text>
              </View>
            </View>
            <Text style={styles.planDesc}>La experiencia completa con predicción de IA e insights exclusivos.</Text>
          </TouchableOpacity>

          {/* Plus Plan (Monthly) */}
          <TouchableOpacity 
            activeOpacity={0.9} 
            style={[styles.planCard, selectedPlan === 'plus' && styles.planCardActive]}
            onPress={() => setSelectedPlan('plus')}
          >
            {selectedPlan === 'plus' && <View style={styles.planActiveBorder} />}
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Comprix Plus</Text>
              <View style={styles.planPriceCol}>
                <Text style={styles.planPrice}>RD$ 149<Text style={styles.planPeriod}>/mes</Text></Text>
              </View>
            </View>
            <Text style={styles.planDesc}>Ideal para compradores frecuentes que buscan ahorrar tiempo y dinero.</Text>
          </TouchableOpacity>
        </View>

        {/* Subscribe Footer */}
        <View style={styles.footer}>
          <Text style={styles.trialText}>Prueba gratis por 7 días. Cancela cuando quieras.</Text>
          <TouchableOpacity style={styles.subscribeBtn}>
            <LinearGradient colors={['#7C3AED', '#6D28D9']} style={styles.btnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.subscribeBtnText}>Probar 7 días gratis</Text>
              <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.continueBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.continueBtnText}>Continuar con la versión gratuita</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 10,
    marginBottom: 32,
  },
  crownContainer: {
    marginBottom: 16,
  },
  crownGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  purpleText: {
    color: '#7C3AED',
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  benefitIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitTextCol: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  benefitDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  plansContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 16,
  },
  planCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  planActiveBorder: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  planPriceCol: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  planDiscount: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  planDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  trialText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    fontWeight: '500',
  },
  subscribeBtn: {
    width: '100%',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  btnGradient: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 18,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  continueBtn: {
    paddingVertical: 12,
  },
  continueBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  }
});
