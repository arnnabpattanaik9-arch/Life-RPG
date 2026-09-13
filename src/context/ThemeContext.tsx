import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeName = 'cyberpunk' | 'arcane' | 'retro' | 'obsidian';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  availableThemes: { id: ThemeName; label: string; icon: string; accentColor: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: ThemeName; label: string; icon: string; accentColor: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: '⚡', accentColor: '#00f0ff' },
  { id: 'arcane', label: 'Arcane Fantasy', icon: '🔮', accentColor: '#8b5cf6' },
  { id: 'retro', label: '16-Bit Retro Dungeon', icon: '👾', accentColor: '#22c55e' },
  { id: 'obsidian', label: 'Obsidian Stealth', icon: '🗡️', accentColor: '#f59e0b' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('life_rpg_active_theme') as ThemeName;
    return saved && THEMES.some((t) => t.id === saved) ? saved : 'cyberpunk';
  });

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem('life_rpg_active_theme', newTheme);
  };

  useEffect(() => {
    // Clean previous theme classes and apply active theme
    THEMES.forEach((t) => {
      document.body.classList.remove(`theme-${t.id}`);
      document.documentElement.classList.remove(`theme-${t.id}`);
    });
    document.body.classList.add(`theme-${theme}`);
    document.documentElement.classList.add(`theme-${theme}`);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, availableThemes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
