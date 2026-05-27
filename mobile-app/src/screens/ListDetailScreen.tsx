import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../components/BottomTabBar';

export const ListDetailScreen = ({ navigation }: any) => {
  const { currentList, comparisonResult, compareCurrentList, updateItemQuantity, addItem, searchProducts, darkMode, language } = useAppStore();
  const [activeTab, setActiveTab] = useState('Productos');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const [showBranchModal, setShowBranchModal] = useState(false);
  const [branchCompareData, setBranchCompareData] = useState<any>(null);

  React.useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchProducts(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleAddItem = (item: any) => {
    addItem({ ...item, quantity: 1, id: Date.now().toString() });
    setSearchQuery('');
    setSearchResults([]);
  };

  // Asegurarnos de que hay una comparativa fresca
  React.useEffect(() => {
    if (currentList && currentList.items.length > 0 && !comparisonResult && !useAppStore.getState().isLoading) {
      compareCurrentList();
    }
  }, [currentList, comparisonResult]);

  const bestOption = comparisonResult?.bestOptionName || 'Calculando...';
  const bestPrice = comparisonResult?.comparison[0]?.totalCost || 0;
  
  const t = {
    tabs: language === 'Inglés' ? ['Summary', 'Products', 'Compare'] : ['Resumen', 'Productos', 'Comparar'],
    searchPlaceholder: language === 'Inglés' ? 'Search products or scan barcode...' : 'Buscar productos o escanear código...',
    suggestAI: language === 'Inglés' ? 'Suggest products with AI' : 'Sugerir productos con IA',
    defaultTitle: language === 'Inglés' ? 'My Weekly Groceries' : 'Mi Compra Semanal'
  };

  const theme = {
    bg: darkMode ? '#0F172A' : '#FFFFFF',
    text: darkMode ? '#F8FAFC' : '#0F172A',
    card: darkMode ? '#1E293B' : '#FFFFFF',
    border: darkMode ? '#334155' : '#F1F5F9',
    muted: darkMode ? '#94A3B8' : '#64748B'
  };

  // Convert English tab back to standard for internal state
  const displayToKey = (displayTab: string) => {
    if (displayTab === 'Summary') return 'Resumen';
    if (displayTab === 'Products') return 'Productos';
    if (displayTab === 'Compare') return 'Comparar';
    return displayTab;
  };
  
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Feather name="chevron-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        {isEditingTitle ? (
          <TextInput
            style={[styles.title, { borderBottomWidth: 1, borderBottomColor: '#16A34A', padding: 0 }]}
            value={editTitleValue}
            onChangeText={setEditTitleValue}
            autoFocus
            onSubmitEditing={() => {
              if (currentList && editTitleValue.trim() !== '') {
                useAppStore.getState().updateListName(currentList.id, editTitleValue.trim());
              }
              setIsEditingTitle(false);
            }}
            onBlur={() => {
              if (currentList && editTitleValue.trim() !== '') {
                useAppStore.getState().updateListName(currentList.id, editTitleValue.trim());
              }
              setIsEditingTitle(false);
            }}
          />
        ) : (
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{currentList?.name || t.defaultTitle}</Text>
        )}
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => {
              if (!isEditingTitle) {
                setEditTitleValue(currentList?.name || '');
                setIsEditingTitle(true);
              } else {
                if (currentList && editTitleValue.trim() !== '') {
                  useAppStore.getState().updateListName(currentList.id, editTitleValue.trim());
                }
                setIsEditingTitle(false);
              }
            }}
          >
            <Feather name={isEditingTitle ? "check" : "edit-2"} size={20} color={isEditingTitle ? "#16A34A" : "#475569"} />
          </TouchableOpacity>

          {!isEditingTitle && (
            <TouchableOpacity 
              style={styles.iconBtn} 
              onPress={() => setShowMenu(true)}
            >
              <Feather name="more-vertical" size={20} color="#475569" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: theme.border }]}>
        {t.tabs.map(displayTab => {
          const internalTab = displayToKey(displayTab);
          return (
            <TouchableOpacity 
              key={internalTab} 
              style={[styles.tab, activeTab === internalTab && styles.activeTab]}
              onPress={() => {
                if (internalTab === 'Comparar') {
                  navigation.navigate('Comparison');
                } else {
                  setActiveTab(internalTab);
                }
              }}
            >
              <Text style={[styles.tabText, { color: theme.muted }, activeTab === internalTab && styles.activeTabText]}>{displayTab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'Resumen' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Mejor Opción Card */}
          <View style={styles.bestOptionCard}>
            <Text style={styles.bestOptionLabel}>Mejor opción</Text>
            <Text style={styles.bestOptionPrice}>RD$ {bestPrice.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <Text style={styles.bestOptionStore}>{bestOption}</Text>
            <View style={styles.savingsPill}>
              <Text style={styles.savingsText}>Ahorras RD$ 800 (24%)</Text>
            </View>
            
            <View style={styles.bestOptionIconDecor}>
              <Ionicons name="cart" size={100} color="#F0FDF4" />
            </View>
            <View style={styles.medalBadge}>
              <Ionicons name="ribbon" size={40} color="#F59E0B" />
            </View>
          </View>

          {/* Comparativa de precios */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Comparativa de precios</Text>
            <View style={styles.cardClean}>
              
              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, {backgroundColor: '#16A34A'}]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={styles.chartStoreName}>Jumbo</Text>
                    <Text style={styles.chartPrice}>RD$ 1,950</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: '50%', backgroundColor: '#16A34A' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, {backgroundColor: '#3B82F6'}]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={styles.chartStoreName}>Bravo</Text>
                    <Text style={styles.chartPrice}>RD$ 2,150</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: '60%', backgroundColor: '#3B82F6' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, {backgroundColor: '#EAB308'}]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={styles.chartStoreName}>Nacional</Text>
                    <Text style={styles.chartPrice}>RD$ 2,320</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: '70%', backgroundColor: '#EAB308' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, {backgroundColor: '#EF4444'}]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={styles.chartStoreName}>La Sirena</Text>
                    <Text style={styles.chartPrice}>RD$ 2,780</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: '90%', backgroundColor: '#EF4444' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.divider} />
              
              <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('Comparison')}>
                <Text style={styles.linkText}>Ver análisis completo</Text>
                <Feather name="chevron-right" size={16} color="#16A34A" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Resumen de tu lista */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Resumen de tu lista</Text>
            <View style={[styles.cardClean, styles.summaryGrid]}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{currentList?.items.length || 0}</Text>
                <Text style={styles.summaryLabel}>Productos</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{currentList?.items.reduce((sum, item) => sum + item.quantity, 0) || 0}</Text>
                <Text style={styles.summaryLabel}>Artículos</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>0</Text>
                <Text style={styles.summaryLabel}>No disponibles</Text>
              </View>
            </View>
          </View>

          {/* Distribución por categoría */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Distribución por categoría</Text>
            <View style={[styles.cardClean, styles.distributionCard]}>
              <View style={styles.pieChartMock}>
                 {/* Simulación visual de Pie Chart usando CSS */}
                 <View style={[styles.pieSlice, { borderTopColor: '#16A34A', borderRightColor: '#16A34A' }]} />
                 <View style={[styles.pieSlice, { borderBottomColor: '#3B82F6', borderLeftColor: '#3B82F6', transform: [{rotate: '45deg'}] }]} />
                 <View style={[styles.pieSlice, { borderBottomColor: '#8B5CF6', borderRightColor: '#8B5CF6', transform: [{rotate: '-45deg'}] }]} />
                 <View style={styles.pieHole} />
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#16A34A'}]} />
                  <Text style={styles.legendLabel}>Alimentos</Text>
                  <Text style={styles.legendValue}>45%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#3B82F6'}]} />
                  <Text style={styles.legendLabel}>Lácteos</Text>
                  <Text style={styles.legendValue}>20%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#8B5CF6'}]} />
                  <Text style={styles.legendLabel}>Bebidas</Text>
                  <Text style={styles.legendValue}>15%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#EC4899'}]} />
                  <Text style={styles.legendLabel}>Limpieza</Text>
                  <Text style={styles.legendValue}>10%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#EAB308'}]} />
                  <Text style={styles.legendLabel}>Otros</Text>
                  <Text style={styles.legendValue}>10%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Impacto en tu presupuesto */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Impacto en tu presupuesto</Text>
              <Feather name="trending-up" size={18} color="#16A34A" />
            </View>
            <View style={styles.cardClean}>
              <Text style={styles.budgetSubtitle}>Llevas un 72% de tu presupuesto mensual</Text>
              
              <View style={styles.budgetTrack}>
                <View style={[styles.budgetFill, { width: '72%' }]} />
              </View>
              
              <View style={styles.budgetTexts}>
                <Text style={styles.budgetText}>Presupuesto: <Text style={{fontWeight: '700'}}>RD$ 8,500</Text></Text>
                <Text style={styles.budgetText}>Gastado: <Text style={{fontWeight: '700'}}>RD$ 6,080</Text></Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.tipBox}>
                <View style={styles.tipHeader}>
                  <Ionicons name="sparkles" size={16} color="#3B82F6" />
                  <Text style={styles.tipTitle}>Tip inteligente</Text>
                </View>
                <Text style={styles.tipText}>
                  Si divides tu compra entre Jumbo y Bravo, puedes ahorrar <Text style={styles.tipBold}>RD$ 1,120</Text> más.
                </Text>
                
                <TouchableOpacity style={styles.tipButton}>
                  <Text style={styles.tipButtonText}>Ver estrategia</Text>
                  <Feather name="chevron-right" size={16} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Productos' && (
        <View style={{ flex: 1, backgroundColor: theme.bg }}>
          <View style={[styles.searchBoxContainer, { backgroundColor: theme.bg }]}>
            <View style={[styles.searchBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Feather name="search" size={20} color={theme.muted} style={styles.searchIcon} />
              <TextInput 
                placeholder={t.searchPlaceholder}
                placeholderTextColor={theme.muted}
                style={[styles.searchInput, { color: theme.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.barcodeBtn}>
                  <Feather name="x" size={20} color={theme.muted} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.barcodeBtn}>
                  <Ionicons name="barcode-outline" size={20} color={theme.text} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                <Text style={styles.searchResultsTitle}>Resultados sugeridos</Text>
                {searchResults.map(result => (
                  <TouchableOpacity key={result.id} style={styles.searchResultItem} onPress={() => handleAddItem(result)}>
                    <Ionicons name="add-circle" size={24} color="#16A34A" />
                    <View style={[styles.searchResultInfo, { minWidth: 0 }]}>
                      <Text style={styles.searchResultName} numberOfLines={2} ellipsizeMode="tail">{result.name}</Text>
                      <Text style={styles.searchResultUnit} numberOfLines={1}>{result.unit}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchQuery.length === 0 && currentList?.items?.map(item => (
              <View key={item.id} style={[styles.productCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.productIconBox, darkMode && { backgroundColor: '#064E3B' }]}>
                  <Ionicons name="cube-outline" size={24} color="#16A34A" />
                </View>
                <View style={[styles.productInfo, { minWidth: 0 }]}>
                  <Text style={[styles.productName, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.productUnit, { color: theme.muted }]}>{item.unit}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={styles.quantityControlsVertical}>
                    <TouchableOpacity 
                      style={styles.qtyBtn}
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Feather name="plus" size={16} color="#0F172A" />
                    </TouchableOpacity>
                    <Text style={styles.qtyTextVertical}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => {
                        if (item.quantity === 1) {
                          Alert.alert(
                            'Eliminar producto',
                            `¿Deseas eliminar "${item.name}" de la lista?`,
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { 
                                text: 'Eliminar', 
                                style: 'destructive',
                                onPress: () => useAppStore.getState().removeItem(item.id) 
                              }
                            ]
                          );
                        } else {
                          updateItemQuantity(item.id, item.quantity - 1);
                        }
                      }}
                    >
                      <Feather name="minus" size={16} color="#0F172A" />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Botón para comparar sucursales */}
                  <TouchableOpacity 
                    style={[styles.deleteBtn, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', marginLeft: 12 }]}
                    onPress={() => {
                      // Attempt to get real location using React Native's built-in Geolocation API
                      
                      const getBranchCompare = async (lat: number, lng: number) => {
                        const result = await useAppStore.getState().compareByBranch(item.canonicalProductId || item.id, lat, lng);
                        if (result) {
                          setBranchCompareData(result);
                          setShowBranchModal(true);
                        } else {
                          Alert.alert('No disponible', 'No hay datos de sucursales para este producto.');
                        }
                      };

                      const fetchLocation = async () => {
                        try {
                          const Location = require('expo-location');
                          
                          let { status } = await Location.requestForegroundPermissionsAsync();
                          if (status !== 'granted') {
                            Alert.alert('Permiso denegado', 'La aplicación necesita acceder a tu ubicación para mostrarte las sucursales cercanas.');
                            return;
                          }

                          let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                          getBranchCompare(location.coords.latitude, location.coords.longitude);
                        } catch (e: any) {
                          Alert.alert('Error de GPS', 'Ocurrió un error al obtener la ubicación: ' + e.message);
                        }
                      };

                      fetchLocation();
                    }}
                  >
                    <Feather name="map-pin" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            {/* Botón flotante para sugerencias IA */}
            <TouchableOpacity style={styles.aiSuggestBtn} onPress={() => navigation.navigate('AiAssistant')}>
              <LinearGradient colors={darkMode ? ['#064E3B', '#16A34A'] : ['#F0FDF4', '#DCFCE7']} style={styles.aiSuggestGradient}>
                <Ionicons name="sparkles" size={18} color={darkMode ? '#DCFCE7' : '#16A34A'} />
                <Text style={[styles.aiSuggestText, darkMode && { color: '#DCFCE7' }]}>{t.suggestAI}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}



      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.menuContainer}>
                <TouchableOpacity 
                  style={styles.menuOption} 
                  onPress={() => {
                    setShowMenu(false);
                    if (currentList) {
                      useAppStore.getState().duplicateList(currentList.id);
                      Alert.alert('Éxito', 'Lista duplicada correctamente');
                    }
                  }}
                >
                  <Feather name="copy" size={20} color="#3B82F6" />
                  <Text style={styles.menuText}>Duplicar Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuOption} 
                  onPress={() => {
                    setShowMenu(false);
                    setEmailInput('');
                    setShowEmailPrompt(true);
                  }}
                >
                  <Feather name="user-plus" size={20} color="#F59E0B" />
                  <Text style={styles.menuText}>Compartir / Colaborar</Text>
                </TouchableOpacity>

                <View style={styles.menuDivider} />

                <TouchableOpacity 
                  style={[styles.menuOption, { paddingBottom: 8 }]} 
                  onPress={() => {
                    setShowMenu(false);
                    if (Platform.OS === 'web') {
                      if (window.confirm('¿Estás seguro que deseas eliminar esta lista completa?')) {
                        if (currentList) {
                          useAppStore.getState().deleteList(currentList.id);
                          navigation.goBack();
                        }
                      }
                    } else {
                      Alert.alert(
                        'Eliminar Lista',
                        '¿Estás seguro que deseas eliminar esta lista completa?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          { text: 'Sí, eliminar', style: 'destructive', onPress: () => {
                            if (currentList) {
                              useAppStore.getState().deleteList(currentList.id);
                              navigation.goBack();
                            }
                          }}
                        ]
                      );
                    }
                  }}
                >
                  <Feather name="trash-2" size={20} color="#EF4444" />
                  <Text style={[styles.menuText, { color: '#EF4444' }]}>Eliminar Lista</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        visible={showEmailPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailPrompt(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.menuContainer, { width: '85%', borderRadius: 24 }]}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 8 }}>Compartir Lista</Text>
            <Text style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>Ingresa el correo electrónico del colaborador (Debe estar registrado)</Text>
            
            <TextInput
              style={{ backgroundColor: '#F8FAFC', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', fontSize: 16, marginBottom: 20 }}
              placeholder="correo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center' }}
                onPress={() => setShowEmailPrompt(false)}
              >
                <Text style={{ color: '#475569', fontWeight: '600' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#3B82F6', alignItems: 'center' }}
                onPress={async () => {
                  if (emailInput.trim() && currentList) {
                    setShowEmailPrompt(false);
                    const res = await useAppStore.getState().shareList(currentList.id, emailInput.trim());
                    if (res.success) Alert.alert('Éxito', 'Invitación enviada al usuario');
                    else Alert.alert('Error', res.error);
                  }
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Invitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Comparar por Sucursal */}
      <Modal visible={showBranchModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comparativa por Sucursal</Text>
              <TouchableOpacity onPress={() => setShowBranchModal(false)}>
                <Feather name="x" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            {branchCompareData && (
              <ScrollView>
                <Text style={styles.branchProductName}>{branchCompareData.productName}</Text>
                
                {branchCompareData.cheapestBranch && (
                  <View style={styles.cheapestBranchBadge}>
                    <Ionicons name="trophy" size={16} color="#B45309" />
                    <Text style={styles.cheapestBranchText}>
                      Sucursal más barata: {branchCompareData.cheapestBranch.storeName} (A {branchCompareData.cheapestBranch.distanceKm}km)
                    </Text>
                  </View>
                )}

                <Text style={styles.modalLabel}>Disponibilidad cercana:</Text>
                {branchCompareData.branches?.map((branch: any, idx: number) => (
                  <View key={idx} style={styles.branchCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.branchSupermarket}>{branch.supermarketName}</Text>
                      <Text style={styles.branchStoreName}>{branch.storeName}</Text>
                      <Text style={styles.branchAddress}>{branch.address}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Feather name="map-pin" size={12} color="#64748B" />
                        <Text style={styles.branchDistance}>{branch.distanceKm?.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km de ti</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.branchPrice}>RD$ {branch.price}</Text>
                      {branch.inStock ? (
                        <View style={styles.inStockBadge}>
                          <Text style={styles.inStockText}>Disponible</Text>
                        </View>
                      ) : (
                        <View style={[styles.inStockBadge, { backgroundColor: '#FEE2E2' }]}>
                          <Text style={[styles.inStockText, { color: '#EF4444' }]}>Agotado</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 
  },
  iconBtn: { padding: 4 },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1, textAlign: 'center', marginHorizontal: 10 },
  headerRight: { flexDirection: 'row', gap: 10 },
  
  tabsRow: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#00B2A9' },
  tabText: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  activeTabText: { color: '#00B2A9', fontWeight: '700' },
  
  scroll: { paddingBottom: 40, paddingTop: 20 },
  
  bestOptionCard: { 
    marginHorizontal: 24, backgroundColor: '#E6F8F7', borderRadius: 24, padding: 24, 
    marginBottom: 32, overflow: 'hidden'
  },
  bestOptionLabel: { fontSize: 14, color: '#00B2A9', fontWeight: '600', marginBottom: 8, zIndex: 2 },
  bestOptionPrice: { fontSize: 36, color: '#0F172A', fontWeight: '900', marginBottom: 4, zIndex: 2 },
  bestOptionStore: { fontSize: 18, color: '#00B2A9', fontWeight: '700', marginBottom: 16, zIndex: 2 },
  savingsPill: { 
    alignSelf: 'flex-start', backgroundColor: '#BFF3F0', paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 16, zIndex: 2 
  },
  savingsText: { color: '#009088', fontSize: 13, fontWeight: '700' },
  bestOptionIconDecor: { position: 'absolute', right: -20, bottom: -20, zIndex: 1, opacity: 0.5, transform: [{rotate: '-15deg'}] },
  medalBadge: { position: 'absolute', right: 20, top: 20, zIndex: 3 },

  sectionContainer: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', paddingHorizontal: 24, marginBottom: 16 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
  
  cardClean: { 
    marginHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, 
    borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4
  },
  
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  miniLogo: { width: 24, height: 24, borderRadius: 12, marginRight: 12 },
  chartRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chartStoreName: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  chartPrice: { fontSize: 14, color: '#0F172A', fontWeight: '800' },
  barTrack: { height: 6, backgroundColor: '#F1F5F9', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 8 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  linkText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
  
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 24 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  summaryLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#F1F5F9' },
  
  distributionCard: { flexDirection: 'row', alignItems: 'center' },
  pieChartMock: { 
    width: 120, height: 120, borderRadius: 60, borderWidth: 20, borderColor: '#F1F5F9', 
    position: 'relative', overflow: 'hidden', marginRight: 24
  },
  pieSlice: { position: 'absolute', top: -20, left: -20, right: -20, bottom: -20, borderWidth: 40, borderColor: 'transparent', borderRadius: 80 },
  pieHole: { position: 'absolute', top: 20, left: 20, right: 20, bottom: 20, backgroundColor: '#FFF', borderRadius: 40 },
  
  legend: { flex: 1, gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 12, color: '#475569' },
  legendValue: { fontSize: 12, color: '#0F172A', fontWeight: '700' },
  
  budgetSubtitle: { fontSize: 14, color: '#475569', marginBottom: 16 },
  budgetTrack: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  budgetFill: { height: '100%', backgroundColor: '#00B2A9', borderRadius: 4 },
  budgetTexts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  budgetText: { fontSize: 12, color: '#64748B' },
  
  tipBox: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, marginTop: 12 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  tipTitle: { fontSize: 13, color: '#3B82F6', fontWeight: '700' },
  tipText: { fontSize: 13, color: '#475569', lineHeight: 20, marginBottom: 12 },
  tipBold: { color: '#0F172A', fontWeight: '700' },
  tipButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', gap: 4 },
  tipButtonText: { color: '#3B82F6', fontSize: 12, fontWeight: '600' },

  // Estilos de la Pestaña "Productos"
  searchBoxContainer: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: '#FFFFFF' },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', 
    borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1, borderColor: '#F1F5F9'
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 15, color: '#0F172A' },
  barcodeBtn: { padding: 4, marginLeft: 10 },
  
  searchResultsContainer: { marginBottom: 20 },
  searchResultsTitle: { fontSize: 14, fontWeight: '600', color: '#64748B', marginBottom: 12 },
  searchResultItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    padding: 16, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#BFF3F0' 
  },
  searchResultInfo: { flex: 1, marginLeft: 12 },
  searchResultName: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  searchResultUnit: { fontSize: 13, color: '#64748B', marginTop: 2 },

  productCard: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, 
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9',
    shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1
  },
  productIconBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  productInfo: { flex: 1, flexShrink: 1, marginRight: 12 },
  productName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4, flexShrink: 1 },
  productUnit: { fontSize: 13, color: '#64748B' },
  
  quantityControlsVertical: { flexDirection: 'column', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 4 },
  qtyBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 8, shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  qtyTextVertical: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginVertical: 8 },

  aiSuggestBtn: { marginTop: 10, borderRadius: 16, overflow: 'hidden' },
  aiSuggestGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  aiSuggestText: { color: '#00B2A9', fontSize: 14, fontWeight: '700' },

  // Estilos Pestaña "Comparar"
  compareEmptyState: { alignItems: 'center', padding: 20 },
  compareEmptyTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginTop: 16, marginBottom: 8 },
  compareEmptySub: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  primaryButton: { backgroundColor: '#00B2A9', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  primaryButtonText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },

  // Estilos del Modal Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    gap: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
    marginHorizontal: 8,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  branchProductName: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  cheapestBranchBadge: { backgroundColor: '#FEF3C7', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cheapestBranchText: { color: '#B45309', fontWeight: '700', marginLeft: 8, flex: 1, fontSize: 13 },
  modalLabel: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 10 },
  branchCard: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  branchSupermarket: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  branchStoreName: { fontSize: 13, color: '#475569', marginTop: 2 },
  branchAddress: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  branchDistance: { fontSize: 12, color: '#64748B', marginLeft: 4 },
  branchPrice: { fontSize: 16, fontWeight: '800', color: '#16A34A', marginBottom: 6 },
  inStockBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  inStockText: { color: '#16A34A', fontSize: 10, fontWeight: '700' }
});
