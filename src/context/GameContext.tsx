import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CharacterProfile, BossEntity, AttributeType } from '../types/character';
import { Quest, QuestFilterOptions } from '../types/quest';
import { ShopItem, InventoryItem } from '../types/shop';
import { api } from '../services/api';
import { sound } from '../services/sound';
import { fireLevelUpConfetti, fireQuestCompleteConfetti, fireBossDefeatedConfetti } from '../services/confetti';
import { calculateMaxXpForLevel, calculateAttributeMaxXp, calculateEarnedRewards } from '../engine/progression';

export interface FloatingRewardItem {
  id: string;
  text: string;
  type: 'xp' | 'gold' | 'damage' | 'attribute';
  x?: number;
  y?: number;
}

export interface LevelUpDetails {
  oldLevel: number;
  newLevel: number;
  unlockedTitle?: string;
  bonusGold: number;
  bonusGems: number;
}

interface GameContextType {
  profile: CharacterProfile | null;
  quests: Quest[];
  inventory: InventoryItem[];
  shopCatalog: ShopItem[];
  boss: BossEntity | null;
  isLoading: boolean;
  activeFilter: QuestFilterOptions;
  setActiveFilter: React.Dispatch<React.SetStateAction<QuestFilterOptions>>;
  levelUpEvent: LevelUpDetails | null;
  floatingRewards: FloatingRewardItem[];
  
  // Quest operations
  createQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateQuest: (id: string, updates: Partial<Quest>) => Promise<void>;
  deleteQuest: (id: string) => Promise<void>;
  completeQuest: (id: string, clickCoordinates?: { x: number; y: number }) => Promise<void>;
  
  // Economy & Equipment
  buyItem: (shopItemId: string) => Promise<void>;
  toggleEquip: (inventoryItemId: string) => Promise<void>;
  
  // Character & Boss
  damageBoss: (amount: number) => Promise<void>;
  dismissLevelUp: () => void;
  resetGameData: () => Promise<void>;
  refetchData: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<CharacterProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [shopCatalog, setShopCatalog] = useState<ShopItem[]>([]);
  const [boss, setBoss] = useState<BossEntity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [activeFilter, setActiveFilter] = useState<QuestFilterOptions>({
    status: 'active',
    type: 'all',
    attribute: 'all',
    difficulty: 'all',
    searchQuery: '',
  });

  const [levelUpEvent, setLevelUpEvent] = useState<LevelUpDetails | null>(null);
  const [floatingRewards, setFloatingRewards] = useState<FloatingRewardItem[]>([]);

