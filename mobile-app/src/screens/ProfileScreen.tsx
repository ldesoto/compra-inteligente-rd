import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';

export const ProfileScreen = ({ navigation }: any) => {
  const { 
    user, monthlySavings, logout, updateProfile, alerts, 
    darkMode, setDarkMode, language, setLanguage 
  } = useAppStore();
  
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

  // Dynamic Theme Colors
  const theme = {
    bg: darkMode ? '#0F172A' : '#F8FAFC',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    textPrimary: darkMode ? '#F8FAFC' : '#0F172A',
    textSecondary: darkMode ? '#94A3B8' : '#64748B',
    border: darkMode ? '#334155' : '#F1F5F9',
    iconBg: darkMode ? '#334155' : '#F3F4F6'
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
    Alert.alert(
      'Comprix Premium 💎',
      'Desbloquea alertas ilimitadas, IA avanzada, y comparación multi-supermercado.\n\nPrecio: RD$149/mes o RD$1,299/año.\n\n¡Próximamente disponible!',
      [{ text: 'Entendido' }]
    );
  };

  const handleSoon = (feature: string) => {
    Alert.alert('Próximamente', `La sección de "${feature}" estará disponible en la próxima actualización premium.`);
  };

  const adminEmails = ['luismanuelj27@gmail.com', 'ldesotoflota@gmail.com'];
  const userEmail = user?.email?.toLowerCase()?.trim() || '';
  const isAdmin = adminEmails.includes(userEmail);

  const MenuItem = ({ icon, label, onPress, color, badge, showBorder = true, iconType = 'feather' }: any) => (
    <TouchableOpacity style={[styles.menuItem, showBorder && { borderBottomWidth: 1, borderBottomColor: theme.border }]} onPress={onPress}>
      <View style={[styles.menuIconBox, { backgroundColor: darkMode ? theme.iconBg : `${color}15` }]}>
        {iconType === 'feather' ? (
          <Feather name={icon} size={18} color={color} />
        ) : (
          <Ionicons name={icon} size={18} color={color} />
        )}
      </View>
      <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{label}</Text>
      {badge && (
        <View style={[styles.menuBadge, darkMode && { backgroundColor: '#450a0a' }]}>
          <Text style={[styles.menuBadgeText, darkMode && { color: '#f87171' }]}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Fixed Header */}
      <View style={styles.topHeader}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{t.profile}</Text>
        <TouchableOpacity onPress={() => {
          setEditName(user?.name || '');
          setEditBudget(user?.monthlyBudget ? String(user.monthlyBudget) : '');
          setEditModalVisible(true);
        }} style={[styles.editBtn, darkMode && { backgroundColor: '#312e81' }]}>
          <Text style={[styles.editBtnText, darkMode && { color: '#818cf8' }]}>{t.edit}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* User Info Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </Text>
              <View style={[styles.onlineBadge, { borderColor: theme.bg }]} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || 'Usuario Comprix'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'usuario@comprix.do'}</Text>
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={theme.textSecondary} />
                <Text style={styles.locationText}>Santo Domingo, RD</Text>
                <View style={[styles.dotSeparator, { backgroundColor: theme.textSecondary }]} />
                <Text style={styles.accountTypeText}>{t.freeAccount}</Text>
              </View>
            </View>
          </View>
          
          <View style={[styles.savingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.savingsIcon, darkMode && { backgroundColor: '#064e3b' }]}>
              <Feather name="trending-down" size={18} color={darkMode ? '#34d399' : '#059669'} />
            </View>
            <View>
              <Text style={styles.savingsTitle}>{t.totalSavings}</Text>
              <Text style={[styles.savingsValue, darkMode && { color: '#34d399' }]}>{currency} {monthlySavings.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            </View>
          </View>
        </View>

        {/* Premium Banner (Revolut Style) */}
        <TouchableOpacity activeOpacity={0.9} style={styles.premiumBannerWrapper} onPress={handlePremium}>
          <LinearGradient 
            colors={darkMode ? ['#312e81', '#4c1d95'] : ['#1E1B4B', '#4C1D95', '#7C3AED']} 
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.premiumBanner}
          >
            <View style={styles.premiumHeaderRow}>
              <Text style={styles.premiumTitle}>{t.premiumTitle}</Text>
              <View style={styles.proBadge}>
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.premiumDesc}>{t.premiumDesc}</Text>
            
            <View style={styles.premiumFeatures}>
              <View style={styles.featureItem}>
                <Feather name="check" size={14} color="#A78BFA" />
                <Text style={styles.featureText}>{language === 'Inglés' ? 'UNLIMITED Alerts' : 'Alertas ILIMITADAS'}</Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={14} color="#A78BFA" />
                <Text style={styles.featureText}>{language === 'Inglés' ? 'Predictive AI' : 'IA predictiva'}</Text>
              </View>
              <View style={styles.featureItem}>
                <Feather name="check" size={14} color="#A78BFA" />
                <Text style={styles.featureText}>{language === 'Inglés' ? 'No Ads' : 'Sin anuncios'}</Text>
              </View>
            </View>

            <View style={styles.premiumBtn}>
              <Text style={styles.premiumBtnText}>{t.seePlans}</Text>
              <Feather name="arrow-right" size={16} color="#1E1B4B" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* COMPRAS Y AHORRO */}
        <Text style={styles.sectionTitle}>{t.sectionPurchases}</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MenuItem icon="heart" color="#EF4444" label={t.favSupermarket} onPress={() => handleSoon('Favoritos')} />
          <MenuItem icon="bar-chart-2" color="#059669" label={t.budgetDash} onPress={() => navigation.navigate('BudgetDashboard')} />
          <MenuItem 
            icon="bell" 
            color="#F59E0B" 
            label={t.smartAlerts} 
            badge={unreadAlertsCount > 0 ? (language === 'Inglés' ? `${unreadAlertsCount} new` : `${unreadAlertsCount} nuevas`) : null} 
            onPress={() => navigation.navigate('Alerts')} 
            showBorder={false}
          />
        </View>

        {/* CONFIGURACIÓN */}
        <Text style={styles.sectionTitle}>{t.sectionPreferences}</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MenuItem icon="settings" color="#64748B" label={t.advSettings} onPress={() => setSettingsModalVisible(true)} />
          <MenuItem icon="sliders" color="#3B82F6" label={t.extremeMode} onPress={() => setSavingsModalVisible(true)} />
          <MenuItem icon="shield" color="#10B981" label={t.security} onPress={() => setSecurityModalVisible(true)} showBorder={false} />
        </View>

        {/* ADMIN */}
        {isAdmin && (
          <>
            <Text style={styles.sectionTitle}>{t.sectionAdmin}</Text>
            <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <MenuItem icon="cpu" color="#635BFF" label={t.adminConsole} onPress={() => navigation.navigate('Admin')} showBorder={false} />
            </View>
          </>
        )}

        {/* SOPORTE */}
        <Text style={styles.sectionTitle}>{t.sectionHelp}</Text>
        <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MenuItem icon="help-circle" color="#8B5CF6" label={t.support} onPress={() => handleSoon('Soporte')} />
          <MenuItem icon="message-circle" color="#10B981" label={t.whatsapp} onPress={() => handleSoon('WhatsApp')} showBorder={false} />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: theme.card, borderColor: darkMode ? '#7f1d1d' : '#FEE2E2' }]} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>{t.logout}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Comprix v1.0.0 • Made in DR 🇩🇴</Text>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <Feather name="x" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ej. Luis De Soto"
              autoCapitalize="words"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Presupuesto Mensual (RD$)</Text>
            <TextInput
              style={styles.modalInput}
              value={editBudget}
              onChangeText={setEditBudget}
              placeholder="Ej. 18000"
              keyboardType="numeric"
              placeholderTextColor="#94A3B8"
            />

            <TouchableOpacity 
              style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Cambios</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Advanced Settings Modal */}
      <Modal visible={isSettingsModalVisible} animationType="slide" transparent={true}>
        <View style={[styles.fullModalContainer, { backgroundColor: theme.bg }]}>
          <View style={[styles.fullModalHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity onPress={() => setSettingsModalVisible(false)} style={[styles.modalCloseBtn, { backgroundColor: darkMode ? '#334155' : '#F1F5F9' }]}>
              <Feather name="chevron-down" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.fullModalTitle, { color: theme.textPrimary }]}>{language === 'Inglés' ? 'Settings' : 'Configuración'}</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <Text style={styles.sectionTitle}>{language === 'Inglés' ? 'GENERAL' : 'GENERAL'}</Text>
            <View style={[styles.menuCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Moneda Preferida', 'Selecciona la moneda principal', [
                  { text: 'RD$', onPress: () => setCurrency('RD$') },
                  { text: 'USD$', onPress: () => setCurrency('USD$') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={styles.settingsLabel}>Moneda Preferida</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{currency}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Notificaciones Push</Text>
                <TouchableOpacity onPress={() => setNotifications(!notifications)}>
                  <Feather name={notifications ? "toggle-right" : "toggle-left"} size={32} color={notifications ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>COMPRAS</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Supermercado Favorito', 'Elige tu principal', [
                  { text: 'Nacional', onPress: () => setFavoriteSupermarket('Nacional') },
                  { text: 'Jumbo', onPress: () => setFavoriteSupermarket('Jumbo') },
                  { text: 'Bravo', onPress: () => setFavoriteSupermarket('Bravo') },
                  { text: 'Sirena', onPress: () => setFavoriteSupermarket('Sirena') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={styles.settingsLabel}>Supermercado Favorito</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{favoriteSupermarket}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
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
                <Text style={styles.settingsLabel}>Radio de Distancia</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{maxDistance}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
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
                <Text style={styles.settingsLabel}>Unidad Preferida</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{preferredUnit}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Modo Ahorro Extremo</Text>
                <TouchableOpacity onPress={() => setExtremeMode(!extremeMode)}>
                  <Feather name={extremeMode ? "toggle-right" : "toggle-left"} size={32} color={extremeMode ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Sustituciones Automáticas</Text>
                <TouchableOpacity onPress={() => setAutoSubstitute(!autoSubstitute)}>
                  <Feather name={autoSubstitute ? "toggle-right" : "toggle-left"} size={32} color={autoSubstitute ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>PRIVACIDAD</Text>
            <View style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Permisos de Ubicación</Text>
                <TouchableOpacity onPress={() => setLocationPerm(!locationPerm)}>
                  <Feather name={locationPerm ? "toggle-right" : "toggle-left"} size={32} color={locationPerm ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Acceso a Cámara</Text>
                <TouchableOpacity onPress={() => setCameraPerm(!cameraPerm)}>
                  <Feather name={cameraPerm ? "toggle-right" : "toggle-left"} size={32} color={cameraPerm ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Procesamiento OCR en Nube</Text>
                <TouchableOpacity onPress={() => setOcrCloud(!ocrCloud)}>
                  <Feather name={ocrCloud ? "toggle-right" : "toggle-left"} size={32} color={ocrCloud ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Exportar mis datos</Text>
                <Feather name="download" size={18} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>Eliminar cuenta permanentemente</Text>
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>INTELIGENCIA ARTIFICIAL</Text>
            <View style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Asistente IA Activado</Text>
                <TouchableOpacity onPress={() => setAiEnabled(!aiEnabled)}>
                  <Feather name={aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiEnabled ? "#7C3AED" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Recomendaciones Inteligentes</Text>
                <TouchableOpacity onPress={() => setAiRecommendations(!aiRecommendations)} disabled={!aiEnabled}>
                  <Feather name={aiRecommendations && aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiRecommendations && aiEnabled ? "#7C3AED" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Predicciones de Precios</Text>
                <TouchableOpacity onPress={() => setAiPredictions(!aiPredictions)} disabled={!aiEnabled}>
                  <Feather name={aiPredictions && aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiPredictions && aiEnabled ? "#7C3AED" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Análisis de Hábitos Automático</Text>
                <TouchableOpacity onPress={() => setAiHabits(!aiHabits)} disabled={!aiEnabled}>
                  <Feather name={aiHabits && aiEnabled ? "toggle-right" : "toggle-left"} size={32} color={aiHabits && aiEnabled ? "#7C3AED" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>NOTIFICACIONES</Text>
            <View style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Alertas Push</Text>
                <TouchableOpacity onPress={() => setNotifications(!notifications)}>
                  <Feather name={notifications ? "toggle-right" : "toggle-left"} size={32} color={notifications ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Alertas por Email</Text>
                <TouchableOpacity onPress={() => setEmailAlerts(!emailAlerts)}>
                  <Feather name={emailAlerts ? "toggle-right" : "toggle-left"} size={32} color={emailAlerts ? "#00B2A9" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.settingsRow} onPress={() => {
                Alert.alert('Frecuencia de Resumen', '¿Cada cuánto deseas el resumen de tus finanzas?', [
                  { text: 'Diaria', onPress: () => setSummaryFrequency('Diaria') },
                  { text: 'Semanal', onPress: () => setSummaryFrequency('Semanal') },
                  { text: 'Mensual', onPress: () => setSummaryFrequency('Mensual') },
                  { text: 'Cancelar', style: 'cancel' }
                ]);
              }}>
                <Text style={styles.settingsLabel}>Frecuencia de Resumen</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{summaryFrequency}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]} onPress={() => {
                Alert.alert('Categorías', 'Actualmente tienes 4 categorías activas (Carnes, Lácteos, Frutas, Limpieza). Esta función requiere Premium para personalización completa.');
              }}>
                <Text style={styles.settingsLabel}>Categorías Suscritas</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={styles.settingsValue}>{subscribedCategories}</Text>
                  <Feather name="chevron-right" size={16} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            </View>
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Extreme Savings Modal */}
      <Modal visible={isSavingsModalVisible} animationType="slide" transparent={true}>
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setSavingsModalVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="chevron-down" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Modo Ahorro Extremo</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <View style={styles.savingsHero}>
              <View style={styles.savingsHeroIcon}>
                <Feather name="zap" size={32} color="#F59E0B" />
              </View>
              <Text style={styles.savingsHeroTitle}>Maximiza tus ahorros</Text>
              <Text style={styles.savingsHeroDesc}>Al activar este modo, la IA priorizará marcas blancas y los descuentos más agresivos sin importar la marca original.</Text>
            </View>

            <View style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Activar Ahorro Extremo</Text>
                <TouchableOpacity onPress={() => setExtremeMode(!extremeMode)}>
                  <Feather name={extremeMode ? "toggle-right" : "toggle-left"} size={32} color={extremeMode ? "#F59E0B" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Sustitución Automática</Text>
                <TouchableOpacity onPress={() => setAutoSubstitute(!autoSubstitute)}>
                  <Feather name={autoSubstitute ? "toggle-right" : "toggle-left"} size={32} color={autoSubstitute ? "#F59E0B" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Radio de Búsqueda</Text>
                <Text style={[styles.settingsValue, { color: '#F59E0B' }]}>{maxDistance}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Security Modal */}
      <Modal visible={isSecurityModalVisible} animationType="slide" transparent={true}>
        <View style={styles.fullModalContainer}>
          <View style={styles.fullModalHeader}>
            <TouchableOpacity onPress={() => setSecurityModalVisible(false)} style={styles.modalCloseBtn}>
              <Feather name="chevron-down" size={24} color="#64748B" />
            </TouchableOpacity>
            <Text style={styles.fullModalTitle}>Seguridad</Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={styles.fullModalScroll}>
            <Text style={styles.sectionTitle}>ACCESO</Text>
            <View style={styles.menuCard}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Face ID / Biometría</Text>
                <TouchableOpacity onPress={() => setBiometrics(!biometrics)}>
                  <Feather name={biometrics ? "toggle-right" : "toggle-left"} size={32} color={biometrics ? "#10B981" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>Autenticación 2 Pasos</Text>
                <TouchableOpacity onPress={() => setTwoFactor(!twoFactor)}>
                  <Feather name={twoFactor ? "toggle-right" : "toggle-left"} size={32} color={twoFactor ? "#10B981" : "#CBD5E1"} />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>DATOS</Text>
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Exportar mis datos</Text>
                <Feather name="download" size={18} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={[styles.settingsLabel, { color: '#EF4444' }]}>Eliminar cuenta</Text>
                <Feather name="trash-2" size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  topHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', letterSpacing: -1 },
  editBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { color: '#4F46E5', fontWeight: '800', fontSize: 14 },
  
  scroll: { padding: 24, paddingTop: 10 },
  
  profileHeader: { marginBottom: 24 },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#00B2A9', justifyContent: 'center', alignItems: 'center', shadowColor: '#00B2A9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  onlineBadge: { position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10B981', borderWidth: 3, borderColor: '#F8FAFC' },
  userName: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 2, letterSpacing: -0.5 },
  userEmail: { fontSize: 15, color: '#64748B', marginBottom: 6, fontWeight: '500' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  accountTypeText: { fontSize: 13, color: '#00B2A9', fontWeight: '700' },

  savingsCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  savingsIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  savingsTitle: { fontSize: 13, fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  savingsValue: { fontSize: 24, fontWeight: '900', color: '#059669', letterSpacing: -0.5 },

  premiumBannerWrapper: { marginBottom: 32, shadowColor: '#4C1D95', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.25, shadowRadius: 24, elevation: 10 },
  premiumBanner: { borderRadius: 24, padding: 24, overflow: 'hidden' },
  premiumHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  premiumTitle: { fontSize: 22, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.5 },
  proBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  proBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  premiumDesc: { color: '#DDD6FE', fontSize: 14, lineHeight: 22, marginBottom: 20, fontWeight: '500' },
  premiumFeatures: { gap: 10, marginBottom: 24 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  featureText: { color: '#F5F3FF', fontSize: 14, fontWeight: '600' },
  premiumBtn: { backgroundColor: '#FFFFFF', borderRadius: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  premiumBtnText: { color: '#1E1B4B', fontWeight: '900', fontSize: 15 },

  sectionTitle: { fontSize: 13, fontWeight: '800', color: '#94A3B8', marginLeft: 8, marginBottom: 10, letterSpacing: 1 },
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 24, paddingHorizontal: 20, marginBottom: 28, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  menuIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1E293B' },
  menuBadge: { backgroundColor: '#FEF2F2', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  menuBadgeText: { color: '#EF4444', fontSize: 12, fontWeight: '800' },

  logoutBtn: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, borderWidth: 1, borderColor: '#FEE2E2', shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', letterSpacing: -0.5 },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 16, color: '#0F172A', marginBottom: 20, fontWeight: '500' },
  saveBtn: { backgroundColor: '#00B2A9', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8, shadowColor: '#00B2A9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 6 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },

  fullModalContainer: { flex: 1, backgroundColor: '#F8FAFC', marginTop: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 20 },
  fullModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  fullModalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  fullModalScroll: { padding: 24 },
  
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  settingsLabel: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  settingsValue: { fontSize: 15, fontWeight: '700', color: '#64748B' },

  savingsHero: { alignItems: 'center', marginBottom: 32, paddingHorizontal: 20 },
  savingsHeroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  savingsHeroTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  savingsHeroDesc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, fontWeight: '500' },
});
