import { create } from 'zustand';
import api from '../services/api';

// Lightweight session storage - works with or without AsyncStorage
let _storage: Record<string, string> = {};
let AsyncStorage: any = null;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  // Fallback: in-memory storage if package not yet installed
  AsyncStorage = {
    getItem: async (key: string) => _storage[key] || null,
    setItem: async (key: string, value: string) => { _storage[key] = value; },
    removeItem: async (key: string) => { delete _storage[key]; },
  };
}

export interface ShoppingItem {
  id: string;
  canonicalProductId: string;
  name: string;
  quantity: number;
  unit?: string;
  isSubstitutable?: boolean;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  createdAt?: string;
}

export interface ComparisonResult {
  bestOptionId: string;
  bestOptionName: string;
  maxSavings: number;
  comparison: ComparisonItem[];
  splitStrategy?: SplitStrategy;
  savingsPercentage?: number;
}

export interface FoundItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface ComparisonItem {
  supermarketId: string;
  supermarketName: string;
  totalCost: number;
  missingItemsCount: number;
  missingItems?: string[];
  foundItems?: FoundItem[];
  score?: number;
}

export interface SplitStrategyItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface SplitStrategyStore {
  name: string;
  subtotal: number;
  items: SplitStrategyItem[];
}

export interface SplitStrategy {
  total: number;
  totalSavings?: number;
  storeTotals?: Record<string, number>;
  stores: SplitStrategyStore[];
}

export interface Alert {
  id: string;
  type: 'price_drop' | 'list_budget' | 'offer';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface AppState {
  // Lists
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  comparisonResult: ComparisonResult | null;
  isLoading: boolean;
  error: string | null;

  // Auth
  user: { id: string; name: string; email: string } | null;
  token: string | null;

  // Alerts
  alerts: Alert[];

  // Savings & Dashboard Data
  monthlySavings: number;
  offers: any[];
  isLoadingDashboard: boolean;

  // Actions
  fetchLists: () => Promise<void>;
  createList: (name: string) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;
  updateListName: (listId: string, name: string) => Promise<void>;
  duplicateList: (listId: string) => Promise<void>;
  shareList: (listId: string, email: string) => Promise<{ success: boolean; error?: string }>;
  setCurrentList: (list: ShoppingList) => void;
  addItem: (item: ShoppingItem) => void;
  addItemToSpecificList: (listId: string, item: ShoppingItem) => Promise<void>;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  syncListToBackend: () => Promise<void>;
  compareCurrentList: () => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (token: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  restoreSession: () => Promise<boolean>;
  dismissAlert: (id: string) => void;
  sendChatMessage: (prompt: string) => Promise<any>;
  scanReceipt: (imageBase64: string) => Promise<any>;
  fetchBudgetAnalysis: (listId: string) => Promise<any>;
  searchProducts: (query: string) => Promise<any[]>;
  fetchDashboardData: () => Promise<void>;
  fetchProductHistory: (productId: string) => Promise<any>;
  compareSingleProduct: (productId: string) => Promise<any>;
  fetchInflationData: () => Promise<any>;
  fetchSmartSubstitutes: (id: string) => Promise<any>;
  fetchSmartOffers: () => Promise<any>;
  register: (email: string, password?: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: string }>;
  scanFakeOffers: () => Promise<number>;
  generateRecurrentList: (frequency: string) => Promise<any>;
  compareByBranch: (productId: string, lat: number, lng: number) => Promise<any>;

  // Admin
  getAdminDashboard: () => Promise<any>;
  getAdminFlags: () => Promise<any>;
  updateAdminFlags: (flags: any) => Promise<any>;
  getAdminLogs: () => Promise<any>;
  triggerAdminRollback: () => Promise<any>;
  getAdminSupermarkets: () => Promise<any>;
  toggleAdminSupermarket: (id: string, isActive: boolean) => Promise<any>;
  getAdminUsers: () => Promise<any>;
  deleteAdminUser: (id: string) => Promise<any>;
}

export const useAppStore = create<AppState>((set, get) => ({
  lists: [],
  currentList: null,
  comparisonResult: null,
  isLoading: false,
  error: null,
  user: null,
  token: null,
  alerts: [],
  monthlySavings: 0,
  offers: [],
  isLoadingDashboard: false,

  // ─── AUTH ───────────────────────────────────────────────────────────────────

  login: async (email: string, password?: string) => {
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Ingresa un correo electrónico válido' };
    }

    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;

      // Persist session
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));

      // Set auth header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ user, token });
      return { success: true };
    } catch (err: any) {
      console.error('Login Error:', err?.message);
      return { success: false, error: 'Credenciales inválidas o error de conexión' };
    }
  },

