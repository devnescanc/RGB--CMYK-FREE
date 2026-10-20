/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  RGBColor,
  CMYKColor,
  CIELAB,
  CIEXYZ,
  ConversionSettings,
  ConversionResult,
  ICCProfileConfig,
  CMYKProfileType,
} from '../types/color';

export const ICC_PROFILES: Record<CMYKProfileType, ICCProfileConfig> = {
  FOGRA39: {
    id: 'FOGRA39',
    name: 'ISO Coated v2 300% (ECI) / FOGRA39',
    region: 'Europa / Internacional (Estándar Comercial Offset)',
    description: 'El estándar más utilizado en imprentas comerciales europeas e iberoamericanas sobre papel estucado (coated).',
    defaultTAC: 300,
    dotGain: 14,
    blackCurveCoeff: 1.05,
  },
  GRACOL2006: {
    id: 'GRACOL2006',
    name: 'GRACoL 2006 Coated 1v2 (IDEAlliance G7)',
    region: 'Norteamérica (Estándar G7 Commercial Sheetfed)',
    description: 'Estándar de prensa plana de alta calidad en EE. UU., México y Canadá basado en calibración de curva neutral G7.',
    defaultTAC: 320,
    dotGain: 15,
    blackCurveCoeff: 1.0,
  },
  SWOP_V2: {
    id: 'SWOP_V2',
    name: 'U.S. Web Coated (SWOP) v2',
    region: 'Norteamérica (Rotativa / Revistas / Catálogos)',
    description: 'Perfil para impresión en rotativa sobre papel estucado de menor gramaje. Gama más restringida.',
    defaultTAC: 300,
    dotGain: 18,
    blackCurveCoeff: 0.95,
  },
  FOGRA51: {
    id: 'FOGRA51',
    name: 'PSO Coated v3 / FOGRA51',
    region: 'Europa Moderna (Compensación OBA ISO 12647-2:2013)',
    description: 'Evolución moderna de FOGRA39 para papeles con agentes blanqueadores ópticos (OBA) bajo iluminación D50 estándar.',
    defaultTAC: 300,
    dotGain: 16,
    blackCurveCoeff: 1.08,
  },
  JAPAN_COLOR: {
    id: 'JAPAN_COLOR',
    name: 'Japan Color 2001 Coated',
    region: 'Japón y Asia Oriental',
    description: 'Estándar oficial de artes gráficas en Japón para offset con tintas japonesas estándar (alta saturación en magentas).',
    defaultTAC: 340,
    dotGain: 15,
    blackCurveCoeff: 1.1,
  },
  EUROSCALE: {
    id: 'EUROSCALE',
    name: 'Euroscale Coated v2',
    region: 'Europa Clásica (Legacy)',
    description: 'Perfil histórico para offset europeo tradicional. Utilizado en flujos de trabajo heredados.',
    defaultTAC: 320,
    dotGain: 17,
    blackCurveCoeff: 0.98,
  },
};

