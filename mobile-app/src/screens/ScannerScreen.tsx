import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, TextInput, Image, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAppStore } from '../store/useAppStore';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

// Preset real receipts (as base64 or realistic structures) for easy testing
const DOMINICAN_RECEIPT_PRESETS = [
  {
    id: 'jumbo',
    name: 'Recibo Jumbo Luperón',
    subtitle: 'Alimentos y Bebidas',
    image: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=500&auto=format&fit=crop&q=60',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Small solid pixel as valid base64 image
    mockItems: [
      { rawScannedName: "ARROZ LA GARZA 10 LBS", quantity: 1, unitPrice: 480, totalPrice: 480, confidence: 95 },
      { rawScannedName: "LECHE RICA LISTA 1L", quantity: 3, unitPrice: 85, totalPrice: 255, confidence: 92 },
      { rawScannedName: "ACEITE CRISOL 64OZ", quantity: 1, unitPrice: 320, totalPrice: 320, confidence: 89 },
      { rawScannedName: "JUGO SULA NARANJA 1L", quantity: 2, unitPrice: 110, totalPrice: 220, confidence: 90 }
    ],
    total: 1275
  },
  {
    id: 'bravo',
    name: 'Recibo Bravo Churchill',
    subtitle: 'Lácteos y Carnes',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    mockItems: [
      { rawScannedName: "QUESO CHEDDAR ARCO 1LB", quantity: 1, unitPrice: 380, totalPrice: 380, confidence: 96 },
      { rawScannedName: "PECHUGA POLLO FRESCA 1KG", quantity: 2, unitPrice: 290, totalPrice: 580, confidence: 94 },
      { rawScannedName: "PAN SOBRAO BRAVO", quantity: 2, unitPrice: 65, totalPrice: 130, confidence: 91 }
    ],
    total: 1090
  },
  {
    id: 'nacional',
    name: 'Recibo Super Nacional Lope de Vega',
    subtitle: 'Frutas y Cuidado Personal',
    image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=500&auto=format&fit=crop&q=60',
    base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    mockItems: [
      { rawScannedName: "MANZANAS ROJAS 1KG", quantity: 1, unitPrice: 165, totalPrice: 165, confidence: 88 },
      { rawScannedName: "JABON DOVE ORIGINAL 3P", quantity: 1, unitPrice: 245, totalPrice: 245, confidence: 92 },
      { rawScannedName: "AGUA ALASKA 5GL", quantity: 2, unitPrice: 90, totalPrice: 180, confidence: 90 }
    ],
    total: 590
  }
];

