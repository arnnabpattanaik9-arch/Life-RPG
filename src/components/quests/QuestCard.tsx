import React, { useState } from 'react';
import { Quest, QuestDifficulty } from '../../types/quest';
import { useGame } from '../../context/GameContext';
import { ATTRIBUTE_CONFIG } from '../gamification/AttributesPanel';
import {
  Check,
  Clock,
  Flame,
  MoreVertical,
  Edit2,
  Trash2,
  Coins,
  Sparkles,
  Calendar,
  Tag,
} from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  onEdit: (quest: Quest) => void;
}

const DIFFICULTY_CONFIG: Record<
  QuestDifficulty,
  { label: string; color: string; bg: string; border: string }
> = {
  trivial: { label: 'Trivial', color: 'text-slate-300', bg: 'bg-slate-800/60', border: 'border-slate-700' },
  easy: { label: 'Easy', color: 'text-emerald-300', bg: 'bg-emerald-950/60', border: 'border-emerald-500/40' },
  medium: { label: 'Medium', color: 'text-cyan-300', bg: 'bg-cyan-950/60', border: 'border-cyan-500/40' },
  hard: { label: 'Hard', color: 'text-orange-300', bg: 'bg-orange-950/60', border: 'border-orange-500/40' },
  epic: { label: 'Epic Raid', color: 'text-purple-300', bg: 'bg-purple-950/60', border: 'border-purple-500/40' },
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onEdit }) => {
  const { completeQuest, deleteQuest } = useGame();
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const attrConfig = ATTRIBUTE_CONFIG[quest.attribute] || ATTRIBUTE_CONFIG.intellect;
  const diffConfig = DIFFICULTY_CONFIG[quest.difficulty] || DIFFICULTY_CONFIG.medium;
  const isCompleted = quest.status === 'completed';

  const handleCheckboxClick = async (e: React.MouseEvent) => {
    if (isCompleted || isCompleting) return;
    setIsCompleting(true);
    const rect = e.currentTarget.getBoundingClientRect();
    await completeQuest(quest.id, { x: rect.left + rect.width / 2, y: rect.top });
    setIsCompleting(false);
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete quest "${quest.title}"?`)) {
      await deleteQuest(quest.id);
    }
  };

  return (
    <div
      className={`rpg-card relative rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-md backdrop-blur-md'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Checkbox */}
        <button
          onClick={handleCheckboxClick}
          disabled={isCompleted || isCompleting}
          aria-label={isCompleted ? 'Completed Quest' : `Complete Quest: ${quest.title}`}
          className={`relative mt-0.5 w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer select-none shrink-0 ${
            isCompleted
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'border-2 border-slate-600 hover:border-amber-400 bg-slate-950/80 hover:bg-slate-800'
          } ${isCompleting ? 'scale-110' : ''}`}
        >
          {isCompleted && <Check className="w-5 h-5 stroke-[3]" />}
        </button>

        {/* Quest Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Attribute Pill, Difficulty, Type, and Options Menu */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Attribute Pill */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${attrConfig.bgGlow} ${attrConfig.border} ${attrConfig.color}`}
              >
                {attrConfig.icon}
                <span className="capitalize">{quest.attribute}</span>
              </span>

              {/* Difficulty Tier */}
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${diffConfig.bg} ${diffConfig.border} ${diffConfig.color}`}
              >
                {diffConfig.label}
              </span>

              {/* Quest Type Tag */}
              {quest.type === 'habit' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-orange-950/40 text-orange-400 border border-orange-500/30">
                  <Flame className="w-3 h-3 fill-orange-400" />
                  <span>Habit {quest.streakCount ? `(${quest.streakCount}d)` : ''}</span>
                </span>
              )}
              {quest.type === 'milestone' && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-950/40 text-indigo-300 border border-indigo-500/30">
                  Epic Milestone
                </span>
              )}
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Quest Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-1 w-32 py-1 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-30 animate-fade-in">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(quest);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-amber-400 flex items-center gap-2 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Quest</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h4
            className={`text-sm sm:text-base font-bold text-white leading-snug mb-1 ${
              isCompleted ? 'line-through text-slate-400' : ''
            }`}
          >
            {quest.title}
          </h4>

          {/* Description */}
          {quest.description && (
            <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
              {quest.description}
            </p>
          )}

          {/* Tags */}
          {quest.tags && quest.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              {quest.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800"
                >
                  <Tag className="w-2.5 h-2.5 text-slate-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: Due Date & Rewards Preview */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-xs">
            {quest.dueDate ? (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Due: {quest.dueDate}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">No deadline</span>
            )}

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                +{quest.xpReward} XP
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                <Coins className="w-3 h-3" />
                +{quest.goldReward} Gold
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
