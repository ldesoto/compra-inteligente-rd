import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { BottomTabBar } from '../components/BottomTabBar';
import { Asset } from 'expo-asset';

interface ProductResult {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
  category?: string;
}

const popularCategories = [
  { name: 'Despensa',              image: require('../../assets/categories/cat_despensa.png') },
  { name: 'Bebidas',               image: require('../../assets/categories/cat_bebidas.png') },
  { name: 'Licores',               image: require('../../assets/categories/cat_licores.png') },
  { name: 'Lácteos y Refrigerados', image: require('../../assets/categories/cat_lacteos.png') },
  { name: 'Carnes y Mariscos',     image: require('../../assets/categories/cat_carnes_mariscos.png') },
  { name: 'Frutas y Vegetales',    image: require('../../assets/categories/cat_frutas.png') },
  { name: 'Snacks y Dulces',       image: require('../../assets/categories/cat_snacks.png') },
  { name: 'Panadería y Repostería', image: require('../../assets/categories/cat_panaderia.png') },
  { name: 'Cuidado Personal',      image: require('../../assets/categories/cat_cuidado.png') },
  { name: 'Limpieza del Hogar',    image: require('../../assets/categories/cat_limpieza.png') },
  { name: 'Bebés',                 image: require('../../assets/categories/cat_bebes.png') },
  { name: 'Congelados',            image: require('../../assets/categories/cat_congelados.png') },
  { name: 'Hogar y Cocina',        image: require('../../assets/categories/cat_hogar.png') },
  { name: 'Mascotas',              image: require('../../assets/categories/cat_mascotas.png') },
];

const CategoryCard = ({ cat, onPress }: { cat: any, onPress: () => void }) => {
  return (
    <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
      <View style={[styles.categoryIconBg, { padding: 0, overflow: 'hidden' }]}>
        <Image 
          source={cat.image} 
          style={{ width: '100%', height: '100%' }} 
        />
      </View>
      <Text style={styles.categoryName} numberOfLines={2}>{cat.name}</Text>
    </TouchableOpacity>
  );
};

let hasPreloadedImages = false;

export const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allImagesLoaded, setAllImagesLoaded] = useState(hasPreloadedImages);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (hasPreloadedImages) return;
    
    const preloadImages = async () => {
      try {
        const imagesToPreload = popularCategories.map(cat => Asset.loadAsync(cat.image));
        await Promise.all(imagesToPreload);
        hasPreloadedImages = true;
        setAllImagesLoaded(true);
      } catch (e) {
        console.warn('Error preloading images', e);
        setAllImagesLoaded(true);
      }
    };
    
    preloadImages();
  }, []);

  useEffect(() => {
    if (!selectedCategory && query.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (query.trim().length >= 2) {
          const params = new URLSearchParams({ q: query.trim() });
          if (selectedCategory) params.append('category', selectedCategory);
          const res = await api.get(`/scraper/search?${params.toString()}`);
          setResults(res.data);
        } else if (selectedCategory) {
          const res = await api.get(`/scraper/products/${encodeURIComponent(selectedCategory)}?page=1&limit=100`);
          setResults(Array.isArray(res.data) ? res.data : (res.data.products ?? []));
        }
      } catch (e) {
        console.warn('Search error', e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, query.trim().length >= 2 ? 400 : 0);

    return () => clearTimeout(timer);
  }, [query, selectedCategory]);

  const handleCategoryPress = (catName: string) => {
    setQuery('');
    setSelectedCategory(catName);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleBack = () => {
    if (query.length > 0) {
      setQuery('');
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setResults([]);
    } else {
      navigation.goBack();
    }
  };

  const showCategories = !selectedCategory && query.length < 2;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {selectedCategory ?? 'Buscar Productos'}
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={selectedCategory ? `Buscar en ${selectedCategory}...` : 'Buscar por nombre, marca...'}
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus={false}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
            <Feather name="x" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter chip */}
      {selectedCategory && (
        <View style={styles.filterChipRow}>
          <View style={styles.filterChip}>
            <Feather name="tag" size={13} color="#00B2A9" style={{ marginRight: 5 }} />
            <Text style={styles.filterChipText}>{selectedCategory}</Text>
            <TouchableOpacity onPress={() => { setSelectedCategory(null); setResults([]); }} style={{ marginLeft: 6 }}>
              <Feather name="x" size={14} color="#00B2A9" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ flex: 1 }}>
        {showCategories ? (
          <ScrollView contentContainerStyle={styles.categoriesSection} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Categorías Populares</Text>
            
            <View style={{ position: 'relative', minHeight: 300 }}>
              {!allImagesLoaded && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
                  <ActivityIndicator size="small" color="#059669" />
                </View>
              )}

              <View style={[styles.categoriesGrid, { opacity: allImagesLoaded ? 1 : 0 }]}>
                {popularCategories.map((cat, i) => (
                  <CategoryCard 
                    key={i} 
                    cat={cat} 
                    onPress={() => handleCategoryPress(cat.name)} 
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>
              {selectedCategory && query.length < 2
                ? `Cargando ${selectedCategory}...`
                : 'Buscando en el catálogo...'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
            contentContainerStyle={{ padding: 20, paddingTop: 8 }}
            renderItem={({ item }) => (
              <View style={styles.resultCard}>
                <View style={styles.resultIconBg}>
                  <Feather name="package" size={22} color="#059669" />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={styles.resultName} numberOfLines={2}>{item.name}</Text>
                  {item.price ? (
                    <Text style={styles.resultPrice}>Desde RD$ {item.price.toFixed(2)}</Text>
                  ) : (
                    <Text style={styles.resultPriceNA}>Precio no disponible</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.resultAction} onPress={() => navigation.navigate('PriceHistory', { productId: item.id, productName: item.name })}>
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptySearch}>
                <View style={styles.emptyIconBg}>
                  <Feather name="search" size={32} color="#D1D5DB" />
                </View>
                <Text style={styles.emptyTitle}>Sin resultados</Text>
                <Text style={styles.emptyText}>
                  {query.length >= 2
                    ? `No encontramos "${query}"${selectedCategory ? ` en ${selectedCategory}` : ''}.`
                    : 'Esta categoría aún no tiene productos asignados.'}
                </Text>
              </View>
            }
          />
        )}
      </View>
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 40, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5, flex: 1 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },

  filterChipRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12 },
  filterChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F8F7', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#B2EBE8' },
  filterChipText: { fontSize: 13, fontWeight: '700', color: '#00B2A9' },

  categoriesSection: { padding: 20, paddingBottom: 80 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 20, letterSpacing: -0.3 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '22%', alignItems: 'center', marginBottom: 8 },
  categoryIconBg: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 11, fontWeight: '600', color: '#4B5563', textAlign: 'center', lineHeight: 14 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 15, color: '#6B7280', fontWeight: '500' },

  resultCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  resultIconBg: { width: 52, height: 52, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  resultName: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 4 },
  resultPrice: { fontSize: 14, fontWeight: '700', color: '#059669' },
  resultPriceNA: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  resultAction: { padding: 8 },

  emptySearch: { alignItems: 'center', paddingTop: 60 },
  emptyIconBg: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
});
