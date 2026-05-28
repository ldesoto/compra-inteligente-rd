import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppStore } from '../store/useAppStore';

export const BottomTabBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { darkMode, language } = useAppStore();

  const tabs = [
    { name: 'Home',            icon: 'home',         label: language === 'Inglés' ? 'Home' : 'Inicio' },
    { name: 'Search',          icon: 'search',       label: language === 'Inglés' ? 'Compare' : 'Comparar' },
    { name: 'CreateList',      icon: 'list',         label: language === 'Inglés' ? 'Lists' : 'Listas' },
    { name: 'Profile',         icon: 'user',         label: language === 'Inglés' ? 'Profile' : 'Perfil' },
    { name: 'BudgetDashboard', icon: 'pie-chart',    label: language === 'Inglés' ? 'Savings' : 'Ahorros' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: 12, backgroundColor: darkMode ? '#1E293B' : '#FFFFFF', borderTopColor: darkMode ? '#334155' : '#F1F5F9' }]}>
      {tabs.map((tab) => {
        const isActive =
          route.name === tab.name ||
          (route.name === 'Main' && tab.name === 'Home');

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
            activeOpacity={0.75}
          >
            <Feather
              name={tab.icon as any}
              size={22}
              color={isActive ? '#00B2A9' : (darkMode ? '#64748B' : '#94A3B8')}
            />
            <Text style={[styles.label, { color: darkMode ? '#94A3B8' : '#94A3B8' }, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 4,
  },
  activeLabel: {
    color: '#00B2A9',
    fontWeight: '700',
  },
});
