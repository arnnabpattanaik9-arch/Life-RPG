import React from 'react';
import { useGame } from '../../context/GameContext';
import {
  Heart,
  Zap,
  Award,
  Sparkles,
  Shield,
  Sword,
  Flame,
  Info,
} from 'lucide-react';

interface HeroHUDProps {
  onOpenNewQuest: () => void;
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onScrollToBoss: () => void;
}

export const HeroHUD: React.FC<HeroHUDProps> = ({
  onOpenNewQuest,
  onOpenShop,
  onOpenInventory,
  onScrollToBoss,
}) => {
  const { profile, inventory } = useGame();

  if (!profile) return null;

  const xpPercent = Math.min(100, Math.round((profile.currentXp / profile.maxXp) * 100));
  const hpPercent = Math.min(100, Math.round((profile.hp / profile.maxHp) * 100));
  const manaPercent = Math.min(100, Math.round((profile.mana / profile.maxMana) * 100));

  const equippedWeapon = inventory.find((i) => i.isEquipped && i.item.category === 'weapon');
  const equippedArmor = inventory.find((i) => i.isEquipped && i.item.category === 'armor');

  const classBadges: Record<string, { label: string; color: string }> = {
    technomancer: { label: 'Technomancer Mage', color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40' },
    vanguard: { label: 'Ironclad Vanguard', color: 'text-orange-400 bg-orange-950/60 border-orange-500/40' },
    shadow: { label: 'Shadow Operative', color: 'text-purple-400 bg-purple-950/60 border-purple-500/40' },
    paladin: { label: 'Radiant Paladin', color: 'text-yellow-400 bg-yellow-950/60 border-yellow-500/40' },
    scholar: { label: 'Grand Alchemist', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40' },
  };

  const classBadge = classBadges[profile.characterClass] || classBadges.technomancer;

  return (
    <div className="w-full bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md relative overflow-hidden mb-8">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-1/4 w-72 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Avatar & Identity */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-amber-400/70 p-0.5 bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs px-2.5 py-0.5 rounded-full border border-white/40 shadow-md">
              LVL {profile.level}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-rpg">
                {profile.name}
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${classBadge.color}`}>
                {classBadge.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-300/90 font-medium mb-1">
              Title: <span className="font-semibold text-white">{profile.title}</span>
            </p>
            <p className="text-xs text-slate-400 max-w-md line-clamp-1 italic">
              "{profile.bio}"
            </p>
          </div>
        </div>

        {/* Center: Dynamic Stat Gauges (HP, Mana, Non-Linear XP) */}
        <div className="w-full lg:w-96 flex flex-col gap-3">
          {/* XP Gauge (Non-linear progression) */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-cyan-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                EXP Gauge (Level {profile.level})
              </span>
              <span className="text-slate-300 font-medium">
                <strong className="text-cyan-400">{profile.currentXp}</strong> / {profile.maxXp} XP ({xpPercent}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-cyan-900/60 relative p-0.5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 justify-end">
              <Info className="w-3 h-3 text-slate-500" />
              <span>Non-linear scale: Level {profile.level + 1} requires {profile.maxXp - profile.currentXp} more XP</span>
            </div>
          </div>

          {/* Dual HP and Mana bars */}
          <div className="grid grid-cols-2 gap-3">
            {/* Health Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5 font-semibold">
                <span className="text-red-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-red-400" /> HP
                </span>
                <span className="text-slate-300">{profile.hp}/{profile.maxHp}</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-red-950">
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
            </div>

            {/* Mana / Focus Bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-0.5 font-semibold">
                <span className="text-purple-400 flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-purple-400" /> Focus / MP
                </span>
                <span className="text-slate-300">{profile.mana}/{profile.maxMana}</span>
              </div>
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-purple-950">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full transition-all duration-300"
                  style={{ width: `${manaPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Equipped Loadout & Quick Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto items-stretch">
          {/* Equipped Weapon & Armor Quick Display */}
          <div className="flex items-center gap-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <div
              onClick={onOpenInventory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700/60 hover:border-amber-400/50 transition-colors cursor-pointer"
              title={equippedWeapon ? `${equippedWeapon.item.name}: +${equippedWeapon.item.modifier.xpBonusPercent}% XP` : 'No Weapon Equipped'}
            >
              <Sword className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-slate-300 max-w-[100px] truncate font-medium">
                {equippedWeapon ? equippedWeapon.item.name.split(' ')[0] : 'Bare Hands'}
              </span>
            </div>

            <div
              onClick={onOpenInventory}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 rounded-lg border border-slate-700/60 hover:border-cyan-400/50 transition-colors cursor-pointer"
              title={equippedArmor ? `${equippedArmor.item.name}` : 'No Armor Equipped'}
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-slate-300 max-w-[100px] truncate font-medium">
                {equippedArmor ? equippedArmor.item.name.split(' ')[0] : 'Cloth Tunic'}
              </span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenNewQuest}
              className="flex-1 lg:flex-initial px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Quest</span>
            </button>

            <button
              onClick={onScrollToBoss}
              className="px-3 py-2 bg-red-950/50 hover:bg-red-900/60 border border-red-700/60 text-red-300 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              title="Jump to Boss Raid"
            >
              <span>🐉 Boss Raid</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
