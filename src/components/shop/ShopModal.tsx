import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { ShopItem, ItemCategory, ItemRarity } from '../../types/shop';
import { sound } from '../../services/sound';
import {
  X,
  ShoppingBag,
  Coins,
  Gem,
  Check,
  Shield,
  Sword,
  Sparkles,
  Award,
  FlaskConical,
  Lock,
} from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInventory: () => void;
}

const RARITY_CONFIG: Record<
  ItemRarity,
  { label: string; color: string; border: string; bg: string }
> = {
  common: { label: 'Common', color: 'text-slate-300', border: 'border-slate-700', bg: 'bg-slate-800/40' },
  rare: { label: 'Rare', color: 'text-cyan-400', border: 'border-cyan-500/40', bg: 'bg-cyan-950/40' },
  epic: { label: 'Epic', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-950/40' },
  legendary: { label: 'Legendary', color: 'text-amber-400', border: 'border-amber-400/60', bg: 'bg-amber-950/40' },
};

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  onOpenInventory,
}) => {
  const { shopCatalog, profile, buyItem, inventory } = useGame();
  const [activeCategory, setActiveCategory] = useState<'all' | ItemCategory>('all');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const filteredItems = shopCatalog.filter((item) => {
    if (activeCategory !== 'all' && item.category !== activeCategory) return false;
    return true;
  });

  const handleBuy = async (item: ShopItem) => {
    if (profile.gold < item.costGold || profile.gems < item.costGems) return;
    setBuyingId(item.id);
    try {
      await buyItem(item.id);
    } catch (err) {
      console.error(err);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shop-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h3 id="shop-modal-title" className="text-xl font-black font-rpg text-white">
                The Royal Armory & Emporium
              </h3>
              <p className="text-xs text-slate-400">
                Purchase gear, focus potions, streak shields, and legendary artifacts with earned gold.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Balance */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-700/80">
              <div className="flex items-center gap-1 text-xs font-bold text-amber-300">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>{profile.gold} Gold</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1 text-xs font-bold text-cyan-300">
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>{profile.gems} Gems</span>
              </div>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close shop"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Items ({shopCatalog.length})
            </button>
            <button
              onClick={() => setActiveCategory('weapon')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeCategory === 'weapon'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sword className="w-3.5 h-3.5" /> Weapons
            </button>
            <button
              onClick={() => setActiveCategory('armor')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeCategory === 'armor'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Armor & Gear
            </button>
            <button
              onClick={() => setActiveCategory('potion')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeCategory === 'potion'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" /> Potions & Elixirs
            </button>
            <button
              onClick={() => setActiveCategory('badge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                activeCategory === 'badge'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" /> Titles & Badges
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenInventory();
            }}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline underline-offset-4 cursor-pointer whitespace-nowrap"
          >
            View My Inventory →
          </button>
        </div>

        {/* Catalog Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const rarity = RARITY_CONFIG[item.rarity];
            const canAfford = profile.gold >= item.costGold && profile.gems >= item.costGems;
            const levelRequirementMet = profile.level >= item.requiredLevel;
            const isOwned = inventory.some((inv) => inv.shopItemId === item.id && item.category !== 'potion');

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${rarity.border} ${rarity.bg} relative overflow-hidden`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center text-2xl shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${rarity.border} ${rarity.color}`}
                          >
                            {rarity.label}
                          </span>
                          {!levelRequirementMet && (
                            <span className="text-[10px] font-bold text-red-400 flex items-center gap-0.5">
                              <Lock className="w-3 h-3" /> Req LVL {item.requiredLevel}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-white mt-0.5 leading-snug">
                          {item.name}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  {/* Passive Modifiers */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {item.modifier.xpBonusPercent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        +{item.modifier.xpBonusPercent}% EXP Multiplier
                      </span>
                    )}
                    {item.modifier.goldBonusPercent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                        +{item.modifier.goldBonusPercent}% Gold Multiplier
                      </span>
                    )}
                    {item.modifier.attributeBoost && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40">
                        +{Math.round((item.modifier.attributeBoost.multiplier - 1) * 100)}% {item.modifier.attributeBoost.attribute.toUpperCase()} Focus
                      </span>
                    )}
                    {item.modifier.streakShield && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                        🛡️ Prevents Streak Reset
                      </span>
                    )}
                    {item.modifier.hpBonus && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40">
                        +{item.modifier.hpBonus} Max HP
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer Cost & Purchase Button */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                      <Coins className="w-4 h-4" />
                      <span>{item.costGold}</span>
                    </div>
                    {item.costGems > 0 && (
                      <div className="flex items-center gap-1 font-bold text-cyan-400 text-sm">
                        <Gem className="w-4 h-4" />
                        <span>{item.costGems}</span>
                      </div>
                    )}
                  </div>

                  {isOwned ? (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Acquired
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford || !levelRequirementMet || buyingId === item.id}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${
                        canAfford && levelRequirementMet
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>
                        {buyingId === item.id
                          ? 'Purchasing...'
                          : !levelRequirementMet
                          ? `Requires LVL ${item.requiredLevel}`
                          : !canAfford
                          ? 'Insufficient Funds'
                          : 'Purchase'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
