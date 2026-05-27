import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

export function AdminScreen() {
  const navigation = useNavigation();
  const store = useAppStore();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [flags, setFlags] = useState<any>({
    ocrEnabled: true,
    aiEnabled: true,
    supermarketsEnabled: true,
    offersEnabled: true,
    debugMode: false
  });
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    const dashboardData = await store.getAdminDashboard();
    const flagsData = await store.getAdminFlags();
    const logsData = await store.getAdminLogs();
    
    if (dashboardData?.stats) setStats(dashboardData.stats);
    if (flagsData) setFlags(flagsData);
    if (logsData?.logs) setLogs(logsData.logs);
    
    setLoading(false);
  };

  const handleToggleFlag = async (key: string, value: boolean) => {
    // Optimistic UI update
    const prevFlags = { ...flags };
    setFlags({ ...flags, [key]: value });
    
    const updated = await store.updateAdminFlags({ [key]: value });
    if (!updated) {
      setFlags(prevFlags);
      Alert.alert('Error', 'No se pudo actualizar la configuración.');
    }
  };

  const handleRollback = () => {
    Alert.alert(
      'Confirmar Rollback',
      '¿Estás seguro de que deseas restablecer todas las configuraciones a sus valores seguros de fábrica? Esto depurará la caché del sistema.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Proceder', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const res = await store.triggerAdminRollback();
            if (res?.success) {
              setFlags(res.flags);
              Alert.alert('Éxito', res.message);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A2540" />
        <Text style={styles.loadingText}>Autenticando Consola Admin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Feather name="shield" color="#635BFF" size={24} style={{ marginRight: 8 }} />
        <Text style={styles.headerTitle}>Consola Administrativa</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Dashboard Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Salud del Sistema</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Feather name="users" color="#00D4FF" size={20} />
              <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Usuarios Activos</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="shopping-cart" color="#00D4FF" size={20} />
              <Text style={styles.statValue}>{stats?.totalProducts || 0}</Text>
              <Text style={styles.statLabel}>Catálogo Canónico</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="activity" color="#00D4FF" size={20} />
              <Text style={styles.statValue}>{stats?.totalProductMatches || 0}</Text>
              <Text style={styles.statLabel}>Mapeos Sucursales</Text>
            </View>
            <View style={styles.statCard}>
              <Feather name="server" color="#00D4FF" size={20} />
              <Text style={styles.statValue}>{stats?.systemStatus || 'OFFLINE'}</Text>
              <Text style={styles.statLabel}>Estado Red</Text>
            </View>
          </View>
        </View>

        {/* Feature Flags */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Feature Flags (Kill Switches)</Text>
          <View style={styles.card}>
            <View style={styles.flagRow}>
              <View>
                <Text style={styles.flagTitle}>Motor OCR de Recibos</Text>
                <Text style={styles.flagDesc}>Permitir escaneo con IA visual</Text>
              </View>
              <Switch 
                value={flags.ocrEnabled} 
                onValueChange={(val) => handleToggleFlag('ocrEnabled', val)}
                trackColor={{ false: '#3A3A3C', true: '#34C759' }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.flagRow}>
              <View>
                <Text style={styles.flagTitle}>Inteligencia Artificial</Text>
                <Text style={styles.flagDesc}>Sustitutos, chat y predicciones</Text>
              </View>
              <Switch 
                value={flags.aiEnabled} 
                onValueChange={(val) => handleToggleFlag('aiEnabled', val)}
                trackColor={{ false: '#3A3A3C', true: '#34C759' }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.flagRow}>
              <View>
                <Text style={styles.flagTitle}>Sincronización Supermercados</Text>
                <Text style={styles.flagDesc}>Consultas al mapa (OSM) y scraping</Text>
              </View>
              <Switch 
                value={flags.supermarketsEnabled} 
                onValueChange={(val) => handleToggleFlag('supermarketsEnabled', val)}
                trackColor={{ false: '#3A3A3C', true: '#34C759' }}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.flagRow}>
              <View>
                <Text style={styles.flagTitle}>Motor de Ofertas (Promociones)</Text>
                <Text style={styles.flagDesc}>Procesar flags de promoción falsas</Text>
              </View>
              <Switch 
                value={flags.offersEnabled} 
                onValueChange={(val) => handleToggleFlag('offersEnabled', val)}
                trackColor={{ false: '#3A3A3C', true: '#34C759' }}
              />
            </View>
          </View>
        </View>

        {/* Rollback & Operaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Operaciones Críticas</Text>
          <TouchableOpacity style={styles.rollbackButton} onPress={handleRollback}>
            <Feather name="refresh-cw" color="#FFFFFF" size={20} style={{ marginRight: 8 }} />
            <Text style={styles.rollbackText}>Forzar Rollback a Producción Segura</Text>
          </TouchableOpacity>
          <Text style={styles.rollbackHint}>
            Restablece los Feature Flags y depura la caché en caso de una falla masiva o latencia extrema.
          </Text>
        </View>

        {/* Logs */}
        <View style={[styles.section, { paddingBottom: 40 }]}>
          <View style={styles.logsHeader}>
            <Text style={styles.sectionTitle}>Logs Operativos (Tiempo Real)</Text>
            <TouchableOpacity onPress={fetchAdminData}>
              <Feather name="refresh-cw" color="#635BFF" size={18} />
            </TouchableOpacity>
          </View>
          <View style={styles.logsContainer}>
            {logs.map((log, i) => (
              <View key={i} style={styles.logItem}>
                <View style={styles.logMeta}>
                  <Text style={[
                    styles.logLevel, 
                    log.level === 'ERROR' ? { color: '#FF3B30' } : 
                    log.level === 'WARNING' ? { color: '#FFCC00' } : { color: '#34C759' }
                  ]}>
                    [{log.level}]
                  </Text>
                  <Text style={styles.logTime}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A2540',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A2540',
  },
  loadingText: {
    color: '#8F9BB3',
    marginTop: 12,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: '#0A2540',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0A2540',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  flagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  flagTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A2540',
    marginBottom: 4,
  },
  flagDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  rollbackButton: {
    backgroundColor: '#E11D48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rollbackText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  rollbackHint: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 10,
  },
  logsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logsContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
  },
  logItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 12,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  logLevel: {
    fontSize: 12,
    fontWeight: '700',
    marginRight: 8,
  },
  logTime: {
    fontSize: 12,
    color: '#94A3B8',
  },
  logMessage: {
    fontSize: 14,
    color: '#F8FAFC',
    lineHeight: 20,
  }
});