export function hexToRgb(hex: string): RGBColor {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  if (isNaN(num) || cleanHex.length !== 6) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(rgb: RGBColor): string {
  const toHex = (c: number) => {
    const clamped = Math.round(Math.max(0, Math.min(255, c)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert sRGB (0-255) to CIE XYZ (D65 standard illuminant)
 */
export function rgbToXyz(rgb: RGBColor, profile: 'sRGB' | 'AdobeRGB' | 'DisplayP3' | 'AppleRGB' = 'sRGB'): CIEXYZ {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  if (profile === 'sRGB') {
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // sRGB matrix to D65 XYZ
    return {
      x: (r * 0.4124564 + g * 0.3575761 + b * 0.1804375) * 100,
      y: (r * 0.2126729 + g * 0.7151522 + b * 0.0721750) * 100,
      z: (r * 0.0193339 + g * 0.1191920 + b * 0.9503041) * 100,
    };
  } else if (profile === 'AdobeRGB') {
    r = Math.pow(r, 2.19921875);
    g = Math.pow(g, 2.19921875);
    b = Math.pow(b, 2.19921875);

    return {
      x: (r * 0.5767309 + g * 0.1855540 + b * 0.1881852) * 100,
      y: (r * 0.2973769 + g * 0.6273491 + b * 0.0752741) * 100,
      z: (r * 0.0270343 + g * 0.0706872 + b * 0.9911085) * 100,
    };
  } else {
    // Default fallback DisplayP3 / AppleRGB to sRGB adaptation
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    return {
      x: (r * 0.4865709 + g * 0.2656676 + b * 0.1982173) * 100,
      y: (r * 0.2289746 + g * 0.6917393 + b * 0.0792861) * 100,
      z: (r * 0.0000000 + g * 0.0451134 + b * 1.0439444) * 100,
    };
  }
}

/**
 * Convert CIE XYZ to CIE L*a*b* (CIE 1976 D65 reference white)
 */
export function xyzToLab(xyz: CIEXYZ): CIELAB {
  // Reference white D65: Xn=95.047, Yn=100.000, Zn=108.883
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const fx = f(xyz.x / xn);
  const fy = f(xyz.y / yn);
  const fz = f(xyz.z / zn);

  function f(t: number): number {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  }

  return {
    l: Math.max(0, Math.min(100, 116 * fy - 16)),
    a: Math.max(-128, Math.min(127, 500 * (fx - fy))),
    b: Math.max(-128, Math.min(127, 200 * (fy - fz))),
  };
}

export function labToXyz(lab: CIELAB): CIEXYZ {
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;

  const fy = (lab.l + 16) / 116;
  const fx = lab.a / 500 + fy;
  const fz = fy - lab.b / 200;

  function invF(t: number): number {
    const t3 = t * t * t;
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  }

  return {
    x: invF(fx) * xn,
    y: invF(fy) * yn,
    z: invF(fz) * zn,
  };
}

export function xyzToRgb(xyz: CIEXYZ): RGBColor {
  const x = xyz.x / 100;
  const y = xyz.y / 100;
  const z = xyz.z / 100;

  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  function compand(c: number): number {
    return c > 0.0031308 ? 1.055 * Math.pow(c, 1 / 2.4) - 0.055 : 12.92 * c;
  }

  return {
    r: Math.round(Math.max(0, Math.min(255, compand(r) * 255))),
    g: Math.round(Math.max(0, Math.min(255, compand(g) * 255))),
    b: Math.round(Math.max(0, Math.min(255, compand(b) * 255))),
  };
}

export function rgbToLab(rgb: RGBColor, profile: 'sRGB' | 'AdobeRGB' | 'DisplayP3' | 'AppleRGB' = 'sRGB'): CIELAB {
  return xyzToLab(rgbToXyz(rgb, profile));
}

/**
 * CIEDE2000 (ΔE 2000) standard color difference calculation
 * Defined by CIE in 2001; industry standard in print (ISO 12647)
 */
export function calculateDeltaE2000(lab1: CIELAB, lab2: CIELAB): number {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  const L1 = lab1.l;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.l;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const Cbar = (C1 + C2) / 2;

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cbar, 7) / (Math.pow(Cbar, 7) + Math.pow(25, 7))));

  const a1Prime = a1 * (1 + G);
  const a2Prime = a2 * (1 + G);

  const C1Prime = Math.sqrt(a1Prime * a1Prime + b1 * b1);
  const C2Prime = Math.sqrt(a2Prime * a2Prime + b2 * b2);

  let h1Prime = Math.atan2(b1, a1Prime) * deg;
  if (h1Prime < 0) h1Prime += 360;

  let h2Prime = Math.atan2(b2, a2Prime) * deg;
  if (h2Prime < 0) h2Prime += 360;

  const deltaLPrime = L2 - L1;
  const deltaCPrime = C2Prime - C1Prime;

  let deltahPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    const diff = h2Prime - h1Prime;
    if (Math.abs(diff) <= 180) {
      deltahPrime = diff;
    } else if (diff > 180) {
      deltahPrime = diff - 360;
    } else {
      deltahPrime = diff + 360;
    }
  }

  const deltaHPrime = 2 * Math.sqrt(C1Prime * C2Prime) * Math.sin((deltahPrime / 2) * rad);

  const LbarPrime = (L1 + L2) / 2;
  const CbarPrime = (C1Prime + C2Prime) / 2;

  let HbarPrime = 0;
  if (C1Prime * C2Prime !== 0) {
    const sum = h1Prime + h2Prime;
    const diff = Math.abs(h1Prime - h2Prime);
    if (diff <= 180) {
      HbarPrime = sum / 2;
    } else if (sum < 360) {
      HbarPrime = (sum + 360) / 2;
    } else {
      HbarPrime = (sum - 360) / 2;
    }
  }

  const T =
    1 -
    0.17 * Math.cos((HbarPrime - 30) * rad) +
    0.24 * Math.cos(2 * HbarPrime * rad) +
    0.32 * Math.cos((3 * HbarPrime + 6) * rad) -
    0.20 * Math.cos((4 * HbarPrime - 63) * rad);

  const deltaTheta = 30 * Math.exp(-Math.pow((HbarPrime - 275) / 25, 2));
  const RC = 2 * Math.sqrt(Math.pow(CbarPrime, 7) / (Math.pow(CbarPrime, 7) + Math.pow(25, 7)));
  const RT = -Math.sin(2 * deltaTheta * rad) * RC;

  const SL = 1 + (0.015 * Math.pow(LbarPrime - 50, 2)) / Math.sqrt(20 + Math.pow(LbarPrime - 50, 2));
  const SC = 1 + 0.045 * CbarPrime;
  const SH = 1 + 0.015 * CbarPrime * T;

  const dE = Math.sqrt(
    Math.pow(deltaLPrime / SL, 2) +
    Math.pow(deltaCPrime / SC, 2) +
    Math.pow(deltaHPrime / SH, 2) +
    RT * (deltaCPrime / SC) * (deltaHPrime / SH)
  );

  return Number(dE.toFixed(2));
}

/**
 * Precise RGB to CMYK engine considering ICC profiles, GCR, TAC, and Rendering Intent
 */
export function convertRGBToCMYK(rgb: RGBColor, settings: ConversionSettings): ConversionResult {
  const profile = ICC_PROFILES[settings.cmykProfile] || ICC_PROFILES.FOGRA39;
  const maxTAC = settings.totalAreaCoverage || profile.defaultTAC;

  // 1. Calculate Source LAB
  const sourceLab = rgbToLab(rgb, settings.rgbProfile);

  // 2. Pure Black Check
  if (settings.preservePureBlack && rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
    const pureBlackCMYK: CMYKColor = { c: 0, m: 0, y: 0, k: 100 };
    const simulatedRGB: RGBColor = { r: 28, g: 28, b: 28 };
    const targetLab = rgbToLab(simulatedRGB, 'sRGB');
    return {
      sourceRGB: rgb,
      sourceHex: rgbToHex(rgb),
      targetCMYK: pureBlackCMYK,
      simulatedRGB,
      simulatedHex: rgbToHex(simulatedRGB),
      sourceLab,
      targetLab,
      deltaE00: calculateDeltaE2000(sourceLab, targetLab),
      isOutOfGamut: false,
      totalInkCoverage: 100,
      richBlackStatus: 'pure_k',
      warnings: ['Color negro puro asignado como 100% K para evitar descalce en textos o líneas finas.'],
      safeAlternatives: [],
    };
  }

  // Pure White Check
  if (rgb.r === 255 && rgb.g === 255 && rgb.b === 255) {
    const whiteCMYK: CMYKColor = { c: 0, m: 0, y: 0, k: 0 };
    return {
      sourceRGB: rgb,
      sourceHex: '#FFFFFF',
      targetCMYK: whiteCMYK,
      simulatedRGB: { r: 255, g: 255, b: 255 },
      simulatedHex: '#FFFFFF',
      sourceLab,
      targetLab: sourceLab,
      deltaE00: 0,
      isOutOfGamut: false,
      totalInkCoverage: 0,
      richBlackStatus: 'none',
      warnings: [],
      safeAlternatives: [],
    };
  }

  // 3. Subtractive Base CMY
  const rNorm = rgb.r / 255;
  const gNorm = rgb.g / 255;
  const bNorm = rgb.b / 255;

  let cRaw = 1 - rNorm;
  let mRaw = 1 - gNorm;
  let yRaw = 1 - bNorm;

  // 4. Gray Component Replacement (GCR)
  let kCoeff = 0.5; // medium default
  switch (settings.gcrLevel) {
    case 'none':
      kCoeff = 0;
      break;
    case 'light':
      kCoeff = 0.35;
      break;
    case 'medium':
      kCoeff = 0.65;
      break;
    case 'heavy':
      kCoeff = 0.85;
      break;
    case 'maximum':
      kCoeff = 1.0;
      break;
  }

  // Apply profile black curve coefficient
  kCoeff *= profile.blackCurveCoeff;

  const minCMY = Math.min(cRaw, mRaw, yRaw);
  let kGen = minCMY * kCoeff;

  // In dark areas, generate rich black if K alone lacks density
  if (minCMY > 0.7 && settings.gcrLevel !== 'maximum') {
    kGen = Math.min(1.0, minCMY * 0.95);
  }

  let c = cRaw;
  let m = mRaw;
  let y = yRaw;

  if (kGen > 0.001) {
    c = Math.max(0, (cRaw - kGen) / (1 - kGen * 0.85));
    m = Math.max(0, (mRaw - kGen) / (1 - kGen * 0.85));
    y = Math.max(0, (yRaw - kGen) / (1 - kGen * 0.85));
  }

  // 5. Profile Gamut Shaping and Non-Linear Ink Absorption / Dot Gain
  // Specific profile color corrections
  if (settings.cmykProfile === 'FOGRA39' || settings.cmykProfile === 'FOGRA51') {
    // European inks: clean cyan, well-balanced magenta
    c = Math.pow(c, 0.96) * 1.02;
    m = Math.pow(m, 0.98) * 1.01;
    y = Math.pow(y, 0.99);
  } else if (settings.cmykProfile === 'GRACOL2006') {
    // GRACoL G7 curve: neutral gray balance
    c = Math.pow(c, 0.95) * 1.03;
    m = Math.pow(m, 0.97) * 1.00;
  } else if (settings.cmykProfile === 'SWOP_V2') {
    // SWOP: restricted gamut in deep blues and intense greens
    c = Math.pow(c, 0.92) * 0.98;
    m = Math.pow(m, 0.94) * 0.97;
    y = Math.pow(y, 0.96);
  } else if (settings.cmykProfile === 'JAPAN_COLOR') {
    // Japan Color: more vibrant magentas and cyans
    m = Math.pow(m, 0.95) * 1.04;
    c = Math.pow(c, 0.94) * 1.02;
  }

  // 6. Rendering Intent Shaping
  if (settings.renderingIntent === 'perceptual') {
    // Compress highlights and shadows smoothly
    c = c > 0.5 ? 0.5 + (c - 0.5) * 0.92 : c * 0.98;
    m = m > 0.5 ? 0.5 + (m - 0.5) * 0.92 : m * 0.98;
    y = y > 0.5 ? 0.5 + (y - 0.5) * 0.92 : y * 0.98;
  } else if (settings.renderingIntent === 'saturation') {
    // Boost dominant primaries for vector charts
    const maxVal = Math.max(c, m, y);
    if (c === maxVal) c = Math.min(1.0, c * 1.08);
    if (m === maxVal) m = Math.min(1.0, m * 1.08);
    if (y === maxVal) y = Math.min(1.0, y * 1.08);
  }

  // 7. Clean Primaries (Removes muddy contamination <2.5% in clean hues)
  if (settings.cleanPrimaries) {
    if (c > 0.6 && y > 0.6 && m < 0.06) m = 0; // Clean lime green
    if (c > 0.7 && m < 0.05 && y < 0.05) { m = 0; y = 0; } // Clean process cyan
    if (m > 0.7 && c < 0.05 && y < 0.05) { c = 0; y = 0; } // Clean process magenta
    if (y > 0.6 && c < 0.04 && m < 0.04) { c = 0; m = 0; } // Clean yellow
  }

  // Percentages (0 - 100)
  let cPct = Math.min(100, Math.max(0, Math.round(c * 100)));
  let mPct = Math.min(100, Math.max(0, Math.round(m * 100)));
  let yPct = Math.min(100, Math.max(0, Math.round(y * 100)));
  let kPct = Math.min(100, Math.max(0, Math.round(kGen * 100)));

  // 8. Total Area Coverage (TAC) Enforcement
  let currentTAC = cPct + mPct + yPct + kPct;
  if (currentTAC > maxTAC) {
    const excess = currentTAC - maxTAC;
    const cmyTotal = cPct + mPct + yPct;
    if (cmyTotal > 0) {
      const scale = (cmyTotal - excess) / cmyTotal;
      cPct = Math.max(0, Math.round(cPct * scale));
      mPct = Math.max(0, Math.round(mPct * scale));
      yPct = Math.max(0, Math.round(yPct * scale));
    }
    currentTAC = cPct + mPct + yPct + kPct;
  }

  const targetCMYK: CMYKColor = { c: cPct, m: mPct, y: yPct, k: kPct };

  // 9. Simulate the printed result back to screen RGB
  const simulatedRGB = cmykToSimulatedRGB(targetCMYK, profile);
  const targetLab = rgbToLab(simulatedRGB, 'sRGB');
  const deltaE00 = calculateDeltaE2000(sourceLab, targetLab);

  // 10. Gamut and Warning Diagnostics
  const warnings: string[] = [];
  const isOutOfGamut = deltaE00 >= 3.2;

  if (isOutOfGamut) {
    warnings.push(`Fuera de gama (Out of Gamut): Desviación cromática ΔE 2000 de ${deltaE00}. Las tintas físicas CMYK no alcanzan la saturación pura del monitor.`);
  }

  let richBlackStatus: 'none' | 'optimal' | 'excessive' | 'pure_k' = 'none';
  if (kPct >= 70) {
    if (cPct === 0 && mPct === 0 && yPct === 0) {
      richBlackStatus = 'pure_k';
      warnings.push('Negro 100% K simple. Para grandes masas de fondo se recomienda Negro Enriquecido (p. ej. C:60 M:40 Y:40 K:100).');
    } else if (currentTAC > maxTAC) {
      richBlackStatus = 'excessive';
      warnings.push(`Límite de tinta excedido (${currentTAC}% > ${maxTAC}% máx). Peligro de repinte y secado lento.`);
    } else {
      richBlackStatus = 'optimal';
    }
  }

  // 11. Generate Safe Alternatives if Out of Gamut
  const safeAlternatives = generateSafeAlternatives(rgb, targetCMYK, sourceLab, profile);

  return {
    sourceRGB: rgb,
    sourceHex: rgbToHex(rgb),
    targetCMYK,
    simulatedRGB,
    simulatedHex: rgbToHex(simulatedRGB),
    sourceLab,
    targetLab,
    deltaE00,
    isOutOfGamut,
    totalInkCoverage: currentTAC,
    richBlackStatus,
    warnings,
    safeAlternatives,
  };
}

/**
 * Simulates how CMYK physical ink absorption and dot gain render onto screen RGB
 */
export function cmykToSimulatedRGB(cmyk: CMYKColor, profile?: ICCProfileConfig): RGBColor {
  const c = cmyk.c / 100;
  const m = cmyk.m / 100;
  const y = cmyk.y / 100;
  const k = cmyk.k / 100;

  // Mechanical ink overlap model (Neugebauer approximation)
  // Process inks are transparent filters sitting on paper white
  const paperBrightness = 0.96; // Real paper is slightly off-white (ISO brightness ~96%)
  const inkGain = profile ? 1 + (profile.dotGain - 14) * 0.005 : 1.0;

  // Absorption factors
  const rEff = (1 - Math.min(1, c * 1.02 * inkGain)) * (1 - k * 0.98) * paperBrightness;
  const gEff = (1 - Math.min(1, m * 1.04 * inkGain)) * (1 - k * 0.98) * paperBrightness;
  const bEff = (1 - Math.min(1, y * 0.98 * inkGain)) * (1 - k * 0.98) * paperBrightness;

  return {
    r: Math.round(Math.max(0, Math.min(255, rEff * 255))),
    g: Math.round(Math.max(0, Math.min(255, gEff * 255))),
    b: Math.round(Math.max(0, Math.min(255, bEff * 255))),
  };
}

/**
 * Suggests 3 print-safe alternatives when an RGB color suffers significant gamut loss
 */
function generateSafeAlternatives(
  sourceRgb: RGBColor,
  baseCmyk: CMYKColor,
  sourceLab: CIELAB,
  profile: ICCProfileConfig
) {
  const alternatives = [];

  // Alt 1: Máxima Pureza de Tintas (Clean formulation)
  // Removes parasitic 3rd or 4th ink to prevent dirty visual perception
  const cleanCmyk: CMYKColor = { ...baseCmyk };
  const channels = [
    { key: 'c' as const, val: cleanCmyk.c },
    { key: 'm' as const, val: cleanCmyk.m },
    { key: 'y' as const, val: cleanCmyk.y },
  ];
  channels.sort((a, b) => b.val - a.val);

  // If the lowest CMY is under 15%, zero it out for crisp printing
  if (channels[2].val < 18 && channels[0].val > 40) {
    cleanCmyk[channels[2].key] = 0;
  }
  const cleanSimRgb = cmykToSimulatedRGB(cleanCmyk, profile);
  const cleanLab = rgbToLab(cleanSimRgb, 'sRGB');
  alternatives.push({
    label: 'Fórmula Limpia (2-3 Tintas)',
    description: 'Elimina tintas contaminantes secundarias para evitar tono sucio o agrisado en prensa.',
    cmyk: cleanCmyk,
    simulatedHex: rgbToHex(cleanSimRgb),
    deltaE00: calculateDeltaE2000(sourceLab, cleanLab),
  });

  // Alt 2: Alta Luminancia / Saturation Boost
  // Pushes primary channels by +10% within safe boundary
  const boostCmyk: CMYKColor = {
    c: Math.min(100, Math.round(baseCmyk.c * (baseCmyk.c > 30 ? 1.08 : 0.9))),
    m: Math.min(100, Math.round(baseCmyk.m * (baseCmyk.m > 30 ? 1.08 : 0.9))),
    y: Math.min(100, Math.round(baseCmyk.y * (baseCmyk.y > 30 ? 1.08 : 0.9))),
    k: Math.max(0, Math.round(baseCmyk.k * 0.8)),
  };
  const boostSimRgb = cmykToSimulatedRGB(boostCmyk, profile);
  const boostLab = rgbToLab(boostSimRgb, 'sRGB');
  alternatives.push({
    label: 'Énfasis de Intensidad Cromática',
    description: 'Aumenta la fuerza de la tinta principal y reduce el negro K para maximizar el brillo visual.',
    cmyk: boostCmyk,
    simulatedHex: rgbToHex(boostSimRgb),
    deltaE00: calculateDeltaE2000(sourceLab, boostLab),
  });

  // Alt 3: Compensación Neutral G7
  // Optimized for balanced tonal contrast
  const neutralCmyk: CMYKColor = {
    c: Math.min(100, Math.round(baseCmyk.c * 0.95)),
    m: Math.min(100, Math.round(baseCmyk.m * 0.95)),
    y: Math.min(100, Math.round(baseCmyk.y * 0.95)),
    k: Math.min(100, Math.round(baseCmyk.k + 5)),
  };
  const neutralSimRgb = cmykToSimulatedRGB(neutralCmyk, profile);
  const neutralLab = rgbToLab(neutralSimRgb, 'sRGB');
  alternatives.push({
    label: 'Equilibrio Neutral G7',
    description: 'Ajuste suave que minimiza variaciones de tono en tiradas largas de offset.',
    cmyk: neutralCmyk,
    simulatedHex: rgbToHex(neutralSimRgb),
    deltaE00: calculateDeltaE2000(sourceLab, neutralLab),
  });

  return alternatives;
}
