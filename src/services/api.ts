import { mockStorage } from './mockStorage';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { CharacterProfile, BossEntity } from '../types/character';
import { Quest, QuestFilterOptions } from '../types/quest';
import { ShopItem, InventoryItem } from '../types/shop';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // sends backend HttpOnly session cookie
    });
  } catch {
    throw new ApiError('Network error. Failed to reach the Life RPG server.', 503);
  }

  if (!res.ok) {
    let errorMessage = 'An unexpected error occurred.';
    try {
      const data = await res.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch {
      errorMessage = res.statusText || errorMessage;
    }
    throw new ApiError(errorMessage, res.status);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

function mapBackendQuestToFrontend(q: any): Quest {
  const isCompleted = q.completed || q.status === 'completed';
  return {
    id: q.id,
    userId: q.userId || 'hero-user',
    title: q.title,
    description: q.notes || q.description || '',
    attribute: (q.attribute as any) || 'strength',
    difficulty: (q.difficulty as any) || 'medium',
    type: (q.type === 'daily' ? 'habit' : 'todo') as any,
    status: isCompleted ? 'completed' : 'active',
    priority: 'medium',
    xpReward: q.difficulty === 'epic' ? 200 : q.difficulty === 'hard' ? 110 : q.difficulty === 'medium' ? 60 : 30,
    goldReward: q.difficulty === 'epic' ? 60 : q.difficulty === 'hard' ? 30 : q.difficulty === 'medium' ? 16 : 8,
    createdAt: q.createdAt || new Date().toISOString(),
    completedAt: q.completedAt || undefined,
    tags: [q.attribute || 'quest'],
  };
}

function mapBackendShopItemToFrontend(item: any): ShopItem {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    category: (item.category as any) || 'weapon',
    rarity: 'rare',
    costGold: item.cost || item.costGold || 50,
    costGems: 0,
    icon: item.icon || 'Sparkles',
    modifier: { xpBonusPercent: 5 },
    requiredLevel: 1,
  };
}

// ---------------------------------------------------------------------------
// Standalone API Functions (Phase 10 Contract)
// ---------------------------------------------------------------------------

export async function signup(
  nameOrCreds: string | SignupCredentials,
  email?: string,
  password?: string
): Promise<any> {
  if (typeof nameOrCreds === 'object') {
    const creds = nameOrCreds;
    if (USE_MOCK) return mockStorage.signup(creds);
    const data = await request<{ id: string; name: string; email: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: creds.characterName || creds.username || 'Hero',
        email: creds.email,
        password: creds.password || 'Password123!',
      }),
    });
    const user: User = {
      id: data.id,
      email: data.email,
      username: creds.username || data.name,
      characterName: creds.characterName || data.name,
      characterClass: creds.characterClass || 'vanguard',
      createdAt: new Date().toISOString(),
    };
    return { user, token: 'cookie-session' };
  }

  const name = nameOrCreds;
  if (USE_MOCK) return { id: 'mock-id', name, email: email! };
  return request<any>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function login(
  emailOrCreds: string | LoginCredentials,
  password?: string
): Promise<any> {
  if (typeof emailOrCreds === 'object') {
    const creds = emailOrCreds;
    if (USE_MOCK) return mockStorage.login(creds);
    const data = await request<{ id: string; name: string; email: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: creds.email,
        password: creds.password || 'Password123!',
      }),
    });
    const user: User = {
      id: data.id,
      email: data.email,
      username: data.name,
      characterName: data.name,
      characterClass: 'vanguard',
      createdAt: new Date().toISOString(),
    };
    return { user, token: 'cookie-session' };
  }

  const email = emailOrCreds;
  if (USE_MOCK) return { id: 'mock-id', name: 'Hero', email };
  return request<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockStorage.logout();
  await request<{ success: boolean }>('/auth/logout', { method: 'POST' });
}

export async function getSessionUser(): Promise<any | null> {
  if (USE_MOCK) return mockStorage.getCurrentUser();
  try {
    const data = await request<{ id: string; name: string; email: string } | null>('/auth/me');
    if (!data) return null;
    return {
      id: data.id,
      email: data.email,
      username: data.name,
      characterName: data.name,
      characterClass: 'vanguard',
      createdAt: new Date().toISOString(),
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return null;
    }
    return null;
  }
}

export async function getCharacter(): Promise<any> {
  if (USE_MOCK) return mockStorage.getCharacterProfile();
  return request<any>('/character');
}

