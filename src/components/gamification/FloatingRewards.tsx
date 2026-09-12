import React from 'react';
import { useGame } from '../../context/GameContext';

export const FloatingRewards: React.FC = () => {
  const { floatingRewards } = useGame();

  if (floatingRewards.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {floatingRewards.map((reward) => {
        const style: React.CSSProperties = {
          position: 'absolute',
          left: reward.x ? `${reward.x}px` : '50%',
          top: reward.y ? `${reward.y}px` : '35%',
          transform: 'translate(-50%, -50%)',
        };

        let colorClasses = 'text-amber-400 border-amber-400/40 bg-amber-950/80';
        if (reward.type === 'xp') {
          colorClasses = 'text-cyan-300 border-cyan-400/40 bg-cyan-950/80';
        } else if (reward.type === 'damage') {
          colorClasses = 'text-red-400 border-red-500/40 bg-red-950/80 font-bold';
        } else if (reward.type === 'attribute') {
          colorClasses = 'text-emerald-300 border-emerald-400/40 bg-emerald-950/80 font-bold';
        }

        return (
          <div
            key={reward.id}
            style={style}
            className={`animate-float-up px-3 py-1.5 rounded-full border shadow-lg text-sm md:text-base font-extrabold backdrop-blur-md flex items-center gap-1.5 ${colorClasses}`}
          >
            {reward.type === 'gold' && '🪙'}
            {reward.type === 'xp' && '⚡'}
            {reward.type === 'damage' && '💥'}
            {reward.type === 'attribute' && '⭐'}
            <span>{reward.text}</span>
          </div>
        );
      })}
    </div>
  );
};
