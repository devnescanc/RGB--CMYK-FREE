/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RGBColor {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
}

export interface CMYKColor {
  c: number; // 0 - 100
  m: number; // 0 - 100
  y: number; // 0 - 100
  k: number; // 0 - 100
}

export interface CIELAB {
  l: number; // 0 - 100
  a: number; // -128 - 127
  b: number; // -128 - 127
}

export interface CIEXYZ {
  x: number;
  y: number;
  z: number;
}

export type RGBProfileType = 'sRGB' | 'AdobeRGB' | 'DisplayP3' | 'AppleRGB';

export type CMYKProfileType = 
  | 'FOGRA39'      // ISO Coated v2 (ECI) - European Standard
  | 'GRACOL2006'   // GRACoL 2006 Coated 1v2 - North America
  | 'SWOP_V2'      // US Web Coated (SWOP) v2
  | 'FOGRA51'      // PSO Coated v3 (Modern OBA European)
  | 'JAPAN_COLOR'  // Japan Color 2001 Coated
  | 'EUROSCALE';   // Euroscale Coated v2

export type RenderingIntent = 
  | 'relative_colorimetric' // Relative with Black Point Compensation
  | 'perceptual'           // Perceptual (Photographic)
  | 'saturation'           // Saturation (Charts/Graphics)
  | 'absolute_colorimetric';// Proofing without paper white adaptation

export type GCRLevel = 'none' | 'light' | 'medium' | 'heavy' | 'maximum';

export interface ICCProfileConfig {
  id: CMYKProfileType;
  name: string;
  region: string;
  description: string;
  defaultTAC: number; // Total Area Coverage (e.g. 300%)
  dotGain: number;    // % gain at 50% screen tint
  blackCurveCoeff: number;
}

export interface ConversionSettings {
  rgbProfile: RGBProfileType;
  cmykProfile: CMYKProfileType;
  renderingIntent: RenderingIntent;
  gcrLevel: GCRLevel;
  totalAreaCoverage: number; // e.g. 300%
  blackPointCompensation: boolean;
  preservePureBlack: boolean;
  cleanPrimaries: boolean; // Cleans unwanted trace contamination (e.g., <2% magenta in clean cyan)
}

export interface ConversionResult {
  sourceRGB: RGBColor;
  sourceHex: string;
  targetCMYK: CMYKColor;
  simulatedRGB: RGBColor;
  simulatedHex: string;
  sourceLab: CIELAB;
  targetLab: CIELAB;
  deltaE00: number; // CIEDE2000
  isOutOfGamut: boolean;
  totalInkCoverage: number; // C+M+Y+K
  richBlackStatus: 'none' | 'optimal' | 'excessive' | 'pure_k';
  warnings: string[];
  safeAlternatives: {
    label: string;
    description: string;
    cmyk: CMYKColor;
    simulatedHex: string;
    deltaE00: number;
  }[];
}

export interface SwatchItem {
  id: string;
  name: string;
  rgb: RGBColor;
  hex: string;
  cmyk?: CMYKColor;
  simulatedHex?: string;
  deltaE00?: number;
  isOutOfGamut?: boolean;
  category?: string;
}

export interface ScriptConfiguration {
  defaultProfile: CMYKProfileType;
  defaultRenderingIntent: RenderingIntent;
  defaultGCR: GCRLevel;
  defaultTAC: number;
  processSelectionOnly: boolean;
  convertGradients: boolean;
  convertTextFrames: boolean;
  convertDocumentSwatches: boolean;
  addConvertedToSwatches: boolean;
  cleanTraces: boolean;
  dialogMode: boolean; // Show ScriptUI modal or execute silently
}
