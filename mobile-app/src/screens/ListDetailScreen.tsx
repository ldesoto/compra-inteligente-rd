import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '../components/BottomTabBar';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export const ListDetailScreen = ({ navigation }: any) => {
  const { 
    currentList, 
    comparisonResult, 
    compareCurrentList, 
    updateItemQuantity, 
    addItem, 
    searchProducts, 
    darkMode, 
    language 
  } = useAppStore();
  
  const colors = darkMode ? themeColors.dark : themeColors.light;
  const [activeTab, setActiveTab] = useState<'Resumen' | 'Productos'>('Productos');

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

  // Convert English tab back to standard for internal state
  const displayToKey = (displayTab: string) => {
    if (displayTab === 'Summary' || displayTab === 'Resumen') return 'Resumen';
    if (displayTab === 'Products' || displayTab === 'Productos') return 'Productos';
    return 'Comparar';
  };
  
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderColor: colors.border }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
          activeOpacity={0.8}
        >
          <Feather name="chevron-left" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        {isEditingTitle ? (
          <TextInput
            style={[styles.titleInput, { color: colors.textPrimary, borderColor: colors.premium }]}
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
          <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={1}>
            {currentList?.name || t.defaultTitle}
          </Text>
        )}

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} 
            activeOpacity={0.8}
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
            <Feather name={isEditingTitle ? "check" : "edit-3"} size={16} color={isEditingTitle ? colors.primary : colors.textPrimary} />
          </TouchableOpacity>

          {!isEditingTitle && (
            <TouchableOpacity 
              style={[styles.iconBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]} 
              activeOpacity={0.8}
              onPress={() => setShowMenu(true)}
            >
              <Feather name="more-horizontal" size={16} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
        {t.tabs.map(displayTab => {
          const internalTab = displayToKey(displayTab);
          const isActive = activeTab === internalTab;
          return (
            <TouchableOpacity 
              key={displayTab} 
              style={[styles.tab, isActive && { borderBottomColor: colors.premium }]}
              onPress={() => {
                if (internalTab === 'Comparar') {
                  navigation.navigate('Comparison');
                } else {
                  setActiveTab(internalTab as any);
                }
              }}
            >
              <Text style={[
                styles.tabText, 
                { color: colors.textMuted }, 
                isActive && { color: colors.premium, fontWeight: themeTypography.fontWeights.extraBold }
              ]}>{displayTab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeTab === 'Resumen' && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* Mejor Opción Card */}
          <PremiumCard gradient="savings" style={styles.bestOptionCard}>
            <View style={styles.bestOptionHeader}>
              <View>
                <Text style={styles.bestOptionLabel}>Mejor opción de compra</Text>
                <Text style={styles.bestOptionStore}>{bestOption}</Text>
              </View>
              <View style={styles.medalBadge}>
                <Ionicons name="ribbon" size={32} color="#FFE082" />
              </View>
            </View>
            <Text style={styles.bestOptionPrice}>
              RD$ {bestPrice.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <View style={styles.savingsPill}>
              <Ionicons name="sparkles" size={14} color="#064E3B" style={{ marginRight: 4 }} />
              <Text style={styles.savingsText}>Ahorras RD$ 800 (24%)</Text>
            </View>
          </PremiumCard>

          {/* Comparativa de precios */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Comparativa de precios</Text>
            <PremiumCard style={{ marginHorizontal: themeLayout.spacing.lg }}>
              
              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, { backgroundColor: '#10B981' }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={[styles.chartStoreName, { color: colors.textPrimary }]}>Jumbo</Text>
                    <Text style={[styles.chartPrice, { color: colors.textPrimary }]}>RD$ 1,950</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.barFill, { width: '50%', backgroundColor: '#10B981' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, { backgroundColor: '#2563EB' }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={[styles.chartStoreName, { color: colors.textPrimary }]}>Bravo</Text>
                    <Text style={[styles.chartPrice, { color: colors.textPrimary }]}>RD$ 2,150</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.barFill, { width: '60%', backgroundColor: '#2563EB' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, { backgroundColor: '#D97706' }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={[styles.chartStoreName, { color: colors.textPrimary }]}>Nacional</Text>
                    <Text style={[styles.chartPrice, { color: colors.textPrimary }]}>RD$ 2,320</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.barFill, { width: '70%', backgroundColor: '#D97706' }]} />
                  </View>
                </View>
              </View>

              <View style={styles.chartRow}>
                <View style={[styles.miniLogo, { backgroundColor: '#DC2626' }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.chartRowHeader}>
                    <Text style={[styles.chartStoreName, { color: colors.textPrimary }]}>La Sirena</Text>
                    <Text style={[styles.chartPrice, { color: colors.textPrimary }]}>RD$ 2,780</Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.surfaceAlt }]}>
                    <View style={[styles.barFill, { width: '90%', backgroundColor: '#DC2626' }]} />
                  </View>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => navigation.navigate('Comparison')}
                activeOpacity={0.7}
              >
                <Text style={[styles.linkText, { color: colors.premium }]}>Ver análisis completo de sucursales</Text>
                <Feather name="arrow-right" size={16} color={colors.premium} />
              </TouchableOpacity>
            </PremiumCard>
          </View>

          {/* Resumen de tu lista */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Resumen de tu lista</Text>
            <PremiumCard style={{ marginHorizontal: themeLayout.spacing.lg }}>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{currentList?.items.length || 0}</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Productos</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>
                    {currentList?.items.reduce((sum, item) => sum + item.quantity, 0) || 0}
                  </Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Artículos</Text>
                </View>
                <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>0</Text>
                  <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>Agotados</Text>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* Distribución por categoría */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Distribución por categoría</Text>
            <PremiumCard style={[styles.distributionCard, { marginHorizontal: themeLayout.spacing.lg }]}>
              <View style={[styles.pieChartMock, { borderColor: colors.surfaceAlt }]}>
                 <View style={[styles.pieSlice, { borderTopColor: colors.primary, borderRightColor: colors.primary }]} />
                 <View style={[styles.pieSlice, { borderBottomColor: '#3B82F6', borderLeftColor: '#3B82F6', transform: [{rotate: '45deg'}] }]} />
                 <View style={[styles.pieSlice, { borderBottomColor: colors.premium, borderRightColor: colors.premium, transform: [{rotate: '-45deg'}] }]} />
                 <View style={[styles.pieHole, { backgroundColor: colors.surface }]} />
              </View>

              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: colors.primary}]} />
                  <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Alimentos</Text>
                  <Text style={[styles.legendValue, { color: colors.textPrimary }]}>45%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: '#3B82F6'}]} />
                  <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Lácteos</Text>
                  <Text style={[styles.legendValue, { color: colors.textPrimary }]}>20%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: colors.premium}]} />
                  <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Bebidas</Text>
                  <Text style={[styles.legendValue, { color: colors.textPrimary }]}>15%</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, {backgroundColor: colors.danger}]} />
                  <Text style={[styles.legendLabel, { color: colors.textPrimary }]}>Limpieza</Text>
                  <Text style={[styles.legendValue, { color: colors.textPrimary }]}>10%</Text>
                </View>
              </View>
            </PremiumCard>
          </View>

          {/* Impacto en tu presupuesto */}
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Impacto en tu presupuesto</Text>
            <PremiumCard style={{ marginHorizontal: themeLayout.spacing.lg }}>
              <Text style={[styles.budgetSubtitle, { color: colors.textMuted }]}>Has alcanzado un <Text style={{ color: colors.premium, fontWeight: '800' }}>72%</Text> de tu límite mensual</Text>
              
              <View style={[styles.budgetTrack, { backgroundColor: colors.surfaceAlt }]}>
                <View style={[styles.budgetFill, { width: '72%', backgroundColor: colors.premium }]} />
              </View>
              
              <View style={styles.budgetTexts}>
                <Text style={[styles.budgetText, { color: colors.textMuted }]}>Presupuesto: <Text style={{fontWeight: '700', color: colors.textPrimary}}>RD$ 8,500</Text></Text>
                <Text style={[styles.budgetText, { color: colors.textMuted }]}>Estimado: <Text style={{fontWeight: '700', color: colors.textPrimary}}>RD$ 6,080</Text></Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={[styles.tipBox, { backgroundColor: colors.surfaceAlt }]}>
                <View style={styles.tipHeader}>
                  <Ionicons name="sparkles" size={16} color={colors.premium} />
                  <Text style={[styles.tipTitle, { color: colors.premium }]}>Estrategia de Inteligencia Artificial</Text>
                </View>
                <Text style={[styles.tipText, { color: colors.textPrimary }]}>
                  Si divides esta compra entre <Text style={{ fontWeight: '800' }}>Jumbo</Text> y <Text style={{ fontWeight: '800' }}>Bravo</Text>, tu ahorro pasivo ascenderá a <Text style={[styles.tipBold, { color: colors.primary }]}>RD$ 1,120</Text> adicionales.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.tipButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => navigation.navigate('Comparison')}
                >
                  <Text style={[styles.tipButtonText, { color: colors.premium }]}>Aplicar Estrategia</Text>
                  <Feather name="arrow-right" size={14} color={colors.premium} />
                </TouchableOpacity>
              </View>
            </PremiumCard>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {activeTab === 'Productos' && (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Modern Search Bar */}
          <View style={[styles.searchBoxContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Feather name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput 
                placeholder={t.searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={[styles.searchInput, { color: colors.textPrimary }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.barcodeBtn}>
                  <Feather name="x" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.barcodeBtn} activeOpacity={0.7}>
                  <Ionicons name="barcode-outline" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}>
            {searchResults.length > 0 && (
              <View style={styles.searchResultsContainer}>
                <Text style={[styles.searchResultsTitle, { color: colors.textMuted }]}>Resultados sugeridos</Text>
                {searchResults.map(result => (
                  <TouchableOpacity 
                    key={result.id} 
                    style={[styles.searchResultItem, { backgroundColor: colors.surface, borderColor: colors.border }]} 
                    onPress={() => handleAddItem(result)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={24} color={colors.primary} />
                    <View style={[styles.searchResultInfo, { minWidth: 0 }]}>
                      <Text style={[styles.searchResultName, { color: colors.textPrimary }]} numberOfLines={2} ellipsizeMode="tail">{result.name}</Text>
                      <Text style={[styles.searchResultUnit, { color: colors.textMuted }]} numberOfLines={1}>{result.unit}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {searchQuery.length === 0 && currentList?.items?.map(item => (
              <PremiumCard 
                key={item.id} 
                style={styles.productCard}
              >
                <View style={[styles.productIconBox, { backgroundColor: darkMode ? '#064E3B' : '#E6F8F7' }]}>
                  <Ionicons name="cube-outline" size={22} color={colors.primary} />
                </View>
                <View style={[styles.productInfo, { minWidth: 0 }]}>
                  <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{item.name}</Text>
                  <Text style={[styles.productUnit, { color: colors.textMuted }]}>{item.unit}</Text>
                </View>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  {/* Quantity Controls */}
                  <View style={[styles.quantityControlsVertical, { backgroundColor: colors.surfaceAlt }]}>
                    <TouchableOpacity 
                      style={[styles.qtyBtn, { backgroundColor: colors.surface }]}
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Feather name="plus" size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.qtyTextVertical, { color: colors.textPrimary }]}>{item.quantity}</Text>
                    <TouchableOpacity 
                      style={[styles.qtyBtn, { backgroundColor: colors.surface }]} 
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
                      <Feather name="minus" size={14} color={colors.textPrimary} />
                    </TouchableOpacity>
                  </View>
                  
                  {/* Branch Comparison Pin Button */}
                  <TouchableOpacity 
                    style={[styles.deleteBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                    activeOpacity={0.8}
                    onPress={() => {
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
                    <Feather name="map-pin" size={16} color={colors.premium} />
                  </TouchableOpacity>
                </View>
              </PremiumCard>
            ))}
            
            {/* AI Suggest Float Panel */}
            <TouchableOpacity 
              style={styles.aiSuggestBtn} 
              onPress={() => navigation.navigate('AiAssistant')}
              activeOpacity={0.85}
            >
              <LinearGradient colors={darkMode ? ['#2D1B4E', '#1E1B4B'] : ['#F5F3FF', '#EDE9FE']} style={styles.aiSuggestGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Ionicons name="sparkles" size={16} color={colors.premium} />
                <Text style={[styles.aiSuggestText, { color: colors.premium }]}>{t.suggestAI}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Settings Modal Menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.menuContainer, { backgroundColor: colors.surface }]}>
                <TouchableOpacity 
                  style={styles.menuOption} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowMenu(false);
                    if (currentList) {
                      useAppStore.getState().duplicateList(currentList.id);
                      Alert.alert('Éxito', 'Lista duplicada correctamente');
                    }
                  }}
                >
                  <Feather name="copy" size={18} color={colors.premium} />
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Duplicar Lista</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuOption} 
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowMenu(false);
                    setEmailInput('');
                    setShowEmailPrompt(true);
                  }}
                >
                  <Feather name="user-plus" size={18} color="#D97706" />
                  <Text style={[styles.menuText, { color: colors.textPrimary }]}>Compartir / Colaborar</Text>
                </TouchableOpacity>

                <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity 
                  style={styles.menuOption} 
                  activeOpacity={0.7}
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
                            }
                          }
                        ]
                      );
                    }
                  }}
                >
                  <Feather name="trash-2" size={18} color={colors.danger} />
                  <Text style={[styles.menuText, { color: colors.danger }]}>Eliminar Lista</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Share Email Collaborator Prompt */}
      <Modal
        visible={showEmailPrompt}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEmailPrompt(false)}
      >
        <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.menuContainer, { width: '85%', borderRadius: 28, backgroundColor: colors.surface, padding: 24 }]}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 }}>Compartir Lista</Text>
            <Text style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>Ingresa el correo electrónico del colaborador (debe tener una cuenta registrada).</Text>
            
            <TextInput
              style={{ 
                backgroundColor: colors.surfaceAlt, 
                padding: 16, 
                borderRadius: 16, 
                borderWidth: 1, 
                borderColor: colors.border, 
                fontSize: 16, 
                color: colors.textPrimary,
                marginBottom: 20 
              }}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={emailInput}
              onChangeText={setEmailInput}
              autoFocus
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity 
                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: colors.surfaceAlt, alignItems: 'center' }}
                onPress={() => setShowEmailPrompt(false)}
              >
                <Text style={{ color: colors.textMuted, fontWeight: '700' }}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ flex: 1, padding: 16, borderRadius: 16, backgroundColor: colors.premium, alignItems: 'center' }}
                onPress={async () => {
                  if (emailInput.trim() && currentList) {
                    setShowEmailPrompt(false);
                    const res = await useAppStore.getState().shareList(currentList.id, emailInput.trim());
                    if (res.success) Alert.alert('Éxito', 'Invitación enviada al usuario');
                    else Alert.alert('Error', res.error);
                  }
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Invitar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para Comparar por Sucursal */}
      <Modal visible={showBranchModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Comparativa por Sucursal</Text>
              <TouchableOpacity 
                onPress={() => setShowBranchModal(false)}
                style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, width: 36, height: 36, borderRadius: 18 }]}
              >
                <Feather name="x" size={16} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            {branchCompareData && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={[styles.branchProductName, { color: colors.textPrimary }]}>{branchCompareData.productName}</Text>
                
                {branchCompareData.cheapestBranch && (
                  <View style={[styles.cheapestBranchBadge, { backgroundColor: darkMode ? '#372005' : '#FEF3C7' }]}>
                    <Ionicons name="trophy" size={16} color="#D97706" style={{ marginRight: 8 }} />
                    <Text style={[styles.cheapestBranchText, { color: darkMode ? '#FFE082' : '#B45309' }]}>
                      Sucursal recomendada: {branchCompareData.cheapestBranch.storeName} ({branchCompareData.cheapestBranch.distanceKm} km de distancia)
                    </Text>
                  </View>
                )}

                <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Disponibilidad y precios cercanos:</Text>
                {branchCompareData.branches?.map((branch: any, idx: number) => (
                  <View key={idx} style={[styles.branchCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={[styles.branchSupermarket, { color: colors.textPrimary }]}>{branch.supermarketName}</Text>
                      <Text style={[styles.branchStoreName, { color: colors.textMuted }]}>{branch.storeName}</Text>
                      <Text style={[styles.branchAddress, { color: colors.textMuted }]} numberOfLines={1}>{branch.address}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 }}>
                        <Feather name="map-pin" size={11} color={colors.textMuted} />
                        <Text style={[styles.branchDistance, { color: colors.textMuted }]}>{branch.distanceKm?.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} km de ti</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                      <Text style={[styles.branchPrice, { color: colors.primary }]}>RD$ {branch.price}</Text>
                      {branch.inStock ? (
                        <View style={[styles.inStockBadge, { backgroundColor: darkMode ? '#064E3B' : '#DCFCE7' }]}>
                          <Text style={[styles.inStockText, { color: colors.primary }]}>Disponible</Text>
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
  safe: { flex: 1 },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: 'transparent'
  },
  iconBtn: { 
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, 
    justifyContent: 'center', alignItems: 'center' 
  },
  title: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center', marginHorizontal: 10, letterSpacing: -0.5 },
  titleInput: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center', marginHorizontal: 10, borderBottomWidth: 2, paddingVertical: 4 },
  headerRight: { flexDirection: 'row', gap: 10 },
  
  tabsRow: { flexDirection: 'row', paddingHorizontal: 24, borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 14, fontWeight: '600' },
  
  scroll: { paddingBottom: 40, paddingTop: 16 },
  
  bestOptionCard: { 
    marginHorizontal: 20, borderRadius: 28, padding: 22, 
    marginBottom: 28, overflow: 'hidden'
  },
  bestOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bestOptionLabel: { fontSize: 12, color: '#FFFFFF', opacity: 0.8, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  bestOptionStore: { fontSize: 20, color: '#FFFFFF', fontWeight: '900', marginTop: 2 },
  bestOptionPrice: { fontSize: 32, color: '#FFFFFF', fontWeight: '900', marginBottom: 12 },
  savingsPill: { 
    flexDirection: 'row', alignSelf: 'flex-start', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, 
    borderRadius: 12, alignItems: 'center'
  },
  savingsText: { color: '#064E3B', fontSize: 13, fontWeight: '800' },
  medalBadge: { padding: 4 },

  sectionContainer: { marginBottom: 28 },
  sectionTitle: { fontSize: 16, fontWeight: '800', paddingHorizontal: 24, marginBottom: 12, letterSpacing: -0.3 },
  
  chartRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  miniLogo: { width: 14, height: 14, borderRadius: 7, marginRight: 12 },
  chartRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chartStoreName: { fontSize: 13, fontWeight: '700' },
  chartPrice: { fontSize: 13, fontWeight: '800' },
  barTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  
  divider: { height: 1, marginVertical: 12 },
  linkButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4, paddingVertical: 4 },
  linkText: { fontSize: 13, fontWeight: '700' },
  
  summaryGrid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryDivider: { width: 1, height: 32 },
  
  distributionCard: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  pieChartMock: { 
    width: 90, height: 90, borderRadius: 45, borderWidth: 16, 
    position: 'relative', overflow: 'hidden', marginRight: 20
  },
  pieSlice: { position: 'absolute', top: -16, left: -16, right: -16, bottom: -16, borderWidth: 32, borderColor: 'transparent', borderRadius: 64 },
  pieHole: { position: 'absolute', top: 16, left: 16, right: 16, bottom: 16, borderRadius: 32 },
  
  legend: { flex: 1, gap: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendLabel: { flex: 1, fontSize: 12, fontWeight: '600' },
  legendValue: { fontSize: 12, fontWeight: '800' },
  
  budgetSubtitle: { fontSize: 13, marginBottom: 12, fontWeight: '500' },
  budgetTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 10 },
  budgetFill: { height: '100%', borderRadius: 4 },
  budgetTexts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  budgetText: { fontSize: 12 },
  
  tipBox: { borderRadius: 18, padding: 16, marginTop: 12 },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  tipTitle: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  tipText: { fontSize: 13, lineHeight: 20, marginBottom: 12, fontWeight: '500' },
  tipBold: { fontWeight: '800' },
  tipButton: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, gap: 6 },
  tipButtonText: { fontSize: 12, fontWeight: '700' },

  // Estilos de la Pestaña "Productos"
  searchBoxContainer: { paddingHorizontal: 20, paddingVertical: 14 },
  searchBox: { 
    flexDirection: 'row', alignItems: 'center', 
    borderRadius: 16, paddingHorizontal: 16, height: 50, borderWidth: 1
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: '100%', fontSize: 14, fontWeight: '600' },
  barcodeBtn: { padding: 4, marginLeft: 10 },
  
  searchResultsContainer: { marginBottom: 16 },
  searchResultsTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10, paddingLeft: 4 },
  searchResultItem: { 
    flexDirection: 'row', alignItems: 'center', 
    padding: 14, borderRadius: 16, marginBottom: 8, borderWidth: 1
  },
  searchResultInfo: { flex: 1, marginLeft: 12 },
  searchResultName: { fontSize: 14, fontWeight: '700' },
  searchResultUnit: { fontSize: 12, marginTop: 2 },

  productCard: { 
    flexDirection: 'row', alignItems: 'center', borderRadius: 24, 
    padding: 16, marginBottom: 12
  },
  productIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productInfo: { flex: 1, flexShrink: 1, marginRight: 8 },
  productName: { fontSize: 14, fontWeight: '800', marginBottom: 3, flexShrink: 1 },
  productUnit: { fontSize: 12, fontWeight: '500' },
  
  quantityControlsVertical: { flexDirection: 'column', alignItems: 'center', borderRadius: 14, padding: 4, gap: 2 },
  qtyBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 1, elevation: 1 },
  qtyTextVertical: { fontSize: 14, fontWeight: '800', marginVertical: 4 },

  aiSuggestBtn: { marginTop: 10, borderRadius: 18, overflow: 'hidden' },
  aiSuggestGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  aiSuggestText: { fontSize: 13, fontWeight: '800' },

  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Estilos del Modal Menu
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
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
    fontSize: 15,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 24,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  branchProductName: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  cheapestBranchBadge: { padding: 12, borderRadius: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  cheapestBranchText: { fontWeight: '700', flex: 1, fontSize: 13, lineHeight: 18 },
  modalLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  branchCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  branchSupermarket: { fontSize: 14, fontWeight: '800' },
  branchStoreName: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  branchAddress: { fontSize: 11, marginTop: 2 },
  branchDistance: { fontSize: 11, fontWeight: '600' },
  branchPrice: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  inStockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  inStockText: { fontSize: 10, fontWeight: '800' }
});
