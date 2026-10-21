import type { ReactNode } from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { SafeAreaView, type Edge } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/use-theme'

type ScreenProps = ViewProps & {
  children: ReactNode
  edges?: Edge[]
}

export function Screen({ children, edges, style, ...rest }: ScreenProps) {
  const theme = useTheme()

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={[styles.content, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
})
