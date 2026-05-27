import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BottomTabBar = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Home',       icon: 'tag',          label: 'Explorar' },
    { name: 'Alerts',     icon: 'dollar-sign',  label: 'Ahorros'  },
    { name: 'Scanner',    icon: 'camera',       label: 'Escanear' },
    { name: 'Search',     icon: 'search',       label: 'Buscar'   },
    { name: 'CreateList', icon: 'list',         label: 'Listas'   },
  ];

  return (
    <View style={[styles.container, { paddingBottom: 12 }]}>
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
              color={isActive ? '#00B2A9' : '#94A3B8'}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
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
