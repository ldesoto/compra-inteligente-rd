import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import api from '../services/api';
import { BottomTabBar } from '../components/BottomTabBar';

interface ProductResult {
  id: string;
  name: string;
  imageUrl?: string;
  price?: number;
  category?: string;
}

export const SearchScreen = ({ navigation }: any) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/scraper/search?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch (e) {
        console.warn('Search error', e);
      } finally {
        setIsLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  const popularCategories = [
    { name: 'Arroz', icon: 'package' as any },
    { name: 'Aceite', icon: 'droplet' as any },
    { name: 'Leche', icon: 'coffee' as any },
    { name: 'Huevos', icon: 'circle' as any },
    { name: 'Carne', icon: 'heart' as any },
    { name: 'Pollo', icon: 'feather' as any },
    { name: 'Café', icon: 'coffee' as any },
    { name: 'Azúcar', icon: 'box' as any },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title}>Buscar Productos</Text>
      </View>

      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#9CA3AF" style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre, marca o categoría..."
          placeholderTextColor="#9CA3AF"
          value={query}
          onChangeText={setQuery}
          autoFocus
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={{ padding: 8 }}>
            <Feather name="x" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      <View style={{ flex: 1 }}>
        {query.length < 2 ? (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categorías Populares</Text>
            <View style={styles.categoriesGrid}>
              {popularCategories.map((cat, i) => (
                <TouchableOpacity key={i} style={styles.categoryCard} onPress={() => setQuery(cat.name)}>
                  <View style={styles.categoryIconBg}>
                    <Feather name={cat.icon} size={20} color="#059669" />
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.loadingText}>Buscando en el catálogo...</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={item => item.id}
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
                <Text style={styles.emptyText}>No encontramos "{query}" en el catálogo. Intenta con otro término.</Text>
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
  title: { fontSize: 24, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 20, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, fontSize: 16, color: '#111827', fontWeight: '500' },

  categoriesSection: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#374151', marginBottom: 20, letterSpacing: -0.3 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '22%', alignItems: 'center', marginBottom: 8 },
  categoryIconBg: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryName: { fontSize: 13, fontWeight: '600', color: '#4B5563', textAlign: 'center' },

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
