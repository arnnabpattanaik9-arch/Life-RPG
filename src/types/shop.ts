import { AttributeType } from './character';

export type ItemCategory = 'weapon' | 'armor' | 'accessory' | 'potion' | 'theme' | 'badge';
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface ItemModifier {
  xpBonusPercent?: number;
  goldBonusPercent?: number;
  attributeBoost?: {
    attribute: AttributeType;
    multiplier: number;
  };
  streakShield?: boolean;
  hpBonus?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  rarity: ItemRarity;
  costGold: number;
  costGems: number;
  icon: string;
  modifier: ItemModifier;
  requiredLevel: number;
}

export interface InventoryItem {
  id: string;
  userId: string;
  shopItemId: string;
  item: ShopItem;
  quantity: number;
  isEquipped: boolean;
  acquiredAt: string;
}
