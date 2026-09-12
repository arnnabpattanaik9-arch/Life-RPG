import React from 'react';
import { useGame } from '../../context/GameContext';
import { Flame, ShieldCheck, ShieldAlert, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface StreakCardProps {
  onOpenShop: () => void;
}

export const StreakCard: React.FC<StreakCardProps> = ({ onOpenShop }) => {
  const { profile } = useGame();

  if (!profile) return null;

  const streakDays = profile.streak;
  const streakBonusPercent = Math.min(50, streakDays * 2);

  // Generate last 7 days representation
  const today = new Date();
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isCompleted = profile.streakHistory.includes(dateStr);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = i === 6;
    return { dateStr, dayName, isCompleted, isToday };
  });

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400">
              <Flame className="w-5 h-5 fill-orange-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-rpg">Consecutive Streak</h3>
              <p className="text-[11px] text-slate-400">Consistency unlocks compounding rewards</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
              {streakDays} <span className="text-xs text-orange-400 uppercase">Days</span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
              <Award className="w-3 h-3 text-amber-400" /> Record: {profile.longestStreak}d
            </div>
          </div>
        </div>

        {/* 7-Day Visual Timeline */}
        <div className="grid grid-cols-7 gap-1.5 py-3 mb-3 border-y border-slate-800/80">
          {past7Days.map((day) => (
            <div
              key={day.dateStr}
              className={`flex flex-col items-center p-2 rounded-lg border text-center transition-all ${
                day.isCompleted
                  ? 'bg-orange-950/40 border-orange-500/40 text-orange-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
              } ${day.isToday ? 'ring-1 ring-amber-400' : ''}`}
            >
              <span className="text-[10px] font-semibold">{day.dayName}</span>
              <div className="mt-1">
                {day.isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-orange-400 fill-orange-400/20" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-700 mx-auto" />
                )}
              </div>
              {day.isToday && (
                <span className="text-[8px] text-amber-400 font-bold uppercase mt-0.5">Today</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Perk & Shield Status */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-amber-300">
            🔥 <span className="text-white">+{streakBonusPercent}%</span> Passive EXP & Gold Multiplier
          </div>
        </div>

        <div>
          {profile.streakShieldActive ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Streak Freeze Active</span>
            </div>
          ) : (
            <button
              onClick={onOpenShop}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Get Streak Shield</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
