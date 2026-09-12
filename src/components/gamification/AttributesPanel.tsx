import React from 'react';
import { useGame } from '../../context/GameContext';
import { AttributeType } from '../../types/character';
import { Dumbbell, Brain, HeartPulse, Zap, MessageSquare, ChevronRight } from 'lucide-react';

export const ATTRIBUTE_CONFIG: Record<
  AttributeType,
  {
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    bgGlow: string;
    border: string;
    barColor: string;
    examples: string;
  }
> = {
  strength: {
    name: 'Strength',
    description: 'Physical conditioning, gym workouts, endurance, and power.',
    icon: <Dumbbell className="w-5 h-5 text-orange-400" />,
    color: 'text-orange-400',
    bgGlow: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    barColor: 'from-orange-500 to-amber-500',
    examples: 'Gym, Running, Pushups, Heavy lifting',
  },
  intellect: {
    name: 'Intellect',
    description: 'Engineering, deep coding, system architecture, reading, and problem solving.',
    icon: <Brain className="w-5 h-5 text-cyan-400" />,
    color: 'text-cyan-400',
    bgGlow: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    barColor: 'from-cyan-500 to-blue-500',
    examples: 'Coding, Books, Math, Deep work',
  },
  vitality: {
    name: 'Vitality',
    description: 'Restorative sleep, cellular hydration, meditation, and longevity.',
    icon: <HeartPulse className="w-5 h-5 text-emerald-400" />,
    color: 'text-emerald-400',
    bgGlow: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    barColor: 'from-emerald-500 to-teal-400',
    examples: '8h Sleep, 3L Water, Meditation, Clean meals',
  },
  agility: {
    name: 'Agility',
    description: 'Task execution speed, errand clearing, organization, and punctuality.',
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    color: 'text-yellow-400',
    bgGlow: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    barColor: 'from-yellow-500 to-amber-400',
    examples: 'Quick chores, Email triage, Desk tidying',
  },
  charisma: {
    name: 'Charisma',
    description: 'Interpersonal diplomacy, networking, leadership, and public speech.',
    icon: <MessageSquare className="w-5 h-5 text-pink-400" />,
    color: 'text-pink-400',
    bgGlow: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    barColor: 'from-pink-500 to-rose-400',
    examples: 'Networking, Team syncs, Mentorship, Speeches',
  },
};

export const AttributesPanel: React.FC = () => {
  const { profile, activeFilter, setActiveFilter } = useGame();

  if (!profile) return null;

  const handleFilterAttribute = (attr: AttributeType) => {
    setActiveFilter((prev) => ({
      ...prev,
      attribute: prev.attribute === attr ? 'all' : attr,
    }));
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white font-rpg flex items-center gap-2">
            <span>Character Attributes Matrix</span>
          </h2>
          <p className="text-xs text-slate-400">
            Completing categorized quests levels up specific real-world stats.
          </p>
        </div>
        <div className="text-[11px] text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
          Tip: Click an attribute to filter quests below
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {(Object.keys(ATTRIBUTE_CONFIG) as AttributeType[]).map((attrKey) => {
          const cfg = ATTRIBUTE_CONFIG[attrKey];
          const stat = profile.attributes[attrKey];
          const percent = Math.min(100, Math.round((stat.currentXp / stat.maxXp) * 100));
          const isSelected = activeFilter.attribute === attrKey;

          return (
            <div
              key={attrKey}
              onClick={() => handleFilterAttribute(attrKey)}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none group ${
                isSelected
                  ? 'border-amber-400 bg-slate-800/90 shadow-lg shadow-amber-500/10'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${cfg.bgGlow} border ${cfg.border}`}>
                    {cfg.icon}
                  </div>
                  <span className={`font-bold text-sm ${cfg.color}`}>{cfg.name}</span>
                </div>
                <div className="px-2 py-0.5 rounded-md bg-slate-800 text-xs font-extrabold text-white border border-slate-700">
                  LVL {stat.level}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-2">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400 font-medium">{stat.currentXp}/{stat.maxXp} XP</span>
                  <span className="text-slate-400 font-semibold">{percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full bg-gradient-to-r ${cfg.barColor} rounded-full transition-all duration-300`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Tasks counter & example */}
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span>{stat.tasksCompleted} Quests done</span>
                <span className="text-slate-500 flex items-center group-hover:text-amber-400 transition-colors">
                  Filter <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
