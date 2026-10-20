/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SwatchItem } from '../types/color';
import { hexToRgb } from '../utils/colorScience';

export interface PresetPaletteGroup {
  id: string;
  name: string;
  description: string;
  swatches: SwatchItem[];
}

export const PRESET_PALETTES: PresetPaletteGroup[] = [
  {
    id: 'digital_neon',
    name: 'Gama Alta Saturación (RGB Web a Prensa)',
    description: 'Colores de diseño web y pantallas con alta saturación que suelen sufrir pérdida de gama al entrar a CMYK.',
    swatches: [
      { id: 'dn-1', name: 'Cyan Eléctrico Web', hex: '#00F0FF', rgb: hexToRgb('#00F0FF'), category: 'Primarios' },
      { id: 'dn-2', name: 'Magenta Neón', hex: '#FF007F', rgb: hexToRgb('#FF007F'), category: 'Primarios' },
      { id: 'dn-3', name: 'Verde Lima Flúor', hex: '#39FF14', rgb: hexToRgb('#39FF14'), category: 'Acentos' },
      { id: 'dn-4', name: 'Violeta Ultravioleta', hex: '#7928CA', rgb: hexToRgb('#7928CA'), category: 'Secundarios' },
      { id: 'dn-5', name: 'Ámbar Resplandor', hex: '#FF9900', rgb: hexToRgb('#FF9900'), category: 'Cálidos' },
    ],
  },
  {
    id: 'luxury_packaging',
    name: 'Packaging de Lujo & Identidad Corporativa',
    description: 'Paleta balanceada para empaques cosméticos, perfumería y marcas premium con altos requisitos de fidelidad cromática.',
    swatches: [
      { id: 'lp-1', name: 'Azul Marino Real', hex: '#0A2540', rgb: hexToRgb('#0A2540'), category: 'Estructural' },
      { id: 'lp-2', name: 'Esmeralda Forestal', hex: '#0D5C3A', rgb: hexToRgb('#0D5C3A'), category: 'Marca' },
      { id: 'lp-3', name: 'Oro Champán Satinado', hex: '#D4AF37', rgb: hexToRgb('#D4AF37'), category: 'Acento' },
      { id: 'lp-4', name: 'Borgoña Intenso', hex: '#6B1D2F', rgb: hexToRgb('#6B1D2F'), category: 'Acento' },
      { id: 'lp-5', name: 'Negro Profundo Carbono', hex: '#111317', rgb: hexToRgb('#111317'), category: 'Estructural' },
    ],
  },
  {
    id: 'fintech_saas',
    name: 'Identidad Digital SaaS & Fintech',
    description: 'Colores corporativos digitales comúnmente especificados en sRGB en Figma que deben imprimirse en papelería y ferias.',
    swatches: [
      { id: 'fs-1', name: 'Azul Primario Stripe', hex: '#635BFF', rgb: hexToRgb('#635BFF'), category: 'Primario' },
      { id: 'fs-2', name: 'Teal Esmeralda Digital', hex: '#00D4B2', rgb: hexToRgb('#00D4B2'), category: 'Secundario' },
      { id: 'fs-3', name: 'Coral Alerta Positiva', hex: '#FF5C5C', rgb: hexToRgb('#FF5C5C'), category: 'Semántica' },
      { id: 'fs-4', name: 'Índigo Crepúsculo', hex: '#1E1B4B', rgb: hexToRgb('#1E1B4B'), category: 'Fondos' },
      { id: 'fs-5', name: 'Gris Neutro Frío', hex: '#64748B', rgb: hexToRgb('#64748B'), category: 'Neutros' },
    ],
  },
];
