import React, { useState, useEffect } from 'react';
import { Quest, QuestDifficulty, QuestType, QuestPriority } from '../../types/quest';
import { AttributeType } from '../../types/character';
import { useGame } from '../../context/GameContext';
import { BASE_REWARDS } from '../../engine/progression';
import { ATTRIBUTE_CONFIG } from '../gamification/AttributesPanel';
import { sound } from '../../services/sound';
import {
  X,
  Sparkles,
  Coins,
  Calendar,
  AlertCircle,
  Tag,
  Check,
} from 'lucide-react';

interface QuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingQuest?: Quest | null;
}

export const QuestModal: React.FC<QuestModalProps> = ({
  isOpen,
  onClose,
  editingQuest,
}) => {
  const { createQuest, updateQuest, profile } = useGame();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attribute, setAttribute] = useState<AttributeType>('intellect');
  const [difficulty, setDifficulty] = useState<QuestDifficulty>('medium');
  const [type, setType] = useState<QuestType>('todo');
  const [priority, setPriority] = useState<QuestPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingQuest) {
      setTitle(editingQuest.title);
      setDescription(editingQuest.description);
      setAttribute(editingQuest.attribute);
      setDifficulty(editingQuest.difficulty);
      setType(editingQuest.type);
      setPriority(editingQuest.priority);
      setDueDate(editingQuest.dueDate || '');
      setTagsInput(editingQuest.tags ? editingQuest.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setAttribute('intellect');
      setDifficulty('medium');
      setType('todo');
      setPriority('medium');
      setDueDate(new Date().toISOString().split('T')[0]);
      setTagsInput('');
    }
    setError('');
  }, [editingQuest, isOpen]);

  if (!isOpen) return null;

  const baseReward = BASE_REWARDS[difficulty];
  // Calculate preview with streak bonus
  const streakBonus = Math.min(0.5, (profile?.streak || 0) * 0.02);
  const previewXp = Math.round(baseReward.xp * (1 + streakBonus));
  const previewGold = Math.round(baseReward.gold * (1 + streakBonus));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a quest title.');
      return;
    }

    setIsSubmitting(true);
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingQuest) {
        await updateQuest(editingQuest.id, {
          title: title.trim(),
          description: description.trim(),
          attribute,
          difficulty,
          type,
          priority,
          dueDate: dueDate || undefined,
          tags: parsedTags,
          xpReward: previewXp,
          goldReward: previewGold,
        });
      } else {
        await createQuest({
          userId: profile?.userId || 'user-demo-1',
          title: title.trim(),
          description: description.trim(),
          attribute,
          difficulty,
          type,
          priority,
          dueDate: dueDate || undefined,
          tags: parsedTags,
          xpReward: previewXp,
          goldReward: previewGold,
        });
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message
        ? err.message
        : 'Failed to save quest. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quest-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 id="quest-modal-title" className="text-xl font-bold font-rpg text-white">
              {editingQuest ? 'Edit Quest Directive' : 'Forge New Quest'}
            </h3>
            <p className="text-xs text-slate-400">
              Set your objective, assign real-world attributes, and claim progression bounties.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Quest Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 20 pages of architecture patterns, 100 pushups, 2L water"
              className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-amber-400 transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Directive Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific milestones or conditions of satisfaction..."
              rows={2}
              className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-amber-400 transition-colors resize-none"
            />
          </div>

          {/* Attribute Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Target Character Attribute
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(ATTRIBUTE_CONFIG) as AttributeType[]).map((attrKey) => {
                const cfg = ATTRIBUTE_CONFIG[attrKey];
                const isSelected = attribute === attrKey;
                return (
                  <button
                    key={attrKey}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setAttribute(attrKey);
                    }}
                    className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-400 bg-slate-800 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className={cfg.color}>{cfg.icon}</div>
                    <span className="text-[11px] font-bold capitalize">{attrKey}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Tier & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Difficulty Tier
              </label>
              <select
                value={difficulty}
                onChange={(e) => {
                  sound.playClick();
                  setDifficulty(e.target.value as QuestDifficulty);
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400"
              >
                <option value="trivial">Trivial (Low effort: 15 XP, 8 Gold)</option>
                <option value="easy">Easy (Routine task: 30 XP, 15 Gold)</option>
                <option value="medium">Medium (Standard focus: 60 XP, 30 Gold)</option>
                <option value="hard">Hard (Deep session: 120 XP, 60 Gold)</option>
                <option value="epic">Epic Raid (Massive milestone: 250 XP, 125 Gold)</option>
              </select>
            </div>

            {/* Quest Type */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Classification
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as QuestType)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400"
              >
                <option value="todo">Standard Quest / To-Do</option>
                <option value="habit">Daily Recurring Habit</option>
                <option value="milestone">Epic Multi-Stage Milestone</option>
              </select>
            </div>
          </div>

          {/* Due Date & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Target Deadline
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Coding, Health, Morning"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:border-amber-400"
              />
            </div>
          </div>

          {/* Reward Bounty Live Preview */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="text-xs">
              <span className="text-slate-400">Calculated Completion Bounty:</span>
              <div className="text-[11px] text-amber-300/80">Includes current streak multiplier bonus</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-bold text-cyan-400 text-sm">
                <Sparkles className="w-4 h-4" />
                <span>+{previewXp} XP</span>
              </div>
              <div className="flex items-center gap-1 font-bold text-amber-400 text-sm">
                <Coins className="w-4 h-4" />
                <span>+{previewGold} Gold</span>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{editingQuest ? 'Save Updates' : 'Commit Quest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
