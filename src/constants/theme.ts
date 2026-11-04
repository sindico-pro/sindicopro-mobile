import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#2E2C2C',
    background: '#F7F9FA',
    surface: '#FFFFFF',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E7EAEE',
    border: '#E4E7EC',
    textSecondary: '#5C6070',
    primary: '#20AD96',
    primaryMuted: '#E5F6F3',
    primaryText: '#1C9B87',
    onPrimary: '#FFFFFF',
    secondary: '#3F3A64',
    onSecondary: '#FFFFFF',
    accent: '#FFCB3F',
    danger: '#EF4444',
    warning: '#FBBF24',
    success: '#1C9B87',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121318',
    surface: '#1C1E26',
    backgroundElement: '#21232A',
    backgroundSelected: '#2E3138',
    border: '#2E3138',
    textSecondary: '#B0B4BA',
    primary: '#20AD96',
    primaryMuted: '#16332E',
    primaryText: '#8FD6CA',
    onPrimary: '#101B19',
    secondary: '#C7C3E0',
    onSecondary: '#1C1A2E',
    accent: '#FFCB3F',
    danger: '#FF8A80',
    warning: '#FBBF24',
    success: '#8FD6CA',
  },
} as const

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark

export const Fonts = {
  sans: 'MavenPro_400Regular',
  medium: 'MavenPro_500Medium',
  semibold: 'MavenPro_600SemiBold',
  bold: 'MavenPro_700Bold',
  mono: Platform.select({
    ios: 'ui-monospace',
    default: 'monospace',
  }),
} as const

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const

export const Radius = {
  control: 12,
  card: 16,
  sheet: 24,
  pill: 999,
} as const

export const Shadow = {
  card: {
    shadowColor: '#0D5B61',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
} as const

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800
