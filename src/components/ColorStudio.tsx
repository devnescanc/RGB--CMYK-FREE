/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  RGBColor,
  ConversionSettings,
  ConversionResult,
  CMYKProfileType,
  RenderingIntent,
  GCRLevel,
} from '../types/color';
import { ICC_PROFILES, hexToRgb, rgbToHex } from '../utils/colorScience';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Plus,
  ArrowRight,
  Info,
  Sparkles,
  RotateCcw,
} from 'lucide-react';

interface ColorStudioProps {
  currentRgb: RGBColor;
  setCurrentRgb: (rgb: RGBColor) => void;
  settings: ConversionSettings;
  setSettings: React.Dispatch<React.SetStateAction<ConversionSettings>>;
  conversionResult: ConversionResult;
  onAddSwatch: (name: string, hex: string) => void;
}

export const ColorStudio: React.FC<ColorStudioProps> = ({
  currentRgb,
  setCurrentRgb,
  settings,
  setSettings,
  conversionResult,
  onAddSwatch,
}) => {
  const [hexInput, setHexInput] = useState<string>(conversionResult.sourceHex);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [swatchNameInput, setSwatchNameInput] = useState<string>('Color Corporativo');

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);
    if (/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(val)) {
      setCurrentRgb(hexToRgb(val));
    }
  };

  const handleRgbSlider = (channel: keyof RGBColor, value: number) => {
    const newRgb = { ...currentRgb, [channel]: value };
    setCurrentRgb(newRgb);
    setHexInput(rgbToHex(newRgb));
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const currentProfile = ICC_PROFILES[settings.cmykProfile];
  const { targetCMYK, deltaE00, isOutOfGamut, totalInkCoverage } = conversionResult;

  // Quick test color chips
  const quickTestColors = [
    { label: 'Cyan Web', hex: '#00F0FF' },
    { label: 'Magenta Neón', hex: '#FF007F' },
    { label: 'Lima Flúor', hex: '#39FF14' },
    { label: 'Violeta Eléctrico', hex: '#7928CA' },
    { label: 'Azul Real', hex: '#0055FF' },
    { label: 'Naranja Fuego', hex: '#FF5500' },
    { label: 'Oro Metálico', hex: '#D4AF37' },
    { label: 'Negro 0,0,0', hex: '#000000' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* Columna Izquierda: Inspector y Controles de Color (5 Cols) */}
      <div className="lg:col-span-5 space-y-6">
        {/* Tarjeta de Comparativa Visual */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-200">Comparativa Espectral</span>
            <div className="flex items-center gap-2">
              <span>RGB Monitor</span>
              <span aria-hidden="true">vs</span>
              <span>CMYK Impreso</span>
            </div>
          </div>

          {/* Split Color Swatch Box */}
          <div className="relative h-36 rounded-lg overflow-hidden border border-slate-700 shadow-inner flex">
            {/* Izquierda: RGB Original en pantalla */}
            <div
              className="w-1/2 h-full relative transition-colors duration-200 flex flex-col justify-end p-3 text-left"
              style={{ backgroundColor: conversionResult.sourceHex }}
            >
              <div className="bg-slate-950/75 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded w-fit font-mono font-medium">
                RGB {conversionResult.sourceHex}
              </div>
            </div>

            {/* Centro: Línea de corte */}
            <div className="w-[2px] bg-slate-950 h-full relative z-10 shadow-sm" />

            {/* Derecha: CMYK Simulado en papel */}
            <div
              className="w-1/2 h-full relative transition-colors duration-200 flex flex-col justify-end items-end p-3 text-right"
              style={{ backgroundColor: conversionResult.simulatedHex }}
            >
              <div className="bg-slate-950/75 backdrop-blur-xs text-white text-[11px] px-2 py-0.5 rounded w-fit font-mono font-medium">
                CMYK Simulado {conversionResult.simulatedHex}
              </div>
            </div>
          </div>

          {/* Estado de Delta-E */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              {deltaE00 < 2.0 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : deltaE00 < 3.2 ? (
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div>
                <span className="font-medium text-slate-200">
                  {deltaE00 < 1.0
                    ? 'Fidelidad Máxima (Imperceptible)'
                    : deltaE00 < 2.0
                    ? 'Fidelidad Comercial Muy Alta'
                    : deltaE00 < 3.2
                    ? 'Tolerancia Offset Aceptable'
                    : 'Divergencia Fuera de Gama'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {isOutOfGamut
                    ? 'El color supera el límite físico del perfil de tintas.'
                    : 'Dentro del volumen de reproducción imprimible.'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold font-mono text-white tabular-nums">
                ΔE₀₀ {deltaE00}
              </span>
            </div>
          </div>

          {/* Quick Color Presets Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400">Probar colores habituales:</span>
            <div className="flex flex-wrap gap-1.5">
              {quickTestColors.map((q) => (
                <button
                  key={q.hex}
                  onClick={() => {
                    setCurrentRgb(hexToRgb(q.hex));
                    setHexInput(q.hex);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-colors border border-slate-700/60"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/40 shrink-0"
                    style={{ backgroundColor: q.hex }}
                  />
                  <span>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canales RGB y Selector Hex */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Entrada de Color RGB
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">HEX:</span>
              <input
                type="text"
                value={hexInput}
                onChange={handleHexChange}
                maxLength={7}
                className="w-24 px-2 py-1 text-xs font-mono font-semibold bg-slate-950 border border-slate-700 rounded text-cyan-300 focus:outline-none focus:border-cyan-400 uppercase"
              />
            </div>
          </div>

          {/* Sliders R, G, B */}
          <div className="space-y-3">
            {/* Rojo */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span className="text-rose-400 font-semibold">R (Rojo)</span>
                <span className="tabular-nums text-slate-200">{currentRgb.r}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.r}
                onChange={(e) => handleRgbSlider('r', parseInt(e.target.value, 10))}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Verde */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span className="text-emerald-400 font-semibold">G (Verde)</span>
                <span className="tabular-nums text-slate-200">{currentRgb.g}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.g}
                onChange={(e) => handleRgbSlider('g', parseInt(e.target.value, 10))}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Azul */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span className="text-blue-400 font-semibold">B (Azul)</span>
                <span className="tabular-nums text-slate-200">{currentRgb.b}</span>
              </div>
              <input
                type="range"
                min="0"
                max="255"
                value={currentRgb.b}
                onChange={(e) => handleRgbSlider('b', parseInt(e.target.value, 10))}
                className="w-full accent-blue-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Coordenadas CIE L*a*b* */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>CIE L*a*b* Origen:</span>
            <span className="text-slate-200 tabular-nums">
              L: {Math.round(conversionResult.sourceLab.l)} / a: {Math.round(conversionResult.sourceLab.a)} / b: {Math.round(conversionResult.sourceLab.b)}
            </span>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Parámetros ICC y Salida CMYK Precisa (7 Cols) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Resultado Numérico CMYK y Separación de Tintas */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Resultado de Separación CMYK
              </h2>
              <p className="text-xs text-slate-400">
                Calculado para: <span className="text-cyan-300 font-medium">{currentProfile.name}</span>
              </p>
            </div>

            {/* Botón copiar valores */}
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleCopy(
                    `C:${targetCMYK.c} M:${targetCMYK.m} Y:${targetCMYK.y} K:${targetCMYK.k}`,
                    'cmyk'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess === 'cmyk' ? '¡Copiado!' : 'Copiar CMYK'}</span>
              </button>

              <button
                onClick={() =>
                  handleCopy(
                    `app.activeDocument.defaultFillColor = new CMYKColor(); app.activeDocument.defaultFillColor.cyan = ${targetCMYK.c}; app.activeDocument.defaultFillColor.magenta = ${targetCMYK.m}; app.activeDocument.defaultFillColor.yellow = ${targetCMYK.y}; app.activeDocument.defaultFillColor.black = ${targetCMYK.k};`,
                    'jsx'
                  )
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
              >
                <span>{copySuccess === 'jsx' ? '¡Código Copiado!' : 'Copiar JSX'}</span>
              </button>
            </div>
          </div>

          {/* 4 Grandes Tarjetas de Tintas C, M, Y, K */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Cian */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-cyan-900/40 relative overflow-hidden">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-cyan-400 tracking-wider">CIAN</span>
                <span className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
                  {targetCMYK.c}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${targetCMYK.c}%` }}
                />
              </div>
            </div>

            {/* Magenta */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-fuchsia-900/40 relative overflow-hidden">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-fuchsia-400 tracking-wider">MAGENTA</span>
                <span className="text-lg font-bold font-mono text-fuchsia-300 tabular-nums">
                  {targetCMYK.m}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-fuchsia-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${targetCMYK.m}%` }}
                />
              </div>
            </div>

            {/* Amarillo */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-amber-900/40 relative overflow-hidden">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-amber-400 tracking-wider">AMARILLO</span>
                <span className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                  {targetCMYK.y}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                  style={{ width: `${targetCMYK.y}%` }}
                />
              </div>
            </div>

            {/* Negro */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-700 relative overflow-hidden">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xs font-bold text-slate-300 tracking-wider">NEGRO (K)</span>
                <span className="text-lg font-bold font-mono text-white tabular-nums">
                  {targetCMYK.k}%
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-200 h-full rounded-full transition-all duration-300"
                  style={{ width: `${targetCMYK.k}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cobertura Total de Tinta (TAC) */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-medium">Cobertura Total de Tinta (TAC):</span>
                <span
                  className={`font-mono font-bold tabular-nums ${
                    totalInkCoverage > settings.totalAreaCoverage
                      ? 'text-rose-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {totalInkCoverage}%
                </span>
                <span className="text-slate-400">/ Máximo permitido: {settings.totalAreaCoverage}%</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evita repinte mecánico en prensa y asegura el tiempo de secado óptimo del papel.
              </p>
            </div>

            {/* Añadir a paleta */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={swatchNameInput}
                onChange={(e) => setSwatchNameInput(e.target.value)}
                placeholder="Nombre muestra"
                className="w-32 px-2 py-1 text-xs bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => onAddSwatch(swatchNameInput, conversionResult.sourceHex)}
                className="flex items-center gap-1.5 px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir</span>
              </button>
            </div>
          </div>

          {/* Avisos si los hay */}
          {conversionResult.warnings.length > 0 && (
            <div className="space-y-1.5">
              {conversionResult.warnings.map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Configuración de Perfil ICC y Opciones de Conversión */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
            Motor de Perfiles ICC y Separación
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Selector de Perfil CMYK */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Perfil CMYK de Destino:
              </label>
              <select
                value={settings.cmykProfile}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    cmykProfile: e.target.value as CMYKProfileType,
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="FOGRA39">ISO Coated v2 (ECI) / FOGRA39 (Europa / Estándar)</option>
                <option value="GRACOL2006">GRACoL 2006 Coated 1v2 (Norteamérica G7)</option>
                <option value="SWOP_V2">U.S. Web Coated (SWOP) v2 (Rotativas)</option>
                <option value="FOGRA51">PSO Coated v3 / FOGRA51 (Moderno OBA)</option>
                <option value="JAPAN_COLOR">Japan Color 2001 Coated (Asia)</option>
                <option value="EUROSCALE">Euroscale Coated v2 (Tradicional)</option>
              </select>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentProfile.description}
              </p>
            </div>

            {/* Propósito de Renderizado */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Propósito de Renderizado (Intent):
              </label>
              <select
                value={settings.renderingIntent}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    renderingIntent: e.target.value as RenderingIntent,
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="relative_colorimetric">
                  Colorimétrico Relativo (con BPC - Recomendado)
                </option>
                <option value="perceptual">Perceptual (Armonía fotográfica y degradados)</option>
                <option value="saturation">Saturación (Máxima intensidad para diagramas)</option>
                <option value="absolute_colorimetric">
                  Colorimétrico Absoluto (Pruebas de contrato)
                </option>
              </select>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                El modo relativo mantiene los colores exactos dentro de gama y compensa el punto negro.
              </p>
            </div>

            {/* GCR Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Sustitución de Componente Gris (GCR):
              </label>
              <select
                value={settings.gcrLevel}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    gcrLevel: e.target.value as GCRLevel,
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="none">Sin GCR (K mínimo, más riqueza CMY)</option>
                <option value="light">Bajo (Ligero reemplazo de tinta)</option>
                <option value="medium">Medio (Recomendado estándar)</option>
                <option value="heavy">Alto (Ahorro notable de tinta y secado rápido)</option>
                <option value="maximum">Máximo (Esqueleto de negro)</option>
              </select>
            </div>

            {/* Límite de TAC */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Límite Máximo TAC (Total Area Coverage):
              </label>
              <select
                value={settings.totalAreaCoverage}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    totalAreaCoverage: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="280">280% (Periódicos / Papel poroso no estucado)</option>
                <option value="300">300% (Estándar FOGRA39 / Offset Comercial)</option>
                <option value="320">320% (Estándar GRACoL G7 / Papel estucado de calidad)</option>
                <option value="340">340% (Japan Color / Empaques de alta gama)</option>
              </select>
            </div>
          </div>

          {/* Opciones Avanzadas de Calidad */}
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.cleanPrimaries}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, cleanPrimaries: e.target.checked }))
                }
                className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
              />
              <span>Limpiar trazas contaminantes (&lt;3% en colores puros)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.preservePureBlack}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, preservePureBlack: e.target.checked }))
                }
                className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4 cursor-pointer"
              />
              <span>Proteger negro puro (#000000 -&gt; 100% K simple)</span>
            </label>
          </div>
        </div>

        {/* Alternativas Recomendadas para Impresión */}
        {conversionResult.safeAlternatives.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Alternativas Optimizadas para Prensa
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Si tu color original sufre pérdida de brillo en CMYK, puedes aplicar una de estas formulaciones especializadas calculadas para este perfil:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {conversionResult.safeAlternatives.map((alt, i) => (
                <div
                  key={i}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{alt.label}</span>
                      <span
                        className="w-4 h-4 rounded-full border border-black/40 shrink-0"
                        style={{ backgroundColor: alt.simulatedHex }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{alt.description}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="font-mono text-[11px] text-cyan-300">
                      C:{alt.cmyk.c} M:{alt.cmyk.m} Y:{alt.cmyk.y} K:{alt.cmyk.k}
                    </span>
                    <button
                      onClick={() => {
                        // Set this alternative as current
                        setCurrentRgb(hexToRgb(alt.simulatedHex));
                        setHexInput(alt.simulatedHex);
                      }}
                      className="px-2 py-0.5 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Aplicar</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
