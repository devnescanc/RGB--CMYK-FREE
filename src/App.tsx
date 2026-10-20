/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  RGBColor,
  ConversionSettings,
  ScriptConfiguration,
  SwatchItem,
} from './types/color';
import {
  convertRGBToCMYK,
  hexToRgb,
  rgbToHex,
} from './utils/colorScience';
import { generateIllustratorJsxScript } from './utils/jsxGenerator';
import { PRESET_PALETTES } from './data/presetPalettes';
import { TopBar } from './components/TopBar';
import { ColorStudio } from './components/ColorStudio';
import { ArtworkSimulator } from './components/ArtworkSimulator';
import { PaletteManager } from './components/PaletteManager';
import { PluginDownloader } from './components/PluginDownloader';
import { AiPrepressAdvisor } from './components/AiPrepressAdvisor';
import { CheckCircle2, Download, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'converter' | 'artboard' | 'palettes' | 'plugin' | 'advisor'
  >('converter');

  // Estado del color RGB actual seleccionado para pruebas
  const [currentRgb, setCurrentRgb] = useState<RGBColor>(hexToRgb('#00F0FF'));

  // Configuración de Perfil ICC y Parámetros de Prensa
  const [settings, setSettings] = useState<ConversionSettings>({
    rgbProfile: 'sRGB',
    cmykProfile: 'FOGRA39', // ISO Coated v2 (ECI)
    renderingIntent: 'relative_colorimetric',
    gcrLevel: 'medium',
    totalAreaCoverage: 300,
    blackPointCompensation: true,
    preservePureBlack: true,
    cleanPrimaries: true,
  });

  // Configuración del Script JSX exportable
  const [scriptConfig, setScriptConfig] = useState<ScriptConfiguration>({
    defaultProfile: 'FOGRA39',
    defaultRenderingIntent: 'relative_colorimetric',
    defaultGCR: 'medium',
    defaultTAC: 300,
    processSelectionOnly: true,
    convertGradients: true,
    convertTextFrames: true,
    convertDocumentSwatches: true,
    addConvertedToSwatches: true,
    cleanTraces: true,
    dialogMode: true,
  });

  // Muestras guardadas en la sesión
  const [swatches, setSwatches] = useState<SwatchItem[]>(
    PRESET_PALETTES[0].swatches
  );

  // Modal / Toast de confirmación de descarga
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cálculo en tiempo real de la conversión de color activa
  const conversionResult = useMemo(() => {
    return convertRGBToCMYK(currentRgb, settings);
  }, [currentRgb, settings]);

  // Manejador de descarga del plugin ejecutable .JSX
  const handleDownloadScript = () => {
    const code = generateIllustratorJsxScript(scriptConfig);
    const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Chromartisan_RGB_to_CMYK.jsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setToastMessage('¡Plugin Chromartisan_RGB_to_CMYK.jsx descargado con éxito!');
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Añadir una muestra desde el Conversor
  const handleAddSwatch = (name: string, hex: string) => {
    const newSwatch: SwatchItem = {
      id: `swatch-${Date.now()}`,
      name: name.trim() || `Muestra ${hex}`,
      hex: hex.toUpperCase(),
      rgb: hexToRgb(hex),
      category: 'Guardados',
    };
    setSwatches((prev) => [...prev, newSwatch]);
    setToastMessage(`Muestra "${newSwatch.name}" guardada en el Gestor.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectColorFromAnywhere = (hex: string) => {
    setCurrentRgb(hexToRgb(hex));
    setActiveTab('converter');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Barra de Navegación Superior (TopBar) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDownloadScript={handleDownloadScript}
      />

      {/* Notificación Toast Flotante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 bg-slate-900 border border-emerald-500/50 rounded-xl shadow-2xl text-xs text-white animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Contenido Principal según Pestaña Activa */}
      <main className="flex-1 pb-16">
        {activeTab === 'converter' && (
          <ColorStudio
            currentRgb={currentRgb}
            setCurrentRgb={setCurrentRgb}
            settings={settings}
            setSettings={setSettings}
            conversionResult={conversionResult}
            onAddSwatch={handleAddSwatch}
          />
        )}

        {activeTab === 'artboard' && (
          <ArtworkSimulator
            settings={settings}
            onApplyColorToStudio={handleSelectColorFromAnywhere}
          />
        )}

        {activeTab === 'palettes' && (
          <PaletteManager
            swatches={swatches}
            setSwatches={setSwatches}
            settings={settings}
            onSelectColor={handleSelectColorFromAnywhere}
          />
        )}

        {activeTab === 'plugin' && (
          <PluginDownloader
            scriptConfig={scriptConfig}
            setScriptConfig={setScriptConfig}
            onDownload={handleDownloadScript}
          />
        )}

        {activeTab === 'advisor' && (
          <AiPrepressAdvisor
            conversionResult={conversionResult}
            settings={settings}
          />
        )}
      </main>

      {/* Pie de Página Minimalista y Profesional */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">Chromartisan RGB-CMYK</span>
            <span>·</span>
            <span>Motor de Separación Espectral y Plugin para Adobe Illustrator</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>ISO 12647-2</span>
            <span>·</span>
            <span>FOGRA39 / GRACoL 2006</span>
            <span>·</span>
            <span>ExtendScript ECMAScript 3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
