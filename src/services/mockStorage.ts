import { CharacterProfile, BossEntity, AttributeType } from '../types/character';
import { Quest, QuestFilterOptions } from '../types/quest';
import { ShopItem, InventoryItem } from '../types/shop';
import { User, LoginCredentials, SignupCredentials } from '../types/auth';
import { INITIAL_CHARACTER, INITIAL_BOSS, INITIAL_QUESTS, INITIAL_SHOP_ITEMS } from './mockData';
import { calculateMaxXpForLevel, calculateAttributeMaxXp } from '../engine/progression';

const STORAGE_KEYS = {
  USER: 'life_rpg_user',
  CHARACTER: 'life_rpg_character',
  QUESTS: 'life_rpg_quests',
  INVENTORY: 'life_rpg_inventory',
  BOSS: 'life_rpg_boss',
  SHOP: 'life_rpg_shop',
};

class MockStorageService {
  private simulateDelay<T>(data: T, ms: number = 80): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(data), ms));
  }

  // --- AUTH ---
  public async getCurrentUser(): Promise<User | null> {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (!saved) {
      const defaultUser: User = {
        id: 'user-demo-1',
        email: 'hero@liferpg.realm',
        username: 'KaelenVance',
        characterName: 'Kaelen Vance',
        characterClass: 'technomancer',
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
      return this.simulateDelay(defaultUser);
    }
    return this.simulateDelay(JSON.parse(saved));
  }

  public async login(creds: LoginCredentials): Promise<{ user: User; token: string }> {
    const current = await this.getCurrentUser();
    const user: User = {
      id: current?.id || 'user-demo-1',
      email: creds.email,
      username: creds.email.split('@')[0] || 'Hero',
      characterName: current?.characterName || 'Hero of the Realm',
      characterClass: current?.characterClass || 'vanguard',
      createdAt: current?.createdAt || new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return this.simulateDelay({ user, token: 'mock-jwt-token-' + Date.now() }, 150);
  }

  public async signup(data: SignupCredentials): Promise<{ user: User; token: string }> {
    const user: User = {
      id: 'user-' + Date.now(),
      email: data.email,
      username: data.username,
      characterName: data.characterName,
      characterClass: data.characterClass,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

    // Initialize fresh character for new user
    const newChar: CharacterProfile = {
      ...INITIAL_CHARACTER,
      id: 'char-' + Date.now(),
      userId: user.id,
      name: data.characterName,
      characterClass: data.characterClass,
      level: 1,
      currentXp: 0,
      maxXp: calculateMaxXpForLevel(1),
      gold: 50,
      streak: 1,
      streakHistory: [new Date().toISOString().split('T')[0]],
    };
    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(newChar));

    return this.simulateDelay({ user, token: 'mock-jwt-token-' + Date.now() }, 200);
  }

  public async logout(): Promise<void> {
    // Keep data for seamless demo replay or clear user session token
    return this.simulateDelay(undefined, 50);
  }

  // --- CHARACTER & STATS ---
  public async getCharacterProfile(): Promise<CharacterProfile> {
    const saved = localStorage.getItem(STORAGE_KEYS.CHARACTER);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(INITIAL_CHARACTER));
      return this.simulateDelay(INITIAL_CHARACTER);
    }
    return this.simulateDelay(JSON.parse(saved));
  }

  public async updateCharacterProfile(updates: Partial<CharacterProfile>): Promise<CharacterProfile> {
    const current = await this.getCharacterProfile();
    const updated: CharacterProfile = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEYS.CHARACTER, JSON.stringify(updated));
    return this.simulateDelay(updated);
  }

  // --- QUESTS CRUD ---
  public async getQuests(filter?: Partial<QuestFilterOptions>): Promise<Quest[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.QUESTS);
    let list: Quest[] = saved ? JSON.parse(saved) : INITIAL_QUESTS;

    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(INITIAL_QUESTS));
    }

    if (filter) {
      if (filter.status && filter.status !== 'all') {
        list = list.filter((q) => q.status === filter.status);
      }
      if (filter.attribute && filter.attribute !== 'all') {
        list = list.filter((q) => q.attribute === filter.attribute);
      }
      if (filter.difficulty && filter.difficulty !== 'all') {
        list = list.filter((q) => q.difficulty === filter.difficulty);
      }
      if (filter.searchQuery && filter.searchQuery.trim() !== '') {
        const q = filter.searchQuery.toLowerCase();
        list = list.filter((item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
    }

    return this.simulateDelay(list);
  }

  public async createQuest(questData: Omit<Quest, 'id' | 'createdAt' | 'status'>): Promise<Quest> {
    const quests = await this.getQuests();
    const newQuest: Quest = {
      ...questData,
      id: 'quest-' + Date.now(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    const updated = [newQuest, ...quests];
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(updated));
    return this.simulateDelay(newQuest, 100);
  }

  public async updateQuest(id: string, updates: Partial<Quest>): Promise<Quest> {
    const quests = await this.getQuests();
    const index = quests.findIndex((q) => q.id === id);
    if (index === -1) throw new Error('Quest not found');

    const updatedQuest: Quest = { ...quests[index], ...updates };
    quests[index] = updatedQuest;
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
    return this.simulateDelay(updatedQuest, 100);
  }

  public async deleteQuest(id: string): Promise<boolean> {
    const quests = await this.getQuests();
    const filtered = quests.filter((q) => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(filtered));
    return this.simulateDelay(true, 100);
  }

  // --- BOSS RAID ---
  public async getBoss(): Promise<BossEntity> {
    const saved = localStorage.getItem(STORAGE_KEYS.BOSS);
    if (!saved) {
      localStorage.setItem(STORAGE_KEYS.BOSS, JSON.stringify(INITIAL_BOSS));
      return this.simulateDelay(INITIAL_BOSS);
    }
    return this.simulateDelay(JSON.parse(saved));
  }

  public async damageBoss(damageAmount: number): Promise<BossEntity> {
    const boss = await this.getBoss();
    const newHp = Math.max(0, boss.currentHp - damageAmount);
    const updated: BossEntity = {
      ...boss,
      currentHp: newHp,
      defeated: newHp === 0,
    };
    localStorage.setItem(STORAGE_KEYS.BOSS, JSON.stringify(updated));
    return this.simulateDelay(updated);
  }

  // --- SHOP & INVENTORY ---
  public async getShopCatalog(): Promise<ShopItem[]> {
    return this.simulateDelay(INITIAL_SHOP_ITEMS);
  }

  public async getInventory(): Promise<InventoryItem[]> {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (!saved) {
      const initialInventory: InventoryItem[] = [
        {
          id: 'inv-1',
          userId: 'user-demo-1',
          shopItemId: 'wpn-1',
          item: INITIAL_SHOP_ITEMS[0],
          quantity: 1,
          isEquipped: true,
          acquiredAt: new Date().toISOString(),
        },
        {
          id: 'inv-2',
          userId: 'user-demo-1',
          shopItemId: 'arm-1',
          item: INITIAL_SHOP_ITEMS[4],
          quantity: 1,
          isEquipped: true,
          acquiredAt: new Date().toISOString(),
        },
      ];
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(initialInventory));
      return this.simulateDelay(initialInventory);
    }
    return this.simulateDelay(JSON.parse(saved));
  }

  public async buyItem(shopItemId: string): Promise<{ inventoryItem: InventoryItem; profile: CharacterProfile }> {
    const shopItem = INITIAL_SHOP_ITEMS.find((s) => s.id === shopItemId);
    if (!shopItem) throw new Error('Item not found in catalog');

    const profile = await this.getCharacterProfile();
    if (profile.gold < shopItem.costGold || profile.gems < shopItem.costGems) {
      throw new Error('Insufficient funds to purchase this item');
    }

    const inventory = await this.getInventory();
    const existingIndex = inventory.findIndex((i) => i.shopItemId === shopItemId);

    let updatedInventoryItem: InventoryItem;
    if (existingIndex > -1 && shopItem.category === 'potion') {
      inventory[existingIndex].quantity += 1;
      updatedInventoryItem = inventory[existingIndex];
    } else {
      updatedInventoryItem = {
        id: 'inv-' + Date.now(),
        userId: profile.userId,
        shopItemId: shopItem.id,
        item: shopItem,
        quantity: 1,
        isEquipped: false,
        acquiredAt: new Date().toISOString(),
      };
      inventory.push(updatedInventoryItem);
    }

    // Deduct currency
    const updatedProfile = await this.updateCharacterProfile({
      gold: profile.gold - shopItem.costGold,
      gems: profile.gems - shopItem.costGems,
    });

    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    return this.simulateDelay({ inventoryItem: updatedInventoryItem, profile: updatedProfile }, 120);
  }

  public async toggleEquipItem(inventoryItemId: string): Promise<InventoryItem[]> {
    const inventory = await this.getInventory();
    const target = inventory.find((i) => i.id === inventoryItemId);
    if (!target) throw new Error('Item not found in inventory');

    // If equipping a weapon/armor, unequip others in that category
    if (!target.isEquipped && (target.item.category === 'weapon' || target.item.category === 'armor')) {
      inventory.forEach((item) => {
        if (item.item.category === target.item.category) {
          item.isEquipped = false;
        }
      });
    }

    target.isEquipped = !target.isEquipped;
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    return this.simulateDelay(inventory, 80);
  }

  public async resetDemoData(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CHARACTER);
    localStorage.removeItem(STORAGE_KEYS.QUESTS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.BOSS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    return this.simulateDelay(undefined, 100);
  }
}

export const mockStorage = new MockStorageService();
