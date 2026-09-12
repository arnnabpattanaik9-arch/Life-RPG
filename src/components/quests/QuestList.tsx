import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Quest, QuestDifficulty, QuestType } from '../../types/quest';
import { AttributeType } from '../../types/character';
import { QuestCard } from './QuestCard';
import {
  Search,
  Filter,
  Plus,
  Flame,
  CheckCircle2,
  Sparkles,
  Scroll,
  X,
} from 'lucide-react';

interface QuestListProps {
  onOpenNewQuest: () => void;
  onEditQuest: (quest: Quest) => void;
}

export const QuestList: React.FC<QuestListProps> = ({
  onOpenNewQuest,
  onEditQuest,
}) => {
  const { quests, activeFilter, setActiveFilter } = useGame();
  const [searchQuery, setSearchQuery] = useState('');

  // Active status tab: 'active' | 'completed' | 'all'
  const currentStatus = activeFilter.status;

  // Filter quests
  const filteredQuests = quests.filter((q) => {
    // Status filter
    if (currentStatus !== 'all' && q.status !== currentStatus) return false;

    // Type filter
    if (activeFilter.type !== 'all' && q.type !== activeFilter.type) return false;

    // Attribute filter
    if (activeFilter.attribute !== 'all' && q.attribute !== activeFilter.attribute) return false;

    // Difficulty filter
    if (activeFilter.difficulty !== 'all' && q.difficulty !== activeFilter.difficulty) return false;

    // Search query
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      const matchTitle = q.title.toLowerCase().includes(term);
      const matchDesc = q.description?.toLowerCase().includes(term);
      const matchTags = q.tags?.some((t) => t.toLowerCase().includes(term));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }

    return true;
  });

  const activeCount = quests.filter((q) => q.status === 'active').length;
  const completedCount = quests.filter((q) => q.status === 'completed').length;
  const habitCount = quests.filter((q) => q.type === 'habit' && q.status === 'active').length;

  const resetFilters = () => {
    setActiveFilter({
      status: 'active',
      type: 'all',
      attribute: 'all',
      difficulty: 'all',
      searchQuery: '',
    });
    setSearchQuery('');
  };

  const hasActiveFilters =
    activeFilter.attribute !== 'all' ||
    activeFilter.difficulty !== 'all' ||
    activeFilter.type !== 'all' ||
    searchQuery !== '';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl backdrop-blur-md mb-8">
      {/* Header & Main Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scroll className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-rpg">
              Quest Log & Directives
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Execute objectives to gain EXP, Gold, attribute points, and raid boss damage.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={onOpenNewQuest}
          className="self-start md:self-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Quest Directive</span>
        </button>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-5">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveFilter((prev) => ({ ...prev, status: 'active', type: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              currentStatus === 'active' && activeFilter.type === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active Quests ({activeCount})
          </button>

          <button
            onClick={() => setActiveFilter((prev) => ({ ...prev, status: 'active', type: 'habit' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              activeFilter.type === 'habit'
                ? 'bg-orange-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Habits ({habitCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter((prev) => ({ ...prev, status: 'completed', type: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap cursor-pointer ${
              currentStatus === 'completed'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed ({completedCount})</span>
          </button>

          <button
            onClick={() => setActiveFilter((prev) => ({ ...prev, status: 'all', type: 'all' }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              currentStatus === 'all' && activeFilter.type === 'all'
                ? 'bg-slate-700 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs ({quests.length})
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or tag..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:border-amber-400 transition-colors"
            />
          </div>

          {/* Difficulty Dropdown */}
          <select
            value={activeFilter.difficulty}
            onChange={(e) =>
              setActiveFilter((prev) => ({
                ...prev,
                difficulty: e.target.value as 'all' | QuestDifficulty,
              }))
            }
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:border-amber-400"
          >
            <option value="all">All Difficulties</option>
            <option value="trivial">Trivial</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="epic">Epic</option>
          </select>

          {/* Attribute Dropdown */}
          <select
            value={activeFilter.attribute}
            onChange={(e) =>
              setActiveFilter((prev) => ({
                ...prev,
                attribute: e.target.value as 'all' | AttributeType,
              }))
            }
            className="px-2.5 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:border-amber-400"
          >
            <option value="all">All Attributes</option>
            <option value="strength">Strength</option>
            <option value="intellect">Intellect</option>
            <option value="vitality">Vitality</option>
            <option value="agility">Agility</option>
            <option value="charisma">Charisma</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Clear Active Filters"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Quest Cards Grid */}
      {filteredQuests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} onEdit={onEditQuest} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-amber-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white mb-1">No Quest Directives Found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {hasActiveFilters
              ? 'No quests match your current filter selection. Try clearing filters.'
              : 'You have cleared all active quests! Forge a new quest to continue leveling.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={onOpenNewQuest}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-xs font-black text-slate-950 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Forge New Quest
            </button>
          )}
        </div>
      )}
    </div>
  );
};
