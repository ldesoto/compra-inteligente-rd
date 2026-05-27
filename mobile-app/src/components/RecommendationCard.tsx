import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  supermarketName: string;
  totalCost: number;
  savings: number;
  isBest: boolean;
  missingItemsCount: number;
}

export const RecommendationCard = ({ 
  supermarketName, 
  totalCost, 
  savings, 
  isBest, 
  missingItemsCount 
}: Props) => {
  return (
    <View style={[styles.card, isBest && styles.bestCard]}>
      {isBest && (
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.badgeText}>🏆 Mejor Opción</Text>
        </LinearGradient>
      )}
      
      <View style={styles.header}>
        <Text style={[styles.name, isBest && styles.bestName]}>{supermarketName}</Text>
        <Text style={[styles.price, isBest && styles.bestPrice]}>
          RD$ {totalCost.toFixed(2)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Estado de la Lista:</Text>
          <Text style={[styles.detailValue, missingItemsCount > 0 && styles.warningText]}>
            {missingItemsCount === 0 
              ? '✅ Todo disponible' 
              : `⚠️ Faltan ${missingItemsCount} productos`}
          </Text>
        </View>
        
        {isBest && savings > 0 && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Ahorro estimado:</Text>
            <Text style={styles.savingsText}>+ RD$ {savings.toFixed(2)}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  bestCard: {
    borderColor: '#10b981',
    borderWidth: 2,
    backgroundColor: '#0f172a',
    shadowColor: '#10b981',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 1,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
    flex: 1,
  },
  bestName: {
    color: '#10b981',
    fontSize: 20,
    fontWeight: '800',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f1f5f9',
  },
  bestPrice: {
    color: '#10b981',
    fontSize: 24,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  warningText: {
    color: '#f59e0b',
  },
  savingsText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '800',
  }
});
