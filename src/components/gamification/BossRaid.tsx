import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Skull, Swords, Trophy, Sparkles, RefreshCw, Flame } from 'lucide-react';

export const BossRaid: React.FC = () => {
  const { boss, damageBoss } = useGame();
  const [isHitting, setIsHitting] = useState(false);

  if (!boss) return null;

  const hpPercent = Math.min(100, Math.round((boss.currentHp / boss.maxHp) * 100));

  const handleManualStrike = () => {
    setIsHitting(true);
    damageBoss(40);
    setTimeout(() => setIsHitting(false), 400);
  };

  return (
    <div
      id="boss-raid-section"
      className="bg-gradient-to-br from-red-950/40 via-slate-900/90 to-slate-950 border border-red-900/50 rounded-2xl p-5 shadow-xl backdrop-blur-md relative overflow-hidden flex flex-col justify-between"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Boss Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 ${boss.defeated ? 'border-amber-400' : 'border-red-500/70'} shadow-lg shadow-red-500/20 shrink-0 ${isHitting ? 'animate-shake' : ''}`}>
              <img
                src={boss.avatarUrl}
                alt={boss.name}
                className={`w-full h-full object-cover ${boss.defeated ? 'grayscale' : ''}`}
              />
              {boss.defeated && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center font-black text-xs text-amber-400 uppercase">
                  Slain
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-400 uppercase">
                  World Raid Boss
                </span>
                <span className="text-xs text-slate-400">LVL {boss.level}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white font-rpg tracking-tight mt-0.5">
                {boss.name}
              </h3>
              <p className="text-[11px] text-red-300/80 line-clamp-1 italic">
                {boss.title}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health</div>
            <div className="text-lg font-black text-red-400">
              {boss.currentHp} / {boss.maxHp}
            </div>
          </div>
        </div>

        {/* Boss HP Bar */}
        <div className="mb-3">
          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-red-950 relative p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(239,68,68,0.7)]"
              style={{ width: `${hpPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
            <span>Progress: {hpPercent}% Remaining</span>
            <span className="text-red-300 font-semibold">Every completed quest damages the Boss!</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 mb-3 leading-relaxed">
          {boss.description}
        </p>
      </div>

      {/* Rewards & Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-amber-300 font-bold">
            <span>🪙 +{boss.rewardGold} Gold</span>
          </div>
          <div className="flex items-center gap-1 text-cyan-300 font-bold">
            <span>⚡ +{boss.rewardXp} XP</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-purple-300 font-bold">
            <Trophy className="w-3.5 h-3.5" />
            <span>Badge: {boss.rewardBadge}</span>
          </div>
        </div>

        <div>
          {boss.defeated ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 border border-amber-400/50 rounded-lg text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Boss Slain! Legendary Bounty Awarded</span>
            </div>
          ) : (
            <button
              onClick={handleManualStrike}
              disabled={isHitting}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs rounded-lg shadow-md shadow-red-500/30 transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
              title="Channel discipline into a direct power strike!"
            >
              <Swords className="w-4 h-4" />
              <span>Strike Boss (-40 HP)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
