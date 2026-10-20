/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SwatchItem, ConversionSettings } from '../types/color';
import { convertRGBToCMYK, hexToRgb } from '../utils/colorScience';
import { PRESET_PALETTES } from '../data/presetPalettes';
import {
  Palette,
  Plus,
  Trash2,
  Download,
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Sliders,
} from 'lucide-react';

interface PaletteManagerProps {
  swatches: SwatchItem[];
  setSwatches: React.Dispatch<React.SetStateAction<SwatchItem[]>>;
  settings: ConversionSettings;
  onSelectColor: (hex: string) => void;
}

export const PaletteManager: React.FC<PaletteManagerProps> = ({
  swatches,
  setSwatches,
  settings,
  onSelectColor,
}) => {
  const [newColorHex, setNewColorHex] = useState<string>('#3B82F6');
  const [newColorName, setNewColorName] = useState<string>('Azul Primario');
  const [selectedPresetGroup, setSelectedPresetGroup] = useState<string>('digital_neon');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Compute conversion for all current swatches
  const convertedSwatches = swatches.map((swatch) => {
    const rgb = swatch.rgb || hexToRgb(swatch.hex);
    const res = convertRGBToCMYK(rgb, settings);
    return {
      ...swatch,
      cmyk: res.targetCMYK,
      simulatedHex: res.simulatedHex,
      deltaE00: res.deltaE00,
      isOutOfGamut: res.isOutOfGamut,
    };
  });

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^#?([0-9A-F]{3}|[0-9A-F]{6})$/i.test(newColorHex)) return;

    const formattedHex = newColorHex.startsWith('#') ? newColorHex : `#${newColorHex}`;
    const newSwatch: SwatchItem = {
      id: `custom-${Date.now()}`,
      name: newColorName.trim() || 'Muestra Personalizada',
      hex: formattedHex.toUpperCase(),
      rgb: hexToRgb(formattedHex),
      category: 'Personalizado',
    };

    setSwatches((prev) => [...prev, newSwatch]);
    setNewColorName('');
  };

  const handleRemoveSwatch = (id: string) => {
    setSwatches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleLoadPreset = (groupId: string) => {
    const group = PRESET_PALETTES.find((p) => p.id === groupId);
    if (group) {
      setSwatches(group.swatches);
      setSelectedPresetGroup(groupId);
    }
  };

  // Export as Illustrator Swatches JSX Script
  const handleExportJsxSwatches = () => {
    let scriptContent = `/**
 * CHROMARTISAN: IMPORTADOR AUTOMÁTICO DE MUESTRAS CMYK
 * Perfil utilizado: ${settings.cmykProfile}
 * Generado el: ${new Date().toLocaleDateString()}
 */

#target illustrator

(function importSwatches() {
    if (app.documents.length === 0) {
        alert("Por favor abre un documento en Illustrator para añadir las muestras.");
        return;
    }
    var doc = app.activeDocument;
    var count = 0;

    var swatchData = [
`;

    convertedSwatches.forEach((s) => {
      if (s.cmyk) {
        scriptContent += `        { name: "${s.name.replace(/"/g, '\\"')}", c: ${s.cmyk.c}, m: ${s.cmyk.m}, y: ${s.cmyk.y}, k: ${s.cmyk.k} },\n`;
      }
    });

    scriptContent += `    ];

    for (var i = 0; i < swatchData.length; i++) {
        try {
            var item = swatchData[i];
            var col = new CMYKColor();
            col.cyan = item.c;
            col.magenta = item.m;
            col.yellow = item.y;
            col.black = item.k;

            var newSw = doc.swatches.add();
            newSw.name = item.name + " (" + item.c + "/" + item.m + "/" + item.y + "/" + item.k + ")";
            newSw.color = col;
            count++;
        } catch(e) {}
    }

    alert("¡Se han añadido " + count + " muestras de color CMYK al panel Muestras de Illustrator!");
})();
`;

    const blob = new Blob([scriptContent], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Chromartisan_Muestras_CMYK_${settings.cmykProfile}.jsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('¡Script JSX de muestras generado y descargado!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  // Export as JSON palette
  const handleExportJson = () => {
    const data = {
      profile: settings.cmykProfile,
      renderingIntent: settings.renderingIntent,
      generatedAt: new Date().toISOString(),
      colors: convertedSwatches.map((s) => ({
        name: s.name,
        originalHex: s.hex,
        targetCMYK: s.cmyk,
        deltaE2000: s.deltaE00,
        isOutOfGamut: s.isOutOfGamut,
      })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Paleta_CMYK_${settings.cmykProfile}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('¡Archivo JSON exportado!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Controles Superiores: Añadir y Cargar Paletas Predefinidas */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Gestor y Conversor Masivo de Muestras (Swatches)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Convierte colecciones completas de colores de marca RGB a CMYK y expórtalas directamente como muestras a Illustrator.
            </p>
          </div>

          {/* Botones de Exportación */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportJsxSwatches}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-xs"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Exportar Muestras a Illustrator (.JSX)</span>
            </button>

            <button
              onClick={handleExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON Técnico</span>
            </button>
          </div>
        </div>

        {exportNotice && (
          <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 rounded-lg text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* Toolbar de Paletas Predefinidas y Añadir Color */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-slate-800">
          {/* Cargar Grupo Predefinido */}
          <div className="md:col-span-5 flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 whitespace-nowrap">Cargar Presets:</span>
            <select
              value={selectedPresetGroup}
              onChange={(e) => handleLoadPreset(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              {PRESET_PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Formulario Añadir Muestra */}
          <form
            onSubmit={handleAddCustom}
            className="md:col-span-7 flex flex-wrap items-center justify-end gap-2"
          >
            <input
              type="color"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer shrink-0"
              title="Seleccionar color"
            />
            <input
              type="text"
              value={newColorHex}
              onChange={(e) => setNewColorHex(e.target.value)}
              placeholder="#HEX"
              className="w-20 px-2 py-1 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-cyan-300 uppercase"
            />
            <input
              type="text"
              value={newColorName}
              onChange={(e) => setNewColorName(e.target.value)}
              placeholder="Nombre de muestra"
              className="w-36 px-2 py-1 text-xs bg-slate-950 border border-slate-700 rounded text-slate-200"
            />
            <button
              type="submit"
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir Color</span>
            </button>
          </form>
        </div>
      </div>

      {/* Tabla de Conversión de Muestras */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 tracking-wider">
                <th className="py-3 px-4">MUESTRA</th>
                <th className="py-3 px-4">NOMBRE / CATEGORÍA</th>
                <th className="py-3 px-4">ORIGEN RGB</th>
                <th className="py-3 px-4">CIAN (C)</th>
                <th className="py-3 px-4">MAGENTA (M)</th>
                <th className="py-3 px-4">AMARILLO (Y)</th>
                <th className="py-3 px-4">NEGRO (K)</th>
                <th className="py-3 px-4">TAC</th>
                <th className="py-3 px-4 text-right">ΔE 2000</th>
                <th className="py-3 px-4 text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {convertedSwatches.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Muestra visual comparativa */}
                  <td className="py-2.5 px-4">
                    <div className="w-10 h-7 rounded border border-black/40 flex overflow-hidden shadow-xs">
                      <div
                        className="w-1/2 h-full"
                        style={{ backgroundColor: item.hex }}
                        title="RGB Origen"
                      />
                      <div
                        className="w-1/2 h-full"
                        style={{ backgroundColor: item.simulatedHex }}
                        title="CMYK Simulado"
                      />
                    </div>
                  </td>

                  {/* Nombre */}
                  <td className="py-2.5 px-4">
                    <div className="font-medium text-slate-200">{item.name}</div>
                    <div className="text-[10px] text-slate-400">{item.category || 'Paleta'}</div>
                  </td>

                  {/* Origen RGB */}
                  <td className="py-2.5 px-4 font-mono text-slate-300">
                    <div>{item.hex}</div>
                    <div className="text-[10px] text-slate-400">
                      R:{item.rgb.r} G:{item.rgb.g} B:{item.rgb.b}
                    </div>
                  </td>

                  {/* Cyan */}
                  <td className="py-2.5 px-4 font-mono font-semibold text-cyan-400 tabular-nums">
                    {item.cmyk?.c}%
                  </td>

                  {/* Magenta */}
                  <td className="py-2.5 px-4 font-mono font-semibold text-fuchsia-400 tabular-nums">
                    {item.cmyk?.m}%
                  </td>

                  {/* Amarillo */}
                  <td className="py-2.5 px-4 font-mono font-semibold text-amber-300 tabular-nums">
                    {item.cmyk?.y}%
                  </td>

                  {/* Negro */}
                  <td className="py-2.5 px-4 font-mono font-semibold text-white tabular-nums">
                    {item.cmyk?.k}%
                  </td>

                  {/* TAC */}
                  <td className="py-2.5 px-4 font-mono tabular-nums text-slate-300">
                    {(item.cmyk?.c || 0) +
                      (item.cmyk?.m || 0) +
                      (item.cmyk?.y || 0) +
                      (item.cmyk?.k || 0)}
                    %
                  </td>

                  {/* Delta-E */}
                  <td className="py-2.5 px-4 text-right font-mono font-bold tabular-nums">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        (item.deltaE00 || 0) < 2.0
                          ? 'text-emerald-400'
                          : (item.deltaE00 || 0) < 3.2
                          ? 'text-cyan-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {(item.deltaE00 || 0) >= 3.2 && (
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                      )}
                      ΔE {item.deltaE00}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onSelectColor(item.hex)}
                        className="p-1 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                        title="Cargar en Conversor"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveSwatch(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                        title="Eliminar muestra"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
