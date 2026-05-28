import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { BottomTabBar } from '../components/BottomTabBar';
import { PremiumCard } from '../components/PremiumCard';
import { PremiumButton } from '../components/PremiumButton';
import { themeColors, themeLayout, themeShadows, themeTypography } from '../theme/DesignSystem';

export const CreateListScreen = ({ navigation }: any) => {
  const { lists, createList, setCurrentList, generateRecurrentList, darkMode } = useAppStore();
  const colors = darkMode ? themeColors.dark : themeColors.light;

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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => navigation.goBack()} 
          style={[styles.backBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Feather name="chevron-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Mis Listas</Text>
      </View>

      <FlatList
        contentContainerStyle={styles.scroll}
        ListHeaderComponent={() => (
          <>
            {/* Create New Manual Button */}
            <PremiumButton 
              title="Nueva Lista Manual" 
              onPress={handleCreateNew} 
              variant="primary"
              icon={<Feather name="plus" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />}
              style={styles.createBtn}
            />

            {/* AI Habit Builder Card */}
            <PremiumCard 
              variant="surface"
              style={[
                styles.aiCard, 
                { 
                  borderColor: colors.premium, 
                  borderWidth: 1.5,
                  backgroundColor: colors.surface 
                }
              ]}
            >
              <View style={styles.aiHeaderRow}>
                <View style={[styles.aiIconBox, { backgroundColor: colors.premiumLight }]}>
                  <Ionicons name="sparkles" size={18} color={colors.premium} />
                </View>
                <Text style={[styles.aiTitle, { color: colors.premium }]}>Inteligencia de Hábitos</Text>
              </View>
              
              <Text style={[styles.aiSubtitle, { color: colors.textSecondary }]}>
                La IA analizará tus facturas escaneadas recientes y armará la lista de compras por ti basándose en tus patrones de consumo.
              </Text>
              
              <View style={styles.aiButtonsRow}>
                <TouchableOpacity 
                  activeOpacity={0.85}
                  style={[styles.aiBtn, { backgroundColor: colors.premium }]} 
                  onPress={() => handleGenerateHabits('weekly')}
                >
                  <Text style={styles.aiBtnText}>Semanal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.85}
                  style={[styles.aiBtn, { backgroundColor: colors.premium }]} 
                  onPress={() => handleGenerateHabits('biweekly')}
                >
                  <Text style={styles.aiBtnText}>Quincenal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  activeOpacity={0.85}
                  style={[styles.aiBtn, { backgroundColor: colors.premium }]} 
                  onPress={() => handleGenerateHabits('monthly')}
                >
                  <Text style={styles.aiBtnText}>Mensual</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.aiTagRow}>
                <Feather name="cpu" size={11} color={colors.premium} />
                <Text style={[styles.aiTagText, { color: colors.premium }]}>Powered by Comprix AI Engine</Text>
              </View>
            </PremiumCard>

            {lists.length > 0 && (
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Listas Anteriores</Text>
            )}
          </>
        )}
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PremiumCard 
            variant="surface"
            style={styles.listCard}
            onPress={() => {
              setCurrentList(item);
              navigation.navigate('ListDetail');
            }}
          >
            <View style={[styles.listIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Feather name="file-text" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={[styles.listName, { color: colors.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.listMeta, { color: colors.textMuted }]}>{item.items.length} productos</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textLight} />
          </PremiumCard>
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconBg, { backgroundColor: colors.surfaceAlt }]}>
              <Feather name="clipboard" size={36} color={colors.textLight} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sin listas previas</Text>
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Crea tu primera lista y descubre dónde ahorrar más en tu compra semanal.
            </Text>
          </View>
        )}
      />
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { 
    flex: 1, 
  },
  scroll: { 
    padding: 20, 
    paddingTop: 10 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20,
    paddingTop: 20, 
    paddingBottom: 16,
    gap: 12 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  title: { 
    fontSize: themeTypography.fontSizes.xl, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  createBtn: { 
    width: '100%', 
    height: 54, 
    marginBottom: 28 
  },
  aiCard: {
    padding: themeLayout.spacing.lg,
    marginBottom: 20,
    ...themeShadows.soft,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: themeLayout.spacing.md,
  },
  aiIconBox: {
    width: 36,
    height: 36,
    borderRadius: themeLayout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  aiTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
  },
  aiSubtitle: { 
    fontSize: themeTypography.fontSizes.sm, 
    marginBottom: 20, 
    lineHeight: 20 
  },
  aiButtonsRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 16,
  },
  aiBtn: {
    paddingVertical: 12,
    borderRadius: themeLayout.borderRadius.md,
    flex: 1,
    alignItems: 'center',
    ...themeShadows.soft,
  },
  aiBtnText: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    fontSize: 12 
  },
  aiTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiTagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionTitle: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '800', 
    marginTop: 20, 
    marginBottom: 16, 
    letterSpacing: -0.3 
  },
  listCard: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: themeLayout.spacing.md, 
    marginBottom: 12, 
    borderWidth: 1,
  },
  listIconContainer: { 
    width: 46, 
    height: 46, 
    borderRadius: themeLayout.borderRadius.md, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  listName: { 
    fontSize: themeTypography.fontSizes.md, 
    fontWeight: '700', 
  },
  listMeta: { 
    fontSize: themeTypography.fontSizes.xs, 
    marginTop: 4, 
    fontWeight: '500' 
  },
  emptyState: { 
    alignItems: 'center', 
    paddingVertical: 60 
  },
  emptyIconBg: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  emptyTitle: { 
    fontSize: themeTypography.fontSizes.lg, 
    fontWeight: '700', 
    marginBottom: 8 
  },
  emptyText: { 
    fontSize: themeTypography.fontSizes.sm, 
    textAlign: 'center', 
    lineHeight: 22, 
    paddingHorizontal: 40 
  },
});
