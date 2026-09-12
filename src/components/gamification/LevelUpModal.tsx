import React from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../services/sound';
import { Trophy, Sparkles, Coins, Gem, ArrowRight } from 'lucide-react';

export const LevelUpModal: React.FC = () => {
  const { levelUpEvent, dismissLevelUp, profile } = useGame();

  if (!levelUpEvent) return null;

  const handleClaim = () => {
    sound.playCoin();
    dismissLevelUp();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border-2 border-amber-400/80 rounded-2xl shadow-2xl shadow-amber-500/20 text-center transform transition-all animate-float">
        {/* Glow halo */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-amber-500/30 rounded-full blur-2xl pointer-events-none" />

        {/* Crown / Trophy Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-amber-600 to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/50 mb-4 border-2 border-white/20">
          <Trophy className="w-10 h-10 text-slate-950 stroke-[2.5]" />
        </div>

        <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-xs font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ascension Achieved</span>
        </div>

        <h2 id="levelup-title" className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 tracking-tight font-rpg">
          LEVEL UP!
        </h2>

        <div className="flex items-center justify-center gap-4 my-6">
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 uppercase tracking-widest">Previous</span>
            <span className="text-2xl font-bold text-slate-400">LVL {levelUpEvent.oldLevel}</span>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-400" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-amber-300 font-semibold uppercase tracking-widest">Promoted</span>
            <span className="text-4xl font-extrabold text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              LVL {levelUpEvent.newLevel}
            </span>
          </div>
        </div>

        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Your discipline yields sovereign power. The realm recognizes your dedication, adventurer{' '}
          <strong className="text-amber-300">{profile?.name}</strong>!
        </p>

        {/* Rewards Unlocked */}
        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-800/60 rounded-xl border border-slate-700/60 mb-6">
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-lg">
            <Coins className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs text-slate-400">Bonus Gold</div>
              <div className="text-sm font-bold text-amber-300">+{levelUpEvent.bonusGold} Gold</div>
            </div>
          </div>
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 rounded-lg">
            <Gem className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-left">
              <div className="text-xs text-slate-400">Rare Gems</div>
              <div className="text-sm font-bold text-cyan-300">+{levelUpEvent.bonusGems} Gems</div>
            </div>
          </div>
        </div>

        {levelUpEvent.unlockedTitle && (
          <div className="mb-6 p-2.5 bg-purple-950/40 border border-purple-500/40 rounded-lg text-purple-200 text-xs font-medium">
            🎖️ New Prestige Title Unlocked: <strong className="text-purple-300">{levelUpEvent.unlockedTitle}</strong>
          </div>
        )}

        <button
          onClick={handleClaim}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 transition-all transform active:scale-98 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>Claim Rewards & Continue</span>
        </button>
      </div>
    </div>
  );
};
