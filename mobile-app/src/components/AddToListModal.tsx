import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';

interface AddToListModalProps {
  visible: boolean;
  onClose: () => void;
  productToAdd: {
    canonicalProductId: string;
    name: string;
    quantity: number;
  } | null;
}

export const AddToListModal: React.FC<AddToListModalProps> = ({ visible, onClose, productToAdd }) => {
  const { lists, addItemToSpecificList } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToList = async (listId: string) => {
    if (!productToAdd) return;
    
    setIsAdding(true);
    try {
      const newItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: productToAdd.name,
        canonicalProductId: productToAdd.canonicalProductId,
        quantity: productToAdd.quantity,
        addedAt: new Date().toISOString()
      };
      
      await addItemToSpecificList(listId, newItem);
      Alert.alert('¡Agregado!', `Se agregó "${productToAdd.name}" a la lista seleccionada.`);
      onClose();
    } catch (e) {
      Alert.alert('Error', 'No se pudo agregar a la lista.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>¿A qué lista deseas agregarlo?</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.subtitle}>Selecciona la lista destino para "{productToAdd?.name}":</Text>

          {isAdding ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#00B2A9" />
              <Text style={{ marginTop: 10, color: '#64748B' }}>Agregando a la lista...</Text>
            </View>
          ) : lists.length > 0 ? (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.listItemRow} onPress={() => handleAddToList(item.id)}>
                  <View style={styles.listIconBg}>
                    <Feather name="list" size={18} color="#00B2A9" />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.listName}>{item.name}</Text>
                    <Text style={styles.listItemsCount}>{item.items?.length || 0} artículos</Text>
                  </View>
                  <Feather name="plus-circle" size={24} color="#00B2A9" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: '#64748B' }}>No tienes listas creadas.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  listItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  listIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E6F8F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  listItemsCount: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  }
});
