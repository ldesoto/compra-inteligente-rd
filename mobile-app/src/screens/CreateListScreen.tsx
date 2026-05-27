import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';

export const CreateListScreen = ({ navigation }: any) => {
  const { lists, createList, setCurrentList, generateRecurrentList } = useAppStore();

  const handleCreateNew = () => {
    const name = `Compra ${new Date().toLocaleDateString('es-DO', { month: 'short', day: 'numeric' })}`;
    createList(name);
    navigation.navigate('ListDetail');
  };

  const handleGenerateHabits = async (frequency: string) => {
    const res = await generateRecurrentList(frequency);
    if (res.success) {
      setCurrentList(res.list);
      navigation.navigate('ListDetail');
    } else {
      alert(res.message);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color="#00B2A9" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Listas</Text>
      </View>
      <FlatList
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={() => (
          <>
            {/* Create New */}
            <TouchableOpacity activeOpacity={0.85} onPress={handleCreateNew} style={styles.createBtn}>
              <Feather name="plus" size={20} color="#FFF" />
              <Text style={styles.createBtnText}>Nueva Lista Manual</Text>
            </TouchableOpacity>

            <View style={styles.aiBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Feather name="cpu" size={20} color="#7C3AED" />
                <Text style={styles.aiTitle}>Creación con Inteligencia de Hábitos</Text>
              </View>
              <Text style={styles.aiSubtitle}>La IA analizará tus facturas escaneadas recientes y armará la lista por ti basándose en tus patrones de consumo.</Text>
              
              <View style={styles.aiButtonsRow}>
                <TouchableOpacity style={styles.aiBtn} onPress={() => handleGenerateHabits('weekly')}>
                  <Text style={styles.aiBtnText}>Semanal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiBtn} onPress={() => handleGenerateHabits('biweekly')}>
                  <Text style={styles.aiBtnText}>Quincenal</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.aiBtn} onPress={() => handleGenerateHabits('monthly')}>
                  <Text style={styles.aiBtnText}>Mensual</Text>
                </TouchableOpacity>
              </View>
            </View>

            {lists.length > 0 && (
              <Text style={styles.sectionTitle}>Listas Anteriores</Text>
            )}
          </>
        )}
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.listCard} onPress={() => {
            setCurrentList(item);
            navigation.navigate('ListDetail');
          }}>
            <View style={styles.listIconContainer}>
              <Feather name="file-text" size={20} color="#059669" />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={styles.listName}>{item.name}</Text>
              <Text style={styles.listMeta}>{item.items.length} productos</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBg}>
              <Feather name="clipboard" size={36} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>Sin listas previas</Text>
            <Text style={styles.emptyText}>Crea tu primera lista y descubre dónde ahorrar más en tu compra semanal.</Text>
          </View>
        )}
      />
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFAFA' },
  scroll: { padding: 20, paddingTop: 10 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, gap: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E6F8F7', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: '#00B2A9', letterSpacing: -0.5 },
  createBtn: { flexDirection: 'row', backgroundColor: '#059669', borderRadius: 16, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 36, shadowColor: '#059669', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 4 },
  createBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  aiBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#EDE9FE'
  },
  aiTitle: { fontSize: 16, fontWeight: '800', color: '#5B21B6', marginLeft: 8 },
  aiSubtitle: { fontSize: 14, color: '#7C3AED', marginBottom: 15, lineHeight: 20 },
  aiButtonsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  aiBtn: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center'
  },
  aiBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 30, marginBottom: 15, letterSpacing: -0.3 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  listIconContainer: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  listName: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  listMeta: { fontSize: 14, color: '#6B7280', marginTop: 4, fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginBottom: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, paddingHorizontal: 40 },
});
