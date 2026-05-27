import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppStore } from '../store/useAppStore';

export default function ScannerScreen({ navigation }: any) {
  const { scanReceipt } = useAppStore();
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const scannerLineY = new Animated.Value(0);

  const startScan = async () => {
    setIsScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerLineY, { toValue: 300, duration: 1500, useNativeDriver: true }),
        Animated.timing(scannerLineY, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    try {
      // Base64 simulado para la prueba de OCR
      const response = await scanReceipt("data:image/jpeg;base64,mock");
      setScanResult(response.receipt);
      setEditableItems(response.receipt.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    setEditableItems(updated);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return '#16A34A';
    if (score >= 70) return '#EAB308';
    return '#EF4444';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="x" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inteligencia OCR</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!scanComplete ? (
          <>
            <Text style={styles.subtitle}>Sube o toma una foto de tu recibo para extraer los productos automáticamente con nuestra IA.</Text>
            <View style={styles.cameraBox}>
              {isScanning && (
                <Animated.View style={[styles.scannerLine, { transform: [{ translateY: scannerLineY }] }]} />
              )}
              <Feather name={isScanning ? "aperture" : "file-text"} size={80} color="#E2E8F0" />
            </View>
            <TouchableOpacity style={styles.scanButton} onPress={startScan} disabled={isScanning}>
              <LinearGradient colors={['#16A34A', '#15803D']} style={styles.scanButtonGradient}>
                <Feather name={isScanning ? "loader" : "camera"} size={20} color="#FFF" />
                <Text style={styles.scanButtonText}>{isScanning ? 'Extrayendo con GPT-4o...' : 'Escanear Factura'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.resultContainer}>
             <View style={styles.resultHeader}>
                <Ionicons name="checkmark-circle" size={50} color="#16A34A" />
                <Text style={styles.resultTitle}>Lectura Completada</Text>
                <Text style={styles.resultSub}>Confirma los datos extraídos o corrígelos manualmente.</Text>
             </View>

             <View style={styles.itemsList}>
               {editableItems.map((item, idx) => (
                 <View key={idx} style={styles.itemCard}>
                   <View style={styles.itemHeader}>
                     <Text style={styles.itemName}>{item.rawScannedName}</Text>
                     <View style={[styles.badge, { backgroundColor: getConfidenceColor(item.confidence) }]}>
                        <Text style={styles.badgeText}>{item.confidence}% Confianza</Text>
                     </View>
                   </View>
                   <View style={styles.itemRow}>
                     <View style={styles.inputGroup}>
                       <Text style={styles.label}>Cant.</Text>
                       <TextInput 
                         style={styles.input} 
                         value={String(item.quantity)} 
                         onChangeText={(t) => handleUpdateItem(idx, 'quantity', t)}
                         keyboardType="numeric"
                       />
                     </View>
                     <View style={styles.inputGroup}>
                       <Text style={styles.label}>Precio Un.</Text>
                       <TextInput 
                         style={styles.input} 
                         value={String(item.unitPrice)} 
                         onChangeText={(t) => handleUpdateItem(idx, 'unitPrice', t)}
                         keyboardType="numeric"
                       />
                     </View>
                     <View style={styles.totalGroup}>
                       <Text style={styles.label}>Total</Text>
                       <Text style={styles.itemTotal}>RD$ {item.totalPrice}</Text>
                     </View>
                   </View>
                 </View>
               ))}
             </View>

             <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate('Home')}>
               <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.scanButtonGradient}>
                 <Text style={styles.scanButtonText}>Guardar Factura</Text>
               </LinearGradient>
             </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9'
  },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  content: { padding: 20, alignItems: 'center' },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 24, fontWeight: '500' },
  cameraBox: {
    width: '100%', height: 350, backgroundColor: '#FFFFFF',
    borderWidth: 2, borderColor: '#CBD5E1', borderRadius: 24, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 30,
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  scannerLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#16A34A',
    shadowColor: '#16A34A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5
  },
  scanButton: { width: '100%', height: 56, borderRadius: 28, marginTop: 20 },
  scanButtonGradient: { flex: 1, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  scanButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 10 },
  
  resultContainer: { width: '100%', alignItems: 'stretch' },
  resultHeader: { alignItems: 'center', marginBottom: 20 },
  resultTitle: { color: '#0F172A', fontSize: 24, fontWeight: '800', marginTop: 10, marginBottom: 5 },
  resultSub: { color: '#64748B', fontSize: 15, textAlign: 'center' },
  itemsList: { width: '100%' },
  itemCard: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 12,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 1
  },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  itemName: { fontSize: 16, fontWeight: '700', color: '#1E293B', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  itemRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginRight: 10 },
  label: { fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: '600' },
  input: { 
    height: 40, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#CBD5E1', 
    borderRadius: 8, paddingHorizontal: 10, color: '#0F172A', fontWeight: '600' 
  },
  totalGroup: { flex: 1, alignItems: 'flex-end' },
  itemTotal: { fontSize: 16, fontWeight: '800', color: '#16A34A', marginBottom: 10 }
});
