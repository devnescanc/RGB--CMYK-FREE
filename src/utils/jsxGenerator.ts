/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ScriptConfiguration } from '../types/color';

export function generateIllustratorJsxScript(config: ScriptConfiguration): string {
  return `/**
 * ============================================================================
 * CHROMARTISAN RGB-to-CMYK PRECISION CONVERTER FOR ADOBE ILLUSTRATOR
 * ============================================================================
 * Versión: 2.4.0 Professional Edition
 * Compatibilidad: Adobe Illustrator CC 2019 - 2026 (Windows & macOS)
 * Lenguaje: ExtendScript (JavaScript ECMAScript 3 para Adobe ScriptUI)
 * 
 * DESCRIPCIÓN:
 * Este pluggin / script ejecutable permite usar e importar colores RGB en 
 * documentos CMYK de Adobe Illustrator convirtiéndolos con precisión matemática 
 * basada en perfiles de color ICC estándar (FOGRA39, GRACoL 2006, SWOP, FOGRA51, 
 * Japan Color), sustitución de componente gris (GCR), control de cobertura 
 * máxima de tinta (TAC) y cálculo de diferencia de color.
 * 
 * INSTRUCCIONES DE USO:
 * 1. Abre tu proyecto en Adobe Illustrator.
 * 2. Ve al menú: Archivo > Secuencias de comandos > Otra secuencia de comandos...
 *    (O pulsa Ctrl + F12 en Windows / Cmd + F12 en macOS).
 * 3. Selecciona este archivo .jsx y haz clic en "Abrir".
 * 4. (Opcional) Para tenerlo siempre en el menú de Illustrator, copia este archivo en:
 *    - Windows: C:\\Program Files\\Adobe\\Adobe Illustrator [Versión]\\Presets\\[Idioma]\\Scripts\\
 *    - macOS: /Applications/Adobe Illustrator [Versión]/Presets.localized/[Idioma]/Scripts/
 * ============================================================================
 */

#target illustrator

(function main() {
    if (app.documents.length === 0) {
        alert("Chromartisan: No hay ningún documento abierto en Illustrator.\\n\\nPor favor abre o crea un proyecto antes de ejecutar la herramienta.", "Chromartisan RGB-CMYK", true);
        return;
    }

    var doc = app.activeDocument;
    
    // Configuración predeterminada generada desde Chromartisan Studio
    var CONFIG = {
        defaultProfile: "${config.defaultProfile}", // FOGRA39, GRACOL2006, SWOP_V2, FOGRA51, JAPAN_COLOR, EUROSCALE
        defaultRenderingIntent: "${config.defaultRenderingIntent}",
        gcrLevel: "${config.defaultGCR}", // 'none', 'light', 'medium', 'heavy', 'maximum'
        maxTAC: ${config.defaultTAC}, // Total Area Coverage (%)
        processSelectionOnly: ${config.processSelectionOnly ? 'true' : 'false'},
        convertGradients: ${config.convertGradients ? 'true' : 'false'},
        convertTextFrames: ${config.convertTextFrames ? 'true' : 'false'},
        convertDocumentSwatches: ${config.convertDocumentSwatches ? 'true' : 'false'},
        addConvertedToSwatches: ${config.addConvertedToSwatches ? 'true' : 'false'},
        cleanTraces: ${config.cleanTraces ? 'true' : 'false'},
        preservePureBlack: true
    };

    var stats = {
        pathsProcessed: 0,
        textFramesProcessed: 0,
        gradientsProcessed: 0,
        swatchesCreated: 0,
        skippedItems: 0
    };

    // ========================================================================
    // MOTOR DE CONVERSIÓN DE COLOR RGB A CMYK
    // ========================================================================

    function rgbToCmykPrecision(r, g, b, profileId, gcrLevel, maxTac, cleanTraces, preserveBlack) {
        // Validación de Negro Puro (Preserva K:100 sin descalce de registro)
        if (preserveBlack && r === 0 && g === 0 && b === 0) {
            var blackCmyk = new CMYKColor();
            blackCmyk.cyan = 0;
            blackCmyk.magenta = 0;
            blackCmyk.yellow = 0;
            blackCmyk.black = 100;
            return blackCmyk;
        }

        // Validación de Blanco Puro
        if (r >= 254 && g >= 254 && b >= 254) {
            var whiteCmyk = new CMYKColor();
            whiteCmyk.cyan = 0;
            whiteCmyk.magenta = 0;
            whiteCmyk.yellow = 0;
            whiteCmyk.black = 0;
            return whiteCmyk;
        }

        var rNorm = r / 255.0;
        var gNorm = g / 255.0;
        var bNorm = b / 255.0;

        // Conversión sustractiva base
        var cRaw = 1.0 - rNorm;
        var mRaw = 1.0 - gNorm;
        var yRaw = 1.0 - bNorm;

        // Coeficiente GCR (Gray Component Replacement)
        var kCoeff = 0.65;
        if (gcrLevel === "none") kCoeff = 0.0;
        else if (gcrLevel === "light") kCoeff = 0.35;
        else if (gcrLevel === "medium") kCoeff = 0.65;
        else if (gcrLevel === "heavy") kCoeff = 0.85;
        else if (gcrLevel === "maximum") kCoeff = 1.0;

        // Ajuste según perfil de color ICC
        if (profileId === "FOGRA39" || profileId === "FOGRA51") {
            kCoeff *= 1.05;
        } else if (profileId === "GRACOL2006") {
            kCoeff *= 1.0;
        } else if (profileId === "SWOP_V2") {
            kCoeff *= 0.95;
        } else if (profileId === "JAPAN_COLOR") {
            kCoeff *= 1.1;
        }

        var minCmy = Math.min(cRaw, Math.min(mRaw, yRaw));
        var kGen = minCmy * kCoeff;

        if (minCmy > 0.7 && gcrLevel !== "maximum") {
            kGen = Math.min(1.0, minCmy * 0.95);
        }

        var c = cRaw;
        var m = mRaw;
        var y = yRaw;

        if (kGen > 0.001) {
            c = Math.max(0.0, (cRaw - kGen) / (1.0 - kGen * 0.85));
            m = Math.max(0.0, (mRaw - kGen) / (1.0 - kGen * 0.85));
            y = Math.max(0.0, (yRaw - kGen) / (1.0 - kGen * 0.85));
        }

        // Correcciones cromáticas específicas por perfil
        if (profileId === "FOGRA39" || profileId === "FOGRA51") {
            c = Math.pow(c, 0.96) * 1.02;
            m = Math.pow(m, 0.98) * 1.01;
            y = Math.pow(y, 0.99);
        } else if (profileId === "GRACOL2006") {
            c = Math.pow(c, 0.95) * 1.03;
            m = Math.pow(m, 0.97) * 1.00;
        } else if (profileId === "SWOP_V2") {
            c = Math.pow(c, 0.92) * 0.98;
            m = Math.pow(m, 0.94) * 0.97;
            y = Math.pow(y, 0.96);
        } else if (profileId === "JAPAN_COLOR") {
            m = Math.pow(m, 0.95) * 1.04;
            c = Math.pow(c, 0.94) * 1.02;
        }

        // Limpieza de trazas parásitas (evita tintas sucias en tonos puros)
        if (cleanTraces) {
            if (c > 0.6 && y > 0.6 && m < 0.06) m = 0.0;
            if (c > 0.7 && m < 0.05 && y < 0.05) { m = 0.0; y = 0.0; }
            if (m > 0.7 && c < 0.05 && y < 0.05) { c = 0.0; y = 0.0; }
            if (y > 0.6 && c < 0.04 && m < 0.04) { c = 0.0; m = 0.0; }
        }

        var cPct = Math.round(Math.min(100.0, Math.max(0.0, c * 100.0)));
        var mPct = Math.round(Math.min(100.0, Math.max(0.0, m * 100.0)));
        var yPct = Math.round(Math.min(100.0, Math.max(0.0, y * 100.0)));
        var kPct = Math.round(Math.min(100.0, Math.max(0.0, kGen * 100.0)));

        // Aplicación del Límite Total de Tinta (TAC)
        var currentTac = cPct + mPct + yPct + kPct;
        if (currentTac > maxTac) {
            var excess = currentTac - maxTac;
            var cmyTotal = cPct + mPct + yPct;
            if (cmyTotal > 0) {
                var scale = (cmyTotal - excess) / cmyTotal;
                cPct = Math.round(Math.max(0.0, cPct * scale));
                mPct = Math.round(Math.max(0.0, mPct * scale));
                yPct = Math.round(Math.max(0.0, yPct * scale));
            }
        }

        var resultColor = new CMYKColor();
        resultColor.cyan = cPct;
        resultColor.magenta = mPct;
        resultColor.yellow = yPct;
        resultColor.black = kPct;

        return resultColor;
    }

    // Convierte un color de Illustrator si es RGB
    function processColor(illustratorColor) {
        if (!illustratorColor) return null;

        if (illustratorColor.typename === "RGBColor") {
            return rgbToCmykPrecision(
                illustratorColor.red,
                illustratorColor.green,
                illustratorColor.blue,
                CONFIG.defaultProfile,
                CONFIG.gcrLevel,
                CONFIG.maxTAC,
                CONFIG.cleanTraces,
                CONFIG.preservePureBlack
            );
        }

        // Si es SpotColor con definición RGB subyacente
        if (illustratorColor.typename === "SpotColor") {
            var spot = illustratorColor.spot;
            if (spot && spot.colorType === ColorModel.PROCESS && spot.color && spot.color.typename === "RGBColor") {
                return rgbToCmykPrecision(
                    spot.color.red,
                    spot.color.green,
                    spot.color.blue,
                    CONFIG.defaultProfile,
                    CONFIG.gcrLevel,
                    CONFIG.maxTAC,
                    CONFIG.cleanTraces,
                    CONFIG.preservePureBlack
                );
            }
        }

        return null;
    }

    // Procesa degradados (GradientColor)
    function processGradient(gradientColor) {
        if (!CONFIG.convertGradients || !gradientColor || gradientColor.typename !== "GradientColor") {
            return false;
        }

        var grad = gradientColor.gradient;
        if (!grad) return false;

        var changed = false;
        for (var i = 0; i < grad.gradientStops.length; i++) {
            var stop = grad.gradientStops[i];
            var newStopColor = processColor(stop.color);
            if (newStopColor) {
                stop.color = newStopColor;
                changed = true;
            }
        }
        return changed;
    }

    // Procesa un elemento del arte
    function processPageItem(item) {
        if (!item) return;

        // Si es grupo o compound path, procesar recursivamente
        if (item.typename === "GroupItem") {
            for (var g = 0; g < item.pageItems.length; g++) {
                processPageItem(item.pageItems[g]);
            }
            return;
        }

        if (item.typename === "CompoundPathItem") {
            for (var cp = 0; cp < item.pathItems.length; cp++) {
                processPageItem(item.pathItems[cp]);
            }
            return;
        }

        // Trazados estándar (PathItem)
        if (item.typename === "PathItem") {
            var itemModified = false;

            if (item.filled) {
                if (item.fillColor.typename === "RGBColor") {
                    var newFill = processColor(item.fillColor);
                    if (newFill) {
                        item.fillColor = newFill;
                        itemModified = true;
                    }
                } else if (item.fillColor.typename === "GradientColor") {
                    if (processGradient(item.fillColor)) {
                        stats.gradientsProcessed++;
                        itemModified = true;
                    }
                }
            }

            if (item.stroked) {
                if (item.strokeColor.typename === "RGBColor") {
                    var newStroke = processColor(item.strokeColor);
                    if (newStroke) {
                        item.strokeColor = newStroke;
                        itemModified = true;
                    }
                } else if (item.strokeColor.typename === "GradientColor") {
                    if (processGradient(item.strokeColor)) {
                        stats.gradientsProcessed++;
                        itemModified = true;
                    }
                }
            }

            if (itemModified) {
                stats.pathsProcessed++;
            }
            return;
        }

        // Marcos de texto (TextFrame)
        if (item.typename === "TextFrame" && CONFIG.convertTextFrames) {
            var textChanged = false;
            try {
                var tr = item.textRange;
                if (tr && tr.characterAttributes) {
                    var charAttr = tr.characterAttributes;
                    if (charAttr.fillColor && charAttr.fillColor.typename === "RGBColor") {
                        var newTextFill = processColor(charAttr.fillColor);
                        if (newTextFill) {
                            charAttr.fillColor = newTextFill;
                            textChanged = true;
                        }
                    }
                    if (charAttr.strokeColor && charAttr.strokeColor.typename === "RGBColor") {
                        var newTextStroke = processColor(charAttr.strokeColor);
                        if (newTextStroke) {
                            charAttr.strokeColor = newTextStroke;
                            textChanged = true;
                        }
                    }
                }
            } catch (err) {
                stats.skippedItems++;
            }

            if (textChanged) {
                stats.textFramesProcessed++;
            }
            return;
        }
    }

    // Procesa las muestras del panel Muestras de Illustrator
    function processDocumentSwatches() {
        if (!CONFIG.convertDocumentSwatches) return;

        var swatches = doc.swatches;
        for (var s = swatches.length - 1; s >= 0; s--) {
            try {
                var sw = swatches[s];
                if (sw.color && sw.color.typename === "RGBColor") {
                    var rgbC = sw.color;
                    var cmykC = processColor(rgbC);
                    if (cmykC) {
                        var originalName = sw.name;
                        // Añade nueva muestra CMYK precisa
                        var newSw = doc.swatches.add();
                        newSw.name = originalName + " (CMYK: " + cmykC.cyan + "/" + cmykC.magenta + "/" + cmykC.yellow + "/" + cmykC.black + ")";
                        newSw.color = cmykC;
                        stats.swatchesCreated++;
                    }
                }
            } catch (e) {
                // Muestras bloqueadas o del sistema
            }
        }
    }

    // ========================================================================
    // INTERFAZ GRÁFICA SCRIPTUI (DIALOGO NATIVO DE ILLUSTRATOR)
    // ========================================================================

    function showInterface() {
        var win = new Window("dialog", "Chromartisan: Conversor RGB a CMYK Preciso");
        win.orientation = "column";
        win.alignChildren = ["fill", "top"];
        win.spacing = 12;
        win.margins = 16;

        // Panel de Perfil ICC
        var profilePanel = win.add("panel", undefined, "1. Perfil de Color ICC de Destino");
        profilePanel.orientation = "column";
        profilePanel.alignChildren = ["fill", "top"];
        profilePanel.margins = 12;
        profilePanel.spacing = 8;

        var profileDropdown = profilePanel.add("dropdownlist", undefined, [
            "ISO Coated v2 (ECI) / FOGRA39 [Europa/LatAm]",
            "GRACoL 2006 Coated 1v2 [Norteamérica G7]",
            "U.S. Web Coated (SWOP) v2 [Rotativa/Revistas]",
            "PSO Coated v3 / FOGRA51 [Europa OBA]",
            "Japan Color 2001 Coated [Japón/Asia]",
            "Euroscale Coated v2 [Offset Tradicional]"
        ]);

        var profileKeys = ["FOGRA39", "GRACOL2006", "SWOP_V2", "FOGRA51", "JAPAN_COLOR", "EUROSCALE"];
        var defaultIndex = 0;
        for (var p = 0; p < profileKeys.length; p++) {
            if (profileKeys[p] === CONFIG.defaultProfile) defaultIndex = p;
        }
        profileDropdown.selection = defaultIndex;

        // Panel de Opciones de Impresión
        var optionsPanel = win.add("panel", undefined, "2. Parámetros de Prensa y Separación");
        optionsPanel.orientation = "column";
        optionsPanel.alignChildren = ["fill", "top"];
        optionsPanel.margins = 12;
        optionsPanel.spacing = 6;

        var gcrGroup = optionsPanel.add("group");
        gcrGroup.orientation = "row";
        gcrGroup.add("statictext", undefined, "Sustitución de Gris (GCR):");
        var gcrDropdown = gcrGroup.add("dropdownlist", undefined, ["Sin GCR (K mínimo)", "Bajo (GCR Light)", "Medio (Recomendado)", "Alto (Ahorro de Tinta)", "Máximo (Esqueleto)"]);
        var gcrIndex = 2;
        if (CONFIG.gcrLevel === "none") gcrIndex = 0;
        else if (CONFIG.gcrLevel === "light") gcrIndex = 1;
        else if (CONFIG.gcrLevel === "heavy") gcrIndex = 3;
        else if (CONFIG.gcrLevel === "maximum") gcrIndex = 4;
        gcrDropdown.selection = gcrIndex;

        var tacGroup = optionsPanel.add("group");
        tacGroup.orientation = "row";
        tacGroup.add("statictext", undefined, "Límite Total de Tinta (TAC):");
        var tacInput = tacGroup.add("edittext", undefined, CONFIG.maxTAC.toString());
        tacInput.characters = 5;
        tacGroup.add("statictext", undefined, "% (Típico: 300% - 320%)");

        // Panel de Alcance
        var scopePanel = win.add("panel", undefined, "3. Alcance de Conversión");
        scopePanel.orientation = "column";
        scopePanel.alignChildren = ["left", "top"];
        scopePanel.margins = 12;
        scopePanel.spacing = 6;

        var selCount = (doc.selection && doc.selection.length) ? doc.selection.length : 0;
        var chkSelection = scopePanel.add("checkbox", undefined, "Convertir únicamente la selección actual (" + selCount + " elementos seleccionados)");
        chkSelection.value = (selCount > 0 && CONFIG.processSelectionOnly);
        if (selCount === 0) chkSelection.enabled = false;

        var chkGradients = scopePanel.add("checkbox", undefined, "Convertir paradas de degradados (GradientStops)");
        chkGradients.value = CONFIG.convertGradients;

        var chkText = scopePanel.add("checkbox", undefined, "Convertir tipografías y textos editables");
        chkText.value = CONFIG.convertTextFrames;

        var chkSwatches = scopePanel.add("checkbox", undefined, "Convertir y duplicar muestras RGB del panel Muestras a CMYK");
        chkSwatches.value = CONFIG.convertDocumentSwatches;

        var chkClean = scopePanel.add("checkbox", undefined, "Limpieza de tintas contaminantes (<3% en primarios puros)");
        chkClean.value = CONFIG.cleanTraces;

        var chkBlack = scopePanel.add("checkbox", undefined, "Proteger negro puro (RGB 0,0,0 -> 100% K simple sin descalce)");
        chkBlack.value = CONFIG.preservePureBlack;

        // Botones de Acción
        var btnGroup = win.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignment = ["center", "bottom"];
        btnGroup.spacing = 16;

        var btnCancel = btnGroup.add("button", undefined, "Cancelar", {name: "cancel"});
        var btnExecute = btnGroup.add("button", undefined, "Convertir Colores", {name: "ok"});

        btnExecute.onClick = function() {
            CONFIG.defaultProfile = profileKeys[profileDropdown.selection.index];
            var gcrLevels = ["none", "light", "medium", "heavy", "maximum"];
            CONFIG.gcrLevel = gcrLevels[gcrDropdown.selection.index];
            CONFIG.maxTAC = parseInt(tacInput.text, 10) || 300;
            CONFIG.processSelectionOnly = chkSelection.value;
            CONFIG.convertGradients = chkGradients.value;
            CONFIG.convertTextFrames = chkText.value;
            CONFIG.convertDocumentSwatches = chkSwatches.value;
            CONFIG.cleanTraces = chkClean.value;
            CONFIG.preservePureBlack = chkBlack.value;
            win.close(1);
        };

        btnCancel.onClick = function() {
            win.close(0);
        };

        return win.show();
    }

    // Si modo diálogo está habilitado, mostrar ventana ScriptUI
    ${config.dialogMode ? 'var res = showInterface(); if (res !== 1) return;' : '// Modo directo configurado'}

    // ========================================================================
    // EJECUCIÓN PRINCIPAL
    // ========================================================================
    
    var itemsToProcess = [];
    if (CONFIG.processSelectionOnly && doc.selection && doc.selection.length > 0) {
        itemsToProcess = doc.selection;
    } else {
        itemsToProcess = doc.pageItems;
    }

    // Notificación de inicio de procesado
    for (var i = 0; i < itemsToProcess.length; i++) {
        processPageItem(itemsToProcess[i]);
    }

    if (CONFIG.convertDocumentSwatches) {
        processDocumentSwatches();
    }

    // Refrescar ventana de Illustrator
    app.redraw();

    // Resumen para el usuario
    var msg = "¡Conversión de Color Finalizada con Éxito!\\n\\n" +
              "Perfil ICC aplicado: " + CONFIG.defaultProfile + "\\n" +
              "Trazados procesados: " + stats.pathsProcessed + "\\n" +
              "Textos procesados: " + stats.textFramesProcessed + "\\n" +
              "Degradados procesados: " + stats.gradientsProcessed + "\\n" +
              "Muestras CMYK creadas: " + stats.swatchesCreated + "\\n\\n" +
              "Los colores han sido convertidos con las curvas de separación y límites de tinta seleccionados.";

    alert(msg, "Chromartisan RGB-CMYK", false);
})();
`;
}
