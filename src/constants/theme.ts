/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import { Platform } from 'react-native'

export const Colors = {
  light: {
    text: '#1C1B22',
    background: '#ffffff',
    backgroundElement: '#F3F4F6',
    backgroundSelected: '#E4E6EA',
    textSecondary: '#5C6070',
    primary: '#107968',
    onPrimary: '#ffffff',
    secondary: '#3F3A64',
    accent: '#FFCB3F',
    danger: '#C53434',
  },
  dark: {
    text: '#ffffff',
    background: '#121318',
    backgroundElement: '#21232A',
    backgroundSelected: '#2E3138',
    textSecondary: '#B0B4BA',
    primary: '#20AD96',
    onPrimary: '#101B19',
    secondary: '#C7C3E0',
    accent: '#FFCB3F',
    danger: '#FF8A80',
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

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0
export const MaxContentWidth = 800
