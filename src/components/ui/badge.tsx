import { StyleSheet, View } from 'react-native'

import { ThemedText } from '@/components/themed-text'
import { Radius, Spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'

export type BadgeTone = 'success' | 'danger' | 'warning' | 'neutral'

type BadgeProps = {
  label: string
  tone?: BadgeTone
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const theme = useTheme()
  const color =
    tone === 'success' ? theme.success : tone === 'danger' ? theme.danger : tone === 'warning' ? theme.warning : theme.textSecondary

  return (
    <View style={[styles.badge, { backgroundColor: `${color}22` }]}>
      <ThemedText style={{ color }} type="smallBold">
        {label}
      </ThemedText>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
  },
})
