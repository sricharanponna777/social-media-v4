const lightColors = {
  // Base colors
  background: '#F4F7F3',
  foreground: '#15221D',

  // Card colors
  card: '#FFFFFF',
  cardForeground: '#15221D',

  // Popover colors
  popover: '#FFFFFF',
  popoverForeground: '#15221D',

  // Primary colors
  primary: '#0F9D76',
  primaryForeground: '#F5FFFB',

  // Secondary colors
  secondary: '#E8F1EC',
  secondaryForeground: '#173027',

  // Muted colors
  muted: '#ECF2EE',
  mutedForeground: '#5C746B',

  // Accent colors
  accent: '#D9F1E7',
  accentForeground: '#173027',

  // Destructive colors
  destructive: '#D94E45',
  destructiveForeground: '#FFFFFF',

  // Border and input
  border: '#D3DFD8',
  input: '#FFFFFF',
  ring: '#0F9D76',

  // Text colors
  text: '#15221D',
  textMuted: '#5C746B',

  // Legacy support for existing components
  tint: '#0F9D76',
  icon: '#5C746B',
  tabIconDefault: '#6B857B',
  tabIconSelected: '#0F9D76',

  // Default buttons, links, Send button, selected tabs
  blue: '#1E88E5',

  // Success states, FaceTime buttons, completed tasks
  green: '#0F9D76',

  // Delete buttons, error states, critical alerts
  red: '#D94E45',

  // VoiceOver highlights, warning states
  orange: '#F59E0B',

  // Notes app accent, Reminders highlights
  yellow: '#EAB308',

  // Pink accent color for various UI elements
  pink: '#EC4899',

  // Purple accent for creative apps and features
  purple: '#7C5CFA',

  // Teal accent for communication features
  teal: '#14B8A6',

  // Indigo accent for system features
  indigo: '#4F46E5',
};

const darkColors = {
  // Base colors
  background: '#0D1512',
  foreground: '#EAF3EE',

  // Card colors
  card: '#15201C',
  cardForeground: '#EAF3EE',

  // Popover colors
  popover: '#15201C',
  popoverForeground: '#EAF3EE',

  // Primary colors
  primary: '#3FD0A5',
  primaryForeground: '#0C1713',

  // Secondary colors
  secondary: '#22312B',
  secondaryForeground: '#D9EAE2',

  // Muted colors
  muted: '#203029',
  mutedForeground: '#9BB8AD',

  // Accent colors
  accent: '#294137',
  accentForeground: '#EAF3EE',

  // Destructive colors
  destructive: '#F16D63',
  destructiveForeground: '#1B0908',

  // Border and input
  border: '#32443D',
  input: '#1D2A24',
  ring: '#3FD0A5',

  // Text colors
  text: '#EAF3EE',
  textMuted: '#9BB8AD',

  // Legacy support for existing components
  tint: '#3FD0A5',
  icon: '#9BB8AD',
  tabIconDefault: '#89A99D',
  tabIconSelected: '#3FD0A5',

  // Default buttons, links, Send button, selected tabs
  blue: '#57A7FF',

  // Success states, FaceTime buttons, completed tasks
  green: '#3FD0A5',

  // Delete buttons, error states, critical alerts
  red: '#F16D63',

  // VoiceOver highlights, warning states
  orange: '#F6B34C',

  // Notes app accent, Reminders highlights
  yellow: '#F2CC5D',

  // Pink accent color for various UI elements
  pink: '#F47CB9',

  // Purple accent for creative apps and features
  purple: '#A58BFF',

  // Teal accent for communication features
  teal: '#41D3C5',

  // Indigo accent for system features
  indigo: '#7A88FF',
};

export const Colors = {
  light: lightColors,
  dark: darkColors,
};

// Export individual color schemes for easier access
export { darkColors, lightColors };

// Utility type for color keys
export type ColorKeys = keyof typeof lightColors;
