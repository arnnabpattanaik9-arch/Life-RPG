import React from 'react';
import { Command, ShieldCheck, Sparkles, Terminal, Keyboard } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/90 py-8 text-slate-400 text-xs mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Keyboard Shortcuts Strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300 font-bold">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span>Tactile Keyboard Shortcuts:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px]">
            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <kbd className="font-mono text-amber-400 font-bold">N</kbd> New Quest
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <kbd className="font-mono text-amber-400 font-bold">S</kbd> Armory
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <kbd className="font-mono text-amber-400 font-bold">I</kbd> Inventory
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <kbd className="font-mono text-amber-400 font-bold">M</kbd> Mute Audio
            </span>
            <span className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded border border-slate-700">
              <kbd className="font-mono text-amber-400 font-bold">Esc</kbd> Close Dialog
            </span>
          </div>
        </div>

        {/* Full-Stack Backend Readiness Architecture Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-300 font-semibold">
              Full-Stack Ready Architecture
            </span>
            <span className="text-slate-400">
              • Unified <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded font-mono">api.ts</code> client with isolated data adapter
            </span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>WCAG Accessible (Keyboard & Screen-Reader)</span>
            <span>•</span>
            <span>Non-Linear Progression Engine</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center text-slate-400 text-[11px] pt-4 border-t border-slate-800/60">
          Life RPG — Gamified Real-World Productivity System • Level up code, iron, mind, and habits.
        </div>
      </div>

      {/* Scrolling Team Credits Ticker */}
      <div className="w-full overflow-hidden bg-slate-900/70 border-t border-amber-500/20 py-2 mt-4">
        <style>{`
          @keyframes marquee-scroll {
            0%   { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .marquee-track {
            display: inline-block;
            white-space: nowrap;
            animation: marquee-scroll 18s linear infinite;
          }
          .marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="marquee-track text-[12px] font-semibold tracking-wide">
          <span className="text-amber-400">⚔️ This Project is Made by —</span>
          <span className="text-white mx-3">Ayushman Pattnaik</span>
          <span className="text-amber-500/60 mx-1">✦</span>
          <span className="text-cyan-300 mx-3">Arnnab Pattanaik</span>
          <span className="text-amber-500/60 mx-1">✦</span>
          <span className="text-purple-300 mx-3">Bishnu Prasad Senapati</span>
          <span className="text-amber-500/60 mx-1">✦</span>
          <span className="text-emerald-300 mx-3">Snehal Priyadarshi</span>
          <span className="text-amber-400 mx-4">🏆 Tech Zephyr 4.0</span>
        </div>
      </div>
    </footer>
  );
};
