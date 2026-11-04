import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Fonts } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type AvatarProps = {
  name: string
  size?: number
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const theme = useTheme()
  const letter = name.trim().charAt(0).toLocaleUpperCase('pt-BR') || '?'

  return (
    <View
      style={[
        styles.circle,
        {
          backgroundColor: `${theme.primary}22`,
          height: size,
          width: size,
          borderRadius: size / 2,
        },
      ]}>
      <ThemedText style={[styles.letter, { color: theme.primaryText, fontSize: size * 0.4 }]}>
        {letter}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    fontFamily: Fonts.bold,
  },
})
