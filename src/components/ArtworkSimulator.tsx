/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ConversionSettings,
  CMYKColor,
} from '../types/color';
import {
  convertRGBToCMYK,
  hexToRgb,
  ICC_PROFILES,
} from '../utils/colorScience';
import {
  Eye,
  SlidersHorizontal,
  AlertTriangle,
  Layers,
  Sparkles,
  Printer,
  Palette,
} from 'lucide-react';

interface ArtworkSimulatorProps {
  settings: ConversionSettings;
  onApplyColorToStudio: (hex: string) => void;
}

export const ArtworkSimulator: React.FC<ArtworkSimulatorProps> = ({
  settings,
  onApplyColorToStudio,
}) => {
  type ViewMode = 'split' | 'rgb_only' | 'cmyk_only' | 'gamut_warning' | 'plates';
  type PlateSolo = 'all' | 'c' | 'm' | 'y' | 'k';

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [sliderPosition, setSliderPosition] = useState<number>(50); // 0 to 100%
  const [activePlate, setActivePlate] = useState<PlateSolo>('all');
  const [selectedArtwork, setSelectedArtwork] = useState<'packaging' | 'tech_logo' | 'editorial'>(
    'packaging'
  );

  const currentProfile = ICC_PROFILES[settings.cmykProfile];

  // Base colors for the artwork items
  const artColors = {
    cyanVibrant: '#00F0FF',
    magentaVivid: '#FF007F',
    yellowNeon: '#FFEA00',
    deepNavy: '#0F172A',
    richGreen: '#10B981',
    accentOrange: '#FF5500',
    pureWhite: '#FFFFFF',
    pureBlack: '#000000',
  };

  // Convert all artwork colors through the engine
  const convertedArt = Object.entries(artColors).reduce(
    (acc, [key, hex]) => {
      const rgb = hexToRgb(hex);
      const res = convertRGBToCMYK(rgb, settings);
      acc[key] = {
        originalHex: hex,
        cmyk: res.targetCMYK,
        simulatedHex: res.simulatedHex,
        deltaE: res.deltaE00,
        isOutOfGamut: res.isOutOfGamut,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        originalHex: string;
        cmyk: CMYKColor;
        simulatedHex: string;
        deltaE: number;
        isOutOfGamut: boolean;
      }
    >
  );

  // Helper for rendering plates
  const getPlateColor = (cmyk: CMYKColor) => {
    if (activePlate === 'all') return null;

    // In plate view, render density in grayscale or plate ink tint
    let density = 0;
    if (activePlate === 'c') density = cmyk.c;
    if (activePlate === 'm') density = cmyk.m;
    if (activePlate === 'y') density = cmyk.y;
    if (activePlate === 'k') density = cmyk.k;

    const val = Math.round(255 * (1 - density / 100));
    return `rgb(${val}, ${val}, ${val})`;
  };

  // Helper to get fill or stroke based on current viewMode
  const resolveColor = (key: keyof typeof artColors, isGamutOverlay = false) => {
    const item = convertedArt[key];
    if (!item) return '#888888';

    if (viewMode === 'plates') {
      const plateCol = getPlateColor(item.cmyk);
      return plateCol || item.simulatedHex;
    }

    if (viewMode === 'gamut_warning' && item.isOutOfGamut && isGamutOverlay) {
      return 'url(#gamutWarningPattern)';
    }

    if (viewMode === 'cmyk_only') {
      return item.simulatedHex;
    }

    return item.originalHex;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header y Selector de Modos de Visualización */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Simulador de Mesa de Trabajo de Illustrator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Inspecciona el comportamiento de gráficos vectoriales al convertir de RGB a CMYK bajo el perfil{' '}
              <span className="text-cyan-300 font-medium">{currentProfile.name}</span>.
            </p>
          </div>

          {/* Segmented Control de Modos de Vista */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Comparativa Dividida (Slider)
            </button>
            <button
              onClick={() => setViewMode('rgb_only')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'rgb_only'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              RGB Monitor
            </button>
            <button
              onClick={() => setViewMode('cmyk_only')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'cmyk_only'
                  ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              CMYK Impreso
            </button>
            <button
              onClick={() => setViewMode('gamut_warning')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'gamut_warning'
                  ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Aviso de Gama (Ctrl+Shift+Y)</span>
            </button>
            <button
              onClick={() => setViewMode('plates')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'plates'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Printer className="w-3 h-3 text-emerald-400" />
              <span>Placas CTP</span>
            </button>
          </div>
        </div>

        {/* Sub-controles según el modo */}
        {viewMode === 'split' && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Arrastra el control para comparar: Izquierda = RGB Original | Derecha = CMYK Simulado</span>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-64">
              <span className="font-mono text-[11px] text-slate-300">Posición: {sliderPosition}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPosition}
                onChange={(e) => setSliderPosition(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}

        {viewMode === 'plates' && (
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Inspección de película de planchas offset (Densidad de tinta por canal):
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivePlate('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  activePlate === 'all'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white'
                }`}
              >
                Todas las Placas
              </button>
              <button
                onClick={() => setActivePlate('c')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  activePlate === 'c'
                    ? 'bg-cyan-900 text-cyan-200 border border-cyan-700'
                    : 'bg-slate-950 text-cyan-400 hover:text-cyan-300'
                }`}
              >
                Solo Cian (C)
              </button>
              <button
                onClick={() => setActivePlate('m')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  activePlate === 'm'
                    ? 'bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-700'
                    : 'bg-slate-950 text-fuchsia-400 hover:text-fuchsia-300'
                }`}
              >
                Solo Magenta (M)
              </button>
              <button
                onClick={() => setActivePlate('y')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  activePlate === 'y'
                    ? 'bg-amber-900 text-amber-200 border border-amber-700'
                    : 'bg-slate-950 text-amber-400 hover:text-amber-300'
                }`}
              >
                Solo Amarillo (Y)
              </button>
              <button
                onClick={() => setActivePlate('k')}
                className={`px-2.5 py-1 rounded text-xs font-medium ${
                  activePlate === 'k'
                    ? 'bg-slate-600 text-white border border-slate-400'
                    : 'bg-slate-950 text-slate-300 hover:text-white'
                }`}
              >
                Solo Negro (K)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Artboard Canvas Container */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-2xl p-6 lg:p-10 shadow-xl overflow-hidden flex flex-col items-center justify-center">
        {/* Illustrator Artboard Frame */}
        <div className="relative w-full max-w-4xl aspect-[16/10] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-neutral-700">
          {/* SVG Artwork Definition */}
          <svg
            className="w-full h-full"
            viewBox="0 0 800 500"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Gamut Warning Hatching Pattern */}
              <pattern
                id="gamutWarningPattern"
                width="12"
                height="12"
                patternUnits="userSpaceOnUse"
                patternTransform="rotate(45)"
              >
                <rect width="6" height="12" fill="#71717A" />
                <rect x="6" width="6" height="12" fill="#E4E4E7" />
              </pattern>

              {/* Clip path for split view */}
              <clipPath id="splitClipLeft">
                <rect x="0" y="0" width={`${(sliderPosition / 100) * 800}`} height="500" />
              </clipPath>
              <clipPath id="splitClipRight">
                <rect
                  x={`${(sliderPosition / 100) * 800}`}
                  y="0"
                  width={`${800 - (sliderPosition / 100) * 800}`}
                  height="500"
                />
              </clipPath>

              {/* Linear Gradients */}
              <linearGradient id="gradRGB" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={artColors.cyanVibrant} />
                <stop offset="50%" stopColor={artColors.magentaVivid} />
                <stop offset="100%" stopColor={artColors.yellowNeon} />
              </linearGradient>

              <linearGradient id="gradCMYK" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={convertedArt.cyanVibrant.simulatedHex} />
                <stop offset="50%" stopColor={convertedArt.magentaVivid.simulatedHex} />
                <stop offset="100%" stopColor={convertedArt.yellowNeon.simulatedHex} />
              </linearGradient>
            </defs>

            {/* ARTBOARD CONTENT - Layer 1: Left / RGB layer */}
            <g clipPath={viewMode === 'split' ? 'url(#splitClipLeft)' : undefined}>
              {/* Background Plate */}
              <rect width="800" height="500" fill="#0F172A" />

              {/* Subtle grid lines like Illustrator workspace */}
              <g opacity="0.12" stroke="#FFFFFF" strokeWidth="1">
                {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} />
                ))}
                {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="500" />
                ))}
              </g>

              {/* Hero Geometric Composition */}
              {/* Central Glowing Shield / Packaging Mockup */}
              <rect
                x="80"
                y="60"
                width="300"
                height="380"
                rx="16"
                fill="#1E293B"
                stroke={artColors.cyanVibrant}
                strokeWidth="2.5"
              />

              {/* Gradient Banner */}
              <path
                d="M 100 100 L 360 100 L 360 180 L 100 210 Z"
                fill="url(#gradRGB)"
              />

              {/* Vibrant Badge Emblem */}
              <circle
                cx="230"
                cy="270"
                r="65"
                fill={artColors.magentaVivid}
              />
              <circle
                cx="230"
                cy="270"
                r="45"
                fill="#0F172A"
                stroke={artColors.yellowNeon}
                strokeWidth="4"
              />
              <polygon
                points="230,240 240,262 265,263 245,278 252,300 230,285 208,300 215,278 195,263 220,262"
                fill={artColors.cyanVibrant}
              />

              {/* Typography */}
              <text
                x="230"
                y="380"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="16"
                fontWeight="bold"
                letterSpacing="2"
              >
                STUDIO PACKAGING
              </text>
              <text
                x="230"
                y="405"
                textAnchor="middle"
                fill={artColors.yellowNeon}
                fontSize="12"
                fontWeight="600"
                letterSpacing="1.5"
              >
                100% VECTOR ARTWORK
              </text>

              {/* Right Side: Identity Cards & Swatches */}
              <rect
                x="420"
                y="60"
                width="300"
                height="170"
                rx="12"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <text
                x="440"
                y="95"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="bold"
              >
                Paleta de Marca Corporativa
              </text>
              <text
                x="440"
                y="115"
                fill="#94A3B8"
                fontSize="11"
              >
                Modo de Color Origen: sRGB (Web/Digital)
              </text>

              {/* Color Swatch Bars */}
              <rect x="440" y="135" width="50" height="70" rx="6" fill={artColors.cyanVibrant} />
              <rect x="500" y="135" width="50" height="70" rx="6" fill={artColors.magentaVivid} />
              <rect x="560" y="135" width="50" height="70" rx="6" fill={artColors.yellowNeon} />
              <rect x="620" y="135" width="50" height="70" rx="6" fill={artColors.accentOrange} />

              {/* Bottom Card: Rich Black vs 100% K Demonstration */}
              <rect
                x="420"
                y="250"
                width="300"
                height="190"
                rx="12"
                fill="#1E293B"
                stroke="#334155"
                strokeWidth="1.5"
              />
              <text
                x="440"
                y="285"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="bold"
              >
                Simulación Tipográfica & Trazo
              </text>

              {/* Neon Text Sample */}
              <text
                x="440"
                y="330"
                fill={artColors.cyanVibrant}
                fontSize="24"
                fontWeight="900"
                letterSpacing="1"
              >
                CYAN VIBRANTE
              </text>
              <text
                x="440"
                y="365"
                fill={artColors.magentaVivid}
                fontSize="22"
                fontWeight="800"
              >
                MAGENTA ULTRA
              </text>
              <text
                x="440"
                y="400"
                fill="#CBD5E1"
                fontSize="12"
              >
                Texto fino 100% K para evitar fuera de registro
              </text>
            </g>

            {/* ARTBOARD CONTENT - Layer 2: Right / Converted CMYK layer (used in Split view) */}
            {viewMode === 'split' && (
              <g clipPath="url(#splitClipRight)">
                {/* Background Plate with paper texture tone */}
                <rect width="800" height="500" fill="#0D1525" />

                {/* Grid */}
                <g opacity="0.10" stroke="#FFFFFF" strokeWidth="1">
                  {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((y) => (
                    <line key={y} x1="0" y1={y} x2="800" y2={y} />
                  ))}
                  {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                    <line key={x} x1={x} y1="0" x2={x} y2="500" />
                  ))}
                </g>

                {/* Converted Shield */}
                <rect
                  x="80"
                  y="60"
                  width="300"
                  height="380"
                  rx="16"
                  fill="#1A2434"
                  stroke={convertedArt.cyanVibrant.simulatedHex}
                  strokeWidth="2.5"
                />

                {/* Converted Gradient Banner */}
                <path
                  d="M 100 100 L 360 100 L 360 180 L 100 210 Z"
                  fill="url(#gradCMYK)"
                />

                {/* Converted Emblem */}
                <circle
                  cx="230"
                  cy="270"
                  r="65"
                  fill={convertedArt.magentaVivid.simulatedHex}
                />
                <circle
                  cx="230"
                  cy="270"
                  r="45"
                  fill="#0D1525"
                  stroke={convertedArt.yellowNeon.simulatedHex}
                  strokeWidth="4"
                />
                <polygon
                  points="230,240 240,262 265,263 245,278 252,300 230,285 208,300 215,278 195,263 220,262"
                  fill={convertedArt.cyanVibrant.simulatedHex}
                />

                {/* Typography */}
                <text
                  x="230"
                  y="380"
                  textAnchor="middle"
                  fill="#F1F5F9"
                  fontSize="16"
                  fontWeight="bold"
                  letterSpacing="2"
                >
                  STUDIO PACKAGING
                </text>
                <text
                  x="230"
                  y="405"
                  textAnchor="middle"
                  fill={convertedArt.yellowNeon.simulatedHex}
                  fontSize="12"
                  fontWeight="600"
                  letterSpacing="1.5"
                >
                  100% VECTOR ARTWORK
                </text>

                {/* Right Card Converted */}
                <rect
                  x="420"
                  y="60"
                  width="300"
                  height="170"
                  rx="12"
                  fill="#1A2434"
                  stroke="#2E3A4E"
                  strokeWidth="1.5"
                />
                <text
                  x="440"
                  y="95"
                  fill="#F1F5F9"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Paleta de Marca Corporativa
                </text>
                <text
                  x="440"
                  y="115"
                  fill="#8191A7"
                  fontSize="11"
                >
                  Modo de Color Destino: CMYK ({currentProfile.id})
                </text>

                {/* Converted Swatches */}
                <rect x="440" y="135" width="50" height="70" rx="6" fill={convertedArt.cyanVibrant.simulatedHex} />
                <rect x="500" y="135" width="50" height="70" rx="6" fill={convertedArt.magentaVivid.simulatedHex} />
                <rect x="560" y="135" width="50" height="70" rx="6" fill={convertedArt.yellowNeon.simulatedHex} />
                <rect x="620" y="135" width="50" height="70" rx="6" fill={convertedArt.accentOrange.simulatedHex} />

                {/* Bottom Card Converted */}
                <rect
                  x="420"
                  y="250"
                  width="300"
                  height="190"
                  rx="12"
                  fill="#1A2434"
                  stroke="#2E3A4E"
                  strokeWidth="1.5"
                />
                <text
                  x="440"
                  y="285"
                  fill="#F1F5F9"
                  fontSize="14"
                  fontWeight="bold"
                >
                  Simulación Tipográfica & Trazo
                </text>

                <text
                  x="440"
                  y="330"
                  fill={convertedArt.cyanVibrant.simulatedHex}
                  fontSize="24"
                  fontWeight="900"
                  letterSpacing="1"
                >
                  CYAN VIBRANTE
                </text>
                <text
                  x="440"
                  y="365"
                  fill={convertedArt.magentaVivid.simulatedHex}
                  fontSize="22"
                  fontWeight="800"
                >
                  MAGENTA ULTRA
                </text>
                <text
                  x="440"
                  y="400"
                  fill="#CBD5E1"
                  fontSize="12"
                >
                  Texto fino 100% K para evitar fuera de registro
                </text>
              </g>
            )}

            {/* GAMUT WARNING OVERLAY (When ViewMode === 'gamut_warning') */}
            {viewMode === 'gamut_warning' && (
              <g>
                {/* Out of gamut parts are hatched in warning pattern */}
                <rect
                  x="80"
                  y="60"
                  width="300"
                  height="380"
                  rx="16"
                  fill="none"
                  stroke="url(#gamutWarningPattern)"
                  strokeWidth="6"
                />
                <circle cx="230" cy="270" r="65" fill="url(#gamutWarningPattern)" />
                <polygon
                  points="230,240 240,262 265,263 245,278 252,300 230,285 208,300 215,278 195,263 220,262"
                  fill="url(#gamutWarningPattern)"
                />
                <rect x="440" y="135" width="50" height="70" rx="6" fill="url(#gamutWarningPattern)" />
                <rect x="500" y="135" width="50" height="70" rx="6" fill="url(#gamutWarningPattern)" />
                <rect x="560" y="135" width="50" height="70" rx="6" fill="url(#gamutWarningPattern)" />
              </g>
            )}

            {/* Split Divider Line with Interactive Handle */}
            {viewMode === 'split' && (
              <g>
                <line
                  x1={(sliderPosition / 100) * 800}
                  y1="0"
                  x2={(sliderPosition / 100) * 800}
                  y2="500"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
                <circle
                  cx={(sliderPosition / 100) * 800}
                  cy="250"
                  r="14"
                  fill="#0F172A"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                />
                {/* Left/Right arrows inside divider knob */}
                <path
                  d={`M ${(sliderPosition / 100) * 800 - 5} 250 L ${
                    (sliderPosition / 100) * 800 - 2
                  } 247 L ${(sliderPosition / 100) * 800 - 2} 253 Z`}
                  fill="#38BDF8"
                />
                <path
                  d={`M ${(sliderPosition / 100) * 800 + 5} 250 L ${
                    (sliderPosition / 100) * 800 + 2
                  } 247 L ${(sliderPosition / 100) * 800 + 2} 253 Z`}
                  fill="#38BDF8"
                />
              </g>
            )}
          </svg>

          {/* Floating Badges */}
          {viewMode === 'split' && (
            <>
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-xs text-white text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-700 pointer-events-none">
                Original RGB
              </div>
              <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-xs text-cyan-300 text-[11px] font-mono px-2.5 py-1 rounded-md border border-slate-700 pointer-events-none">
                CMYK {currentProfile.id}
              </div>
            </>
          )}

          {viewMode === 'gamut_warning' && (
            <div className="absolute bottom-4 left-4 bg-amber-950/90 backdrop-blur-xs text-amber-200 text-xs px-3 py-1.5 rounded-lg border border-amber-700 flex items-center gap-2">
              <div className="w-4 h-4 bg-zinc-300 rounded-sm border border-zinc-500 overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #71717a 0, #71717a 3px, #e4e4e7 3px, #e4e4e7 6px)' }} />
              <span>Zonas con trama rayada: No imprimibles en cuatricromía CMYK estándar sin pérdida de tono</span>
            </div>
          )}
        </div>
      </div>

      {/* Bar de Elementos Muestreados del Arte */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Muestreo de Tintas del Arte Activo
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Haz clic en cualquier color para cargarlo en el Conversor Preciso
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Object.entries(convertedArt).map(([key, item]) => (
            <button
              key={key}
              onClick={() => onApplyColorToStudio(item.originalHex)}
              className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 hover:border-cyan-500 transition-all text-left group flex flex-col justify-between space-y-2 cursor-pointer"
            >
              {/* Double color chip */}
              <div className="w-full h-8 rounded flex overflow-hidden border border-black/40">
                <div
                  className="w-1/2 h-full"
                  style={{ backgroundColor: item.originalHex }}
                  title="RGB Monitor"
                />
                <div
                  className="w-1/2 h-full"
                  style={{ backgroundColor: item.simulatedHex }}
                  title="CMYK Impreso"
                />
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] font-mono font-medium text-slate-200 block truncate">
                  {item.originalHex}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 block truncate">
                  C:{item.cmyk.c} M:{item.cmyk.m}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 block truncate">
                  Y:{item.cmyk.y} K:{item.cmyk.k}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span
                  className={`font-mono font-bold ${
                    item.isOutOfGamut ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  ΔE {item.deltaE}
                </span>
                <span className="text-slate-500 group-hover:text-cyan-400">Editar</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