export async function listQuests(filter?: Partial<QuestFilterOptions>): Promise<any[]> {
  if (USE_MOCK) return mockStorage.getQuests(filter);
  const params = new URLSearchParams();
  if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
  if (filter?.attribute && filter.attribute !== 'all') params.append('attribute', filter.attribute);
  if (filter?.difficulty && filter.difficulty !== 'all') params.append('difficulty', filter.difficulty);
  if (filter?.searchQuery) params.append('q', filter.searchQuery);
  const qs = params.toString();
  return request<any[]>(`/quests${qs ? `?${qs}` : ''}`);
}

export async function createQuest(quest: any): Promise<any> {
  if (USE_MOCK) return mockStorage.createQuest(quest);
  return request<any>('/quests', {
    method: 'POST',
    body: JSON.stringify({
      title: quest.title,
      notes: quest.description || quest.notes || undefined,
      attribute: quest.attribute,
      difficulty: quest.difficulty,
      type: quest.type === 'habit' ? 'daily' : (quest.type || 'quest'),
    }),
  });
}

export async function updateQuest(id: string, updates: any): Promise<any> {
  if (USE_MOCK) return mockStorage.updateQuest(id, updates);
  return request<any>(`/quests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      title: updates.title,
      notes: updates.description || updates.notes || undefined,
      attribute: updates.attribute,
      difficulty: updates.difficulty,
      type: updates.type === 'habit' ? 'daily' : updates.type,
    }),
  });
}

export async function deleteQuest(id: string): Promise<boolean> {
  if (USE_MOCK) return mockStorage.deleteQuest(id);
  await request<{ success: boolean }>(`/quests/${id}`, { method: 'DELETE' });
  return true;
}

export async function completeQuest(id: string): Promise<any> {
  if (USE_MOCK) {
    const q = await mockStorage.updateQuest(id, { status: 'completed' });
    return { quest: q, xpAwarded: 60, goldAwarded: 16 };
  }
  return request<any>(`/quests/${id}/complete`, { method: 'POST' });
}

export async function purchaseItem(itemId: string, _clientCost?: number): Promise<any> {
  if (USE_MOCK) return mockStorage.buyItem(itemId);
  return request<any>('/shop/purchase', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

export async function toggleEquip(itemId: string): Promise<any> {
  if (USE_MOCK) return mockStorage.toggleEquipItem(itemId);
  return request<any>('/inventory/equip', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

export async function completeFocusSession(minutes: number): Promise<any> {
  return request<any>('/focus/complete', {
    method: 'POST',
    body: JSON.stringify({ minutes }),
  });
}

export async function listHabits(): Promise<any[]> {
  return request<any[]>('/habits');
}

export async function createHabit(input: any): Promise<any> {
  return request<any>('/habits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function completeHabit(id: string): Promise<any> {
  return request<any>(`/habits/${id}/complete`, {
    method: 'POST',
  });
}

export async function deleteHabit(id: string): Promise<void> {
  await request<{ success: boolean }>(`/habits/${id}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Hierarchical API object (for Life-RPG context components)
// ---------------------------------------------------------------------------

export const api = {
  auth: {
    getCurrentUser: getSessionUser,
    login: (creds: LoginCredentials) => login(creds),
    signup: (creds: SignupCredentials) => signup(creds),
    logout,
  },

  character: {
    getProfile: async (): Promise<CharacterProfile> => {
      if (USE_MOCK) return mockStorage.getCharacterProfile();
      const raw = await getCharacter();
      const stats = raw.stats || {};
      const attrs = stats.attributes || {};
      return {
        id: raw.id || 'hero-char-1',
        userId: raw.userId,
        name: 'Hero',
        title: 'Real-World Adventurer',
        bio: 'Leveling up one quest at a time.',
        characterClass: 'vanguard',
        avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=256',
        level: stats.level || 1,
        currentXp: stats.xp || 0,
        maxXp: Math.floor(100 * Math.pow(stats.level || 1, 1.5)),
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        gold: stats.gold || 0,
        gems: 5,
        streak: stats.currentStreak || 0,
        longestStreak: stats.longestStreak || 0,
        streakShieldActive: false,
        lastActiveDate: stats.lastActiveDate || new Date().toISOString().split('T')[0],
        streakHistory: stats.history || [],
        attributes: {
          strength: { level: attrs.strength || 1, currentXp: 0, maxXp: 100, tasksCompleted: 0 },
          intellect: { level: attrs.intellect || 1, currentXp: 0, maxXp: 100, tasksCompleted: 0 },
          vitality: { level: attrs.vitality || 1, currentXp: 0, maxXp: 100, tasksCompleted: 0 },
          agility: { level: attrs.agility || 1, currentXp: 0, maxXp: 100, tasksCompleted: 0 },
          charisma: { level: attrs.charisma || 1, currentXp: 0, maxXp: 100, tasksCompleted: 0 },
        },
        equippedGear: {},
        unlockedBadges: (raw.unlockedAchievements || []).map((a: any) => a.achievementId),
      };
    },
    updateProfile: async (updates: Partial<CharacterProfile>): Promise<CharacterProfile> => {
      if (USE_MOCK) return mockStorage.updateCharacterProfile(updates);
      return api.character.getProfile();
    },
  },

  quests: {
    getAll: async (filter?: Partial<QuestFilterOptions>): Promise<Quest[]> => {
      if (USE_MOCK) return mockStorage.getQuests(filter);
      const list = await listQuests(filter);
      return list.map(mapBackendQuestToFrontend);
    },
    create: async (quest: Omit<Quest, 'id' | 'createdAt' | 'status'>): Promise<Quest> => {
      if (USE_MOCK) return mockStorage.createQuest(quest);
      const q = await createQuest(quest);
      return mapBackendQuestToFrontend(q);
    },
    update: async (id: string, updates: Partial<Quest>): Promise<Quest> => {
      if (USE_MOCK) return mockStorage.updateQuest(id, updates);
      const q = await updateQuest(id, updates);
      return mapBackendQuestToFrontend(q);
    },
    delete: async (id: string): Promise<boolean> => {
      return deleteQuest(id);
    },
  },

  boss: {
    get: async (): Promise<BossEntity> => {
      return mockStorage.getBoss();
    },
    damage: async (damageAmount: number): Promise<BossEntity> => {
      return mockStorage.damageBoss(damageAmount);
    },
  },

  shop: {
    getCatalog: async (): Promise<ShopItem[]> => {
      if (USE_MOCK) return mockStorage.getShopCatalog();
      const raw = await request<any[]>('/shop/catalog');
      return raw.map(mapBackendShopItemToFrontend);
    },
    getInventory: async (): Promise<InventoryItem[]> => {
      if (USE_MOCK) return mockStorage.getInventory();
      const char = await getCharacter();
      const catalog = await api.shop.getCatalog();
      return (char.inventory || []).map((inv: any) => {
        const found = catalog.find((c) => c.id === inv.itemId) || {
          id: inv.itemId,
          name: 'Adventurer Gear',
          description: 'Standard gear',
          category: 'weapon' as const,
          rarity: 'common' as const,
          costGold: 20,
          costGems: 0,
          icon: 'Sparkles',
          modifier: {},
          requiredLevel: 1,
        };
        return {
          id: inv.itemId,
          userId: char.userId,
          shopItemId: inv.itemId,
          item: found,
          quantity: inv.quantity || 1,
          isEquipped: inv.equipped || false,
          acquiredAt: new Date().toISOString(),
        };
      });
    },
    buy: async (shopItemId: string): Promise<{ inventoryItem: InventoryItem; profile: CharacterProfile }> => {
      if (USE_MOCK) return mockStorage.buyItem(shopItemId);
      await purchaseItem(shopItemId);
      const updatedProfile = await api.character.getProfile();
      const catalog = await api.shop.getCatalog();
      const found = catalog.find((c) => c.id === shopItemId) || {
        id: shopItemId,
        name: 'Adventurer Gear',
        description: 'Standard gear',
        category: 'weapon' as const,
        rarity: 'common' as const,
        costGold: 20,
        costGems: 0,
        icon: 'Sparkles',
        modifier: {},
        requiredLevel: 1,
      };
      return {
        inventoryItem: {
          id: shopItemId,
          userId: updatedProfile.userId,
          shopItemId,
          item: found,
          quantity: 1,
          isEquipped: false,
          acquiredAt: new Date().toISOString(),
        },
        profile: updatedProfile,
      };
    },
    toggleEquip: async (inventoryItemId: string): Promise<InventoryItem[]> => {
      if (USE_MOCK) return mockStorage.toggleEquipItem(inventoryItemId);
      await toggleEquip(inventoryItemId);
      return api.shop.getInventory();
    },
  },

  resetDemo: async (): Promise<void> => {
    return mockStorage.resetDemoData();
  },
};

export default api;
