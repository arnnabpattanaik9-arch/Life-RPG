import React from 'react';
import { useGame } from '../../context/GameContext';
import { InventoryItem } from '../../types/shop';
import { sound } from '../../services/sound';
import {
  X,
  Package,
  Shield,
  Sword,
  Sparkles,
  Check,
  Coins,
  Gem,
  ShoppingBag,
} from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShop: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  onOpenShop,
}) => {
  const { inventory, toggleEquip, profile } = useGame();

  if (!isOpen || !profile) return null;

  const equippedWeapon = inventory.find((i) => i.isEquipped && i.item.category === 'weapon');
  const equippedArmor = inventory.find((i) => i.isEquipped && i.item.category === 'armor');

  // Compute total active bonuses
  let totalXpBonus = 0;
  let totalGoldBonus = 0;
  let totalHpBonus = 0;
  inventory.forEach((inv) => {
    if (inv.isEquipped) {
      if (inv.item.modifier.xpBonusPercent) totalXpBonus += inv.item.modifier.xpBonusPercent;
      if (inv.item.modifier.goldBonusPercent) totalGoldBonus += inv.item.modifier.goldBonusPercent;
      if (inv.item.modifier.hpBonus) totalHpBonus += inv.item.modifier.hpBonus;
    }
  });

  const handleToggle = async (id: string) => {
    sound.playClick();
    await toggleEquip(id);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="inventory-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-400">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 id="inventory-modal-title" className="text-xl font-black font-rpg text-white">
                Hero Vault & Loadout
              </h3>
              <p className="text-xs text-slate-400">
                Equip forged gear and weapons to unlock passive multipliers on your daily quests.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close inventory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Equipment Slots & Stat Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            {/* Weapon Slot */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber-950/50 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
                {equippedWeapon ? equippedWeapon.item.icon : '🗡️'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  Equipped Weapon
                </span>
                <h5 className="font-bold text-xs text-white truncate">
                  {equippedWeapon ? equippedWeapon.item.name : 'No Weapon Equipped'}
                </h5>
                <p className="text-[10px] text-slate-400 truncate">
                  {equippedWeapon ? `+${equippedWeapon.item.modifier.xpBonusPercent}% EXP Multiplier` : 'Equip a weapon below'}
                </p>
              </div>
            </div>

            {/* Armor Slot */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-center text-2xl shrink-0">
                {equippedArmor ? equippedArmor.item.icon : '🛡️'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  Equipped Armor
                </span>
                <h5 className="font-bold text-xs text-white truncate">
                  {equippedArmor ? equippedArmor.item.name : 'No Armor Equipped'}
                </h5>
                <p className="text-[10px] text-slate-400 truncate">
                  {equippedArmor ? `+${equippedArmor.item.modifier.hpBonus || 0} HP Buff` : 'Equip armor below'}
                </p>
              </div>
            </div>

            {/* Active Combined Multiplier */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-700/80 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">
                Passive Loadout Buffs
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="text-cyan-300">+{totalXpBonus}% EXP</span>
                <span className="text-amber-300">+{totalGoldBonus}% Gold</span>
                {totalHpBonus > 0 && <span className="text-red-300">+{totalHpBonus} HP</span>}
              </div>
            </div>
          </div>

          {/* Acquired Inventory Items Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-white font-rpg">
                Stored Items ({inventory.length})
              </h4>
              <button
                onClick={() => {
                  onClose();
                  onOpenShop();
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Visit Armory to Buy Gear</span>
              </button>
            </div>

            {inventory.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {inventory.map((inv) => {
                  const isEquippable = inv.item.category === 'weapon' || inv.item.category === 'armor';

                  return (
                    <div
                      key={inv.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        inv.isEquipped
                          ? 'bg-slate-800/90 border-amber-400 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                          {inv.item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="font-bold text-xs text-white truncate">
                              {inv.item.name}
                            </h5>
                            {inv.quantity > 1 && (
                              <span className="text-[10px] font-bold text-amber-400">
                                x{inv.quantity}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-1">
                            {inv.item.description}
                          </p>
                        </div>
                      </div>

                      {isEquippable && (
                        <button
                          onClick={() => handleToggle(inv.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                            inv.isEquipped
                              ? 'bg-amber-500 text-slate-950 shadow-md'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          {inv.isEquipped ? 'Equipped' : 'Equip'}
                        </button>
                      )}

                      {inv.item.category === 'potion' && (
                        <span className="text-[11px] font-bold text-emerald-400 px-2 py-1 bg-emerald-950/60 border border-emerald-500/40 rounded-lg shrink-0">
                          Consumable
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
                <p className="text-xs text-slate-400 mb-2">
                  Your vault is currently empty. Complete quests to earn gold and purchase items!
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenShop();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Explore Armory Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
