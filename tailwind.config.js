/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        rpg: {
          dark: '#090a0f',
          surface: '#11141f',
          card: '#161b2b',
          border: '#242d45',
          gold: '#f59e0b',
          xp: '#3b82f6',
          hp: '#ef4444',
          mana: '#8b5cf6',
          strength: '#f97316',
          intellect: '#06b6d4',
          vitality: '#10b981',
          agility: '#eab308',
          charisma: '#ec4899',
        },
      },
      fontFamily: {
        rpg: ['"Cinzel"', '"Cinzel Decorative"', 'serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
        cyber: ['"Rajdhani"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.5)',
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.5)',
        'glow-purple': '0 0 20px -3px rgba(168, 85, 247, 0.5)',
        'glow-red': '0 0 20px -3px rgba(239, 68, 68, 0.5)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-4px)' },
          '40%, 80%': { transform: 'translateX(4px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
