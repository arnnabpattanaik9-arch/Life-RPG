import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/layout/Navbar';
import { HeroHUD } from './components/layout/HeroHUD';
import { AttributesPanel } from './components/gamification/AttributesPanel';
import { StreakCard } from './components/gamification/StreakCard';
import { BossRaid } from './components/gamification/BossRaid';
import { QuestList } from './components/quests/QuestList';
import { QuestModal } from './components/quests/QuestModal';
import { ShopModal } from './components/shop/ShopModal';
import { InventoryModal } from './components/shop/InventoryModal';
import { AuthModal } from './components/auth/AuthModal';
import { LevelUpModal } from './components/gamification/LevelUpModal';
import { FloatingRewards } from './components/gamification/FloatingRewards';
import { Footer } from './components/layout/Footer';
import { Quest } from './types/quest';
import { sound } from './services/sound';

const MainDashboard: React.FC = () => {
  const { isLoading } = useGame();

  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }

      if (e.key === 'Escape') {
        setIsQuestModalOpen(false);
        setIsShopModalOpen(false);
        setIsInventoryModalOpen(false);
        setIsAuthModalOpen(false);
        setEditingQuest(null);
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingQuest(null);
        setIsQuestModalOpen(true);
        sound.playClick();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        setIsShopModalOpen(true);
        sound.playClick();
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        setIsInventoryModalOpen(true);
        sound.playClick();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        sound.toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenNewQuest = () => {
    setEditingQuest(null);
    setIsQuestModalOpen(true);
    sound.playClick();
  };

  const handleEditQuest = (quest: Quest) => {
    setEditingQuest(quest);
    setIsQuestModalOpen(true);
    sound.playClick();
  };

  const handleScrollToBoss = () => {
    const el = document.getElementById('boss-raid-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-rpg-dark flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl animate-bounce mb-4 shadow-xl shadow-amber-500/20">
          ⚔️
        </div>
        <div className="text-xl font-bold font-rpg text-amber-400 tracking-wider">
          INITIALIZING LIFE RPG REALM...
        </div>
        <p className="text-xs text-slate-500 mt-2 animate-pulse">
          Synchronizing character stats, active quests, and raid boss state
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rpg-dark flex flex-col selection:bg-amber-500 selection:text-black">
      {/* Dynamic Celebrations & Floating Feedback */}
      <FloatingRewards />
      <LevelUpModal />

      {/* Navigation Header */}
      <Navbar
        onOpenShop={() => {
          setIsShopModalOpen(true);
          sound.playClick();
        }}
        onOpenInventory={() => {
          setIsInventoryModalOpen(true);
          sound.playClick();
        }}
        onOpenAuth={() => {
          setIsAuthModalOpen(true);
          sound.playClick();
        }}
        onOpenNewQuest={handleOpenNewQuest}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Hero Command HUD */}
        <HeroHUD
          onOpenNewQuest={handleOpenNewQuest}
          onOpenShop={() => setIsShopModalOpen(true)}
          onOpenInventory={() => setIsInventoryModalOpen(true)}
          onScrollToBoss={handleScrollToBoss}
        />

        {/* Gamification Dual Column: Streaks & Boss Raid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <StreakCard onOpenShop={() => setIsShopModalOpen(true)} />
          <BossRaid />
        </div>

        {/* Character Attributes Matrix */}
        <AttributesPanel />

        {/* Quest Directive Board (Full CRUD) */}
        <QuestList
          onOpenNewQuest={handleOpenNewQuest}
          onEditQuest={handleEditQuest}
        />
      </main>

      {/* Modals */}
      <QuestModal
        isOpen={isQuestModalOpen}
        onClose={() => {
          setIsQuestModalOpen(false);
          setEditingQuest(null);
        }}
        editingQuest={editingQuest}
      />

      <ShopModal
        isOpen={isShopModalOpen}
        onClose={() => setIsShopModalOpen(false)}
        onOpenInventory={() => setIsInventoryModalOpen(true)}
      />

      <InventoryModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        onOpenShop={() => setIsShopModalOpen(true)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <GameProvider>
          <MainDashboard />
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
