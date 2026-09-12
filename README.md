# ⚔️ Life RPG — Gamified Real-World Productivity & Progression Engine

An immersive, tactile, and dopamine-rich Life RPG web application translating mundane real-world tasks into a gamified virtual progression system. 

Built with **React 19, TypeScript, Vite, Tailwind CSS, Web Audio API, and Canvas Confetti**.

---

## 🌟 The Core Philosophy

Traditional to-do apps and habit trackers suffer from a **delayed gratification** problem: reading a book, going to the gym, or writing code takes months to produce visible results. 

**Life RPG** bridges this gap by introducing:
- **Instant Dopamine Feedback Loops:** Every completed task awards visual floating numbers (`+XP`, `+Gold`), audio chimes, particle confetti, and boss damage strikes.
- **Non-Linear Progression Engine:** Progression scales exponentially where each subsequent level requires more XP than the last.
- **Real-World Attributes:** Tasks directly strengthen one of five character attributes: **Strength**, **Intellect**, **Vitality**, **Agility**, and **Charisma**.
- **Living Virtual Economy:** Earn Gold and rare Gems to purchase weapons, armor, streak freeze shields, and focus elixirs in the **Royal Armory**.
- **World Raid Boss Encounter:** *"The Procrastination Behemoth"* absorbs damage with every completed quest.

---

## 🕹️ Core Systems & Feature Matrix

| System | Implementation Details |
| :--- | :--- |
| **RPG Progression Engine** | Formula: $\text{XP Required}(L) = \lfloor 100 \times L^{1.5} \rfloor$. Dynamic HP, MP, and Level gauges with celebration ascension modals. |
| **Quests & Habits (CRUD)** | Full Create, Read, Update, and Delete with difficulty tiers (*Trivial*, *Easy*, *Medium*, *Hard*, *Epic*), attribute tagging, and recurrence. |
| **Attributes Matrix** | 5 core attributes (**Strength**, **Intellect**, **Vitality**, **Agility**, **Charisma**) with individual levels, progress bars, and quest filtering. |
| **Consecutive Streaks** | Consecutive days tracker, animated fire counter, 7-day visual timeline, streak shields, and compounding passive reward multipliers. |
| **World Boss Raid** | Interactive raid encounter (*The Procrastination Behemoth*) taking damage upon completing tasks or executing direct strikes. |
| **Armory & Economy** | Virtual merchant catalog with Weapons, Armor, Potions, and Titles. Equipped items confer passive XP/Gold multipliers. |
| **Tactile Sound & FX** | Zero external audio dependencies: 100% procedural synthesis via the **Web Audio API** with instant navbar mute toggle. |
| **Theme Engine** | 4 switchable visual themes: **Cyberpunk Neon**, **Arcane Fantasy**, **16-Bit Retro Dungeon**, and **Obsidian Stealth**. |
| **Accessibility & Hotkeys** | Full keyboard navigation (`N` for New Quest, `S` for Armory, `I` for Inventory, `M` for Mute, `Esc` to Close). |

---

## 🏗️ Architecture & Backend-Ready Integration

The frontend is architected with a decoupled **API Client Layer** (`src/services/api.ts`).

- **Frontend-Only Mode (Active):** Uses `mockStorage.ts` to simulate database CRUD, sessions, inventory, and realistic simulated network latency.
- **Backend / Database Connection (Next Phase):** Connecting your Node.js, Express, FastAPI, Django, or PostgreSQL backend only requires switching the environment flag:
  ```env
  VITE_USE_MOCK_API=false
  VITE_API_URL=http://localhost:5000/api
  ```
All frontend request schemas, response models, and TypeScript interfaces match standard REST API contracts 1-to-1.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+ recommended
- **NPM** or **PNPM** / **Yarn**

### 2. Installation
Clone the repository and install dependencies:
```bash
cd life-rpg-frontend
npm install
```

### 3. Environment Configuration
Copy the template environment file:
```bash
cp .env.example .env
```
Default configuration:
```env
VITE_USE_MOCK_API=true
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```
Creates an optimized production bundle in the `dist/` directory ready for deployment on Vercel, Netlify, Render, or AWS.

---

## ⌨️ Tactile Keyboard Shortcuts

- `[N]` — Forge a New Quest Directive
- `[S]` — Open the Royal Armory & Shop
- `[I]` — Open Hero Vault & Loadout
- `[M]` — Toggle Procedural Sound Synthesizer (Mute / Unmute)
- `[Esc]` — Close Active Modals

---

## 🛡️ License
MIT License. Built for the Life RPG Challenge.
