import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { sound } from '../../services/sound';
import {
  Shield,
  Coins,
  Gem,
  Flame,
  Volume2,
  VolumeX,
  Palette,
  ShoppingBag,
  Package,
  User as UserIcon,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  onOpenShop: () => void;
  onOpenInventory: () => void;
  onOpenAuth: () => void;
  onOpenNewQuest: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenShop,
  onOpenInventory,
  onOpenAuth,
  onOpenNewQuest,
}) => {
  const { profile, resetGameData } = useGame();
  const { theme, setTheme, availableThemes } = useTheme();
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(sound.getIsMuted());
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
    if (!muted) sound.playClick();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/40 transform hover:scale-105 transition-transform cursor-pointer">
            <Shield className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-slate-100 font-rpg">
                LIFE <span className="text-amber-400">RPG</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                v2.0
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-400 font-medium">
              Turn Real Tasks Into Legend
            </p>
          </div>
        </div>

        {/* Center: Currency, Streak, and Hero Quick Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Gold Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/40 border border-amber-500/30 rounded-lg text-amber-300 text-xs sm:text-sm font-bold shadow-inner"
            title="Gold Coins: Earned by completing quests and streaks"
          >
            <Coins className="w-4 h-4 text-amber-400" />
            <span>{profile ? profile.gold : 0}</span>
          </div>

          {/* Gems Counter */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/40 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs sm:text-sm font-bold shadow-inner"
            title="Rare Gems: Earned on Level Up & Epic Boss Raids"
          >
            <Gem className="w-4 h-4 text-cyan-400" />
            <span>{profile ? profile.gems : 0}</span>
          </div>

          {/* Consecutive Streak */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-950/40 border border-orange-500/30 rounded-lg text-orange-300 text-xs sm:text-sm font-bold animate-pulse-slow"
            title={`${profile?.streak || 0} Day Streak! +${Math.min(50, (profile?.streak || 0) * 2)}% XP Bonus`}
          >
            <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            <span>{profile?.streak || 0}d</span>
          </div>
        </div>

        {/* Right: Actions & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Quest Button */}
          <button
            onClick={onOpenNewQuest}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            title="New Quest (Shortcut: N)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Quest</span>
          </button>

          {/* Shop / Armory */}
          <button
            onClick={onOpenShop}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 hover:text-amber-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Open Armory & Shop (Shortcut: S)"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden lg:inline">Armory</span>
          </button>

          {/* Inventory */}
          <button
            onClick={onOpenInventory}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-200 hover:text-cyan-400 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
            title="Open Inventory (Shortcut: I)"
          >
            <Package className="w-4 h-4" />
            <span className="hidden lg:inline">Inventory</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-amber-400 transition-all cursor-pointer"
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            aria-label="Toggle Sound Effects"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg text-slate-300 hover:text-purple-400 transition-all cursor-pointer"
              title="Change RPG Theme"
              aria-label="Change Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <div className="absolute right-0 mt-2 w-48 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-fade-in">
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Theme
                </div>
                {availableThemes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                      sound.playClick();
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors cursor-pointer ${
                      theme === t.id ? 'text-amber-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.accentColor }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hero Profile / Auth */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg transition-all cursor-pointer"
              title="Hero Profile & Accounts"
            >
              <div className="text-right hidden xl:block">
                <div className="text-xs font-bold text-slate-200 leading-tight">
                  {user ? user.characterName : 'Adventurer'}
                </div>
                <div className="text-[10px] text-amber-400 font-semibold leading-none">
                  LVL {profile ? profile.level : 1}
                </div>
              </div>
              <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-800 border border-amber-400/50 flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Hero Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-amber-400" />
                )}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 py-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 animate-fade-in">
                <div className="px-4 py-2 border-b border-slate-800">
                  <div className="text-xs font-bold text-slate-200">{profile?.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{profile?.characterClass} Archetype</div>
                  <div className="text-[10px] text-amber-400 font-semibold mt-0.5">Level {profile?.level} Champion</div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setShowProfileMenu(false);
                      sound.playClick();
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hero Accounts & Switcher</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Reset demo state to initial starter quests and stats?')) {
                        resetGameData();
                      }
                      setShowProfileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-400 hover:bg-slate-800 hover:text-amber-300 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset Demo State</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
