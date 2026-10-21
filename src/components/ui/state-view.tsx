import { ActivityIndicator, StyleSheet, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { ThemedText } from '@/components/themed-text'
import { Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

type StateViewProps = {
  loading?: boolean
  error?: string | null
  empty?: string | null
  onRetry?: () => void
}

export function StateView({ loading = false, error, empty, onRetry }: StateViewProps) {
  const theme = useTheme()

  if (loading) {
    return (
      <View style={styles.box} accessibilityRole="progressbar">
        <ActivityIndicator color={theme.primary} />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.box}>
        <ThemedText accessibilityLiveRegion="polite" style={styles.message} themeColor="danger">
          {error}
        </ThemedText>
        {onRetry ? <Button label="Tentar novamente" onPress={onRetry} variant="ghost" /> : null}
      </View>
    )
  }

  if (empty) {
    return (
      <View style={styles.box}>
        <ThemedText style={styles.message} themeColor="textSecondary">
          {empty}
        </ThemedText>
      </View>
    )
  }

  return null
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    gap: Spacing.three,
    justifyContent: 'center',
    padding: Spacing.four,
  },
  message: {
    textAlign: 'center',
  },
})
