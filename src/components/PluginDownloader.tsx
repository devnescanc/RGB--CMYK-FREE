/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScriptConfiguration } from '../types/color';
import { generateIllustratorJsxScript } from '../utils/jsxGenerator';
import {
  Download,
  FileCode2,
  Copy,
  Check,
  Terminal,
  Settings,
  HelpCircle,
  FolderOpen,
  Keyboard,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface PluginDownloaderProps {
  scriptConfig: ScriptConfiguration;
  setScriptConfig: React.Dispatch<React.SetStateAction<ScriptConfiguration>>;
  onDownload: () => void;
}

export const PluginDownloader: React.FC<PluginDownloaderProps> = ({
  scriptConfig,
  setScriptConfig,
  onDownload,
}) => {
  const [selectedOS, setSelectedOS] = useState<'win' | 'mac'>('win');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'installer' | 'code' | 'config'>('installer');

  const jsxCode = generateIllustratorJsxScript(scriptConfig);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(jsxCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Hero Banner de Descarga */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Plugin Ejecutable para Adobe Illustrator (.JSX)</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Chromartisan RGB-to-CMYK Precision Converter
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Script nativo con interfaz gráfica interactiva (ScriptUI) para Adobe Illustrator. Permite utilizar
            e importar colores RGB en tus documentos CMYK convirtiendo con precisión quirúrgica perfiles ICC
            (FOGRA39, GRACoL 2006, SWOP), degradados, textos y muestras.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Compatible con Illustrator CC 2019 – CC 2026</span>
            </span>
            <span>·</span>
            <span>Windows & macOS</span>
            <span>·</span>
            <span>Sin dependencias externas</span>
          </div>
        </div>

        {/* Botón Principal de Descarga */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <button
            onClick={onDownload}
            className="flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 rounded-xl transition-all shadow-lg hover:shadow-cyan-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Descargar Plugin (.JSX)</span>
          </button>
          <span className="text-[11px] text-slate-400 font-mono">
            Chromartisan_RGB_CMYK_v2.4.jsx (18 KB)
          </span>
        </div>
      </div>

      {/* Navegación Secundaria: Guía de Instalación | Ajustes del Script | Visor de Código */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit text-xs font-medium">
        <button
          onClick={() => setActiveSubTab('installer')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'installer'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderOpen className="w-3.5 h-3.5" />
          <span>Guía de Instalación y Uso</span>
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'config'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Personalizar Ajustes Pre-Compilados</span>
        </button>

        <button
          onClick={() => setActiveSubTab('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
            activeSubTab === 'code'
              ? 'bg-slate-800 text-cyan-400 font-semibold shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>Inspeccionar Código Fuente ExtendScript</span>
        </button>
      </div>

      {/* Contenido: 1. Guía de Instalación */}
      {activeSubTab === 'installer' && (
        <div className="space-y-6">
          {/* Selector de SO */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-400">Instrucciones para:</span>
            <div className="flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-lg">
              <button
                onClick={() => setSelectedOS('win')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedOS === 'win'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Windows (PC)
              </button>
              <button
                onClick={() => setSelectedOS('mac')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedOS === 'mac'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                macOS (Apple Silicon / Intel)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Método 1: Ejecución Rápida */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 font-bold text-xs">
                01
              </div>
              <h3 className="text-sm font-bold text-white">
                Método Inmediato (En 5 segundos)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                No requiere reiniciar Illustrator ni permisos de administrador:
              </p>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed pt-1">
                <li>Descarga el archivo <span className="text-cyan-300 font-mono">.jsx</span> en tu carpeta de Descargas.</li>
                <li>Abre tu proyecto en Adobe Illustrator.</li>
                <li>
                  Ve al menú:{' '}
                  <span className="text-slate-200 font-medium">
                    Archivo &gt; Secuencias de comandos &gt; Otra secuencia de comandos...
                  </span>
                </li>
                <li>
                  Atajo de teclado:{' '}
                  <kbd className="px-1.5 py-0.5 bg-slate-950 border border-slate-700 rounded text-cyan-300 font-mono">
                    {selectedOS === 'win' ? 'Ctrl + F12' : 'Cmd + F12'}
                  </kbd>
                </li>
                <li>Selecciona el archivo y haz clic en Ejecutar.</li>
              </ol>
            </div>

            {/* Método 2: Instalación Permanente */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 font-bold text-xs">
                02
              </div>
              <h3 className="text-sm font-bold text-white">
                Instalación Permanente en el Menú
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Aparecerá en el menú nativo de Illustrator para siempre:
              </p>
              <div className="space-y-2 text-xs text-slate-400 leading-relaxed pt-1">
                <p>Copia el archivo descargado en esta ruta del sistema:</p>
                <div className="p-2 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-emerald-300 break-all select-all">
                  {selectedOS === 'win'
                    ? 'C:\\Program Files\\Adobe\\Adobe Illustrator [Versión]\\Presets\\es_ES\\Scripts\\'
                    : '/Applications/Adobe Illustrator [Versión]/Presets.localized/es_ES/Scripts/'}
                </div>
                <p className="text-[11px] text-slate-400">
                  (Si tu Illustrator está en inglés, la carpeta es <span className="font-mono text-slate-300">en_US</span>).
                </p>
                <p>Reinicia Illustrator y lo verás en: <br /><span className="text-slate-200 font-medium">Archivo &gt; Secuencias de comandos &gt; Chromartisan_RGB_to_CMYK</span>.</p>
              </div>
            </div>

            {/* Método 3: Atajo de Teclado con Acciones */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold text-xs">
                03
              </div>
              <h3 className="text-sm font-bold text-white">
                Asignar Atajo de Teclado (Acción)
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Para ejecutar la conversión pulsando una tecla de función (p. ej. F4):
              </p>
              <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside leading-relaxed pt-1">
                <li>Ve a <span className="text-slate-200 font-medium">Ventana &gt; Acciones</span>.</li>
                <li>Crea una nueva acción y asígnale la tecla de función <span className="text-amber-300 font-mono">F4</span> o <span className="text-amber-300 font-mono">F5</span>.</li>
                <li>Haz clic en Grabar.</li>
                <li>Ve a <span className="text-slate-200 font-medium">Archivo &gt; Secuencias de comandos</span> y ejecuta el script.</li>
                <li>Detén la grabación en el panel Acciones.</li>
                <li>A partir de ese momento, solo pulsa tu tecla para convertir!</li>
              </ol>
            </div>
          </div>

          {/* Preguntas Frecuentes y Consejos Técnicos de Pre-prensa */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              <span>Preguntas Frecuentes y Buenas Prácticas en Illustrator</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-100 block">
                  ¿Qué ocurre con los textos tipográficos al convertir?
                </span>
                <p className="text-slate-400 text-[11px]">
                  El plugin analiza tanto el color de relleno como de trazo de los textos (TextFrames). Además, si tienes textos en color negro puro (#000000), el plugin los transforma automáticamente en 100% K simple para que no se descalcen en las planchas de imprenta.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-100 block">
                  ¿Cómo procesa los degradados (Gradients)?
                </span>
                <p className="text-slate-400 text-[11px]">
                  El script recorre cada parada de color individual (GradientStop) del degradado vectorial, convirtiendo sus coordenadas RGB a las tintas CMYK calculadas bajo las curvas del perfil ICC seleccionado.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-100 block">
                  ¿Puedo deshacer la conversión con Ctrl+Z / Cmd+Z?
                </span>
                <p className="text-slate-400 text-[11px]">
                  Sí. Todas las modificaciones se agrupan en la cola de deshacer de Adobe Illustrator, permitiéndote regresar a tu estado anterior con un solo Ctrl+Z en cualquier momento.
                </p>
              </div>

              <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-100 block">
                  ¿Qué perfil ICC debo elegir para mi imprenta?
                </span>
                <p className="text-slate-400 text-[11px]">
                  Si imprimes en Europa o Latinoamérica, el 90% de imprentas comerciales solicitan <span className="text-cyan-300 font-mono">ISO Coated v2 (FOGRA39)</span> o <span className="text-cyan-300 font-mono">PSO Coated v3 (FOGRA51)</span>. En EE.UU. o México el estándar preferido es <span className="text-cyan-300 font-mono">GRACoL 2006</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido: 2. Personalizar Ajustes Pre-Compilados */}
      {activeSubTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">
              Parámetros Pre-Configurados en el Archivo .JSX
            </h3>
            <p className="text-xs text-slate-400">
              Modifica estos ajustes y el archivo generado que descargues incluirá estos valores por defecto pre-programados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Perfil ICC Predeterminado en el Script:
                </label>
                <select
                  value={scriptConfig.defaultProfile}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      defaultProfile: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="FOGRA39">FOGRA39 (ISO Coated v2 - Europa/LatAm)</option>
                  <option value="GRACOL2006">GRACoL 2006 (G7 Norteamérica)</option>
                  <option value="SWOP_V2">US Web Coated SWOP v2 (Rotativas)</option>
                  <option value="FOGRA51">FOGRA51 (PSO Coated v3)</option>
                  <option value="JAPAN_COLOR">Japan Color 2001 Coated</option>
                  <option value="EUROSCALE">Euroscale Coated v2</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Nivel de Sustitución de Gris (GCR) por defecto:
                </label>
                <select
                  value={scriptConfig.defaultGCR}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      defaultGCR: e.target.value as any,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200"
                >
                  <option value="none">Sin GCR</option>
                  <option value="light">Bajo (Light)</option>
                  <option value="medium">Medio (Estándar recomendado)</option>
                  <option value="heavy">Alto (Ahorro de tinta)</option>
                  <option value="maximum">Máximo</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Límite TAC de Tinta:
                </label>
                <input
                  type="number"
                  min="240"
                  max="360"
                  value={scriptConfig.defaultTAC}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      defaultTAC: parseInt(e.target.value, 10) || 300,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <label className="text-xs font-medium text-slate-300 block">
                Comportamiento de Ejecución:
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scriptConfig.dialogMode}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      dialogMode: e.target.checked,
                    }))
                  }
                  className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span>Mostrar ventana gráfica interactiva en Illustrator (ScriptUI)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scriptConfig.convertGradients}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      convertGradients: e.target.checked,
                    }))
                  }
                  className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span>Convertir paradas de degradados (GradientStops)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scriptConfig.convertTextFrames}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      convertTextFrames: e.target.checked,
                    }))
                  }
                  className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span>Convertir textos editables (TextFrames)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scriptConfig.convertDocumentSwatches}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      convertDocumentSwatches: e.target.checked,
                    }))
                  }
                  className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span>Convertir muestras del panel Muestras a CMYK</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scriptConfig.cleanTraces}
                  onChange={(e) =>
                    setScriptConfig((prev) => ({
                      ...prev,
                      cleanTraces: e.target.checked,
                    }))
                  }
                  className="rounded accent-cyan-500 bg-slate-950 border-slate-700 w-4 h-4"
                />
                <span>Limpiar tintas contaminantes (&lt;3% en colores primarios)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Script con esta Configuración</span>
            </button>
          </div>
        </div>
      )}

      {/* Contenido: 3. Visor de Código Fuente */}
      {activeSubTab === 'code' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-0">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-950 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-mono">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Chromartisan_RGB_to_CMYK.jsx</span>
            </div>
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded transition-colors border border-slate-700"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Código</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto max-h-[500px]">
            <pre>
              <code>{jsxCode}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
