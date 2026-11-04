import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

import { Radius, Shadow } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type CardProps = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export function Card({ children, style }: CardProps) {
  const theme = useTheme()

  return (
    <View
      style={[
        Shadow.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          borderRadius: Radius.card,
          borderWidth: 1,
        },
        style,
      ]}>
      {children}
    </View>
  )
}
