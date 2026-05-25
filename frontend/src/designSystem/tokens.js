/**
 * Design System Tokens
 * Centralized export of all design tokens for programmatic access
 */

export const SPACING = {
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
  '4xl': '56px',
  '5xl': '64px',
};

export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  'sm-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 1px 3px rgba(0, 0, 0, 0.3)',
  'md-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 4px 6px rgba(0, 0, 0, 0.4)',
  'lg-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 10px 15px rgba(0, 0, 0, 0.5)',
  'xl-dark': 'inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 20px 25px rgba(0, 0, 0, 0.6)',
};

export const ANIMATIONS = {
  fast: 150,    // ms
  normal: 300,  // ms
  slow: 500,    // ms
};

export const BUTTON_SIZES = {
  sm: { px: '12px', py: '8px', fontSize: '12px' },
  md: { px: '16px', py: '10px', fontSize: '14px' },
  lg: { px: '20px', py: '12px', fontSize: '16px' },
};

export const BORDER_RADIUS = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
};

export const COLORS = {
  primary: {
    50: '#F4F6F8',
    100: '#E9EEF2',
    200: '#C8D4E1',
    300: '#A6BACF',
    400: '#6487A9',
    500: '#1D3557',
    600: '#1A304E',
    700: '#112034',
    800: '#0D1827',
    900: '#09101A',
  },
  accent: {
    50: '#FDF7F7',
    100: '#FBE8E9',
    200: '#F5C6C9',
    300: '#EFA4A8',
    400: '#E36067',
    500: '#FF2A00',
    600: '#CF333F',
    700: '#8A222A',
    800: '#671A20',
    900: '#451115',
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#FF2A00',
    info: '#3B82F6',
  },
};

export const ROLE_COLORS = {
  supreme: {
    bg: 'var(--color-error)',
    text: '#FEA3AA',
    border: 'rgba(230, 57, 70, 0.3)',
    light: { bg: '#FFF7ED', text: '#FF2A00' },
    dark: { bg: '#451115', text: '#FEA3AA' },
  },
  super_admin: {
    bg: 'var(--color-error)',
    text: '#FEA3AA',
    border: 'rgba(230, 57, 70, 0.3)',
    light: { bg: '#FFF7ED', text: '#FF2A00' },
    dark: { bg: '#451115', text: '#FEA3AA' },
  },
  coordinator: {
    bg: '#1D3557',
    text: '#A6BACF',
    border: 'rgba(29, 53, 87, 0.3)',
    light: { bg: '#F4F6F8', text: '#1D3557' },
    dark: { bg: '#0D1827', text: '#A6BACF' },
  },
  hod: {
    bg: '#457B9D',
    text: '#A8D8EA',
    border: 'rgba(69, 123, 157, 0.3)',
    light: { bg: '#E8F0F7', text: '#457B9D' },
    dark: { bg: '#1A3F5C', text: '#A8D8EA' },
  },
  student: {
    bg: '#10B981',
    text: '#D1F2EB',
    border: 'rgba(16, 185, 129, 0.3)',
    light: { bg: '#F0FDF4', text: '#10B981' },
    dark: { bg: '#064E3B', text: '#D1F2EB' },
  },
  faculty: {
    bg: '#8B5CF6',
    text: '#E9D5FF',
    border: 'rgba(139, 92, 246, 0.3)',
    light: { bg: '#FAF5FF', text: '#8B5CF6' },
    dark: { bg: '#3F0F64', text: '#E9D5FF' },
  },
  trainer: {
    bg: '#06B6D4',
    text: '#CFFAFE',
    border: 'rgba(6, 182, 212, 0.3)',
    light: { bg: '#ECF8FA', text: '#06B6D4' },
    dark: { bg: '#082F36', text: '#CFFAFE' },
  },
};

export const FOCUS_RING = {
  light: {
    color: '#1D3557',
    opacity: 0.1,
  },
  dark: {
    color: '#A6BACF',
    opacity: 0.2,
  },
};

export const TRANSITIONS = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  normal: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
};

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const TYPOGRAPHY = {
  fontFamilies: {
    primary: "'Poppins', system-ui, -apple-system, sans-serif",
    secondary: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 800,
  },
  sizes: {
    xs: { fontSize: '12px', lineHeight: '16px' },
    sm: { fontSize: '14px', lineHeight: '20px' },
    base: { fontSize: '16px', lineHeight: '24px' },
    lg: { fontSize: '18px', lineHeight: '28px' },
    xl: { fontSize: '20px', lineHeight: '28px' },
    '2xl': { fontSize: '24px', lineHeight: '32px' },
    '3xl': { fontSize: '32px', lineHeight: '40px' },
    '4xl': { fontSize: '40px', lineHeight: '48px' },
  },
};

export const OPACITY = {
  disabled: 0.5,
  muted: 0.65,
  hover: 0.8,
};

export const COMPONENT_DEFAULTS = {
  button: {
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false,
  },
  card: {
    variant: 'elevated',
    padding: 'md',
  },
  input: {
    size: 'md',
    variant: 'default',
    disabled: false,
  },
  badge: {
    variant: 'primary',
    size: 'md',
  },
  modal: {
    size: 'md',
    centered: true,
  },
};

export default {
  SPACING,
  SHADOWS,
  ANIMATIONS,
  BUTTON_SIZES,
  BORDER_RADIUS,
  COLORS,
  ROLE_COLORS,
  FOCUS_RING,
  TRANSITIONS,
  BREAKPOINTS,
  TYPOGRAPHY,
  OPACITY,
  COMPONENT_DEFAULTS,
};
