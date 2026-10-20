/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConversionResult, ConversionSettings } from '../types/color';
import { ICC_PROFILES } from '../utils/colorScience';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Printer,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface AiPrepressAdvisorProps {
  conversionResult: ConversionResult;
  settings: ConversionSettings;
}

export const AiPrepressAdvisor: React.FC<AiPrepressAdvisorProps> = ({
  conversionResult,
  settings,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    color_mode: true,
    raster_res: true,
  });

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const currentProfile = ICC_PROFILES[settings.cmykProfile];
  const { deltaE00, isOutOfGamut, sourceHex, simulatedHex, targetCMYK } = conversionResult;

  // Approximate Pantone match based on hue/chroma
  const getSuggestedSpotColor = () => {
    const { r, g, b } = conversionResult.sourceRGB;

    if (r < 50 && g > 200 && b > 220) {
      return {
        code: 'PANTONE 306 C / Process Cyan C',
        hex: '#00B5E2',
        reason: 'El cian puro eléctrico en RGB rebasa la capacidad de la tinta cian process normal. Se recomienda tinta directa o barniz UV.',
      };
    }
    if (r > 230 && g < 40 && b > 140) {
      return {
        code: 'PANTONE 806 C (Neón Flúor) o PANTONE 219 C',
        hex: '#FF007F',
        reason: 'Los magentas hiper-brillantes requieren pigmentación fluorescente o tinta directa Pantone para igualar el monitor.',
      };
    }
    if (r < 80 && g > 230 && b < 80) {
      return {
        code: 'PANTONE 802 C (Verde Flúor) o PANTONE 375 C',
        hex: '#48D800',
        reason: 'El ojo humano es extremadamente sensible al verde. En CMYK la mezcla de cian y amarillo absorbe demasiada luz.',
      };
    }
    if (r > 240 && g > 120 && b < 40) {
      return {
        code: 'PANTONE 021 C / PANTONE 151 C',
        hex: '#FE5000',
        reason: 'Naranjas puros de alta luminosidad. En CMYK requieren alta carga de amarillo y magenta.',
      };
    }
    if (r > 80 && r < 140 && g < 60 && b > 180) {
      return {
        code: 'PANTONE 2685 C / Violet C',
        hex: '#582C83',
        reason: 'Los tonos violetas y morados son de los más difíciles en cuatricromía offset por el desvío hacia tonos rojizos o grisáceos.',
      };
    }

    return {
      code: `PANTONE Solid Coated equivalente para ${sourceHex}`,
      hex: simulatedHex,
      reason: 'Color con reproducción viable dentro de la tolerancia de 4 tintas CMYK del perfil seleccionado.',
    };
  };

  const spotRecommendation = getSuggestedSpotColor();

  const checklistItems = [
    {
      id: 'color_mode',
      title: 'Modo de Color del Documento en Illustrator',
      desc: 'Comprueba en Archivo > Modo de color del documento que esté activado "Color CMYK".',
      critical: true,
    },
    {
      id: 'raster_res',
      title: 'Resolución de Efectos de Rasterizado a 300 ppp',
      desc: 'Ve a Efecto > Ajustes de efectos de rasterizado de documento y selecciona "Alta (300 ppp)" para que sombras, desenfoques y transparencias no salgan pixeladas.',
      critical: true,
    },
    {
      id: 'fine_text',
      title: 'Textos Finos y Cuerpos Pequeños en Negro 100% K',
      desc: 'El plugin Chromartisan convierte automáticamente los textos a K:100% puro para evitar el descalce de registro en prensa offset.',
      critical: true,
    },
    {
      id: 'bleed',
      title: 'Sangrado Perimetral de 3 mm a 5 mm',
      desc: 'Asegura que los fondos o imágenes que toquen el borde del diseño sobresalgan hacia el área de sangrado para evitar filetes blancos al guillotinar.',
      critical: true,
    },
    {
      id: 'tac_limit',
      title: `Cobertura de Tinta TAC ≤ ${settings.totalAreaCoverage}%`,
      desc: `Verificado: El límite establecido de ${settings.totalAreaCoverage}% previene el repinte mecánico y garantiza el secado óptimo del papel.`,
      critical: false,
    },
    {
      id: 'pdf_standard',
      title: 'Exportación a PDF/X-1a o PDF/X-4',
      desc: 'Al guardar el PDF de imprenta, utiliza el estándar PDF/X-1a (con aplanado de transparencias) o PDF/X-4 con el perfil ICC incrustado.',
      critical: false,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-2">
        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <span>Consultoría Técnica de Pre-Prensa y Colorimetría</span>
        </h2>
        <p className="text-xs text-slate-400">
          Guía especializada para diseñadores gráficos sobre las discrepancias físicas entre el espacio RGB aditivo de pantallas y el espacio CMYK sustractivo de imprentas comerciales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Diagnóstico del Color Activo (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Diagnóstico de Reproducibilidad</span>
            </h3>

            {/* Muestra y Estado */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Color seleccionado:</span>
                <span className="font-mono text-xs font-semibold text-cyan-300">
                  {sourceHex}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg border border-black/40 shrink-0 shadow-inner"
                  style={{ backgroundColor: sourceHex }}
                  title="RGB"
                />
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                <div
                  className="w-12 h-12 rounded-lg border border-black/40 shrink-0 shadow-inner"
                  style={{ backgroundColor: simulatedHex }}
                  title="CMYK"
                />
                <div className="text-xs space-y-0.5">
                  <div className="font-mono text-slate-200">
                    C:{targetCMYK.c} M:{targetCMYK.m} Y:{targetCMYK.y} K:{targetCMYK.k}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Diferencia:{' '}
                    <span
                      className={`font-mono font-bold ${
                        deltaE00 < 3.2 ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    >
                      ΔE₀₀ {deltaE00}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed pt-1">
                {isOutOfGamut
                  ? 'Este color RGB es altamente saturado y excede el triángulo de reproducción del perfil ' +
                    currentProfile.id +
                    '. En cuatricromía estándar experimentará una ligera atenuación o pérdida de luminancia.'
                  : 'Este color se sitúa cómodamente dentro del volumen cromático de ' +
                    currentProfile.name +
                    '. La fidelidad entre tu pantalla y la hoja impresa será muy alta.'}
              </p>
            </div>

            {/* Recomendación de Tinta Directa / Pantone si procede */}
            {isOutOfGamut && (
              <div className="p-3.5 bg-slate-950 rounded-lg border border-cyan-900/40 space-y-2">
                <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider block">
                  Recomendación para Branding & Packaging de Alta Gama:
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <div
                    className="w-8 h-8 rounded border border-black/40 shrink-0"
                    style={{ backgroundColor: spotRecommendation.hex }}
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {spotRecommendation.code}
                    </span>
                    <span className="text-[11px] text-slate-400">Tinta Directa (Spot Color)</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug pt-1">
                  {spotRecommendation.reason}
                </p>
              </div>
            )}

            {/* Explicación Técnica: Aditivo vs Sustractivo */}
            <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-200 block">
                ¿Por qué los colores RGB y CMYK difieren?
              </span>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                • <strong className="text-slate-300">RGB (Síntesis Aditiva):</strong> Los monitores emiten fotones directamente a la retina sumando luz hasta llegar al blanco (R255 G255 B255).
                <br /><br />
                • <strong className="text-slate-300">CMYK (Síntesis Sustractiva):</strong> Las tintas impresas actúan como filtros físicos transparentes depositados sobre papel blanco; cada capa de tinta absorbe una porción del espectro luminoso visible.
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Checklist de Pre-vuelo para Imprenta (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Lista de Control de Pre-Vuelo para Imprenta (Pre-Flight)</span>
              </h3>
              <span className="text-xs font-mono text-cyan-400">
                {Object.values(checkedItems).filter(Boolean).length} / {checklistItems.length} verificados
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verifica estos puntos clave en tu archivo de Adobe Illustrator antes de generar el PDF final o enviar el archivo a taller:
            </p>

            <div className="space-y-2.5 pt-1">
              {checklistItems.map((item) => {
                const isDone = !!checkedItems[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleCheck(item.id)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone
                        ? 'bg-slate-950/80 border-slate-800'
                        : 'bg-slate-950 border-amber-800/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleCheck(item.id)}
                      className="mt-0.5 rounded accent-emerald-500 bg-slate-900 border-slate-700 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <div className="space-y-0.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            isDone ? 'text-slate-200' : 'text-amber-200'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.critical && (
                          <span className="text-[10px] text-cyan-400 font-mono">
                            Crítico
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