export default function ScannerScreen({ navigation }: any) {
  const { scanReceipt, addItem, currentList, darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [editableItems, setEditableItems] = useState<any[]>([]);
  const [scannedTotal, setScannedTotal] = useState<number>(0);

  const scannerLineY = new Animated.Value(0);

  const handlePickImage = () => {
    if (Platform.OS === 'web') {
      const document = global.document;
      if (document) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e: any) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result as string;
              setReceiptImage(base64);
              setSelectedFileName(file.name);
              setSelectedPresetId(null);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
      }
    } else {
      Alert.alert(
        'Subir Recibo',
        'Elige el método de captura',
        [
          {
            text: 'Tomar Foto',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara para tomar fotos.');
                return;
              }
              const result = await ImagePicker.launchCameraAsync({
                base64: true,
                quality: 0.7,
              });
              if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
                setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
                setSelectedFileName('Camara.jpg');
                setSelectedPresetId(null);
              }
            }
          },
          {
            text: 'Elegir de Galería',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos para elegir una imagen.');
                return;
              }
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                base64: true,
                quality: 0.7,
              });
              if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
                setReceiptImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
                setSelectedFileName('Galeria.jpg');
                setSelectedPresetId(null);
              }
            }
          },
          { text: 'Cancelar', style: 'cancel' }
        ]
      );
    }
  };

  const handleSelectPreset = (preset: typeof DOMINICAN_RECEIPT_PRESETS[0]) => {
    setSelectedPresetId(preset.id);
    setReceiptImage(preset.image);
    setSelectedFileName(preset.name);
  };

  const startScan = async () => {
    if (!receiptImage) {
      Alert.alert('Falta Imagen', 'Por favor selecciona una imagen de tu recibo o uno de los presets dominicanos.');
      return;
    }

    setIsScanning(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(scannerLineY, { toValue: 300, duration: 1500, useNativeDriver: true }),
        Animated.timing(scannerLineY, { toValue: 0, duration: 1500, useNativeDriver: true })
      ])
    ).start();

    try {
      const response = await scanReceipt(receiptImage);
      if (response.success && response.receipt) {
        setEditableItems(response.receipt.items || []);
        setScannedTotal(response.receipt.total || 0);
      } else {
        Alert.alert('Error OCR', response.message || 'No se pudo escanear el recibo.');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Error', 'El servicio de OpenAI GPT-4o-mini no pudo procesar este archivo.');
    } finally {
      setIsScanning(false);
      setScanComplete(true);
    }
  };

  const handleUpdateItem = (index: number, field: string, value: string) => {
    const updated = [...editableItems];
    const parsedVal = parseFloat(value) || 0;
    updated[index] = { ...updated[index], [field]: parsedVal };
    updated[index].totalPrice = updated[index].quantity * updated[index].unitPrice;
    setEditableItems(updated);
    
    // Recalcular total acumulado
    const newTotal = updated.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    setScannedTotal(newTotal);
  };

  const handleSaveToActiveList = () => {
    if (editableItems.length === 0) return;

    editableItems.forEach(item => {
      addItem({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name: item.rawScannedName || item.rawName,
        quantity: item.quantity || 1,
        unit: 'Unidad',
        canonicalProductId: item.canonicalProductId || null
      });
    });

    Alert.alert(
      'Factura Guardada',
      `Se agregaron correctamente ${editableItems.length} artículos a tu lista de compras activa.`,
      [{ text: 'Excelente', onPress: () => navigation.goBack() }]
    );
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 90) return colors.primary;
    if (score >= 70) return '#D97706';
    return colors.danger;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Inteligencia OCR Real</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!scanComplete ? (
          <>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Sube la imagen real de tu recibo de supermercado para extraer productos automáticamente utilizando el modelo de visión artificial GPT-4o de OpenAI.
            </Text>

            {/* Upload Box */}
            <TouchableOpacity 
              style={[
                styles.cameraBox, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                receiptImage ? { borderStyle: 'solid' } : { borderStyle: 'dashed' }
              ]}
              onPress={handlePickImage}
              activeOpacity={0.85}
            >
              {isScanning && (
                <Animated.View style={[styles.scannerLine, { transform: [{ translateY: scannerLineY }], backgroundColor: colors.premium }]} />
              )}

              {receiptImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: receiptImage }} style={styles.imagePreview} />
                  <View style={styles.imageOverlayContainer}>
                    <Feather name="image" size={18} color="#FFFFFF" />
                    <Text style={styles.imageOverlayText} numberOfLines={1}>
                      {selectedFileName || 'Imagen seleccionada'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyBox}>
                  <Feather name="file-text" size={64} color={colors.textLight} style={{ marginBottom: 12 }} />
                  <Text style={[styles.emptyBoxText, { color: colors.textSecondary }]}>Cargar recibo desde el dispositivo</Text>
                  <Text style={[styles.emptyBoxSubText, { color: colors.textLight }]}>Soporta archivos .jpg, .png en formato base64</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Custom URL or Base64 Input */}
            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.presetsTitle, { color: colors.textPrimary, marginBottom: 8 }]}>O pega la URL o Base64 de tu factura real:</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary, width: '100%' }]} 
                placeholder="https://ejemplo.com/factura.jpg"
                placeholderTextColor={colors.textLight}
                value={receiptImage && (receiptImage.startsWith('http') || receiptImage.length < 200) ? receiptImage : ''}
                onChangeText={(text) => {
                  setReceiptImage(text);
                  setSelectedPresetId(null);
                  setSelectedFileName('URL/Base64 manual');
                }}
              />
            </View>

            {/* Dominican Presets Section */}
            <View style={styles.presetsSection}>
              <Text style={[styles.presetsTitle, { color: colors.textPrimary }]}>Preseteados de supermercados dominicanos:</Text>
              
              <View style={styles.presetsGrid}>
                {DOMINICAN_RECEIPT_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <TouchableOpacity 
                      key={preset.id}
                      style={[
                        styles.presetCard,
                        { backgroundColor: colors.surface, borderColor: isSelected ? colors.premium : colors.border }
                      ]}
                      onPress={() => handleSelectPreset(preset)}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: preset.image }} style={styles.presetImage} />
                      <View style={styles.presetInfo}>
                        <Text style={[styles.presetName, { color: colors.textPrimary }]} numberOfLines={1}>{preset.name}</Text>
                        <Text style={[styles.presetSub, { color: colors.textMuted }]} numberOfLines={1}>{preset.subtitle}</Text>
                      </View>
                      {isSelected && (
                        <View style={[styles.activeIndicator, { backgroundColor: colors.premium }]}>
                          <Feather name="check" size={12} color="#FFF" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Start scan button */}
            <PremiumButton 
              title={isScanning ? 'Extrayendo con GPT-4o...' : 'Escanear Recibo Real'}
              onPress={startScan}
              disabled={isScanning || !receiptImage}
              style={{ marginTop: 24, width: '100%' }}
              icon={<Feather name="aperture" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />}
            />
          </>
        ) : (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <View style={[styles.successIconBox, { backgroundColor: darkMode ? '#064E3B' : '#E6F8F7' }]}>
                <Feather name="check-circle" size={32} color={colors.primary} />
              </View>
              <Text style={[styles.resultTitle, { color: colors.textPrimary }]}>Lectura Inteligente Completada</Text>
              <Text style={[styles.resultSub, { color: colors.textMuted }]}>
                Los productos han sido emparejados con nuestro catálogo. Valida los datos y guárdalos.
              </Text>
            </View>

            <View style={styles.itemsList}>
              {editableItems.map((item, idx) => (
                <PremiumCard key={idx} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.rawScannedName}</Text>
                    <View style={[styles.badge, { backgroundColor: getConfidenceColor(item.confidence || 90) }]}>
                      <Text style={styles.badgeText}>{(item.confidence || 90)}% Coincidencia</Text>
                    </View>
                  </View>
                  <View style={styles.itemRow}>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>Cant.</Text>
                      <TextInput 
                        style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]} 
                        value={String(item.quantity)} 
                        onChangeText={(t) => handleUpdateItem(idx, 'quantity', t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>Precio Un.</Text>
                      <TextInput 
                        style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary }]} 
                        value={String(item.unitPrice)} 
                        onChangeText={(t) => handleUpdateItem(idx, 'unitPrice', t)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.totalGroup}>
                      <Text style={[styles.label, { color: colors.textMuted }]}>Total</Text>
                      <Text style={[styles.itemTotal, { color: colors.primary }]}>RD$ {item.totalPrice}</Text>
                    </View>
                  </View>
                </PremiumCard>
              ))}
            </View>

            {/* Total invoice cost display */}
            <PremiumCard style={styles.totalSumCard}>
              <Text style={[styles.totalSumLabel, { color: colors.textMuted }]}>Total Acumulado Extrayendo:</Text>
              <Text style={[styles.totalSumValue, { color: colors.textPrimary }]}>
                RD$ {scannedTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
              </Text>
            </PremiumCard>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
              <TouchableOpacity 
                style={[styles.secondaryButton, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                onPress={() => setScanComplete(false)}
              >
                <Text style={[styles.secondaryButtonText, { color: colors.textPrimary }]}>Volver</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.primarySaveButton, { backgroundColor: colors.premium }]}
                onPress={handleSaveToActiveList}
              >
                <Feather name="plus-circle" size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.primarySaveButtonText}>Añadir a Lista Activa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1
  },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  content: { padding: 20 },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 20, fontWeight: '500' },
  cameraBox: {
    width: '100%', height: 320,
    borderWidth: 2, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 24,
  },
  scannerLine: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
    shadowColor: '#7C3AED', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5, zIndex: 10
  },
  emptyBox: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyBoxText: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  emptyBoxSubText: { fontSize: 11 },
  
  imagePreviewContainer: { width: '100%', height: '100%', position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageOverlayContainer: { 
    position: 'absolute', bottom: 12, left: 12, right: 12, 
    backgroundColor: 'rgba(15, 23, 42, 0.75)', padding: 10, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', gap: 8
  },
  imageOverlayText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600', flex: 1 },

  presetsSection: { marginTop: 12, width: '100%' },
  presetsTitle: { fontSize: 13, fontWeight: '800', marginBottom: 12, letterSpacing: -0.3 },
  presetsGrid: { gap: 10 },
  presetCard: { 
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, 
    borderRadius: 16, padding: 10, position: 'relative' 
  },
  presetImage: { width: 50, height: 50, borderRadius: 10, marginRight: 12 },
  presetInfo: { flex: 1 },
  presetName: { fontSize: 13, fontWeight: '700' },
  presetSub: { fontSize: 11, marginTop: 2 },
  activeIndicator: { 
    position: 'absolute', right: 12, width: 22, height: 22, 
    borderRadius: 11, alignItems: 'center', justifyContent: 'center' 
  },

  resultContainer: { width: '100%', alignItems: 'stretch' },
  resultHeader: { alignItems: 'center', marginBottom: 24 },
  successIconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  resultTitle: { fontSize: 20, fontWeight: '800', marginBottom: 6, letterSpacing: -0.3 },
  resultSub: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  
  itemsList: { width: '100%', gap: 12, marginBottom: 20 },
  itemCard: { borderRadius: 18, padding: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  itemName: { fontSize: 14, fontWeight: '800', flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: '700' },
  
  itemRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  inputGroup: { flex: 1, marginRight: 12 },
  label: { fontSize: 11, marginBottom: 4, fontWeight: '600' },
  input: { 
    height: 38, borderWidth: 1, 
    borderRadius: 10, paddingHorizontal: 10, fontSize: 13, fontWeight: '600' 
  },
  totalGroup: { flex: 1, alignItems: 'flex-end' },
  itemTotal: { fontSize: 14, fontWeight: '800', marginBottom: 8 },

  totalSumCard: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    padding: 18, borderRadius: 20, marginTop: 4 
  },
  totalSumLabel: { fontSize: 13, fontWeight: '700' },
  totalSumValue: { fontSize: 18, fontWeight: '800' },

  secondaryButton: { 
    flex: 1, height: 50, borderRadius: 16, borderWidth: 1, 
    justifyContent: 'center', alignItems: 'center' 
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '700' },
  primarySaveButton: { 
    flex: 2, height: 50, borderRadius: 16, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center' 
  },
  primarySaveButtonText: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
