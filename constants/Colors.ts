const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

export const Colors = {
  primary: '#6366f1',
  background: '#f3f4f6',
  white: '#fff',
  text: '#1f2937',
  gray: '#6b7280',
  border: '#e5e7eb',
  error: '#ef4444',
  card: '#f9fafb',
  success: '#10b981',
  warning: '#f59e0b',

  // Light theme
  light: {
    text: '#1f2937',
    background: '#f3f4f6',
    card: '#ffffff',
    border: '#e5e7eb',
    primary: '#6366f1',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },

  // Dark theme
  dark: {
    text: '#ffffff',
    background: '#1a1a1a',
    card: '#2a2a2a',
    border: '#404040',
    primary: '#818cf8',
    tint: tintColorDark,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorDark,
  },
};

export default Colors;
