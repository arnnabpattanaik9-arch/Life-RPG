import { mockStorage } from './mockStorage';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { CharacterProfile, BossEntity } from '../types/character';
import { Quest, QuestFilterOptions } from '../types/quest';
import { ShopItem, InventoryItem } from '../types/shop';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false'; // defaults to true for pure frontend

export const api = {
  auth: {
    getCurrentUser: async (): Promise<User | null> => {
      if (USE_MOCK) return mockStorage.getCurrentUser();
      const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    login: async (creds: LoginCredentials): Promise<{ user: User; token: string }> => {
      if (USE_MOCK) return mockStorage.login(creds);
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error('Login failed');
      return res.json();
    },
    signup: async (creds: SignupCredentials): Promise<{ user: User; token: string }> => {
      if (USE_MOCK) return mockStorage.signup(creds);
      const res = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (!res.ok) throw new Error('Signup failed');
      return res.json();
    },
    logout: async (): Promise<void> => {
      if (USE_MOCK) return mockStorage.logout();
      await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' });
    },
  },

  character: {
    getProfile: async (): Promise<CharacterProfile> => {
      if (USE_MOCK) return mockStorage.getCharacterProfile();
      const res = await fetch(`${API_BASE_URL}/character`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch character profile');
      return res.json();
    },
    updateProfile: async (updates: Partial<CharacterProfile>): Promise<CharacterProfile> => {
      if (USE_MOCK) return mockStorage.updateCharacterProfile(updates);
      const res = await fetch(`${API_BASE_URL}/character`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update character profile');
      return res.json();
    },
  },

  quests: {
    getAll: async (filter?: Partial<QuestFilterOptions>): Promise<Quest[]> => {
      if (USE_MOCK) return mockStorage.getQuests(filter);
      const params = new URLSearchParams();
      if (filter?.status) params.append('status', filter.status);
      if (filter?.attribute) params.append('attribute', filter.attribute);
      if (filter?.difficulty) params.append('difficulty', filter.difficulty);
      if (filter?.searchQuery) params.append('q', filter.searchQuery);

      const res = await fetch(`${API_BASE_URL}/quests?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch quests');
      return res.json();
    },
    create: async (quest: Omit<Quest, 'id' | 'createdAt' | 'status'>): Promise<Quest> => {
      if (USE_MOCK) return mockStorage.createQuest(quest);
      const res = await fetch(`${API_BASE_URL}/quests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quest),
      });
      if (!res.ok) throw new Error('Failed to create quest');
      return res.json();
    },
    update: async (id: string, updates: Partial<Quest>): Promise<Quest> => {
      if (USE_MOCK) return mockStorage.updateQuest(id, updates);
      const res = await fetch(`${API_BASE_URL}/quests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update quest');
      return res.json();
    },
    delete: async (id: string): Promise<boolean> => {
      if (USE_MOCK) return mockStorage.deleteQuest(id);
      const res = await fetch(`${API_BASE_URL}/quests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete quest');
      return true;
    },
  },

  boss: {
    get: async (): Promise<BossEntity> => {
      if (USE_MOCK) return mockStorage.getBoss();
      const res = await fetch(`${API_BASE_URL}/boss`);
      if (!res.ok) throw new Error('Failed to fetch boss state');
      return res.json();
    },
    damage: async (damageAmount: number): Promise<BossEntity> => {
      if (USE_MOCK) return mockStorage.damageBoss(damageAmount);
      const res = await fetch(`${API_BASE_URL}/boss/damage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ damage: damageAmount }),
      });
      if (!res.ok) throw new Error('Failed to damage boss');
      return res.json();
    },
  },

  shop: {
    getCatalog: async (): Promise<ShopItem[]> => {
      if (USE_MOCK) return mockStorage.getShopCatalog();
      const res = await fetch(`${API_BASE_URL}/shop`);
      if (!res.ok) throw new Error('Failed to fetch shop catalog');
      return res.json();
    },
    getInventory: async (): Promise<InventoryItem[]> => {
      if (USE_MOCK) return mockStorage.getInventory();
      const res = await fetch(`${API_BASE_URL}/shop/inventory`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return res.json();
    },
    buy: async (shopItemId: string): Promise<{ inventoryItem: InventoryItem; profile: CharacterProfile }> => {
      if (USE_MOCK) return mockStorage.buyItem(shopItemId);
      const res = await fetch(`${API_BASE_URL}/shop/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: shopItemId }),
      });
      if (!res.ok) throw new Error('Failed to purchase item');
      return res.json();
    },
    toggleEquip: async (inventoryItemId: string): Promise<InventoryItem[]> => {
      if (USE_MOCK) return mockStorage.toggleEquipItem(inventoryItemId);
      const res = await fetch(`${API_BASE_URL}/shop/inventory/${inventoryItemId}/equip`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to equip item');
      return res.json();
    },
  },

  resetDemo: async (): Promise<void> => {
    return mockStorage.resetDemoData();
  },
};
