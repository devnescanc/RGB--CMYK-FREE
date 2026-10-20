/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Download, Sliders, Layers, Palette, FileCode2, HelpCircle } from 'lucide-react';

interface TopBarProps {
  activeTab: 'converter' | 'artboard' | 'palettes' | 'plugin' | 'advisor';
  setActiveTab: (tab: 'converter' | 'artboard' | 'palettes' | 'plugin' | 'advisor') => void;
  onDownloadScript: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ activeTab, setActiveTab, onDownloadScript }) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-fuchsia-500 to-amber-400 p-[1.5px] shrink-0">
          <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center font-bold text-xs tracking-wider text-cyan-400">
            Ai
          </div>
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          Chromartisan <span className="text-slate-400 font-normal">RGB-CMYK</span>
        </span>
      </div>

      {/* Zone 2: 4–5 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
        <button
          onClick={() => setActiveTab('converter')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'converter' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Conversor Preciso</span>
        </button>

        <button
          onClick={() => setActiveTab('artboard')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'artboard' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Simulador & Placas</span>
        </button>

        <button
          onClick={() => setActiveTab('palettes')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'palettes' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Gestor de Muestras</span>
        </button>

        <button
          onClick={() => setActiveTab('plugin')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'plugin' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Plugin Ejecutable .JSX</span>
        </button>

        <button
          onClick={() => setActiveTab('advisor')}
          className={`flex items-center gap-1.5 py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
            activeTab === 'advisor' ? 'border-cyan-400 text-cyan-400 font-semibold' : 'border-transparent text-slate-300 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Asesor Pre-Prensa</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onDownloadScript}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-lg transition-all shadow-sm hover:shadow active:scale-95 whitespace-nowrap shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Descargar Plugin .JSX</span>
        </button>
      </div>
    </header>
  );
};
