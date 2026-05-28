import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';
import { ModernInput } from '../components/ModernInput';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export const ProfileScreen = ({ navigation }: any) => {
  const { 
    user, monthlySavings, logout, updateProfile, alerts, 
    darkMode, setDarkMode, language, setLanguage, isPremium
  } = useAppStore();
  
  const colors = darkMode ? themeColors.dark : themeColors.light;

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [isSettingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isSavingsModalVisible, setSavingsModalVisible] = useState(false);
  const [isSecurityModalVisible, setSecurityModalVisible] = useState(false);
  
  const [editName, setEditName] = useState(user?.name || '');
  const [editBudget, setEditBudget] = useState(user?.monthlyBudget ? String(user.monthlyBudget) : '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings States
  const [currency, setCurrency] = useState('RD$');
  const [notifications, setNotifications] = useState(true);
  
  // Extreme Savings States
  const [extremeMode, setExtremeMode] = useState(false);
  const [autoSubstitute, setAutoSubstitute] = useState(true);
  const [maxDistance, setMaxDistance] = useState('5 km');
  const [favoriteSupermarket, setFavoriteSupermarket] = useState('Nacional');
  const [preferredUnit, setPreferredUnit] = useState('Libras (lbs)');
  const [summaryFrequency, setSummaryFrequency] = useState('Semanal');
  const [subscribedCategories, setSubscribedCategories] = useState('4 Activas');
  
  // Security States
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  
  // Privacy States
  const [locationPerm, setLocationPerm] = useState(true);
  const [cameraPerm, setCameraPerm] = useState(true);
  const [ocrCloud, setOcrCloud] = useState(false);
  
  // AI States
  const [aiEnabled, setAiEnabled] = useState(true);
  const [aiRecommendations, setAiRecommendations] = useState(true);
  const [aiPredictions, setAiPredictions] = useState(true);
  const [aiHabits, setAiHabits] = useState(false);
  
  // Extra Notification States
  const [emailAlerts, setEmailAlerts] = useState(false);

  const unreadAlertsCount = alerts.filter(a => !a.read).length;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const result = await updateProfile({
      name: editName,
      monthlyBudget: editBudget ? parseFloat(editBudget) : null
    });
    setIsSaving(false);
    
    if (result.success) {
      setEditModalVisible(false);
    } else {
      Alert.alert('Error', result.error || 'No se pudo guardar el perfil');
    }
  };

  const t = {
    profile: language === 'Inglés' ? 'My Profile' : 'Mi Perfil',
    edit: language === 'Inglés' ? 'Edit' : 'Editar',
    freeAccount: language === 'Inglés' ? 'Free Account' : 'Cuenta Gratis',
    totalSavings: language === 'Inglés' ? 'Total Savings This Year' : 'Ahorro Total Este Año',
    premiumTitle: language === 'Inglés' ? 'Upgrade to Premium' : 'Pasa a Premium',
    premiumDesc: language === 'Inglés' ? 'Unlock unlimited alerts, advanced AI, and exclusive comparisons.' : 'Desbloquea alertas ilimitadas, historial avanzado, IA inteligente y comparaciones exclusivas.',
    seePlans: language === 'Inglés' ? 'View Plans' : 'Ver Planes',
    sectionPurchases: language === 'Inglés' ? 'PURCHASES & SAVINGS' : 'COMPRAS Y AHORRO',
    sectionPreferences: language === 'Inglés' ? 'PREFERENCES' : 'PREFERENCIAS',
    sectionAdmin: language === 'Inglés' ? 'ADMINISTRATION' : 'ADMINISTRACIÓN',
    sectionHelp: language === 'Inglés' ? 'HELP' : 'AYUDA',
    logout: language === 'Inglés' ? 'Log Out' : 'Cerrar Sesión',
    favSupermarket: language === 'Inglés' ? 'Favorite Supermarkets' : 'Supermercados Favoritos',
    budgetDash: language === 'Inglés' ? 'Monthly Savings Panel' : 'Panel de Ahorro Mensual',
    smartAlerts: language === 'Inglés' ? 'Smart Alerts' : 'Alertas Inteligentes',
    advSettings: language === 'Inglés' ? 'Advanced Settings' : 'Configuración Avanzada',
    extremeMode: language === 'Inglés' ? 'Extreme Savings Mode' : 'Modo Ahorro Extremo',
    security: language === 'Inglés' ? 'Security & Privacy' : 'Seguridad y Privacidad',
    adminConsole: language === 'Inglés' ? 'Admin Console' : 'Consola Administrativa',
    support: language === 'Inglés' ? 'Support Center' : 'Centro de Soporte',
    whatsapp: language === 'Inglés' ? 'Contact via WhatsApp' : 'Contactar por WhatsApp',
    alertLogout: language === 'Inglés' ? 'Are you sure you want to securely log out?' : '¿Estás seguro que deseas cerrar tu sesión de forma segura?',
    cancel: language === 'Inglés' ? 'Cancel' : 'Cancelar',
    yes: language === 'Inglés' ? 'Yes, exit' : 'Sí, salir'
  };

  const handleLogout = () => {
    Alert.alert(
      t.logout,
      t.alertLogout,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.yes, style: 'destructive', onPress: () => {
          logout();
          navigation.replace('Login');
        }},
      ]
    );
  };

  const handlePremium = () => {
    navigation.navigate('Premium');
  };

  const handleSoon = (feature: string) => {
    Alert.alert('Próximamente', `La sección de "${feature}" estará disponible en la próxima actualización premium.`);
  };

  const adminEmails = ['luismanuelj27@gmail.com', 'ldesotoflota@gmail.com'];
  const userEmail = user?.email?.toLowerCase()?.trim() || '';
  const isAdmin = adminEmails.includes(userEmail);

  const MenuItem = ({ icon, label, onPress, color, badge, showBorder = true, iconType = 'feather' }: any) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[
        styles.menuItem, 
        showBorder && { borderBottomWidth: 1, borderBottomColor: colors.border }
      ]} 
      onPress={onPress}
    >
      <View style={[styles.menuIconBox, { backgroundColor: colors.surfaceAlt }]}>
        {iconType === 'feather' ? (
          <Feather name={icon} size={18} color={color} />
        ) : (
          <Ionicons name={icon} size={18} color={color} />
        )}
      </View>
      <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>{label}</Text>
      {badge && (
        <View style={[styles.menuBadge, { backgroundColor: colors.dangerLight }]}>
          <Text style={[styles.menuBadgeText, { color: colors.danger }]}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Fixed Header */}
      <View style={[styles.topHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t.profile}</Text>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => {
            setEditName(user?.name || '');
            setEditBudget(user?.monthlyBudget ? String(user.monthlyBudget) : '');
            setEditModalVisible(true);
          }} 
          style={[styles.editBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Text style={[styles.editBtnText, { color: colors.primary }]}>{t.edit}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* User Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
              <View style={[styles.onlineBadge, { borderColor: colors.background }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name || 'Usuario Comprix'}</Text>
              <Text style={[styles.userEmail, { color: colors.textMuted }]}>{user?.email || 'usuario@comprix.do'}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={colors.textLight} />
                <Text style={[styles.locationText, { color: colors.textMuted }]}>Santo Domingo, RD</Text>
                <View style={[styles.dotSeparator, { backgroundColor: colors.textLight }]} />
                <Text style={[styles.accountTypeText, { color: colors.primary }]}>{t.freeAccount}</Text>
              </View>
            </View>
          </View>
          
          <PremiumCard variant="surface" style={styles.savingsCard}>
            <View style={[styles.savingsIcon, { backgroundColor: colors.primaryLight }]}>
              <Feather name="trending-down" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.savingsTitle, { color: colors.textLight }]}>{t.totalSavings}</Text>
              <Text style={[styles.savingsValue, { color: colors.primary }]}>
                {currency} {monthlySavings.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          </PremiumCard>
        </View>

        {/* Premium Banner (Revolut/Apple Style) */}
        {!isPremium && (
          <View style={styles.premiumBannerWrapper}>
            <PremiumCard gradient="premium" style={styles.premiumBanner}>
              <View style={styles.premiumHeaderRow}>
                <Text style={styles.premiumTitle}>{t.premiumTitle}</Text>
                <View style={[styles.proBadge, { backgroundColor: 'rgba(255, 255, 255, 0.25)' }]}>
                  <Text style={styles.proBadgeText}>PRO</Text>
                </View>
              </View>
              <Text style={styles.premiumDesc}>{t.premiumDesc}</Text>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.featureItem}>
                  <Feather name="check" size={14} color="#C4B5FD" />
                  <Text style={styles.featureText}>{language === 'Inglés' ? 'UNLIMITED Alerts' : 'Alertas ILIMITADAS'}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Feather name="check" size={14} color="#C4B5FD" />
                  <Text style={styles.featureText}>{language === 'Inglés' ? 'Predictive AI' : 'IA predictiva'}</Text>
                </View>
                <View style={styles.featureItem}>
                  <Feather name="check" size={14} color="#C4B5FD" />
                  <Text style={styles.featureText}>{language === 'Inglés' ? 'No Ads' : 'Sin anuncios'}</Text>
                </View>
              </View>

              <TouchableOpacity 
                activeOpacity={0.9}
                style={styles.premiumBtn}
                onPress={handlePremium}
              >
                <Text style={[styles.premiumBtnText, { color: colors.premium }]}>{t.seePlans}</Text>
                <Feather name="arrow-right" size={16} color={colors.premium} />
              </TouchableOpacity>
            </PremiumCard>
          </View>
        )}

        {/* COMPRAS Y AHORRO */}
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t.sectionPurchases}</Text>
        <PremiumCard variant="surface" style={styles.menuCard}>
          <MenuItem icon="heart" color={colors.danger} label={t.favSupermarket} onPress={() => handleSoon('Favoritos')} />
          <MenuItem icon="bar-chart-2" color={colors.primary} label={t.budgetDash} onPress={() => navigation.navigate('BudgetDashboard')} />
          <MenuItem 
            icon="bell" 
            color={colors.warning} 
            label={t.smartAlerts} 
            badge={unreadAlertsCount > 0 ? (language === 'Inglés' ? `${unreadAlertsCount} new` : `${unreadAlertsCount} nuevas`) : null} 
            onPress={() => navigation.navigate('Alerts')} 
            showBorder={false}
          />
        </PremiumCard>

        {/* PREFERENCIAS */}
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t.sectionPreferences}</Text>
        <PremiumCard variant="surface" style={styles.menuCard}>
          <MenuItem icon="settings" color={colors.textMuted} label={t.advSettings} onPress={() => setSettingsModalVisible(true)} />
          <MenuItem icon="sliders" color={colors.info} label={t.extremeMode} onPress={() => setSavingsModalVisible(true)} />
          <MenuItem icon="shield" color={colors.primary} label={t.security} onPress={() => setSecurityModalVisible(true)} showBorder={false} />
        </PremiumCard>

        {/* ADMIN */}
        {isAdmin && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t.sectionAdmin}</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <MenuItem icon="cpu" color="#8B5CF6" label={t.adminConsole} onPress={() => navigation.navigate('Admin')} showBorder={false} />
            </PremiumCard>
          </>
        )}

        {/* SOPORTE */}
        <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{t.sectionHelp}</Text>
        <PremiumCard variant="surface" style={styles.menuCard}>
          <MenuItem icon="help-circle" color={colors.premium} label={t.support} onPress={() => handleSoon('Soporte')} />
          <MenuItem icon="message-circle" color={colors.primary} label={t.whatsapp} onPress={() => handleSoon('WhatsApp')} showBorder={false} />
        </PremiumCard>

        {/* LOGOUT */}
        <PremiumButton 
          title={t.logout} 
          onPress={handleLogout} 
          variant="outline"
          icon={<Feather name="log-out" size={18} color={colors.danger} style={{ marginRight: 8 }} />}
          style={[styles.logoutBtn, { borderColor: colors.danger, backgroundColor: colors.surface }]}
          textStyle={{ color: colors.danger }}
        />

        <Text style={[styles.versionText, { color: colors.textLight }]}>Comprix v1.0.0 • DR 🇩🇴</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(15, 23, 42, 0.4)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}>
                <Feather name="x" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ModernInput 
              label="Nombre Completo"
              iconName="user"
              value={editName}
              onChangeText={setEditName}
              placeholder="Ej. Luis De Soto"
            />

            <ModernInput 
              label="Presupuesto Mensual (RD$)"
              iconName="dollar-sign"
              value={editBudget}
              onChangeText={setEditBudget}
              placeholder="Ej. 18000"
              keyboardType="numeric"
            />

            <PremiumButton 
              title="Guardar Cambios" 
              onPress={handleSaveProfile} 
              variant="primary"
              loading={isSaving}
              style={{ width: '100%', marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* Advanced Settings Modal */}
      <Modal visible={isSettingsModalVisible} animationType="slide" transparent={true}>
        <View style={[styles.fullModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.fullModalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="chevron-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: colors.textPrimary }]}>{language === 'Inglés' ? 'Settings' : 'Configuración'}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>{language === 'Inglés' ? 'GENERAL' : 'GENERAL'}</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Moneda Preferida', 'Selecciona la moneda principal', [
                  { text: 'RD$', onPress: () => setCurrency('RD$') },
                  { text: 'USD$', onPress: () => setCurrency('USD$') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Moneda Preferida</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.settingsValue, { color: colors.textMuted }]}>{currency}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textLight} />
                </View>
              </TouchableOpacity>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Notificaciones Push</Text>
                <TouchableOpacity onPress={() => setNotifications(!notifications)}>
                  <Feather name={notifications ? "toggle-right" : "toggle-left"} size={32} color={notifications ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>

            <Text style={[styles.sectionTitle, { color: colors.textLight, marginTop: 24 }]}>COMPRAS</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Supermercado Favorito', 'Elige tu principal', [
                  { text: 'Nacional', onPress: () => setFavoriteSupermarket('Nacional') },
                  { text: 'Jumbo', onPress: () => setFavoriteSupermarket('Jumbo') },
                  { text: 'Bravo', onPress: () => setFavoriteSupermarket('Bravo') },
                  { text: 'Sirena', onPress: () => setFavoriteSupermarket('Sirena') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Supermercado Favorito</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.settingsValue, { color: colors.textMuted }]}>{favoriteSupermarket}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textLight} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Radio de Distancia', 'Distancia máxima para sugerencias', [
                  { text: '1 km', onPress: () => setMaxDistance('1 km') },
                  { text: '3 km', onPress: () => setMaxDistance('3 km') },
                  { text: '5 km', onPress: () => setMaxDistance('5 km') },
                  { text: '10 km', onPress: () => setMaxDistance('10 km') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Radio de Distancia</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.settingsValue, { color: colors.textMuted }]}>{maxDistance}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textLight} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Unidad Preferida', 'Medida por defecto para productos', [
                  { text: 'Libras (lbs)', onPress: () => setPreferredUnit('Libras (lbs)') },
                  { text: 'Kilos (kg)', onPress: () => setPreferredUnit('Kilos (kg)') },
                  { text: 'Onzas (oz)', onPress: () => setPreferredUnit('Onzas (oz)') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Unidad Preferida</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={[styles.settingsValue, { color: colors.textMuted }]}>{preferredUnit}</Text>
                  <Feather name="chevron-right" size={16} color={colors.textLight} />
                </View>
              </TouchableOpacity>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Modo Ahorro Extremo</Text>
                <TouchableOpacity onPress={() => setExtremeMode(!extremeMode)}>
                  <Feather name={extremeMode ? "toggle-right" : "toggle-left"} size={32} color={extremeMode ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Sustituciones Automáticas</Text>
                <TouchableOpacity onPress={() => setAutoSubstitute(!autoSubstitute)}>
                  <Feather name={autoSubstitute ? "toggle-right" : "toggle-left"} size={32} color={autoSubstitute ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>

            <Text style={[styles.sectionTitle, { color: colors.textLight, marginTop: 24 }]}>PRIVACIDAD</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Permisos de Ubicación</Text>
                <TouchableOpacity onPress={() => setLocationPerm(!locationPerm)}>
                  <Feather name={locationPerm ? "toggle-right" : "toggle-left"} size={32} color={locationPerm ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Acceso a Cámara</Text>
                <TouchableOpacity onPress={() => setCameraPerm(!cameraPerm)}>
                  <Feather name={cameraPerm ? "toggle-right" : "toggle-left"} size={32} color={cameraPerm ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Procesamiento OCR en Nube</Text>
                <TouchableOpacity onPress={() => setOcrCloud(!ocrCloud)}>
                  <Feather name={ocrCloud ? "toggle-right" : "toggle-left"} size={32} color={ocrCloud ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>

            <Text style={[styles.sectionTitle, { color: colors.textLight, marginTop: 24 }]}>INTELIGENCIA ARTIFICIAL</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Asistente IA Activado</Text>
                <TouchableOpacity onPress={() => setAiEnabled(!aiEnabled)}>
                  <Feather name={aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiEnabled ? colors.premium : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Recomendaciones Inteligentes</Text>
                <TouchableOpacity onPress={() => setAiRecommendations(!aiRecommendations)} disabled={!aiEnabled}>
                  <Feather name={aiRecommendations && aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiRecommendations && aiEnabled ? colors.premium : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Predicciones de Precios</Text>
                <TouchableOpacity onPress={() => setAiPredictions(!aiPredictions)} disabled={!aiEnabled}>
                  <Feather name={aiPredictions && aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiPredictions && aiEnabled ? colors.premium : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>

            <Text style={[styles.sectionTitle, { color: colors.textLight, marginTop: 24 }]}>NOTIFICACIONES</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Alertas Push</Text>
                <TouchableOpacity onPress={() => setNotifications(!notifications)}>
                  <Feather name={notifications ? "toggle-right" : "toggle-left"} size={32} color={notifications ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Alertas por Email</Text>
                <TouchableOpacity onPress={() => setEmailAlerts(!emailAlerts)}>
                  <Feather name={emailAlerts ? "toggle-right" : "toggle-left"} size={32} color={emailAlerts ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Extreme Savings Modal */}
      <Modal visible={isSavingsModalVisible} animationType="slide" transparent={true}>
        <View style={[styles.fullModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.fullModalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSavingsModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="chevron-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: colors.textPrimary }]}>Modo Ahorro Extremo</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <View style={styles.savingsHero}>
              <View style={[styles.savingsHeroIcon, { backgroundColor: colors.warningLight }]}>
                <Feather name="zap" size={32} color={colors.warning} />
              </View>
              <Text style={[styles.savingsHeroTitle, { color: colors.textPrimary }]}>Maximiza tus ahorros</Text>
              <Text style={[styles.savingsHeroDesc, { color: colors.textSecondary }]}>
                Al activar este modo, la IA priorizará marcas blancas y los descuentos más agresivos sin importar la marca original del producto.
              </Text>
            </View>

            <PremiumCard variant="surface" style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Activar Ahorro Extremo</Text>
                <TouchableOpacity onPress={() => setExtremeMode(!extremeMode)}>
                  <Feather name={extremeMode ? "toggle-right" : "toggle-left"} size={32} color={extremeMode ? colors.warning : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Sustitución Automática</Text>
                <TouchableOpacity onPress={() => setAutoSubstitute(!autoSubstitute)}>
                  <Feather name={autoSubstitute ? "toggle-right" : "toggle-left"} size={32} color={autoSubstitute ? colors.warning : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Radio de Búsqueda</Text>
                <Text style={[styles.settingsValue, { color: colors.warning }]}>{maxDistance}</Text>
              </View>
            </PremiumCard>
          </ScrollView>
        </View>
      </Modal>

      {/* Security Modal */}
      <Modal visible={isSecurityModalVisible} animationType="slide" transparent={true}>
        <View style={[styles.fullModalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.fullModalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setSecurityModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="chevron-down" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: colors.textPrimary }]}>Seguridad</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <Text style={[styles.sectionTitle, { color: colors.textLight }]}>ACCESO</Text>
            <PremiumCard variant="surface" style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Face ID / Biometría</Text>
                <TouchableOpacity onPress={() => setBiometrics(!biometrics)}>
                  <Feather name={biometrics ? "toggle-right" : "toggle-left"} size={32} color={biometrics ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: colors.textPrimary }]}>Autenticación 2 Pasos</Text>
                <TouchableOpacity onPress={() => setTwoFactor(!twoFactor)}>
                  <Feather name={twoFactor ? "toggle-right" : "toggle-left"} size={32} color={twoFactor ? colors.primary : colors.textLight} />
                </TouchableOpacity>
              </View>
            </PremiumCard>
          </ScrollView>
        </View>
      </Modal>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
  },
  topHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 24, 
    paddingTop: 16, 
    paddingBottom: 10 
  },
  headerTitle: { 
    fontSize: themeTypography.fontSizes.xxl, 
    fontWeight: '900', 
    letterSpacing: -1 
  },
  editBtn: { 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: themeLayout.borderRadius.round 
  },
  editBtnText: { 
    fontWeight: '800', 
    fontSize: 13 
  },
  scroll: { 
    padding: 24, 
    paddingTop: 10 
  },
  profileHeader: { 
    marginBottom: 24 
  },
  profileInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    marginBottom: 20 
  },
  avatar: { 
    width: 68, 
    height: 68, 
    borderRadius: 34, 
    justifyContent: 'center', 
    alignItems: 'center', 
    ...themeShadows.soft, 
  },
  avatarText: { 
    fontSize: themeTypography.fontSizes.xxl, 
    fontWeight: '900', 
    color: '#FFFFFF' 
  },
  onlineBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    width: 16, 
    height: 16, 
    borderRadius: 8, 
    backgroundColor: '#10B981', 
    borderWidth: 3, 
  },
  userName: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '800', 
    marginBottom: 2, 
    letterSpacing: -0.5 
  },
  userEmail: { 
    fontSize: 14, 
    marginBottom: 6, 
    fontWeight: '500' 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  locationText: { 
    fontSize: 12, 
    fontWeight: '500' 
  },
  dotSeparator: { 
    width: 4, 
    height: 4, 
    borderRadius: 2, 
    marginHorizontal: 4 
  },
  accountTypeText: { 
    fontSize: 12, 
    fontWeight: '700' 
  },
  savingsCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    borderWidth: 1, 
    ...themeShadows.soft,
  },
  savingsIcon: { 
    width: 46, 
    height: 46, 
    borderRadius: themeLayout.borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  savingsTitle: { 
    fontSize: 11, 
    fontWeight: '700', 
    textTransform: 'uppercase', 
    letterSpacing: 0.5, 
    marginBottom: 2 
  },
  savingsValue: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '900', 
    letterSpacing: -0.5 
  },
  premiumBannerWrapper: { 
    marginBottom: 32, 
    ...themeShadows.premium,
  },
  premiumBanner: { 
    padding: themeLayout.spacing.lg, 
  },
  premiumHeaderRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginBottom: 8 
  },
  premiumTitle: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '900', 
    color: '#FFFFFF', 
    letterSpacing: -0.5 
  },
  proBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: themeLayout.borderRadius.sm 
  },
  proBadgeText: { 
    color: '#FFFFFF', 
    fontSize: 10, 
    fontWeight: '900', 
    letterSpacing: 1 
  },
  premiumDesc: { 
    color: '#DDD6FE', 
    fontSize: 13, 
    lineHeight: 20, 
    marginBottom: 20, 
    fontWeight: '500' 
  },
  premiumFeatures: { 
    gap: 10, 
    marginBottom: 24 
  },
  featureItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  featureText: { 
    color: '#F5F3FF', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  premiumBtn: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: themeLayout.borderRadius.md, 
    paddingVertical: 14, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  premiumBtnText: { 
    fontWeight: '900', 
    fontSize: 14 
  },
  sectionTitle: { 
    fontSize: 11, 
    fontWeight: '800', 
    marginLeft: 8, 
    marginBottom: 10, 
    letterSpacing: 1, 
    textTransform: 'uppercase' 
  },
  menuCard: { 
    paddingHorizontal: 20, 
    marginBottom: 28, 
    borderWidth: 1, 
    ...themeShadows.soft,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    gap: 14 
  },
  menuIconBox: { 
    width: 38, 
    height: 38, 
    borderRadius: themeLayout.borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuLabel: { 
    flex: 1, 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '600', 
  },
  menuBadge: { 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: themeLayout.borderRadius.round 
  },
  menuBadgeText: { 
    fontSize: 11, 
    fontWeight: '800' 
  },
  logoutBtn: { 
    width: '100%',
    height: 52,
    marginBottom: 24, 
    borderWidth: 1.5,
  },
  versionText: { 
    textAlign: 'center', 
    fontSize: 12, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    padding: 24, 
    paddingBottom: 40, 
    ...themeShadows.medium,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 24 
  },
  modalTitle: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '900', 
    letterSpacing: -0.5 
  },
  modalCloseBtn: { 
    width: 36, 
    height: 36, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  fullModalContainer: { 
    flex: 1, 
    marginTop: 40, 
    borderTopLeftRadius: 28, 
    borderTopRightRadius: 28, 
    ...themeShadows.medium,
  },
  fullModalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    paddingVertical: 20, 
    borderBottomWidth: 1, 
  },
  fullModalTitle: { 
    fontSize: themeTypography.fontSizes.lg, 
    fontWeight: '800', 
  },
  fullModalScroll: { 
    padding: 24 
  },
  settingsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderBottomWidth: 1, 
  },
  settingsLabel: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '600', 
  },
  settingsValue: { 
    fontSize: 14, 
    fontWeight: '700', 
  },
  savingsHero: { 
    alignItems: 'center', 
    marginBottom: 32, 
    paddingHorizontal: 20 
  },
  savingsHeroIcon: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  savingsHeroTitle: { 
    fontSize: themeTypography.fontSizes.xxl, 
    fontWeight: '900', 
    marginBottom: 8 
  },
  savingsHeroDesc: { 
    fontSize: 14, 
    textAlign: 'center', 
    lineHeight: 22, 
    fontWeight: '500' 
  },
});
