import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, monthlySavings, lists, logout, updateProfile } = useAppStore();
  
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editBudget, setEditBudget] = useState(user?.monthlyBudget ? String(user.monthlyBudget) : '');
  const [isSaving, setIsSaving] = useState(false);

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

  const stats = [
    { label: 'Ahorro Total', value: `RD$ ${monthlySavings.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: 'dollar-sign' as any, color: '#059669', bg: '#ECFDF5' },
    { label: 'Presupuesto', value: user?.monthlyBudget ? `RD$ ${user.monthlyBudget.toLocaleString('es-DO')}` : 'No definido', icon: 'pie-chart' as any, color: '#4F46E5', bg: '#EEF2FF' },
    { label: 'Productos', value: String(lists.reduce((acc, l) => acc + l.items.length, 0)), icon: 'activity' as any, color: '#D97706', bg: '#FEF3C7' },
    { label: 'Alertas Activas', value: String(useAppStore.getState().alerts.filter(a => !a.read).length), icon: 'bell' as any, color: '#EF4444', bg: '#FEF2F2' },
  ];

  const baseMenuItems = [
    { icon: 'heart' as any, label: 'Supermercados Favoritos', action: () => Alert.alert('Próximamente', 'Esta función estará disponible en la próxima versión.'), color: '#EF4444' },
    { icon: 'star' as any, label: 'Plan Premium', action: () => Alert.alert('Plan Premium', 'Accede a alertas ilimitadas, historial completo y comparación calidad-precio.\n\nPrecio: RD$ 99/mes\n\n¡Próximamente!'), color: '#D97706' },
    { icon: 'bar-chart-2' as any, label: 'Panel de Ahorro Mensual', action: () => navigation.navigate('PriceHistory'), color: '#4F46E5' },
    { icon: 'bell' as any, label: 'Mis Alertas', action: () => navigation.navigate('Alerts'), color: '#059669' },
    { icon: 'settings' as any, label: 'Configuración Avanzada', action: () => Alert.alert('Configuración', 'Las opciones de configuración estarán disponibles pronto.'), color: '#6B7280' },
  ];

  const adminEmails = ['luismanuelj27@gmail.com', 'ldesotoflota@gmail.com'];
  const userEmail = user?.email?.toLowerCase()?.trim() || '';

  const menuItems = adminEmails.includes(userEmail)
    ? [
        ...baseMenuItems.slice(0, 4),
        { icon: 'shield' as any, label: 'Consola Administrativa', action: () => navigation.navigate('Admin'), color: '#635BFF' },
        ...baseMenuItems.slice(4)
      ]
    : baseMenuItems;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar tu sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar', style: 'destructive', onPress: () => {
          logout();
          navigation.replace('Login');
        }},
      ]
    );
  };

  const handlePremium = () => {
    Alert.alert(
      '⭐ Plan Premium',
      'Desbloquea todas las funciones:\n\n✅ Alertas ilimitadas de precios\n✅ Historial de precios completo\n✅ Comparación calidad-precio\n✅ Recomendaciones personalizadas\n✅ Sin anuncios\n\nPrecio: RD$ 99/mes\n\n¡Próximamente disponible!',
      [{ text: 'Entendido' }]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Feather name="chevron-left" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Perfil</Text>
          <TouchableOpacity onPress={() => {
            setEditName(user?.name || '');
            setEditBudget(user?.monthlyBudget ? String(user.monthlyBudget) : '');
            setEditModalVisible(true);
          }} style={styles.editBtn}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'usuario@email.com'}</Text>
          <TouchableOpacity style={styles.planBadge} onPress={handlePremium}>
            <Feather name="zap" size={12} color="#D97706" />
            <Text style={styles.planBadgeText}>Plan Gratis</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: stat.bg }]}>
                <Feather name={stat.icon} size={18} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Premium Upsell */}
        <TouchableOpacity activeOpacity={0.9} style={styles.premiumCard} onPress={handlePremium}>
          <View style={styles.premiumHeader}>
            <View style={styles.premiumIconBg}>
              <Feather name="award" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Pasa a Premium</Text>
              <Text style={styles.premiumText}>Alertas ilimitadas, historial completo y comparación calidad-precio.</Text>
            </View>
          </View>
          <View style={styles.premiumBtn}>
            <Text style={styles.premiumBtnText}>Ver Planes</Text>
            <Feather name="arrow-right" size={16} color="#7C3AED" />
          </View>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuCard}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, i < menuItems.length - 1 && styles.menuRowBorder]}
              onPress={item.action}>
              <View style={styles.menuIconBg}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#EF4444" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Comprix v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
      <BottomTabBar />

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ej. Juan Pérez"
              autoCapitalize="words"
            />

            <Text style={styles.inputLabel}>Presupuesto Mensual (RD$)</Text>
            <TextInput
              style={styles.modalInput}
              value={editBudget}
              onChangeText={setEditBudget}
              placeholder="Ej. 15000"
              keyboardType="numeric"
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.5 },
  editBtn: { backgroundColor: '#EEF2FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16 },
  editBtnText: { color: '#4F46E5', fontWeight: '700', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4B5563', marginBottom: 8 },
  modalInput: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 16, fontSize: 16, color: '#111827', marginBottom: 20 },
  saveBtn: { backgroundColor: '#059669', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  
  profileCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 28, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3, borderWidth: 1, borderColor: '#F3F4F6' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#059669', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  avatarText: { fontSize: 36, fontWeight: '900', color: '#fff' },
  userName: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 4, letterSpacing: -0.5 },
  userEmail: { fontSize: 14, color: '#6B7280', marginBottom: 16, fontWeight: '500' },
  planBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  planBadgeText: { color: '#D97706', fontSize: 13, fontWeight: '700' },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  statIconBg: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', textAlign: 'center', fontWeight: '600' },
  
  premiumCard: { backgroundColor: '#F5F3FF', borderRadius: 24, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#DDD6FE' },
  premiumHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 16 },
  premiumIconBg: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center' },
  premiumTitle: { fontSize: 18, fontWeight: '800', color: '#4C1D95', marginBottom: 4 },
  premiumText: { fontSize: 14, color: '#6B7280', lineHeight: 20, fontWeight: '500' },
  premiumBtn: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: '#DDD6FE' },
  premiumBtnText: { color: '#7C3AED', fontWeight: '800', fontSize: 15 },
  
  menuCard: { backgroundColor: '#FFFFFF', borderRadius: 24, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 14 },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  menuIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: 15, color: '#1F2937', fontWeight: '600' },
  
  logoutBtn: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FEE2E2' },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 15 },
  version: { textAlign: 'center', color: '#D1D5DB', fontSize: 13, fontWeight: '600' },
});
