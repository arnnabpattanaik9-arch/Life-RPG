# ⚔️ Life RPG — Gamified Real-World Productivity & Progression Engine

> **Tech Zephyr 4.0 Hackathon Submission**  
> An immersive, tactile, and dopamine-driven Life RPG platform translating real-world task execution into an authentic, server-authoritative virtual progression system.

---

## 🌐 Production Deployments

| Component | Platform | Live URL |
| :--- | :--- | :--- |
| **Frontend Web App** | **Vercel** | [https://life-rpg-xoc-ats.vercel.app](https://life-rpg-xoc-ats.vercel.app) |
| **Production REST API** | **Render** | [https://life-rpg-akex.onrender.com/api](https://life-rpg-akex.onrender.com/api) |
| **Database** | **Neon** | Serverless PostgreSQL (Ohio us-east-2) |
| **GitHub Repository** | **GitHub** | [https://github.com/shubhamohm2001-hue/Life-RPG](https://github.com/shubhamohm2001-hue/Life-RPG) |

---

## 🎯 The Problem

Traditional to-do apps and habit trackers suffer from a fundamental **delayed gratification** dilemma:
1. **Slow Real-World Feedback**: Real-world habits like physical conditioning, deep software engineering, or reading produce tangible results only over months, causing high abandonment rates.
2. **Boring Digital Checklists**: Standard productivity tools treat task completion as binary checkmarks without sensory, emotional, or competitive feedback.
3. **Lack of Progression Context**: Tasks are viewed in isolation rather than contributing to holistically balanced life domains.

---

## 💡 The Solution

**Life RPG** bridges this gap by transforming everyday routines into a living RPG adventure:
- **Instant Dopamine Feedback Loops**: Every completed quest awards floating rewards (`+XP`, `+Gold`), audio synthesizers, celebratory confetti particle bursts, and direct boss raid damage.
- **Server-Authoritative Progression Engine**: Non-linear leveling mechanics prevent client-side spoofing and ensure authentic, verifiable progression.
- **5 Real-World Attributes**: Tasks feed directly into character growth across **Strength**, **Intellect**, **Vitality**, **Agility**, and **Charisma**.
- **Living Virtual Economy**: Earn Gold and rare Gems to purchase weapons, armor, streak freeze shields, and potions in the **Royal Armory**.
- **Cooperative World Raid Encounter**: Battle *"The Procrastination Behemoth"*, a world raid boss whose health depletes with every completed task.

---

## 🕹️ Key Features

- **Non-Linear RPG Progression**: XP curve scaled via $\text{XP Required}(L) = \lfloor 100 \times L^{1.5} \rfloor$, making each subsequent level progressively more demanding and rewarding.
- **Full Quest CRUD Board**: Create, view, filter, edit, and complete tasks across 5 difficulty tiers (*Trivial*, *Easy*, *Medium*, *Hard*, *Epic*) with attribute tagging and recurrence types (`quest` and `daily`).
- **Real-World Attributes Matrix**: Visual breakdown and level tracking for all 5 core attributes with targeted attribute filtering.
- **Consecutive Streak System**: Active streak counter, 7-day visual timeline, compounding XP/Gold multipliers, and streak shield protection.
- **World Raid Boss Encounter**: Real-time boss raid section featuring animated hit reactions, health bar scaling, and victory rewards.
- **Royal Armory & Loadout Vault**: Shop catalog with Weapons, Armor, and Potions conferring passive bonus modifiers with inventory equipping.
- **Tactile Procedural Audio Engine**: Zero external audio assets—100% procedural sound synthesis built with the browser's native **Web Audio API** with instant mute toggle.
- **4 Switchable RPG Visual Themes**: Instant dynamic theme engine featuring **Cyberpunk Neon**, **Arcane Fantasy**, **16-Bit Retro Dungeon**, and **Obsidian Stealth** with customized typography, surface tints, borders, and ambient glow.
- **Accessible Keyboard Navigation**: Global hotkeys (`N` for New Quest, `S` for Armory, `I` for Inventory, `M` for Mute, `Esc` to Close).

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   Vercel Edge Host                     │
│    React 19 + TypeScript + Vite + Tailwind CSS         │
│           State: AuthContext + GameContext             │
│            Procedural Audio (Web Audio API)            │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / REST (Credentials: include)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   Render Web Service                   │
│       Node.js + Express + TypeScript REST API          │
│       - Security: Helmet, CORS, Express-Rate-Limit     │
│       - Auth: Argon2id + Express-Session (connect-pg)  │
│       - Validation: Zod Schemas                        │
│       - Game Engine: Server-Authoritative Progression  │
└───────────────────────────┬────────────────────────────┘
                            │ Prisma ORM (Pooled SSL)
                            ▼
┌────────────────────────────────────────────────────────┐
│               Neon Serverless PostgreSQL               │
│    Tables: User, Character, CharacterStats, Quest,     │
│    QuestCompletion, Habit, FocusSession, Item,         │
│    Inventory, Achievement, UserAchievement, Session    │
└───────────────────────────┘
```

### Frontend Technology
- **Framework**: React 19 (`react`, `react-dom`)
- **Language**: TypeScript 5.7+
- **Build Tool**: Vite 8.3
- **Styling**: Tailwind CSS 3.4 with custom CSS variables / theme engine
- **Icons**: Lucide React
- **Visual FX**: Canvas-Confetti
- **Audio**: Custom Web Audio API procedural synthesizer (`src/services/sound.ts`)

### Backend Technology
- **Runtime & Server**: Node.js 20+ with Express 4.21 (ES Modules)
- **Language**: TypeScript 5.7
- **Database ORM**: Prisma ORM 6.4
- **Database**: PostgreSQL 17 / Neon Serverless PostgreSQL
- **Authentication**: Session-based with `express-session` & `connect-pg-simple` PostgreSQL storage
- **Password Security**: Argon2id (`argon2`) hashing with OWASP-recommended parameters
- **Validation**: Zod 3.24 schemas with Express middleware
- **Security Headers & Protection**: Helmet, CORS with credential validation, Express-Rate-Limit

---

## 🔒 Security & Server-Authoritative Design

- **Server-Authoritative Progression**: All XP gains, gold awards, level-ups, streak calculations, and achievement unlocks are computed and persisted inside PostgreSQL database transactions (`$transaction`). The client cannot manipulate levels or reward payouts.
- **Strict User Data Isolation**: Every database query filters by `userId` resolved from the cryptographically signed session cookie (`liferpg.sid`).
- **Cross-Site Session Protection**: Cookies are configured with `httpOnly: true`, `secure: true`, and `sameSite: 'none'` with `trust proxy: 1` enabled for production reverse proxy environments.
- **Password Hashing**: Passwords are never stored in plaintext and are hashed using Argon2id with 19 MiB memory cost and 2 iterations.
- **Tiered Rate Limiting**: Dedicated rate limiting for authentication endpoints (`/api/auth/*`) to prevent brute-force attacks, plus global rate limiting for general API requests.
- **Strict Input Validation**: All incoming requests are validated against strict Zod schemas with sanitization before touching business logic or database layers.

---

## 🚀 Local Development Setup

### 1. Prerequisites
- **Node.js**: v20+ recommended
- **NPM** (bundled with Node)
- **PostgreSQL**: Local instance or free remote Neon database URL

### 2. Clone the Repository
```bash
git clone https://github.com/shubhamohm2001-hue/Life-RPG.git
cd Life-RPG
```

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
SESSION_SECRET=your-secure-session-secret-key-min-32-chars
DATABASE_URL="postgresql://username:password@localhost:5432/life_rpg?schema=public"
```

Generate Prisma client and start backend:
```bash
npm run build
npm start
```
The API will listen at `http://localhost:5000`.

### 4. Frontend Setup
In a new terminal window at the repository root:
```bash
npm install
cp .env.example .env
```

Configure `.env`:
```env
VITE_USE_MOCK_API=false
VITE_API_URL=http://localhost:5000/api
VITE_APP_ENV=development
```

Start the Vite development server:
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📋 Hackathon Disclosures & Attributions

- **AI Tools Disclosure**: **Antigravity AI (Google DeepMind)** was utilized as an agentic pair programmer for repository inspection, TypeScript debugging, production cross-origin cookie diagnosis, automated test verification via headless browser sessions, and submission documentation.
- **Third-Party Libraries & Frameworks**: Standard open-source libraries were utilized: React, Vite, Tailwind CSS, Lucide React, Canvas-Confetti, Express, Prisma ORM, Argon2, connect-pg-simple, Helmet, CORS, and Zod.
- **UI Template / Boilerplate Disclosure**: **No pre-built UI templates, theme kits, or boilerplate starters were used.** All application UI components, HUD layouts, cards, modals, game HUD styling, and CSS theme tokens were custom crafted for Life RPG.
- **External Hosting & Infrastructure Disclosure**:
  - **Vercel**: Edge static hosting and global CDN for the React frontend application.
  - **Render**: Containerized Linux Web Service hosting the Node.js/Express REST API.
  - **Neon**: Serverless cloud PostgreSQL database with pooled SSL connections.
 
# AI Development Disclosure

## Overview

This project was developed by our team with assistance from AI-based
development tools, primarily Antigravity AI.

The product idea, feature decisions, design direction, and overall
development decisions were determined by our team.

## Use of AI

Antigravity AI was used to assist with the initial frontend skeleton,
frontend implementation, code generation, debugging, refactoring,
and development iterations.

The generated code was reviewed and modified by our team according
to our requirements.

## Team Contributions

Our team was responsible for:

- Ideating the original product concept
- Deciding the features and functionality
- Designing the product flow
- Modifying and refining the frontend
- Implementing the database and SQL
- Integrating the database/backend
- Testing and debugging the application
- Making final implementation decisions

AI was used as a development assistant, while the team retained
responsibility for the final product and implementation.

---

## 🛡️ License
MIT License. Developed for **Tech Zephyr 4.0**.