  const loadAllGameData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profData, questsData, invData, shopData, bossData] = await Promise.all([
        api.character.getProfile(),
        api.quests.getAll(),
        api.shop.getInventory(),
        api.shop.getCatalog(),
        api.boss.get(),
      ]);
      setProfile(profData);
      setQuests(questsData);
      setInventory(invData);
      setShopCatalog(shopData);
      setBoss(bossData);
    } catch (err) {
      console.error('Error loading game data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllGameData();
  }, [loadAllGameData]);

  const addFloatingReward = (text: string, type: FloatingRewardItem['type'], coords?: { x: number; y: number }) => {
    const id = 'float-' + Math.random();
    setFloatingRewards((prev) => [...prev, { id, text, type, x: coords?.x, y: coords?.y }]);
    setTimeout(() => {
      setFloatingRewards((prev) => prev.filter((item) => item.id !== id));
    }, 1300);
  };

  // --- QUEST ACTIONS ---
  const createQuest = async (questData: Omit<Quest, 'id' | 'createdAt' | 'status'>) => {
    const created = await api.quests.create(questData);
    setQuests((prev) => [created, ...prev]);
    sound.playClick();
  };

  const updateQuest = async (id: string, updates: Partial<Quest>) => {
    const updated = await api.quests.update(id, updates);
    setQuests((prev) => prev.map((q) => (q.id === id ? updated : q)));
    sound.playClick();
  };

  const deleteQuest = async (id: string) => {
    await api.quests.delete(id);
    setQuests((prev) => prev.filter((q) => q.id !== id));
    sound.playClick();
  };

  const completeQuest = async (id: string, clickCoordinates?: { x: number; y: number }) => {
    const targetQuest = quests.find((q) => q.id === id);
    if (!targetQuest || targetQuest.status === 'completed' || !profile) return;

    // Optimistic UI updates
    const nowIso = new Date().toISOString();
    const updatedQuest: Quest = {
      ...targetQuest,
      status: 'completed',
      completedAt: nowIso,
      streakCount: (targetQuest.streakCount || 0) + 1,
    };
    setQuests((prev) => prev.map((q) => (q.id === id ? updatedQuest : q)));

    // Calculate progression rewards
    const { finalXp, finalGold, bossDamage } = calculateEarnedRewards(
      targetQuest.difficulty,
      targetQuest.attribute,
      profile,
      inventory
    );

    // Audio & celebratory visuals
    sound.playQuestComplete();
    setTimeout(() => sound.playCoin(), 120);

    const clientX = clickCoordinates?.x ?? window.innerWidth / 2;
    const clientY = clickCoordinates?.y ?? window.innerHeight / 2;
    fireQuestCompleteConfetti(clientX / window.innerWidth, clientY / window.innerHeight);

    addFloatingReward(`+${finalXp} XP`, 'xp', clickCoordinates);
    setTimeout(() => addFloatingReward(`+${finalGold} Gold`, 'gold', clickCoordinates), 150);
    setTimeout(() => addFloatingReward(`-${bossDamage} Boss HP!`, 'damage', clickCoordinates), 300);

    // Update streak if active today
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = profile.streak;
    let newStreakHistory = [...profile.streakHistory];
    if (!newStreakHistory.includes(todayStr)) {
      newStreakHistory.push(todayStr);
      newStreak += 1;
    }

    // Attribute leveling
    const currentAttr = profile.attributes[targetQuest.attribute];
    let attrXp = currentAttr.currentXp + Math.round(finalXp * 0.8);
    let attrLvl = currentAttr.level;
    let attrMaxXp = currentAttr.maxXp;

    while (attrXp >= attrMaxXp) {
      attrXp -= attrMaxXp;
      attrLvl += 1;
      attrMaxXp = calculateAttributeMaxXp(attrLvl);
      addFloatingReward(`${targetQuest.attribute.toUpperCase()} LVL UP! (${attrLvl})`, 'attribute');
    }

    const updatedAttributes = {
      ...profile.attributes,
      [targetQuest.attribute]: {
        level: attrLvl,
        currentXp: attrXp,
        maxXp: attrMaxXp,
        tasksCompleted: currentAttr.tasksCompleted + 1,
      },
    };

    // Character XP and Non-linear Level-Up check
    let currentXp = profile.currentXp + finalXp;
    let currentLevel = profile.level;
    let currentMaxXp = profile.maxXp;
    let didLevelUp = false;
    let levelsGained = 0;

    while (currentXp >= currentMaxXp) {
      currentXp -= currentMaxXp;
      currentLevel += 1;
      levelsGained += 1;
      currentMaxXp = calculateMaxXpForLevel(currentLevel);
      didLevelUp = true;
    }

    const updatedProfile: CharacterProfile = {
      ...profile,
      level: currentLevel,
      currentXp,
      maxXp: currentMaxXp,
      gold: profile.gold + finalGold,
      streak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      lastActiveDate: todayStr,
      streakHistory: newStreakHistory,
      attributes: updatedAttributes,
    };

    setProfile(updatedProfile);

    // Boss damage calculation
    if (boss && !boss.defeated) {
      const newBossHp = Math.max(0, boss.currentHp - bossDamage);
      const isDefeated = newBossHp === 0;
      const updatedBoss: BossEntity = {
        ...boss,
        currentHp: newBossHp,
        defeated: isDefeated,
      };
      setBoss(updatedBoss);
      api.boss.damage(bossDamage);

      if (isDefeated) {
        sound.playLevelUp();
        fireBossDefeatedConfetti();
        addFloatingReward(`BOSS SLAIN! +${boss.rewardGold} Gold`, 'gold');
        updatedProfile.gold += boss.rewardGold;
      }
    }

    // Level-up celebration trigger!
    if (didLevelUp) {
      sound.playLevelUp();
      fireLevelUpConfetti();
      setLevelUpEvent({
        oldLevel: profile.level,
        newLevel: currentLevel,
        unlockedTitle: currentLevel >= 5 ? 'Master of Routines' : undefined,
        bonusGold: 50 * levelsGained,
        bonusGems: 1 * levelsGained,
      });
      updatedProfile.gold += 50 * levelsGained;
      updatedProfile.gems += 1 * levelsGained;
    }

    // Persist to API
    await Promise.all([
      api.quests.update(id, { status: 'completed', completedAt: nowIso }),
      api.character.updateProfile(updatedProfile),
    ]);
  };

  // --- SHOP & INVENTORY ---
  const buyItem = async (shopItemId: string) => {
    sound.playPurchase();
    const { inventoryItem, profile: newProf } = await api.shop.buy(shopItemId);
    setProfile(newProf);
    setInventory((prev) => {
      const existing = prev.findIndex((i) => i.shopItemId === shopItemId);
      if (existing > -1 && inventoryItem.item.category === 'potion') {
        const copy = [...prev];
        copy[existing] = inventoryItem;
        return copy;
      }
      return [...prev, inventoryItem];
    });
    addFloatingReward(`Acquired ${inventoryItem.item.name}!`, 'gold');
  };

  const toggleEquip = async (inventoryItemId: string) => {
    sound.playClick();
    const updated = await api.shop.toggleEquip(inventoryItemId);
    setInventory(updated);
  };

  const damageBoss = async (amount: number) => {
    sound.playBossHit();
    const updated = await api.boss.damage(amount);
    setBoss(updated);
    addFloatingReward(`-${amount} HP!`, 'damage');
  };

  const dismissLevelUp = () => {
    setLevelUpEvent(null);
  };

  const resetGameData = async () => {
    await api.resetDemo();
    await loadAllGameData();
    sound.playClick();
  };

  return (
    <GameContext.Provider
      value={{
        profile,
        quests,
        inventory,
        shopCatalog,
        boss,
        isLoading,
        activeFilter,
        setActiveFilter,
        levelUpEvent,
        floatingRewards,
        createQuest,
        updateQuest,
        deleteQuest,
        completeQuest,
        buyItem,
        toggleEquip,
        damageBoss,
        dismissLevelUp,
        resetGameData,
        refetchData: loadAllGameData,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