  googleLogin: async (email: string, name: string) => {
    try {
      const response = await api.post('/auth/google', { email, name });
      const { user, token } = response.data;

      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ user, token, isAuthenticated: true });
      return { success: true };
    } catch (err: any) {
      console.error('Google Login Error:', err?.message);
      return { success: false, error: 'Error al iniciar sesión con Google' };
    }
  },

  register: async (email: string, password?: string, name?: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, name });
      const { user, token } = response.data;

      // Persist session
      await AsyncStorage.setItem('auth_token', token);
      await AsyncStorage.setItem('auth_user', JSON.stringify(user));

      // Set auth header for all future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      set({ user, token });
      return { success: true };
    } catch (err: any) {
      console.error('Register Error:', err?.response?.data || err?.message);
      return { success: false, error: err?.response?.data?.message || 'Error al crear la cuenta' };
    }
  },

  restoreSession: async () => {
    try {
      const userJson = await AsyncStorage.getItem('auth_user');
      const token = await AsyncStorage.getItem('auth_token');
      if (userJson && token) {
        const user = JSON.parse(userJson);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        set({ user, token });
        return true;
      }
    } catch (e) {
      console.warn('Session restore failed:', e);
    }
    return false;
  },

  updateProfile: async (data: any) => {
    try {
      const response = await api.patch('/auth/profile', data);
      const updatedUser = response.data;
      
      await AsyncStorage.setItem('auth_user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
      return { success: true };
    } catch (err: any) {
      console.error('Update Profile Error:', err?.message);
      return { success: false, error: 'No se pudo actualizar el perfil' };
    }
  },

  logout: () => {
    AsyncStorage.removeItem('auth_token');
    AsyncStorage.removeItem('auth_user');
    delete api.defaults.headers.common['Authorization'];
    set({ user: null, token: null, lists: [], currentList: null, comparisonResult: null, alerts: [] });
  },

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────

  fetchDashboardData: async () => {
    set({ isLoadingDashboard: true });
    try {
      const userId = get().user?.id || 'test-user-id';
      const response = await api.get(`/budgets/dashboard?userId=${userId}`);
      set({ 
        monthlySavings: response.data.monthlySavings || 0,
        offers: response.data.offers || [],
        isLoadingDashboard: false
      });
    } catch (error) {
      set({ monthlySavings: 0, offers: [], isLoadingDashboard: false });
    }
  },

  // ─── LISTS ──────────────────────────────────────────────────────────────────

  fetchLists: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/lists');
      const rawLists = response.data || [];
      
      // Adapt backend format to frontend format
      const lists: ShoppingList[] = rawLists.map((l: any) => ({
        id: l.id,
        name: l.name,
        createdAt: l.createdAt,
        items: (l.items || []).map((item: any) => ({
          id: item.id,
          canonicalProductId: item.canonicalProductId,
          name: item.canonicalProduct?.name || item.rawScannedName || 'Producto',
          quantity: item.quantity,
          unit: 'unidad',
        })),
      }));

      if (lists.length > 0) {
        set({ lists, currentList: lists[0], isLoading: false, error: null });
      } else {
        set({ lists: [], currentList: null, isLoading: false, error: null });
      }
    } catch {
      set({ lists: [], currentList: null, isLoading: false, error: null });
    }
  },

  createList: async (name) => {
    const userId = get().user?.id;
    const tempId = String(Date.now());
    const newList: ShoppingList = { id: tempId, name, items: [], createdAt: new Date().toISOString() };
    
    // Optimistic update
    set((state) => ({
      lists: [newList, ...state.lists],
      currentList: newList,
    }));

    // Persist to backend
    if (userId) {
      try {
        const response = await api.post('/lists', { userId, name, items: [] });
        const backendList = response.data;
        // Update the temp ID with the real one
        set((state) => ({
          lists: state.lists.map(l => l.id === tempId ? { ...l, id: backendList.id } : l),
          currentList: state.currentList?.id === tempId ? { ...state.currentList, id: backendList.id } : state.currentList,
        }));
      } catch (err) {
        console.warn('Failed to persist list to backend:', err);
        // Keep local version
      }
    }
  },

  setCurrentList: (list) => set({ currentList: list, comparisonResult: null }),

  deleteList: async (listId) => {
    // Optimistic delete
    set((state) => ({
      lists: state.lists.filter(l => l.id !== listId),
      currentList: state.currentList?.id === listId ? null : state.currentList,
      comparisonResult: state.currentList?.id === listId ? null : state.comparisonResult,
    }));
    try {
      await api.delete(`/lists/${listId}`);
    } catch (err) {
      console.warn('Failed to delete list from backend:', err);
      // Fallback: re-fetch lists if delete failed
      get().fetchLists();
    }
  },

  updateListName: async (listId, name) => {
    // Optimistic update
    set((state) => ({
      lists: state.lists.map(l => l.id === listId ? { ...l, name } : l),
      currentList: state.currentList?.id === listId ? { ...state.currentList, name } : state.currentList,
    }));
    try {
      await api.patch(`/lists/${listId}`, { name });
    } catch (err) {
      console.warn('Failed to update list name in backend:', err);
    }
  },

  duplicateList: async (listId) => {
    const state = get();
    const listToDuplicate = state.lists.find(l => l.id === listId);
    if (!listToDuplicate) return;

    const newName = `${listToDuplicate.name} (Copia)`;
    
    try {
      // Usamos el endpoint normal de crear lista enviando los mismos items
      const itemsToDuplicate = listToDuplicate.items.map(item => ({
        canonicalProductId: item.canonicalProductId,
        quantity: item.quantity
      }));
      
      const response = await api.post('/lists', { 
        name: newName, 
        items: itemsToDuplicate 
      });
      
      const backendList = response.data;
      const newList: ShoppingList = {
        id: backendList.id,
        name: backendList.name,
        createdAt: backendList.createdAt,
        items: listToDuplicate.items // Reutilizamos los items del frontend para la copia local
      };

      set((state) => ({
        lists: [newList, ...state.lists],
        currentList: newList
      }));
    } catch (err) {
      console.warn('Failed to duplicate list:', err);
      Alert.alert('Error', 'No se pudo duplicar la lista. Verifica tu conexión.');
    }
  },

  shareList: async (listId, email) => {
    try {
      await api.post(`/lists/${listId}/collaborators`, { email, role: 'EDITOR' });
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al compartir la lista' 
      };
    }
  },

  addItem: (item) => {
    set((state) => {
      if (!state.currentList) return state;
      const updatedList = {
        ...state.currentList,
        items: [...state.currentList.items, item]
      };
      return {
        comparisonResult: null,
        currentList: updatedList,
        lists: state.lists.map(l => l.id === updatedList.id ? updatedList : l)
      };
    });
    // Auto-sync after a short delay
    setTimeout(() => get().syncListToBackend(), 500);
  },

  removeItem: (itemId) => {
    set((state) => {
      if (!state.currentList) return state;
      const updatedList = {
        ...state.currentList,
        items: state.currentList.items.filter(i => i.id !== itemId)
      };
      return {
        comparisonResult: null,
        currentList: updatedList,
        lists: state.lists.map(l => l.id === updatedList.id ? updatedList : l)
      };
    });
    // Auto-sync after a short delay
    setTimeout(() => get().syncListToBackend(), 500);
  },

  addItemToSpecificList: async (listId, item) => {
    set((state) => {
      const targetList = state.lists.find(l => l.id === listId);
      if (!targetList) return state;
      
      const updatedList = {
        ...targetList,
        items: [...targetList.items, item]
      };
      
      return {
        lists: state.lists.map(l => l.id === listId ? updatedList : l),
        currentList: state.currentList?.id === listId ? updatedList : state.currentList
      };
    });
    
    // Sync to backend immediately
    const updatedTarget = get().lists.find(l => l.id === listId);
    if (updatedTarget) {
      try {
        await api.put(`/lists/${listId}/items`, {
          items: updatedTarget.items.map(i => ({
            canonicalProductId: i.canonicalProductId,
            quantity: i.quantity,
          })),
        });
      } catch (err) {
        console.warn('Sync failed for specific list', err);
      }
    }
  },

  updateItemQuantity: (itemId, quantity) => {
    set((state) => {
      if (!state.currentList) return state;
      const updatedList = {
        ...state.currentList,
        items: state.currentList.items.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      };
      return {
        comparisonResult: null,
        currentList: updatedList,
        lists: state.lists.map(l => l.id === updatedList.id ? updatedList : l)
      };
    });
    setTimeout(() => get().syncListToBackend(), 500);
  },

  syncListToBackend: async () => {
    const { currentList, user } = get();
    if (!currentList || !user) return;

    try {
      await api.put(`/lists/${currentList.id}/items`, {
        items: currentList.items.map(item => ({
          canonicalProductId: item.canonicalProductId,
          quantity: item.quantity,
        })),
      });
    } catch (err) {
      // Silent fail — local state is the source of truth for now
      console.warn('List sync failed:', err);
    }
  },

  // ─── COMPARISON ─────────────────────────────────────────────────────────────

  compareCurrentList: async () => {
    const list = get().currentList;
    if (!list) return;
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(`/compare/quick`, { items: list.items });
      set({ comparisonResult: response.data, isLoading: false });
    } catch (err) {
      console.error('Compare API Error:', err);
      set({ comparisonResult: null, isLoading: false, error: 'No se pudo comparar la lista.' });
    }
  },

  // ─── ALERTS ─────────────────────────────────────────────────────────────────

  dismissAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
    }));
  },

  // ─── AI / OCR / BUDGET ──────────────────────────────────────────────────────

  sendChatMessage: async (prompt: string) => {
    const userId = get().user?.id || 'test-user-id';
    try {
      const response = await api.post('/ai/chat', { userId, prompt });
      return response.data;
    } catch (err) {
      console.error('Chat API Error:', err);
      throw err;
    }
  },

  scanFakeOffers: async () => {
    try {
      const response = await api.get('/ai/scan-fake-offers');
      if (response.data?.fakeOffersDetected > 0) {
        const newAlert = {
          id: String(Date.now()),
          type: 'offer',
          message: `🚨 Se han detectado ${response.data.fakeOffersDetected} ofertas FALSAS en los supermercados esta semana. Cuidado con los "Especiales".`,
          read: false
        };
        set(state => ({ alerts: [newAlert, ...state.alerts] }));
        return response.data.fakeOffersDetected;
      }
      return 0;
    } catch (err) {
      console.error('Scan Fake Offers Error:', err);
      return 0;
    }
  },

  scanReceipt: async (imageBase64: string) => {
    const userId = get().user?.id || 'test-user-id';
    try {
      const response = await api.post('/ocr/scan', { userId, imageBase64 });
      return response.data;
    } catch (err) {
      console.error('OCR API Error:', err);
      throw err;
    }
  },

  fetchBudgetAnalysis: async (listId: string) => {
    const userId = get().user?.id || 'test-user-id';
    try {
      const response = await api.get(`/budgets/analyze?userId=${userId}&listId=${listId}`);
      return response.data;
    } catch (err) {
      console.error('Budget API Error:', err);
      throw err;
    }
  },

  searchProducts: async (query: string) => {
    try {
      const response = await api.get(`/scraper/search?q=${encodeURIComponent(query)}`);
      return response.data.map((prod: any) => ({
        id: prod.id,
        canonicalProductId: prod.id,
        name: prod.name,
        unit: prod.category || 'unidad',
        variants: prod.variants || []
      }));
    } catch (err) {
      console.error('Search API Error:', err);
      return [];
    }
  },

  fetchProductHistory: async (productId: string) => {
    try {
      const response = await api.get(`/scraper/history/${productId}`);
      return response.data;
    } catch (err) {
      console.error('History API Error:', err);
      return null;
    }
  },

  compareSingleProduct: async (productId: string) => {
    try {
      const response = await api.get(`/compare/product/${productId}`);
      return response.data;
    } catch (err) {
      console.error('Compare Single Product Error:', err);
      return null;
    }
  },

  fetchInflationData: async () => {
    const userId = get().user?.id || 'test-user-id';
    try {
      const response = await api.get(`/ocr/inflation?userId=${userId}`);
      return response.data;
    } catch (err) {
      console.error('Inflation Data Error:', err);
      return null;
    }
  },

  fetchSmartSubstitutes: async (canonicalProductId: string) => {
    try {
      const response = await api.get(`/ai/substitutes/${canonicalProductId}`);
      return response.data;
    } catch (err) {
      console.error('Smart Substitutes Error:', err);
      return null;
    }
  },

  fetchSmartOffers: async () => {
    try {
      const response = await api.get(`/ai/smart-offers`);
      return response.data;
    } catch (err) {
      console.error('Smart Offers Error:', err);
      return null;
    }
  },

  scanFakeOffers: async () => {
    try {
      const res = await api.get('/ai/fake-offers');
      return res.data.fakeCount || 0;
    } catch (e) {
      console.warn('Fake Offers Error:', e);
      return 0;
    }
  },

  generateRecurrentList: async (frequency: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/lists/recurrent', { frequency });
      if (res.data.success && res.data.list) {
        set((state) => ({ lists: [res.data.list, ...state.lists] }));
        return res.data;
      }
      return { success: false, message: res.data.message };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Error de red' };
    } finally {
      set({ isLoading: false });
    }
  },

  compareByBranch: async (productId: string, lat: number, lng: number) => {
    try {
      const res = await api.get(`/compare/branch/${productId}?lat=${lat}&lng=${lng}`);
      return res.data;
    } catch (e: any) {
      console.warn('Branch comparison Error:', e);
      return null;
    }
  },

  // ─── ADMIN ──────────────────────────────────────────────────────────────────
  getAdminDashboard: async () => {
    try {
      const res = await api.get('/admin/dashboard');
      return res.data;
    } catch (e) {
      console.warn('Admin Dashboard Error:', e);
      return null;
    }
  },
  getAdminFlags: async () => {
    try {
      const res = await api.get('/admin/flags');
      return res.data;
    } catch (e) {
      return null;
    }
  },
  updateAdminFlags: async (flags: any) => {
    try {
      const res = await api.post('/admin/flags', flags);
      return res.data;
    } catch (e) {
      return null;
    }
  },
  getAdminLogs: async () => {
    try {
      const res = await api.get('/admin/logs');
      return res.data;
    } catch (e) {
      return null;
    }
  },
  triggerAdminRollback: async () => {
    try {
      const res = await api.post('/admin/rollback');
      return res.data;
    } catch (e) {
      return null;
    }
  },
  getAdminSupermarkets: async () => {
    try {
      const res = await api.get('/admin/supermarkets');
      return res.data;
    } catch (e) {
      return null;
    }
  },
  toggleAdminSupermarket: async (id: string, isActive: boolean) => {
    try {
      const res = await api.patch(`/admin/supermarkets/${id}`, { isActive });
      return res.data;
    } catch (e) {
      return null;
    }
  },
  getAdminUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      return res.data;
    } catch (e) {
      return null;
    }
  },
  deleteAdminUser: async (id: string) => {
    try {
      const res = await api.delete(`/admin/users/${id}`);
      return res.data;
    } catch (e) {
      return null;
    }
  }
}));

// Keep backward compatibility
export const useListStore = useAppStore;
