// Re-export everything from the new unified store for backward compatibility
export { useAppStore as useListStore, useAppStore } from './useAppStore';
export type { AppState as ListState, ShoppingItem, ShoppingList } from './useAppStore';
