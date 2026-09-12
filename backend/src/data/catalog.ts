export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  category: 'weapon' | 'armor' | 'potion' | 'title';
  icon: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: {
    level: number;
    attributes: Record<string, number>;
    currentStreak: number;
    longestStreak: number;
  }, hasAnyCompletion: boolean) => boolean;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'weapon_iron_sword',
    name: 'Iron Shortsword',
    description: 'A dependable starter blade. +2% Gold from quests.',
    cost: 80,
    category: 'weapon',
    icon: 'Sword',
  },
  {
    id: 'weapon_focus_staff',
    name: 'Staff of Focus',
    description: 'Channels concentration into XP. +5% XP from dailies.',
    cost: 220,
    category: 'weapon',
    icon: 'Wand2',
  },
  {
    id: 'armor_leather',
    name: "Traveler's Leather Vest",
    description: 'Light armor for the early adventurer. +3% Gold from epics.',
    cost: 120,
    category: 'armor',
    icon: 'Shield',
  },
  {
    id: 'armor_plate',
    name: 'Warded Plate Armor',
    description: 'Heavy protection. +5% XP from hard quests.',
    cost: 350,
    category: 'armor',
    icon: 'ShieldCheck',
  },
  {
    id: 'potion_focus',
    name: 'Elixir of Focus',
    description: 'A single-use tonic for your next Focus Dungeon run.',
    cost: 40,
    category: 'potion',
    icon: 'FlaskConical',
  },
  {
    id: 'potion_streak_shield',
    name: 'Streak Shield',
    description: 'Protects your streak if you miss a single day.',
    cost: 150,
    category: 'potion',
    icon: 'ShieldHalf',
  },
  {
    id: 'title_apprentice',
    name: 'Title: Apprentice Adventurer',
    description: 'A cosmetic title shown on your character sheet.',
    cost: 50,
    category: 'title',
    icon: 'Tag',
  },
  {
    id: 'title_veteran',
    name: 'Title: Veteran of the Realm',
    description: 'A cosmetic title shown on your character sheet.',
    cost: 400,
    category: 'title',
    icon: 'Crown',
  },
];

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_quest',
    name: 'First Quest',
    description: 'Complete your very first quest.',
    icon: 'Sparkles',
    check: (_stats, hasAnyCompletion) => hasAnyCompletion,
  },
  {
    id: 'consistent',
    name: 'Consistent',
    description: 'Maintain a 3-day streak.',
    icon: 'Flame',
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Maintain a 7-day streak.',
    icon: 'FlameKindling',
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Reach Intellect level 5.',
    icon: 'BookOpen',
    check: (stats) => (stats.attributes.intellect ?? 1) >= 5,
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Reach character level 10.',
    icon: 'Medal',
    check: (stats) => stats.level >= 10,
  },
  {
    id: 'legendary',
    name: 'Legendary',
    description: 'Reach character level 25.',
    icon: 'Trophy',
    check: (stats) => stats.level >= 25,
  },
];
