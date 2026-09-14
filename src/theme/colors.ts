/**
 * Centralized Design System Color Tokens for Mon Assist'Gestion (DRYOS)
 * 
 * Strict Brand Palette:
 * - Navy (#00434A) & Emerald (#10B981)
 * - Cream (#FBF7EE) for background warm neutral
 * 
 * Strict Status Tokens (Only 3 allowed outside brand):
 * - Ok (Green #16A34A)
 * - Warning (Orange #F59E0B)
 * - Urgent (Red #DC2626)
 */

export const BRAND_COLORS = {
  navy: {
    hex: '#00434A',
    rgb: [0, 67, 74] as const,
    dark: '#00343A',
    darkRgb: [0, 52, 58] as const,
    light: '#F0F7F7',
    lightRgb: [240, 247, 247] as const,
  },
  emerald: {
    hex: '#10B981',
    rgb: [16, 185, 129] as const,
    light: '#34D399',
    lightRgb: [52, 211, 153] as const,
  },
  cream: {
    hex: '#FBF7EE',
    rgb: [251, 247, 238] as const,
  },
};

export const STATUS_COLORS = {
  ok: {
    hex: '#16A34A',
    rgb: [22, 163, 74] as const,
    bg: '#F0FDF4',
    bgRgb: [240, 253, 244] as const,
    border: '#BBF7D0',
    text: '#15803D',
  },
  warning: {
    hex: '#F59E0B',
    rgb: [245, 158, 11] as const,
    bg: '#FFFBEB',
    bgRgb: [255, 251, 235] as const,
    border: '#FDE68A',
    text: '#B45309',
  },
  urgent: {
    hex: '#DC2626',
    rgb: [220, 38, 38] as const,
    bg: '#FEF2F2',
    bgRgb: [254, 242, 242] as const,
    border: '#FECACA',
    text: '#B91C1C',
    textRgb: [185, 28, 28] as const,
  },
};
